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
        'border-white/8 bg-card text-slate-300',
    },
    {
      key: 'completed-reservations',
      label: 'Tamamlanan rezervasyon',
      value: countFormatter.format(
        statistics.completedReservationCount,
      ),
      icon: CalendarCheck,
      className:
        'border-emerald-400/15 bg-card text-emerald-300',
    },
    {
      key: 'cancelled-reservations',
      label: 'İptal edilen',
      value: countFormatter.format(
        statistics.cancelledReservationCount,
      ),
      icon: Ban,
      className:
        'border-rose-400/15 bg-card text-rose-300',
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
        'border-amber-400/15 bg-card text-amber-300',
    },
    {
      key: 'completed-sessions',
      label: 'Tamamlanan şarj',
      value: countFormatter.format(
        statistics.completedSessionCount,
      ),
      icon: BatteryCharging,
      className:
        'border-sky-400/15 bg-card text-sky-300',
    },
    {
      key: 'energy',
      label: 'Toplam enerji',
      value: `${energyFormatter.format(
        Number(statistics.totalEnergyKWh),
      )} kWh`,
      icon: Gauge,
      className:
        'border-cyan-400/15 bg-card text-cyan-300',
    },
    {
      key: 'revenue',
      label: 'Toplam gelir',
      value: `${decimalFormatter.format(
        Number(statistics.totalRevenue),
      )} TL`,
      icon: CircleDollarSign,
      className:
        'border-violet-400/15 bg-card text-violet-300',
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
