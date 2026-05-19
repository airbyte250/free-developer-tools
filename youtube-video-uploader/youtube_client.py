"""
YouTube Data API v3 interaction module.

Handles:
* OAuth 2.0 authentication (with token caching and auto-refresh)
* Resumable video uploads with a real-time progress bar
"""

import sys
import logging
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from tqdm import tqdm

from config import (
    CLIENT_SECRETS_FILE,
    TOKEN_FILE,
    UPLOAD_CHUNK_SIZE,
    YOUTUBE_API_SERVICE_NAME,
    YOUTUBE_API_VERSION,
    YOUTUBE_UPLOAD_SCOPE,
)

logger = logging.getLogger("youtube_uploader")


# ── Authentication ───────────────────────────────────────────────────────

def authenticate() -> Credentials:
    """Load cached credentials or run the OAuth consent flow.

    The token is persisted to ``TOKEN_FILE`` so subsequent runs skip the
    browser-based consent screen.  Expired tokens are silently refreshed.
    """
    creds: Credentials | None = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), [YOUTUBE_UPLOAD_SCOPE])

    if creds and creds.expired and creds.refresh_token:
        logger.info("Access token expired – refreshing …")
        creds.refresh(Request())
    elif not creds or not creds.valid:
        if not CLIENT_SECRETS_FILE.exists():
            logger.error(
                "client_secrets.json not found at %s. "
                "Download it from the Google Cloud Console.",
                CLIENT_SECRETS_FILE,
            )
            sys.exit(1)
        flow = InstalledAppFlow.from_client_secrets_file(
            str(CLIENT_SECRETS_FILE), scopes=[YOUTUBE_UPLOAD_SCOPE]
        )
        creds = flow.run_local_server(port=0)
        logger.info("OAuth consent completed – credentials obtained.")

    # Persist for next run
    TOKEN_FILE.write_text(creds.to_json())
    logger.debug("Credentials saved to %s", TOKEN_FILE)
    return creds


def get_youtube_service():
    """Return an authorised YouTube API service resource."""
    creds = authenticate()
    return build(
        YOUTUBE_API_SERVICE_NAME,
        YOUTUBE_API_VERSION,
        credentials=creds,
    )


# ── Upload ───────────────────────────────────────────────────────────────

def upload_video(
    service,
    file_path: Path,
    title: str,
    description: str,
    tags: list[str],
    publish_at_utc: str,
    category_id: str = "22",
) -> str | None:
    """Upload a single video with resumable upload and schedule it.

    Args:
        service: Authorised YouTube API service resource.
        file_path: Local path to the video file.
        title: Video title.
        description: Video description.
        tags: List of tags / keywords.
        publish_at_utc: ISO 8601 UTC publish time (e.g. ``2025-07-01T12:30:00Z``).
        category_id: YouTube category ID (default ``"22"`` = People & Blogs).

    Returns:
        The YouTube video ID on success, or ``None`` on failure.
    """
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": "private",
            "publishAt": publish_at_utc,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(
        str(file_path),
        chunksize=UPLOAD_CHUNK_SIZE,
        resumable=True,
    )

    request = service.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    file_size = file_path.stat().st_size

    logger.info("Starting upload: %s (%s)", file_path.name, _human_size(file_size))

    progress_bar = tqdm(
        total=file_size,
        unit="B",
        unit_scale=True,
        desc=file_path.name,
        ncols=80,
    )

    response = None
    try:
        while response is None:
            status, response = request.next_chunk()
            if status:
                uploaded = int(status.resumable_progress)
                progress_bar.update(uploaded - progress_bar.n)
        progress_bar.update(file_size - progress_bar.n)  # ensure bar hits 100 %
    except HttpError as exc:
        _handle_api_error(exc, file_path.name)
        return None
    except Exception as exc:
        logger.error("Unexpected error uploading %s: %s", file_path.name, exc)
        return None
    finally:
        progress_bar.close()

    video_id = response.get("id")
    logger.info(
        "Upload complete ✓  Video ID: %s  →  https://youtu.be/%s",
        video_id,
        video_id,
    )
    return video_id


# ── Helpers ──────────────────────────────────────────────────────────────

def _handle_api_error(exc: HttpError, filename: str) -> None:
    """Log a user-friendly message for common YouTube API errors."""
    status_code = exc.resp.status
    if status_code == 403:
        logger.error(
            "API quota exceeded or forbidden for '%s'. "
            "Wait 24 h for quota reset or request a quota increase in the "
            "Google Cloud Console.  Details: %s",
            filename,
            exc,
        )
    elif status_code == 400:
        logger.error(
            "Bad request for '%s'. Check metadata fields.  Details: %s",
            filename,
            exc,
        )
    else:
        logger.error(
            "HTTP %d error uploading '%s': %s",
            status_code,
            filename,
            exc,
        )


def _human_size(num_bytes: int) -> str:
    """Return a human-readable file size string."""
    for unit in ("B", "KB", "MB", "GB"):
        if abs(num_bytes) < 1024:
            return f"{num_bytes:.1f} {unit}"
        num_bytes /= 1024  # type: ignore[assignment]
    return f"{num_bytes:.1f} TB"
