'use client';

import { Fragment, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { BlurFade } from '@/components/magicui/blur-fade';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';

import { aiAssistantsList } from '@/services/AiAssistantsList';
import { AiAssistant, AiAssistants } from '@/app/(main)/types';
import { cn } from '@/lib/utils';
import { CompanionImage } from '@/components/common/companion-image';
import { AssistantsPageSkeleton } from '@/components/common/skeleton-loaders';
import { setAppHomeHrefCache } from '@/hooks/use-app-home';
import { toast } from 'sonner';

type StaticAssistant = Omit<AiAssistant, '_id' | 'userId' | 'aiModelId'>;

function AIAssistants() {
  const router = useRouter();
  const convex = useConvex();
  const { user } = useContext(AuthContext);
  const { setAssistant } = useContext(AssistantContext);

  useEffect(() => {
    setAssistant(null);
  }, [setAssistant]);

  const addAssistants = useMutation(api.userAiAssistants.addAssistants);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState<
    StaticAssistant[]
  >([]);
  const [availableAssistants, setAvailableAssistants] = useState<
    StaticAssistant[]
  >([]);

  useEffect(() => {
    setIsContinueDisabled(
      !selectedAssistants.length &&
        availableAssistants.length === aiAssistantsList.length
    );
  }, [selectedAssistants, availableAssistants]);

  useEffect(() => {
    if (!user?._id) return;

    getUserAssistants();
  }, [user]);

  const getUserAssistants = async () => {
    if (!user?._id) return;

    setIsPageLoading(true);
    const userAssistants = await convex.query(
      api.userAiAssistants.getAllUserAssistants,
      {
        userId: user._id,
      }
    );

    const filteredAssistants = aiAssistantsList.filter(
      (assistant) => !userAssistants.some(({ id }) => id === assistant.id)
    );

    setAppHomeHrefCache(
      user._id,
      userAssistants.length > 0 ? '/workspace' : '/assistants'
    );

    setAvailableAssistants(filteredAssistants);
    setIsPageLoading(false);
  };

  const isAssistantSelected = (assistant: StaticAssistant) => {
    return !!selectedAssistants.find(({ id }) => id === assistant.id);
  };

  const selectAssistant = (assistant: StaticAssistant) => {
    const item = selectedAssistants.find(({ id }) => id === assistant.id);

    if (item) {
      setSelectedAssistants(
        selectedAssistants.filter(({ id }) => id !== assistant.id)
      );
      return;
    }

    setSelectedAssistants((prevAssistants) => [...prevAssistants, assistant]);
  };

  const saveSelectedAssistants = async () => {
    if (!user?._id || isSaving) return;

    setIsSaving(true);

    try {
      await addAssistants({
        aiAssistants: selectedAssistants.map((assistant) => ({
          ...assistant,
          userId: user._id,
          aiModelId: 'google/gemini-2.0-flash',
        })),
      });

      const savedAssistants = await convex.query(
        api.userAiAssistants.getAllUserAssistants,
        { userId: user._id }
      );

      if (!savedAssistants.length) {
        toast.error('Could not load your companions. Please try again.');
        setIsSaving(false);
        return;
      }

      setAppHomeHrefCache(user._id, '/workspace');
      setAssistant(savedAssistants[0]);
      router.replace('/workspace');
    } catch (error) {
      console.error('Failed to save companions:', error);
      toast.error('Failed to save companions. Please try again.');
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return <AssistantsPageSkeleton />;
  }

  return (
    <div className="app-shell relative top-[60px] min-h-[calc(100vh-60px)] py-10">
      <div className="app-container">
      {availableAssistants.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center">
          <BlurFade delay={0.25} inView>
            <div className="empty-state-well max-w-md">
              <h2 className="text-2xl font-bold">
                All suggested companions are already selected!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Head to your workspace to start chatting.
              </p>
              <Button
                className="mt-6 rounded-2xl shadow-soft"
                onClick={() => router.replace('/workspace')}
              >
                Go to workspace
              </Button>
            </div>
          </BlurFade>
        </div>
      ) : (
        <Fragment>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <BlurFade delay={0.25} inView>
                <p className="section-eyebrow">Onboarding</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Choose your AI companions
                </h2>
              </BlurFade>
              <BlurFade delay={0.25 * 2} inView>
                <p className="mt-3 max-w-xl text-lg text-muted-foreground">
                  Select one or more specialized assistants to join your
                  workspace. You can always add more later.
                </p>
              </BlurFade>
            </div>
            <Button
              size="lg"
              disabled={isContinueDisabled || isSaving}
              loading={isSaving}
              loadingText="Saving…"
              onClick={saveSelectedAssistants}
              className="w-full shrink-0 rounded-2xl shadow-soft sm:w-auto"
            >
              Continue
            </Button>
          </div>

          <div
            className={cn(
              'mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5',
              isSaving && 'pointer-events-none opacity-60'
            )}
          >
            {availableAssistants.map((assistant, index) => {
              const selected = isAssistantSelected(assistant);
              return (
                <BlurFade key={assistant.id} delay={0.25 + index * 0.05} inView>
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'group relative w-full cursor-pointer overflow-hidden rounded-3xl border border-border/50 bg-card text-left shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected && 'ring-2 ring-primary shadow-soft'
                    )}
                    onClick={() => selectAssistant(assistant)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectAssistant(assistant);
                      }
                    }}
                  >
                    <Checkbox
                      className="absolute left-3 top-3 z-10"
                      checked={selected}
                      onCheckedChange={() => selectAssistant(assistant)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="relative h-[180px] overflow-hidden md:h-[200px]">
                      <CompanionImage
                        src={assistant.image}
                        alt={assistant.name}
                        priority={index < 5}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="p-4">
                      <h2 className="text-center text-lg font-bold">
                        {assistant.name}
                      </h2>
                      <p className="text-center text-sm text-muted-foreground">
                        {assistant.title}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </Fragment>
      )}
      </div>
    </div>
  );
}

export default AIAssistants;
