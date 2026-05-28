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

import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from '@/components/common/model-selector';
import { PricingModal } from '@/components/common/pricing-modal';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/magicui/blur-fade';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { aiModelOptions } from '@/services/AiModelOptions';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';
import { setAppHomeHrefCache } from '@/hooks/use-app-home';

import type { AiAssistant } from '@/app/(main)/types';
import AssistantConfirmationAlert from './AssistantConfirmationAlert';
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
  const { isPro } = useUpgradeCheckout();

  const updateAssistant = useMutation(
    api.userAiAssistants.updateUserAiAssistant
  );
  const deleteAssistant = useMutation(api.userAiAssistants.deleteAssistant);

  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [pendingInstructionsFocus, setPendingInstructionsFocus] =
    useState(false);

  const selectedModel =
    aiModelOptions.find((model) => model.id === assistant?.aiModelId) ??
    aiModelOptions[0];

  const onHandleInputChange = (field: keyof AiAssistant, value: string) => {
    setAssistant({ ...assistant, [field]: value } as AiAssistant);
  };

  const handleModelClick = () => {
    if (isPro) {
      setModelPickerOpen(true);
      return;
    }

    setPricingOpen(true);
  };

  const handleInstructionsClick = () => {
    if (collapsed && !mobile) {
      setPendingInstructionsFocus(true);
      onExpandSidebar?.();
      return;
    }

    instructionsRef.current?.focus();
  };

  useEffect(() => {
    if (!pendingInstructionsFocus || collapsed || mobile) return;

    const frame = requestAnimationFrame(() => {
      instructionsRef.current?.focus();
      setPendingInstructionsFocus(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [collapsed, mobile, pendingInstructionsFocus]);

  const OnSave = async () => {
    if (!assistant) return;

    const trimmedInstruction = assistant.userInstruction?.trim() ?? '';
    if (!trimmedInstruction) {
      toast.error('Instructions cannot be empty');
      return;
    }

    setLoading(true);

    try {
      await updateAssistant({
        id: assistant._id,
        aiModelId: assistant.aiModelId,
        userInstruction: trimmedInstruction,
      });

      setAssistant({
        ...assistant,
        userInstruction: trimmedInstruction,
      });

      toast.success(`Updated ${assistant.name}'s settings`);
    } catch (error) {
      console.error('Failed to save companion settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const OnDelete = async () => {
    if (!assistant || !user?._id) return;

    setLoading(true);

    try {
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
                  <div className="surface-muted mt-2 flex gap-4 p-4">
                    <Image
                      src={assistant.image}
                      alt="assistant"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/15"
                    />
                    <div>
                      <p className="section-eyebrow text-[10px]">
                        Active Companion
                      </p>
                      <h2 className="text-lg font-bold">{assistant.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {assistant.title}
                      </p>
                    </div>
                  </div>
                </BlurFade>
                <BlurFade delay={0.25 * 2}>
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Model
                    </p>
                    <ModelSelector
                      value={assistant.aiModelId ?? aiModelOptions[0]?.id}
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
                    <Textarea
                      ref={instructionsRef}
                      placeholder="Add instructions for this companion..."
                      className="min-h-[180px] resize-y"
                      value={assistant.userInstruction ?? ''}
                      onChange={(e) =>
                        onHandleInputChange('userInstruction', e.target.value)
                      }
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

      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />

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
              value={assistant.aiModelId ?? aiModelOptions[0]?.id}
              onValueChange={(value) => onHandleInputChange('aiModelId', value)}
              onUpgradeClick={() => {
                setModelPickerOpen(false);
                setPricingOpen(true);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AssistantSettings;
