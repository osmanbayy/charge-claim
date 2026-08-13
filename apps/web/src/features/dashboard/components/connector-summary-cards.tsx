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
      'border-white/8 bg-card text-slate-300',
  },
  {
    key: 'available',
    label: 'Müsait',
    icon: CircleCheck,
    className:
      'border-emerald-400/15 bg-card text-emerald-300',
  },
  {
    key: 'occupied',
    label: 'Kullanımda',
    icon: CircleDot,
    className:
      'border-sky-400/15 bg-card text-sky-300',
  },
  {
    key: 'reserved',
    label: 'Rezerve',
    icon: ShieldAlert,
    className:
      'border-amber-400/15 bg-card text-amber-300',
  },
  {
    key: 'maintenance',
    label: 'Bakımda',
    icon: Wrench,
    className:
      'border-rose-400/15 bg-card text-rose-300',
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
            className={`${item.className} rounded-2xl shadow-[0_16px_45px_-38px_currentColor] transition-transform hover:-translate-y-0.5`}
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
              <p className="text-3xl font-semibold tracking-[-.04em]">
                {summary[item.key]}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
