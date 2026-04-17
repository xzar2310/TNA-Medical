import uuid
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User accounts — soft-deleted via is_active."""

    __tablename__ = "users"

    # UUID primary key per claude.md rules
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    role: Mapped[str] = mapped_column(String(20), default="customer")  # customer | staff | admin
    pdpa_consent: Mapped[bool] = mapped_column(Boolean, default=False)  # PDPA compliance tracking
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # soft-delete
