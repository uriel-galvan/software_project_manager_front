import { MethodBadge } from 'software-manager-front';

const row = { display: 'flex', gap: 8, flexWrap: 'wrap' as const, alignItems: 'center' };

export const Verbos = () => (
  <div style={row}>
    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => (
      <MethodBadge key={m} method={m} />
    ))}
  </div>
);

export const Tamanos = () => (
  <div style={row}>
    <MethodBadge method="GET" size="sm" />
    <MethodBadge method="GET" size="md" />
    <MethodBadge method="POST" size="md" />
  </div>
);

export const TareaDeclarada = () => (
  <div style={row}>
    <MethodBadge method="TASK" label="tarea" dashed />
    <MethodBadge method="GET" dashed />
  </div>
);
