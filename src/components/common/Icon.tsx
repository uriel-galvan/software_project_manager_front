/** Material Icons como librería principal del ecosistema. */
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  title?: string;
}

export function Icon({ name, size = 16, color, title }: IconProps): React.ReactElement {
  return (
    <span
      className="material-icons"
      aria-hidden={title ? undefined : true}
      title={title}
      style={{ fontSize: size, color: color ?? 'inherit' }}
    >
      {name}
    </span>
  );
}
