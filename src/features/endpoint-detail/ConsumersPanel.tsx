import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { MethodBadge } from '@/components/common/MethodBadge';
import { ServiceRef } from '@/components/common/ServiceRef';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { formatDate, percentage } from '@/utils/format';
import { parseOperation } from './useDependencyGraph';
import type { ObservedConsumer } from '@/types/api';

interface ConsumersPanelProps {
  consumers: ObservedConsumer[];
  serviceName: (slug: string) => string;
  emptyTitle: string;
  emptyBody: string;
}

/**
 * Los orígenes nunca se borran por quedar fuera de la ventana: se marcan
 * `stale` y se atenúan. Un consumidor que dejó de aparecer probablemente
 * murió, pero «probablemente» no es «seguro».
 */
export function ConsumersPanel(props: ConsumersPanelProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();

  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--cp-primary-500)',
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{t('ENDPOINT.INCOMING')}</span>
        <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
          {t('ENDPOINT.INCOMING_HINT')}
        </span>
        <span
          className="cp-code"
          style={{ marginLeft: 'auto', color: 'var(--cp-text-secondary)' }}
        >
          {t('ENDPOINT.ORIGINS', { count: props.consumers.length })}
        </span>
      </div>

      {props.consumers.length === 0 ? (
        <div style={{ padding: '20px var(--cp-sp-4)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{props.emptyTitle}</div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--cp-text-secondary)',
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {props.emptyBody}
          </div>
        </div>
      ) : (
        props.consumers.map((consumer, index) => {
          const parsed = parseOperation(consumer.operation);
          const isStale = consumer.calls_window === 0;
          const errorRate =
            consumer.calls_total > 0 ? consumer.errors / consumer.calls_total : 0;

          return (
            <div
              key={`${consumer.service}-${consumer.operation}-${index}`}
              style={{
                padding: '10px var(--cp-sp-4)',
                borderBottom: '1px solid var(--cp-border-subtle)',
                opacity: isStale ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-3)' }}>
                <ServiceRef
                  slug={consumer.service || 'unattributed'}
                  name={
                    consumer.service
                      ? props.serviceName(consumer.service)
                      : t('ENDPOINT.UNATTRIBUTED')
                  }
                  size={14}
                />
                <span style={{ color: 'var(--cp-text-muted)' }}>·</span>
                <MethodBadge
                  method={parsed.method}
                  label={
                    parsed.kind === 'endpoint'
                      ? undefined
                      : t(parsed.kind === 'task' ? 'ENDPOINT.KIND_TASK' : 'ENDPOINT.KIND_LABEL')
                  }
                  dashed={parsed.kind !== 'endpoint'}
                />
                <span className="cp-code cp-ellipsis" style={{ fontSize: 12 }}>
                  {parsed.path}
                </span>
                {isStale ? (
                  <span
                    className="cp-tag"
                    title={t('ENDPOINT.LEGEND_STALE')}
                    style={{ flex: '0 0 auto' }}
                  >
                    {t('ENDPOINT.LEGEND_STALE')}
                  </span>
                ) : null}
                {consumer.health.reliable ? null : (
                  <span
                    className="cp-tag"
                    style={{
                      flex: '0 0 auto',
                      background: 'var(--cp-warning-surface)',
                      color: 'var(--cp-warning)',
                      fontWeight: 600,
                    }}
                  >
                    {t('SERVICE.NOT_REPORTING_BADGE')}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', flex: '0 0 auto' }}>
                  <CallVolume value={consumer.calls_window} bold />
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--cp-sp-4)',
                  marginTop: 5,
                  paddingLeft: 22,
                  fontSize: 11,
                  color: 'var(--cp-text-secondary)',
                }}
              >
                <span>
                  {t('ENDPOINT.LAST_SEEN', {
                    value: `${formatDate(consumer.last_seen)} · ${copy.relative(consumer.last_seen)}`,
                  })}
                </span>
                {consumer.errors > 0 ? (
                  <span>{t('ENDPOINT.ERROR_RATE', { value: percentage(errorRate) })}</span>
                ) : null}
                <span className="cp-code">
                  {consumer.call_site || t('ENDPOINT.CALL_SITE_NONE')}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
