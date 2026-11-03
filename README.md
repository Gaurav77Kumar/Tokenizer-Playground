# 🎨 Tokenizer Playground

**See how AI reads your text.** A hands-on, beginner-friendly web app that teaches how LLM
tokenization works: type anything and watch GPT-4o, GPT-4, GPT-2, BERT, T5 and RoBERTa split it
into colorful tokens — then learn why token count changes cost, context windows and model behavior.



A beginner can open the site, type a sentence, instantly see colorful tokens with IDs and counts,
compare GPT vs another tokenizer, complete the experiment challenges, and leave understanding why
tokenization affects cost, context limits and model behavior. No API keys needed — every tokenizer
is openly downloadable and cached locally.

---

## Quickstart (under 5 steps)

Prerequisites: **Python 3.11+** and **Node 18.18+**.

```bash
# 1. Install everything (backend venv + frontend node_modules)
npm run setup

# 2. Start both servers with one command
npm run dev

# 3. Open the app
#    Frontend → http://localhost:3000
#    API docs → http://localhost:8000/docs
```

 On first launch the backend downloads tokenizer files (~10 MB total: 2 tiktoken
encodings + 4 Hugging Face tokenizers) in the background, then caches them in memory forever.

Useful alternatives:

```bash
npm run dev:backend     # API only
npm run dev:frontend    # web only (expects the API on :8000)
npm run test            # backend pytest suite (45 tests)
docker compose up       # optional containerized dev setup
```

Configuration lives in [`.env.example`](.env.example) (CORS origins, HF cache, API base URL).



### Architecture overview

- **Registry-based tokenizers** — `backend/app/registry.py` is the single source of truth. Each
  entry declares id, display name, library (`tiktoken` / `transformers`), algorithm (BPE /
  WordPiece / SentencePiece), vocab size and a plain-English description.
- **Loaded once, cached in memory** — `TokenizerManager` loads each tokenizer on first use behind
  a per-tokenizer lock, warms all of them up in a background thread at startup, and never reloads
  per request. Failed downloads surface as a clear 503, not a crash.
- **Byte-exact tokens** — for byte-level tokenizers (tiktoken, GPT-2, RoBERTa) the backend tiles
  the input's UTF-8 byte stream exactly: a token that is *half an emoji* comes back as raw bytes
  with a U+FFFD display text instead of an error. Character offsets come from a byte→char map.
- **WordPiece/SentencePiece honesty** — BERT and T5 tokens show their real vocabulary pieces
  (`##ization`, `▁world`), which is what those models actually read.
- **Typed end to end** — Pydantic models on the backend mirror TypeScript interfaces in
  `frontend/src/lib/types.ts`. Keep them in sync.

### API reference

| Method | Path | Body / Params | Returns |
|---|---|---|---|
| GET | `/api/tokenizers` | — | List of `{id, name, library, algorithm, vocab_size, description, available}` |
| POST | `/api/tokenize` | `{text ≤ 20k chars, tokenizer}` | `{tokenizer, tokens: [{id, text, piece, bytes, start, end, is_special, is_whitespace}], token_count, char_count, word_count, chars_per_token}` |
| POST | `/api/compare` | `{text, tokenizers: [2–4 ids]}` | `{results: {id → TokenizeResult}, summary: {fewest, most, insight}}` |
| POST | `/api/decode` | `{ids, tokenizer}` | `{tokenizer, ids, text}` |
| GET | `/api/examples` | — | Curated example sentences |
| GET | `/api/health` | — | `{status, tokenizers: {id → available}}` |

Errors are plain-English: unknown tokenizer → 404, >20k chars → 422 ("Text is too long: the limit
is 20,000 characters…"), unloadable tokenizer → 503, out-of-range decode id → 400.

### If you want to  add a new tokenizer

One entry in `backend/app/registry.py` — that's the whole change:

```python
"mistral": TokenizerSpec(
    id="mistral",                      # HF model id for transformers tokenizers
    name="Mistral (v0.1)",
    library="transformers",            # or "tiktoken" with the encoding name as id
    algorithm="BPE",
    hf_model_id="mistralai/Mistral-7B-v0.1",
    vocab_size=32_000,
    byte_level=False,                  # True for byte-level BPE models
    description="One plain-English sentence about what makes it interesting.",
),
```

It appears in the API list, the frontend selector, and compare mode automatically (the frontend
reads everything from `GET /api/tokenizers`). Prefer ungated models so downloads need no keys.



