import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { availabilityQueryKeys } from '@/features/availability/hooks/use-availability';
import { startWalkInCharging } from '../api';
import { chargingSessionKeys } from './use-charging-sessions';

export function useStartWalkInCharging() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startWalkInCharging,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: chargingSessionKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityQueryKeys.all,
        }),
      ]);
    },
  });
}