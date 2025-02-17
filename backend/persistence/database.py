import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

SQLALCHEMY_DATABASE_URL = os.getenv('DB_URL') or "sqlite+aiosqlite:///./data/investors.db"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session

