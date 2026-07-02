'use client';

import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import { useConvex, useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';

import { Save, SquarePen, Trash } from 'lucide-react';

import { toast } from 'sonner';

import { ModelSelector } from '@/components/common/model-selector';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import { SampleQuestionsEditor } from '@/components/common/sample-questions-editor';
import { SidebarQuickSuggestions } from '@/components/common/sidebar-quick-suggestions';
import { PricingModal } from '@/components/common/pricing-modal';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/magicui/blur-fade';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { aiModelOptions, resolveAiModelId } from '@/services/AiModelOptions';
import { useTokenUsage } from '@/hooks/use-token-usage';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';
import { ThreadContext } from '@/context/ThreadContext';
import { setAppHomeHrefCache } from '@/hooks/use-app-home';

import type { AiAssistant } from '@/app/(main)/types';
import AssistantConfirmationAlert from './AssistantConfirmationAlert';
import {
  instructionPreviewText,
  isInstructionEmpty,
} from '@/lib/instruction-content';
import { isRadixPortaledTarget } from '@/lib/radix-portal';
import { validateSampleQuestions } from '@/lib/sample-questions';
import { cn } from '@/lib/utils';

function AssistantSettings({
  mobile = false,
  collapsed = false,
  onExpandSidebar,
}: {
  mobile?: boolean;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
}) {
  const convex = useConvex();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { assistant, setAssistant, requestAssistantsRefresh } =
    useContext(AssistantContext);
  const { setCurrentThreadId, startNewChatWithMessage } =
    useContext(ThreadContext);
  const { isPro } = useUpgradeCheckout();
  const { isMaxedOut } = useTokenUsage();

  const updateAssistant = useMutation(
    api.userAiAssistants.updateUserAiAssistant
  );
  const deleteAssistant = useMutation(api.userAiAssistants.deleteAssistant);
  const deleteThreadsByAssistant = useMutation(
    api.chatThreads.deleteThreadsByAssistant
  );

  const [loading, setLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [focusInstructionsEditor, setFocusInstructionsEditor] = useState(false);
  const [suggestionsSnapshot, setSuggestionsSnapshot] = useState<string[]>([]);
  const instructionsSectionRef = useRef<HTMLElement>(null);

  const resolvedModelId = resolveAiModelId(assistant?.aiModelId);
  const selectedModel =
    aiModelOptions.find((model) => model.id === resolvedModelId) ??
    aiModelOptions[0];

  // Migrate deprecated model IDs stored in the DB (e.g. gemini-2.0 → 2.5).
  useEffect(() => {
    if (!assistant?.aiModelId) return;
    const resolved = resolveAiModelId(assistant.aiModelId);
    if (assistant.aiModelId === resolved) return;
    setAssistant({ ...assistant, aiModelId: resolved });
  }, [assistant, setAssistant]);

  const onHandleInputChange = <K extends keyof AiAssistant>(
    field: K,
    value: AiAssistant[K]
  ) => {
    setAssistant({ ...assistant, [field]: value } as AiAssistant);
  };

  const handleModelClick = () => {
    if (isPro) {
      setModelPickerOpen(true);
      return;
    }

    setPricingOpen(true);
  };

  const openInstructionsModal = (options?: { focusInstructions?: boolean }) => {
    if (assistant) {
      setSuggestionsSnapshot([...(assistant.sampleQuestions ?? [])]);
    }
    setFocusInstructionsEditor(options?.focusInstructions ?? false);
    setInstructionsModalOpen(true);
  };

  useEffect(() => {
    if (!instructionsModalOpen || !assistant) return;
    setSuggestionsSnapshot([...(assistant.sampleQuestions ?? [])]);
  }, [instructionsModalOpen, assistant?._id]);

  useEffect(() => {
    if (!instructionsModalOpen || !focusInstructionsEditor) return;

    const frame = requestAnimationFrame(() => {
      instructionsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [instructionsModalOpen, focusInstructionsEditor]);

  const handleInstructionsClick = () => {
    openInstructionsModal({ focusInstructions: true });
  };

  const OnSave = async (): Promise<boolean> => {
    if (!assistant) return false;

    if (isInstructionEmpty(assistant.userInstruction)) {
      toast.error('Instructions cannot be empty');
      return false;
    }

    const questionsValidation = validateSampleQuestions(
      assistant.sampleQuestions
    );
    if (!questionsValidation.valid) {
      toast.error(questionsValidation.error ?? 'Invalid suggestions');
      return false;
    }

    const trimmedInstruction = assistant.userInstruction?.trim() ?? '';
    const sampleQuestions = questionsValidation.normalized;

    setLoading(true);

    try {
      await updateAssistant({
        id: assistant._id,
        aiModelId: assistant.aiModelId,
        userInstruction: trimmedInstruction,
        sampleQuestions,
      });

      setAssistant({
        ...assistant,
        userInstruction: trimmedInstruction,
        sampleQuestions,
      });

      toast.success(`Updated ${assistant.name}'s settings`);
      return true;
    } catch (error) {
      console.error('Failed to save companion settings:', error);
      toast.error('Failed to save settings. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const OnDelete = async () => {
    if (!assistant || !user?._id) return;

    setLoading(true);

    try {
      await deleteThreadsByAssistant({
        userId: user._id,
        assistantId: assistant._id,
      });
      setCurrentThreadId(null);

      await deleteAssistant({
        id: assistant._id,
      });

      const remaining = await convex.query(
        api.userAiAssistants.getAllUserAssistants,
        {
          userId: user._id,
        }
      );

      if (!remaining.length) {
        setAppHomeHrefCache(user._id, '/assistants');
        router.replace('/assistants');
        return;
      }

      setAssistant(remaining[0]);
      requestAssistantsRefresh();
    } catch (error) {
      console.error('Failed to delete companion:', error);
      toast.error('Failed to delete companion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex h-full flex-col justify-between overflow-y-auto scrollbar-hide',
          collapsed && !mobile ? 'items-center px-0 py-1' : 'p-5'
        )}
      >
        {assistant ? (
          collapsed && !mobile ? (
            <Fragment>
              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onExpandSidebar?.()}
                  title={`${assistant.name} — ${assistant.title}`}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all hover:ring-2 hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={assistant.image}
                    alt={assistant.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/15"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleModelClick}
                  title={`${selectedModel.name} — Change model`}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/40 transition-all hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={selectedModel.logo}
                    alt={selectedModel.name}
                    width={24}
                    height={24}
                    className="rounded-md"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleInstructionsClick}
                  title="Edit instructions"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/40 text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SquarePen className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>

              <div className="mt-auto flex w-full flex-col items-center gap-2 pb-1">
                <AssistantConfirmationAlert OnDelete={OnDelete}>
                  <Button
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl"
                    title="Delete companion"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </AssistantConfirmationAlert>
                <Button
                  onClick={OnSave}
                  loading={loading}
                  size="icon"
                  className="h-11 w-11 rounded-xl shadow-soft"
                  title="Save settings"
                >
                  <Save className="h-5 w-5" />
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="flex flex-col">
                <BlurFade delay={0.25}>
                  <button
                    type="button"
                    onClick={openInstructionsModal}
                    title="Edit companion"
                    className="surface-muted mt-2 flex w-full cursor-pointer gap-3 rounded-2xl p-3.5 text-left transition-colors hover:ring-2 hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Image
                      src={assistant.image}
                      alt={assistant.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-primary/15"
                    />
                    <div className="min-w-0">
                      <h2 className="text-base font-bold leading-tight">
                        {assistant.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {assistant.title}
                      </p>
                    </div>
                  </button>
                </BlurFade>
                <BlurFade delay={0.25 * 2}>
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Model
                    </p>
                    <ModelSelector
                      value={resolvedModelId}
                      className="h-10 text-xs [&_img]:h-4 [&_img]:w-4"
                      onValueChange={(value) =>
                        onHandleInputChange('aiModelId', value)
                      }
                      onUpgradeClick={() => setPricingOpen(true)}
                    />
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 3}>
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Instructions
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        openInstructionsModal({ focusInstructions: true })
                      }
                      className="min-h-[100px] w-full cursor-pointer rounded-2xl border border-input bg-background/50 px-3 py-2 text-left text-xs leading-snug shadow-sm transition-colors hover:border-primary/30 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {!isInstructionEmpty(assistant.userInstruction) ? (
                        <span className="line-clamp-6 whitespace-pre-wrap text-foreground/90">
                          {instructionPreviewText(
                            assistant.userInstruction ?? ''
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/90">
                          Add instructions for this companion…
                        </span>
                      )}
                    </button>
                    <SidebarQuickSuggestions
                      questions={assistant.sampleQuestions}
                      disabled={isMaxedOut}
                      onSelect={startNewChatWithMessage}
                    />
                  </div>
                </BlurFade>
              </div>
              <div className="mt-6 flex shrink-0 items-center justify-end gap-3">
                <AssistantConfirmationAlert OnDelete={OnDelete}>
                  <Button
                    disabled={loading}
                    variant="ghost"
                    className="rounded-xl"
                  >
                    <Trash /> Delete
                  </Button>
                </AssistantConfirmationAlert>
                <Button
                  onClick={OnSave}
                  loading={loading}
                  loadingText="Saving"
                  className="rounded-xl shadow-soft"
                >
                  <Save />
                  Save
                </Button>
              </div>
            </Fragment>
          )
        ) : null}
      </div>

      <PricingModal
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        layer={instructionsModalOpen ? 'elevated' : 'default'}
      />

      <Dialog open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Select Model</DialogTitle>
            <DialogDescription>
              Choose an AI model for {assistant?.name ?? 'this companion'}.
            </DialogDescription>
          </DialogHeader>
          {assistant ? (
            <ModelSelector
              value={resolvedModelId}
              onValueChange={(value) => onHandleInputChange('aiModelId', value)}
              onUpgradeClick={() => {
                setModelPickerOpen(false);
                setPricingOpen(true);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={instructionsModalOpen}
        onOpenChange={(open) => {
          setInstructionsModalOpen(open);
          if (!open) setFocusInstructionsEditor(false);
        }}
      >
        <DialogContent
          className="!flex max-h-[90dvh] max-w-3xl flex-col gap-0 !overflow-hidden p-0 sm:max-w-3xl"
          onPointerDownOutside={(event) => {
            if (isRadixPortaledTarget(event.target)) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (isRadixPortaledTarget(event.target)) {
              event.preventDefault();
            }
          }}
        >
          {assistant ? (
            <>
              <div className="shrink-0 border-b border-border/40 px-6 pb-4 pt-6">
                <DialogHeader className="space-y-1 pr-8 text-left">
                  <DialogTitle>Edit companion</DialogTitle>
                  <DialogDescription>
                    Customize model and instructions for {assistant.name}.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 scrollbar-hide">
                <div className="space-y-8">
                  <div className="surface-muted flex gap-4 p-4">
                    <Image
                      src={assistant.image}
                      alt={assistant.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-primary/15"
                    />
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold">{assistant.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {assistant.title}
                      </p>
                    </div>
                  </div>

                  <section className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Model
                      </p>
                    </div>
                    <ModelSelector
                      value={resolvedModelId}
                      onValueChange={(value) =>
                        onHandleInputChange('aiModelId', value)
                      }
                      onUpgradeClick={() => setPricingOpen(true)}
                    />
                  </section>

                  <section
                    ref={instructionsSectionRef}
                    className="space-y-3 scroll-mt-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Instructions
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        How this companion should behave and respond.
                      </p>
                    </div>
                    <RichTextEditor
                      autoFocus={focusInstructionsEditor}
                      placeholder="Add instructions for this companion…"
                      minHeight="320px"
                      value={assistant.userInstruction ?? ''}
                      onChange={(html) =>
                        onHandleInputChange('userInstruction', html)
                      }
                    />
                  </section>

                  <section className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Quick suggestions
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Shown on the empty chat screen. Add 1–4 starter prompts.
                      </p>
                    </div>
                    <SampleQuestionsEditor
                      value={assistant.sampleQuestions ?? []}
                      resetValue={suggestionsSnapshot}
                      onChange={(questions) =>
                        onHandleInputChange('sampleQuestions', questions)
                      }
                    />
                  </section>
                </div>
              </div>

              <DialogFooter className="shrink-0 gap-3 border-t border-border/40 bg-card px-6 py-4 sm:justify-between">
                <AssistantConfirmationAlert OnDelete={OnDelete}>
                  <Button
                    disabled={loading}
                    variant="ghost"
                    className="rounded-xl"
                  >
                    <Trash /> Delete
                  </Button>
                </AssistantConfirmationAlert>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setInstructionsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={loading}
                    loadingText="Saving"
                    className="rounded-xl shadow-soft"
                    onClick={async () => {
                      const saved = await OnSave();
                      if (saved) setInstructionsModalOpen(false);
                    }}
                  >
                    <Save />
                    Save
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AssistantSettings;
