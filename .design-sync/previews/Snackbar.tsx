import { Snackbar } from 'software-manager-front';

const box = { position: 'relative' as const, height: 70, transform: 'translateZ(0)' };

export const Exito = () => (
  <div style={box}>
    <Snackbar message={{ id: 1, severity: 'success', text: 'Enlace copiado al portapapeles' }} onDismiss={() => {}} />
  </div>
);

export const Advertencia = () => (
  <div style={box}>
    <Snackbar message={{ id: 2, severity: 'warning', text: 'Mostrando datos con un retraso de 5 min' }} onDismiss={() => {}} />
  </div>
);

export const Fallo = () => (
  <div style={box}>
    <Snackbar message={{ id: 3, severity: 'error', text: 'No se pudo actualizar el estado de salud' }} onDismiss={() => {}} />
  </div>
);
