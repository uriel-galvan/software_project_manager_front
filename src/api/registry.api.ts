/**
 * Llamadas tipadas al hub. Una función por ruta; sin lógica de pantalla.
 */
import { apiGet, apiGetAll, apiSend } from './client';
import type {
  ConsumersPayload,
  EndpointDetail,
  EndpointSummary,
  Environment,
  GraphPayload,
  HealthPayload,
  HostAlias,
  HostInput,
  ObservedConsumer,
  SearchPayload,
  ServiceCardInput,
  ServiceCreateInput,
  ServiceDetail,
  ServiceSummary,
  ServiceToken,
  ServiceTokenSecret,
  TokenUpdateInput,
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

/* ── administración ───────────────────────────────────────── */

export function createService(input: ServiceCreateInput): Promise<ServiceDetail> {
  return apiSend<ServiceDetail>('POST', '/services/', input);
}

export function updateService(slug: string, input: ServiceCardInput): Promise<ServiceDetail> {
  return apiSend<ServiceDetail>('PATCH', `/services/${slug}/`, input);
}

/** Devuelve la ficha al manifest: vacía `reg_locked_fields`. */
export function unlockService(slug: string): Promise<ServiceDetail> {
  return apiSend<ServiceDetail>('POST', `/services/${slug}/unlock/`);
}

export function createHost(input: HostInput): Promise<HostAlias> {
  return apiSend<HostAlias>('POST', '/hosts/', input);
}

export function updateHost(id: number, input: HostInput): Promise<HostAlias> {
  return apiSend<HostAlias>('PATCH', `/hosts/${id}/`, input);
}

export function deleteHost(id: number): Promise<void> {
  return apiSend<void>('DELETE', `/hosts/${id}/`);
}

export function fetchTokens(
  slug: string,
  includeRevoked: boolean,
  signal?: AbortSignal,
): Promise<ServiceToken[]> {
  return apiGet<ServiceToken[]>(
    '/tokens/',
    { service: slug, include_revoked: includeRevoked ? 'true' : undefined },
    signal,
  );
}

export function issueToken(
  slug: string,
  environment: string,
  label: string,
): Promise<ServiceTokenSecret> {
  return apiSend<ServiceTokenSecret>('POST', '/tokens/', {
    service: slug,
    environment,
    label,
  });
}

export function updateToken(id: number, input: TokenUpdateInput): Promise<ServiceToken> {
  return apiSend<ServiceToken>('PATCH', `/tokens/${id}/`, input);
}

/** POST y no GET: que el secreto no quede en cachés ni en el historial. */
export function revealToken(id: number): Promise<ServiceTokenSecret> {
  return apiSend<ServiceTokenSecret>('POST', `/tokens/${id}/reveal/`);
}

export function rotateToken(id: number): Promise<ServiceTokenSecret> {
  return apiSend<ServiceTokenSecret>('POST', `/tokens/${id}/rotate/`);
}

export function revokeToken(id: number): Promise<ServiceToken> {
  return apiSend<ServiceToken>('POST', `/tokens/${id}/revoke/`);
}
