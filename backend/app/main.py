import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS, MAX_TEXT_CHARS, WARM_UP_ON_START
from app.deps import manager
from app.registry import REGISTRY
from app.routers import compare, decode, examples, tokenize, tokenizers
from app.schemas import HealthResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tokenizer_playground")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if WARM_UP_ON_START:
        threading.Thread(target=manager.warm_up, daemon=True, name="tokenizer-warmup").start()
    yield


app = FastAPI(
    title="Tokenizer Playground API",
    description=(
        "Teaches how LLM tokenization works. Tokenize text with GPT-4o, GPT-2, BERT, "
        "T5 and RoBERTa tokenizers, compare them, and decode ids back to text."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

for router in (tokenizers.router, tokenize.router, compare.router, decode.router, examples.router):
    app.include_router(router)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", tokenizers=manager.availability_map())


@app.exception_handler(RequestValidationError)
async def friendly_validation_error(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        loc = tuple(str(part) for part in error.get("loc", ()))
        error_type = error.get("type", "")
        if "text" in loc and error_type == "string_too_long":
            return JSONResponse(
                status_code=422,
                content={
                    "detail": (
                        f"Text is too long: the limit is {MAX_TEXT_CHARS:,} characters. "
                        "Shorten it or split it into parts."
                    )
                },
            )
        if "tokenizers" in loc and error_type in ("too_short", "too_long"):
            return JSONResponse(
                status_code=422,
                content={"detail": "Pick between 2 and 4 tokenizers to compare."},
            )
        if "ids" in loc and error_type == "too_long":
            return JSONResponse(
                status_code=422,
                content={"detail": "Too many token ids in one request (limit is 20,000)."},
            )
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request. " + "; ".join(str(e.get("msg", e)) for e in exc.errors())},
    )
