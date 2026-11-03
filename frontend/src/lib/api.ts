import type {
  CompareResponse,
  DecodeResponse,
  ExampleItem,
  TokenizeResult,
  TokenizerInfo,
} from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      0,
      "Could not reach the tokenizer API. It may be starting up — check your connection and try again.",
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
}

export const api = {
  tokenizers: () => request<TokenizerInfo[]>("/api/tokenizers"),

  tokenize: (text: string, tokenizer: string) =>
    request<TokenizeResult>("/api/tokenize", {
      method: "POST",
      body: JSON.stringify({ text, tokenizer }),
    }),

  compare: (text: string, tokenizers: string[]) =>
    request<CompareResponse>("/api/compare", {
      method: "POST",
      body: JSON.stringify({ text, tokenizers }),
    }),

  decode: (ids: number[], tokenizer: string) =>
    request<DecodeResponse>("/api/decode", {
      method: "POST",
      body: JSON.stringify({ ids, tokenizer }),
    }),

  examples: () => request<ExampleItem[]>("/api/examples"),
};
