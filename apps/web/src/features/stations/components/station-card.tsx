import Link from 'next/link';
import {
  BatteryCharging,
  ChevronRight,
  Gauge,
  MapPin,
  PlugZap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { statusClasses, statusLabels } from '../station-constants';
import type { Station } from '../types/station';

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface StationCardProps {
  station: Station;
}

export function StationCard({ station }: StationCardProps) {
  const availableConnectorCount = station.connectors.filter(
    (connector) => connector.currentStatus === 'AVAILABLE',
  ).length;

  return (
    <Link
      href={`/stations/${station.id}`}
      className="group block h-full min-w-0 max-w-full rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <article className="mac-window flex h-full min-w-0 max-w-full flex-col transition-[border-color,box-shadow] duration-200 group-hover:border-white/18 group-hover:shadow-[0_32px_80px_-34px_black]">
        <div className="mac-toolbar justify-between gap-4">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span className="bg-[#ff5f57]" />
            <span className="bg-[#febc2e]" />
            <span className="bg-[#28c840]" />
          </div>

          <span className="truncate text-[11px] font-medium text-muted-foreground">
            İstasyon #{station.id}
          </span>

          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <div className="flex min-w-0 flex-col items-start gap-4 border-b border-white/8 p-4 sm:flex-row sm:p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[13px] border border-emerald-300/15 bg-emerald-300/10 text-emerald-300 shadow-[inset_0_1px_0_rgb(255_255_255/.07)]">
            <BatteryCharging className="size-6" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold tracking-[-.015em] text-foreground">
              {station.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{station.district} · {station.address}</span>
            </p>
          </div>

          <Badge
            variant="outline"
            className="shrink-0 border-emerald-400/20 bg-emerald-400/8 text-emerald-300 sm:ml-auto"
          >
            {availableConnectorCount} müsait
          </Badge>
        </div>

        <div className="grid grid-cols-[1fr_auto] border-b border-white/8 bg-black/10 px-5 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
          <span>Konnektör</span>
          <span>Durum</span>
        </div>

        <div className="flex-1 divide-y divide-white/6 px-2 py-2">
          {station.connectors.length > 0 ? (
            station.connectors.map((connector) => (
              <div
                key={connector.id}
                className="grid min-w-0 grid-cols-1 items-center gap-2 rounded-[10px] px-3 py-2.5 transition-colors group-hover:bg-white/[.025] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[.055] text-muted-foreground">
                    <PlugZap className="size-4" />
                  </span>
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate text-sm font-medium">{connector.code}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      <Gauge className="mr-1 inline size-3" />
                      {connector.type === 'TYPE_2' ? 'Type 2' : 'CCS2'} ·{' '}
                      {Number(connector.powerKw).toLocaleString('tr-TR')} kW ·{' '}
                      {priceFormatter.format(Number(connector.pricePerKWh))} ₺/kWh
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className={`${statusClasses[connector.currentStatus]} justify-self-start sm:justify-self-end`}>
                  {statusLabels[connector.currentStatus]}
                </Badge>
              </div>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              Bu istasyonda henüz konnektör bulunmuyor.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-black/10 px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
          <span>{station.connectors.length} öğe</span>
          <span>Detayları görüntüle</span>
        </div>
      </article>
    </Link>
  );
}
