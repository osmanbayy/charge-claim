'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
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
  const reservation = selection?.reservation;

  function handleOpenChange(open: boolean): void {
    if (!open) cancelReservation.reset();
    onOpenChange(open);
  }

  async function handleCancel(): Promise<void> {
    if (!reservation) return;

    try {
      await cancelReservation.mutateAsync(reservation.id);
      handleOpenChange(false);
    } catch {
      // Mutation errors are displayed globally by Sonner.
    }
  }

  return (
    <ConfirmActionDialog
      open={selection !== null}
      title="Rezervasyonu iptal et"
      description="Bu işlem rezervasyonunuzu kalıcı olarak iptal edecektir."
      confirmLabel="Rezervasyonu iptal et"
      pendingLabel="İptal ediliyor..."
      isPending={cancelReservation.isPending}
      confirmDisabled={!reservation}
      contentClassName="sm:max-w-md"
      onOpenChange={handleOpenChange}
      onConfirm={() => void handleCancel()}
    >
      {selection && reservation ? (
        <>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="font-medium">{selection.stationName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Rezervasyon #{reservation.id}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {dateTimeFormatter.format(new Date(reservation.startAt))}
            </p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              İptal edilen rezervasyon tekrar onaylanamaz. Gerekirse yeni bir
              rezervasyon oluşturmanız gerekir.
            </AlertDescription>
          </Alert>
        </>
      ) : null}
    </ConfirmActionDialog>
  );
}
