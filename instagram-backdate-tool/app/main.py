"""FastAPI application: OAuth, scheduling API, and the web UI."""
from __future__ import annotations

import secrets
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from . import meta_client
from .config import get_settings
from .db import Account, ScheduledPost, get_db, init_db
from .schemas import AccountOut, PostCreate, PostOut
from .worker import process_due_posts

settings = get_settings()
STATIC_DIR = Path(__file__).parent / "static"

scheduler = BackgroundScheduler(timezone="UTC")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    scheduler.add_job(process_due_posts, "interval", seconds=30, id="drain_queue", max_instances=1)
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Meta Backdate Publisher", lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")


@app.get("/auth/login")
def auth_login(request: Request) -> RedirectResponse:
    if not settings.meta_app_id or not settings.meta_app_secret:
        raise HTTPException(500, "META_APP_ID / META_APP_SECRET are not configured")
    state = secrets.token_urlsafe(16)
    request.session["oauth_state"] = state
    return RedirectResponse(meta_client.login_url(state))


@app.get("/auth/callback")
def auth_callback(request: Request, db: Session = Depends(get_db)) -> RedirectResponse:
    params = request.query_params
    if err := params.get("error"):
        raise HTTPException(400, f"OAuth error: {params.get('error_description', err)}")
    if params.get("state") != request.session.get("oauth_state"):
        raise HTTPException(400, "Invalid OAuth state")
    code = params.get("code")
    if not code:
        raise HTTPException(400, "Missing authorization code")

    with httpx.Client(timeout=60) as client:
        short_token = meta_client.exchange_code_for_token(client, code)
        long_token, _ = meta_client.get_long_lived_token(client, short_token)
        pages = meta_client.list_pages_with_instagram(client, long_token)

    for p in pages:
        account = db.scalar(select(Account).where(Account.page_id == p["page_id"]))
        if account is None:
            account = Account(page_id=p["page_id"])
            db.add(account)
        account.page_name = p["page_name"]
        account.page_access_token = p["page_access_token"]
        account.ig_user_id = p["ig_user_id"]
        account.ig_username = p["ig_username"]
    db.commit()
    return RedirectResponse("/")


@app.get("/api/accounts", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db)) -> list[Account]:
    return list(db.scalars(select(Account).order_by(Account.page_name)).all())


@app.get("/api/posts", response_model=list[PostOut])
def list_posts(db: Session = Depends(get_db)) -> list[ScheduledPost]:
    return list(db.scalars(select(ScheduledPost).order_by(ScheduledPost.created_at.desc())).all())


@app.post("/api/posts", response_model=PostOut, status_code=201)
def create_post(payload: PostCreate, db: Session = Depends(get_db)) -> ScheduledPost:
    try:
        payload.validate_window()
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    account = db.get(Account, payload.account_id)
    if account is None:
        raise HTTPException(404, "Account not found")
    if payload.target == "instagram" and not account.ig_user_id:
        raise HTTPException(422, "Selected account has no linked Instagram Business user")

    post = ScheduledPost(
        account_id=account.id,
        target=payload.target,
        image_url=payload.image_url,
        caption=payload.caption,
        backdated_time=payload.backdated_time,
        granularity=payload.granularity,
        scheduled_for=payload.resolved_scheduled_for(),
        status="pending",
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.post("/api/run", response_model=dict)
def run_now() -> dict:
    """Manually drain the queue (useful for testing / immediate publish)."""
    return {"processed": process_due_posts()}
