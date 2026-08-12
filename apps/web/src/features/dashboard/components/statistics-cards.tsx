import {
  BatteryCharging,
  Ban,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  UserX,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { StaffDashboardStatistics } from '../types/dashboard';

interface StatisticsCardsProps {
  statistics: StaffDashboardStatistics;
}

const countFormatter = new Intl.NumberFormat('tr-TR');

const decimalFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const energyFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function StatisticsCards({
  statistics,
}: StatisticsCardsProps) {
  const cards = [
    {
      key: 'total-reservations',
      label: 'Toplam rezervasyon',
      value: countFormatter.format(
        statistics.totalReservationCount,
      ),
      icon: CalendarDays,
      className:
        'border-slate-200 bg-slate-50 text-slate-700',
    },
    {
      key: 'completed-reservations',
      label: 'Tamamlanan rezervasyon',
      value: countFormatter.format(
        statistics.completedReservationCount,
      ),
      icon: CalendarCheck,
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    {
      key: 'cancelled-reservations',
      label: 'İptal edilen',
      value: countFormatter.format(
        statistics.cancelledReservationCount,
      ),
      icon: Ban,
      className:
        'border-red-200 bg-red-50 text-red-700',
    },
    {
      key: 'no-show',
      label: 'No-show',
      value: countFormatter.format(
        statistics.noShowReservationCount,
      ),
      helper: `%${decimalFormatter.format(
        Number(statistics.noShowRate),
      )} oran`,
      icon: UserX,
      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
      key: 'completed-sessions',
      label: 'Tamamlanan şarj',
      value: countFormatter.format(
        statistics.completedSessionCount,
      ),
      icon: BatteryCharging,
      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
      key: 'energy',
      label: 'Toplam enerji',
      value: `${energyFormatter.format(
        Number(statistics.totalEnergyKWh),
      )} kWh`,
      icon: Gauge,
      className:
        'border-cyan-200 bg-cyan-50 text-cyan-700',
    },
    {
      key: 'revenue',
      label: 'Toplam gelir',
      value: `${decimalFormatter.format(
        Number(statistics.totalRevenue),
      )} TL`,
      icon: CircleDollarSign,
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={card.className}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">
                  {card.label}
                </CardTitle>

                <Icon className="size-5" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold">
                {card.value}
              </p>

              {'helper' in card ? (
                <p className="mt-1 text-xs opacity-80">
                  {card.helper}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}