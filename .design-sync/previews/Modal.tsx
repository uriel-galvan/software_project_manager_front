import { Modal } from 'software-manager-front';

const title = (text: string) => <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>;

export const Confirmacion = () => (
  <Modal
    size="sm"
    onClose={() => {}}
    header={title('Marcar endpoint como obsoleto')}
    footer={
      <>
        <button type="button" className="cp-btn cp-btn--ghost" style={{ marginLeft: 'auto' }}>
          Cancelar
        </button>
        <button type="button" className="cp-btn cp-btn--primary">
          Confirmar
        </button>
      </>
    }
  >
    <p>
      El endpoint <span className="cp-code">POST /v1/invoices</span> dejará de aparecer en las búsquedas del hub.
    </p>
  </Modal>
);

export const Detalle = () => (
  <Modal size="md" onClose={() => {}} header={title('Consumidores de billing')}>
    <p>Tres servicios llamaron a este endpoint en los últimos 7 días: CRM, Portal clientes y Auth.</p>
  </Modal>
);
