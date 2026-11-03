"""Loads tokenizers once, caches them in memory, never reloads per request."""

import logging
import threading

from app.registry import REGISTRY, TokenizerSpec

logger = logging.getLogger("tokenizer_playground") 


class UnknownTokenizerError(LookupError):
    """Raised when a request names a tokenizer that is not in the registry."""


class TokenizerLoadError(RuntimeError):
    """Raised when a registered tokenizer could not be loaded/downloaded."""


class TokenizerManager:
    def __init__(self) -> None:
        self._cache: dict[str, object] = {}
        self._locks: dict[str, threading.Lock] = {tid: threading.Lock() for tid in REGISTRY}
        self._errors: dict[str, str] = {}


    def warm_up(self) -> None:
        """Best-effort preload of every tokenizer (runs in a background thread)."""
        for tokenizer_id in REGISTRY:
            try:
                self.get(tokenizer_id)
                logger.info("Loaded tokenizer %s", tokenizer_id)
            except Exception:  # noqa: BLE001 - warm-up must never crash startup
                logger.warning("Tokenizer %s failed to load; will retry on first use", tokenizer_id)

    def is_available(self, tokenizer_id: str) -> bool:
        return tokenizer_id in self._cache

    def error_for(self, tokenizer_id: str) -> str | None:
        return self._errors.get(tokenizer_id)

    def availability_map(self) -> dict[str, bool]:
        return {tid: self.is_available(tid) for tid in REGISTRY}

    def get(self, tokenizer_id: str):
        """Return the cached tokenizer, loading it on first use.

        Raises UnknownTokenizerError for unregistered ids and
        TokenizerLoadError when loading fails.
        """
        if tokenizer_id not in REGISTRY:
            known = ", ".join(sorted(REGISTRY))
            raise UnknownTokenizerError(
                f"Unknown tokenizer '{tokenizer_id}'. Available tokenizers: {known}."
            )
        cached = self._cache.get(tokenizer_id)
        if cached is not None:
            return cached

        lock = self._locks[tokenizer_id]
        with lock:
            # Re-check: another thread may have loaded it while we waited.
            cached = self._cache.get(tokenizer_id)
            if cached is not None:
                return cached
            spec = REGISTRY[tokenizer_id]
            try:
                loaded = self._load(spec)
            except Exception as exc:  # noqa: BLE001 - surfaced as a 503 to the client
                message = f"{type(exc).__name__}: {exc}"
                self._errors[tokenizer_id] = message
                logger.exception("Failed to load tokenizer %s", tokenizer_id)
                raise TokenizerLoadError(
                    f"Could not load tokenizer '{tokenizer_id}'. "
                    "It may not be downloadable right now — try another tokenizer."
                ) from exc
            self._cache[tokenizer_id] = loaded
            self._errors.pop(tokenizer_id, None)
            return loaded


    def _load(self, spec: TokenizerSpec):
        if spec.library == "tiktoken":
            import tiktoken

            return tiktoken.get_encoding(spec.id)

        if spec.library == "transformers":
            import os

            from transformers import AutoTokenizer

            kwargs: dict[str, object] = {"use_fast": True}
            if os.getenv("TOKENIZER_PLAYGROUND_HF_CACHE"):
                kwargs["cache_dir"] = os.environ["TOKENIZER_PLAYGROUND_HF_CACHE"]
            return AutoTokenizer.from_pretrained(spec.hf_model_id, **kwargs)

        raise TokenizerLoadError(f"Unknown library '{spec.library}' in registry entry '{spec.id}'.")
