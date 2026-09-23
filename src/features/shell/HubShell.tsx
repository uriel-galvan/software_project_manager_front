/** SMART — arma la pantalla: miga de pan, ruta activa, panel de salud y paleta. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { EndpointDetailPage } from '@/features/endpoint-detail/EndpointDetailPage';
import { HealthPanel } from '@/features/health/HealthPanel';
import { SearchPalette } from '@/features/search/SearchPalette';
import { ServiceDetailPage } from '@/features/service-detail/ServiceDetailPage';
import { ServicesPage } from '@/features/services/ServicesPage';
import { StatesPage } from '@/features/system/StatesPage';
import { SystemPage } from '@/features/system/SystemPage';
import { EnvironmentEmpty } from './EnvironmentEmpty';
import { useHub, useServiceName } from './HubContext';
import type { Route, ThemeMode } from '@/types/ui';

interface HubShellProps {
  route: Route;
  theme: ThemeMode;
  healthFor: string | null;
  isSearchOpen: boolean;
  onCloseHealth: () => void;
  onCloseSearch: () => void;
  navigate: (route: Route) => void;
}

export function HubShell(props: HubShellProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const serviceName = useServiceName();
  const [endpointLabel, setEndpointLabel] = useState<string>('');

  const env = props.route.env;
  const go = (partial: Partial<Route>): void =>
    props.navigate({ env, screen: 'services', ...partial });

  const openService = (slug: string): void => go({ screen: 'service', slug });
  const openEndpoint = (slug: string, endpointId: number): void =>
    go({ screen: 'endpoint', slug, endpointId });
  const openDeps = (slug: string, endpointId: number): void =>
    go({ screen: 'endpointDeps', slug, endpointId });

  const crumbs = buildCrumbs();
  const activeTab =
    props.route.screen === 'states'
      ? 'states'
      : props.route.screen === 'system'
        ? 'system'
        : null;

  const healthService = props.healthFor
    ? hub.services.find((service) => service.reg_slug === props.healthFor)
    : undefined;

  return (
    <>
      <Breadcrumbs
        crumbs={crumbs}
        activeTab={activeTab}
        onGoStates={() => go({ screen: 'states' })}
        onGoSystem={() => go({ screen: 'system' })}
      />

      {renderScreen()}

      {props.healthFor ? (
        <HealthPanel
          slug={props.healthFor}
          name={healthService?.reg_name || props.healthFor}
          team={healthService?.reg_owner_team ?? ''}
          view={hub.healthOf(props.healthFor)}
          onClose={props.onCloseHealth}
          onGoToService={() => {
            const slug = props.healthFor;
            props.onCloseHealth();
            if (slug) openService(slug);
          }}
        />
      ) : null}

      {props.isSearchOpen ? (
        <SearchPalette
          environment={env}
          onClose={props.onCloseSearch}
          onOpenEndpoint={(slug, endpointId) => {
            props.onCloseSearch();
            openEndpoint(slug, endpointId);
          }}
        />
      ) : null}
    </>
  );

  function renderScreen(): React.ReactElement {
    if (props.route.screen === 'states') return <StatesPage />;
    if (props.route.screen === 'system') return <SystemPage theme={props.theme} />;

    if (hub.isEnvironmentEmpty) {
      return (
        <EnvironmentEmpty
          environment={env}
          onBackToProd={() => props.navigate({ ...props.route, env: 'prod' })}
        />
      );
    }

    if (props.route.screen === 'service' && props.route.slug) {
      return (
        <ServiceDetailPage
          key={props.route.slug}
          slug={props.route.slug}
          onOpenEndpoint={openEndpoint}
          onOpenService={openService}
        />
      );
    }

    if (
      (props.route.screen === 'endpoint' || props.route.screen === 'endpointDeps') &&
      props.route.endpointId
    ) {
      return (
        <EndpointDetailPage
          key={props.route.endpointId}
          endpointId={props.route.endpointId}
          isDepsScreen={props.route.screen === 'endpointDeps'}
          onLabelResolved={setEndpointLabel}
          onCopied={(messageKey) => hub.notify(t(messageKey), 'success')}
          onOpenService={openService}
          onOpenEndpoint={openEndpoint}
          onOpenDepsScreen={openDeps}
        />
      );
    }

    return <ServicesPage onOpenService={openService} />;
  }

  function buildCrumbs(): Crumb[] {
    if (props.route.screen === 'states') return [{ label: t('NAV.STATES') }];
    if (props.route.screen === 'system') return [{ label: t('NAV.SYSTEM') }];

    const list: Crumb[] = [
      { label: t('NAV.SERVICES'), onClick: () => go({ screen: 'services' }) },
    ];
    if (!props.route.slug) return list;

    const slug = props.route.slug;
    list.push({ label: serviceName(slug), onClick: () => openService(slug) });

    if (props.route.endpointId) {
      const endpointId = props.route.endpointId;
      list.push({
        label: endpointLabel || `#${endpointId}`,
        isCode: true,
        onClick: () => openEndpoint(slug, endpointId),
      });
    }
    if (props.route.screen === 'endpointDeps') {
      list.push({ label: t('NAV.DEPENDENCIES') });
    }
    return list;
  }
}
