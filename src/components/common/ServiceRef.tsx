import { initialOf } from '@/utils/format';
import { serviceTint } from '@/utils/tokens';

interface ServiceRefProps {
  slug: string;
  name?: string;
  size?: number;
  onClick?: () => void;
  /** Muestra solo el cuadro con la inicial. */
  iconOnly?: boolean;
}

export function ServiceRef({
  slug,
  name,
  size = 16,
  onClick,
  iconOnly = false,
}: ServiceRefProps): React.ReactElement {
  const { fg, bg } = serviceTint(slug);
  const label = name ?? slug;

  const square = (
    <span
      className="cp-code"
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: 'var(--cp-r-xs)',
        background: bg,
        color: fg,
        display: 'grid',
        placeItems: 'center',
        fontSize: Math.round(size * 0.6),
        fontWeight: 600,
      }}
    >
      {initialOf(label)}
    </span>
  );

  if (iconOnly) return square;

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) onClick();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--cp-sp-2)',
        minWidth: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {square}
      <span
        className="cp-ellipsis"
        style={{ fontWeight: 600, color: onClick ? 'var(--cp-primary-500)' : 'inherit' }}
      >
        {label}
      </span>
    </span>
  );
}
