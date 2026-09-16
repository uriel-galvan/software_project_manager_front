import { Icon } from '@/components/common/Icon';
import type { HealthStatus } from '@/types/ui';

interface HealthBannerProps {
  status: HealthStatus;
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * La advertencia va encima del contenido, no en una nota al pie: quien mira
 * una lista de dependencias tiene que saber antes de leerla que está incompleta.
 */
export function HealthBanner(props: HealthBannerProps): React.ReactElement {
  const isSevere = props.status === 'no_reporting' || props.status === 'no_data';

  return (
    <div className={`cp-banner cp-banner--${isSevere ? 'error' : 'warning'}`} role="alert">
      <Icon
        name={isSevere ? 'error_outline' : 'warning_amber'}
        size={15}
        color={isSevere ? 'var(--cp-error)' : 'var(--cp-warning)'}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{props.title}</div>
        {props.detail ? (
          <div style={{ color: 'var(--cp-text-secondary)', marginTop: 2 }}>{props.detail}</div>
        ) : null}
      </div>
      {props.onAction && props.actionLabel ? (
        <button
          type="button"
          onClick={props.onAction}
          style={{
            marginLeft: 'auto',
            flex: '0 0 auto',
            border: 0,
            background: 'transparent',
            color: 'var(--cp-primary-500)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {props.actionLabel}
        </button>
      ) : null}
    </div>
  );
}
