import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { availabilityQueryKeys } from '@/features/availability/hooks/use-availability';
import { reservationQueryKeys } from '@/features/reservations/hooks/use-reservations';
import { startChargingFromReservation } from '../api';
import { chargingSessionKeys } from './use-charging-sessions';

export function useStartChargingFromReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startChargingFromReservation,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: chargingSessionKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: reservationQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityQueryKeys.all,
        }),
      ]);
    },
  });
}