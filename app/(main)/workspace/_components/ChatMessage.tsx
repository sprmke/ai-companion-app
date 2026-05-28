import Image from 'next/image';

import Markdown from 'react-markdown';

import { ChatTypingSkeleton } from '@/components/common/skeleton-loaders';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  assistantImage?: string;
  isLoading?: boolean;
};

function ChatMessage({
  role,
  content,
  assistantImage,
  isLoading,
}: ChatMessageProps) {
  const isUser = role === 'user';

  if (isLoading && !isUser) {
    return <ChatTypingSkeleton assistantImage={assistantImage} />;
  }

  return (
    <div
      className={cn('mb-4 flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex max-w-[85%] gap-3', isUser && 'flex-row-reverse')}>
        {!isUser && assistantImage && (
          <Image
            src={assistantImage}
            alt="Assistant"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-primary/15"
          />
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border border-border/40 bg-muted/50 text-foreground'
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
