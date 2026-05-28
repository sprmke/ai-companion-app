import Image from 'next/image';

import { MessageSquare, Sparkles } from 'lucide-react';

import { aiAssistantsList } from '@/services/AiAssistantsList';

import { BrowserFrame } from './browser-frame';

const workspaceSidebarCompanionIds = [
  'template-code-writer',
  'template-email-writer',
  'template-fitness-coach',
  'template-bug-finder',
  'template-personal-tutor',
] as const;

const workspaceSidebarCompanions = workspaceSidebarCompanionIds
  .map((id) => aiAssistantsList.find((a) => a.id === id))
  .filter((a): a is (typeof aiAssistantsList)[number] => Boolean(a));

const workspaceActiveCompanion = workspaceSidebarCompanions[0];

const onboardingShowcaseCompanionIds = [
  'template-fitness-coach',
  'template-bug-finder',
  'template-personal-tutor',
  'template-code-writer',
  'template-email-writer',
  'template-finance-assistant',
] as const;

const onboardingShowcaseCompanions = onboardingShowcaseCompanionIds
  .map((id) => aiAssistantsList.find((a) => a.id === id))
  .filter((a): a is (typeof aiAssistantsList)[number] => Boolean(a));

const chatPreviewCompanion =
  aiAssistantsList.find((a) => a.id === 'template-code-writer') ??
  aiAssistantsList[0];

const chatPreviewMessages = [
  {
    role: 'user' as const,
    content:
      'Help me write a TypeScript interface for a user profile with name, email, and an optional avatar URL.',
  },
  {
    role: 'assistant' as const,
    content:
      'Here is a clean interface you can extend later:\n\ninterface UserProfile {\n  id: string;\n  name: string;\n  email: string;\n  avatarUrl?: string;\n  createdAt: Date;\n}\n\nKeep avatarUrl optional so profiles work before a photo is uploaded.',
  },
  {
    role: 'user' as const,
    content: 'Can you also show how to type an API response that returns this profile?',
  },
  {
    role: 'assistant' as const,
    content:
      'Use a generic wrapper so your frontend knows when data is ready:\n\ntype ApiResponse<T> = { data: T; success: boolean };\ntype UserProfileResponse = ApiResponse<UserProfile>;',
  },
];

export function WorkspacePreview({ glow = true }: { glow?: boolean }) {
  return (
    <BrowserFrame title="workspace" glow={glow}>
      <div className="grid min-h-[400px] grid-cols-5">
        <div className="col-span-1 flex flex-col border-r border-border/40 bg-muted/30 p-3">
          <div className="mb-2.5 shrink-0 rounded-xl bg-primary px-2.5 py-2 text-center text-[10px] font-semibold text-primary-foreground">
            + Add Companion
          </div>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
            {workspaceSidebarCompanions.map((c, index) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 rounded-lg p-1.5 ${index === 0 ? 'bg-primary/10 ring-1 ring-primary/25' : ''}`}
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-border/40">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold leading-tight">
                    {c.name}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-muted-foreground">
                    {c.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 flex flex-col bg-background p-5">
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <p className="text-sm font-bold">How can I assist you?</p>
            <div className="mt-2.5 w-full max-w-[260px] space-y-1.5">
              {workspaceActiveCompanion.sampleQuestions
                .slice(0, 2)
                .map((q) => (
                  <div
                    key={q}
                    className="rounded-xl border border-border/40 bg-muted/15 px-2.5 py-2 text-left text-[10px] leading-snug text-muted-foreground dark:bg-background/70"
                  >
                    {q}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2.5">
            <div className="h-10 flex-1 rounded-2xl border border-border/40 bg-muted/15 dark:bg-background/70" />
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col border-l border-border/40 bg-muted/20 p-3">
          <div className="rounded-xl border border-border/40 bg-muted/40 p-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-primary/80">
              Active Companion
            </p>
            <div className="mt-2 flex gap-2">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-primary/20">
                <Image
                  src={workspaceActiveCompanion.image}
                  alt={workspaceActiveCompanion.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold leading-tight">
                  {workspaceActiveCompanion.name}
                </p>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {workspaceActiveCompanion.title}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Model
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2.5 py-2">
              <Image
                src="/google.png"
                alt="Google"
                width={16}
                height={16}
                unoptimized
                className="rounded-sm"
              />
              <p className="truncate text-[10px] font-medium">
                Gemini 2.0 Flash
              </p>
            </div>
          </div>

          <div className="mt-3 min-h-0 flex-1 space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Instructions
            </p>
            <div className="rounded-lg border border-border/40 bg-background/40 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
              {workspaceActiveCompanion.userInstruction}
            </div>
          </div>

          <div className="mt-2.5 flex gap-2">
            <div className="flex-1 rounded-lg border border-border/40 py-1.5 text-center text-[10px] text-muted-foreground">
              Delete
            </div>
            <div className="flex-1 rounded-lg bg-primary py-1.5 text-center text-[10px] font-semibold text-primary-foreground">
              Save
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function CompanionsPreview({ glow = true }: { glow?: boolean }) {
  return (
    <BrowserFrame title="assistants" glow={glow}>
      <div className="min-h-[380px] p-5">
        <p className="section-eyebrow text-[9px]">Onboarding</p>
        <h3 className="text-sm font-bold">Choose your AI companions</h3>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {onboardingShowcaseCompanions.map((assistant, i) => (
            <div
              key={assistant.id}
              className={`overflow-hidden rounded-xl border border-border/40 bg-card ${i === 0 ? 'ring-2 ring-primary/30' : ''}`}
            >
              <div className="relative h-36 w-full overflow-hidden bg-muted/20">
                <Image
                  src={assistant.image}
                  alt={assistant.name}
                  fill
                  unoptimized
                  className="object-contain object-center p-1"
                  sizes="160px"
                />
              </div>
              <div className="border-t border-border/30 p-2 text-center">
                <p className="truncate text-[9px] font-semibold">
                  {assistant.name}
                </p>
                <p className="truncate text-[8px] text-muted-foreground">
                  {assistant.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function ChatPreview({ glow = true }: { glow?: boolean }) {
  return (
    <BrowserFrame title="workspace" glow={glow}>
      <div className="flex min-h-[420px] flex-col p-5">
        <div className="mb-4 flex items-center gap-2.5 border-b border-border/30 pb-4">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-primary/20">
            <Image
              src={chatPreviewCompanion.image}
              alt={chatPreviewCompanion.name}
              fill
              unoptimized
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold">{chatPreviewCompanion.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {chatPreviewCompanion.title}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3.5">
          {chatPreviewMessages.map((message, index) =>
            message.role === 'user' ? (
              <div key={index} className="flex justify-end">
                <div className="max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[11px] leading-relaxed text-primary-foreground">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={index} className="flex gap-2.5">
                <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40">
                  <Image
                    src={chatPreviewCompanion.image}
                    alt={chatPreviewCompanion.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-md border border-border/40 bg-muted/40 px-3.5 py-2.5 text-[11px] leading-relaxed text-foreground">
                  {message.content}
                </div>
              </div>
            )
          )}
        </div>

        <div className="mt-4 flex gap-2.5 border-t border-border/30 pt-4">
          <div className="flex h-11 flex-1 items-center rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-[11px] text-muted-foreground">
            Ask Harry anything...
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
