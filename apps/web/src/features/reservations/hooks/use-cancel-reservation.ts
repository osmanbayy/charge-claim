import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReservation } from "../api";
import { reservationQueryKeys } from "./use-reservations";
import { availabilityQueryKeys } from "@/features/availability/hooks/use-availability";

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReservation,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: reservationQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityQueryKeys.all,
        })
      ])
    }
  });
}