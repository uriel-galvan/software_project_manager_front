import { Icon } from 'software-manager-front';

const row = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' as const };

export const Galeria = () => (
  <div style={row}>
    {['search', 'close', 'content_copy', 'dark_mode', 'cloud_off', 'search_off', 'hub', 'warning'].map((n) => (
      <Icon key={n} name={n} size={22} title={n} />
    ))}
  </div>
);

export const Tamanos = () => (
  <div style={row}>
    <Icon name="hub" size={14} />
    <Icon name="hub" size={20} />
    <Icon name="hub" size={30} />
  </div>
);

export const Colores = () => (
  <div style={row}>
    <Icon name="check_circle" size={22} color="var(--cp-success)" />
    <Icon name="error" size={22} color="var(--cp-error)" />
    <Icon name="warning" size={22} color="var(--cp-warning)" />
    <Icon name="info" size={22} color="var(--cp-info-dark)" />
    <Icon name="more_horiz" size={22} color="var(--cp-text-muted)" />
  </div>
);
