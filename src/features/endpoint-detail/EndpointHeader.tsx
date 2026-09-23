import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { MethodBadge } from '@/components/common/MethodBadge';
import { ServiceRef } from '@/components/common/ServiceRef';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { useEndpointMarks } from '@/hooks/useEndpointMarks';
import { compactNumber, exactNumber, formatDate, percentage } from '@/utils/format';
import type { EndpointDetail } from '@/types/api';
import type { EndpointSection } from '@/types/ui';

export interface EndpointStats {
  consumers: number;
  calls: number;
  errorRate: number;
}

interface EndpointHeaderProps {
  endpoint: EndpointDetail;
  stats: EndpointStats;
  serviceName: string;
  windowDays: number;
  section: EndpointSection;
  isPathCopied: boolean;
  onSectionChange: (section: EndpointSection) => void;
  onCopyPath: () => void;
  onOpenService: () => void;
}

export function EndpointHeader(props: EndpointHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();
  const buildMarks = useEndpointMarks();

  const marks = buildMarks({
    endpoint: props.endpoint,
    consumers: props.stats.consumers,
    calls: props.stats.calls,
  });

  const sections: { key: EndpointSection; label: string; badge: string }[] = [
    {
      key: 'doc',
      label: t('ENDPOINT.SECTION_DOC'),
      badge: props.endpoint.regd3_summary ? '' : t('ENDPOINT.BADGE_MISSING'),
    },
    { key: 'contract', label: t('ENDPOINT.SECTION_CONTRACT'), badge: t('ENDPOINT.BADGE_SCHEMA') },
    {
      key: 'deps',
      label: t('ENDPOINT.SECTION_DEPS'),
      badge: String(props.stats.consumers),
    },
  ];

  return (
    <div
      style={{
        padding: 'var(--cp-sp-5) var(--cp-sp-5) 0',
        background: 'var(--cp-bg-card)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-4)' }}>
        <MethodBadge method={props.endpoint.regd3_method} size="md" />
        <span className="cp-code" style={{ fontSize: 18, fontWeight: 500 }}>
          {props.endpoint.regd3_path_template}
        </span>
        <button
          type="button"
          className="cp-btn cp-btn--ghost cp-btn--icon"
          title={t('COMMON.COPY_PATH')}
          aria-label={t('COMMON.COPY_PATH')}
          onClick={props.onCopyPath}
        >
          <Icon name={props.isPathCopied ? 'check' : 'content_copy'} size={14} />
        </button>
        {marks.map((mark) => (
          <span
            key={mark.id}
            title={mark.tip}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 'var(--cp-r-xs)',
              background: mark.bg,
              color: mark.fg,
            }}
          >
            {mark.label}
          </span>
        ))}

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cp-sp-5)',
          }}
        >
          <Stat
            label={t('ENDPOINT.CALLS_WINDOW', { days: props.windowDays })}
            value={compactNumber(props.stats.calls)}
            title={t('COMMON.CALLS_EXACT', { count: exactNumber(props.stats.calls) })}
          />
          <Stat
            label={t('ENDPOINT.ERROR_WINDOW')}
            value={percentage(props.stats.errorRate)}
            tone={props.stats.errorRate > 0.01 ? 'var(--cp-error)' : undefined}
          />
          <Stat label={t('ENDPOINT.CONSUMERS')} value={String(props.stats.consumers)} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-4)',
          marginTop: 'var(--cp-sp-3)',
          fontSize: 12,
          color: 'var(--cp-text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <ServiceRef
          slug={props.endpoint.service}
          name={props.serviceName}
          size={14}
          onClick={props.onOpenService}
        />
        <span style={{ color: 'var(--cp-text-muted)' }}>·</span>
        <span className="cp-code">{props.endpoint.regd3_owner_team || '—'}</span>
        <span style={{ color: 'var(--cp-text-muted)' }}>·</span>
        <span className="cp-code">{props.endpoint.regd3_operation_id || '—'}</span>
        <span style={{ color: 'var(--cp-text-muted)' }}>·</span>
        <span>
          {t('ENDPOINT.FIRST_SEEN', {
            first: formatDate(props.endpoint.regd3_first_seen),
            last: copy.relative(props.endpoint.regd3_last_seen),
          })}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 2, marginTop: 'var(--cp-sp-4)' }}>
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => props.onSectionChange(section.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 13px',
              fontSize: 14,
              fontWeight: 500,
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              color:
                props.section === section.key
                  ? 'var(--cp-text-primary)'
                  : 'var(--cp-text-secondary)',
              borderBottom: `2px solid ${
                props.section === section.key ? 'var(--cp-primary-500)' : 'transparent'
              }`,
            }}
          >
            {section.label}
            {section.badge ? (
              <span className="cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
                {section.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  title,
  tone,
}: {
  label: string;
  value: string;
  title?: string;
  tone?: string;
}): React.ReactElement {
  return (
    <div style={{ textAlign: 'right' }}>
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
      <div className="cp-code" title={title} style={{ fontSize: 13, fontWeight: 600, color: tone }}>
        {value}
      </div>
    </div>
  );
}
