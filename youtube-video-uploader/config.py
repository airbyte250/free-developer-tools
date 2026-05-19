"""
Configuration module.

Loads settings from a .env file and exposes them as typed constants
used by the rest of the application.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── Paths ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent

VIDEO_DIR: Path = Path(
    os.getenv("VIDEO_DIR", str(BASE_DIR / "videos_to_upload"))
)
METADATA_FILE: Path = Path(
    os.getenv("METADATA_FILE", str(BASE_DIR / "sample_metadata" / "videos.csv"))
)
CLIENT_SECRETS_FILE: Path = Path(
    os.getenv("CLIENT_SECRETS_FILE", str(BASE_DIR / "client_secrets.json"))
)
TOKEN_FILE: Path = Path(
    os.getenv("TOKEN_FILE", str(BASE_DIR / "token.json"))
)
LOG_FILE: Path = Path(
    os.getenv("LOG_FILE", str(BASE_DIR / "uploader.log"))
)

# ── Upload behaviour ─────────────────────────────────────────────────────
UPLOAD_CHUNK_SIZE: int = int(os.getenv("UPLOAD_CHUNK_SIZE", str(256 * 1024)))
MIN_DELAY_SECONDS: int = int(os.getenv("MIN_DELAY_SECONDS", "300"))   # 5 min
MAX_DELAY_SECONDS: int = int(os.getenv("MAX_DELAY_SECONDS", "600"))   # 10 min

# ── Supported video extensions ───────────────────────────────────────────
SUPPORTED_EXTENSIONS: tuple[str, ...] = (".mp4", ".mkv")

# ── YouTube API constants ────────────────────────────────────────────────
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload"
