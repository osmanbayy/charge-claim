'use client';

import { BatteryCharging, CalendarClock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { dateTimeFormatter } from '@/lib/constants';
import type { Reservation } from '@/features/reservations/types/reservation';

interface StartReservationChargingDialogProps {
  reservation: Reservation | null;
  stationName: string;
  isStarting: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StartReservationChargingDialog({
  reservation,
  stationName,
  isStarting,
  errorMessage,
  onOpenChange,
  onConfirm,
}: StartReservationChargingDialogProps) {
  return (
    <Dialog
      open={reservation !== null}
      onOpenChange={(open) => {
        if (!isStarting) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BatteryCharging className="size-5" />
          </div>

          <DialogTitle>
            Şarj oturumunu başlat
          </DialogTitle>

          <DialogDescription>
            {stationName} istasyonundaki rezervasyonunuz
            kullanılarak şarj oturumu başlatılacak.
          </DialogDescription>
        </DialogHeader>

        {reservation ? (
          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="size-4 text-emerald-600" />
              Rezervasyon zamanı
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {dateTimeFormatter.format(
                new Date(reservation.startAt),
              )}
              {' – '}
              {dateTimeFormatter.format(
                new Date(reservation.endAt),
              )}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Rezervasyon #{reservation.id}
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={isStarting}
              />
            }
          >
            Vazgeç
          </DialogClose>

          <Button
            type="button"
            disabled={isStarting || reservation === null}
            onClick={onConfirm}
          >
            <BatteryCharging className="size-4" />

            {isStarting
              ? 'Şarj başlatılıyor...'
              : 'Şarjı başlat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}