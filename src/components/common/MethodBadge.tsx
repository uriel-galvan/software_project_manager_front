import { methodTokens } from '@/utils/tokens';
import type { HttpMethod } from '@/types/api';

interface MethodBadgeProps {
  method: HttpMethod | 'TASK' | string;
  /** Etiqueta alternativa: «tarea», «label» — mismo badge, otro texto. */
  label?: string;
  size?: 'sm' | 'md';
  dashed?: boolean;
}

export function MethodBadge({
  method,
  label,
  size = 'sm',
  dashed = false,
}: MethodBadgeProps): React.ReactElement {
  const { fg, bg } = methodTokens(method);
  return (
    <span
      className="cp-code"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'md' ? '3px 8px' : '1px 6px',
        borderRadius: 'var(--cp-r-xs)',
        fontSize: size === 'md' ? 12 : 11,
        fontWeight: 600,
        background: bg,
        color: fg,
        border: dashed ? '1px dashed var(--cp-border-strong)' : '1px solid transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {label ?? method}
    </span>
  );
}
