import Link from 'next/link';
import { MapPin, Plug, ArrowUpRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  statusClasses,
  statusLabels,
} from '../station-constants';
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
      className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full overflow-hidden rounded-3xl border-white/8 bg-card/90 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-300/30">
        <div className="h-1 w-full bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg tracking-[-.02em]">{station.name}<ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" /></CardTitle>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>{station.district}</span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="shrink-0 border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
            >
              <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />{availableConnectorCount} müsait
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {station.address}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4 text-sm font-medium">
            <span className="flex items-center gap-2"><Plug className="size-4 text-primary" />
            <span>
              {station.connectors.length} konnektör
            </span></span><Zap className="size-4 text-amber-500" />
          </div>

          <div className="space-y-2">
            {station.connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/45 px-3.5 py-3 transition-colors group-hover:bg-white/[.035]"
              >
                <div>
                  <p className="text-sm font-medium">
                    {connector.code}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {connector.type === 'TYPE_2'
                      ? 'Type 2'
                      : 'CCS2'}
                    {' · '}
                    {Number(connector.powerKw).toLocaleString(
                      'tr-TR',
                    )}{' '}
                    kW
                    {' · '}
                    {priceFormatter.format(
                      Number(connector.pricePerKWh),
                    )}{' '}
                    ₺/kWh
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    statusClasses[connector.currentStatus]
                  }
                >
                  {statusLabels[connector.currentStatus]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
