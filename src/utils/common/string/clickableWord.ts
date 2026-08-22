// Strips leading/trailing punctuation while keeping Unicode letters
// (accents like ã, ç, é, ñ, à, œ used in pt/es/fr/it), so the result stays
// lookup-ready for any supported study language, not just ASCII English.
const NON_WORD_EDGE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export function cleanWord(text: string): string {
  return text.replace(NON_WORD_EDGE, "");
}

// A word made only of letters (any language), combining marks, apostrophes
// (straight or curly) and hyphens is considered clickable/lookup-able.
const WORD_LIKE_RE = /^[\p{L}\p{M}'’-]+$/u;

export function isWordLike(text: string): boolean {
  return WORD_LIKE_RE.test(text);
}
