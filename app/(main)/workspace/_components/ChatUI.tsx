'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import axios from 'axios';

import Image from 'next/image';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AssistantContext } from '@/context/AssistantContext';
import { AuthContext } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import ChatEmptyUI from '@/app/(main)/workspace/_components/ChatEmptyUI';
import ChatMessage from '@/app/(main)/workspace/_components/ChatMessage';

import { resolveAiModelId } from '@/services/AiModelOptions';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function ChatUI({ mobile = false }: { mobile?: boolean }) {
  const { assistant } = useContext(AssistantContext);
  const { user, setUser } = useContext(AuthContext);

  const updateUserTokens = useMutation(api.users.UpdateUserTokens);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isChatDisabled = isLoading || (user?.credits ?? 0) <= 0;

  const onSuggestionClick = (suggestion: string) => {
    if (!suggestion.trim()) return;
    onSendMessage(suggestion);
  };

  const onSendMessage = async (suggestionMessage?: string) => {
    if (!assistant) return;

    const finalMessage = suggestionMessage || message;
    if (!finalMessage.trim()) return;

    const modelId = resolveAiModelId(assistant.aiModelId);

    const systemInstruction = [assistant.instruction, assistant.userInstruction]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join('\n\n');

    const conversationMessages = [
      ...(systemInstruction
        ? [{ role: 'system' as const, content: systemInstruction }]
        : []),
      ...messages,
      { role: 'user' as const, content: finalMessage },
    ];

    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: finalMessage },
    ]);

    if (!suggestionMessage) setMessage('');

    try {
      const result = await axios.post('/api/eden-ai-model', {
        modelId,
        messages: conversationMessages,
      });

      setMessages((prevMessages) => [...prevMessages, { ...result.data }]);
      updateUserCredits(result.data.content);
    } catch (error) {
      console.error('Chat request failed:', error);
      setMessages((prevMessages) => prevMessages.slice(0, -1));

      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error as string | undefined)
        : undefined;

      toast.error(
        errorMessage ?? 'Failed to send message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    setMessages([]);
  }, [assistant?.id]);

  const updateUserCredits = async (contentMessage: string = '') => {
    if (!user) return;

    const tokenCount = contentMessage
      ? contentMessage.trim().split(/\s+/).length
      : 0;

    const credits = user?.credits - tokenCount;

    await updateUserTokens({
      userId: user?._id,
      credits,
    });

    setUser({
      ...user,
      credits,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {assistant && (
        <div className="flex items-center gap-3 border-b border-border/40 bg-card/70 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Image
            src={assistant.image}
            alt={assistant.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/15"
          />
          <div className="min-w-0">
            <p className="truncate font-bold">{assistant.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {assistant.title}
            </p>
          </div>
        </div>
      )}

      {!messages?.length ? (
        <ChatEmptyUI mobile={mobile} onSuggestionClick={onSuggestionClick} />
      ) : (
        <div
          ref={scrollRef}
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-y-auto p-4 scrollbar-hide sm:p-6',
            mobile && 'max-h-[calc(100vh-60px-64px-120px)]'
          )}
        >
          {messages.map(({ role, content }, index) => (
            <ChatMessage
              key={index}
              role={role}
              content={content}
              assistantImage={
                role === 'assistant' ? assistant?.image : undefined
              }
            />
          ))}
          {isLoading && (
            <ChatMessage
              role="assistant"
              content="Thinking..."
              assistantImage={assistant?.image}
              isLoading={true}
            />
          )}
        </div>
      )}

      <div className="flex gap-3 border-t border-border/40 bg-card/60 p-5 backdrop-blur-sm dark:bg-background/80 dark:border-border/30">
        <Input
          value={message}
          disabled={isChatDisabled}
          placeholder="Type your message..."
          className="flex-1"
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && onSendMessage()}
        />
        <Button
          size="icon"
          className="h-11 w-11 shrink-0 rounded-2xl shadow-soft"
          disabled={isChatDisabled || !message.trim()}
          onClick={() => onSendMessage()}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}

export default ChatUI;
