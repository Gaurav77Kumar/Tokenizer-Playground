"""Core tokenization logic.

Both paths produce tokens whose raw bytes tile the input's UTF-8 byte stream
exactly, so partial UTF-8 tokens (half an emoji) degrade to U+FFFD instead of
crashing:

- tiktoken (byte-level BPE): token bytes come from the library; offsets come
  from a byte->char map.

- transformers byte-level (GPT-2, RoBERTa): each piece char IS one input byte,
  so byte lengths come from ``len(piece)`` and offsets from the same byte->char
  map. Library offsets are unreliable when a multi-byte char splits across
  tokens.

- transformers WordPiece/SentencePiece (BERT, T5): offsets come from
  ``return_offsets_mapping``; token text is the vocabulary piece.
"""

from fastapi import HTTPException, status

from app.deps import manager
from app.registry import TokenizerSpec
from app.schemas import TokenItem, TokenizeResult
from app.services.manager import TokenizerLoadError

def _sanitize(text: str) -> str:
    """Replace lone surrogates so byte encoding can never raise"""
    try:
        text.encode("utf-8")
        return text
    except UnicodeEncodeError:
        return text.encode("utf-8", errors="replace").decode("utf-8")

def _byte_to_char_map(text: str) -> list[int]:
    """Map every UTF-8 byte position of ``text`` to a character index.

    Returns len(text.encode('utf-8')) + 1 entries so end positions resolve
    too. Bytes in the middle of a multi-byte character map to that
    character's index.
    """
    mapping: list[int] = []
    for char_index, char in enumerate(text):
        mapping.extend([char_index] * len(char.encode("utf-8")))
    mapping.append(len(text))
    return mapping


def _tiktoken_special_ids(enc) -> set[int]:
    """Best-effort set of special-token vocab ids for a tiktoken encoding."""
    special = getattr(enc, "_special_tokens", None) or {}
    if not special:
        return set()
    sample_key, _ = next(iter(special.items()))
    # Some tiktoken versions key this dict by token id, others by token string.
    if isinstance(sample_key, str) and not sample_key.isdigit():
        return {int(v) for v in special.values()}
    return {int(k) for k in special.keys()}


def _word_count(text: str) -> int:
    return len(text.split())


def _build_result(tokenizer_id: str, tokens: list[TokenItem], text: str) -> TokenizeResult:
    token_count = len(tokens)
    char_count = len(text)
    return TokenizeResult(
        tokenizer=tokenizer_id,
        tokens=tokens,
        token_count=token_count,
        char_count=char_count,
        word_count=_word_count(text),
        chars_per_token=round(char_count / token_count, 2) if token_count else 0.0,
    )


def _tokenize_tiktoken(spec: TokenizerSpec, text: str) -> TokenizeResult:
    enc = manager.get(spec.id)
    raw = text.encode("utf-8")
    b2c = _byte_to_char_map(text)
    ids = enc.encode(text, allowed_special="all")
    special_ids = _tiktoken_special_ids(enc)

    tokens: list[TokenItem] = []
    byte_pos = 0
    for token_id in ids:
        token_bytes = enc.decode_single_token_bytes(token_id)
        b_start, b_end = byte_pos, min(byte_pos + len(token_bytes), len(raw))
        byte_pos += len(token_bytes)
        token_text = token_bytes.decode("utf-8", errors="replace")
        tokens.append(
            TokenItem(
                id=token_id,
                text=token_text,
                piece=None,
                bytes=list(token_bytes),
                start=b2c[b_start],
                end=b2c[b_end],
                is_special=token_id in special_ids,
                is_whitespace=bool(token_text) and token_text.strip() == "",
            )
        )

    return _build_result(spec.id, tokens, text)


def _tokenizer_special_pieces(tok) -> set[str]:
    """Special-token strings (e.g. '<|endoftext|>', '[CLS]') for a HF tokenizer.

    ``special_tokens_mask`` only marks tokens added by the post-processor in
    some transformers versions, not special tokens typed into the text, so we
    match against the vocabulary's special strings instead.
    """
    return set(tok.all_special_tokens)


def _tokenize_transformers_byte_level(spec: TokenizerSpec, text: str) -> list[TokenItem]:
    tok = manager.get(spec.id)
    output = tok(
        text,
        add_special_tokens=False,
        return_attention_mask=False,
        return_token_type_ids=False,
    )
    encoding = output.encodings[0] if hasattr(output, "encodings") else output
    special_pieces = _tokenizer_special_pieces(tok)

    raw = text.encode("utf-8")
    b2c = _byte_to_char_map(text)

    tokens: list[TokenItem] = []
    byte_pos = 0
    for i, token_id in enumerate(encoding.ids):
        piece = encoding.tokens[i]
        is_special = piece in special_pieces
        # Byte-level pieces are 1 vocab char per input byte, except special
        # tokens which carry their literal spelling.
        piece_bytes = len(piece) if not is_special else len(piece.encode("utf-8"))
        b_start, b_end = byte_pos, min(byte_pos + piece_bytes, len(raw))
        byte_pos = byte_pos + piece_bytes

        token_bytes = raw[b_start:b_end]
        token_text = token_bytes.decode("utf-8", errors="replace")
        tokens.append(
            TokenItem(
                id=int(token_id),
                text=token_text,
                piece=None if token_text == piece else piece,
                bytes=list(token_bytes),
                start=b2c[b_start],
                end=b2c[b_end],
                is_special=is_special,
                is_whitespace=bool(token_text) and token_text.strip() == "",
            )
        )
    return tokens


def _tokenize_transformers_piece_level(spec: TokenizerSpec, text: str) -> list[TokenItem]:
    tok = manager.get(spec.id)
    output = tok(
        text,
        add_special_tokens=False,
        return_offsets_mapping=True,
        return_attention_mask=False,
        return_token_type_ids=False,
    )
    encoding = output.encodings[0] if hasattr(output, "encodings") else output
    special_pieces = _tokenizer_special_pieces(tok)

    tokens: list[TokenItem] = []
    for i, token_id in enumerate(encoding.ids):
        piece = encoding.tokens[i]
        start, end = encoding.offsets[i]
        is_special = piece in special_pieces

        # WordPiece/SentencePiece: the vocabulary piece is the honest display.
        token_text = piece
        token_bytes = piece.encode("utf-8")
        slice_text = text[start:end] if start < end else ""
        is_whitespace = bool(slice_text) and slice_text.strip() == ""

        tokens.append(
            TokenItem(
                id=int(token_id),
                text=token_text,
                piece=None,
                bytes=list(token_bytes),
                start=start,
                end=end,
                is_special=is_special,
                is_whitespace=is_whitespace,
            )
        )
    return tokens


def _tokenize_transformers(spec: TokenizerSpec, text: str) -> TokenizeResult:
    if spec.byte_level:
        tokens = _tokenize_transformers_byte_level(spec, text)
    else:
        tokens = _tokenize_transformers_piece_level(spec, text)
    return _build_result(spec.id, tokens, text)



def _get_loaded(tokenizer_id: str) -> TokenizerSpec:
    from app.registry import REGISTRY

    try:
        spec = REGISTRY[tokenizer_id]
    except KeyError:
        known = ", ".join(sorted(REGISTRY))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown tokenizer '{tokenizer_id}'. Available tokenizers: {known}.",
        ) from None
    try:
        manager.get(tokenizer_id)
    except TokenizerLoadError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_AVAILABLE, detail=str(exc)) from exc
    return spec


def tokenize_text(text: str, tokenizer_id: str) -> TokenizeResult:
    spec = _get_loaded(tokenizer_id)
    text = _sanitize(text)
    if spec.library == "tiktoken":
        return _tokenize_tiktoken(spec, text)
    return _tokenize_transformers(spec, text)


def decode_ids(tokenizer_id: str, ids: list[int]) -> str:
    spec = _get_loaded(tokenizer_id)
    obj = manager.get(tokenizer_id)

    if spec.library == "tiktoken":
        try:
            return obj.decode(ids)
        except KeyError as exc:
            bad = exc.args[0]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Token id {bad} is out of range for {tokenizer_id} "
                    f"(this vocabulary has {obj.n_vocab} ids)."
                ),
            ) from exc
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not decode ids with {tokenizer_id}: {exc}",
            ) from exc

    max_id = len(obj) - 1
    for token_id in ids:
        if token_id < 0 or token_id > max_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Token id {token_id} is out of range for {tokenizer_id} "
                    f"(valid range is 0–{max_id})."
                ),
            )
    return obj.decode(ids, skip_special_tokens=False)
