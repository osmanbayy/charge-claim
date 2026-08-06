import { getTableColumns, sql } from 'drizzle-orm';
import {
  chargingSessions,
  connectors,
  reservations,
} from '../../../../core/database/postgres/drizzle/schema';
import { ConnectorCurrentStatus } from '../../entities/connector.entity';

export const connectorWithCurrentStatusSelection = {
  ...getTableColumns(connectors),

  currentStatus: sql<ConnectorCurrentStatus>`
    CASE
      WHEN ${connectors.operationalStatus} = 'MAINTENANCE'
        THEN 'MAINTENANCE'

      WHEN EXISTS (
        SELECT 1
        FROM ${chargingSessions}
        WHERE ${chargingSessions.connectorId} = ${connectors.id}
          AND ${chargingSessions.status} = 'ACTIVE'
      )
        THEN 'OCCUPIED'

      WHEN EXISTS (
        SELECT 1
        FROM ${reservations}
        WHERE ${reservations.connectorId} = ${connectors.id}
          AND ${reservations.status} = 'CONFIRMED'
          AND ${reservations.startAt} <= NOW()
          AND ${reservations.endAt} > NOW()
      )
        THEN 'RESERVED'
      
      ELSE 'AVAILABLE'
    END  
  `.as('current_status'),
};
