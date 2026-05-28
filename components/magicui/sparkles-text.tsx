'use client';

import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ComponentPropsWithoutRef, useEffect, useRef } from 'react';

export interface SparklesTextProps extends ComponentPropsWithoutRef<'span'> {
  text: string;
}

export function SparklesText({
  text,
  className,
  ...props
}: SparklesTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <span
      ref={ref}
      className={cn(
        'relative inline-block bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-4))] to-[hsl(var(--color-2))] bg-clip-text font-bold text-transparent',
        className
      )}
      {...props}
    >
      {text}
      <motion.span
        className="pointer-events-none absolute -inset-4 opacity-30 blur-xl"
        style={{
          x: springX,
          y: springY,
          background:
            'radial-gradient(circle, hsl(var(--color-1)) 0%, transparent 70%)',
        }}
      />
    </span>
  );
}
