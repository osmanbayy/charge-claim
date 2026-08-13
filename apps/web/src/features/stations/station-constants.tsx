import { ConnectorCurrentStatus } from "./types/station";

export const statusLabels: Record<
  ConnectorCurrentStatus,
  string
> = {
  AVAILABLE: "Müsait",
  OCCUPIED: "Kullanımda",
  RESERVED: "Rezerve",
  MAINTENANCE: "Bakımda",
};

export const statusClasses: Record<
  ConnectorCurrentStatus,
  string
> = {
  AVAILABLE:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  OCCUPIED:
    "border-orange-200 bg-orange-50 text-orange-700",
  RESERVED:
    "border-sky-400/20 bg-sky-400/10 text-sky-300",
  MAINTENANCE:
    "border-rose-400/20 bg-rose-400/10 text-rose-300",
};
