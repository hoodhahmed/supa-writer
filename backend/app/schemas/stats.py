from pydantic import BaseModel
from typing import Optional

class UserStats(BaseModel):
    checksDone: int = 0
    rephrasedCount: int = 0
    wordsRephrased: int = 0
    humanContent: str = "0%"
    aiContent: str = "0%"
    aiCreditsUsed: int = 0
    aiCreditsLimit: int = 5000
    storageUsedMB: float = 0.0
    storageLimitMB: int = 100

class UserStatsResponse(UserStats):
    user_id: str

class UpdateStatsInput(BaseModel):
    checkIncrement: Optional[int] = 0
    rephraseIncrement: Optional[int] = 0
    wordIncrement: Optional[int] = 0
    humanScore: Optional[float] = None
    aiScore: Optional[float] = None
