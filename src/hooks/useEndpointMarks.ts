/**
 * Las marcas de estado de un endpoint, en un solo sitio.
 *
 * «Retirado con tráfico» es la alerta más grave del hub y aparece en la tabla,
 * en la cabecera de la ficha y en la búsqueda: si cada pantalla la compusiera
 * por su cuenta acabarían diciendo cosas distintas del mismo endpoint.
 */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { compactNumber, exactNumber, formatDate } from '@/utils/format';
import type { EndpointDetail, EndpointSummary } from '@/types/api';

export interface EndpointMark {
  id: 'retired_hot' | 'retired' | 'deprecated' | 'undocumented';
  label: string;
  fg: string;
  bg: string;
  tip: string;
}

/** El catálogo solo expone `summary` en la lista; el detalle suma descripción. */
export function isDocumented(endpoint: EndpointSummary | EndpointDetail): boolean {
  if ('regd3_description' in endpoint) {
    return Boolean(
      endpoint.regd3_summary || endpoint.regd3_description || endpoint.regd3_use_case,
    );
  }
  return Boolean(endpoint.regd3_summary);
}

export interface MarksInput {
  endpoint: EndpointSummary | EndpointDetail;
  /** Consumidores y llamadas observados; `null` mientras no se han cargado. */
  consumers: number | null;
  calls: number | null;
}

export function useEndpointMarks(): (input: MarksInput) => EndpointMark[] {
  const { t } = useTranslation();

  return useCallback(
    ({ endpoint, consumers, calls }: MarksInput): EndpointMark[] => {
      const marks: EndpointMark[] = [];
      const retiredAt = endpoint.regd3_retired_at;
      const isHot = Boolean(retiredAt) && (consumers ?? 0) > 0 && (calls ?? 0) > 0;

      if (isHot) {
        marks.push({
          id: 'retired_hot',
          label: t('ENDPOINTS.MARK_RETIRED_HOT', { calls: compactNumber(calls) }),
          fg: 'var(--cp-text-inverse)',
          bg: 'var(--cp-error)',
          tip: t('ENDPOINTS.TIP_RETIRED_HOT', {
            date: formatDate(retiredAt),
            calls: exactNumber(calls ?? 0),
            consumers: consumers ?? 0,
          }),
        });
      } else if (retiredAt) {
        marks.push({
          id: 'retired',
          label: t('ENDPOINTS.MARK_RETIRED'),
          fg: 'var(--cp-text-secondary)',
          bg: 'var(--cp-n-200)',
          tip: t('ENDPOINTS.TIP_RETIRED', { date: formatDate(retiredAt) }),
        });
      }

      if (endpoint.regd3_isdeprecated) {
        marks.push({
          id: 'deprecated',
          label: t('ENDPOINTS.MARK_DEPRECATED'),
          fg: 'var(--cp-warning)',
          bg: 'var(--cp-warning-surface)',
          tip: t('ENDPOINTS.TIP_DEPRECATED'),
        });
      }

      if (!isDocumented(endpoint)) {
        marks.push({
          id: 'undocumented',
          label: t('ENDPOINTS.MARK_UNDOCUMENTED'),
          fg: 'var(--cp-text-secondary)',
          bg: 'var(--cp-n-200)',
          tip: t('ENDPOINTS.TIP_UNDOCUMENTED'),
        });
      }

      return marks;
    },
    [t],
  );
}
