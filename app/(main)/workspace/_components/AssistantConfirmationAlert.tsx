import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ConfirmationAlertProps = {
  children: React.ReactNode;
  OnDelete: () => void;
};

function ConfirmationAlert({ children, OnDelete }: ConfirmationAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="icon-well-md shrink-0 bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-left leading-tight">
              Delete this companion?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left leading-relaxed">
            This action cannot be undone. Custom settings and conversation
            context for this companion will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={OnDelete}
          >
            Delete Companion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationAlert;
