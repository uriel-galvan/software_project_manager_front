import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { EmptyState } from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/common/Skeleton';
import type { UnresolvedHost } from '@/types/api';

const COLUMNS = '1fr 160px 160px';

interface UninstrumentedTableProps {
  hosts: UnresolvedHost[];
  isLoading: boolean;
}

/**
 * `/unresolved/` — hosts observados que ningún `regd1_host` reclama. No son
 * servicios todavía: son el backlog de adopción del paquete cliente.
 */
export function UninstrumentedTable({
  hosts,
  isLoading,
}: UninstrumentedTableProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="cp-card" style={{ marginTop: 'var(--cp-sp-6)' }}>
      <div className="cp-card-head">
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {t('SERVICES.UNINSTRUMENTED_TITLE')}
        </span>
        <span style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>
          {t('SERVICES.UNINSTRUMENTED_HINT')}
        </span>
        <span
          className="cp-code"
          style={{ marginLeft: 'auto', color: 'var(--cp-text-secondary)', flex: '0 0 auto' }}
        >
          {t('SERVICES.UNINSTRUMENTED_COUNT', { count: hosts.length })}
        </span>
      </div>

      <div className="cp-thead" style={{ gridTemplateColumns: COLUMNS }}>
        <div>{t('SERVICES.COL_HOST')}</div>
        <div className="cp-num">{t('SERVICES.COL_HOST_CALLS')}</div>
        <div aria-hidden="true" />
      </div>

      {isLoading ? (
        <TableSkeleton columns={COLUMNS} rows={2} />
      ) : hosts.length === 0 ? (
        <EmptyState
          compact
          icon="check_circle_outline"
          title={t('SERVICES.UNINSTRUMENTED_EMPTY')}
        />
      ) : (
        hosts.map((host) => (
          <div key={host.host} className="cp-trow" style={{ gridTemplateColumns: COLUMNS }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-2)' }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  flex: '0 0 auto',
                  borderRadius: 'var(--cp-r-xs)',
                  border: '1px dashed var(--cp-border-strong)',
                }}
              />
              <span className="cp-code cp-ellipsis" style={{ fontWeight: 600 }}>
                {host.host}
              </span>
            </div>
            <div className="cp-num">
              <CallVolume value={host.calls} />
            </div>
            <div style={{ color: 'var(--cp-warning)', fontWeight: 600 }}>
              {t('SERVICES.UNINSTRUMENTED_MISSING')}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
