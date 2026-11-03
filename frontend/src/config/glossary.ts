export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Token",
    definition:
      "The chunk of text a model actually reads: a whole word, a piece of a word, punctuation, or whitespace. Models process token ids, never raw letters.",
  },
  {
    term: "Vocabulary",
    definition:
      "The fixed menu of all tokens a model knows — GPT-2 has ~50k entries, GPT-4o ~200k. Anything outside it gets split into pieces that are.",
  },
  {
    term: "Token id",
    definition:
      "The integer position of a token in the vocabulary. ' hello' might be 15339 — that number is what enters the neural network.",
  },
  {
    term: "BPE (Byte Pair Encoding)",
    definition:
      "The algorithm behind GPT tokenizers: start from single bytes/characters, repeatedly merge the most frequent adjacent pair until the vocabulary is full.",
  },
  {
    term: "WordPiece",
    definition:
      "BERT's variant of BPE: merges chosen by likelihood gain, continuation pieces marked with '##', text lowercased, spaces dropped.",
  },
  {
    term: "SentencePiece",
    definition:
      "A tokenization framework (used by T5) that treats text as a raw stream, marks spaces with '▁', and segments probabilistically (Unigram algorithm).",
  },
  {
    term: "Byte-level tokenization",
    definition:
      "Mapping text to bytes first, so any sequence — emoji, Hindi, binary junk — can always be represented, with no unknown tokens.",
  },
  {
    term: "Special token",
    definition:
      "A reserved id that signals structure rather than content, like <|endoftext|> (end of document) or [CLS] (BERT's classification marker).",
  },
  {
    term: "Context window",
    definition:
      "The maximum number of tokens a model can consider at once — prompt and response share this budget. 8k, 128k and 1M are common sizes.",
  },
  {
    term: "Subword",
    definition:
      "A piece of a word produced by a tokenizer, e.g. 'token' + 'ization'. Subwords let a fixed vocabulary cover every word, including ones it has never seen.",
  },
];
