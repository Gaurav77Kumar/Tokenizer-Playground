import type { TokenItem } from "./types";


export function noteForToken(token: TokenItem): string {
  if (token.is_special) {
    return "A special token — a reserved signal (like end-of-text), not ordinary words.";
  }
  if (token.text.includes("\uFFFD")) {
    return "This token is a fragment of a multi-byte character (half an emoji?) — that's why it shows raw bytes.";
  }
  if (token.is_whitespace) {
    return "Pure whitespace — invisible, but it still counts as a token and costs money.";
  }
  const piece = token.piece;
  if (piece?.startsWith("##")) {
    return "A WordPiece continuation: the word was too rare to keep whole, so it continues from the previous piece.";
  }
  if (piece?.startsWith("▁")) {
    return "SentencePiece marks a word start with '▁' — it stands in for the space before this piece.";
  }
  if (piece?.startsWith("Ġ")) {
    return "Starts with a space (Ġ is GPT-2's space marker) — a different token than the same word without one.";
  }
  if (/\d/.test(token.text) && token.text.length > 1 && !/^\d{1,3}$/.test(token.text)) {
    return "Numbers split unpredictably — digits don't merge like letters do.";
  }
  if (token.text.length === 1) {
    return "A single character on its own — common characters each get their own token.";
  }
  if (/[😀-🿿🇦-🇿]/u.test(token.text)) {
    return "An emoji — newer tokenizers keep it whole, older ones split it into byte pieces.";
  }
  if (token.text.length >= 7) {
    return "A frequent enough sequence to earn its own vocabulary entry.";
  }
  return "One building block of the model's vocabulary.";
}
