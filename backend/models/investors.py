from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Date
from persistence.database import Base


class Investor(Base):
    __tablename__ = 'investors'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, name='investor_name', unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String, name='investor_type', nullable=False)
    country: Mapped[str] = mapped_column(String, name='investor_country', nullable=False)
    date_added: Mapped[Date] = mapped_column(Date, name='investor_date_added')
    last_updated: Mapped[Date] = mapped_column(Date, name='investor_last_updated')
