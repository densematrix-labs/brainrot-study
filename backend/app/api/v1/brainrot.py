from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services import (
    extract_text_from_pdf,
    split_into_chunks,
    get_pdf_info,
    generate_brainrot_content,
    generate_tts,
    get_or_create_free_trial,
    use_token,
    get_token_status,
)
from app.api.v1.metrics import (
    http_requests,
    tokens_consumed,
    free_trial_used,
    core_function_calls,
)
from app.core.config import settings

router = APIRouter(prefix="/api/v1", tags=["brainrot"])


class ConvertRequest(BaseModel):
    text: str
    language: str = "en"


class ConvertResponse(BaseModel):
    success: bool
    content: dict
    remaining_tokens: int


@router.post("/upload", response_model=dict)
async def upload_pdf(
    file: UploadFile = File(...),
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF and get basic info."""
    http_requests.labels(tool=settings.TOOL_NAME, endpoint="/api/v1/upload", method="POST", status="200").inc()
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
    
    try:
        pdf_info = get_pdf_info(content)
        text = extract_text_from_pdf(content)
        chunks = split_into_chunks(text)
        
        return {
            "success": True,
            "filename": file.filename,
            "page_count": pdf_info["page_count"],
            "chunk_count": len(chunks),
            "preview": text[:500] + "..." if len(text) > 500 else text,
            "chunks": chunks,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")


@router.post("/convert", response_model=ConvertResponse)
async def convert_to_brainrot(
    request: ConvertRequest,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db),
):
    """Convert text to brainrot-style content. Uses 1 token."""
    core_function_calls.labels(tool=settings.TOOL_NAME, function="convert").inc()
    
    # Check/create tokens
    token = await get_or_create_free_trial(db, x_device_id)
    status = await get_token_status(db, x_device_id)
    
    if status["remaining_tokens"] <= 0:
        http_requests.labels(tool=settings.TOOL_NAME, endpoint="/api/v1/convert", method="POST", status="402").inc()
        raise HTTPException(
            status_code=402,
            detail="No tokens remaining. Please purchase more conversions to continue."
        )
    
    # Use a token
    success = await use_token(db, x_device_id)
    if not success:
        raise HTTPException(status_code=402, detail="No tokens remaining. Please purchase more conversions to continue.")
    
    tokens_consumed.labels(tool=settings.TOOL_NAME).inc()
    if token and token.is_free_trial:
        free_trial_used.labels(tool=settings.TOOL_NAME).inc()
    
    try:
        content = await generate_brainrot_content(request.text, request.language)
        status = await get_token_status(db, x_device_id)
        
        http_requests.labels(tool=settings.TOOL_NAME, endpoint="/api/v1/convert", method="POST", status="200").inc()
        
        return ConvertResponse(
            success=True,
            content=content,
            remaining_tokens=status["remaining_tokens"],
        )
    except Exception as e:
        # Refund token on error
        # (In production, you'd want more sophisticated error handling)
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/tts")
async def text_to_speech(
    text: str = Query(..., max_length=1000),
    language: str = Query(default="en"),
    x_device_id: str = Header(..., alias="X-Device-Id"),
):
    """Generate TTS audio for text."""
    http_requests.labels(tool=settings.TOOL_NAME, endpoint="/api/v1/tts", method="POST", status="200").inc()
    
    try:
        audio_data = await generate_tts(text, language)
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@router.get("/tokens")
async def get_tokens(
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db),
):
    """Get token status for a device."""
    # Create free trial if new user
    await get_or_create_free_trial(db, x_device_id)
    status = await get_token_status(db, x_device_id)
    return status
