import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import { compactNumber } from '@/utils/format';
import { GraphCanvas } from './GraphCanvas';
import { layoutGraph } from './graphLayout';
import type { DependencyGraph } from './useDependencyGraph';

/** A partir de aquí el grafo deja de ser legible y se ofrece una salida. */
const DENSE_THRESHOLD = 8;

interface DependencyGraphViewProps {
  graph: DependencyGraph;
  depth: number;
  minVolume: number;
  onDepthChange: (depth: number) => void;
  onMinVolumeChange: (volume: number) => void;
  onOpenEndpoint: (service: string, endpointId: number) => void;
  serviceName: (slug: string) => string;
}

export function DependencyGraphView(props: DependencyGraphViewProps): React.ReactElement {
  const { t } = useTranslation();
  const layout = layoutGraph({
    nodes: props.graph.nodes,
    edges: props.graph.edges,
    depth: props.depth,
    minVolume: props.minVolume,
    compact: compactNumber,
  });

  const isDense = layout.nodes.length >= DENSE_THRESHOLD;
  const statsKey = props.minVolume ? 'ENDPOINT.GRAPH_STATS_MIN' : 'ENDPOINT.GRAPH_STATS';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-5)',
          padding: '11px var(--cp-sp-4)',
          borderBottom: '1px solid var(--cp-border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <ControlLabel text={t('ENDPOINT.GRAPH_DEPTH')} />
        <div className="cp-seg">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={props.depth === level}
              onClick={() => props.onDepthChange(level)}
            >
              {level}
            </button>
          ))}
        </div>

        <ControlLabel text={t('ENDPOINT.GRAPH_MIN_VOLUME')} />
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={props.minVolume}
          aria-label={t('ENDPOINT.GRAPH_MIN_VOLUME')}
          onChange={(event) => props.onMinVolumeChange(Number(event.target.value))}
          style={{ width: 110, accentColor: 'var(--cp-primary-500)' }}
        />
        <span className="cp-code" style={{ width: 46, color: 'var(--cp-text-secondary)' }}>
          {props.minVolume === 0 ? t('COMMON.ALL') : compactNumber(props.minVolume)}
        </span>

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--cp-text-secondary)' }}>
          {t(statsKey, {
            nodes: layout.nodes.length,
            edges: layout.edges.length,
            depth: props.depth,
            min: compactNumber(props.minVolume),
          })}
        </span>
      </div>

      {isDense ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cp-sp-3)',
            padding: '10px var(--cp-sp-4)',
            background: 'var(--cp-warning-surface)',
            borderBottom: '1px solid var(--cp-border-subtle)',
            fontSize: 12,
          }}
        >
          <span>{t('ENDPOINT.GRAPH_DENSE', { count: layout.nodes.length })}</span>
          <button
            type="button"
            className="cp-btn cp-btn--ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => props.onMinVolumeChange(1000)}
          >
            {t('ENDPOINT.GRAPH_RAISE_MIN')}
          </button>
        </div>
      ) : null}

      {layout.nodes.length === 0 ? (
        <EmptyState compact icon="account_tree" title={t('ENDPOINT.GRAPH_EMPTY')} />
      ) : (
        <GraphCanvas
          layout={layout}
          serviceName={props.serviceName}
          onOpenEndpoint={props.onOpenEndpoint}
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '10px var(--cp-sp-4)',
          borderTop: '1px solid var(--cp-border-subtle)',
          fontSize: 11,
          color: 'var(--cp-text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <LegendItem text={t('ENDPOINT.LEGEND_LIVE')} dashed={false} />
        <LegendItem text={t('ENDPOINT.LEGEND_STALE')} dashed />
        <span>{t('ENDPOINT.LEGEND_SERVICE')}</span>
        <span>{t('ENDPOINT.LEGEND_NO_CARD')}</span>
      </div>
    </div>
  );
}

function ControlLabel({ text }: { text: string }): React.ReactElement {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--cp-text-secondary)',
      }}
    >
      {text}
    </span>
  );
}

function LegendItem({ text, dashed }: { text: string; dashed: boolean }): React.ReactElement {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 16,
          borderTop: `2px ${dashed ? 'dashed' : 'solid'} var(--cp-border-strong)`,
        }}
      />
      {text}
    </span>
  );
}
