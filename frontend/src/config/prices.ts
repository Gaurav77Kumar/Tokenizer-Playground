

export const EXAMPLE_PRICES: Record<string, number> = {
  cl100k_base: 0.5, // GPT-3.5-class pricing
  o200k_base: 2.5, // GPT-4o-class pricing
  gpt2: 0.5,
  "bert-base-uncased": 0.5,
  "t5-small": 0.5,
  "roberta-base": 0.5,
};

export const DEFAULT_PRICE_PER_MILLION = 1.0;
export const DEFAULT_REQUEST_COUNT = 1_000;

export function defaultPriceFor(tokenizerId: string): number {
  return EXAMPLE_PRICES[tokenizerId] ?? DEFAULT_PRICE_PER_MILLION;
}
