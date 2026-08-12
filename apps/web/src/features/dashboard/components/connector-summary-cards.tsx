import {
  CircleCheck,
  CircleDot,
  PlugZap,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ConnectorStatusSummary } from '../types/dashboard';

interface ConnectorSummaryCardsProps {
  summary: ConnectorStatusSummary;
}

const summaryItems = [
  {
    key: 'total',
    label: 'Toplam connector',
    icon: PlugZap,
    className:
      'border-slate-200 bg-slate-50 text-slate-700',
  },
  {
    key: 'available',
    label: 'Müsait',
    icon: CircleCheck,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    key: 'occupied',
    label: 'Kullanımda',
    icon: CircleDot,
    className:
      'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    key: 'reserved',
    label: 'Rezerve',
    icon: ShieldAlert,
    className:
      'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    key: 'maintenance',
    label: 'Bakımda',
    icon: Wrench,
    className:
      'border-red-200 bg-red-50 text-red-700',
  },
] as const satisfies ReadonlyArray<{
  key: keyof ConnectorStatusSummary;
  label: string;
  icon: typeof PlugZap;
  className: string;
}>;

export function ConnectorSummaryCards({
  summary,
}: ConnectorSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.key}
            className={item.className}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>

                <Icon className="size-5" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                {summary[item.key]}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}