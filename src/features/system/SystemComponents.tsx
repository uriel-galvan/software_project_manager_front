/** DUMB — los componentes compartidos, renderizados de verdad, no dibujados. */
import { useTranslation } from 'react-i18next';
import { CallVolume } from '@/components/common/CallVolume';
import { HealthDot } from '@/components/common/HealthDot';
import { MethodBadge } from '@/components/common/MethodBadge';
import { ServiceRef } from '@/components/common/ServiceRef';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import type { HttpMethod } from '@/types/api';
import type { HealthStatus } from '@/types/ui';

const HEALTH_STATES: readonly HealthStatus[] = ['ok', 'incomplete', 'no_reporting', 'no_data'];
const SAMPLE_SERVICES: readonly string[] = ['crm', 'billing', 'portal', 'auth'];

interface SystemComponentsProps {
  methods: readonly HttpMethod[];
}

export function SystemComponents({ methods }: SystemComponentsProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--cp-sp-4)',
      }}
    >
      <ComponentCard titleKey="SYSTEM.COMP_METHOD_TITLE" ruleKey="SYSTEM.COMP_METHOD_RULE">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {methods.map((method) => (
            <MethodBadge key={method} method={method} />
          ))}
        </div>
      </ComponentCard>

      <ComponentCard titleKey="SYSTEM.COMP_ROW_TITLE" ruleKey="SYSTEM.COMP_ROW_RULE">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <MethodBadge method="GET" />
          <span className="cp-code" style={{ fontSize: 12 }}>
            /api/customers/{'{id}'}/
          </span>
          <span className="cp-ellipsis" style={{ color: 'var(--cp-text-secondary)' }}>
            {t('ENDPOINTS.COL_SUMMARY')}
          </span>
          <span className="cp-code" style={{ marginLeft: 'auto', fontWeight: 600 }}>
            4
          </span>
        </div>
      </ComponentCard>

      <ComponentCard titleKey="SYSTEM.COMP_HEALTH_TITLE" ruleKey="SYSTEM.COMP_HEALTH_RULE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {HEALTH_STATES.map((status) => (
            <HealthDot
              key={status}
              status={status}
              label={copy.label(status)}
              tooltip={copy.tooltip({ status, raw: null }, false)}
            />
          ))}
        </div>
      </ComponentCard>

      <ComponentCard titleKey="SYSTEM.COMP_SERVICE_TITLE" ruleKey="SYSTEM.COMP_SERVICE_RULE">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {SAMPLE_SERVICES.map((slug) => (
            <ServiceRef key={slug} slug={slug} size={14} />
          ))}
        </div>
      </ComponentCard>

      <ComponentCard titleKey="SYSTEM.COMP_VOLUME_TITLE" ruleKey="SYSTEM.COMP_VOLUME_RULE">
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <CallVolume value={18420} bold />
          <CallVolume value={184203} bold />
          <CallVolume value={9120} sampleRate={0.5} bold />
        </div>
      </ComponentCard>

      <ComponentCard titleKey="SYSTEM.COMP_STALE_TITLE" ruleKey="SYSTEM.COMP_STALE_RULE">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.55 }}>
          <MethodBadge method="TASK" label={t('ENDPOINT.KIND_TASK')} dashed />
          <span className="cp-code" style={{ fontSize: 12 }}>
            facturacion_mensual
          </span>
          <span className="cp-tag">{t('ENDPOINT.LEGEND_STALE')}</span>
        </div>
      </ComponentCard>
    </div>
  );
}

function ComponentCard({
  titleKey,
  ruleKey,
  children,
}: {
  titleKey: string;
  ruleKey: string;
  children: React.ReactNode;
}): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className="cp-card">
      <div
        style={{
          padding: '10px var(--cp-sp-4)',
          borderBottom: '1px solid var(--cp-border-subtle)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600 }}>{t(titleKey)}</div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--cp-text-secondary)',
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {t(ruleKey)}
        </div>
      </div>
      <div
        style={{
          padding: 'var(--cp-sp-4)',
          background: 'var(--cp-bg-inset)',
          minHeight: 74,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
