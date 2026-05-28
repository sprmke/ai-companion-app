'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

type CompanionImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Static companion avatars from /public — unoptimized avoids format issues in previews. */
export function CompanionImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 50vw, 240px',
  priority = false,
}: CompanionImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={600}
      priority={priority}
      unoptimized
      sizes={sizes}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
