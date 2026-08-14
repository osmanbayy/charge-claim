'use client';

import {
  AlertTriangle,
  LoaderCircle,
  XIcon
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCancelReservation } from '../hooks/use-cancel-reservation';
import { dateTimeFormatter } from '@/lib/constants';
import type { Reservation } from '../types/reservation';

export interface CancellationSelection {
  reservation: Reservation;
  stationName: string;
}

interface ReservationCancellationDialogProps {
  selection: CancellationSelection | null;
  onOpenChange: (open: boolean) => void;
}

export function ReservationCancellationDialog({
  selection,
  onOpenChange,
}: ReservationCancellationDialogProps) {
  const cancelReservation = useCancelReservation();

  if (selection === null) return null;

  const { reservation, stationName } = selection;

  function handleOpenChange(open: boolean): void {
    if (!open && cancelReservation.isPending) {
      return;
    }

    if (!open) {
      cancelReservation.reset();
    }

    onOpenChange(open);
  }

  const handleCancel = async (): Promise<void> => {
    try {
      await cancelReservation.mutateAsync(reservation.id);
      handleOpenChange(false);
    } catch {
      // Mutation errors are displayed globally by Sonner.
    }
  }

  return (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="overflow-hidden border-red-100 shadow-2xl sm:max-w-md" showCloseButton={false}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2"
          aria-label="Dialog'u kapat"
          disabled={cancelReservation.isPending}
          onClick={() => handleOpenChange(false)}
        >
          <XIcon className="size-4" />
        </Button>

        <div className="-mx-6 -mt-6 mb-1 rounded-t-lg bg-linear-to-br from-red-950 to-red-800 px-6 py-6 text-white">
        <DialogHeader>
          <DialogTitle>Rezervasyonu İptal Et</DialogTitle>

          <DialogDescription className="text-white">
            Bu işlem rezervasyonunuzu kalıcı olarak iptal edecektir.
            Daha sonra müsait bir aralıkta tekrar rezervasyon oluşturabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="font-medium">{stationName}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Rezervasyon #{reservation.id}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {dateTimeFormatter.format(
              new Date(reservation.startAt),
            )}
          </p>
        </div>

        <Alert className="border-amber-200 bg-amber-50 text-amber-950">
          <AlertTriangle className='size-4' />

          <AlertDescription>
            İptal edilen rezervasyon tekrar onaylanamaz.
            Gerekirse yeni bir rezervasyon oluşturmanız gerekir.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={cancelReservation.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Vazgeç
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={cancelReservation.isPending}
            onClick={() => void handleCancel()}
          >
            {cancelReservation.isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                İptal ediliyor
              </>
            ) : (
              'Rezervasyonu iptal et'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
