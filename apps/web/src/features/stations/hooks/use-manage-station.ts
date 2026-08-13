import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createConnector, updateConnectorOperationalStatus, updateStation } from '../api';
import type { ConnectorOperationalStatus, CreateConnectorInput, UpdateStationInput } from '../types/station';
import { stationQueryKeys } from './use-stations';

export function useManageStation(stationId: number) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: stationQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: stationQueryKeys.detail(stationId) }),
    ]);
  };

  const stationMutation = useMutation({
    mutationFn: (input: UpdateStationInput) => updateStation(stationId, input),
    onSuccess: refresh,
  });
  const connectorMutation = useMutation({
    mutationFn: (input: CreateConnectorInput) => createConnector(stationId, input),
    onSuccess: refresh,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ConnectorOperationalStatus }) =>
      updateConnectorOperationalStatus(id, status),
    onSuccess: refresh,
  });

  return { stationMutation, connectorMutation, statusMutation };
}
