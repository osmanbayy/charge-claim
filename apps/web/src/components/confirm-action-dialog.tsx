'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: ReactNode;
  pendingLabel?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  confirmIcon?: ReactNode;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  iconClassName?: string;
  contentClassName?: string;
  isPending?: boolean;
  confirmDisabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel = 'İşlem yapılıyor...',
  icon,
  children,
  confirmIcon,
  confirmVariant = 'destructive',
  iconClassName,
  contentClassName,
  isPending = false,
  confirmDisabled = false,
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <div
            className={cn(
              'mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive',
              iconClassName,
            )}
          >
            {icon ?? <AlertTriangle className="size-5" />}
          </div>

          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Vazgeç
          </DialogClose>

          <Button
            type="button"
            variant={confirmVariant}
            disabled={isPending || confirmDisabled}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {pendingLabel}
              </>
            ) : (
              <>
                {confirmIcon}
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
