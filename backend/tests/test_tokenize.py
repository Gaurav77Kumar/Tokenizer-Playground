"""Tests for POST /api/tokenize — happy paths and edge cases."""

from tests.conftest import ALL_IDS, BYTE_LEVEL_IDS


def tokenize(client, text, tokenizer):
    return client.post("/api/tokenize", json={"text": text, "tokenizer": tokenizer})


def test_basic_english_offsets_tile_the_text(client):
    text = "Hello, world! Tokenization is fun."
    body = tokenize(client, text, "cl100k_base").json()

    assert body["token_count"] == len(body["tokens"]) > 0
    assert body["char_count"] == len(text)
    assert body["word_count"] == len(text.split())
    assert body["chars_per_token"] == round(len(text) / body["token_count"], 2)

    joined = "".join(text[t["start"]:t["end"]] for t in body["tokens"])
    assert joined == text, "tokens must tile the input exactly"
    assert body["tokens"][0]["start"] == 0
    assert body["tokens"][-1]["end"] == len(text)


def test_token_fields_are_populated(client):
    body = tokenize(client, "hello world", "cl100k_base").json()
    for token in body["tokens"]:
        assert isinstance(token["id"], int)
        assert isinstance(token["bytes"], list) and all(isinstance(b, int) for b in token["bytes"])
        assert isinstance(token["is_special"], bool)
        assert isinstance(token["is_whitespace"], bool)
        assert token["end"] >= token["start"]
        # tiktoken has no separate vocab-piece spelling
        assert token["piece"] is None


def test_empty_string(client):
    for tokenizer in ALL_IDS:
        body = tokenize(client, "", tokenizer).json()
        assert body["tokens"] == []
        assert body["token_count"] == 0
        assert body["char_count"] == 0
        assert body["word_count"] == 0
        assert body["chars_per_token"] == 0.0


def test_whitespace_only_text(client):
    text = "   \n\t  "
    body = tokenize(client, text, "cl100k_base").json()
    assert body["token_count"] > 0
    assert all(t["is_whitespace"] for t in body["tokens"])


def test_emoji_splits_into_bytes_on_gpt2(client):
    text = "hi 🌍!"
    body = tokenize(client, text, "gpt2").json()

    # Byte-level BPE must tile the UTF-8 byte stream exactly, even when the
    # emoji splits mid-character.
    all_bytes = [b for t in body["tokens"] for b in t["bytes"]]
    assert all_bytes == list(text.encode("utf-8"))
    assert body["token_count"] >= 4, "GPT-2 should split emoji into multiple byte-level tokens"
    for token in body["tokens"]:
        assert token["bytes"], "every token must carry at least one byte"


def test_emoji_single_token_on_gpt4o(client):
    body = tokenize(client, "I love pizza! 🍕", "o200k_base").json()
    joined = "".join("I love pizza! 🍕"[t["start"]:t["end"]] for t in body["tokens"])
    assert joined == "I love pizza! 🍕"
    assert body["token_count"] < 10


def test_multilingual_text_all_tokenizers(client):
    text = "नमस्ते दुनिया こんにちは世界"
    for tokenizer in ALL_IDS:
        response = tokenize(client, text, tokenizer)
        assert response.status_code == 200, f"{tokenizer} failed: {response.text}"
        body = response.json()
        for token in body["tokens"]:
            assert 0 <= token["start"] <= token["end"] <= len(text)
        assert body["char_count"] == len(text)


def test_chinese_costs_more_tokens_than_english(client):
    english = tokenize(client, "Hello world, how are you?", "cl100k_base").json()["token_count"]
    chinese = tokenize(client, "你好世界，你好吗？", "cl100k_base").json()
    # Same idea, but Chinese characters are less token-efficient in cl100k.
    assert chinese["char_count"] < 20
    assert chinese["token_count"] >= 6


def test_long_whitespace_runs(client):
    text = "a" + " " * 500 + "b" + "\n" * 100 + "c"
    for tokenizer in ALL_IDS:
        response = tokenize(client, text, tokenizer)
        assert response.status_code == 200, f"{tokenizer} failed on long whitespace"
        body = response.json()
        assert body["char_count"] == len(text)
        if tokenizer in BYTE_LEVEL_IDS:
            all_bytes = [b for t in body["tokens"] for b in t["bytes"]]
            assert all_bytes == list(text.encode("utf-8")), (
                f"{tokenizer}: byte-level tokenizers must tile text exactly"
            )


def test_code_and_json(client):
    code = "def add(a, b):\n    return a + b  # two numbers\n"
    payload = '{"name": "Ada", "languages": ["en", "fr"]}'
    for tokenizer in ALL_IDS:
        assert tokenize(client, code, tokenizer).status_code == 200
        assert tokenize(client, payload, tokenizer).status_code == 200


def test_special_tokens_are_flagged(client):
    text = "before <|endoftext|> after"
    for tokenizer in ("cl100k_base", "gpt2"):
        body = tokenize(client, text, tokenizer).json()
        special = [t for t in body["tokens"] if t["is_special"]]
        assert special, f"{tokenizer} should flag <|endoftext|> as special"
        assert any(t["text"] == "<|endoftext|>" for t in special)


def test_leading_space_changes_the_token(client):
    body = tokenize(client, "hello hello", "cl100k_base").json()
    tokens = [t["text"] for t in body["tokens"]]
    assert "hello" in tokens and " hello" in tokens
    assert tokens.index("hello") != tokens.index(" hello")


def test_wordpiece_pieces_and_lowercase(client):
    body = tokenize(client, "unbeliebable", "bert-base-uncased").json()
    texts = [t["text"] for t in body["tokens"]]
    assert texts[0] == "un" and texts[0] == texts[0].lower()
    assert all(not t["is_whitespace"] for t in body["tokens"]), "BERT never emits whitespace tokens"
    assert sum(1 for t in texts if t.startswith("##")) >= 3, "rare words split into ## pieces"


def test_sentencepiece_marks_word_starts(client):
    body = tokenize(client, "hello world", "t5-small").json()
    texts = [t["text"] for t in body["tokens"]]
    assert any(t.startswith("▁") for t in texts), "T5 marks word starts with ▁"


def test_vocab_piece_exposed_for_transformers(client):
    body = tokenize(client, " hello", "gpt2").json()
    assert body["tokens"][0]["piece"] == "Ġhello"
    assert body["tokens"][0]["text"] == " hello"


def test_ids_within_vocabulary_range(client):
    vocab = {item["id"]: item["vocab_size"] for item in client.get("/api/tokenizers").json()}
    for tokenizer, size in vocab.items():
        body = tokenize(client, "The quick brown fox 🦊 jumps over 12345", tokenizer).json()
        assert all(0 <= t["id"] < size for t in body["tokens"]), f"{tokenizer} produced an out-of-range id"


def test_max_text_length_boundary(client):
    ok = client.post("/api/tokenize", json={"text": "a" * 20_000, "tokenizer": "cl100k_base"})
    assert ok.status_code == 200

    too_long = client.post("/api/tokenize", json={"text": "a" * 20_001, "tokenizer": "cl100k_base"})
    assert too_long.status_code == 422
    assert "20,000" in too_long.json()["detail"]


def test_unknown_tokenizer_returns_404(client):
    response = tokenize(client, "hi", "not-a-tokenizer")
    assert response.status_code == 404
    assert "not-a-tokenizer" in response.json()["detail"]


def test_byte_level_bytes_tile_the_byte_stream(client):
    text = "Café ☕ test 🧑‍🚀 ok 123"
    for tokenizer in BYTE_LEVEL_IDS:
        body = tokenize(client, text, tokenizer).json()
        all_bytes = [b for t in body["tokens"] for b in t["bytes"]]
        assert all_bytes == list(text.encode("utf-8")), (
            f"{tokenizer}: token bytes must tile the UTF-8 byte stream exactly"
        )


def test_byte_level_bytes_match_input_slice_ascii(client):
    text = "Cafe test 123"
    for tokenizer in BYTE_LEVEL_IDS:
        body = tokenize(client, text, tokenizer).json()
        for token in body["tokens"]:
            if token["is_special"]:
                continue
            expected = list(text[token["start"]:token["end"]].encode("utf-8"))
            assert token["bytes"] == expected, f"{tokenizer}: bytes must match the input slice"


def test_chars_per_token_no_division_by_zero(client):
    body = tokenize(client, "", "t5-small").json()
    assert body["chars_per_token"] == 0.0
