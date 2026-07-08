"""Background worker that drains the scheduled-post queue."""
from __future__ import annotations

import datetime as dt
import logging

import httpx
from sqlalchemy import select

from . import meta_client
from .db import ScheduledPost, SessionLocal

log = logging.getLogger("backdate.worker")


def _process_one(client: httpx.Client, post: ScheduledPost) -> None:
    account = post.account
    if post.target == "facebook":
        result = meta_client.post_facebook_backdated(
            client,
            page_id=account.page_id,
            page_token=account.page_access_token,
            image_url=post.image_url,
            caption=post.caption,
            backdated_time=post.backdated_time,
            granularity=post.granularity,
        )
    elif post.target == "instagram":
        if not account.ig_user_id:
            raise meta_client.MetaError("This account has no linked Instagram Business user")
        result = meta_client.publish_instagram(
            client,
            ig_user_id=account.ig_user_id,
            token=account.page_access_token,
            image_url=post.image_url,
            caption=post.caption,
            experimental_time=post.backdated_time,
        )
    else:  # pragma: no cover - guarded by schema validation
        raise meta_client.MetaError(f"Unknown target {post.target!r}")

    post.result_id = result.get("result_id")
    post.published_timestamp = result.get("published_timestamp")
    post.backdate_applied = result.get("backdate_applied")
    post.status = "published"
    post.error = None


def process_due_posts() -> int:
    """Publish every pending post whose scheduled time has arrived.

    Returns the number of posts processed.
    """
    now = dt.datetime.now(dt.timezone.utc)
    processed = 0
    with SessionLocal() as db:
        due = db.scalars(
            select(ScheduledPost)
            .where(ScheduledPost.status == "pending", ScheduledPost.scheduled_for <= now)
            .order_by(ScheduledPost.scheduled_for)
        ).all()

        if not due:
            return 0

        with httpx.Client(timeout=60) as client:
            for post in due:
                post.status = "processing"
                db.commit()
                try:
                    _process_one(client, post)
                except Exception as exc:  # noqa: BLE001 - surface any failure to the user
                    post.status = "failed"
                    post.error = str(exc)
                    log.warning("Post %s failed: %s", post.id, exc)
                finally:
                    db.commit()
                    processed += 1
    return processed
