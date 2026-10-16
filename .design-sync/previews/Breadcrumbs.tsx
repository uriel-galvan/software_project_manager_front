import { Breadcrumbs } from 'software-manager-front';

export const DetalleDeEndpoint = () => (
  <div style={{ width: 640 }}>
    <Breadcrumbs
      crumbs={[
        { label: 'Servicios', onClick: () => {} },
        { label: 'billing', onClick: () => {} },
        { label: 'POST /v1/invoices', isCode: true },
      ]}
      activeTab={null}
      onGoStates={() => {}}
      onGoSystem={() => {}}
    />
  </div>
);

export const PestanaEstados = () => (
  <div style={{ width: 640 }}>
    <Breadcrumbs crumbs={[{ label: 'Servicios' }]} activeTab="states" onGoStates={() => {}} onGoSystem={() => {}} />
  </div>
);
