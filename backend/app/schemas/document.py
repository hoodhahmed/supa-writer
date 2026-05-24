from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Union

class DocumentBase(BaseModel):
    title: str
    content: str

class DocumentCreate(DocumentBase):
    id: str
    lastModified: int = Field(alias="lastmodified")

    model_config = ConfigDict(populate_by_name=True)

class DocumentResponse(DocumentBase):
    id: str
    lastModified: int = Field(alias="lastmodified")

    model_config = ConfigDict(populate_by_name=True)


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

class QuillBotToneScores(BaseModel):
    friendly: float
    formal: float
    clear: float
    simple: float
    concise: float

class QuillBotToneSentence(BaseModel):
    id: str
    modelID: str
    scores: QuillBotToneScores
    text: str

class QuillBotToneData(BaseModel):
    toneScoresForSentences: List[QuillBotToneSentence]
    averageScore: QuillBotToneScores
    timedOut: bool

class QuillBotToneOutput(BaseModel):
    message: str
    traceID: str
    code: str
    data: QuillBotToneData
    status: int

class HumanizeOutput(BaseModel):
    humanizedText: str
    score: Optional[float] = None
    tone: Optional[QuillBotToneScores] = None

class GrammarlyAlertRange(BaseModel):
    begin: int
    end: int
    score: int

class GrammarlyScoreOutput(BaseModel):
    category: str
    group: str
    categoryHuman: str
    score: int
    alertRanges: List[GrammarlyAlertRange]

class QuillBotLLMSource(BaseModel):
    id: Optional[str] = None
    modelID: Optional[str] = None
    predictions: Optional[List[Any]] = []
    is_reliable: Optional[bool] = False

class QuillBotAIPhrase(BaseModel):
    phrase: str
    start_span: int
    end_span: int
    explanation: str

class QuillBotExplainer(BaseModel):
    perplexity_score: Optional[float] = None
    burstiness_score: Optional[float] = None
    ai_phrases: Optional[List[QuillBotAIPhrase]] = []
    common_phrases: Optional[List[Any]] = []
    categories: Optional[List[str]] = []
    llmSource: Optional[QuillBotLLMSource] = None

class QuillBotChunk(BaseModel):
    text: str
    startSpan: int
    endSpan: int
    type: str
    aiScore: float
    humanParaphrasedScore: float
    aiParaphrasedScore: float
    isFailed: bool
    explainer: Optional[Union[QuillBotExplainer, str, Any]] = None

class QuillBotDataValue(BaseModel):
    chunks: List[QuillBotChunk]
    aiScore: float
    humanParaphrasedScore: float
    aiParaphrasedScore: float
    modelVersion: str
    id: str
    modelID: str

class QuillBotData(BaseModel):
    timedOut: bool
    value: QuillBotDataValue

class QuillBotScoreOutput(BaseModel):
    message: str
    traceID: str
    code: str
    data: QuillBotData
    status: int