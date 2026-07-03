'use client';

import { ChevronRight } from 'lucide-react';

import { normalizeSampleQuestions } from '@/lib/sample-questions';
import { cn } from '@/lib/utils';

type SidebarQuickSuggestionsProps = {
  questions: string[] | undefined;
  onSelect: (question: string) => void;
  disabled?: boolean;
  className?: string;
};

export function SidebarQuickSuggestions({
  questions,
  onSelect,
  disabled = false,
  className,
}: SidebarQuickSuggestionsProps) {
  const items = normalizeSampleQuestions(questions);
  if (items.length === 0) return null;

  return (
    <div className={cn('mt-3', className)}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Quick suggestions
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((question, index) => (
          <li key={`${index}-${question.slice(0, 24)}`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(question)}
              className="group flex w-full items-start gap-2 rounded-xl border border-border/35 bg-background/40 px-3 py-2 text-left text-xs leading-snug text-muted-foreground transition-colors hover:border-primary/30 hover:bg-background/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="line-clamp-2 min-w-0 flex-1">{question}</span>
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
