import React, { useContext } from 'react';

import { ChevronRight, Sparkles } from 'lucide-react';

import { AssistantContext } from '@/context/AssistantContext';
import { BlurFade } from '@/components/magicui/blur-fade';
import { cn } from '@/lib/utils';

interface ChatEmptyUIProps {
  onSuggestionClick: (suggestion: string) => void;
  mobile?: boolean;
}

function ChatEmptyUI({ onSuggestionClick, mobile = false }: ChatEmptyUIProps) {
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
      <div className="icon-well-lg mb-6 bg-primary/12 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="landing-gradient-text text-center text-3xl font-bold sm:text-4xl">
        How can I assist you?
      </h2>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        {assistant?.name
          ? `${assistant.name} is ready. Pick a suggestion or type your own message.`
          : 'Pick a suggestion or type your own message.'}
      </p>

      <div className="mt-8 w-full max-w-lg">
        {assistant?.sampleQuestions?.map(
          (suggestion: string, index: number) => (
            <BlurFade key={index} delay={0.15 * index}>
              <button
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="group mb-2 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border/50 bg-muted/20 px-5 py-4 text-left text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/30 dark:bg-background/70 dark:hover:bg-background/90"
              >
                <span>{suggestion}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            </BlurFade>
          )
        )}
      </div>
    </div>
  );
}

export default ChatEmptyUI;
