"""Pydantic models — the shared API contract.
"""

from pydantic import BaseModel, Field

from app.config import (
    MAX_TEXT_CHARS,
    MAX_DECODE_IDS,
    MIN_COMPARE_TOKENIZERS,
    MAX_COMPARE_TOKENIZERS,
) 

class TokenizerInfo(BaseModel):
    id: str
    name: str
    library: str
    algorithm: str
    vocab_size: int | None = None
    description: str
    available: bool = True


class TokenItem(BaseModel):
    id: int = Field(description="Vocabulary id of this token.")
    text: str = Field(
        description=(
            "Human-friendly token text. Byte-exact slice of the input for byte-level tokenizers; invalid UTF-8 (e.g. half an emoji) shows as U+FFFD."
        )
    )
    piece: str | None = Field(
        default=None,
        description=(
            "The token as written in the vocabulary (e.g. 'Ġhello', '##ing', '▁world'), " \
            "when it differs from the plain text. Null for tiktoken tokenizers."
        )
    )
    bytes: list[int]    =     Field(description="Raw UTF-8 bytes of the token.")
    start: int          =     Field(description="Character offset where the token starts in the input.")
    end: int            =     Field(description="Character offset just past the token end")
    is_special: bool    =     Field(default=False, description="True for special tokens like <|endoftext|>")
    is_whitespace: bool =     Field(default=False, description="True if the token is pure whitespace")


class TokenizeRequest(BaseModel):
    text: str      = Field(default="", max_length=MAX_TEXT_CHARS)
    tokenizer: str = Field(min_length=1, max_length=128)


class TokenizeResult(BaseModel):
    tokenizer:        str
    tokens:           list[TokenItem]
    token_count:      int
    char_count:       int
    word_count:       int
    chars_per_token:  float


class CompareRequest(BaseModel):
    text: str = Field(default="", max_length=MAX_TEXT_CHARS)
    tokenizers: list[str] = Field(min_length=MIN_COMPARE_TOKENIZERS, max_length=MAX_COMPARE_TOKENIZERS)


class CompareSummary(BaseModel):
    fewest:   str | None = None
    most:     str | None = None
    insight:  str = ""


class CompareResponse(BaseModel):
    text: str
    results: dict[str, TokenizeResult]
    summary: CompareSummary




class DecodeRequest(BaseModel):
    ids: list[int] = Field(min_length=0, max_length=MAX_DECODE_IDS)
    tokenizer: str = Field(min_length=1, max_length=128)


class DecodeResponse(BaseModel):
    tokenizer: str
    ids: list[int]
    text: str


class ExampleItem(BaseModel):
    id:        str
    title:     str
    category:  str
    text:      str
    note:      str | None = None


class HealthResponse(BaseModel):
    status: str
    tokenizers: dict[str, bool]
