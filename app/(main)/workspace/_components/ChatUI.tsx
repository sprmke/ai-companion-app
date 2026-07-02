'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import {
  History,
  ImagePlus,
  MessageSquarePlus,
  Mic,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AssistantContext } from '@/context/AssistantContext';
import { AuthContext } from '@/context/AuthContext';
import { ThreadContext } from '@/context/ThreadContext';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import ChatEmptyUI from '@/app/(main)/workspace/_components/ChatEmptyUI';
import ChatMessage from '@/app/(main)/workspace/_components/ChatMessage';
import { ThreadSheet } from '@/app/(main)/workspace/_components/ThreadSheet';
import UserProfile from '@/app/(main)/workspace/_components/UserProfile';
import { ConversationSkeleton } from '@/components/common/skeleton-loaders';

import { resolveAiModelId } from '@/services/AiModelOptions';
import { instructionToPlainText } from '@/lib/instruction-content';
import { resolveTokenDeduction } from '@/lib/token-usage';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { useTokenUsage } from '@/hooks/use-token-usage';

const MAX_IMAGE_DIMENSION = 1024;
const IMAGE_QUALITY = 0.8;
const MAX_IMAGES = 4;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(
            MAX_IMAGE_DIMENSION / width,
            MAX_IMAGE_DIMENSION / height
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  createdAt: number;
};

function generateThreadTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > 50 ? trimmed.slice(0, 50).trimEnd() + '…' : trimmed;
}

type StreamUsage = {
  total_tokens?: number;
  completion_tokens?: number;
  prompt_tokens?: number;
} | null;

function toStoredMessage(message: Message): Message {
  return {
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    ...(message.images?.length ? { images: message.images } : {}),
  };
}

function ChatUI({ mobile = false }: { mobile?: boolean }) {
  const { assistant } = useContext(AssistantContext);
  const { user, setUser } = useContext(AuthContext);
  const {
    currentThreadId,
    setCurrentThreadId,
    setIsThreadSheetOpen,
    pendingChatMessage,
    clearPendingChatMessage,
  } = useContext(ThreadContext);
  const { isPro, isMaxedOut } = useTokenUsage();
  const { isListening, isSupported, stopListening, toggleListening } =
    useSpeechToText();

  const deductUserTokens = useMutation(api.users.DeductUserTokens);
  const createThread = useMutation(api.chatThreads.createThread);
  const appendMessages = useMutation(api.chatThreads.appendMessages);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [openUserProfile, setOpenUserProfile] = useState(false);

  const addImages = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      const remaining = MAX_IMAGES - pendingImages.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const toProcess = imageFiles.slice(0, remaining);
      try {
        const compressed = await Promise.all(toProcess.map(compressImage));
        setPendingImages((prev) =>
          [...prev, ...compressed].slice(0, MAX_IMAGES)
        );
      } catch {
        toast.error('Failed to process image');
      }
    },
    [pendingImages.length]
  );

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isChatBusy = isLoading || isSyncing || streamingIndex !== null;
  const isChatDisabled = isChatBusy || isMaxedOut;

  // Tracks which thread's messages are currently in `messages` state, so we
  // can tell "switching into an unloaded thread" apart from a locally-created
  // one (where we already have the messages and shouldn't flash a skeleton).
  const [loadedThreadId, setLoadedThreadId] =
    useState<typeof currentThreadId>(null);

  // Load thread data from Convex when currentThreadId changes
  const threadData = useQuery(
    api.chatThreads.getThread,
    currentThreadId ? { threadId: currentThreadId } : 'skip'
  );

  // Sync messages from Convex when a thread is loaded/switched
  useEffect(() => {
    if (currentThreadId === null) {
      setMessages([]);
      setLoadedThreadId(null);
      return;
    }
    if (threadData && threadData._id === currentThreadId) {
      setMessages(threadData.messages as Message[]);
      setLoadedThreadId(currentThreadId);
    }
  }, [currentThreadId, threadData?._id]);

  // True only while fetching a previously-saved thread we haven't shown yet.
  const isLoadingThread =
    currentThreadId !== null && currentThreadId !== loadedThreadId;

  // When assistant changes, auto-load the most recent thread (or start fresh)
  const assistantThreads = useQuery(
    api.chatThreads.getThreadsByAssistant,
    user?._id && assistant?._id
      ? { userId: user._id, assistantId: assistant._id }
      : 'skip'
  );

  const [autoLoadedForAssistant, setAutoLoadedForAssistant] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!assistant?._id) return;
    // Wait for threads query to resolve before auto-selecting
    if (assistantThreads === undefined) return;
    // Already handled this assistant
    if (autoLoadedForAssistant === assistant._id) return;

    setAutoLoadedForAssistant(assistant._id);

    if (assistantThreads.length > 0) {
      setCurrentThreadId(assistantThreads[0]._id);
    } else {
      setCurrentThreadId(null);
      setMessages([]);
    }
  }, [assistant?._id, assistantThreads, autoLoadedForAssistant]);

  const onSuggestionClick = (suggestion: string) => {
    if (!suggestion.trim()) return;
    if (isMaxedOut) {
      setOpenUserProfile(true);
      return;
    }
    onSendMessage(suggestion);
  };

  useEffect(() => {
    if (!pendingChatMessage?.trim()) return;
    if (!assistant || !user?._id) return;

    const message = pendingChatMessage.trim();
    clearPendingChatMessage();
    setCurrentThreadId(null);
    setMessages([]);

    if (isMaxedOut) {
      setOpenUserProfile(true);
      return;
    }

    onSendMessage(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per pending message
  }, [pendingChatMessage, assistant?._id, user?._id]);

  const onSendMessage = async (suggestionMessage?: string) => {
    if (!assistant || !user?._id) return;

    if (isMaxedOut) {
      setOpenUserProfile(true);
      return;
    }

    const finalMessage = suggestionMessage || message;
    const images = suggestionMessage ? [] : [...pendingImages];
    if (!finalMessage.trim() && images.length === 0) return;

    const modelId = resolveAiModelId(assistant.aiModelId);

    const systemInstruction = [
      assistant.instruction,
      instructionToPlainText(assistant.userInstruction ?? ''),
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join('\n\n');

    const userMsg: Message = {
      role: 'user',
      content: finalMessage,
      ...(images.length > 0 && { images }),
      createdAt: Date.now(),
    };

    const conversationMessages = [
      ...(systemInstruction
        ? [{ role: 'system' as const, content: systemInstruction }]
        : []),
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.images?.length && { images: m.images }),
      })),
      {
        role: 'user' as const,
        content: finalMessage,
        ...(images.length > 0 && { images }),
      },
    ];

    stopListening();
    setIsLoading(true);
    setMessages((prev) => [...prev, userMsg]);

    if (!suggestionMessage) {
      setMessage('');
      setPendingImages([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    let assistantStarted = false;

    try {
      const response = await fetch('/api/eden-ai-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, messages: conversationMessages }),
      });

      if (!response.ok || !response.body) {
        let serverError: string | undefined;
        try {
          serverError = (await response.json())?.error;
        } catch {
          // Non-JSON error body; fall through to generic message.
        }
        throw new Error(serverError ?? 'Failed to send message.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let usage: StreamUsage = null;

      const pushAssistantChunk = () => {
        if (!assistantStarted) {
          assistantStarted = true;
          setIsLoading(false);
          setMessages((prev) => {
            setStreamingIndex(prev.length);
            return [
              ...prev,
              {
                role: 'assistant',
                content: accumulated,
                createdAt: Date.now(),
              },
            ];
          });
        } else {
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: accumulated,
            };
            return next;
          });
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta) {
              accumulated += delta;
              pushAssistantChunk();
            }
            if (json.usage) usage = json.usage;
          } catch {
            // Ignore partial / non-JSON keep-alive lines.
          }
        }
      }

      setStreamingIndex(null);
      setIsLoading(false);

      if (!accumulated.trim()) {
        // Drop the empty assistant bubble and the user message.
        setMessages((prev) => prev.slice(0, assistantStarted ? -2 : -1));
        toast.error('The AI returned an empty response. Please try again.');
        return;
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: accumulated,
        createdAt: Date.now(),
      };

      // Deduct credits and persist history without blocking the UI.
      void (async () => {
        try {
          await updateUserCredits(finalMessage, accumulated, usage);
        } catch (creditError) {
          console.error('Failed to update token usage:', creditError);
          toast.error('Message sent, but token usage could not be updated.');
        }

        setIsSyncing(true);
        const newPair = [
          toStoredMessage(userMsg),
          toStoredMessage(assistantMsg),
        ];
        try {
          if (!currentThreadId) {
            const title = generateThreadTitle(finalMessage);
            const threadId = await createThread({
              userId: user._id,
              assistantId: assistant._id,
              title,
              messages: newPair,
            });
            // We already hold this thread's messages locally, so mark it as
            // loaded before switching to it — otherwise `isLoadingThread`
            // briefly flips true and flashes the conversation skeleton.
            setLoadedThreadId(threadId);
            setCurrentThreadId(threadId);
          } else {
            await appendMessages({
              threadId: currentThreadId,
              newMessages: newPair,
            });
          }
        } catch (persistError) {
          console.error(
            'Failed to save conversation to history:',
            persistError
          );
        } finally {
          setIsSyncing(false);
        }
      })();
    } catch (error) {
      console.error('Chat request failed:', error);
      // Remove the optimistic user message (and any partial assistant message).
      setMessages((prev) => prev.slice(0, assistantStarted ? -2 : -1));
      setStreamingIndex(null);

      const errorMessage = error instanceof Error ? error.message : undefined;

      toast.error(errorMessage ?? 'Failed to send message. Please try again.');
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentThreadId(null);
    setMessages([]);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const updateUserCredits = async (
    inputMessage: string = '',
    responseMessage: unknown = '',
    usage?: {
      total_tokens?: number;
      completion_tokens?: number;
      prompt_tokens?: number;
    } | null
  ) => {
    if (!user?._id) return;

    const tokenCount = resolveTokenDeduction({
      usage,
      inputMessage,
      responseMessage,
    });

    if (tokenCount <= 0) return;

    const remainingCredits = await deductUserTokens({
      userId: user._id,
      amount: tokenCount,
    });

    setUser((current) =>
      current ? { ...current, credits: remainingCredits } : current
    );
  };

  const currentThreadTitle =
    currentThreadId && threadData ? threadData.title : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Thread Sheet (slide-over panel) */}
      <ThreadSheet onNewChat={handleNewChat} />

      {/* Chat Header */}
      <div className="relative z-20 flex shrink-0 items-center gap-3 border-b border-border/40 bg-card/70 px-4 py-3 backdrop-blur-sm">
        {/* Mobile: assistant avatar */}
        {assistant && (
          <div className="flex items-center gap-2.5 lg:hidden">
            <Image
              src={assistant.image}
              alt={assistant.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-primary/15"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold leading-tight">
                {assistant.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {assistant.title}
              </p>
            </div>
          </div>
        )}

        {/* Thread title (center, desktop) */}
        <div className="hidden min-w-0 flex-1 lg:block">
          {currentThreadTitle ? (
            <p className="truncate text-[13px] font-semibold text-foreground/80">
              {currentThreadTitle}
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              New conversation
            </p>
          )}
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 lg:hidden" />

        {/* Thread controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsThreadSheetOpen(true)}
            title="Chat history"
            aria-label="Open chat history"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNewChat}
            title="New chat"
            aria-label="Start new chat"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      {isLoadingThread ? (
        <ConversationSkeleton
          className={cn(mobile && 'max-h-[calc(100vh-60px-64px-120px-52px)]')}
        />
      ) : !messages?.length ? (
        <ChatEmptyUI
          mobile={mobile}
          onSuggestionClick={onSuggestionClick}
          isOutOfCredits={isMaxedOut}
          isPro={isPro}
        />
      ) : (
        <div
          ref={scrollRef}
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 scrollbar-hide sm:p-6',
            mobile && 'max-h-[calc(100vh-60px-64px-120px-52px)]'
          )}
        >
          {messages.map(({ role, content, images }, index) => (
            <ChatMessage
              key={index}
              role={role}
              content={content}
              images={images}
              assistantImage={
                role === 'assistant' ? assistant?.image : undefined
              }
              isStreaming={index === streamingIndex}
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

      {/* Input */}
      <div className="relative z-20 border-t border-border/40 bg-card/60 backdrop-blur-sm dark:border-border/30 dark:bg-background/80">
        {/* Image previews */}
        {pendingImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-0 scrollbar-hide">
            {pendingImages.map((src, i) => (
              <div key={i} className="group relative shrink-0">
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="h-16 w-16 rounded-lg border border-border/40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-5 pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addImages(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
              disabled={isChatBusy || pendingImages.length >= MAX_IMAGES}
              onClick={() => {
                if (isMaxedOut) {
                  setOpenUserProfile(true);
                  return;
                }
                fileInputRef.current?.click();
              }}
              title="Attach image"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            {isSupported && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  'h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground',
                  isListening &&
                    'text-destructive hover:text-destructive animate-pulse'
                )}
                disabled={isChatDisabled}
                aria-pressed={isListening}
                aria-label={
                  isListening ? 'Stop voice input' : 'Start voice input'
                }
                title={isListening ? 'Stop dictation' : 'Dictate message'}
                onClick={() => {
                  if (isMaxedOut) {
                    setOpenUserProfile(true);
                    return;
                  }
                  toggleListening((text) => {
                    setMessage(text);
                    requestAnimationFrame(autoResizeTextarea);
                  }, message);
                }}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Textarea
            ref={textareaRef}
            value={message}
            disabled={isChatBusy}
            placeholder={
              isMaxedOut
                ? 'Out of tokens — open account to top up or upgrade'
                : isListening
                  ? 'Listening…'
                  : 'Type your message...'
            }
            rows={1}
            className="max-h-40 min-h-[44px] flex-1 resize-none overflow-y-auto py-2.5"
            onFocus={() => {
              if (isMaxedOut) {
                textareaRef.current?.blur();
                setOpenUserProfile(true);
              }
            }}
            onChange={(e) => {
              if (isListening) stopListening();
              setMessage(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (isMaxedOut) {
                  setOpenUserProfile(true);
                  return;
                }
                onSendMessage();
              }
            }}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.some((f) => f.type.startsWith('image/'))) {
                e.preventDefault();
                addImages(files);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              addImages(files);
            }}
            onDragOver={(e) => e.preventDefault()}
          />
          <Button
            size="icon"
            className="h-11 w-11 shrink-0 rounded-2xl shadow-soft"
            disabled={
              isChatBusy ||
              (!isMaxedOut && !message.trim() && pendingImages.length === 0)
            }
            onClick={() => {
              if (isMaxedOut) {
                setOpenUserProfile(true);
                return;
              }
              onSendMessage();
            }}
          >
            <Send />
          </Button>
        </div>
      </div>

      <UserProfile
        openUserProfile={openUserProfile}
        setOpenUserProfile={setOpenUserProfile}
      />
    </div>
  );
}

export default ChatUI;
