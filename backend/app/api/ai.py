import httpx
import re
from typing import Optional
from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
from app.schemas.document import AIScoreInput, AIScoreOutput, HumanizeInput, HumanizeOutput, GrammarlyScoreOutput, QuillBotScoreOutput
from app.core.config import settings
from app.api.grammarly_client import grammarly_client
from app.api.quillbot_client import quillbot_client

router = APIRouter()

# Global client for connection pooling
_http_client: Optional[httpx.AsyncClient] = None

def get_http_client():
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=60.0)
    return _http_client

@router.post("/grammarly-score", response_model=GrammarlyScoreOutput)
async def get_grammarly_score(input_data: AIScoreInput):
    try:
        # Run the sync grammarly client in a threadpool to avoid blocking
        result = await run_in_threadpool(grammarly_client.check, input_data.documentText)
        return result
    except Exception as e:
        print(f"DEBUG: Grammarly AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quillbot-score", response_model=QuillBotScoreOutput)
async def get_quillbot_score(input_data: AIScoreInput):
    try:
        # Run the sync quillbot client in a threadpool to avoid blocking
        result = await run_in_threadpool(quillbot_client.check, input_data.documentText)
        return result
    except Exception as e:
        print(f"DEBUG: QuillBot AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
    client = get_http_client()
    try:
        if not settings.RYNE_COOKIE:
            print("DEBUG: RYNE_COOKIE is missing")
            raise HTTPException(status_code=503, detail="RYNE_COOKIE is not configured")

        print(f"DEBUG: Sending request to Ryne AI with text length: {len(input_data.documentText)}")
        response = await client.post(
            "https://ryne.ai/api/ai-score",
            headers={
                "content-type": "application/json",
                "cookie": settings.RYNE_COOKIE,
                "Referer": "https://ryne.ai/tools/ai-editor"
            },
            json={"text": input_data.documentText}
        )

        print(f"DEBUG: Ryne AI Response Status: {response.status_code}")
        if response.status_code != 200:
            print(f"DEBUG: Ryne AI Error Body: {response.text}")

        response.raise_for_status()

        try:
            result = response.json()
            print(f"DEBUG: Ryne AI Full Response: {result}")
        except ValueError as exc:
            print(f"DEBUG: Ryne AI returned invalid JSON: {response.text}")
            return build_fallback_ai_score(
                input_data.documentText,
                "AI score service returned invalid JSON; using local fallback analysis.",
            )

        # Extract data with more defensive logging
        details = result.get("details", {})
        classification = result.get("classification") or details.get("classification") or "UNKNOWN"
        confidence = result.get("aiScore") if result.get("aiScore") is not None else details.get("fakePercentage", 0)

        print(f"DEBUG: Classification: {classification}, Confidence: {confidence}")

        sentences = []
        raw_sentences = details.get("sentences", [])
        print(f"DEBUG: Found {len(raw_sentences)} sentences in response")

        for s in raw_sentences:
            sentences.append({
                "text": s.get("text"),
                "aiProbability": s.get("aiProbability") if s.get("aiProbability") is not None else (100 if s.get("isAI") else 0),
                "isAI": bool(s.get("isAI"))
            })

        feedback = details.get("feedback") or ("Human Written" if classification == "HUMAN_ONLY" else "AI Detected")

        return AIScoreOutput(classification=classification, confidence=confidence, sentences=sentences, feedback=feedback)

    except HTTPException:
        raise
    except httpx.HTTPStatusError as exc:
        print(f"DEBUG: HTTPStatusError: {exc.response.status_code} - {exc.response.text}")
        if exc.response.status_code >= 500:
            return build_fallback_ai_score(
                input_data.documentText,
                "AI score service is temporarily unavailable; using local fallback analysis.",
            )

        detail = exc.response.text.strip() if exc.response.text else str(exc)
        raise HTTPException(status_code=exc.response.status_code, detail=detail[:200]) from exc
    except httpx.RequestError as exc:
        print(f"DEBUG: RequestError: {str(exc)}")
        return build_fallback_ai_score(
            input_data.documentText,
            "AI score service could not be reached; using local fallback analysis.",
        )
    except Exception as e:
        print(f"DEBUG: Unexpected Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/humanize", response_model=HumanizeOutput)
async def humanize_text(input_data: HumanizeInput):
    client = get_http_client()
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
            }
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