import pytest
from fastapi.testclient import TestClient

from app.main import app

TIKTOKEN_IDS = ["cl100k_base", "o200k_base"]
TRANSFORMERS_IDS = ["gpt2", "bert-base-uncased", "t5-small", "roberta-base"]
ALL_IDS = TIKTOKEN_IDS + TRANSFORMERS_IDS
BYTE_LEVEL_IDS = ["cl100k_base", "o200k_base", "gpt2", "roberta-base"]


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
