import { useTranslation } from 'react-i18next';
import type { HealthStatus, ServiceFilters } from '@/types/ui';

const HEALTH_OPTIONS: readonly { value: HealthStatus; labelKey: string }[] = [
  { value: 'ok', labelKey: 'HEALTH.OK' },
  { value: 'incomplete', labelKey: 'HEALTH.INCOMPLETE' },
  { value: 'no_reporting', labelKey: 'HEALTH.NO_REPORTING' },
  { value: 'no_data', labelKey: 'HEALTH.NO_DATA' },
];

interface ServicesFiltersProps {
  filters: ServiceFilters;
  teams: string[];
  onChange: (filters: ServiceFilters) => void;
}

export function ServicesFilters({
  filters,
  teams,
  onChange,
}: ServicesFiltersProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: 'var(--cp-sp-3)', alignItems: 'center' }}>
      <input
        className="cp-input"
        style={{ width: 200 }}
        value={filters.query}
        placeholder={t('SERVICES.FILTER_NAME')}
        aria-label={t('SERVICES.FILTER_NAME')}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />
      <select
        className="cp-select"
        value={filters.team}
        aria-label={t('SERVICES.ALL_TEAMS')}
        onChange={(event) => onChange({ ...filters, team: event.target.value })}
      >
        <option value="">{t('SERVICES.ALL_TEAMS')}</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
      <select
        className="cp-select"
        value={filters.health}
        aria-label={t('SERVICES.ALL_HEALTH')}
        onChange={(event) =>
          onChange({ ...filters, health: event.target.value as HealthStatus | '' })
        }
      >
        <option value="">{t('SERVICES.ALL_HEALTH')}</option>
        {HEALTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
