'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { useTheme } from 'next-themes';

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const rawId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'var(--font-plus-jakarta, sans-serif)',
        });

        // Mermaid requires a valid CSS id (no colons from useId)
        const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, rawId]);

  if (error) {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-border/50">
        <div className="border-b border-border/40 bg-muted/60 px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
          mermaid
        </div>
        <pre className="overflow-x-auto p-3 text-xs text-muted-foreground">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 flex justify-center overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-4 [&_svg]:max-w-full"
    />
  );
}
