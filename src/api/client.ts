/**
 * Cliente HTTP del hub. Desenvuelve la envoltura ASCEND
 * (`{status, data}`) y normaliza el error a una sola excepción.
 */
import type { AscendEnvelope, Paginated } from '@/types/api';

/**
 * Vacío = mismo origen, que es el modo normal: en desarrollo el proxy de Vite
 * reenvía `/services/apis` al hub y en producción front y backend comparten
 * reverse proxy. Solo se pone URL absoluta para apuntar a otro despliegue, y
 * entonces el hub tiene que emitir cabeceras CORS.
 */
const BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

function origin(): string {
  return BASE_URL || window.location.origin;
}

/** Prefijo de lectura del ecosistema (backend-standards §26). */
const API_PREFIX = '/services/apis';

export class ApiError extends Error {
  readonly status: number;
  /** Clave i18n con la que la UI traduce el fallo. */
  readonly i18nKey: string;

  constructor(message: string, status: number, i18nKey: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.i18nKey = i18nKey;
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${origin()}${API_PREFIX}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function errorKeyFor(status: number): string {
  if (status === 0) return 'ERRORS.NETWORK';
  if (status === 404) return 'ERRORS.NOT_FOUND';
  if (status === 401 || status === 403) return 'ERRORS.FORBIDDEN';
  if (status >= 500) return 'ERRORS.SERVER';
  return 'ERRORS.UNKNOWN';
}

export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError('network unreachable', 0, errorKeyFor(0));
  }

  const payload = (await response.json().catch(() => null)) as AscendEnvelope<T> | null;

  if (!response.ok) {
    const message =
      payload && payload.status === 'error'
        ? (payload.message ?? payload.detail ?? response.statusText)
        : response.statusText;
    throw new ApiError(message, response.status, errorKeyFor(response.status));
  }

  if (!payload || payload.status !== 'success') {
    throw new ApiError('malformed envelope', response.status, 'ERRORS.UNKNOWN');
  }

  return payload.data;
}

/** `/healthz/` vive fuera de `/services/apis/`: es la sonda del proceso. */
export async function apiHealthz<T>(signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${origin()}/healthz/`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = (await response.json()) as AscendEnvelope<T>;
  if (payload.status !== 'success') {
    throw new ApiError('healthz down', response.status, 'ERRORS.SERVER');
  }
  return payload.data;
}

/** Tope de páginas: 50 x 50 = 2 500 filas. Más que eso es un error de uso. */
const MAX_PAGES = 50;

/**
 * Recorre un listado paginado hasta agotarlo.
 *
 * Se pagina con `page=N` en vez de seguir el `next` que devuelve DRF: ese
 * `next` es absoluto y lo construye Django con su propio host, que detrás del
 * proxy de desarrollo no es el origen del navegador.
 */
export async function apiGetAll<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T[]> {
  const collected: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const chunk = await apiGet<Paginated<T>>(path, { ...params, page }, signal);
    collected.push(...chunk.results);
    if (!chunk.next) break;
  }
  return collected;
}
