/** SMART — ficha de endpoint: documentación, contrato y dependencias. */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchConsumers, fetchEndpoint } from '@/api/registry.api';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useHub, useServiceName } from '@/features/shell/HubContext';
import { useAsync } from '@/hooks/useAsync';
import { ContractSection } from './ContractSection';
import { DepsSection } from './DepsSection';
import { DocSection } from './DocSection';
import { EndpointHeader, type EndpointStats } from './EndpointHeader';
import type { ConsumersPayload, EndpointDetail } from '@/types/api';
import type { EndpointSection } from '@/types/ui';

interface EndpointBundle {
  endpoint: EndpointDetail;
  consumers: ConsumersPayload;
}

interface EndpointDetailPageProps {
  endpointId: number;
  /** `deps` en pantalla completa fija la sección y cambia el enlace de la cabecera. */
  isDepsScreen: boolean;
  /** Devuelve `GET /api/…` para la miga de pan en cuanto el detalle carga. */
  onLabelResolved: (label: string) => void;
  onCopied: (messageKey: string) => void;
  onOpenService: (slug: string) => void;
  onOpenEndpoint: (slug: string, endpointId: number) => void;
  onOpenDepsScreen: (slug: string, endpointId: number) => void;
}

export function EndpointDetailPage(props: EndpointDetailPageProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const serviceName = useServiceName();

  const [section, setSection] = useState<EndpointSection>(
    props.isDepsScreen ? 'deps' : 'doc',
  );
  const [isPathCopied, setIsPathCopied] = useState<boolean>(false);

  const bundle = useAsync<EndpointBundle>(
    async (signal) => {
      const endpoint = await fetchEndpoint(props.endpointId, signal);
      const consumers = await fetchConsumers(props.endpointId, signal);
      return { endpoint, consumers };
    },
    [props.endpointId, hub.windowDays],
  );

  const endpointData = bundle.data?.endpoint ?? null;
  useEffect(() => {
    if (!endpointData) return;
    props.onLabelResolved(
      `${endpointData.regd3_method} ${endpointData.regd3_path_template}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointData]);

  const stats = useMemo<EndpointStats>(() => {
    const rows = bundle.data?.consumers.consumers ?? [];
    const callsTotal = rows.reduce((sum, row) => sum + row.calls_total, 0);
    const errors = rows.reduce((sum, row) => sum + row.errors, 0);
    return {
      consumers: rows.length,
      calls: rows.reduce((sum, row) => sum + row.calls_window, 0),
      errorRate: callsTotal > 0 ? errors / callsTotal : 0,
    };
  }, [bundle.data]);

  if (bundle.error) {
    if (bundle.error.status === 404) {
      return (
        <EmptyState
          icon="link_off"
          title={t('ENDPOINT.NOT_FOUND_TITLE')}
          body={t('ENDPOINT.NOT_FOUND_BODY')}
        />
      );
    }
    return <ErrorState error={bundle.error} onRetry={bundle.reload} />;
  }

  if (!bundle.data) {
    return (
      <div style={{ padding: 'var(--cp-sp-5)' }}>
        <div className="cp-card">
          <TableSkeleton columns="1fr 1fr 1fr" rows={6} />
        </div>
      </div>
    );
  }

  const endpoint = bundle.data.endpoint;

  // `/endpoints/{id}/` no filtra por entorno: el mismo id puede venir de otro.
  // Decirlo es la mitad del valor — «no existe aquí» no es «no existe».
  if (endpoint.regd3_environment !== hub.environment) {
    return (
      <EmptyState
        icon="travel_explore"
        title={t('ENDPOINT.NOT_IN_ENV_TITLE', {
          method: endpoint.regd3_method,
          path: endpoint.regd3_path_template,
          env: hub.environment,
        })}
        body={t('ENDPOINT.NOT_IN_ENV_BODY', {
          service: endpoint.service,
          env: hub.environment,
          origin: endpoint.regd3_environment,
        })}
      />
    );
  }

  const repoUrl =
    hub.services.find((service) => service.reg_slug === endpoint.service)?.reg_repo_url ?? '';
  const activeSection: EndpointSection = props.isDepsScreen ? 'deps' : section;

  const copyPath = (): void => {
    const text = `${endpoint.regd3_method} ${endpoint.regd3_path_template}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsPathCopied(true);
        props.onCopied('ENDPOINT.PATH_COPIED');
      })
      .catch(() => props.onCopied('ENDPOINT.COPY_FAILED'));
  };

  return (
    <div style={{ flex: 1, paddingBottom: 60 }}>
      <EndpointHeader
        endpoint={endpoint}
        stats={stats}
        serviceName={serviceName(endpoint.service)}
        windowDays={hub.windowDays}
        section={activeSection}
        isPathCopied={isPathCopied}
        onSectionChange={(next) => {
          if (next === 'deps') {
            props.onOpenDepsScreen(endpoint.service, endpoint.regd3_index);
            return;
          }
          setSection(next);
          // Salir de la pantalla completa de dependencias es un cambio de ruta,
          // no solo de pestaña: la URL tiene que dejar de decir /dependencies.
          if (props.isDepsScreen) {
            props.onOpenEndpoint(endpoint.service, endpoint.regd3_index);
          }
        }}
        onCopyPath={copyPath}
        onOpenService={() => props.onOpenService(endpoint.service)}
      />

      {activeSection === 'doc' ? (
        <DocSection endpoint={endpoint} repoUrl={repoUrl} />
      ) : activeSection === 'contract' ? (
        <ContractSection schema={endpoint.regd3_schema} />
      ) : (
        <DepsSection
          endpoint={endpoint}
          consumers={bundle.data.consumers}
          isFullScreen={props.isDepsScreen}
          onOpenFullScreen={() =>
            props.onOpenDepsScreen(endpoint.service, endpoint.regd3_index)
          }
          onOpenEndpoint={props.onOpenEndpoint}
          onOpenService={props.onOpenService}
        />
      )}
    </div>
  );
}
