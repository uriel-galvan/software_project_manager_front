import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { EmptyState } from '@/components/common/EmptyState';
import { MethodBadge } from '@/components/common/MethodBadge';
import { Skeleton, TableSkeleton } from '@/components/common/Skeleton';
import { SortableHeader } from '@/components/common/SortableHeader';
import { useEndpointMarks } from '@/hooks/useEndpointMarks';
import type { EndpointSummary } from '@/types/api';
import type { EndpointSortKey, EndpointTraffic, SortDirection } from '@/types/ui';

const COLUMNS = '72px minmax(240px,1.1fr) minmax(200px,1fr) 120px 90px 90px 150px';

interface EndpointsTableProps {
  endpoints: EndpointSummary[];
  traffic: Map<number, EndpointTraffic>;
  isLoading: boolean;
  isTrafficLoading: boolean;
  windowDays: number;
  sortKey: EndpointSortKey;
  sortDirection: SortDirection;
  onSort: (key: EndpointSortKey) => void;
  onOpenEndpoint: (id: number) => void;
  emptyHint: string;
}

export function EndpointsTable(props: EndpointsTableProps): React.ReactElement {
  const { t } = useTranslation();
  const buildMarks = useEndpointMarks();

  return (
    <div className="cp-card">
      <div className="cp-thead" style={{ gridTemplateColumns: COLUMNS }}>
        <div>{t('ENDPOINTS.COL_METHOD')}</div>
        <SortableHeader
          label={t('ENDPOINTS.COL_PATH')}
          sortKey="path"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
        />
        <div>{t('ENDPOINTS.COL_SUMMARY')}</div>
        <div>{t('ENDPOINTS.COL_TAGS')}</div>
        <SortableHeader
          label={t('ENDPOINTS.COL_CONSUMERS')}
          sortKey="consumers"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <SortableHeader
          label={t('ENDPOINTS.COL_CALLS', { days: props.windowDays })}
          sortKey="calls"
          activeKey={props.sortKey}
          direction={props.sortDirection}
          onSort={props.onSort}
          align="right"
        />
        <div>{t('ENDPOINTS.COL_STATE')}</div>
      </div>

      {props.isLoading ? (
        <TableSkeleton columns={COLUMNS} rows={6} />
      ) : props.endpoints.length === 0 ? (
        <EmptyState compact title={t('ENDPOINTS.NONE_MATCH')} body={props.emptyHint} />
      ) : (
        props.endpoints.map((endpoint) => {
          const stats = props.traffic.get(endpoint.regd3_index) ?? null;
          const marks = buildMarks({
            endpoint,
            consumers: stats?.consumers ?? null,
            calls: stats?.calls ?? null,
          });
          const isHot = marks.some((mark) => mark.id === 'retired_hot');
          const isInertRetired = Boolean(endpoint.regd3_retired_at) && !isHot;

          return (
            <div
              key={endpoint.regd3_index}
              className="cp-trow cp-trow--clickable"
              role="button"
              tabIndex={0}
              onClick={() => props.onOpenEndpoint(endpoint.regd3_index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') props.onOpenEndpoint(endpoint.regd3_index);
              }}
              style={{
                gridTemplateColumns: COLUMNS,
                // El retirado inerte se atenúa; el retirado CON tráfico no:
                // es la alerta más valiosa de la pantalla.
                opacity: isInertRetired ? 0.55 : 1,
                background: isHot ? 'var(--cp-error-surface)' : undefined,
                borderLeft: `3px solid ${isHot ? 'var(--cp-error)' : 'transparent'}`,
              }}
            >
              <div>
                <MethodBadge method={endpoint.regd3_method} />
              </div>
              <div
                className="cp-code cp-ellipsis"
                style={{
                  fontSize: 12,
                  paddingRight: 'var(--cp-sp-3)',
                  textDecoration: endpoint.regd3_retired_at ? 'line-through' : 'none',
                }}
              >
                {endpoint.regd3_path_template}
              </div>
              <div
                className="cp-ellipsis"
                style={{ color: 'var(--cp-text-secondary)', paddingRight: 'var(--cp-sp-3)' }}
              >
                {endpoint.regd3_summary || '—'}
              </div>
              <div style={{ display: 'flex', gap: 3, overflow: 'hidden' }}>
                {endpoint.regd3_tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="cp-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="cp-num">
                {stats ? (
                  <span
                    className="cp-code"
                    title={
                      stats.consumers === 0
                        ? t('ENDPOINTS.TIP_NO_CONSUMERS')
                        : t('ENDPOINTS.TIP_CONSUMERS', { count: stats.consumers })
                    }
                    style={{
                      fontWeight: 600,
                      color: stats.consumers === 0 ? 'var(--cp-text-muted)' : undefined,
                    }}
                  >
                    {stats.consumers}
                  </span>
                ) : props.isTrafficLoading ? (
                  <Skeleton width={24} />
                ) : (
                  <span className="cp-code">—</span>
                )}
              </div>
              <div className="cp-num">
                {stats ? (
                  <CallVolume value={stats.calls} />
                ) : props.isTrafficLoading ? (
                  <Skeleton width={32} />
                ) : (
                  <span className="cp-code">—</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {marks.map((mark) => (
                  <span
                    key={mark.id}
                    title={mark.tip}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 'var(--cp-r-xs)',
                      background: mark.bg,
                      color: mark.fg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {mark.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
