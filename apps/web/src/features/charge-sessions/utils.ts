const MS_PER_SECOND = 1_000;

export interface RemainingTime {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function calculateRemainingTime(
  plannedEndAt: string,
  currentTime: Date,
): RemainingTime {
  const plannedEndTime = new Date(plannedEndAt).getTime();

  const remainingMs = Math.max(
    plannedEndTime - currentTime.getTime(),
    0,
  );

  const totalSeconds = Math.floor(remainingMs / MS_PER_SECOND);

  const hours = Math.floor(totalSeconds / 3_600);

  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    isExpired: remainingMs === 0,
  };
}

export function formatRemainingTime(
  remainingTime: RemainingTime,
): string {
  const hours = remainingTime.hours
    .toString()
    .padStart(2, '0');

  const minutes = remainingTime.minutes
    .toString()
    .padStart(2, '0');

  const seconds = remainingTime.seconds
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}