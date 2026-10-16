import { ServiceRef } from 'software-manager-front';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 10 };
const row = { display: 'flex', gap: 10, alignItems: 'center' };

export const Servicios = () => (
  <div style={col}>
    <ServiceRef slug="crm" name="CRM" />
    <ServiceRef slug="billing" name="Billing" />
    <ServiceRef slug="portal" name="Portal clientes" />
    <ServiceRef slug="auth" name="Auth" />
  </div>
);

export const Clickeable = () => <ServiceRef slug="billing" name="Billing" onClick={() => {}} />;

export const SoloIcono = () => (
  <div style={row}>
    <ServiceRef slug="crm" iconOnly size={20} />
    <ServiceRef slug="billing" iconOnly size={20} />
    <ServiceRef slug="portal" iconOnly size={20} />
    <ServiceRef slug="auth" iconOnly size={20} />
  </div>
);

export const Tamano = () => <ServiceRef slug="crm" name="CRM" size={28} />;
