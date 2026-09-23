/**
 * Puente entre un dato y el token CSS que lo pinta. Ningún componente
 * decide un color por su cuenta, y aquí no hay hex: solo nombres de token.
 */
import type { HttpMethod } from '@/types/api';
import type { HealthStatus } from '@/types/ui';

export interface TokenPair {
  fg: string;
  bg: string;
}

const METHOD_TOKENS: Record<string, TokenPair> = {
  GET: { fg: 'var(--cp-method-get-fg)', bg: 'var(--cp-method-get-bg)' },
  POST: { fg: 'var(--cp-method-post-fg)', bg: 'var(--cp-method-post-bg)' },
  PUT: { fg: 'var(--cp-method-put-fg)', bg: 'var(--cp-method-put-bg)' },
  PATCH: { fg: 'var(--cp-method-patch-fg)', bg: 'var(--cp-method-patch-bg)' },
  DELETE: { fg: 'var(--cp-method-delete-fg)', bg: 'var(--cp-method-delete-bg)' },
};

const NEUTRAL: TokenPair = {
  fg: 'var(--cp-method-neutral-fg)',
  bg: 'var(--cp-method-neutral-bg)',
};

export function methodTokens(method: HttpMethod | 'TASK' | string): TokenPair {
  return METHOD_TOKENS[method] ?? NEUTRAL;
}

const HEALTH_TOKENS: Record<HealthStatus, string> = {
  ok: 'var(--cp-success)',
  incomplete: 'var(--cp-warning)',
  no_reporting: 'var(--cp-error)',
  no_data: 'var(--cp-text-muted)',
};

const HEALTH_SURFACES: Record<HealthStatus, string> = {
  ok: 'var(--cp-success-surface)',
  incomplete: 'var(--cp-warning-surface)',
  no_reporting: 'var(--cp-error-surface)',
  no_data: 'var(--cp-n-100)',
};

export function healthTokens(status: HealthStatus): TokenPair {
  return { fg: HEALTH_TOKENS[status], bg: HEALTH_SURFACES[status] };
}

const TINT_COUNT = 5;

/**
 * Tinte estable por slug. Es reparto, no semántica: el mismo servicio
 * conserva su cuadro entre pantallas y recargas.
 */
export function serviceTint(slug: string): TokenPair {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1_000_003;
  }
  const index = (hash % TINT_COUNT) + 1;
  return { fg: `var(--cp-tint-${index}-fg)`, bg: `var(--cp-tint-${index}-bg)` };
}
