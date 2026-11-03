from fastapi import APIRouter

from app.deps import manager
from app.registry import REGISTRY
from app.schemas import TokenizerInfo

router = APIRouter(prefix="/api/tokenizers", tags=["tokenizers"])


@router.get("", response_model=list[TokenizerInfo])
def list_tokenizers() -> list[TokenizerInfo]:
    """List every registered tokenizer with its metadata and availability."""
    items: list[TokenizerInfo] = []
    for spec in REGISTRY.values():
        items.append(
            TokenizerInfo(
                id=spec.id,
                name=spec.name,
                library=spec.library,
                algorithm=spec.algorithm,
                vocab_size=spec.vocab_size,
                description=spec.description,
                available=manager.is_available(spec.id),
            )
        )
    return items
