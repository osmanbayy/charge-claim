'use client';

import { BatteryCharging, CalendarClock } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { dateTimeFormatter } from '@/lib/constants';
import type { Reservation } from '@/features/reservations/types/reservation';

interface StartReservationChargingDialogProps {
  reservation: Reservation | null;
  stationName: string;
  isStarting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StartReservationChargingDialog({
  reservation,
  stationName,
  isStarting,
  onOpenChange,
  onConfirm,
}: StartReservationChargingDialogProps) {
  return (
    <ConfirmActionDialog
      open={reservation !== null}
      title="Şarj oturumunu başlat"
      description={`${stationName} istasyonundaki rezervasyonunuz kullanılarak şarj oturumu başlatılacak.`}
      confirmLabel="Şarjı başlat"
      pendingLabel="Şarj başlatılıyor..."
      icon={<BatteryCharging className="size-5" />}
      confirmIcon={<BatteryCharging className="size-4" />}
      confirmVariant="default"
      iconClassName="bg-emerald-100 text-emerald-700"
      isPending={isStarting}
      confirmDisabled={reservation === null}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    >
      {reservation ? (
        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="size-4 text-emerald-600" />
            Rezervasyon zamanı
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {dateTimeFormatter.format(new Date(reservation.startAt))}
            {' – '}
            {dateTimeFormatter.format(new Date(reservation.endAt))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Rezervasyon #{reservation.id}
          </p>
        </div>
      ) : null}
    </ConfirmActionDialog>
  );
}
