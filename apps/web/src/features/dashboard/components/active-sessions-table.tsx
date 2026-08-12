import {
  BatteryCharging,
  Clock3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ChargingSession } from '@/features/charge-sessions/types/charging-session';
import type { Station } from '@/features/stations/types/station';
import { dateTimeFormatter } from '@/lib/constants';

interface ActiveSessionsTableProps {
  sessions: ChargingSession[];
  stations: Station[];
}

export function ActiveSessionsTable({
  sessions,
  stations,
}: ActiveSessionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BatteryCharging className="size-5 text-blue-600" />
          Aktif şarj oturumları
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Aktif şarj oturumu bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-3 font-medium">
                    Oturum
                  </th>

                  <th className="px-3 py-3 font-medium">
                    İstasyon / Connector
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Tür
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Başlangıç
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Planlanan bitiş
                  </th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => {
                  const station =
                    stations.find((item) =>
                      item.connectors.some(
                        (connector) =>
                          connector.id ===
                          session.connectorId,
                      ),
                    ) ?? null;

                  const connector =
                    station?.connectors.find(
                      (item) =>
                        item.id ===
                        session.connectorId,
                    ) ?? null;

                  return (
                    <tr
                      key={session.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium">
                          #{session.id}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Kullanıcı #{session.userId}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-medium">
                          {station?.name ??
                            'Bilinmeyen istasyon'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {connector?.code ??
                            `Connector #${session.connectorId}`}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <Badge variant="outline">
                          {session.reservationId === null
                            ? 'Anlık şarj'
                            : 'Rezervasyonlu'}
                        </Badge>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <Clock3 className="size-4 text-muted-foreground" />

                          {dateTimeFormatter.format(
                            new Date(session.startedAt),
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {dateTimeFormatter.format(
                          new Date(session.plannedEndAt),
                        )}
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