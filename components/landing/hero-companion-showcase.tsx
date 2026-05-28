'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';

import { heroCompanions } from './hero-companion-data';
import { useTypingAnimation } from './use-typing-animation';

const CAROUSEL_CARD_SPREAD = 102;

function TypingCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-px bg-current"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function CompanionCarousel({
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const active = heroCompanions[activeIndex];
  const didSwipeRef = useRef(false);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipe = info.offset.x + info.velocity.x * 0.15;
    if (Math.abs(swipe) < 40) {
      didSwipeRef.current = false;
      return;
    }
    didSwipeRef.current = true;
    if (swipe < 0) onNext();
    else onPrev();
  };

  const handleSelect = (index: number) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    onSelect(index);
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        aria-label="Swipe to browse companions"
        className="relative flex w-full cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragStart={() => {
          didSwipeRef.current = false;
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="relative h-[192px] w-full max-w-[380px] [perspective:1100px] sm:h-[238px] sm:max-w-[450px] lg:h-[252px] lg:max-w-[480px]">
          {heroCompanions.map((companion, index) => {
            const offset = index - activeIndex;
            const wrappedOffset =
              offset > 2
                ? offset - heroCompanions.length
                : offset < -2
                  ? offset + heroCompanions.length
                  : offset;
            const isActive = index === activeIndex;
            const absOffset = Math.abs(wrappedOffset);

            if (absOffset > 2) return null;

            return (
              <motion.button
                key={companion.id}
                type="button"
                onClick={() => handleSelect(index)}
                aria-label={`Select ${companion.name}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'absolute left-1/2 top-1/2 origin-center overflow-hidden rounded-2xl',
                  isActive
                    ? 'z-10 shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.45)] ring-2 ring-primary/30'
                    : 'shadow-elevated-lg ring-1 ring-border/30'
                )}
                initial={false}
                animate={
                  reduceMotion
                    ? {
                        x: '-50%',
                        y: '-50%',
                        scale: isActive ? 1 : 0.82,
                        opacity: isActive ? 1 : 0.45,
                        rotateY: 0,
                        zIndex: isActive ? 10 : 5 - absOffset,
                      }
                    : {
                        x: `calc(-50% + ${wrappedOffset * CAROUSEL_CARD_SPREAD}px)`,
                        y: '-50%',
                        scale: isActive ? 1 : 0.68 - absOffset * 0.05,
                        opacity: isActive ? 1 : 0.3 + (2 - absOffset) * 0.15,
                        rotateY: wrappedOffset * -20,
                        zIndex: isActive ? 10 : 5 - absOffset,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                  mass: 0.8,
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className={cn(
                    'relative h-[172px] w-[136px] bg-gradient-to-br sm:h-[214px] sm:w-[170px] lg:h-[226px] lg:w-[180px]',
                    companion.accent
                  )}
                >
                  <Image
                    src={companion.image}
                    alt={companion.name}
                    fill
                    unoptimized
                    className="pointer-events-none select-none object-cover object-top"
                    sizes="(max-width: 640px) 136px, 180px"
                    priority={isActive}
                    draggable={false}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent px-2.5 pb-2.5 pt-11 sm:pt-12">
                    <p className="truncate text-xs font-bold leading-tight sm:text-sm">
                      {companion.name}
                    </p>
                    <p className="truncate text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                      {companion.title}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}

          <motion.div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-3 -bottom-2 h-14 rounded-full bg-gradient-to-r blur-2xl sm:h-16',
              active.accent
            )}
            animate={
              reduceMotion ? { opacity: 0.45 } : { opacity: [0.4, 0.75, 0.4] }
            }
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function HeroTypingChat({
  companionIndex,
  onCycleComplete,
}: {
  companionIndex: number;
  onCycleComplete: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const companion = heroCompanions[companionIndex];

  const {
    questionText,
    answerText,
    isTypingQuestion,
    isTypingAnswer,
    showAnswer,
  } = useTypingAnimation({
    question: companion.demo.question,
    answer: companion.demo.answer,
    reduceMotion: Boolean(reduceMotion),
    onCycleComplete,
  });

  const hasStarted = Boolean(questionText || isTypingQuestion);

  return (
    <div key={companion.id} className="flex flex-col gap-3.5 sm:gap-4">
      {!hasStarted && (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/30 bg-background/50 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Starting conversation...
        </div>
      )}

      {hasStarted && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex justify-end"
        >
          <div className="max-w-[90%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.55)] sm:max-w-[85%]">
            {questionText}
            <TypingCursor visible={isTypingQuestion} />
          </div>
        </motion.div>
      )}

      {showAnswer && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex items-start gap-3"
        >
          <div className="relative mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-md ring-2 ring-background">
            <Image
              src={companion.image}
              alt={companion.name}
              fill
              unoptimized
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-md border border-border/30 bg-background/70 px-4 py-3 text-sm leading-relaxed text-foreground shadow-elevated-lg backdrop-blur-md sm:max-w-[85%]">
            {answerText}
            <TypingCursor visible={isTypingAnswer} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function HeroCompanionShowcase() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const active = heroCompanions[activeIndex];

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + heroCompanions.length) % heroCompanions.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleCycleComplete = useCallback(() => {
    if (autoAdvance && !reduceMotion) {
      goNext();
    }
  }, [autoAdvance, reduceMotion, goNext]);

  return (
    <div
      className="relative flex flex-col gap-5 sm:gap-6"
      onMouseEnter={() => setAutoAdvance(false)}
      onMouseLeave={() => setAutoAdvance(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-1/2 top-14 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br blur-3xl sm:top-16 sm:h-72 sm:w-72 lg:top-20 lg:h-80 lg:w-80',
            active.accent
          )}
        />
      </AnimatePresence>

      <CompanionCarousel
        activeIndex={activeIndex}
        onSelect={goTo}
        onPrev={goPrev}
        onNext={goNext}
      />

      <HeroTypingChat
        companionIndex={activeIndex}
        onCycleComplete={handleCycleComplete}
      />
    </div>
  );
}
