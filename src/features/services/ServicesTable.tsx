import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { EmptyState } from '@/components/common/EmptyState';
import { HealthDot } from '@/components/common/HealthDot';
import { ServiceRef } from '@/components/common/ServiceRef';
import { SortableHeader } from '@/components/common/SortableHeader';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import type { ServiceRow, ServiceSortKey, SortDirection } from '@/types/ui';

const COLUMNS = '1fr 160px 90px 110px 100px 110px 140px';

interface ServicesTableProps {
  rows: ServiceRow[];
  isLoading: boolean;
  windowDays: number;
  sortKey: ServiceSortKey;
  sortDirection: SortDirection;
  onSort: (key: ServiceSortKey) => void;
  onOpenService: (slug: string) => void;
  onOpenHealth: (slug: string) => void;
}

export function ServicesTable(props: ServicesTableProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();

  return (
    <div className="cp-card">
      <div className="cp-thead" style={{ gridTemplateColumns: COLUMNS }}>
        <SortableHeader
          label={t('SERVICES.COL_SERVICE')}
          sortKey="name"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
        />
        <div>{t('SERVICES.COL_TEAM')}</div>
        <SortableHeader
          label={t('SERVICES.COL_ENDPOINTS')}
          sortKey="endpointCount"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <SortableHeader
          label={t('SERVICES.COL_CONSUMERS')}
          sortKey="consumerCount"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <SortableHeader
          label={t('SERVICES.COL_DEPENDS_ON')}
          sortKey="dependencyCount"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <SortableHeader
          label={t('SERVICES.COL_CALLS', { days: props.windowDays })}
          sortKey="callsInbound"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <div>{t('SERVICES.COL_HEALTH')}</div>
      </div>

      {props.isLoading ? (
        <TableSkeleton columns={COLUMNS} rows={5} />
      ) : props.rows.length === 0 ? (
        <EmptyState compact title={t('COMMON.NO_RESULTS')} />
      ) : (
        props.rows.map((row) => (
          <div
            key={row.slug}
            className="cp-trow cp-trow--clickable"
            style={{ gridTemplateColumns: COLUMNS }}
            onClick={() => props.onOpenService(row.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') props.onOpenService(row.slug);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-2)', minWidth: 0 }}>
              <ServiceRef slug={row.slug} iconOnly />
              <span style={{ fontWeight: 600, fontSize: 12 }}>{row.name}</span>
              <span
                className="cp-code cp-ellipsis"
                style={{ color: 'var(--cp-text-secondary)' }}
              >
                {row.slug}
              </span>
            </div>
            <div className="cp-code cp-ellipsis" style={{ color: 'var(--cp-text-secondary)' }}>
              {row.team || '—'}
            </div>
            <div className="cp-num cp-code">{row.endpointCount}</div>
            <div className="cp-num cp-code" style={{ fontWeight: 600 }}>
              {row.consumerCount}
            </div>
            <div className="cp-num cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
              {row.dependencyCount}
            </div>
            <div className="cp-num">
              <CallVolume
                value={row.callsInbound}
                sampleRate={row.health.raw?.sample_rate ?? 1}
              />
            </div>
            <div>
              <HealthDot
                status={row.health.status}
                label={copy.label(row.health.status)}
                tooltip={copy.tooltip(row.health, true)}
                onClick={() => props.onOpenHealth(row.slug)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
