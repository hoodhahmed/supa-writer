from fastapi import HTTPException
from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Supabase client could not be created. Check SUPABASE_URL and SUPABASE_KEY in .env."
        ) from exc