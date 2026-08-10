export const DURATION_OPTIONS = [30, 60, 90, 120] as const;

export type ReservationDurationMinutes =
  (typeof DURATION_OPTIONS)[number];

export type ReservationStatus =
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export const DISTRICT_OPTIONS = [
  'Ataşehir',
  'Bakırköy',
  'Beylikdüzü',
  'Beşiktaş',
  'Kadıköy',
  'Kartal',
  'Maltepe',
  'Sarıyer',
  'Şişli',
  'Üsküdar',
] as const;

export const MILLISECONDS_PER_MINUTE = 60_000;

export const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul',
});
