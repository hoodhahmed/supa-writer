import httpx
from fastapi import APIRouter, HTTPException
from app.schemas.document import AIScoreInput, AIScoreOutput, HumanizeInput, HumanizeOutput
from app.core.config import settings

router = APIRouter()

@router.post("/score", response_model=AIScoreOutput)
async def get_ai_score(input_data: AIScoreInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://ryne.ai/api/ai-score",
                headers={
                    "content-type": "application/json",
                    "cookie": settings.RYNE_COOKIE,
                    "Referer": "https://ryne.ai/tools/ai-editor"
                },
                json={"text": input_data.documentText},
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            classification = result.get("classification") or result.get("details", {}).get("classification") or "UNKNOWN"
            confidence = result.get("aiScore") if result.get("aiScore") is not None else result.get("details", {}).get("fakePercentage", 0)
            
            sentences = []
            for s in result.get("details", {}).get("sentences", []):
                sentences.append({
                    "text": s.get("text"),
                    "aiProbability": s.get("aiProbability") if s.get("aiProbability") is not None else (100 if s.get("isAI") else 0),
                    "isAI": bool(s.get("isAI"))
                })
                
            feedback = result.get("details", {}).get("feedback") or ("Human Written" if classification == "HUMAN_ONLY" else "AI Detected")

            return AIScoreOutput(classification=classification, confidence=confidence, sentences=sentences, feedback=feedback)

        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))

@router.post("/humanize", response_model=HumanizeOutput)
async def humanize_text(input_data: HumanizeInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://writehuman.ai/api/humanize",
                headers={
                    "content-type": "application/json",
                    "cookie": settings.WRITEHUMAN_COOKIE,
                    "origin": "https://writehuman.ai",
                    "referer": "https://writehuman.ai/"
                },
                json={
                    "text": input_data.text.strip(),
                    "enhanced": True,
                    "numberOfVariations": 5,
                    "sequenceId": 2,
                    "tone": input_data.tone
                },
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            
            if result.get("error"):
                raise HTTPException(status_code=400, detail=result["error"])

            return HumanizeOutput(
                humanizedText=result.get("data", {}).get("humanized_text", input_data.text),
                score=result.get("data", {}).get("wh_score")
            )
        except Exception as e:
             raise HTTPException(status_code=500, detail=str(e))