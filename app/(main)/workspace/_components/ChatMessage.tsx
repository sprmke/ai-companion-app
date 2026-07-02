'use client';

import Image from 'next/image';

import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { ChatThinkingIndicator } from '@/components/common/skeleton-loaders';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  assistantImage?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
};

function ChatMessage({
  role,
  content,
  images,
  assistantImage,
  isLoading,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === 'user';

  // Before the first token arrives mid-stream, show the thinking indicator.
  if (((isLoading && !isUser) || (isStreaming && !content)) && !isUser) {
    return <ChatThinkingIndicator assistantImage={assistantImage} />;
  }

  return (
    <div
      className={cn(
        'mb-4 flex w-full min-w-0',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {isUser ? (
        <div className="min-w-0 max-w-[85%] overflow-hidden rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm animate-in fade-in duration-200">
          {images && images.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Attachment ${i + 1}`}
                  className="max-h-48 max-w-full rounded-lg object-contain"
                />
              ))}
            </div>
          )}
          {content && (
            <p className="break-words whitespace-pre-wrap">{content}</p>
          )}
        </div>
      ) : (
        <div className="flex w-full min-w-0 animate-in fade-in duration-200 gap-3">
          {assistantImage && (
            <Image
              src={assistantImage}
              alt="Assistant"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-primary/15"
            />
          )}
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl rounded-bl-md border border-border/40 bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
            {images && images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Attachment ${i + 1}`}
                    className="max-h-48 max-w-full rounded-lg object-contain"
                  />
                ))}
              </div>
            )}
            <MarkdownRenderer content={content} />
            {isStreaming && content && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-current align-text-bottom" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
