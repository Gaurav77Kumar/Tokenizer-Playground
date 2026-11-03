/** Selectable context-window limits for the meter. */
export interface ContextLimit {
  label: string;
  tokens: number;
}

export const CONTEXT_LIMITS: ContextLimit[] = [
  { label: "4k — GPT-3", tokens: 4_096 },
  { label: "8k — GPT-3.5", tokens: 8_192 },
  { label: "16k — small models", tokens: 16_384 },
  { label: "32k — GPT-4-32k", tokens: 32_768 },
  { label: "128k — GPT-4o", tokens: 128_000 },
  { label: "200k — long-context models", tokens: 200_000 },
  { label: "1M — Gemini-class", tokens: 1_000_000 },
];

export const DEFAULT_CONTEXT_LIMIT = CONTEXT_LIMITS[4].tokens;

/** Max tokens rendered as chips before we stop (keeps the DOM fast). */
export const MAX_RENDERED_TOKENS = 2_500;
