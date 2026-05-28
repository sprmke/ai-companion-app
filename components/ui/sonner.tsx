'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'dark' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      closeButton
      gap={12}
      offset={20}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast !flex !w-full !items-center !gap-3 !rounded-2xl !border !border-border/50 !bg-card/95 !py-3.5 !pl-4 !pr-11 !font-sans !text-card-foreground !shadow-elevated-lg !backdrop-blur-xl',
          title: '!text-sm !font-semibold !leading-snug !text-foreground',
          description: '!text-sm !leading-snug !text-muted-foreground',
          actionButton:
            '!h-9 !rounded-xl !bg-primary !px-3 !text-xs !font-semibold !text-primary-foreground',
          cancelButton:
            '!h-9 !rounded-xl !bg-muted !px-3 !text-xs !font-semibold !text-muted-foreground',
          closeButton:
            '!absolute !right-2.5 !top-2.5 !left-auto !flex !h-7 !w-7 !items-center !justify-center !rounded-lg !border !border-border/50 !bg-muted/60 !text-muted-foreground !transition-colors hover:!bg-muted hover:!text-foreground',
          success:
            '!border-success/30 [&_[data-icon]]:!text-success [&_[data-icon]]:bg-success/10',
          error:
            '!border-destructive/30 [&_[data-icon]]:!text-destructive [&_[data-icon]]:bg-destructive/10',
          warning:
            '!border-warning/30 [&_[data-icon]]:!text-warning [&_[data-icon]]:bg-warning/10',
          info: '!border-info/30 [&_[data-icon]]:!text-info [&_[data-icon]]:bg-info/10',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
