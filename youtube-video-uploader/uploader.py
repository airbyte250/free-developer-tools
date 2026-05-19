#!/usr/bin/env python3
"""
YouTube Video Uploader – main orchestration script.

Workflow
--------
1. Authenticate with the YouTube Data API v3 via OAuth 2.0.
2. Scan the configured video directory for supported media files.
3. Read matching metadata from a CSV file.
4. Upload each video with the correct title, description, tags,
   and scheduled publish time (IST → UTC conversion).
5. Sleep for a random 5–10 minute interval between uploads to
   avoid API throttling / IP-based spam detection.
"""

import csv
import sys
from pathlib import Path

from config import VIDEO_DIR, METADATA_FILE, SUPPORTED_EXTENSIONS
from utils import setup_logger, ist_to_utc_iso, anti_spam_delay
from youtube_client import get_youtube_service, upload_video

logger = setup_logger()


# ── Metadata helpers ─────────────────────────────────────────────────────

def load_metadata(metadata_path: Path) -> dict[str, dict]:
    """Parse the CSV metadata file into a dict keyed by filename.

    Expected CSV columns:
        filename, title, description, tags, schedule_time_ist

    ``tags`` should be pipe-separated (``tag1|tag2|tag3``).
    ``schedule_time_ist`` must be in ``YYYY-MM-DD HH:MM`` (24-hour) IST.
    """
    if not metadata_path.exists():
        logger.error("Metadata file not found: %s", metadata_path)
        sys.exit(1)

    records: dict[str, dict] = {}
    with metadata_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            filename = row["filename"].strip()
            records[filename] = {
                "title": row["title"].strip(),
                "description": row["description"].strip(),
                "tags": [t.strip() for t in row["tags"].split("|") if t.strip()],
                "schedule_time_ist": row["schedule_time_ist"].strip(),
            }
    logger.info("Loaded metadata for %d video(s) from %s", len(records), metadata_path)
    return records


def discover_videos(video_dir: Path) -> list[Path]:
    """Return a sorted list of video files in *video_dir*."""
    if not video_dir.exists():
        logger.error("Video directory does not exist: %s", video_dir)
        sys.exit(1)

    videos = sorted(
        p for p in video_dir.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    logger.info("Found %d video(s) in %s", len(videos), video_dir)
    return videos


# ── Main ─────────────────────────────────────────────────────────────────

def main() -> None:
    logger.info("=" * 60)
    logger.info("YouTube Scheduled Uploader – starting run")
    logger.info("=" * 60)

    # 1. Discover videos & metadata
    videos = discover_videos(VIDEO_DIR)
    if not videos:
        logger.warning("No video files found. Nothing to upload.")
        return

    metadata = load_metadata(METADATA_FILE)

    # 2. Authenticate
    service = get_youtube_service()

    # 3. Upload loop
    total = len(videos)
    success_count = 0
    for idx, video_path in enumerate(videos, start=1):
        fname = video_path.name
        logger.info("── [%d/%d] Processing: %s", idx, total, fname)

        meta = metadata.get(fname)
        if meta is None:
            logger.warning(
                "No metadata entry for '%s' – skipping. "
                "Add a row to %s and re-run.",
                fname,
                METADATA_FILE,
            )
            continue

        # Convert IST schedule time → UTC ISO 8601
        try:
            publish_at_utc = ist_to_utc_iso(meta["schedule_time_ist"])
        except ValueError as exc:
            logger.error("Time conversion failed for '%s': %s", fname, exc)
            continue

        logger.info(
            "Scheduled publish: %s IST → %s UTC",
            meta["schedule_time_ist"],
            publish_at_utc,
        )

        video_id = upload_video(
            service=service,
            file_path=video_path,
            title=meta["title"],
            description=meta["description"],
            tags=meta["tags"],
            publish_at_utc=publish_at_utc,
        )

        if video_id:
            success_count += 1

        # Anti-spam delay (skip after last video)
        if idx < total:
            anti_spam_delay(logger)

    logger.info("=" * 60)
    logger.info(
        "Run complete – %d/%d video(s) uploaded successfully.", success_count, total
    )
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
