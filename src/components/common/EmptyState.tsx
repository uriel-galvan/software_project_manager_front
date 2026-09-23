import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon = 'search_off',
  title,
  body,
  action,
  compact = false,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: compact ? '26px 16px' : '56px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <Icon name={icon} size={compact ? 22 : 30} color="var(--cp-text-muted)" />
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 'var(--cp-sp-3)' }}>
          {title}
        </div>
        {body ? (
          <p
            style={{
              fontSize: 12,
              color: 'var(--cp-text-secondary)',
              margin: '8px 0 0',
              textWrap: 'pretty',
            }}
          >
            {body}
          </p>
        ) : null}
        {action ? <div style={{ marginTop: 'var(--cp-sp-5)' }}>{action}</div> : null}
      </div>
    </div>
  );
}
