/**
 * Derivación de la salud del reporte. Las tres señales de `regd5_health`
 * llegan ya calculadas del backend; aquí solo se ordenan por gravedad.
 */
import type { HealthPayload, ServiceHealth } from '@/types/api';
import type { HealthStatus, HealthView } from '@/types/ui';

export const NO_HEALTH: HealthView = { status: 'no_data', raw: null };

export function statusOf(health: ServiceHealth | null | undefined): HealthStatus {
  if (!health) return 'no_data';
  // Deploya y no reporta es lo más grave: hay manifest y no hay tráfico.
  if (health.signals.deploys_without_reporting) return 'no_reporting';
  if (health.signals.reporting_incomplete || health.signals.partial_sampling) {
    return 'incomplete';
  }
  return 'ok';
}

export function healthViewOf(health: ServiceHealth | null | undefined): HealthView {
  return { status: statusOf(health), raw: health ?? null };
}

export function healthIndex(payload: HealthPayload | null): Map<string, ServiceHealth> {
  const index = new Map<string, ServiceHealth>();
  for (const row of payload?.services ?? []) index.set(row.service, row);
  return index;
}

/** Servicios cuyo reporte no es fiable: lo que vuelve ambigua una ausencia. */
export function unreliableServices(payload: HealthPayload | null): ServiceHealth[] {
  return (payload?.services ?? []).filter((row) => statusOf(row) !== 'ok');
}
