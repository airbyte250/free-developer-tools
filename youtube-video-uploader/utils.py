"""
Utility helpers.

* IST → UTC conversion
* Logging setup
* Random anti-spam delay
"""

import logging
import random
import time
from datetime import datetime, timezone, timedelta

from config import LOG_FILE, MIN_DELAY_SECONDS, MAX_DELAY_SECONDS

IST = timezone(timedelta(hours=5, minutes=30))


def setup_logger(name: str = "youtube_uploader") -> logging.Logger:
    """Return a logger that writes to both console and *uploader.log*."""
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)
    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler
    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    return logger


def ist_to_utc_iso(ist_time_str: str) -> str:
    """Convert an IST datetime string to an ISO 8601 UTC string.

    Accepted input formats:
        ``"YYYY-MM-DD HH:MM"``  or  ``"YYYY-MM-DD HH:MM:SS"``

    Returns:
        ISO 8601 UTC string, e.g. ``"2025-07-01T12:30:00Z"``.
    """
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            naive = datetime.strptime(ist_time_str.strip(), fmt)
            break
        except ValueError:
            continue
    else:
        raise ValueError(
            f"Cannot parse IST time '{ist_time_str}'. "
            "Expected format: 'YYYY-MM-DD HH:MM' or 'YYYY-MM-DD HH:MM:SS'."
        )

    ist_aware = naive.replace(tzinfo=IST)
    utc_dt = ist_aware.astimezone(timezone.utc)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def anti_spam_delay(logger: logging.Logger) -> None:
    """Sleep for a random interval between MIN and MAX delay (default 5-10 min)."""
    delay = random.randint(MIN_DELAY_SECONDS, MAX_DELAY_SECONDS)
    minutes, seconds = divmod(delay, 60)
    logger.info(
        "Anti-spam delay: sleeping for %d min %d sec before next upload …",
        minutes,
        seconds,
    )
    time.sleep(delay)
