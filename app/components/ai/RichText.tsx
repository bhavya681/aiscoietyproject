"use client";

import { type ReactNode } from "react";

const INLINE_TOKEN = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
const BULLET_LINE = /^[-*•]\s+/;
const NUMBERED_LINE = /^\d+[.)]\s+/;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_TOKEN.lastIndex = 0;

  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong
          key={`${keyPrefix}-bold-${tokenIndex++}`}
          className="font-semibold text-foreground"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${tokenIndex++}`}
          className="rounded-md bg-black/[0.06] px-1.5 py-0.5 font-mono text-[0.9em] text-foreground dark:bg-white/[0.09]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = INLINE_TOKEN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let list: { ordered: boolean; items: string[] } | null = null;
  let blockKey = 0;

  function flushList() {
    if (!list) {
      return;
    }

    const { ordered, items } = list;
    const key = `list-${blockKey++}`;
    const content = items.map((item, index) => (
      <li key={`${key}-${index}`} className="pl-1">
        {renderInline(item, `${key}-${index}`)}
      </li>
    ));

    blocks.push(
      ordered ? (
        <ol
          key={key}
          className="ml-4 list-decimal space-y-1 marker:text-muted-foreground"
        >
          {content}
        </ol>
      ) : (
        <ul
          key={key}
          className="ml-4 list-disc space-y-1 marker:text-primary"
        >
          {content}
        </ul>
      )
    );

    list = null;
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (BULLET_LINE.test(trimmed)) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }

      list.items.push(trimmed.replace(BULLET_LINE, ""));
      return;
    }

    if (NUMBERED_LINE.test(trimmed)) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }

      list.items.push(trimmed.replace(NUMBERED_LINE, ""));
      return;
    }

    flushList();

    if (!trimmed) {
      blocks.push(
        <div key={`space-${index}`} className="h-2" aria-hidden />
      );
      return;
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInline(trimmed, `paragraph-${index}`)}
      </p>
    );
  });

  flushList();

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>{blocks}</div>
  );
}
