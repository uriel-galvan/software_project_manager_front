import { useTranslation } from 'react-i18next';
import { HealthDot } from '@/components/common/HealthDot';
import { ServiceRef } from '@/components/common/ServiceRef';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { daysSince, formatDate } from '@/utils/format';
import type { ServiceDetail } from '@/types/api';
import type { HealthView } from '@/types/ui';

/** Un manifest de más de dos semanas ya merece una mirada. */
const STALE_MANIFEST_DAYS = 14;

export type ServiceTab = 'endpoints' | 'dependencies';

interface ServiceHeaderProps {
  service: ServiceDetail;
  /** Entorno activo: los alias de red son por entorno, no globales. */
  environment: string;
  health: HealthView;
  endpointCount: number;
  activeTab: ServiceTab;
  onTabChange: (tab: ServiceTab) => void;
  onOpenHealth: () => void;
}

export function ServiceHeader(props: ServiceHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();
  const manifestAt = props.health.raw?.last_manifest_at ?? null;
  const hosts = props.service.hosts.filter(
    (host) => host.regd1_environment === props.environment,
  );
  const isManifestStale = daysSince(manifestAt) > STALE_MANIFEST_DAYS;

  const tabStyle = (tab: ServiceTab): React.CSSProperties => ({
    padding: '8px 13px',
    fontSize: 14,
    fontWeight: 500,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    color: props.activeTab === tab ? 'var(--cp-text-primary)' : 'var(--cp-text-secondary)',
    borderBottom: `2px solid ${
      props.activeTab === tab ? 'var(--cp-primary-500)' : 'transparent'
    }`,
  });

  return (
    <div
      style={{
        padding: '20px var(--cp-sp-5) 0',
        background: 'var(--cp-bg-card)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--cp-sp-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-3)' }}>
          <ServiceRef slug={props.service.reg_slug} size={30} iconOnly />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--cp-sp-3)' }}>
              <h1 style={{ fontSize: 20 }}>
                {props.service.reg_name || props.service.reg_slug}
              </h1>
              <span className="cp-code" style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>
                {props.service.reg_slug}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--cp-text-secondary)', marginTop: 2 }}>
              {props.service.reg_description || '—'}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cp-sp-2)',
                marginTop: 4,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
                {t('SERVICE.HOSTS')}
              </span>
              {hosts.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--cp-text-muted)' }}>—</span>
              ) : (
                hosts.map((host) => (
                  <span key={host.regd1_index} className="cp-tag cp-code">
                    {host.regd1_host}
                  </span>
                ))
              )}
              {props.service.reg_repo_url ? (
                <a
                  href={props.service.reg_repo_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11 }}
                >
                  {t('SERVICE.REPO')}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--cp-r)',
            overflow: 'hidden',
          }}
        >
          <MetaCell label={t('SERVICE.TEAM')}>
            <span className="cp-code">{props.service.reg_owner_team || '—'}</span>
          </MetaCell>
          <MetaCell label={t('SERVICE.MANIFEST')}>
            <span className="cp-code">{formatDate(manifestAt)}</span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: isManifestStale ? 'var(--cp-warning)' : 'var(--cp-text-secondary)',
              }}
            >
              {copy.relative(manifestAt)}
            </span>
          </MetaCell>
          <button
            type="button"
            onClick={props.onOpenHealth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cp-sp-3)',
              padding: '8px var(--cp-sp-4)',
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              background: 'var(--cp-bg-inset)',
            }}
          >
            <HealthDot
              status={props.health.status}
              label={copy.label(props.health.status)}
              tooltip={copy.tooltip(props.health, true)}
            />
            <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
              {t('SERVICE.LAST_BATCH', {
                value: copy.relative(props.health.raw?.last_batch_at),
              })}
            </span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, marginTop: 'var(--cp-sp-5)' }}>
        <button
          type="button"
          style={tabStyle('endpoints')}
          onClick={() => props.onTabChange('endpoints')}
        >
          {t('SERVICE.TAB_ENDPOINTS')}{' '}
          <span className="cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
            {props.endpointCount}
          </span>
        </button>
        <button
          type="button"
          style={tabStyle('dependencies')}
          onClick={() => props.onTabChange('dependencies')}
        >
          {t('SERVICE.TAB_DEPENDENCIES')}
        </button>
      </div>
    </div>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div style={{ padding: '8px var(--cp-sp-4)', borderRight: '1px solid var(--cp-border)' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: 'var(--cp-text-secondary)',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, marginTop: 2 }}>{children}</div>
    </div>
  );
}
