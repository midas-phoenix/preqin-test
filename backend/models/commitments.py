from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, ForeignKey
from persistence.database import Base


class Commitment(Base):
    __tablename__ = 'commitments'
    id: Mapped[int] = mapped_column(primary_key=True)
    investor_id: Mapped[int] = mapped_column(ForeignKey('investors.id'), nullable=False)
    asset_class: Mapped[str] = mapped_column(String, name='commitment_asset_class', nullable=False)
    amount: Mapped[float] = mapped_column(Float, name='commitment_amount', nullable=False)
    currency: Mapped[str] = mapped_column(String, name='commitment_currency', nullable=False)
