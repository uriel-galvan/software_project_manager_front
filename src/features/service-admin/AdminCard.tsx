/** Piezas compartidas por las tarjetas de administración. */

interface AdminCardProps {
  title: string;
  hint: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminCard({ title, hint, actions, children }: AdminCardProps): React.ReactElement {
  return (
    <div className="cp-card" style={{ marginTop: 'var(--cp-sp-4)' }}>
      <div className="cp-card-head" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>{hint}</span>
        {actions ? (
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--cp-sp-2)' }}>
            {actions}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, badge, hint, children }: FieldProps): React.ReactElement {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-2)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--cp-text-secondary)',
        }}
      >
        {label}
        {badge ? <span className="cp-tag">{badge}</span> : null}
      </span>
      {children}
      {hint ? (
        <span style={{ fontSize: 11, color: 'var(--cp-text-muted)' }}>{hint}</span>
      ) : null}
    </label>
  );
}

/** Botón de texto para acciones de fila (ver, rotar, eliminar…). */
export function RowAction({
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 0,
        padding: 0,
        background: 'transparent',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color: danger ? 'var(--cp-error)' : 'var(--cp-primary-500)',
      }}
    >
      {label}
    </button>
  );
}
