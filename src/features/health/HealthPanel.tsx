import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/common/Modal';
import { ServiceRef } from '@/components/common/ServiceRef';
import { HealthDot } from '@/components/common/HealthDot';
import { useHealthCopy } from './useHealthCopy';
import { exactNumber, formatDateTime } from '@/utils/format';
import type { HealthView } from '@/types/ui';

interface HealthPanelRow {
  key: string;
  value: string;
  tone: 'normal' | 'warning' | 'error';
}

interface HealthPanelProps {
  slug: string;
  name: string;
  team: string;
  view: HealthView;
  onClose: () => void;
  onGoToService: () => void;
}

const TONE_COLOR: Record<HealthPanelRow['tone'], string> = {
  normal: 'var(--cp-text-secondary)',
  warning: 'var(--cp-warning)',
  error: 'var(--cp-error)',
};

export function HealthPanel(props: HealthPanelProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();
  const health = props.view.raw;

  const rows: HealthPanelRow[] = [
    {
      key: t('HEALTH.ROW_LAST_BATCH'),
      value: `${formatDateTime(health?.last_batch_at)} · ${copy.relative(health?.last_batch_at)}`,
      tone: props.view.status === 'no_reporting' ? 'error' : 'normal',
    },
    {
      key: t('HEALTH.ROW_LAST_MANIFEST'),
      value: `${formatDateTime(health?.last_manifest_at)} · ${copy.relative(health?.last_manifest_at)}`,
      tone: 'normal',
    },
    {
      key: t('HEALTH.ROW_BATCHES'),
      value: exactNumber(health?.batches_24h ?? 0),
      tone: (health?.batches_24h ?? 0) === 0 ? 'error' : 'normal',
    },
    {
      key: t('HEALTH.ROW_INSTANCES'),
      value: exactNumber(health?.instances_24h ?? 0),
      tone: 'normal',
    },
    {
      key: t('HEALTH.ROW_CALLS'),
      value: exactNumber(health?.calls_24h ?? 0),
      tone: 'normal',
    },
    {
      key: t('HEALTH.ROW_DROPPED'),
      value: exactNumber(health?.dropped_24h ?? 0),
      tone: (health?.dropped_24h ?? 0) > 0 ? 'warning' : 'normal',
    },
    {
      key: t('HEALTH.ROW_SAMPLE'),
      value: String(health?.sample_rate ?? 1),
      tone: (health?.sample_rate ?? 1) < 1 ? 'warning' : 'normal',
    },
    {
      key: t('HEALTH.ROW_RELIABLE'),
      value: String(health?.reliable ?? false),
      tone: health?.reliable ? 'normal' : 'warning',
    },
  ];

  return (
    <Modal
      size="md"
      onClose={props.onClose}
      header={
        <>
          <ServiceRef slug={props.slug} size={22} iconOnly />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {t('HEALTH.PANEL_TITLE', { name: props.name })}
            </div>
            <div className="cp-code" style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
              {props.team || props.slug}
            </div>
          </div>
          <span style={{ marginLeft: 'auto' }}>
            <HealthDot
              status={props.view.status}
              label={copy.label(props.view.status)}
              tooltip={copy.tooltip(props.view, false)}
            />
          </span>
        </>
      }
      footer={
        <>
          <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
            {t('HEALTH.FOOTNOTE')}
          </span>
          <button
            type="button"
            className="cp-btn cp-btn--primary"
            style={{ marginLeft: 'auto', flex: '0 0 auto' }}
            onClick={props.onGoToService}
          >
            {t('HEALTH.GO_TO_SERVICE', { slug: props.slug })}
          </button>
        </>
      }
    >
      <SectionLabel text={t('HEALTH.WHAT_HUB_REPORTS')} />
      <div
        style={{
          marginTop: 'var(--cp-sp-3)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--cp-r)',
          overflow: 'hidden',
        }}
      >
        {rows.map((row) => (
          <div
            key={row.key}
            className="cp-trow cp-code"
            style={{
              gridTemplateColumns: '170px 1fr',
              gap: 'var(--cp-sp-3)',
              background: 'var(--cp-bg-inset)',
            }}
          >
            <span style={{ color: 'var(--cp-text-secondary)' }}>{row.key}</span>
            <span style={{ color: TONE_COLOR[row.tone] }}>{row.value}</span>
          </div>
        ))}
      </div>

      <SectionLabel text={t('HEALTH.WHAT_TO_DO')} spaced />
      <p style={{ fontSize: 12, margin: '7px 0 0', textWrap: 'pretty' }}>
        {copy.action(props.view)}
      </p>

      <SectionLabel text={t('HEALTH.WHAT_BREAKS')} spaced />
      <p
        style={{
          fontSize: 12,
          color: 'var(--cp-text-secondary)',
          margin: '7px 0 0',
          textWrap: 'pretty',
        }}
      >
        {copy.affects(props.view, props.name, props.slug)}
      </p>
    </Modal>
  );
}

function SectionLabel({
  text,
  spaced = false,
}: {
  text: string;
  spaced?: boolean;
}): React.ReactElement {
  return (
    <div
      style={{
        marginTop: spaced ? 'var(--cp-sp-5)' : 0,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: 'var(--cp-text-secondary)',
      }}
    >
      {text}
    </div>
  );
}
