from fastapi import APIRouter

from app.schemas import DecodeRequest, DecodeResponse
from app.services import tokenizer_service

router = APIRouter(tags=["decode"])


@router.post("/api/decode", response_model=DecodeResponse)
def decode(request: DecodeRequest) -> DecodeResponse:
    """Turn a list of token ids back into text."""
    text = tokenizer_service.decode_ids(request.tokenizer, request.ids)
    return DecodeResponse(tokenizer=request.tokenizer, ids=request.ids, text=text)
