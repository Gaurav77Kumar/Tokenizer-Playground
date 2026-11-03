from fastapi import APIRouter

from app.content.examples import EXAMPLES
from app.schemas import ExampleItem

router = APIRouter(prefix="/api/examples", tags=["examples"])


@router.get("", response_model=list[ExampleItem])
def list_examples() -> list[ExampleItem]:
    """Curated example sentences that showcase interesting tokenization behavior."""
    return EXAMPLES
