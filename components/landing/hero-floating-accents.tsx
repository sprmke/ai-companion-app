import { Brain, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroFloatingAccents() {
  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute z-30',
          'top-[21%] -right-4 sm:-right-6 md:-right-8',
          'rotate-2 animate-float'
        )}
      >
        <div className="flex items-center gap-2.5 rounded-2xl border border-chart-2/25 bg-card/95 px-3.5 py-2.5 shadow-elevated-lg backdrop-blur-md">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chart-2/15">
            <Zap className="h-4 w-4 text-chart-2" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground">
              Response time
            </p>
            <p className="text-sm font-bold text-chart-2">&lt; 2 seconds</p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-30',
          'top-[8%] -right-4 sm:-right-6 md:-right-8',
          'animate-float'
        )}
        style={{ animationDelay: '2.2s' }}
      >
        <div className="flex items-center gap-2.5 rounded-2xl border border-primary/25 bg-card/95 px-3.5 py-2.5 shadow-elevated-lg backdrop-blur-md">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12">
            <Brain className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground">
              Active companions
            </p>
            <p className="text-sm font-bold text-foreground">12+ personas</p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-30',
          'bottom-[18%] -left-4 sm:-left-6',
          'animate-float'
        )}
        style={{ animationDelay: '1.1s' }}
      >
        <div className="flex items-center gap-2.5 rounded-2xl border border-chart-4/25 bg-card/95 px-3.5 py-2.5 shadow-elevated-lg backdrop-blur-md">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chart-4/12">
            <Sparkles className="h-4 w-4 text-chart-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground">
              Multi-model AI
            </p>
            <p className="text-sm font-bold text-foreground">Gemini · GPT · Claude</p>
          </div>
        </div>
      </div>
    </>
  );
}
