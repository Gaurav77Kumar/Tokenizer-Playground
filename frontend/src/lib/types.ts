export interface TokenItem {
  id: number;
  text: string;
  piece: string | null;
  bytes: number[];
  start: number;
  end: number;
  is_special: boolean;
  is_whitespace: boolean;
}

export interface TokenizeResult {
  tokenizer: string;
  tokens: TokenItem[];
  token_count: number;
  char_count: number;
  word_count: number;
  chars_per_token: number;
}

export interface TokenizerInfo {
  id: string;
  name: string;
  library: "tiktoken" | "transformers";
  algorithm: "BPE" | "WordPiece" | "SentencePiece";
  vocab_size: number | null;
  description: string;
  available: boolean;
}

export interface CompareSummary {
  fewest: string | null;
  most: string | null;
  insight: string;
}

export interface CompareResponse {
  text: string;
  results: Record<string, TokenizeResult>;
  summary: CompareSummary;
}

export interface DecodeResponse {
  tokenizer: string;
  ids: number[];
  text: string;
}

export interface ExampleItem {
  id: string;
  title: string;
  category: string;
  text: string;
  note: string | null;
}

export type TokenizeStatus = "idle" | "loading" | "ready" | "error";

export interface AsyncState<T> {
  status: TokenizeStatus;
  data: T | null;
  error: string | null;
}
