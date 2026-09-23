import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { EmptyState } from '@/components/common/EmptyState';
import { ServiceRef } from '@/components/common/ServiceRef';
import type { ServiceDependency } from '@/types/ui';

interface DependencyPanelProps {
  title: string;
  hint: string;
  dependencies: ServiceDependency[];
  emptyText: string;
  serviceName: (slug: string) => string;
  onOpenService: (slug: string) => void;
}

function DependencyPanel(props: DependencyPanelProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span style={{ fontSize: 13, fontWeight: 600 }}>{props.title}</span>
        <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>{props.hint}</span>
      </div>
      {props.dependencies.length === 0 ? (
        <EmptyState compact icon="link_off" title={props.emptyText} />
      ) : (
        props.dependencies.map((dependency) => (
          <div
            key={dependency.slug}
            className="cp-trow"
            style={{ gridTemplateColumns: '1fr 130px 90px', opacity: dependency.stale ? 0.55 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-2)', minWidth: 0 }}>
              <ServiceRef
                slug={dependency.slug}
                name={props.serviceName(dependency.slug)}
                size={14}
                onClick={() => props.onOpenService(dependency.slug)}
              />
              {dependency.reliable ? null : (
                <span
                  className="cp-tag"
                  style={{
                    background: 'var(--cp-warning-surface)',
                    color: 'var(--cp-warning)',
                    fontWeight: 600,
                  }}
                >
                  {t('SERVICE.NOT_REPORTING_BADGE')}
                </span>
              )}
              {dependency.stale ? (
                <span className="cp-tag">{t('SERVICE.STALE_BADGE')}</span>
              ) : null}
            </div>
            <div style={{ color: 'var(--cp-text-secondary)' }}>
              {t('SERVICE.TOUCH_OPERATIONS', { count: dependency.operations })}
            </div>
            <div className="cp-num">
              <CallVolume value={dependency.calls} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

interface ServiceDependenciesProps {
  slug: string;
  incoming: ServiceDependency[];
  outgoing: ServiceDependency[];
  serviceName: (slug: string) => string;
  onOpenService: (slug: string) => void;
}

export function ServiceDependencies(props: ServiceDependenciesProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: 'var(--cp-sp-5)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cp-sp-5)',
        alignItems: 'start',
      }}
    >
      <DependencyPanel
        title={t('SERVICE.CONSUMED_BY')}
        hint={t('SERVICE.CONSUMED_BY_HINT', { slug: props.slug })}
        dependencies={props.incoming}
        emptyText={t('SERVICE.NO_INCOMING', { slug: props.slug })}
        serviceName={props.serviceName}
        onOpenService={props.onOpenService}
      />
      <DependencyPanel
        title={t('SERVICE.CONSUMES')}
        hint={t('SERVICE.CONSUMES_HINT', { slug: props.slug })}
        dependencies={props.outgoing}
        emptyText={t('SERVICE.NO_OUTGOING', { slug: props.slug })}
        serviceName={props.serviceName}
        onOpenService={props.onOpenService}
      />
      <div
        style={{
          gridColumn: '1 / -1',
          fontSize: 12,
          color: 'var(--cp-text-secondary)',
        }}
      >
        {t('SERVICE.DEPS_FOOTNOTE')}
      </div>
    </div>
  );
}
