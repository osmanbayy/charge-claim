export type HealthStatus = 'ok' | 'error';

export interface DependencyHealth {
  status: HealthStatus;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  dependencies: {
    postgres: DependencyHealth;
    redis: DependencyHealth;
  };
}
