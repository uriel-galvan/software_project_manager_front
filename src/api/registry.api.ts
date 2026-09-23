/**
 * Llamadas tipadas al hub. Una función por ruta; sin lógica de pantalla.
 */
import { apiGet, apiGetAll } from './client';
import type {
  ConsumersPayload,
  EndpointDetail,
  EndpointSummary,
  Environment,
  GraphPayload,
  HealthPayload,
  ObservedConsumer,
  SearchPayload,
  ServiceDetail,
  ServiceSummary,
  UnresolvedPayload,
} from '@/types/api';

/** El backend serializa una ventana variable: `calls_7d`, `calls_30d`… */
interface RawObservedConsumer extends Omit<ObservedConsumer, 'calls_window'> {
  [key: string]: unknown;
}

function normalizeConsumer(raw: RawObservedConsumer): ObservedConsumer {
  const windowKey = Object.keys(raw).find((key) => /^calls_\d+d$/.test(key));
  const callsWindow = windowKey ? Number(raw[windowKey] ?? 0) : 0;
  return {
    service: raw.service,
    operation: raw.operation,
    call_site: raw.call_site,
    calls_window: Number.isFinite(callsWindow) ? callsWindow : 0,
    calls_total: raw.calls_total,
    estimated_calls: raw.estimated_calls,
    errors: raw.errors,
    last_seen: raw.last_seen,
    health: raw.health,
  };
}

export function fetchServices(signal?: AbortSignal): Promise<ServiceSummary[]> {
  return apiGetAll<ServiceSummary>('/services/', undefined, signal);
}

export function fetchService(slug: string, signal?: AbortSignal): Promise<ServiceDetail> {
  return apiGet<ServiceDetail>(`/services/${slug}/`, undefined, signal);
}

export function fetchServiceEndpoints(
  slug: string,
  environment: Environment,
  includeRetired: boolean,
  signal?: AbortSignal,
): Promise<EndpointSummary[]> {
  return apiGet<EndpointSummary[]>(
    `/services/${slug}/endpoints/`,
    { environment, include_retired: includeRetired ? 'true' : undefined },
    signal,
  );
}

export function fetchEndpoint(id: number, signal?: AbortSignal): Promise<EndpointDetail> {
  return apiGet<EndpointDetail>(`/endpoints/${id}/`, undefined, signal);
}

export async function fetchConsumers(
  id: number,
  signal?: AbortSignal,
): Promise<ConsumersPayload> {
  const payload = await apiGet<Omit<ConsumersPayload, 'consumers'> & {
    consumers: RawObservedConsumer[];
  }>(`/endpoints/${id}/consumers/`, undefined, signal);
  return { ...payload, consumers: payload.consumers.map(normalizeConsumer) };
}

export function fetchGraph(
  environment: Environment,
  sinceDays: number,
  minCalls: number,
  signal?: AbortSignal,
): Promise<GraphPayload> {
  return apiGet<GraphPayload>(
    '/graph/',
    { environment, since: sinceDays, min_calls: minCalls || undefined },
    signal,
  );
}

export function fetchHealth(
  environment: Environment,
  signal?: AbortSignal,
): Promise<HealthPayload> {
  return apiGet<HealthPayload>('/health/', { environment }, signal);
}

export function fetchUnresolved(
  environment: Environment,
  signal?: AbortSignal,
): Promise<UnresolvedPayload> {
  return apiGet<UnresolvedPayload>('/unresolved/', { environment }, signal);
}

export function fetchSearch(
  query: string,
  environment: Environment,
  limit: number,
  signal?: AbortSignal,
): Promise<SearchPayload> {
  return apiGet<SearchPayload>('/search/', { q: query, environment, limit }, signal);
}
