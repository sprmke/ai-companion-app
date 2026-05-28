'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Play, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type AnimationStyle =
  | 'from-bottom'
  | 'from-center'
  | 'from-top'
  | 'from-left'
  | 'from-right'
  | 'fade'
  | 'top-in-bottom-out'
  | 'left-in-right-out';

type HeroVideoProps = {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  className?: string;
} & (
  | {
      thumbnail: ReactNode;
      thumbnailSrc?: never;
      thumbnailAlt?: never;
    }
  | {
      thumbnail?: never;
      thumbnailSrc: string;
      thumbnailAlt?: string;
    }
);

const animationVariants = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'from-top': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  'from-left': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'from-right': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'top-in-bottom-out': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'left-in-right-out': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
};

function getYoutubeEmbedUrl(videoSrc: string, autoplay: boolean) {
  const idMatch = videoSrc.match(
    /(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = idMatch?.[1];

  if (!videoId) {
    const separator = videoSrc.includes('?') ? '&' : '?';
    return autoplay ? `${videoSrc}${separator}autoplay=1` : videoSrc;
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export default function HeroVideoDialog({
  animationStyle = 'from-center',
  videoSrc,
  className,
  thumbnail,
  thumbnailSrc,
  thumbnailAlt = 'Video thumbnail',
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVideoOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVideoOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVideoOpen]);

  const embedSrc = getYoutubeEmbedUrl(videoSrc, isVideoOpen);

  const modal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            key="hero-video-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Product demo video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={selectedAnimation.initial}
              animate={selectedAnimation.animate}
              exit={selectedAnimation.exit}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative aspect-video w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close video"
                className="absolute -right-1 -top-12 z-10 rounded-2xl border border-border/50 bg-card/95 p-2.5 text-foreground shadow-elevated-lg backdrop-blur-md transition-colors hover:bg-muted sm:right-0"
                onClick={() => setIsVideoOpen(false)}
              >
                <XIcon className="size-5" />
              </button>
              <div className="relative size-full overflow-hidden rounded-3xl border border-border/50 bg-black shadow-elevated-lg">
                <iframe
                  key={embedSrc}
                  src={embedSrc}
                  className="size-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  title="Product demo video"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className="group relative w-full cursor-pointer overflow-hidden rounded-3xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsVideoOpen(true)}
        aria-label="Play product demo video"
      >
        {thumbnail ? (
          <div className="relative overflow-hidden rounded-3xl border border-border/50 shadow-elevated-lg">
            {thumbnail}
            <div className="pointer-events-none absolute inset-0 bg-foreground/20 transition-opacity group-hover:bg-foreground/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
                <Play className="h-4 w-4 fill-current" />
                Watch demo
              </div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={thumbnailSrc}
              alt={thumbnailAlt}
              width={1920}
              height={1080}
              className="aspect-video w-full rounded-3xl border border-border/50 object-cover shadow-elevated-lg transition-all duration-300 group-hover:brightness-90"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-24 items-center justify-center rounded-full border border-white/20 bg-background/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 shadow-soft">
                  <Play className="ml-1 size-7 fill-primary-foreground text-primary-foreground" />
                </div>
              </div>
            </div>
          </>
        )}
      </button>

      {modal}
    </div>
  );
}
