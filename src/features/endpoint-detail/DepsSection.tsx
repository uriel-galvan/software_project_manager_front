import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { HealthBanner } from '@/features/health/HealthBanner';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { useHub, useServiceName } from '@/features/shell/HubContext';
import { statusOf } from '@/utils/health';
import { ConsumersPanel } from './ConsumersPanel';
import { DeclaredOnlyPanel } from './DeclaredOnlyPanel';
import { DependencyGraphView } from './DependencyGraphView';
import { useDependencyGraph } from './useDependencyGraph';
import type { ConsumersPayload, EndpointDetail } from '@/types/api';

const WINDOW_OPTIONS: readonly number[] = [7, 30, 90];

interface DepsSectionProps {
  endpoint: EndpointDetail;
  consumers: ConsumersPayload | null;
  isFullScreen: boolean;
  onOpenFullScreen: () => void;
  onOpenEndpoint: (service: string, endpointId: number) => void;
  onOpenService: (slug: string) => void;
}

export function DepsSection(props: DepsSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const copy = useHealthCopy();
  const serviceName = useServiceName();

  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [depth, setDepth] = useState<number>(2);
  const [minVolume, setMinVolume] = useState<number>(0);

  const observed = props.consumers?.consumers ?? [];
  const graph = useDependencyGraph(
    props.endpoint,
    observed,
    hub.environment,
    depth,
    isGraphOpen,
  );

  const emptyBody = `${t('ENDPOINT.NO_INCOMING_BASE', { days: hub.windowDays })} ${
    hub.unreliable.length
      ? t('ENDPOINT.NO_INCOMING_UNRELIABLE', {
          count: hub.unreliable.length,
          services: hub.unreliable.map((row) => row.service).join(', '),
        })
      : t('ENDPOINT.NO_INCOMING_RELIABLE')
  }`;

  return (
    <div style={{ padding: 'var(--cp-sp-5) var(--cp-sp-5) 0' }}>
      {hub.unreliable.map((row) => {
        const view = { status: statusOf(row), raw: row };
        const name = serviceName(row.service);
        return (
          <div key={row.service} style={{ marginBottom: 'var(--cp-sp-4)' }}>
            <HealthBanner
              status={view.status}
              title={copy.warningTitle(view, name)}
              detail={copy.warningDetail(view, name, hub.environment)}
              actionLabel={t('HEALTH.WARN_ACTION', { slug: row.service })}
              onAction={() => hub.openHealthPanel(row.service)}
            />
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-3)',
          marginBottom: 'var(--cp-sp-4)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--cp-text-secondary)',
          }}
        >
          {t('ENDPOINT.WINDOW')}
        </span>
        <div className="cp-seg">
          {WINDOW_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={hub.windowDays === days}
              onClick={() => hub.setWindowDays(days)}
            >
              {t('COMMON.DAYS_SHORT', { count: days })}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>
          {t('ENDPOINT.WINDOW_HINT')}
        </span>
        <button
          type="button"
          disabled={props.isFullScreen}
          onClick={props.onOpenFullScreen}
          style={{
            marginLeft: 'auto',
            border: 0,
            background: 'transparent',
            fontSize: 12,
            fontWeight: 600,
            cursor: props.isFullScreen ? 'default' : 'pointer',
            color: props.isFullScreen
              ? 'var(--cp-text-muted)'
              : 'var(--cp-primary-500)',
          }}
        >
          {t(props.isFullScreen ? 'ENDPOINT.ALREADY_FULLSCREEN' : 'ENDPOINT.OPEN_FULLSCREEN')}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--cp-sp-4)',
          alignItems: 'start',
        }}
      >
        <ConsumersPanel
          consumers={observed}
          serviceName={serviceName}
          emptyTitle={t('ENDPOINT.NO_INCOMING_TITLE', {
            window: t('COMMON.DAYS_SHORT', { count: hub.windowDays }),
          })}
          emptyBody={emptyBody}
        />
        <DeclaredOnlyPanel
          declaredOnly={props.consumers?.declared_only ?? []}
          serviceName={serviceName}
          onOpenService={props.onOpenService}
        />
      </div>

      <div className="cp-card" style={{ marginTop: 'var(--cp-sp-5)' }}>
        <button
          type="button"
          onClick={() => setIsGraphOpen((current) => !current)}
          aria-expanded={isGraphOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cp-sp-3)',
            padding: '11px var(--cp-sp-4)',
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            borderBottom: `1px solid ${
              isGraphOpen ? 'var(--cp-border-subtle)' : 'transparent'
            }`,
          }}
        >
          <Icon
            name={isGraphOpen ? 'expand_more' : 'chevron_right'}
            size={15}
            color="var(--cp-text-secondary)"
          />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('ENDPOINT.GRAPH')}</span>
          <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
            {t('ENDPOINT.GRAPH_HINT')}
          </span>
        </button>

        {isGraphOpen ? (
          <DependencyGraphView
            graph={graph}
            depth={depth}
            minVolume={minVolume}
            onDepthChange={setDepth}
            onMinVolumeChange={setMinVolume}
            onOpenEndpoint={props.onOpenEndpoint}
            serviceName={serviceName}
          />
        ) : null}
      </div>
    </div>
  );
}
