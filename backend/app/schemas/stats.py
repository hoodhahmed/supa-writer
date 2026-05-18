from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class UserStats(BaseModel):
    checksDone: int = Field(default=0, alias="checksdone")
    rephrasedCount: int = Field(default=0, alias="rephrasedcount")
    wordsRephrased: int = Field(default=0, alias="wordsrephrased")
    humanContent: str = Field(default="0%", alias="humancontent")
    aiContent: str = Field(default="0%", alias="aicontent")
    aiCreditsUsed: int = 0
    aiCreditsLimit: int = 5000
    storageUsedMB: float = 0.0
    storageLimitMB: int = 100

    model_config = ConfigDict(populate_by_name=True)

class UserStatsResponse(UserStats):
    user_id: str

class UpdateStatsInput(BaseModel):
    checkIncrement: Optional[int] = 0
    rephraseIncrement: Optional[int] = 0
    wordIncrement: Optional[int] = 0
    humanScore: Optional[float] = None
    aiScore: Optional[float] = None
