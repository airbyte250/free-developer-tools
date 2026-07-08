# Meta Backdate Publisher

A small FastAPI app for publishing photo posts to **Facebook Pages** and
**Instagram Business/Creator** accounts via the Meta Graph API, with support for
setting a **backdated timestamp**.

## Important: what actually works

| Target | Backdate support | Notes |
| --- | --- | --- |
| **Facebook Page** | ✅ **Officially supported** | Uses the documented `backdated_time` + `backdated_time_granularity` parameters on `/{page-id}/photos`. Meta provides this for content migration / retrospective posting. |
| **Instagram** | ⚠️ **Experimental — normally does NOT work** | Instagram's content-publishing endpoint (`/{ig-user-id}/media`) has **no documented backdate parameter**. The tool sends one anyway, publishes, then reads the resulting media `timestamp` back and reports whether it actually applied. In practice Instagram ignores it and the post carries the real publish time. |

> Instagram's `timestamp` field is read-only in the Graph API. There is no
> supported way to make an Instagram post appear as if it were published in the
> past. The Instagram path is included only so you can verify this empirically;
> do not rely on it.

Both paths use official OAuth and the official Graph API, and respect Meta's own
rate limits. This tool does not bypass or spoof any platform controls.

## Architecture

- **Backend:** FastAPI (Python)
- **Auth:** Facebook Login (OAuth) → long-lived token → Page tokens + linked IG account
- **Queue/DB:** SQLAlchemy over SQLite (Postgres supported via `DATABASE_URL`)
- **Scheduler:** APScheduler drains the pending queue every 30s (past/present publish immediately; future allowed only within `MAX_FUTURE_DAYS`)
- **Frontend:** single static page (`app/static/index.html`)

## 1. Register a Meta app

1. Go to <https://developers.facebook.com/apps> → **Create App** → type **Business**.
2. Add the **Facebook Login** product.
   - Under *Facebook Login → Settings → Valid OAuth Redirect URIs* add:
     `http://localhost:8000/auth/callback` (and your production URL later).
3. Add **Instagram** (Instagram Graph API) if you want to test the Instagram path.
4. Note your **App ID** and **App Secret** (*Settings → Basic*).
5. Request/enable these permissions (App Review needed for Live mode with accounts you don't own):
   `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`,
   `business_management`, `instagram_basic`, `instagram_content_publish`.
6. Link your Instagram **Business/Creator** account to a Facebook **Page**
   (Instagram app → Settings → Account type & linking).

While developing you can add yourself as a **Tester** and use the app in
Development mode without full App Review.

## 2. Configure & run

```bash
cd instagram-backdate-tool
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env      # then fill in META_APP_ID / META_APP_SECRET / SECRET_KEY

uvicorn app.main:app --reload --port 8000
```

Open <http://localhost:8000>, click **Connect Facebook / Instagram**, complete
OAuth, then create a post:

- Pick an account and target.
- Enter a public image URL, caption, and the **backdated time**.
- For Facebook, choose a **granularity** (`year`/`month`/`day`/`hour`/`min`).
- Leave *Publish at* blank to publish immediately, or set a future time
  (must be within `MAX_FUTURE_DAYS`).

The **Queue** table shows status. For Instagram posts it reports whether the
backdate was applied or ignored (with the real timestamp).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/auth/login` | Start Facebook OAuth |
| `GET` | `/auth/callback` | OAuth redirect target |
| `GET` | `/api/accounts` | List connected Pages / IG accounts |
| `POST` | `/api/posts` | Queue a post |
| `GET` | `/api/posts` | List queued posts + status |
| `POST` | `/api/run` | Drain the queue immediately |

## Limits handled

- Future scheduling capped at `MAX_FUTURE_DAYS` (default 30).
- Graph API errors are captured per-post and surfaced in the queue.
- Instagram publishing rate limits (100 posts / 24h) are enforced by Meta;
  keep volume modest to avoid throttling.
