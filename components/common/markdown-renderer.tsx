'use client';

import { memo } from 'react';

import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/components/common/code-block';
import { MermaidDiagram } from '@/components/common/mermaid-diagram';
import { cn } from '@/lib/utils';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1] ?? '';
    const value = String(children).replace(/\n$/, '');

    // Inline code (no language fence and single line)
    const isInline = !className && !value.includes('\n');
    if (isInline) {
      return (
        <code
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground before:content-none after:content-none"
          {...props}
        >
          {children}
        </code>
      );
    }

    if (language === 'mermaid') {
      return <MermaidDiagram chart={value} />;
    }

    return <CodeBlock language={language} value={value} />;
  },
  // Code blocks are handled by the `code` renderer above; avoid the default
  // <pre> wrapper adding extra styling/padding.
  pre({ children }) {
    return <>{children}</>;
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (!src || typeof src !== 'string') return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ''}
        className="my-2 max-h-80 max-w-full rounded-lg border border-border/40 object-contain"
      />
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-xl border border-border/50">
        <table className="my-0 w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border-b border-border/50 bg-muted/50 px-3 py-2 text-left font-semibold">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border-b border-border/30 px-3 py-2">{children}</td>;
  },
};

function MarkdownRendererImpl({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none min-w-0 break-words dark:prose-invert',
        'prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:bg-transparent prose-pre:p-0',
        'prose-headings:scroll-m-20 prose-headings:font-semibold',
        'prose-p:leading-relaxed prose-li:leading-relaxed',
        'prose-code:break-words prose-code:font-mono',
        'prose-a:break-all',
        className
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererImpl);
