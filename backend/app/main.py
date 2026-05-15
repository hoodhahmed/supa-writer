from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import documents, ai

app = FastAPI(title="SupaWriter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])

@app.get("/health")
def health_check():
    return {"status": "ok"}