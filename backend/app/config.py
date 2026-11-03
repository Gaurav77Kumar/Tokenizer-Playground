import os

MAX_TEXT_CHARS = 20_000
"""Maximum number of characters accepted in tokenize/compare requests."""

MAX_DECODE_IDS = 20_000
"""Maximum number of token ids accepted in a decode request."""

MIN_COMPARE_TOKENIZERS = 2
MAX_COMPARE_TOKENIZERS = 4
"""Maximum number of tokenizers that can be compared at once."""


def _cors_origins() -> list[str]:
    raw = os.getenv(
        "TOKENIZER_PLAYGROUND_CORS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


CORS_ORIGINS = _cors_origins()

"""List of allowed CORS origins."""
WARM_UP_ON_START = os.getenv("TOKENIZER_PLAYGROUND_WARM_UP", "1") != "0"
"""Download/cache all tokenizers in a background thread at startup."""

HF_CACHE_DIR = os.getenv("TOKENIZER_PLAYGROUND_HF_CACHE") or None
"""Optional override for the Hugging Face cache directory."""
