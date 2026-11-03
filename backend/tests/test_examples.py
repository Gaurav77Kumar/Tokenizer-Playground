"""Tests for GET /api/examples."""


def test_examples_list(client):
    response = client.get("/api/examples")
    assert response.status_code == 200
    body = response.json()

    assert len(body) >= 8
    for item in body:
        assert item["id"] and item["title"] and item["text"]
        assert isinstance(item["text"], str)
    assert len({item["id"] for item in body}) == len(body), "example ids must be unique"


def test_examples_cover_key_categories(client):
    body = client.get("/api/examples").json()
    categories = {item["category"] for item in body}
    assert {"Basics", "Numbers", "Multilingual", "Code", "Subwords"} <= categories


def test_examples_include_multilingual_and_emoji(client):
    body = client.get("/api/examples").json()
    all_text = "\n".join(item["text"] for item in body)
    assert "你好" in all_text or "こんにちは" in all_text
    assert "🍕" in all_text or "🌍" in all_text
