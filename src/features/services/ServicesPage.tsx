/** SMART — catálogo de servicios. Cruza catálogo, grafo y salud. */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/common/ErrorState';
import { useHub } from '@/features/shell/HubContext';
import { ServicesFilters } from './ServicesFilters';
import { ServicesTable } from './ServicesTable';
import { UninstrumentedTable } from './UninstrumentedTable';
import type {
  ServiceFilters,
  ServiceRow,
  ServiceSortKey,
  SortDirection,
} from '@/types/ui';

const EMPTY_FILTERS: ServiceFilters = { query: '', team: '', health: '' };

function compare(a: ServiceRow, b: ServiceRow, key: ServiceSortKey): number {
  if (key === 'name') return a.name.localeCompare(b.name);
  return a[key] - b[key];
}

interface ServicesPageProps {
  onOpenService: (slug: string) => void;
}

export function ServicesPage({ onOpenService }: ServicesPageProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const [filters, setFilters] = useState<ServiceFilters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<ServiceSortKey>('consumerCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const teams = useMemo<string[]>(
    () => [...new Set(hub.rows.map((row) => row.team).filter(Boolean))].sort(),
    [hub.rows],
  );

  const visibleRows = useMemo<ServiceRow[]>(() => {
    const needle = filters.query.trim().toLowerCase();
    return hub.rows
      .filter((row) => {
        if (needle && !`${row.name} ${row.slug}`.toLowerCase().includes(needle)) return false;
        if (filters.team && row.team !== filters.team) return false;
        if (filters.health && row.health.status !== filters.health) return false;
        return true;
      })
      .sort((a, b) => (sortDirection === 'desc' ? -1 : 1) * compare(a, b, sortKey));
  }, [hub.rows, filters, sortKey, sortDirection]);

  const onSort = (key: ServiceSortKey): void => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setSortKey(key);
    setSortDirection('desc');
  };

  if (hub.error) return <ErrorState error={hub.error} onRetry={hub.reload} />;

  const hosts = hub.unresolved?.hosts ?? [];

  return (
    <div style={{ flex: 1, padding: '20px var(--cp-sp-5) 48px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--cp-sp-4)',
          marginBottom: 'var(--cp-sp-4)',
        }}
      >
        <div>
          <h1>{t('SERVICES.TITLE')}</h1>
          <div style={{ fontSize: 12, color: 'var(--cp-text-secondary)', marginTop: 3 }}>
            {t('SERVICES.SUMMARY', {
              instrumented: hub.rows.length,
              uninstrumented: hosts.length,
              env: hub.environment,
            })}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <ServicesFilters filters={filters} teams={teams} onChange={setFilters} />
        </div>
      </div>

      <ServicesTable
        rows={visibleRows}
        isLoading={hub.isLoading}
        windowDays={hub.windowDays}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        onOpenService={onOpenService}
        onOpenHealth={hub.openHealthPanel}
      />

      <UninstrumentedTable hosts={hosts} isLoading={hub.isLoading} />
    </div>
  );
}
