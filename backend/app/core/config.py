from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    RYNE_COOKIE: str = "" 
    WRITEHUMAN_COOKIE: str = ""

    class Config:
        env_file = ".env"

settings = Settings()