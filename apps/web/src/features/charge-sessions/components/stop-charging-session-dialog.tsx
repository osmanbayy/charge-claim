'use client';

import { AlertTriangle, Square } from 'lucide-react';
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

interface StopChargingSessionDialogProps {
  open: boolean;
  isStopping: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StopChargingSessionDialog({
  open,
  isStopping,
  onOpenChange,
  onConfirm,
}: StopChargingSessionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isStopping) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>

          <DialogTitle>
            Şarj oturumunu durdur
          </DialogTitle>

          <DialogDescription>
            Şarj oturumu mevcut zamana göre tamamlanacak.
            Tüketilen enerji ve ücret geçen süre üzerinden
            hesaplanacaktır.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={isStopping}
              />
            }
          >
            Vazgeç
          </DialogClose>

          <Button
            type="button"
            variant="destructive"
            disabled={isStopping}
            onClick={onConfirm}
          >
            <Square className="size-4" />

            {isStopping
              ? 'Şarj durduruluyor...'
              : 'Şarjı durdur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
