"""Pydantic request/response models and validation."""
from __future__ import annotations

import datetime as dt
from typing import Literal

from pydantic import BaseModel, field_validator

from .config import get_settings

settings = get_settings()

GRANULARITIES = {"year", "month", "day", "hour", "min", "none"}


class PostCreate(BaseModel):
    account_id: int
    target: Literal["facebook", "instagram"]
    image_url: str
    caption: str = ""
    backdated_time: dt.datetime
    granularity: str = "day"
    # Optional future publish time; if omitted the worker publishes immediately.
    scheduled_for: dt.datetime | None = None

    @field_validator("granularity")
    @classmethod
    def _check_granularity(cls, v: str) -> str:
        if v not in GRANULARITIES:
            raise ValueError(f"granularity must be one of {sorted(GRANULARITIES)}")
        return v

    @field_validator("backdated_time", "scheduled_for")
    @classmethod
    def _ensure_tz(cls, v: dt.datetime | None) -> dt.datetime | None:
        if v is not None and v.tzinfo is None:
            return v.replace(tzinfo=dt.timezone.utc)
        return v

    def resolved_scheduled_for(self) -> dt.datetime:
        return self.scheduled_for or dt.datetime.now(dt.timezone.utc)

    def validate_window(self) -> None:
        """Enforce the queue rule: past/present allowed, future only < N days."""
        now = dt.datetime.now(dt.timezone.utc)
        when = self.resolved_scheduled_for()
        max_future = now + dt.timedelta(days=settings.max_future_days)
        if when > max_future:
            raise ValueError(
                f"scheduled_for cannot be more than {settings.max_future_days} days in the future"
            )


class AccountOut(BaseModel):
    id: int
    page_id: str
    page_name: str
    ig_user_id: str | None
    ig_username: str | None

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: int
    account_id: int
    target: str
    image_url: str
    caption: str
    backdated_time: dt.datetime
    granularity: str
    scheduled_for: dt.datetime
    status: str
    result_id: str | None
    published_timestamp: str | None
    backdate_applied: bool | None
    error: str | None
    created_at: dt.datetime

    model_config = {"from_attributes": True}
