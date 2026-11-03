from fastapi import APIRouter

from app.schemas import TokenizeRequest, TokenizeResult
from app.services import tokenizer_service

router = APIRouter(tags=["tokenize"])


@router.post("/api/tokenize", response_model=TokenizeResult)
def tokenize(request: TokenizeRequest) -> TokenizeResult:
    """Tokenize ``text`` with the requested tokenizer."""
    return tokenizer_service.tokenize_text(request.text, request.tokenizer)
