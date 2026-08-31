import { useMemo, useRef, useEffect } from "react";
import type { ElementType } from "react";
import { cn } from "@/utils/common/classnames";

type InlineStyle = "normal" | "bold" | "italic" | "bolditalic" | "code" | "link" | "paren";

interface Segment {
  text: string;
  style: InlineStyle;
  timed: boolean;
}

type ParaKind =
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "blockquote"
  | "li"
  | "hr"
  | "codeblock";

interface ParsedPara {
  kind: ParaKind;
  text: string;
  segments: Segment[];
}

interface WordTiming {
  text: string;
  start: number;
  end: number;
  paragraph: number;
}

interface RawWord {
  text: string;
  paragraph: number;
}

interface KaraokeViewProps {
  content: string;
  currentTime: number;
  wordTimings: { word: string; start: number; end: number }[];
  /** Index into the flattened word list to force-highlight (e.g. right after a click),
   *  overriding the currentTime-driven lookup until playback resumes. */
  pinnedIndex?: number | null;
  onWordClick?: (word: string, start: number, index: number) => void;
}

const PARAGRAPH_CLASS = "mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed";
const BLOCKQUOTE_CLASS =
  "border-l-4 border-primary/50 pl-4 sm:pl-6 my-4 sm:my-6 italic text-foreground/80 bg-muted/50 py-2 sm:py-3 rounded-r";
const CODEBLOCK_CLASS =
  "block bg-muted p-3 sm:p-4 rounded text-sm sm:text-base font-mono overflow-x-auto my-4 sm:my-6 whitespace-pre-wrap break-words";
const HEADING_CLASSES: Record<string, string> = {
  h1: "text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-8 first:mt-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent",
  h2: "text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 first:mt-0 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent",
  h3: "text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 mt-5 sm:mt-6 first:mt-0 py-2 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent",
  h4: "text-base sm:text-lg md:text-xl font-medium mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent",
  h5: "text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent",
  h6: "text-sm sm:text-base font-normal mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 py-2 bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent",
};
const STYLE_CLASSES: Record<InlineStyle, string> = {
  normal: "",
  bold: "font-bold text-purple-600 dark:text-purple-400",
  italic: "italic",
  bolditalic: "font-bold italic text-purple-600 dark:text-purple-400",
  code: "bg-muted px-1.5 py-0.5 rounded font-mono text-sm sm:text-base text-foreground",
  link: "text-primary underline",
  paren: "text-blue-600 dark:text-blue-400 font-bold",
};
const ACTIVE_CLASS = "text-primary underline decoration-2 underline-offset-4 decoration-primary";
const HEADING_TAGS: Record<string, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

function cleanHtmlArtifacts(content: string): string {
  return content
    .replace(/<\/?p\s*\/?>/gi, "")
    .replace(/<\/?div\s*\/?>/gi, "")
    .replace(/<br\s*\/?>/gi, "");
}

// Some AI-generated content writes "#Title" without the space after the
// hashes, or doubled markers like "## # Subtitle", which the heading
// parser doesn't recognize (or renders with a literal "#"). Fix both.
function normalizeHeadingMarks(content: string): string {
  return content.replace(/^(#{1,6})(?:[ \t]*#+)*[ \t]*(?=\S)/gm, "$1 ");
}

// Same heuristic as MarkdownRenderer reading variant: lines that look like
// titles (no explicit # heading anywhere in the content) become H3.
function autoHeadingCandidate(line: string): boolean {
  const t = line.trim();
  return (
    t.length >= 5 &&
    t.length <= 90 &&
    !/^[\s>|*+\-#`"'[(<]/.test(t) &&
    !/[.!?;:,)%…]$/.test(t) &&
    /^[A-ZÀ-Ý]/.test(t) &&
    t.split(/\s+/).length >= 2
  );
}

const INLINE_RE =
  /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|__[^_]+?__|`[^`\n]+`|\[[^\]]+\]\([^)]+\)|!\[[^\]]*\]\([^)]+\)|\([^()\n]{1,60}\)|"[^"\n]+"|\*[^*]+?\*|_[^_]+?_)/g;

function tokenize(text: string, timed = true): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), style: "normal", timed });
    }
    const token = match[0];
    let content = token;
    let style: InlineStyle = "normal";
    if (token.startsWith("***")) {
      style = "bolditalic";
      content = token.slice(3, -3);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      style = "bold";
      content = token.slice(2, -2);
    } else if (token.startsWith("`")) {
      style = "code";
      content = token.slice(1, -1);
    } else if (token.startsWith("![") || token.startsWith("[")) {
      style = token.startsWith("![") ? "normal" : "link";
      content = token.slice(token.startsWith("![") ? 2 : 1, token.indexOf("]("));
    } else if (token.startsWith("(")) {
      style = "paren";
    } else if (token.startsWith('"')) {
      style = "bolditalic";
      content = token.slice(1, -1);
    } else if (token.startsWith("*")) {
      style = "italic";
      content = token.slice(1, -1);
    } else if (token.startsWith("_")) {
      style = "italic";
      content = token.slice(1, -1);
    }
    if (content) {
      segments.push({ text: content, style, timed });
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), style: "normal", timed });
  }
  return segments;
}

function parseContent(content: string): ParsedPara[] {
  const cleaned = normalizeHeadingMarks(cleanHtmlArtifacts(content));
  const blocks = cleaned.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const paras: ParsedPara[] = [];
  const hasExplicitHeading = /^#{2,6}\s/m.test(cleaned);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    // Fenced code block -> shown untimed (TTS skips it)
    if (lines[0].startsWith("```") || lines[0].startsWith("~~~")) {
      const fence = lines[0];
      const codeLines: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === fence.replace(/^(`{3,}|~{3,})/, "$1") || lines[i].trim().startsWith(fence[0].repeat(3))) {
          break;
        }
        codeLines.push(lines[i]);
      }
      paras.push({ kind: "codeblock", text: codeLines.join("\n"), segments: [] });
      continue;
    }

    // Horizontal rule
    if (lines.length === 1 && /^[-*_]{3,}$/.test(lines[0])) {
      paras.push({ kind: "hr", text: "", segments: [] });
      continue;
    }

    // Blockquote
    if (lines.every((l) => /^>/.test(l))) {
      const text = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
      paras.push({ kind: "blockquote", text, segments: tokenize(text) });
      continue;
    }

    // List items (one timed paragraph per item)
    if (lines.every((l) => /^\s*[-*+]\s+/.test(l) || /^\s*\d+\.\s+/.test(l))) {
      for (const line of lines) {
        const text = line.replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+\.\s+/, "");
        paras.push({ kind: "li", text, segments: tokenize(text) });
      }
      continue;
    }

    const text = lines.join(" ");

    // Markdown heading
    const headingMatch = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(text);
    if (headingMatch) {
      paras.push({
        kind: `h${headingMatch[1].length}` as ParaKind,
        text: headingMatch[2],
        segments: tokenize(headingMatch[2]),
      });
      continue;
    }

    // Auto-heading (reading variant heuristic)
    if (!hasExplicitHeading && autoHeadingCandidate(lines[0])) {
      paras.push({ kind: "h3", text, segments: tokenize(text) });
      continue;
    }

    paras.push({ kind: "p", text, segments: tokenize(text) });
  }

  return paras;
}

const normalizeWord = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");

// Guard against pathological input sizes (a manually-pasted huge chapter): full O(n*m)
// DP alignment stays well under this for any real chapter (hundreds of words).
const MAX_DP_CELLS = 4_000_000;

/**
 * Longest Common Subsequence between two normalized-word sequences, computed as a
 * classic DP table over "match" (equal words) transitions only â€” a mismatch is never
 * treated as a substitution, it's left unmatched (word.start left to interpolation).
 * This avoids ever pinning a word to the wrong timestamp just because two unrelated
 * words happen to sit at the same position after a drift.
 *
 * Returns, per content-word index, the matched whisper-word index, or -1.
 */
function lcsMatch(contentKeys: string[], whisperKeys: string[]): number[] {
  const n = contentKeys.length;
  const m = whisperKeys.length;
  const matches = new Array<number>(n).fill(-1);
  if (n === 0 || m === 0) return matches;

  if ((n + 1) * (m + 1) > MAX_DP_CELLS) {
    return greedyMatch(contentKeys, whisperKeys);
  }

  const width = m + 1;
  const dp = new Int16Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    const rowCur = i * width;
    const rowNext = (i + 1) * width;
    for (let j = m - 1; j >= 0; j--) {
      if (contentKeys[i] && contentKeys[i] === whisperKeys[j]) {
        dp[rowCur + j] = dp[rowNext + j + 1] + 1;
      } else {
        const down = dp[rowNext + j];
        const right = dp[rowCur + j + 1];
        dp[rowCur + j] = down >= right ? down : right;
      }
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (contentKeys[i] && contentKeys[i] === whisperKeys[j]) {
      matches[i] = j;
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + (j + 1)]) {
      i++;
    } else {
      j++;
    }
  }
  return matches;
}

// Fallback for the (unrealistic) oversized-input case: same idea as the old
// heuristic, kept only as a safety net so the page never hangs.
function greedyMatch(contentKeys: string[], whisperKeys: string[]): number[] {
  const matches = new Array<number>(contentKeys.length).fill(-1);
  let j = 0;
  for (let i = 0; i < contentKeys.length && j < whisperKeys.length; i++) {
    const key = contentKeys[i];
    if (!key) continue;
    for (let look = 0; look < 6 && j + look < whisperKeys.length; look++) {
      if (whisperKeys[j + look] === key) {
        matches[i] = j + look;
        j = j + look + 1;
        break;
      }
    }
  }
  return matches;
}

function sumChars(words: RawWord[], from: number, to: number): number {
  let sum = 0;
  for (let i = from; i < to; i++) sum += Math.max(1, words[i].text.length);
  return sum;
}

// Distributes word slots [from, to) across the time window [start, end), proportionally
// to each word's character length (a longer word is assumed to take longer to say than
// a short one) â€” a much closer approximation of natural speech pacing than splitting the
// window evenly, and it self-corrects at every matched anchor so drift never accumulates.
function distributeByLength(result: WordTiming[], from: number, to: number, start: number, end: number) {
  if (to <= from) return;
  const span = Math.max(0, end - start);
  const chars: number[] = [];
  let total = 0;
  for (let i = from; i < to; i++) {
    const c = Math.max(1, result[i].text.length);
    chars.push(c);
    total += c;
  }
  let cursor = start;
  for (let i = from; i < to; i++) {
    const dur = total > 0 ? (chars[i - from] / total) * span : span / (to - from);
    result[i].start = cursor;
    result[i].end = cursor + dur;
    cursor += dur;
  }
}

/**
 * Aligns the words the reader sees (`flatWords`, in reading order) against the
 * word-level timestamps Whisper produced for the generated audio (`wordTimings`).
 *
 * Whisper's transcript of the TTS audio rarely matches the source text 1:1 (a clipped
 * word, a number read as digits, punctuation attached differently, ...), so instead of
 * assuming a 1:1 index correspondence we:
 *  1. Find the optimal (order-preserving) set of exact-word anchors via LCS.
 *  2. Interpolate every word that falls between two anchors proportionally to its
 *     character length, using the *actual* observed audio duration for that gap.
 *  3. Extrapolate words before the first anchor / after the last one using the average
 *     seconds-per-character rate measured from the matched anchors.
 * Every word ends up with a start/end, so playback highlighting is always continuous.
 */
function alignWordTimings(
  flatWords: RawWord[],
  wordTimings: { word: string; start: number; end: number }[]
): WordTiming[] {
  const n = flatWords.length;
  const result: WordTiming[] = flatWords.map((w) => ({ text: w.text, paragraph: w.paragraph, start: 0, end: 0 }));
  if (n === 0 || wordTimings.length === 0) return result;

  const contentKeys = flatWords.map((w) => normalizeWord(w.text));
  const whisperKeys = wordTimings.map((w) => normalizeWord(w.word));
  const matches = lcsMatch(contentKeys, whisperKeys);

  const anchors = matches
    .map((wi, ci) => (wi >= 0 ? { ci, start: wordTimings[wi].start, end: wordTimings[wi].end } : null))
    .filter((a): a is { ci: number; start: number; end: number } => a !== null);

  if (anchors.length === 0) {
    // No reliable anchor at all: spread proportionally across the whole audio span.
    const globalStart = wordTimings[0].start;
    const globalEnd = wordTimings[wordTimings.length - 1].end;
    distributeByLength(result, 0, n, globalStart, globalEnd);
    return result;
  }

  const totalChars = anchors.reduce((sum, a) => sum + Math.max(1, flatWords[a.ci].text.length), 0);
  const totalSpan = anchors[anchors.length - 1].end - anchors[0].start;
  const secPerChar = totalChars > 0 && totalSpan > 0 ? totalSpan / totalChars : 0.06;

  const first = anchors[0];
  if (first.ci > 0) {
    const leadChars = sumChars(flatWords, 0, first.ci);
    const estDuration = Math.min(first.start, leadChars * secPerChar);
    distributeByLength(result, 0, first.ci, Math.max(0, first.start - estDuration), first.start);
  }
  result[first.ci].start = first.start;
  result[first.ci].end = first.end;

  for (let k = 1; k < anchors.length; k++) {
    const prev = anchors[k - 1];
    const cur = anchors[k];
    result[cur.ci].start = cur.start;
    result[cur.ci].end = cur.end;
    if (cur.ci - prev.ci > 1) {
      distributeByLength(result, prev.ci + 1, cur.ci, prev.end, cur.start);
    }
  }

  const last = anchors[anchors.length - 1];
  if (last.ci < n - 1) {
    const tailChars = sumChars(flatWords, last.ci + 1, n);
    distributeByLength(result, last.ci + 1, n, last.end, last.end + tailChars * secPerChar);
  }

  return result;
}

export default function KaraokeView({
  content,
  currentTime,
  wordTimings,
  pinnedIndex,
  onWordClick,
}: KaraokeViewProps) {
  const paras = useMemo(() => parseContent(content), [content]);

  const flatWords = useMemo<RawWord[]>(() => {
    const words: RawWord[] = [];
    paras.forEach((para, pi) => {
      for (const seg of para.segments) {
        if (!seg.timed) continue;
        for (const w of seg.text.split(/\s+/).filter(Boolean)) {
          words.push({ text: w, paragraph: pi });
        }
      }
    });
    return words;
  }, [paras]);

  const timedWords = useMemo<WordTiming[]>(
    () => alignWordTimings(flatWords, wordTimings),
    [flatWords, wordTimings]
  );

  const activeIndex = useMemo(() => {
    if (pinnedIndex != null && pinnedIndex >= 0 && pinnedIndex < timedWords.length) {
      return pinnedIndex;
    }
    return timedWords.findIndex((word) => word.start <= currentTime && currentTime < word.end);
  }, [timedWords, currentTime, pinnedIndex]);

  const activeParagraph = activeIndex >= 0 ? timedWords[activeIndex].paragraph : -1;
  const paraRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (activeParagraph >= 0) {
      paraRefs.current[activeParagraph]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeParagraph]);

  const wordsByPara = useMemo(() => {
    const grouped: WordTiming[][] = paras.map(() => []);
    timedWords.forEach((w) => grouped[w.paragraph].push(w));
    return grouped;
  }, [paras, timedWords]);

  let flatWordIdx = 0;

  const renderSegments = (para: ParsedPara, pi: number) => {
    const paraWords = wordsByPara[pi];
    let wordIdxInPara = 0;
    const elements: React.ReactNode[] = [];

    for (const seg of para.segments) {
      if (!seg.timed) continue;
      const segWords = seg.text.split(/\s+/).filter(Boolean);
      for (const w of segWords) {
        const timing = paraWords[wordIdxInPara];
        const isActive = flatWordIdx === activeIndex;
        const flatIdx = flatWordIdx;
        flatWordIdx += 1;
        wordIdxInPara += 1;
        elements.push(
          <span
            key={`${pi}-${flatIdx}`}
            role="button"
            tabIndex={0}
            onClick={() => onWordClick?.(w, timing.start, flatIdx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onWordClick?.(w, timing.start, flatIdx);
              }
            }}
            className={cn(
              "cursor-pointer rounded-sm transition-colors duration-150",
              STYLE_CLASSES[seg.style],
              isActive && ACTIVE_CLASS
            )}
          >
            {w}{" "}
          </span>
        );
      }
    }
    return elements;
  };

  return (
    <div className="break-words space-y-0">
      {paras.map((para, pi) => {
        if (para.kind === "hr") {
          return <hr key={pi} className="my-6 sm:my-8 border-border" />;
        }
        if (para.kind === "codeblock") {
          return (
            <pre
              key={pi}
              ref={(el) => {
                paraRefs.current[pi] = el;
              }}
              className={CODEBLOCK_CLASS}
            >
              {para.text}
            </pre>
          );
        }
        if (para.kind === "blockquote") {
          return (
            <blockquote
              key={pi}
              ref={(el) => {
                paraRefs.current[pi] = el;
              }}
              className={BLOCKQUOTE_CLASS}
            >
              {para.segments.length > 0 ? renderSegments(para, pi) : para.text}
            </blockquote>
          );
        }
        if (para.kind === "li") {
          return (
            <p
              key={pi}
              ref={(el) => {
                paraRefs.current[pi] = el;
              }}
              className="flex gap-2 ml-4 sm:ml-6 mb-2"
            >
              <span className="text-primary shrink-0">•</span>
              <span className={PARAGRAPH_CLASS}>
                {para.segments.length > 0 ? renderSegments(para, pi) : para.text}
              </span>
            </p>
          );
        }
        if (para.kind.startsWith("h")) {
          const Tag = HEADING_TAGS[para.kind];
          return (
            <Tag
              key={pi}
              ref={(el: HTMLElement | null) => {
                paraRefs.current[pi] = el;
              }}
              className={cn(HEADING_CLASSES[para.kind], para.segments.length === 0 && "text-transparent")}
            >
              {para.segments.length > 0 ? renderSegments(para, pi) : para.text}
            </Tag>
          );
        }
        return (
          <p
            key={pi}
            ref={(el) => {
              paraRefs.current[pi] = el;
            }}
            className={PARAGRAPH_CLASS}
          >
            {para.segments.length > 0 ? renderSegments(para, pi) : para.text}
          </p>
        );
      })}
    </div>
  );
}
