from fastapi import APIRouter

from app.registry import REGISTRY
from app.schemas import CompareRequest, CompareResponse, CompareSummary, TokenizeResult
from app.services import tokenizer_service

router = APIRouter(tags=["compare"])


def _has_non_ascii(text: str) -> bool:
    return any(ord(ch) > 127 for ch in text)


def _insight(results: dict[str, TokenizeResult], fewest: str | None, most: str | None, text: str) -> str:
    """Build a short plain-English comparison of the results."""
    if fewest is None or most is None or len(results) < 2:
        if len(results) >= 2:
            counts = {r.token_count for r in results.values()}
            return f"Every tokenizer agreed: {counts.pop()} tokens. Simple English text often tokenizes similarly."
        return ""

    lo_result = results[fewest]
    hi_result = results[most]
    lo, hi = lo_result.token_count, hi_result.token_count
    if hi == 0:
        return "Nothing to compare — the text is empty."

    pct = round((hi - lo) / hi * 100)
    fewest_name = REGISTRY[fewest].name
    most_name = REGISTRY[most].name
    sentence = f"{fewest_name} used {pct}% fewer tokens than {most_name} for this text ({lo} vs {hi})."

    lo_spec = REGISTRY[fewest]
    hi_spec = REGISTRY[most]
    lo_vocab = lo_spec.vocab_size or 0
    hi_vocab = hi_spec.vocab_size or 0

    hints: list[str] = []
    if lo_vocab and hi_vocab and lo_vocab >= hi_vocab * 1.4:
        hints.append(
            f"its much larger vocabulary (~{lo_vocab // 1000}k vs ~{hi_vocab // 1000}k entries) "
            "packs more text into each token"
        )
    if _has_non_ascii(text):
        hints.append("newer tokenizers were trained on more multilingual data, so non-English text and emoji split less")
    if not hints:
        hints.append("each tokenizer learned different merge rules and preprocessing, so they split the text differently")
    return sentence + " Why: " + hints[0] + "."


@router.post("/api/compare", response_model=CompareResponse)
def compare(request: CompareRequest) -> CompareResponse:
    """Tokenize the same text with 2–4 tokenizers and summarize the differences."""
    results = {
        tokenizer_id: tokenizer_service.tokenize_text(request.text, tokenizer_id)
        for tokenizer_id in request.tokenizers
    }

    counts = {tid: result.token_count for tid, result in results.items()}
    fewest = None
    most = None
    if counts:
        # On ties, prefer the entry order the caller asked for.
        fewest = next(tid for tid in request.tokenizers if counts[tid] == min(counts.values()))
        most = next(tid for tid in request.tokenizers if counts[tid] == max(counts.values()))

    if fewest == most:
        summary = CompareSummary(fewest=None, most=None, insight=_insight(results, None, None, request.text))
    else:
        summary = CompareSummary(
            fewest=fewest,
            most=most,
            insight=_insight(results, fewest, most, request.text),
        )
    return CompareResponse(text=request.text, results=results, summary=summary)
