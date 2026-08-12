import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { availabilityQueryKeys } from '@/features/availability/hooks/use-availability';
import { reservationQueryKeys } from '@/features/reservations/hooks/use-reservations';
import { stopChargingSession } from '../api';
import { chargingSessionKeys } from './use-charging-sessions';

export function useStopChargingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopChargingSession,

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