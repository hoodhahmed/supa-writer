from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    RYNE_COOKIE: str = "" 
    WRITEHUMAN_COOKIE: str = ""

    @field_validator("SUPABASE_URL")
    @classmethod
    def validate_supabase_url(cls, value: str) -> str:
        if not value.startswith("https://") or ".supabase.co" not in value:
            raise ValueError("SUPABASE_URL must be a Supabase project URL")
        return value

    @field_validator("SUPABASE_KEY")
    @classmethod
    def validate_supabase_key(cls, value: str) -> str:
        if not value.startswith("sb_secret_"):
            raise ValueError("SUPABASE_KEY must be the full Supabase secret key from Dashboard > API Keys")
        return value

    class Config:
        env_file = ".env"

settings = Settings()