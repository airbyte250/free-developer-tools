"""Thin wrapper around the Meta Graph API for OAuth and publishing.

Two publishing paths are implemented:

* Facebook Page posting with ``backdated_time`` — officially documented and
  supported by Meta for content migration / retrospective posting.
* Instagram content publishing with an *experimental* timestamp override —
  Instagram's ``/{ig-user-id}/media`` endpoint does NOT document any backdate
  parameter, so this is best-effort: we send the param, publish, then read the
  published media's ``timestamp`` back to report whether the backdate actually
  took effect (it almost always will not).
"""
from __future__ import annotations

import datetime as dt
from urllib.parse import urlencode

import httpx

from .config import get_settings

settings = get_settings()


class MetaError(RuntimeError):
    """Raised when the Graph API returns an error payload."""


def _raise_for_graph_error(resp: httpx.Response) -> dict:
    try:
        data = resp.json()
    except ValueError:
        resp.raise_for_status()
        raise
    if isinstance(data, dict) and "error" in data:
        err = data["error"]
        msg = err.get("message", "Unknown Graph API error")
        raise MetaError(f"{msg} (code={err.get('code')}, type={err.get('type')})")
    resp.raise_for_status()
    return data


# --------------------------------------------------------------------------- #
# OAuth
# --------------------------------------------------------------------------- #
SCOPES = [
    "public_profile",
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "business_management",
    "instagram_basic",
    "instagram_content_publish",
]


def login_url(state: str) -> str:
    params = {
        "client_id": settings.meta_app_id,
        "redirect_uri": settings.redirect_uri,
        "state": state,
        "response_type": "code",
        "scope": ",".join(SCOPES),
    }
    return f"https://www.facebook.com/{settings.meta_api_version}/dialog/oauth?{urlencode(params)}"


def exchange_code_for_token(client: httpx.Client, code: str) -> str:
    resp = client.get(
        f"{settings.graph_base}/oauth/access_token",
        params={
            "client_id": settings.meta_app_id,
            "client_secret": settings.meta_app_secret,
            "redirect_uri": settings.redirect_uri,
            "code": code,
        },
    )
    data = _raise_for_graph_error(resp)
    return data["access_token"]


def get_long_lived_token(client: httpx.Client, short_token: str) -> tuple[str, dt.datetime | None]:
    resp = client.get(
        f"{settings.graph_base}/oauth/access_token",
        params={
            "grant_type": "fb_exchange_token",
            "client_id": settings.meta_app_id,
            "client_secret": settings.meta_app_secret,
            "fb_exchange_token": short_token,
        },
    )
    data = _raise_for_graph_error(resp)
    expires_in = data.get("expires_in")
    expires_at = (
        dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=int(expires_in))
        if expires_in
        else None
    )
    return data["access_token"], expires_at


def list_pages_with_instagram(client: httpx.Client, user_token: str) -> list[dict]:
    """Return the user's Pages, each with its Page token and linked IG account."""
    resp = client.get(
        f"{settings.graph_base}/me/accounts",
        params={
            "access_token": user_token,
            "fields": "id,name,access_token,instagram_business_account{id,username}",
        },
    )
    data = _raise_for_graph_error(resp)
    pages = []
    for page in data.get("data", []):
        ig = page.get("instagram_business_account") or {}
        pages.append(
            {
                "page_id": page["id"],
                "page_name": page.get("name", ""),
                "page_access_token": page.get("access_token", ""),
                "ig_user_id": ig.get("id"),
                "ig_username": ig.get("username"),
            }
        )
    return pages


# --------------------------------------------------------------------------- #
# Approach A: Facebook Page backdated posting (officially supported)
# --------------------------------------------------------------------------- #
def post_facebook_backdated(
    client: httpx.Client,
    page_id: str,
    page_token: str,
    image_url: str,
    caption: str,
    backdated_time: dt.datetime,
    granularity: str,
) -> dict:
    """Publish a photo to a Facebook Page with a backdated timestamp.

    Uses ``/{page-id}/photos`` with ``backdated_time`` and
    ``backdated_time_granularity`` — both documented Page parameters.
    """
    resp = client.post(
        f"{settings.graph_base}/{page_id}/photos",
        data={
            "url": image_url,
            "caption": caption,
            "backdated_time": int(backdated_time.timestamp()),
            "backdated_time_granularity": granularity,
            "published": "true",
            "access_token": page_token,
        },
    )
    data = _raise_for_graph_error(resp)
    return {"result_id": data.get("post_id") or data.get("id"), "backdate_applied": True}


# --------------------------------------------------------------------------- #
# Approach B: Instagram publishing with experimental timestamp override
# --------------------------------------------------------------------------- #
def _create_ig_container(
    client: httpx.Client,
    ig_user_id: str,
    token: str,
    image_url: str,
    caption: str,
    experimental_time: dt.datetime | None,
) -> str:
    payload = {"image_url": image_url, "caption": caption, "access_token": token}
    if experimental_time is not None:
        # Undocumented / unsupported for Instagram. Sent anyway to test whether
        # Meta honours it. Expect it to be ignored or rejected.
        payload["backdated_time"] = int(experimental_time.timestamp())
    resp = client.post(f"{settings.graph_base}/{ig_user_id}/media", data=payload)
    data = _raise_for_graph_error(resp)
    return data["id"]


def _publish_ig_container(client: httpx.Client, ig_user_id: str, token: str, creation_id: str) -> str:
    resp = client.post(
        f"{settings.graph_base}/{ig_user_id}/media_publish",
        data={"creation_id": creation_id, "access_token": token},
    )
    data = _raise_for_graph_error(resp)
    return data["id"]


def _read_media_timestamp(client: httpx.Client, media_id: str, token: str) -> str | None:
    resp = client.get(
        f"{settings.graph_base}/{media_id}",
        params={"fields": "timestamp", "access_token": token},
    )
    try:
        data = _raise_for_graph_error(resp)
    except MetaError:
        return None
    return data.get("timestamp")


def publish_instagram(
    client: httpx.Client,
    ig_user_id: str,
    token: str,
    image_url: str,
    caption: str,
    experimental_time: dt.datetime | None,
) -> dict:
    """Publish to Instagram, optionally attempting the experimental backdate.

    After publishing we read back the media ``timestamp`` and compare it to the
    requested time so the tool can honestly report whether the backdate stuck.
    """
    creation_id = _create_ig_container(client, ig_user_id, token, image_url, caption, experimental_time)
    media_id = _publish_ig_container(client, ig_user_id, token, creation_id)

    backdate_applied: bool | None = None
    published_ts = _read_media_timestamp(client, media_id, token)
    if experimental_time is not None and published_ts:
        try:
            published_dt = dt.datetime.fromisoformat(published_ts.replace("+0000", "+00:00"))
            # Consider it "applied" only if within a minute of the requested time.
            backdate_applied = abs((published_dt - experimental_time).total_seconds()) < 60
        except ValueError:
            backdate_applied = None

    return {
        "result_id": media_id,
        "published_timestamp": published_ts,
        "backdate_applied": backdate_applied,
    }
