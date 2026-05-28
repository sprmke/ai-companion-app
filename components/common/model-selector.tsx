'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { aiModelOptions } from '@/services/AiModelOptions';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';
import { cn } from '@/lib/utils';

type ModelSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  onUpgradeClick: () => void;
  className?: string;
};

export function ModelSelector({
  value,
  onValueChange,
  onUpgradeClick,
  className,
}: ModelSelectorProps) {
  const { isPro } = useUpgradeCheckout();
  const selectedModel =
    aiModelOptions.find((model) => model.id === value) ?? aiModelOptions[0];

  if (!isPro) {
    return (
      <button
        type="button"
        onClick={onUpgradeClick}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-2xl border border-border/50 bg-muted/40 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
          className
        )}
        aria-label="Upgrade to change AI model"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Image
            src={selectedModel.logo}
            alt={selectedModel.name}
            width={20}
            height={20}
            className="rounded-md"
          />
          <span className="truncate">{selectedModel.name}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent>
        {aiModelOptions.map(({ id, logo, name }) => (
          <SelectItem value={id} key={id}>
            <div className="m-1 flex items-center gap-2">
              <Image
                src={logo}
                alt={name}
                width={20}
                height={20}
                className="rounded-md"
              />
              <span>{name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
