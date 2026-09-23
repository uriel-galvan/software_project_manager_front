/**
 * Un solo lugar donde la salud del reporte se convierte en texto.
 * La tabla, la banda de aviso y el panel de diagnóstico leen de aquí,
 * así que nunca pueden contradecirse.
 */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServiceHealth } from '@/types/api';
import type { HealthStatus, HealthView } from '@/types/ui';
import { exactNumber, relativeParts } from '@/utils/format';

const LABEL_KEY: Record<HealthStatus, string> = {
  ok: 'HEALTH.OK',
  incomplete: 'HEALTH.INCOMPLETE',
  no_reporting: 'HEALTH.NO_REPORTING',
  no_data: 'HEALTH.NO_DATA',
};

export interface HealthCopy {
  label: (status: HealthStatus) => string;
  tooltip: (view: HealthView, clickable: boolean) => string;
  action: (view: HealthView) => string;
  affects: (view: HealthView, name: string, slug: string) => string;
  warningTitle: (view: HealthView, name: string) => string;
  warningDetail: (view: HealthView, name: string, env: string) => string;
  relative: (iso: string | null | undefined) => string;
  samplePercent: (health: ServiceHealth | null) => number;
}

export function useHealthCopy(): HealthCopy {
  const { t } = useTranslation();

  const relative = useCallback(
    (iso: string | null | undefined): string => {
      const parts = relativeParts(iso);
      return t(parts.key, { count: parts.count });
    },
    [t],
  );

  const label = useCallback(
    (status: HealthStatus): string => t(LABEL_KEY[status]),
    [t],
  );

  const samplePercent = useCallback(
    (health: ServiceHealth | null): number => Math.round((health?.sample_rate ?? 1) * 100),
    [],
  );

  const tooltip = useCallback(
    (view: HealthView, clickable: boolean): string => {
      const last = relative(view.raw?.last_batch_at);
      const base =
        view.status === 'ok'
          ? t('HEALTH.TIP_OK', { last })
          : view.status === 'no_reporting'
            ? t('HEALTH.TIP_NO_REPORTING', { last })
            : view.status === 'incomplete'
              ? t('HEALTH.TIP_INCOMPLETE')
              : t('HEALTH.TIP_NO_DATA');
      return clickable ? base + t('HEALTH.TIP_SUFFIX') : base;
    },
    [relative, t],
  );

  const action = useCallback(
    (view: HealthView): string => {
      const health = view.raw;
      if (view.status === 'ok') return t('HEALTH.ACTION_OK');
      if (view.status === 'no_data') return t('HEALTH.ACTION_NO_DATA');
      if (view.status === 'no_reporting') return t('HEALTH.ACTION_NO_REPORTING');
      if ((health?.dropped_24h ?? 0) > 0) {
        return t('HEALTH.ACTION_DROPPED', { dropped: exactNumber(health?.dropped_24h ?? 0) });
      }
      return t('HEALTH.ACTION_SAMPLING', { rate: samplePercent(health) });
    },
    [samplePercent, t],
  );

  const affects = useCallback(
    (view: HealthView, name: string, slug: string): string => {
      if (view.status === 'ok') return t('HEALTH.AFFECTS_OK');
      if (view.status === 'no_reporting' || view.status === 'no_data') {
        return t('HEALTH.AFFECTS_NO_REPORTING', { name, slug });
      }
      return t('HEALTH.AFFECTS_INCOMPLETE', { name });
    },
    [t],
  );

  const warningTitle = useCallback(
    (view: HealthView, name: string): string =>
      view.status === 'no_reporting' || view.status === 'no_data'
        ? t('HEALTH.WARN_NO_REPORTING', { name, last: relative(view.raw?.last_batch_at) })
        : t('HEALTH.WARN_INCOMPLETE', { name }),
    [relative, t],
  );

  const warningDetail = useCallback(
    (view: HealthView, name: string, env: string): string => {
      const health = view.raw;
      if (view.status === 'no_reporting' || view.status === 'no_data') {
        return t('HEALTH.WARN_DETAIL_NO_REPORTING', { name });
      }
      if ((health?.dropped_24h ?? 0) > 0) {
        return t('HEALTH.WARN_DETAIL_DROPPED', {
          dropped: exactNumber(health?.dropped_24h ?? 0),
        });
      }
      return t('HEALTH.WARN_DETAIL_SAMPLING', { rate: samplePercent(health), env });
    },
    [samplePercent, t],
  );

  return {
    label,
    tooltip,
    action,
    affects,
    warningTitle,
    warningDetail,
    relative,
    samplePercent,
  };
}
