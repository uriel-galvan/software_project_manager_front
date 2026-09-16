import { useTranslation } from 'react-i18next';
import { MethodBadge } from '@/components/common/MethodBadge';
import { ServiceRef } from '@/components/common/ServiceRef';
import { compactNumber, formatDate } from '@/utils/format';
import type { GraphLayout } from './graphLayout';

interface GraphCanvasProps {
  layout: GraphLayout;
  serviceName: (slug: string) => string;
  onOpenEndpoint: (service: string, endpointId: number) => void;
}

/** El lienzo: aristas en SVG por debajo, nodos en DOM por encima. */
export function GraphCanvas(props: GraphCanvasProps): React.ReactElement {
  const { t } = useTranslation();
  const { layout } = props;

  return (
    <div style={{ padding: 'var(--cp-sp-5)', overflow: 'auto', background: 'var(--cp-bg-inset)' }}>
      <div style={{ position: 'relative', width: layout.width, height: layout.height }}>
        <svg
          width={layout.width}
          height={layout.height}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          <defs>
            <marker
              id="hub-arrow"
              viewBox="0 0 8 8"
              refX={7}
              refY={4}
              markerWidth={6}
              markerHeight={6}
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="var(--cp-border-strong)" />
            </marker>
          </defs>
          {layout.edges.map((edge, index) => (
            <path
              key={`edge-${index}`}
              d={edge.path}
              fill="none"
              stroke="var(--cp-border-strong)"
              strokeWidth={edge.width}
              strokeDasharray={edge.isStale ? '5 4' : undefined}
              opacity={edge.isStale ? 0.45 : 0.75}
              markerEnd="url(#hub-arrow)"
            />
          ))}
          {layout.edges.map((edge, index) => (
            <text
              key={`label-${index}`}
              x={edge.labelX}
              y={edge.labelY}
              textAnchor="middle"
              style={{
                fontFamily: 'var(--cp-ff)',
                fontSize: 10,
                fontWeight: 600,
                fill: 'var(--cp-text-secondary)',
              }}
            >
              {edge.label}
            </text>
          ))}
        </svg>

        {layout.groups.map((group) => (
          <div
            key={group.key}
            style={{
              position: 'absolute',
              left: group.x,
              top: group.y,
              width: group.w,
              height: group.h,
              border: '1px dashed var(--cp-border-strong)',
              borderRadius: 'var(--cp-r)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px' }}>
              <ServiceRef slug={group.service} size={12} iconOnly />
              <span
                className="cp-code cp-ellipsis"
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--cp-text-secondary)' }}
              >
                {props.serviceName(group.service)}
              </span>
            </div>
          </div>
        ))}

        {layout.nodes.map((node) => {
          const isLinkable = node.endpointId !== null && !node.isRoot;
          const open = (): void => {
            if (isLinkable && node.endpointId !== null) {
              props.onOpenEndpoint(node.service, node.endpointId);
            }
          };
          return (
            <div
              key={node.key}
              onClick={open}
              role={isLinkable ? 'button' : undefined}
              tabIndex={isLinkable ? 0 : undefined}
              onKeyDown={(event) => {
                if (event.key === 'Enter') open();
              }}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.w,
                height: node.h,
                padding: '5px 8px',
                borderRadius: 'var(--cp-r-sm)',
                cursor: isLinkable ? 'pointer' : 'default',
                opacity: node.stale ? 0.55 : 1,
                background: node.isRoot
                  ? 'var(--cp-primary-50)'
                  : node.kind === 'endpoint'
                    ? 'var(--cp-bg-card)'
                    : 'var(--cp-n-100)',
                border: node.isRoot
                  ? '1.5px solid var(--cp-primary-500)'
                  : node.kind === 'endpoint'
                    ? '1px solid var(--cp-border)'
                    : '1px dashed var(--cp-border-strong)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <MethodBadge
                  method={node.method}
                  label={
                    node.kind === 'endpoint'
                      ? undefined
                      : t(node.kind === 'task' ? 'ENDPOINT.KIND_TASK' : 'ENDPOINT.KIND_LABEL')
                  }
                />
                <span
                  className="cp-code cp-ellipsis"
                  style={{
                    fontSize: 11,
                    color: isLinkable ? 'var(--cp-primary-500)' : 'var(--cp-text-primary)',
                  }}
                >
                  {node.path}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                <span className="cp-code" style={{ fontWeight: 600 }}>
                  {node.isRoot ? '' : compactNumber(node.calls)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--cp-text-secondary)' }}>
                  {node.stale && node.lastSeen ? formatDate(node.lastSeen) : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
