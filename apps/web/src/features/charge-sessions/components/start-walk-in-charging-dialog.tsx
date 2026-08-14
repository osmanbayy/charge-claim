'use client';

import { useState } from 'react';
import { BatteryCharging, Clock3, PlugZap, Zap } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DURATION_OPTIONS,
  type ReservationDurationMinutes,
} from '@/lib/constants';
import type { Connector, Station } from '@/features/stations/types/station';

export interface WalkInChargingSelection {
  station: Station;
  connector: Connector;
}

interface StartWalkInChargingDialogProps {
  selection: WalkInChargingSelection | null;
  isStarting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (durationMinutes: ReservationDurationMinutes) => void;
}

export function StartWalkInChargingDialog({
  selection,
  isStarting,
  onOpenChange,
  onConfirm,
}: StartWalkInChargingDialogProps) {
  const [durationMinutes, setDurationMinutes] =
    useState<ReservationDurationMinutes>(30);

  return (
    <ConfirmActionDialog
      open={selection !== null}
      title="Anlık şarjı başlat"
      description="Rezervasyon oluşturmadan seçilen connector’da şarj oturumu başlatılacak."
      confirmLabel="Şarjı başlat"
      pendingLabel="Şarj başlatılıyor..."
      icon={<BatteryCharging className="size-5" />}
      confirmIcon={<BatteryCharging className="size-4" />}
      confirmVariant="default"
      iconClassName="bg-emerald-100 text-emerald-700"
      isPending={isStarting}
      confirmDisabled={selection === null}
      onOpenChange={onOpenChange}
      onConfirm={() => onConfirm(durationMinutes)}
    >
      {selection ? (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
          <div>
            <p className="font-medium">{selection.station.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selection.station.district}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-card p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PlugZap className="size-4 text-emerald-600" />
                {selection.connector.code}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selection.connector.type === 'TYPE_2' ? 'Type 2' : 'CCS2'}
              </p>
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="size-4 text-emerald-600" />
                {Number(selection.connector.powerKw).toLocaleString('tr-TR')} kW
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {Number(selection.connector.pricePerKWh).toLocaleString(
                  'tr-TR',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}{' '}
                TL/kWh
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="walk-in-duration"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Clock3 className="size-4 text-emerald-600" />
          Planlanan süre
        </label>
        <Select
          value={String(durationMinutes)}
          onValueChange={(value) =>
            setDurationMinutes(Number(value) as ReservationDurationMinutes)
          }
          disabled={isStarting}
        >
          <SelectTrigger id="walk-in-duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((duration) => (
              <SelectItem key={duration} value={String(duration)}>
                {duration} dakika
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ConfirmActionDialog>
  );
}
