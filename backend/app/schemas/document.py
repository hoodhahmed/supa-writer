from pydantic import BaseModel
from typing import List, Optional

class DocumentBase(BaseModel):
    title: str
    content: str

class DocumentCreate(DocumentBase):
    id: str
    lastModified: int

class DocumentResponse(DocumentBase):
    id: str
    lastModified: int

class SentenceAnalysis(BaseModel):
    text: str
    aiProbability: float
    isAI: bool

class AIScoreInput(BaseModel):
    documentText: str

class AIScoreOutput(BaseModel):
    classification: str
    confidence: float
    sentences: Optional[List[SentenceAnalysis]] = []
    feedback: Optional[str] = None

class HumanizeInput(BaseModel):
    text: str
    tone: Optional[str] = "Standard"

class HumanizeOutput(BaseModel):
    humanizedText: str
    score: Optional[float] = None