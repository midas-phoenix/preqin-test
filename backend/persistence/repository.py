import csv
import os
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from models import Investor, Commitment


class Repository:
    async def get_investors(self, async_session: async_sessionmaker[AsyncSession]):
        """
        Get all investors from database
        :param async_session:
        :return:
        """
        async with async_session() as session:
            query = (select(
                Investor.id,
                Investor.name,
                Investor.type,
                Investor.country,
                Investor.date_added,
                Investor.last_updated,
                func.sum(Commitment.amount).label("total_commitment")
            )
                     .outerjoin(Commitment, Investor.id == Commitment.investor_id)
                     .group_by(Investor.id, Investor.name, Investor.type, Investor.country, Investor.date_added,
                               Investor.last_updated)
                     .order_by(Investor.id))
            result = await session.execute(query)
            return result.all()

    async def get_investor_commitments(self, async_session: async_sessionmaker[AsyncSession], investor_id: int):
        """
        Get all commitments by investor from database
        :param async_session:
        :param investor_id:
        :return:
        """
        async with async_session() as session:
            query = select(Commitment).where(Commitment.investor_id == investor_id)
            result = await session.execute(query)
            return result.scalars().all()

    async def add_investor(self, async_session: async_sessionmaker[AsyncSession], new_investor: Investor):
        """
        Create new investor
        :param async_session:
        :param new_investor:
        :return:
        """
        async with async_session() as session:
            investor = await session.execute(
                select(Investor).where(Investor.name == new_investor.name)
            )
            existing_investor = investor.scalars().first()
            if existing_investor:
                return existing_investor

            session.add(new_investor)
            await session.commit()
            return new_investor

    async def add_commitment(self, async_session: async_sessionmaker[AsyncSession], commitment: Commitment):
        async with async_session() as session:
            session.add(commitment)
            await session.commit()
            return commitment

    async def seed_data(self, async_session: async_sessionmaker[AsyncSession]):
        investors = await self.get_investors(async_session)
        if not investors:
            with open(os.path.join(os.path.dirname(__file__), '../data/data.csv'), newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    investor = Investor(name=row["Investor Name"],
                                        type=row["Investory Type"],
                                        country=row["Investor Country"],
                                        date_added=datetime.strptime(row["Investor Date Added"], '%Y-%m-%d').date(),
                                        last_updated=datetime.strptime(row["Investor Last Updated"], '%Y-%m-%d').date())
                    investor_result = await self.add_investor(async_session, investor)

                    commitment = Commitment(investor_id=investor_result.id,
                                            asset_class=row["Commitment Asset Class"],
                                            amount=float(row["Commitment Amount"]),
                                            currency=row["Commitment Currency"])
                    await self.add_commitment(async_session, commitment)
