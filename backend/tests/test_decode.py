"""Tests for POST /api/decode — going from ids back to text."""

from tests.conftest import BYTE_LEVEL_IDS


def tokenize(client, text, tokenizer):
    return client.post("/api/tokenize", json={"text": text, "tokenizer": tokenizer})


def decode(client, ids, tokenizer):
    return client.post("/api/decode", json={"ids": ids, "tokenizer": tokenizer})


def test_roundtrip_byte_level_tokenizers(client):
    text = "The quick brown fox jumps over the lazy dog. 🐕 Numbers: 12345!"
    for tokenizer in BYTE_LEVEL_IDS:
        tokenized = tokenize(client, text, tokenizer).json()
        ids = [t["id"] for t in tokenized["tokens"]]

        response = decode(client, ids, tokenizer)
        assert response.status_code == 200, f"{tokenizer} decode failed: {response.text}"
        assert response.json()["text"] == text, f"{tokenizer} round-trip must reproduce the text"


def test_roundtrip_with_split_emoji(client):
    text = "emoji 🧑‍🚀🚀 split"
    for tokenizer in BYTE_LEVEL_IDS:
        tokenized = tokenize(client, text, tokenizer).json()
        ids = [t["id"] for t in tokenized["tokens"]]
        assert decode(client, ids, tokenizer).json()["text"] == text


def test_decode_special_token(client):
    tokenized = tokenize(client, "<|endoftext|>", "cl100k_base").json()
    ids = [t["id"] for t in tokenized["tokens"]]
    assert decode(client, ids, "cl100k_base").json()["text"] == "<|endoftext|>"


def test_decode_empty_id_list(client):
    response = decode(client, [], "cl100k_base")
    assert response.status_code == 200
    assert response.json()["text"] == ""


def test_decode_out_of_range_id(client):
    response = decode(client, [9_999_999], "cl100k_base")
    assert response.status_code == 400
    assert "out of range" in response.json()["detail"]


def test_decode_out_of_range_id_transformers(client):
    response = decode(client, [999_999], "gpt2")
    assert response.status_code == 400
    assert "out of range" in response.json()["detail"]


def test_decode_unknown_tokenizer(client):
    response = decode(client, [1, 2, 3], "nope")
    assert response.status_code == 404


def test_decode_wordpiece_and_sentencepiece_do_not_crash(client):
    text = "Hello world"
    for tokenizer in ("bert-base-uncased", "t5-small"):
        tokenized = tokenize(client, text, tokenizer).json()
        ids = [t["id"] for t in tokenized["tokens"]]
        response = decode(client, ids, tokenizer)
        assert response.status_code == 200
        assert isinstance(response.json()["text"], str)
        assert response.json()["text"]
