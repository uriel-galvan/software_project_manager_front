import { EmptyState } from 'software-manager-front';

export const SinResultados = () => (
  <EmptyState
    title="Ningún servicio coincide"
    body="Prueba con otro nombre o quita los filtros de entorno y salud."
  />
);

export const ConAccion = () => (
  <EmptyState
    icon="hub"
    title="Este entorno aún no reporta"
    body="Cuando un servicio envíe su primer reporte aparecerá aquí."
    action={<button type="button" className="cp-btn cp-btn--primary">Ver guía de instrumentación</button>}
  />
);

export const Compacto = () => (
  <EmptyState compact icon="link_off" title="Sin dependencias registradas" />
);
