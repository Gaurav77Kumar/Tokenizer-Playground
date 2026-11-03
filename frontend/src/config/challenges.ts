/** "Experiments" challenges with hints; completion is tracked in localStorage. */

export interface Challenge {
  id: string;
  title: string;
  hint: string;
  tokenizer: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "fewer-tokens-than-words",
    title: "Find a sentence with fewer tokens than words",
    hint: "Think dense: long common words, no punctuation. Try 'Tokenization playground experimentation'. Or paste a comma-separated list — commas usually ride along with the word before them.",
    tokenizer: "o200k_base",
  },
  {
    id: "five-words-fifteen-tokens",
    title: "Make a 5-word sentence that takes 15+ tokens",
    hint: "Use GPT-2 and unusual spellings: 'Unbelievably zzquanchy phylloxera hiccupped ïmpórtäntly.' Non-English letters and rare words shatter fast.",
    tokenizer: "gpt2",
  },
  {
    id: "bert-three-gpt4o-one",
    title: "Find a word that is 1 token in GPT-4o but 3+ in BERT",
    hint: "BERT lowercases and has a small vocabulary. Try 'Tokenization' — check the ## pieces. Modern vocabularies (o200k) know it whole.",
    tokenizer: "bert-base-uncased",
  },
  {
    id: "emoji-price",
    title: "Find an emoji that costs 4+ tokens",
    hint: "Try newer or compound emoji in GPT-2: 🧑‍🚀 (astronaut) or 🏳️‍🌈. Each is multiple unicode pieces — and GPT-2 counts raw bytes.",
    tokenizer: "gpt2",
  },
  {
    id: "space-doubling",
    title: "Prove that ' word' and 'word' are different tokens",
    hint: "Type 'word word' in any tokenizer and hover both chips — different ids, different colors. The leading · marker shows the hidden space.",
    tokenizer: "cl100k_base",
  },
  {
    id: "half-emoji",
    title: "Catch a token that is HALF an emoji",
    hint: "Switch to the Bytes tab with 🍕 in GPT-2. Some tokens contain U+FFFD (�) — the replacement for half a multi-byte character.",
    tokenizer: "gpt2",
  },
  {
    id: "whitespace-bill",
    title: "Make whitespace cost 10+ tokens",
    hint: "Hold the space bar! Or write several paragraphs. In cl100k, long space runs pack into few tokens — but in GPT-2 every run still costs.",
    tokenizer: "gpt2",
  },
  {
    id: "json-vs-prose",
    title: "Encode the same fact in JSON and prose — compare the cost",
    hint: "Try {'age': 36} versus 'She is 36 years old.' in Compare mode with GPT-4o vs GPT-2, then look at the token counts.",
    tokenizer: "cl100k_base",
  },
];
