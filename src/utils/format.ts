/** Formato de números, fechas y volúmenes. Locale del ecosistema: es-MX. */

export const LOCALE = 'es-MX';

/** 184203 → "184.2k". El exacto va en el `title`, nunca en la celda. */
export function compactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

export function exactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return value.toLocaleString(LOCALE);
}

/** Moneda del estándar: $1,234.00 */
export function currency(value: number): string {
  return value.toLocaleString(LOCALE, {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

/** Fecha del estándar: dd/MM/yyyy */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const time = date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(iso)} ${time}`;
}

export interface RelativeParts {
  /** Clave i18n con plural resuelto por i18next. */
  key: 'COMMON.REL_MINUTES' | 'COMMON.REL_HOURS' | 'COMMON.REL_DAYS' | 'COMMON.REL_NEVER';
  count: number;
}

/** Devuelve las piezas, no el texto: quien traduce es el componente. */
export function relativeParts(iso: string | null | undefined, now = Date.now()): RelativeParts {
  if (!iso) return { key: 'COMMON.REL_NEVER', count: 0 };
  const stamp = new Date(iso).getTime();
  if (Number.isNaN(stamp)) return { key: 'COMMON.REL_NEVER', count: 0 };
  const seconds = Math.max(0, (now - stamp) / 1000);
  if (seconds < 3600) return { key: 'COMMON.REL_MINUTES', count: Math.max(1, Math.round(seconds / 60)) };
  if (seconds < 86400) return { key: 'COMMON.REL_HOURS', count: Math.round(seconds / 3600) };
  return { key: 'COMMON.REL_DAYS', count: Math.round(seconds / 86400) };
}

export function daysSince(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const stamp = new Date(iso).getTime();
  if (Number.isNaN(stamp)) return Number.POSITIVE_INFINITY;
  return (now - stamp) / 86_400_000;
}

/** 0.0234 → "2.3 %" */
export function percentage(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(1).replace(/\.0$/, '')} %`;
}

export function initialOf(text: string): string {
  return (text.trim()[0] ?? '?').toUpperCase();
}
