/** SMART — pestaña de administración: ficha, alias de red y tokens. */
import { HostsCard } from './HostsCard';
import { ServiceCardForm } from './ServiceCardForm';
import { TokensCard } from './TokensCard';
import type { ServiceDetail } from '@/types/api';

interface ServiceAdminTabProps {
  service: ServiceDetail;
  /** La ficha o sus alias cambiaron: hay que releer el servicio. */
  onServiceChanged: () => void;
}

export function ServiceAdminTab({
  service,
  onServiceChanged,
}: ServiceAdminTabProps): React.ReactElement {
  return (
    <div style={{ padding: '0 var(--cp-sp-5)' }}>
      <ServiceCardForm service={service} onSaved={onServiceChanged} />
      <HostsCard slug={service.reg_slug} hosts={service.hosts} onChanged={onServiceChanged} />
      <TokensCard slug={service.reg_slug} />
    </div>
  );
}
