import { MapPin, Plug, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AvailableConnector, AvailableStation } from '../types/availability';
import { Button } from '@/components/ui/button';

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
    <Card className='h-full'>
      <CardHeader className='space-y-3'>
        <div className="flex-items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle>{station.name}</CardTitle>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className='size-4 shrink-0' />
              <span>{station.district}</span>
            </div>
          </div>

          <Badge className='bg-emerald-600 text-white'>
            {station.connectors.length} konnektör müsait
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{station.address}</p>
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Plug className='size-4 text-emerald-600' />
          Müsait konnektörler
        </div>

        <div className="space-y-2">
          {station.connectors.map((connector) => (
            <div
              key={connector.id}
              className='flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5'
            >
              <div>
                <p className="text-sm font-medium">
                  {connector.code}
                </p>

                <p className="text-xs text-muted-foreground">
                  {connector.type === 'TYPE_2'
                    ? 'Type 2'
                    : 'CCS2'}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-sm font-medium">
                  <Zap className="size-3.5 text-amber-500" />
                  {Number(connector.powerKw).toLocaleString('tr-TR')} kW
                </div>

                <p className="text-xs text-muted-foreground">
                  {priceFormatter.format(
                    Number(connector.pricePerKWh),
                  )}{' '}
                  ₺/kWh
                </p>

                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => onReserve(station, connector)}
                >
                  Rezervasyon yap
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}