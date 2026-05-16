from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from app.schemas.document import DocumentCreate, DocumentResponse
from app.db.supabase import get_supabase_client
from supabase import Client
import jwt as pyjwt

router = APIRouter()


def get_user_id_from_token(authorization: Optional[str] = Header(default=None)) -> str:
    """Extract user_id from the Supabase JWT Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        # Decode without verification to extract sub (Supabase signs with project secret)
        # For full verification you'd need the JWT secret from Supabase dashboard
        payload = pyjwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing sub claim")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("", response_model=List[DocumentResponse])
@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    user_id: str = Depends(get_user_id_from_token),
    supabase: Client = Depends(get_supabase_client),
):
    try:
        response = (
            supabase.table("documents")
            .select("*")
            .eq("user_id", user_id)
            .order("lastModified", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")


@router.post("", response_model=DocumentResponse)
@router.post("/", response_model=DocumentResponse)
def create_or_update_document(
    doc: DocumentCreate,
    user_id: str = Depends(get_user_id_from_token),
    supabase: Client = Depends(get_supabase_client),
):
    data = {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "lastModified": doc.lastModified,
        "user_id": user_id,
    }
    try:
        response = supabase.table("documents").upsert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save document — empty response")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save document: {str(e)}")


@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    user_id: str = Depends(get_user_id_from_token),
    supabase: Client = Depends(get_supabase_client),
):
    try:
        supabase.table("documents").delete().eq("id", doc_id).eq("user_id", user_id).execute()
        return {"message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
