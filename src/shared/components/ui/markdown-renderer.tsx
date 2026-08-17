import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/utils/common/classnames";
import { deliveryImageUrl } from "@/utils/common";

function cleanHtmlArtifacts(content: string): string {
  return content
    .replace(/<\/?p\s*\/?>/gi, "")
    .replace(/<\/?div\s*\/?>/gi, "")
    .replace(/<br\s*\/?>/gi, "");
}

// GFM requires table rows to be on consecutive lines; some AI-generated
// content puts a blank line between every row, which breaks table parsing.
// This joins pipe-delimited rows that are only separated by blank lines.
function collapseBrokenTableRows(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      const prev = result[result.length - 1];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      const next = lines[j];
      if (prev?.includes("|") && next?.includes("|")) {
        continue;
      }
    }
    result.push(line);
  }
  return result.join("\n");
}

// Double-quoted text (e.g. example sentences) should render as bold italic.
// Code spans/blocks are left untouched so quotes inside code aren't affected.
function emphasizeQuotedText(content: string): string {
  const segments = content.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  return segments
    .map((segment, idx) => {
      const isCode = idx % 2 === 1;
      if (isCode) return segment;
      return segment.replace(/"([^"\n]+)"/g, "***$1***");
    })
    .join("");
}

// Short parenthetical glosses (e.g. "take over (assume control)") are
// highlighted in bold blue. Skips code spans/blocks and markdown link
// targets like [text](url), which also use parentheses.
function highlightParentheticals(content: string): string {
  const segments = content.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  return segments
    .map((segment, idx) => {
      const isCode = idx % 2 === 1;
      if (isCode) return segment;
      return segment.replace(
        /(?<!\])\(([^()\n]{1,60})\)/g,
        '<span class="text-blue-600 dark:text-blue-400 font-bold">($1)</span>'
      );
    })
    .join("");
}

const TABLE_DELIMITER_ROW = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function findTableLineIndices(lines: string[]): Set<number> {
  const tableLines = new Set<number>();
  for (let i = 1; i < lines.length; i++) {
    const delimiterCandidate = lines[i].trim();
    const headerCandidate = lines[i - 1].trim();
    if (
      delimiterCandidate.includes("|") &&
      TABLE_DELIMITER_ROW.test(delimiterCandidate) &&
      headerCandidate.length > 0
    ) {
      tableLines.add(i - 1);
      tableLines.add(i);
      let j = i + 1;
      while (j < lines.length && lines[j].trim().length > 0 && lines[j].includes("|")) {
        tableLines.add(j);
        j++;
      }
    }
  }
  return tableLines;
}

function addAutoHeadings(content: string): string {
  if (/^#{2,6}\s/m.test(content)) return content;
  const lines = content.split("\n");
  const tableLines = findTableLineIndices(lines);
  return lines
    .map((line, idx) => {
      if (tableLines.has(idx)) return line;
      const t = line.trim();
      if (
        t.length >= 5 &&
        t.length <= 90 &&
        !/^[\s>|*+\-#`"'[(<]/.test(t) &&
        !/[.!?;:,)%…]$/.test(t) &&
        /^[A-ZÀ-Ý]/.test(t) &&
        t.split(/\s+/).length >= 2
      ) {
        return `### ${t}`;
      }
      return line;
    })
    .join("\n");
}

interface MarkdownRendererProps {
  content: string;
  variant?: "chat" | "reading";
  className?: string;
  onWordClick?: (word: string) => void;
  clickableWords?: string[];
}

function processChildrenWithWordClick(
  children: React.ReactNode,
  onWordClick: (word: string) => void,
  clickableWordsSet?: Set<string>
): React.ReactNode {
  return React.Children.map(children, (child, idx) => {
    if (typeof child === "string") {
      const parts = child.split(/(\s+)/);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, i) => {
            const cleanWord = part.replace(/^\W+|\W+$/g, "");
            const isClickable =
              cleanWord.length >= 1 &&
              /^[a-zA-Z'-]+$/.test(cleanWord) &&
              (!clickableWordsSet || clickableWordsSet.has(cleanWord.toLowerCase()));
            if (isClickable) {
              return (
                <span
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWordClick(cleanWord);
                  }}
                  className="cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors inline"
                >
                  {part}
                </span>
              );
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
          })}
        </React.Fragment>
      );
    }
    if (React.isValidElement(child) && (child as React.ReactElement<any>).props.children != null) {
      return React.cloneElement(child as React.ReactElement<any>, {
        children: processChildrenWithWordClick(
          (child as React.ReactElement<any>).props.children,
          onWordClick,
          clickableWordsSet
        ),
      });
    }
    return child;
  });
}

export function MarkdownRenderer({
  content,
  variant = "reading",
  className,
  onWordClick,
  clickableWords,
}: MarkdownRendererProps) {
  const isReading = variant === "reading";
  const isChat = variant === "chat";

  const normalizedContent = isReading
    ? addAutoHeadings(
        highlightParentheticals(emphasizeQuotedText(collapseBrokenTableRows(cleanHtmlArtifacts(content))))
      )
    : highlightParentheticals(emphasizeQuotedText(collapseBrokenTableRows(content)));

  const clickableWordsSet = clickableWords?.length
    ? new Set(clickableWords.map((w) => w.toLowerCase()))
    : undefined;

  const wrapIfClickable = (children: React.ReactNode) =>
    onWordClick
      ? processChildrenWithWordClick(children, onWordClick, clickableWordsSet)
      : children;

  // Chat variant components (compact, primary colors)
  const chatComponents = {
    p: ({ children }: any) => <p className="mb-2 last:mb-0">{wrapIfClickable(children)}</p>,
    h1: ({ children }: any) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0 text-primary">{wrapIfClickable(children)}</h1>,
    h2: ({ children }: any) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-primary/90">{wrapIfClickable(children)}</h2>,
    h3: ({ children }: any) => <h3 className="text-sm font-semibold mb-2 mt-2 first:mt-0 text-primary/80">{wrapIfClickable(children)}</h3>,
    h4: ({ children }: any) => <h4 className="text-sm font-medium mb-2 mt-2 first:mt-0 text-primary/70">{wrapIfClickable(children)}</h4>,
    h5: ({ children }: any) => <h5 className="text-xs font-medium mb-2 mt-2 first:mt-0 text-primary/60">{wrapIfClickable(children)}</h5>,
    h6: ({ children }: any) => <h6 className="text-xs font-normal mb-2 mt-2 first:mt-0 text-primary/50">{wrapIfClickable(children)}</h6>,
    ul: ({ children }: any) => <ul className="list-disc list-outside mb-2 ml-4 space-y-1 [&>li>p>strong]:text-purple-600 [&>li>strong]:text-purple-600 dark:[&>li>p>strong]:text-purple-400 dark:[&>li>strong]:text-purple-400">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside mb-2 ml-4 space-y-1 [&>li>p>strong]:text-purple-600 [&>li>strong]:text-purple-600 dark:[&>li>p>strong]:text-purple-400 dark:[&>li>strong]:text-purple-400">{children}</ol>,
    li: ({ children }: any) => <li className="text-sm pl-1">{wrapIfClickable(children)}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-purple-600 dark:text-purple-400">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children, className: codeClassName }: any) => {
      const isInline = !codeClassName;
      return isInline ? (
        <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
      ) : (
        <code className="block bg-black/20 p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-primary/30 pl-3 my-2 italic">{children}</blockquote>
    ),
    a: ({ children, href }: any) => (
      <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="border-b border-border">{children}</tr>,
    th: ({ children }: any) => <th className="border border-border px-2 py-1 text-left text-xs font-semibold">{children}</th>,
    td: ({ children }: any) => <td className="border border-border px-2 py-1 text-xs">{children}</td>,
    img: ({ src, alt }: any) => (
      <img
        src={deliveryImageUrl(src)}
        alt={alt}
        className="my-2 rounded max-w-full h-auto"
      />
    ),
  };

  // Reading variant components (spacious, better readability)
  const readingComponents = {
    p: ({ children }: any) => <p className="mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">{wrapIfClickable(children)}</p>,
    h1: ({ children }: any) => (
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-8 first:mt-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 first:mt-0 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 mt-5 sm:mt-6 first:mt-0 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base sm:text-lg md:text-xl font-medium mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-sm sm:text-base font-normal mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
        {wrapIfClickable(children)}
      </h6>
    ),
    ul: ({ children }: any) => <ul className="list-disc list-outside mb-4 sm:mb-6 ml-4 sm:ml-6 space-y-2 text-base sm:text-lg">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside mb-4 sm:mb-6 ml-4 sm:ml-6 space-y-2 text-base sm:text-lg">{children}</ol>,
    li: ({ children }: any) => <li className="pl-2 text-base sm:text-lg leading-relaxed">{wrapIfClickable(children)}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-purple-600 dark:text-purple-400">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children, className: codeClassName }: any) => {
      const isInline = !codeClassName;
      return isInline ? (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm sm:text-base font-mono text-foreground">{children}</code>
      ) : (
        <code className="block bg-muted p-3 sm:p-4 rounded text-sm sm:text-base font-mono overflow-x-auto my-4 sm:my-6">
          {children}
        </code>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 sm:pl-6 my-4 sm:my-6 italic text-foreground/80 bg-muted/50 py-2 sm:py-3 rounded-r">
        {children}
      </blockquote>
    ),
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        className="text-primary underline hover:text-primary/80 transition-colors" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4 sm:my-6">
        <table className="min-w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="border-b border-border hover:bg-muted/50 transition-colors">{children}</tr>,
    th: ({ children }: any) => <th className="border border-border px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base font-semibold">{children}</th>,
    td: ({ children }: any) => <td className="border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">{children}</td>,
    hr: () => <hr className="my-6 sm:my-8 border-border" />,
    img: ({ src, alt }: any) => (
      <img 
        src={deliveryImageUrl(src)} 
        alt={alt} 
        className="my-4 sm:my-6 rounded-lg max-w-full h-auto"
      />
    ),
  };

  const components = isReading ? readingComponents : chatComponents;

  return (
    <div className={cn(
      "break-words",
      isReading && "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      isChat && "text-sm",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
