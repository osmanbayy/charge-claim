import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStation } from "../api";
import { stationQueryKeys } from "./use-stations";

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: stationQueryKeys.all
      })
    }
  })
}