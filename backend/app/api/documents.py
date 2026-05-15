from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.document import DocumentCreate, DocumentResponse
from app.db.supabase import get_supabase_client
from supabase import Client

router = APIRouter()

@router.get("/", response_model=List[DocumentResponse])
def get_documents(supabase: Client = Depends(get_supabase_client)):
    # You must create a 'documents' table in your Supabase dashboard with columns: id, title, content, lastModified, user_id
    response = supabase.table("documents").select("*").order('lastModified', desc=True).execute()
    return response.data

@router.post("/", response_model=DocumentResponse)
def create_or_update_document(doc: DocumentCreate, supabase: Client = Depends(get_supabase_client)):
    test_user_id = "00000000-0000-0000-0000-000000000000" # Replace with real auth later
    data = {"id": doc.id, "title": doc.title, "content": doc.content, "lastModified": doc.lastModified, "user_id": test_user_id}
    
    # Upsert logic
    response = supabase.table("documents").upsert(data).execute()
    if not response.data:
         raise HTTPException(status_code=500, detail="Failed to save document")
    return response.data[0]

@router.delete("/{doc_id}")
def delete_document(doc_id: str, supabase: Client = Depends(get_supabase_client)):
    response = supabase.table("documents").delete().eq("id", doc_id).execute()
    return {"message": "Document deleted"}