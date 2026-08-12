import {
  CalendarClock,
  Clock3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Reservation } from '@/features/reservations/types/reservation';
import type { Station } from '@/features/stations/types/station';
import { dateTimeFormatter } from '@/lib/constants';

interface UpcomingReservationsTableProps {
  reservations: Reservation[];
  stations: Station[];
}

export function UpcomingReservationsTable({
  reservations,
  stations,
}: UpcomingReservationsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-5 text-amber-600" />
          Yaklaşan rezervasyonlar
        </CardTitle>
      </CardHeader>

      <CardContent>
        {reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Yaklaşan rezervasyon bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-3 font-medium">
                    Rezervasyon
                  </th>

                  <th className="px-3 py-3 font-medium">
                    İstasyon / Connector
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Başlangıç
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Bitiş
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Durum
                  </th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((reservation) => {
                  const station =
                    stations.find((item) =>
                      item.connectors.some(
                        (connector) =>
                          connector.id ===
                          reservation.connectorId,
                      ),
                    ) ?? null;

                  const connector =
                    station?.connectors.find(
                      (item) =>
                        item.id ===
                        reservation.connectorId,
                    ) ?? null;

                  return (
                    <tr
                      key={reservation.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium">
                          #{reservation.id}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Kullanıcı #{reservation.userId}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-medium">
                          {station?.name ??
                            'Bilinmeyen istasyon'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {connector?.code ??
                            `Connector #${reservation.connectorId}`}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <Clock3 className="size-4 text-muted-foreground" />

                          {dateTimeFormatter.format(
                            new Date(reservation.startAt),
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {dateTimeFormatter.format(
                          new Date(reservation.endAt),
                        )}
                      </td>

                      <td className="px-3 py-4">
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-700"
                        >
                          Onaylandı
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}