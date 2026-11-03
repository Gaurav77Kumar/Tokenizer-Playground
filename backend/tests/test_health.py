"""Tests for the health endpoint and app wiring."""


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert set(body["tokenizers"].keys()) >= {"cl100k_base", "gpt2"}


def test_openapi_schema_lists_all_endpoints(client):
    schema = client.get("/openapi.json").json()
    paths = set(schema["paths"].keys())
    assert {
        "/api/tokenizers",
        "/api/tokenize",
        "/api/compare",
        "/api/decode",
        "/api/examples",
        "/api/health",
    } <= paths
