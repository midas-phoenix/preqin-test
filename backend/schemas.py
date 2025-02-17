import datetime

from pydantic import BaseModel, ConfigDict


class InvestorModel(BaseModel):
    id: int
    name: str
    type: str
    date_added: datetime.date
    country: str
    total_commitment: float

    model_config = ConfigDict(
        from_attributes=True
    )


class CommitmentModel(BaseModel):
    id: int
    asset_class: str
    currency: str
    amount: float

    model_config = ConfigDict(
        from_attributes=True
    )
