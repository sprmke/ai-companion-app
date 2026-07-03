'use client';

import { useState } from 'react';

import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

import { cn } from '@/lib/utils';

type CodeBlockProps = {
  language: string;
  value: string;
};

export function CodeBlock({ language, value }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — ignore
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="group relative my-3 max-w-full overflow-hidden rounded-xl border border-border/50">
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            background: 'transparent',
            fontSize: '13px',
            padding: '0.875rem 1rem',
            minWidth: 'min-content',
          }}
          codeTagProps={{
            style: { fontFamily: 'var(--font-geist-mono, monospace)' },
          }}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
