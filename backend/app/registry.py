"""Tokenizer registry.

Adding a tokenizer is a one-line change: add a ``TokenizerSpec`` entry to
``REGISTRY``. Everything else (listing, loading, caching, API docs) reads
from this table.
"""

from dataclasses import dataclass

@dataclass(frozen=True)
class TokenizerSpec:
    id: str                        # Identifier used in API requests. For tiktoken this is the encoding name
    name: str                      # Human-friendly display name.
    library: str                   # Which loading backend to use: "tiktoken" or transformers
    algorithm: str                 # Plain-language algorithm label: BPE, WordPiece or SentencePiece
    hf_model_id: str | None        # Huggin Face model id(transformers only)
    vocab_size: int | None         # Documented vocabulary size, shown before the tokenizer is loaded
    byte_level: bool               # True if the tokenizer is byte-level BPE (tokens map to exact text bytes)
    description: str               # One plain-English sentence about what makes this tokenizer interesting.



REGISTRY: dict[str, TokenizerSpec] = {
    "cl100k_base": TokenizerSpec(
        id="cl100k_base",
        name="GPT-3.5 / GPT-4 (cl100k_base)",
        library="tiktoken",
        algorithm="BPE",
        hf_model_id=None,
        vocab_size=100_277,
        byte_level=True,
        description=(
            "Used by ChatGPT (GPT-3.5 and GPT-4). A 100k-token byte-level BPE "
            "vocabulary — strong on English code and prose, weaker on other languages."
        ),
    ),
    "o200k_base": TokenizerSpec(
        id="o200k_base",
        name="GPT-4o (o200k_base)",
        library="tiktoken",
        algorithm="BPE",
        hf_model_id=None,
        vocab_size=200_048,
        byte_level=True,
        description=(
            "Used by GPT-4o. Doubles the vocabulary to ~200k, so other languages, "
            "emojis and rare words tend to cost fewer tokens than in older tokenizers."
        ),
    ),
    "gpt2": TokenizerSpec(
        id="gpt2",
        name="GPT-2",
        library="transformers",
        algorithm="BPE",
        hf_model_id="gpt2",
        vocab_size=50_257,
        byte_level=True,
        description=(
            "The classic 2019 GPT-2 tokenizer (50k vocab). Great for learning: watch it "
            "struggle with numbers, long spaces and non-English text."
        ),
    ),
    "bert-base-uncased": TokenizerSpec(
        id="bert-base-uncased",
        name="BERT (bert-base-uncased)",
        library="transformers",
        algorithm="WordPiece",
        hf_model_id="bert-base-uncased",
        vocab_size=30_522,
        byte_level=False,
        description=(
            "BERT's WordPiece tokenizer. Lowercases everything, splits rare words into "
            "'##' pieces, and throws spaces away entirely — so whitespace is never a token."
        ),
    ),
    "t5-small": TokenizerSpec(
        id="t5-small",
        name="T5 (t5-small)",
        library="transformers",
        algorithm="SentencePiece",
        hf_model_id="t5-small",
        vocab_size=32_100,
        byte_level=False,
        description=(
            "T5's SentencePiece (Unigram) tokenizer. Marks word starts with '▁' instead of "
            "keeping real spaces, and has a single <unk> fallback for unknown text."
        ),
    ),
    "roberta-base": TokenizerSpec(
        id="roberta-base",
        name="RoBERTa (roberta-base)",
        library="transformers",
        algorithm="BPE",
        hf_model_id="roberta-base",
        vocab_size=50_265,
        byte_level=True,
        description=(
            "RoBERTa uses the same byte-level BPE scheme as GPT-2 (spaces shown as 'Ġ'), "
            "retrained with different preprocessing on much more data."
        ),
    ),
}

DEFAULT_TOKENIZER = "cl100k_base"

def get_spec(tokenizer_id: str) -> TokenizerSpec:
    return REGISTRY[tokenizer_id] 

"""Get the TokenizerSpec for a given tokenizer id. Raises KeyError if the id is unknown."""


