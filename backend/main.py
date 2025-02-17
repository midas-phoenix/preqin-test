from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from persistence import database
import schemas
from persistence.repository import Repository

repo = Repository()


@asynccontextmanager
async def lifespan(appInst: FastAPI):
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.drop_all)
        await conn.run_sync(database.Base.metadata.create_all)
        await repo.seed_data(database.SessionLocal)
    yield

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/investors", response_model=List[schemas.InvestorModel], status_code=status.HTTP_200_OK)
async def read_investors() -> List[schemas.InvestorModel]:
    result = await repo.get_investors(database.SessionLocal)
    return result


@app.get("/investors/{investor_id}/commitments",
         response_model=List[schemas.CommitmentModel],
         status_code=status.HTTP_200_OK)
async def read_commitments(investor_id: int) -> List[schemas.CommitmentModel]:
    result = await repo.get_investor_commitments(database.SessionLocal, investor_id)
    return result



