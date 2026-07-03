'use client';

import { Plus, RotateCcw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MAX_SAMPLE_QUESTIONS,
  MIN_SAMPLE_QUESTIONS,
  normalizeSampleQuestions,
  toEditableSampleQuestions,
} from '@/lib/sample-questions';
import { cn } from '@/lib/utils';

type SampleQuestionsEditorProps = {
  value: string[];
  onChange: (questions: string[]) => void;
  /** When set, Reset restores to this snapshot (e.g. values when the modal opened). */
  resetValue?: string[];
  className?: string;
};

function questionsMatch(a: string[], b: string[]): boolean {
  return (
    JSON.stringify(normalizeSampleQuestions(a)) ===
    JSON.stringify(normalizeSampleQuestions(b))
  );
}

export function SampleQuestionsEditor({
  value,
  onChange,
  resetValue,
  className,
}: SampleQuestionsEditorProps) {
  const items = toEditableSampleQuestions(value);
  const canReset =
    resetValue !== undefined && !questionsMatch(value, resetValue);

  const updateItem = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const addItem = () => {
    if (items.length >= MAX_SAMPLE_QUESTIONS) return;
    onChange([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length <= MIN_SAMPLE_QUESTIONS) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const resetItems = () => {
    if (resetValue === undefined) return;
    onChange(toEditableSampleQuestions(resetValue));
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/40 bg-muted/20 p-4',
        className
      )}
    >
      <ul className="space-y-3">
        {items.map((question, index) => (
          <li
            key={index}
            className="flex items-center gap-1 rounded-xl border border-border/40 bg-background/60 pr-1 shadow-sm transition-colors focus-within:border-primary/35 focus-within:ring-2 focus-within:ring-ring/25"
          >
            <span
              className="flex h-11 w-8 shrink-0 items-center justify-center text-xs font-semibold tabular-nums text-muted-foreground"
              aria-hidden
            >
              {index + 1}
            </span>
            <Input
              value={question}
              placeholder={`Suggestion ${index + 1}`}
              className="h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => updateItem(index, e.target.value)}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={items.length <= MIN_SAMPLE_QUESTIONS}
              aria-label={`Remove suggestion ${index + 1}`}
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-3">
        {resetValue !== undefined && (
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-2 border-destructive/45 bg-destructive/5 text-sm font-medium text-muted-foreground shadow-none hover:border-destructive/70 hover:bg-destructive/10 hover:text-destructive"
            disabled={!canReset}
            onClick={resetItems}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-11 rounded-xl border-2 border-primary/45 bg-primary/5 text-sm font-medium text-muted-foreground shadow-none hover:border-primary/65 hover:bg-primary/10 hover:text-primary',
            resetValue !== undefined ? 'flex-1' : 'w-full'
          )}
          disabled={items.length >= MAX_SAMPLE_QUESTIONS}
          onClick={addItem}
        >
          <Plus className="h-4 w-4" />
          Add suggestion
          {items.length < MAX_SAMPLE_QUESTIONS && (
            <span className="opacity-80">
              ({items.length}/{MAX_SAMPLE_QUESTIONS})
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
