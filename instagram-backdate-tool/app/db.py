"""Database setup and ORM models (SQLAlchemy 2.0)."""
from __future__ import annotations

import datetime as dt
from collections.abc import Iterator

from sqlalchemy import DateTime, ForeignKey, String, Text, create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

from .config import get_settings

settings = get_settings()

_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def _utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class Account(Base):
    """A Facebook Page and its linked Instagram Business account."""

    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    page_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    page_name: Mapped[str] = mapped_column(String(255), default="")
    page_access_token: Mapped[str] = mapped_column(Text)
    ig_user_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ig_username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    token_expires_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    posts: Mapped[list["ScheduledPost"]] = relationship(back_populates="account")


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))

    # "facebook" (backdate supported) or "instagram" (experimental override)
    target: Mapped[str] = mapped_column(String(16))
    image_url: Mapped[str] = mapped_column(Text)
    caption: Mapped[str] = mapped_column(Text, default="")

    # The timestamp the user wants the post to carry.
    backdated_time: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True))
    granularity: Mapped[str] = mapped_column(String(8), default="day")

    # When the worker should attempt publishing (now for backdate, future for scheduled).
    scheduled_for: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    result_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    published_timestamp: Mapped[str | None] = mapped_column(String(64), nullable=True)
    backdate_applied: Mapped[bool | None] = mapped_column(nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    account: Mapped[Account] = relationship(back_populates="posts")


def init_db() -> None:
    Base.metadata.create_all(engine)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
