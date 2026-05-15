from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()


class SignInIn(BaseModel):
    email: str
    password: str


class SignUpIn(BaseModel):
    email: str
    password: str


@router.post("/signin")
async def signin(payload: SignInIn):
    """Sign in a user using Supabase Auth and return the session object."""
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(url, json={"email": payload.email, "password": payload.password}, headers=headers, timeout=10.0)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/signup")
async def signup(payload: SignUpIn):
    """Create a new user in Supabase Auth."""
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(url, json={"email": payload.email, "password": payload.password}, headers=headers, timeout=10.0)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
async def refresh_token(payload: dict):
    """Refresh access token given a Supabase refresh_token."""
    refresh_token = payload.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="refresh_token required")

    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token"
    headers = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(url, json={"refresh_token": refresh_token}, headers=headers, timeout=10.0)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
