import { healthTokens } from '@/utils/tokens';
import type { HealthStatus } from '@/types/ui';

interface HealthDotProps {
  status: HealthStatus;
  label: string;
  tooltip: string;
  onClick?: () => void;
}

export function HealthDot({
  status,
  label,
  tooltip,
  onClick,
}: HealthDotProps): React.ReactElement {
  const { fg } = healthTokens(status);
  return (
    <span
      title={tooltip}
      onClick={(event) => {
        if (!onClick) return;
        event.stopPropagation();
        onClick();
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.stopPropagation();
          onClick();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--cp-sp-2)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: fg,
          flex: '0 0 auto',
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: fg, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </span>
  );
}
