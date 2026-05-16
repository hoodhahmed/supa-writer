import httpx
import re
from fastapi import APIRouter, HTTPException
from app.schemas.document import AIScoreInput, AIScoreOutput, HumanizeInput, HumanizeOutput
from app.core.config import settings

router = APIRouter()


def build_fallback_ai_score(document_text: str, feedback: str) -> AIScoreOutput:
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", document_text.strip()) if part.strip()]
    if not sentences and document_text.strip():
        sentences = [document_text.strip()]

    return AIScoreOutput(
        classification="UNKNOWN",
        confidence=0,
        sentences=[
            {
                "text": sentence,
                "aiProbability": 0,
                "isAI": False,
            }
            for sentence in sentences
        ],
        feedback=feedback,
    )

@router.post("/score", response_model=AIScoreOutput)
async def get_ai_score(input_data: AIScoreInput):
    async with httpx.AsyncClient() as client:
        try:
            if not settings.RYNE_COOKIE:
                raise HTTPException(status_code=503, detail="RYNE_COOKIE is not configured")

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
            try:
                result = response.json()
            except ValueError as exc:
                return build_fallback_ai_score(
                    input_data.documentText,
                    "AI score service returned invalid JSON; using local fallback analysis.",
                )

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

        except HTTPException:
            raise
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code >= 500:
                return build_fallback_ai_score(
                    input_data.documentText,
                    "AI score service is temporarily unavailable; using local fallback analysis.",
                )

            detail = exc.response.text.strip() if exc.response.text else str(exc)
            raise HTTPException(status_code=exc.response.status_code, detail=detail[:200]) from exc
        except httpx.RequestError as exc:
            return build_fallback_ai_score(
                input_data.documentText,
                "AI score service could not be reached; using local fallback analysis.",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/humanize", response_model=HumanizeOutput)
async def humanize_text(input_data: HumanizeInput):
    async with httpx.AsyncClient() as client:
        try:
            if not settings.WRITEHUMAN_COOKIE:
                raise HTTPException(status_code=503, detail="WRITEHUMAN_COOKIE is not configured")

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
            try:
                result = response.json()
            except ValueError as exc:
                raise HTTPException(status_code=502, detail="Humanize service returned invalid JSON") from exc

            if result.get("error"):
                raise HTTPException(status_code=400, detail=result["error"])

            return HumanizeOutput(
                humanizedText=result.get("data", {}).get("humanized_text", input_data.text),
                score=result.get("data", {}).get("wh_score")
            )
        except HTTPException:
            raise
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text.strip() if exc.response.text else str(exc)
            raise HTTPException(status_code=502, detail=f"Humanize service returned {exc.response.status_code}: {detail[:200]}") from exc
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Humanize service request failed: {str(exc)}") from exc
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))