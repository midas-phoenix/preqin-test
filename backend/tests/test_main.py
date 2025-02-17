import asyncio
from unittest.mock import patch, AsyncMock

import pytest
import sqlalchemy
from fastapi import FastAPI, status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

import main
import persistence.database
from persistence.repository import Repository


@pytest.fixture(autouse=True)
def override_db_url():
    original_url = persistence.database.SQLALCHEMY_DATABASE_URL
    persistence.database.SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    persistence.database.engine = create_async_engine(persistence.database.SQLALCHEMY_DATABASE_URL, echo=True)
    persistence.database.SessionLocal = async_sessionmaker(bind=persistence.database.engine, expire_on_commit=False, class_=AsyncSession)
    yield


@pytest.fixture
async def app():
    async with persistence.database.engine.begin() as conn:
        await conn.run_sync(persistence.database.Base.metadata.drop_all)
        await conn.run_sync(persistence.database.Base.metadata.create_all)
    yield main.app


@pytest.fixture
async def client(app: FastAPI):
    with TestClient(app=app, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_read_investors(client: TestClient, app: FastAPI):
    with patch.object(Repository, 'seed_data', new_callable=AsyncMock) as mock_seed:
        async with main.lifespan(app):
            pass
    response = client.get("/investors")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
def test_read_commitments(client: TestClient, app: FastAPI):
    repo = Repository()
    asyncio.run(repo.seed_data(persistence.database.SessionLocal))  # Ensure data is seeded

    investors_response = client.get("/investors")
    investors = investors_response.json()
    if not investors:
        pytest.fail("No investors found, seeding failed")

    investor_id = investors[0]["id"]
    response = client.get(f"/investors/{investor_id}/commitments")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_lifespan(app: FastAPI):
    repo = Repository()
    with patch.object(Repository, 'seed_data', new_callable=AsyncMock) as mock_seed:
        async with main.lifespan(app):
            pass
    mock_seed.assert_called_once()
    mock_seed.assert_called_with(persistence.database.SessionLocal)
    async with persistence.database.engine.begin() as conn:
        tables = await conn.run_sync(lambda connection: sqlalchemy.inspect(connection).get_table_names())
        assert "investors" in tables
