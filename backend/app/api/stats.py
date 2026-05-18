from fastapi import APIRouter, Depends, HTTPException
from app.schemas.stats import UserStatsResponse, UpdateStatsInput
from app.db.supabase import get_supabase_client
from app.api.documents import get_user_id_from_token
from supabase import Client

router = APIRouter()

@router.get("", response_model=UserStatsResponse)
@router.get("/", response_model=UserStatsResponse)
def get_user_stats(
    user_id: str = Depends(get_user_id_from_token),
    supabase: Client = Depends(get_supabase_client),
):
    try:
        # 1. Get stats from user_stats table
        response = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
        
        # 2. Calculate storage usage from all documents
        docs_response = supabase.table("documents").select("content").eq("user_id", user_id).execute()
        total_chars = sum(len(doc.get("content", "")) for doc in docs_response.data)
        # Convert to MB (1 char approx 1 byte, so divide by 1,048,576)
        storage_used_mb = round(total_chars / (1024 * 1024), 2)

        if not response.data:
            # Initialize stats if not exist (only core DB columns)
            stats_data = {
                "user_id": user_id,
                "checksdone": 0,
                "rephrasedcount": 0,
                "wordsrephrased": 0,
                "humancontent": "0%",
                "aicontent": "0%"
            }
            res = supabase.table("user_stats").insert(stats_data).execute()
            stats = res.data[0]
        else:
            stats = response.data[0]
        
        # Map derived/calculated values for the UI
        # Pydantic will handle the mapping to camelCase if we pass it through UserStats
        # but here it's a raw dict 'stats'.
        stats["aiCreditsUsed"] = stats.get("wordsrephrased", 0)
        stats["aiCreditsLimit"] = 5000
        stats["storageUsedMB"] = storage_used_mb
        stats["storageLimitMB"] = 100
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.get("/global")
def get_global_stats(
    supabase: Client = Depends(get_supabase_client),
):
    try:
        response = supabase.table("user_stats").select("wordsrephrased").execute()
        total_words = sum(row.get("wordsrephrased", 0) for row in response.data)
        return {"totalWordsRephrased": total_words}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch global stats: {str(e)}")

@router.post("/update")
def update_user_stats(
    input_data: UpdateStatsInput,
    user_id: str = Depends(get_user_id_from_token),
    supabase: Client = Depends(get_supabase_client),
):
    try:
        # Get current stats
        response = supabase.table("user_stats").select("*").eq("user_id", user_id).execute()
        if not response.data:
            current = {
                "checksdone": 0,
                "rephrasedcount": 0,
                "wordsrephrased": 0,
                "humancontent": "0%",
                "aicontent": "0%"
            }
        else:
            current = response.data[0]

        new_checks = current.get("checksdone", 0) + (input_data.checkIncrement or 0)
        new_rephrased = current.get("rephrasedcount", 0) + (input_data.rephraseIncrement or 0)
        new_words = current.get("wordsrephrased", 0) + (input_data.wordIncrement or 0)
        
        update_data = {
            "checksdone": new_checks,
            "rephrasedcount": new_rephrased,
            "wordsrephrased": new_words,
        }

        if input_data.humanScore is not None:
            update_data["humancontent"] = f"{int(input_data.humanScore)}%"
        if input_data.aiScore is not None:
            update_data["aicontent"] = f"{int(input_data.aiScore)}%"

        supabase.table("user_stats").upsert({**update_data, "user_id": user_id}).execute()
        return {"status": "success", "stats": update_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update stats: {str(e)}")
