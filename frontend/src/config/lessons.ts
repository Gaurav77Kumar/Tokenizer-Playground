export interface Lesson {
  id: string;
  title: string;
  body: string[];
  tryIt?: { text: string; tokenizer: string; note?: string };
  demo?: "bpe";
}

export const LESSONS: Lesson[] = [
  {
    id: "what-is-a-token",
    title: "1 · What is a token?",
    body: [
      "Models don't see words or letters — they see tokens: chunks of text from a fixed menu called the vocabulary.",
      "A token can be a whole word (' amazing'), a piece of a word ('amaz', 'ing'), a punctuation mark, or even just a space.",
      "Everything a model ever reads or writes is built from that menu.",
    ],
    tryIt: {
      text: "Unbelievable! Tokenization splits words into pieces when it needs to.",
      tokenizer: "cl100k_base",
    },
  },
  {
    id: "spaces-matter",
    title: "2 · Why spaces matter",
    body: [
      "'hello', ' hello' and 'Hello' are three different tokens — the leading space is part of the token!",
      "That's why the playground shows spaces as '·': the model literally receives a different id depending on spacing and capitalization.",
      "A typo that changes spacing changes what the model reads.",
    ],
    tryIt: {
      text: "hello hello\n Hello, hello!",
      tokenizer: "cl100k_base",
      note: "Look at the chips: ' hello' and 'hello' have different colors and ids.",
    },
  },
  {
    id: "numbers",
    title: "3 · Numbers are weird",
    body: [
      "Digits don't merge like letters do. '2024' might be one token, but '123456789' becomes several chunks.",
      "That's one reason models are famously shaky at arithmetic: they see numbers as arbitrary character chunks, not as place-value digits.",
    ],
    tryIt: {
      text: "2024 123456789 3.14159 1000000 0.5",
      tokenizer: "cl100k_base",
    },
  },
  {
    id: "multilingual",
    title: "4 · Non-English text costs more",
    body: [
      "Tokenizers are trained mostly on English, so Hindi, Japanese, Thai and emoji often split into many more tokens per idea.",
      "Same sentence, bigger bill: multilingual text can cost 2–5× more tokens than English — more money, slower responses, less room in the context window.",
    ],
    tryIt: {
      text: "Hello! नमस्ते दुनिया! こんにちは世界! 🌍🚀",
      tokenizer: "o200k_base",
    },
  },
  {
    id: "code-json",
    title: "5 · Code and JSON",
    body: [
      "Code is token-dense: every brace, quote, indent and operator is part of the stream.",
      "A JSON payload can easily double in token cost versus the same information in prose — worth remembering when you paste API responses into prompts.",
    ],
    tryIt: {
      text: '{"name": "Ada Lovelace", "age": 36, "languages": ["en", "fr"]}',
      tokenizer: "cl100k_base",
    },
  },
  {
    id: "typos",
    title: "6 · Typos and rare words shatter",
    body: [
      "A word the tokenizer has never seen gets chopped into familiar pieces: 'unbeliebable' becomes un·bel·ieba·ble.",
      "Each piece still means something to the model, but rare spellings quietly make text longer, weirder and more expensive.",
    ],
    tryIt: {
      text: "unbelievable unbeliebable supercalifragilisticexpialidocious",
      tokenizer: "gpt2",
    },
  },
  {
    id: "special-tokens",
    title: "7 · Special tokens",
    body: [
      "Some ids aren't text at all — they're signals: <|endoftext|> means 'the document ends here', [CLS] and [SEP] frame BERT's input.",
      "If a user types a special token, most APIs either reserve it or escape it — it never becomes ordinary characters.",
    ],
    tryIt: {
      text: "The story ends here. <|endoftext|> Nothing after this is read.",
      tokenizer: "cl100k_base",
    },
  },
  {
    id: "bpe",
    title: "8 · How BPE builds a vocabulary",
    body: [
      "BPE starts from single characters and repeatedly merges the most frequent adjacent pair into a new token.",
      "Step through the demo below: watch pair counts, pick the winner, and see the vocabulary grow — exactly how GPT's tokenizer was trained, just on a tiny corpus.",
    ],
    demo: "bpe",
  },
  {
    id: "why-it-matters",
    title: "9 · Why token count matters",
    body: [
      "API pricing is per token — the same idea in a token-hungry language costs multiples more.",
      "The context window is a token budget: fill it with wasteful tokenization and there's less room for your documents and the answer.",
      "And because the model reads tokens, not letters, tokenization subtly shapes behavior — arithmetic, rhymes and rare languages all start from these chunks.",
    ],
    tryIt: {
      text: "Translate to French: 'The quick brown fox jumps over the lazy dog.' Then explain why this sentence costs what it costs.",
      tokenizer: "cl100k_base",
    },
  },
];
