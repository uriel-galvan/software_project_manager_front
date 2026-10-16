import { HealthDot } from 'software-manager-front';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 10 };

export const Estados = () => (
  <div style={col}>
    <HealthDot status="ok" label="Reportando" tooltip="Último reporte hace 2 min" />
    <HealthDot status="incomplete" label="Incompleto" tooltip="Faltan 3 endpoints por instrumentar" />
    <HealthDot status="no_reporting" label="Sin reportar" tooltip="Sin reportes en las últimas 24 h" />
    <HealthDot status="no_data" label="Sin datos" tooltip="Aún no hay tráfico registrado" />
  </div>
);

export const Clickeable = () => (
  <HealthDot status="ok" label="Reportando" tooltip="Ver detalle de salud" onClick={() => {}} />
);
