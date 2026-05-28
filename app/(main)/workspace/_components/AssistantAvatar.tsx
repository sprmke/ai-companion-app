import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { aiAssistantsList } from '@/services/AiAssistantsList';
import { cn } from '@/lib/utils';

function AssistantAvatar({
  children,
  onAvatarSelect,
  selectedImage,
}: {
  children: React.ReactNode;
  onAvatarSelect: (image: string) => void;
  selectedImage?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-[min(100vw-2rem,320px)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Choose avatar
        </p>
        <div className="grid max-h-[280px] grid-cols-4 gap-2 overflow-y-auto scrollbar-hide sm:grid-cols-5">
          {aiAssistantsList.map(({ id, name, image }) => (
            <button
              key={id}
              type="button"
              className={cn(
                'relative overflow-hidden rounded-xl ring-2 transition-all hover:scale-105',
                selectedImage === image
                  ? 'ring-primary shadow-soft'
                  : 'ring-transparent hover:ring-primary/30'
              )}
              onClick={() => onAvatarSelect(image)}
            >
              <Image
                src={image}
                alt={name}
                width={56}
                height={56}
                className="aspect-square w-full object-cover"
              />
              {selectedImage === image && (
                <span className="absolute inset-0 flex items-center justify-center bg-primary/25">
                  <Check className="h-5 w-5 text-primary-foreground drop-shadow" />
                </span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AssistantAvatar;
