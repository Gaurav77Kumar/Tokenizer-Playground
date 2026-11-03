"""Tests for GET /api/tokenizers."""


def test_lists_all_registered_tokenizers(client):
    response = client.get("/api/tokenizers")
    assert response.status_code == 200
    body = response.json()

    ids = [item["id"] for item in body]
    assert len(ids) >= 6
    assert len(ids) == len(set(ids)), "tokenizer ids must be unique"
    assert {"cl100k_base", "o200k_base", "gpt2", "bert-base-uncased", "t5-small", "roberta-base"} <= set(ids)


def test_entries_have_complete_metadata(client):
    body = client.get("/api/tokenizers").json()
    for item in body:
        assert item["name"]
        assert item["library"] in {"tiktoken", "transformers"}
        assert item["algorithm"] in {"BPE", "WordPiece", "SentencePiece"}
        assert isinstance(item["description"], str) and item["description"]
        assert isinstance(item["available"], bool)
        assert item["vocab_size"] is None or item["vocab_size"] > 0


def test_algorithm_labels_are_correct(client):
    body = {item["id"]: item for item in client.get("/api/tokenizers").json()}
    assert body["cl100k_base"]["algorithm"] == "BPE"
    assert body["o200k_base"]["algorithm"] == "BPE"
    assert body["gpt2"]["algorithm"] == "BPE"
    assert body["roberta-base"]["algorithm"] == "BPE"
    assert body["bert-base-uncased"]["algorithm"] == "WordPiece"
    assert body["t5-small"]["algorithm"] == "SentencePiece"
