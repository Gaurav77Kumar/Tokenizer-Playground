/** Plain-English explanations of the three tokenizer algorithms. */

export const ALGORITHM_NOTES: Record<string, { title: string; body: string }> = {
  BPE: {
    title: "BPE — Byte Pair Encoding",
    body: "Start with single characters, then repeatedly merge the most frequent adjacent pair into a new token. Common words end up whole; rare ones shatter into familiar pieces. GPT models use a byte-level variant, so any text (even emoji) can be represented.",
  },
  WordPiece: {
    title: "WordPiece",
    body: "Like BPE, but merges are chosen to maximize likelihood instead of raw frequency, and continuation pieces get a '##' prefix. BERT also lowercases text and throws spaces away entirely.",
  },
  SentencePiece: {
    title: "SentencePiece (Unigram)",
    body: "Treats the text as a raw stream (spaces become '▁' markers) and picks the segmentation whose pieces give the highest probability. It can even 'un-merge' — pieces are chosen probabilistically, not by fixed merges.",
  },
};

export function noteForAlgorithm(algorithm: string) {
  return ALGORITHM_NOTES[algorithm] ?? { title: algorithm, body: "A subword tokenization algorithm." };
}
