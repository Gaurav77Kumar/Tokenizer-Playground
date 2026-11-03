"""Tests for POST /api/compare."""

from tests.conftest import ALL_IDS


def compare(client, text, tokenizers):
    return client.post("/api/compare", json={"text": text, "tokenizers": tokenizers})


def test_compare_two_tokenizers(client):
    response = compare(client, "Hello, world! 🌍", ["cl100k_base", "gpt2"])
    assert response.status_code == 200
    body = response.json()

    assert set(body["results"].keys()) == {"cl100k_base", "gpt2"}
    for result in body["results"].values():
        assert result["token_count"] == len(result["tokens"]) > 0
    assert body["summary"]["insight"], "compare must produce an insight sentence"


def test_compare_summary_flags_fewest_and_most(client):
    # Non-English text exaggerates differences between old and new tokenizers.
    text = "नमस्ते दुनिया! こんにちは世界! 🌍🚀"
    body = compare(client, text, ["o200k_base", "gpt2"]).json()

    counts = {tid: r["token_count"] for tid, r in body["results"].items()}
    summary = body["summary"]

    if summary["fewest"] is not None:
        assert counts[summary["fewest"]] == min(counts.values())
        assert counts[summary["most"]] == max(counts.values())
        assert str(min(counts.values())) in summary["insight"]
        assert str(max(counts.values())) in summary["insight"]
    else:
        assert len(set(counts.values())) == 1, "fewest is only null on a tie"


def test_compare_four_tokenizers(client):
    response = compare(client, "The quick brown fox jumps over the lazy dog.", ALL_IDS[:4])
    assert response.status_code == 200
    assert len(response.json()["results"]) == 4


def test_compare_requires_at_least_two(client):
    response = compare(client, "hello", ["cl100k_base"])
    assert response.status_code == 422
    assert "2 and 4" in response.json()["detail"]


def test_compare_caps_at_four(client):
    response = compare(client, "hello", ["cl100k_base", "o200k_base", "gpt2", "bert-base-uncased", "t5-small"])
    assert response.status_code == 422
    assert "2 and 4" in response.json()["detail"]


def test_compare_unknown_tokenizer(client):
    response = compare(client, "hello", ["cl100k_base", "mystery-tokenizer"])
    assert response.status_code == 404
    assert "mystery-tokenizer" in response.json()["detail"]


def test_compare_empty_text(client):
    body = compare(client, "", ["cl100k_base", "gpt2"]).json()
    assert all(r["token_count"] == 0 for r in body["results"].values())
    assert body["summary"]["insight"]  # tie insight, or a no-op note


def test_compare_matches_single_tokenize_results(client):
    text = "The year 2024 had 366 days."
    single = client.post("/api/tokenize", json={"text": text, "tokenizer": "t5-small"}).json()
    compared = compare(client, text, ["t5-small", "gpt2"]).json()["results"]["t5-small"]
    assert single["token_count"] == compared["token_count"]
    assert single["tokens"] == compared["tokens"]
