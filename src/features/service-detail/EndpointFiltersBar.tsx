import { useTranslation } from 'react-i18next';
import { methodTokens } from '@/utils/tokens';
import type { HttpMethod } from '@/types/api';
import type { EndpointFilters } from '@/types/ui';

const METHODS: readonly HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface EndpointFiltersBarProps {
  filters: EndpointFilters;
  /** Cuántos endpoints del catálogo usan cada verbo, sin aplicar filtros. */
  methodCounts: Record<string, number>;
  tags: string[];
  onChange: (filters: EndpointFilters) => void;
}

export function EndpointFiltersBar({
  filters,
  methodCounts,
  tags,
  onChange,
}: EndpointFiltersBarProps): React.ReactElement {
  const { t } = useTranslation();

  const toggleMethod = (method: HttpMethod): void => {
    const isOn = filters.methods.includes(method);
    onChange({
      ...filters,
      methods: isOn
        ? filters.methods.filter((item) => item !== method)
        : [...filters.methods, method],
    });
  };

  const toggles: { key: keyof EndpointFilters; labelKey: string }[] = [
    { key: 'onlyDeprecated', labelKey: 'ENDPOINTS.ONLY_DEPRECATED' },
    { key: 'onlyUndocumented', labelKey: 'ENDPOINTS.ONLY_UNDOCUMENTED' },
    { key: 'includeRetired', labelKey: 'ENDPOINTS.INCLUDE_RETIRED' },
  ];

  return (
    <div
      className="cp-card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--cp-sp-3)',
        padding: '10px var(--cp-sp-4)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--cp-sp-2)' }}>
        {METHODS.map((method) => {
          const isOn = filters.methods.includes(method);
          const { fg, bg } = methodTokens(method);
          return (
            <button
              key={method}
              type="button"
              className="cp-chip cp-code"
              aria-pressed={isOn}
              onClick={() => toggleMethod(method)}
              style={{
                fontWeight: 600,
                background: isOn ? bg : 'transparent',
                color: isOn ? fg : 'var(--cp-text-secondary)',
                borderColor: isOn ? fg : 'var(--cp-border)',
              }}
            >
              <span>{method}</span>
              <span style={{ fontWeight: 400, opacity: 0.75 }}>
                {methodCounts[method] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <span style={{ width: 1, height: 22, background: 'var(--cp-border)' }} />

      <input
        className="cp-input cp-code"
        style={{ width: 200 }}
        value={filters.query}
        placeholder={t('ENDPOINTS.FILTER_PLACEHOLDER')}
        aria-label={t('ENDPOINTS.FILTER_PLACEHOLDER')}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />

      <select
        className="cp-select"
        value={filters.tag}
        aria-label={t('ENDPOINTS.ALL_TAGS')}
        onChange={(event) => onChange({ ...filters, tag: event.target.value })}
      >
        <option value="">{t('ENDPOINTS.ALL_TAGS')}</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 'var(--cp-sp-2)', marginLeft: 'auto' }}>
        {toggles.map((toggle) => {
          const isOn = Boolean(filters[toggle.key]);
          return (
            <button
              key={toggle.key}
              type="button"
              className="cp-chip"
              aria-pressed={isOn}
              onClick={() => onChange({ ...filters, [toggle.key]: !isOn })}
              style={{
                fontWeight: 600,
                background: isOn ? 'var(--cp-primary-50)' : 'transparent',
                color: isOn ? 'var(--cp-primary-500)' : 'var(--cp-text-secondary)',
                borderColor: isOn ? 'var(--cp-primary-500)' : 'var(--cp-border)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: isOn ? 'var(--cp-primary-500)' : 'var(--cp-border-strong)',
                }}
              />
              {t(toggle.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
