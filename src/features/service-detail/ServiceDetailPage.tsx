/** SMART — ficha de servicio: catálogo de endpoints y dependencias gruesas. */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchService, fetchServiceEndpoints } from '@/api/registry.api';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/Skeleton';
import { HealthBanner } from '@/features/health/HealthBanner';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { useHub, useServiceName } from '@/features/shell/HubContext';
import { useAsync } from '@/hooks/useAsync';
import { useEndpointTraffic } from '@/hooks/useEndpointTraffic';
import { isDocumented } from '@/hooks/useEndpointMarks';
import { neighboursOf } from '@/utils/graph';
import { exactNumber } from '@/utils/format';
import { EndpointFiltersBar } from './EndpointFiltersBar';
import { EndpointsTable } from './EndpointsTable';
import { ServiceDependencies } from './ServiceDependencies';
import { ServiceHeader, type ServiceTab } from './ServiceHeader';
import type { EndpointSummary, ServiceDetail } from '@/types/api';
import type { EndpointFilters, EndpointSortKey, SortDirection } from '@/types/ui';

const EMPTY_FILTERS: EndpointFilters = {
  methods: [],
  query: '',
  tag: '',
  onlyDeprecated: false,
  onlyUndocumented: false,
  includeRetired: false,
};

interface ServiceDetailPageProps {
  slug: string;
  onOpenEndpoint: (slug: string, endpointId: number) => void;
  onOpenService: (slug: string) => void;
}

interface ServiceBundle {
  service: ServiceDetail;
  endpoints: EndpointSummary[];
}

export function ServiceDetailPage(props: ServiceDetailPageProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const copy = useHealthCopy();
  const serviceName = useServiceName();

  const [tab, setTab] = useState<ServiceTab>('endpoints');
  const [filters, setFilters] = useState<EndpointFilters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<EndpointSortKey>('consumers');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const bundle = useAsync<ServiceBundle>(
    async (signal) => {
      const [service, endpoints] = await Promise.all([
        fetchService(props.slug, signal),
        fetchServiceEndpoints(props.slug, hub.environment, filters.includeRetired, signal),
      ]);
      return { service, endpoints };
    },
    [props.slug, hub.environment, filters.includeRetired],
  );

  const allEndpoints = bundle.data?.endpoints ?? [];
  const health = hub.healthOf(props.slug);

  const visible = useMemo<EndpointSummary[]>(() => {
    const needle = filters.query.trim().toLowerCase();
    return allEndpoints.filter((endpoint) => {
      if (filters.onlyDeprecated && !endpoint.regd3_isdeprecated) return false;
      if (filters.onlyUndocumented && isDocumented(endpoint)) return false;
      if (filters.methods.length && !filters.methods.includes(endpoint.regd3_method)) {
        return false;
      }
      if (filters.tag && !endpoint.regd3_tags.includes(filters.tag)) return false;
      if (
        needle &&
        !`${endpoint.regd3_path_template} ${endpoint.regd3_summary}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [allEndpoints, filters]);

  const traffic = useEndpointTraffic(
    useMemo(() => visible.map((endpoint) => endpoint.regd3_index), [visible]),
  );

  const sorted = useMemo<EndpointSummary[]>(() => {
    const factor = sortDirection === 'desc' ? -1 : 1;
    return [...visible].sort((a, b) => {
      if (sortKey === 'path') {
        return factor * a.regd3_path_template.localeCompare(b.regd3_path_template);
      }
      const statsA = traffic.byEndpoint.get(a.regd3_index);
      const statsB = traffic.byEndpoint.get(b.regd3_index);
      const valueA = sortKey === 'calls' ? (statsA?.calls ?? 0) : (statsA?.consumers ?? 0);
      const valueB = sortKey === 'calls' ? (statsB?.calls ?? 0) : (statsB?.consumers ?? 0);
      return factor * (valueA - valueB);
    });
  }, [visible, sortKey, sortDirection, traffic.byEndpoint]);

  const methodCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const endpoint of allEndpoints) {
      counts[endpoint.regd3_method] = (counts[endpoint.regd3_method] ?? 0) + 1;
    }
    return counts;
  }, [allEndpoints]);

  const tags = useMemo<string[]>(
    () => [...new Set(allEndpoints.flatMap((endpoint) => endpoint.regd3_tags))].sort(),
    [allEndpoints],
  );

  const neighbours = useMemo(
    () => neighboursOf(hub.graph, props.slug),
    [hub.graph, props.slug],
  );

  const onSort = (key: EndpointSortKey): void => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setSortKey(key);
    setSortDirection('desc');
  };

  if (bundle.error) return <ErrorState error={bundle.error} onRetry={bundle.reload} />;
  if (!bundle.data) {
    return (
      <div style={{ padding: 'var(--cp-sp-5)' }}>
        <div className="cp-card">
          <TableSkeleton columns="1fr 1fr 1fr" rows={6} />
        </div>
      </div>
    );
  }

  const service = bundle.data.service;
  const displayName = service.reg_name || service.reg_slug;
  const hasFilters =
    filters.methods.length > 0 ||
    Boolean(filters.query) ||
    Boolean(filters.tag) ||
    filters.onlyDeprecated ||
    filters.onlyUndocumented ||
    filters.includeRetired;

  return (
    <div style={{ flex: 1, paddingBottom: 48 }}>
      <ServiceHeader
        service={service}
        environment={hub.environment}
        health={health}
        endpointCount={allEndpoints.length}
        activeTab={tab}
        onTabChange={setTab}
        onOpenHealth={() => hub.openHealthPanel(props.slug)}
      />

      {health.status === 'ok' ? null : (
        <div style={{ margin: 'var(--cp-sp-4) var(--cp-sp-5) 0' }}>
          <HealthBanner
            status={health.status}
            title={copy.warningTitle(health, displayName)}
            detail={serviceWarningDetail()}
            actionLabel={t('HEALTH.WARN_ACTION', { slug: props.slug })}
            onAction={() => hub.openHealthPanel(props.slug)}
          />
        </div>
      )}

      {tab === 'endpoints' ? (
        <div style={{ padding: 'var(--cp-sp-4) var(--cp-sp-5) 0' }}>
          <EndpointFiltersBar
            filters={filters}
            methodCounts={methodCounts}
            tags={tags}
            onChange={setFilters}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cp-sp-3)',
              margin: '11px 0 8px',
              fontSize: 12,
              color: 'var(--cp-text-secondary)',
            }}
          >
            <span>
              {t('ENDPOINTS.COUNT_LABEL', {
                visible: sorted.length,
                total: allEndpoints.length,
                sort: t(
                  sortKey === 'consumers'
                    ? 'ENDPOINTS.SORT_CONSUMERS'
                    : sortKey === 'calls'
                      ? 'ENDPOINTS.SORT_CALLS'
                      : 'ENDPOINTS.SORT_PATH',
                ),
              })}
            </span>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'var(--cp-primary-500)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {t('COMMON.CLEAR_FILTERS')}
              </button>
            ) : null}
          </div>
          <EndpointsTable
            endpoints={sorted}
            traffic={traffic.byEndpoint}
            isLoading={bundle.isLoading}
            isTrafficLoading={traffic.isLoading}
            windowDays={hub.windowDays}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={onSort}
            onOpenEndpoint={(id) => props.onOpenEndpoint(props.slug, id)}
            emptyHint={t(
              filters.includeRetired
                ? 'ENDPOINTS.NONE_MATCH_HINT_RETIRED'
                : 'ENDPOINTS.NONE_MATCH_HINT',
            )}
          />
        </div>
      ) : (
        <ServiceDependencies
          slug={props.slug}
          incoming={neighbours.incoming}
          outgoing={neighbours.outgoing}
          serviceName={serviceName}
          onOpenService={props.onOpenService}
        />
      )}
    </div>
  );

  function serviceWarningDetail(): string {
    if (health.status === 'no_data') {
      return t('SERVICE.WARN_NO_DATA', { env: hub.environment });
    }
    if (health.status === 'no_reporting') {
      return t('SERVICE.WARN_NO_REPORTING', {
        name: displayName,
        last: copy.relative(health.raw?.last_batch_at),
      });
    }
    if ((health.raw?.dropped_24h ?? 0) > 0) {
      return t('SERVICE.WARN_DROPPED', {
        dropped: exactNumber(health.raw?.dropped_24h ?? 0),
      });
    }
    return t('SERVICE.WARN_SAMPLING', {
      rate: copy.samplePercent(health.raw),
      env: hub.environment,
    });
  }
}
