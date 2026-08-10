import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReservation } from "../api";
import { availabilityQueryKeys } from "@/features/availability/hooks/use-availability";

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: availabilityQueryKeys.all,
      });
    },
  });
}