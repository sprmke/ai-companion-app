import React, { useContext } from 'react';

import { ChevronRight, Lock, Sparkles, Zap } from 'lucide-react';

import { AssistantContext } from '@/context/AssistantContext';
import { PRO_PLAN_TOKENS, TOKEN_TOPUP_TOKENS } from '@/hooks/use-token-usage';
import { BlurFade } from '@/components/magicui/blur-fade';
import { cn } from '@/lib/utils';

interface ChatEmptyUIProps {
  onSuggestionClick: (suggestion: string) => void;
  mobile?: boolean;
  isOutOfCredits?: boolean;
  isPro?: boolean;
}

function ChatEmptyUI({
  onSuggestionClick,
  mobile = false,
  isOutOfCredits = false,
  isPro = false,
}: ChatEmptyUIProps) {
  const { assistant } = useContext(AssistantContext);

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 scrollbar-hide sm:px-6',
        mobile
          ? 'max-h-[calc(100vh-60px-64px-120px)]'
          : 'max-h-[calc(100vh-76px-60px)]'
      )}
    >
      <div
        className={cn(
          'icon-well-lg mb-6',
          isOutOfCredits
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/12 text-primary'
        )}
      >
        {isOutOfCredits ? (
          <Zap className="h-7 w-7" />
        ) : (
          <Sparkles className="h-7 w-7" />
        )}
      </div>
      <h2 className="landing-gradient-text text-center text-3xl font-bold sm:text-4xl">
        {isOutOfCredits
          ? isPro
            ? 'Monthly token limit reached'
            : "You're out of tokens"
          : 'How can I assist you?'}
      </h2>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        {isOutOfCredits
          ? isPro
            ? `You've used your Pro allowance for this month. Buy a ${TOKEN_TOPUP_TOKENS.toLocaleString()}-token top-up from your account, or wait for your subscription to renew.`
            : 'Upgrade to Pro for 10,000 tokens per month, or buy a one-time token top-up from your account.'
          : assistant?.name
            ? `${assistant.name} is ready. Pick a suggestion or type your own message.`
            : 'Pick a suggestion or type your own message.'}
      </p>

      <div className="mt-8 w-full max-w-lg">
        {assistant?.sampleQuestions
          ?.filter((suggestion) => suggestion.trim())
          .map((suggestion: string, index: number) => (
            <BlurFade key={index} delay={0.15 * index}>
              <button
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className={cn(
                  'group mb-2 flex w-full cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200',
                  isOutOfCredits
                    ? 'cursor-pointer border-border/30 bg-muted/10 text-muted-foreground/50 hover:border-primary/25 hover:bg-muted/20'
                    : 'border-border/50 bg-muted/20 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30 dark:bg-background/70 dark:hover:bg-background/90'
                )}
              >
                <span className={cn(isOutOfCredits && 'line-clamp-1')}>
                  {suggestion}
                </span>
                {isOutOfCredits ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                )}
              </button>
            </BlurFade>
          )
        )}
      </div>
    </div>
  );
}

export default ChatEmptyUI;
