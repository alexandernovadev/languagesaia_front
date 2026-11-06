/**
 * RichText — renders the small Markdown the AI writes (**bold**, *italic*,
 * `code`, bullet/numbered lists, paragraphs) as safe React elements. A
 * pronunciation between slashes, like /θred/, a short "quoted" word and a
 * short (aside) stand out.
 * No HTML injection: it only builds known elements.
 *
 * `highlight` marks every occurrence of a word (e.g. the word being studied
 * inside its examples) with a pastel underline.
 *
 * @example
 *   <RichText text={message.content} />
 *   <RichText text={example} highlight="serendipity" />
 */
import { Fragment, type ReactNode } from "react";
import { cx } from "../types";
import styles from "./RichText.module.css";

function inline(text: string, highlight?: string, keyBase = ""): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|(?<![\w/:.])\/[^\s/][^/\n]{0,40}\/(?![\w/])|"[^"\n]{1,40}"|“[^”\n]{1,40}”|(?<![\w\]])\([^()\n]{1,60}\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  const pushText = (t: string) => {
    if (!highlight) return out.push(t);
    const parts = t.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*)`, "gi"));
    parts.forEach((p, j) =>
      j % 2 ? (
        out.push(
          <mark key={`${keyBase}h${i}-${j}`} className={styles.hl}>
            {p}
          </mark>,
        )
      ) : p ? out.push(p) : null,
    );
  };
  while ((m = re.exec(text))) {
    if (m.index > last) pushText(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{inline(tok.slice(2, -2), highlight, k)}</strong>);
    else if (tok.startsWith("/") || /^`\/.+\/`$/.test(tok)) out.push(<span key={k} className={styles.ipa}>{tok.replace(/`/g, "")}</span>);
    else if (tok.startsWith('"') || tok.startsWith("“")) {
      out.push(
        <em key={k} className={styles.quote}>
          {tok[0]}
          {inline(tok.slice(1, -1), highlight, k)}
          {tok.at(-1)}
        </em>,
      );
    } else if (tok.startsWith("(")) {
      out.push(
        <span key={k} className={styles.aside}>
          ({inline(tok.slice(1, -1), highlight, k)})
        </span>,
      );
    } else if (tok.startsWith("`")) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else out.push(<em key={k}>{inline(tok.slice(1, -1), highlight, k)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) pushText(text.slice(last));
  return out;
}

export function RichText({ text, highlight, className }: { text: string; highlight?: string; className?: string }) {
  // a heading is its own block, even with text right below it
  const blocks = text.replace(/^#{1,6}\s+.*$/gm, "\n\n$&\n\n").trim().split(/\n{2,}/);
  return (
    <div className={cx(styles.root, className)}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        // horizontal rule
        if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(block)) return <hr key={bi} />;
        // heading
        const h = /^(#{1,6})\s+(.*)$/.exec(block);
        if (h && lines.length === 1) return <p key={bi} className={styles.heading}>{inline(h[2], highlight, `${bi}`)}</p>;
        // table: every line starts with "|"
        if (lines.length >= 2 && lines.every((l) => l.trim().startsWith("|"))) {
          const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
          // drop the "|---|:--:|" separator row
          const rows = lines.filter((l) => !/^\s*\|?[\s:|-]+\|?\s*$/.test(l));
          const [head, ...body] = rows.map(cells);
          return (
            <div key={bi} className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>{head.map((c, ci) => <th key={ci}>{inline(c, highlight, `${bi}h${ci}`)}</th>)}</tr>
                </thead>
                <tbody>
                  {body.map((r, ri) => (
                    <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c, highlight, `${bi}-${ri}-${ci}`)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          const ordered = /^\s*\d/.test(lines[0]);
          const items = lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), highlight, `${bi}-${li}`)}</li>);
          return ordered ? <ol key={bi}>{items}</ol> : <ul key={bi}>{items}</ul>;
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, highlight, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
