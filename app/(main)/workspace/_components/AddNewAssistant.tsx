import React, { useContext, useState } from 'react';

import Image from 'next/image';

import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '@/components/common/model-selector';
import { PricingModal } from '@/components/common/pricing-modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { aiAssistantsList } from '@/services/AiAssistantsList';
import { aiModelOptions } from '@/services/AiModelOptions';

import AssistantAvatar from '@/app/(main)/workspace/_components/AssistantAvatar';

import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';

import { AuthContext } from '@/context/AuthContext';

import { AiAssistant } from '@/app/(main)/types';

const DEFAULT_ASSISTANT = {
  image: '/bug-fixer.avif',
  name: '',
  title: '',
  instruction: '',
  id: '',
  sampleQuestions: [],
  userInstruction: '',
  aiModelId: 'google/gemini-2.0-flash',
} as unknown as AiAssistant;

function AddNewAssistant({
  children,
  onAddAssistant,
}: {
  children: React.ReactNode;
  onAddAssistant: () => void;
}) {
  const { user } = useContext(AuthContext);

  const addAssistants = useMutation(api.userAiAssistants.addAssistants);

  const [isLoading, setIsLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] =
    useState<AiAssistant>(DEFAULT_ASSISTANT);

  const {
    id,
    name,
    title,
    userInstruction,
    aiModelId = 'google/gemini-2.0-flash',
    image,
  } = selectedAssistant ?? {};

  const filteredAssistants = aiAssistantsList.filter(
    (assistant) =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onHandleInputChange = (key: string, value: string) => {
    setSelectedAssistant((prevAssistantInfo) => ({
      ...prevAssistantInfo,
      [key]: value,
    }));
  };

  const addAssistant = async () => {
    if (!user?._id || !name || !title || !userInstruction) {
      return;
    }

    setIsLoading(true);
    await addAssistants({
      aiAssistants: [
        {
          ...selectedAssistant,
          id: crypto.randomUUID(),
          userId: user._id,
          aiModelId: aiModelId ?? 'google/gemini-2.0-flash',
        },
      ],
    });

    setSelectedAssistant(DEFAULT_ASSISTANT);
    setIsLoading(false);
    toast.success(`Added ${name} as a new companion`);
    onAddAssistant();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="space-y-0 border-b border-border/40 px-6 py-5">
          <DialogTitle>Add New Companion</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,240px)_1fr]">
          <aside className="flex flex-col gap-4 border-border/40 px-5 py-5 md:border-r md:py-6">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-full rounded-xl"
              onClick={() => setSelectedAssistant(DEFAULT_ASSISTANT)}
            >
              <Plus className="h-4 w-4" />
              Create custom
            </Button>
            <Input
              placeholder="Search suggested..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex max-h-[min(52vh,420px)] flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hide">
              {filteredAssistants.map((assistant, index) => {
                const isSelected = selectedAssistant?.title === assistant.title;
                return (
                  <button
                    type="button"
                    className={cn(
                      'flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70',
                      isSelected && 'bg-muted ring-1 ring-border/60'
                    )}
                    key={index}
                    onClick={() =>
                      setSelectedAssistant(assistant as unknown as AiAssistant)
                    }
                  >
                    <Image
                      src={assistant.image}
                      width={40}
                      height={40}
                      alt={assistant.name}
                      className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-border/40"
                    />
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                      {assistant.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex flex-col gap-6 px-5 py-5 md:px-6 md:py-6">
            <div className="flex gap-5 sm:gap-6">
              <AssistantAvatar
                selectedImage={image}
                onAvatarSelect={(image) => onHandleInputChange('image', image)}
              >
                <Image
                  src={image}
                  alt="assistant"
                  width={85}
                  height={85}
                  className="h-[85px] w-[85px] shrink-0 cursor-pointer rounded-2xl object-cover ring-2 ring-primary/15 transition-opacity hover:opacity-80"
                />
              </AssistantAvatar>
              <div className="flex w-full min-w-0 flex-col gap-4">
                <Input
                  placeholder="Companion name"
                  value={selectedAssistant?.name}
                  onChange={(event) =>
                    onHandleInputChange('name', event.target.value)
                  }
                />
                <Input
                  placeholder="Companion title"
                  value={selectedAssistant?.title}
                  onChange={(event) =>
                    onHandleInputChange('title', event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Model
              </p>
              <ModelSelector
                value={aiModelId ?? aiModelOptions[0]?.id}
                onValueChange={(value) =>
                  onHandleInputChange('aiModelId', value)
                }
                onUpgradeClick={() => setPricingOpen(true)}
              />
              <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
            </div>

            <div className="flex flex-1 flex-col space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instructions
              </p>
              <Textarea
                disabled={!!id}
                placeholder="Add instructions for this companion..."
                value={userInstruction}
                className="min-h-[160px] resize-y"
                onChange={(event) =>
                  onHandleInputChange('userInstruction', event.target.value)
                }
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-border/40 pt-5">
              <DialogClose asChild>
                <Button variant="secondary" className="min-w-[100px] rounded-xl">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                loading={isLoading}
                loadingText="Adding…"
                onClick={addAssistant}
                className="min-w-[140px] rounded-xl shadow-soft"
              >
                Add Companion
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewAssistant;
