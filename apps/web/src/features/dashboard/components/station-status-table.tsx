import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { StationStatusSummary } from '../types/dashboard';

interface StationStatusTableProps {
  stations: StationStatusSummary[];
}

export function StationStatusTable({
  stations,
}: StationStatusTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5 text-emerald-600" />
          İstasyon durumları
        </CardTitle>
      </CardHeader>

      <CardContent>
        {stations.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Gösterilecek istasyon bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-3 py-3 font-medium">
                    İstasyon
                  </th>

                  <th className="px-3 py-3 text-center font-medium">
                    Toplam
                  </th>

                  <th className="px-3 py-3 text-center font-medium">
                    Müsait
                  </th>

                  <th className="px-3 py-3 text-center font-medium">
                    Kullanımda
                  </th>

                  <th className="px-3 py-3 text-center font-medium">
                    Rezerve
                  </th>

                  <th className="px-3 py-3 text-center font-medium">
                    Bakımda
                  </th>
                </tr>
              </thead>

              <tbody>
                {stations.map((station) => (
                  <tr
                    key={station.stationId}
                    className="border-b last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {station.stationName}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {station.district}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-center font-medium">
                      {station.total}
                    </td>

                    <td className="px-3 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        {station.available}
                      </Badge>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700"
                      >
                        {station.occupied}
                      </Badge>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700"
                      >
                        {station.reserved}
                      </Badge>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700"
                      >
                        {station.maintenance}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}