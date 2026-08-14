import { BatteryCharging, MapPin, PlugZap, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  AvailableConnector,
  AvailableStation,
} from '../types/availability';

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface AvailableStationCardProps {
  station: AvailableStation;
  onReserve: (
    station: AvailableStation,
    connector: AvailableConnector,
  ) => void;
}

export function AvailableStationCard({
  station,
  onReserve,
}: AvailableStationCardProps) {
  return (
    <article className="mac-window flex h-full min-w-0 max-w-full flex-col">
      <div className="mac-toolbar justify-between gap-3">
        <div className="mac-traffic-lights" aria-hidden="true">
          <span className="bg-[#ff5f57]" />
          <span className="bg-[#febc2e]" />
          <span className="bg-[#28c840]" />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          Müsait istasyon
        </span>
        <span className="w-9" />
      </div>

      <div className="flex min-w-0 flex-col items-start gap-4 border-b border-white/8 p-4 sm:flex-row sm:p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-emerald-300/15 bg-emerald-300/10 text-emerald-300">
          <BatteryCharging className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{station.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            <span className="truncate">{station.district} · {station.address}</span>
          </p>
        </div>
        <Badge className="bg-emerald-500/12 text-emerald-300 sm:ml-auto">
          {station.connectors.length} müsait
        </Badge>
      </div>

      <div className="flex-1 divide-y divide-white/6 px-2 py-2">
        {station.connectors.map((connector) => (
          <div
            key={connector.id}
            className="flex min-w-0 flex-col items-stretch gap-3 rounded-[11px] px-3 py-3 hover:bg-white/[.035] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[.055] text-muted-foreground">
                <PlugZap className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{connector.code}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {connector.type === 'TYPE_2' ? 'Type 2' : 'CCS2'} ·{' '}
                  {Number(connector.powerKw).toLocaleString('tr-TR')} kW
                </p>
              </div>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="flex items-center gap-1 text-xs font-medium sm:justify-end">
                <Zap className="size-3.5 text-amber-400" />
                {priceFormatter.format(Number(connector.pricePerKWh))} ₺/kWh
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2 w-full sm:w-auto"
                onClick={() => onReserve(station, connector)}
              >
                Rezervasyon yap
              </Button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
