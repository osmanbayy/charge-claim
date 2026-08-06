import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Station } from "../types/station";
import { ArrowRight, MapPin, Plug } from "lucide-react";
import { statusClasses, statusLabels } from "../station-constants";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface StationCardProps {
  station: Station,
}
export function StationCard({ station }: StationCardProps) {
  const availableConnectorCount = station.connectors.filter(
    (connector) => connector.currentStatus === 'AVAILABLE',
  ).length;

  return (
    <Link href={`/stations/${station.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <CardHeader className="border-b bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {station.name}
              </CardTitle>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>{station.district}</span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {availableConnectorCount} müsait
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {station.address}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Plug className="size-4 text-primary" />
            <span>
              {station.connectors.length} konnektör
            </span>
          </div>

          <div className="space-y-2">
            {station.connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {connector.code}
                  </p>

                  <p className="text-xs text-muted-foregorund">
                    {connector.type.replace("_", " ")}
                    {connector.powerKw.replace(".00", "")} kW
                    {connector.pricePerKWh.replace(".", ",")} ₺/kWh
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={statusClasses[connector.currentStatus]}
                >
                  {statusLabels[connector.currentStatus]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}