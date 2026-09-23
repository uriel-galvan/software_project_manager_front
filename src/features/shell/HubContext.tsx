/**
 * Estado compartido por entorno.
 *
 * El catálogo, el grafo y la salud se leen una vez por entorno y los cuatro
 * pantallas los reusan: pedirlos de nuevo en cada ficha haría que la misma
 * cifra apareciera distinta según por dónde entraste.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import {
  fetchGraph,
  fetchHealth,
  fetchServices,
  fetchUnresolved,
} from '@/api/registry.api';
import { healthIndex, healthViewOf, unreliableServices } from '@/utils/health';
import { trafficIndex, trafficOf } from '@/utils/graph';
import type { ApiError } from '@/api/client';
import type {
  Environment,
  GraphPayload,
  HealthPayload,
  ServiceHealth,
  ServiceSummary,
  UnresolvedPayload,
} from '@/types/api';
import type { HealthView, ServiceRow, SnackbarSeverity } from '@/types/ui';

export const DEFAULT_WINDOW_DAYS = 7;

interface HubBundle {
  services: ServiceSummary[];
  graph: GraphPayload;
  health: HealthPayload;
  unresolved: UnresolvedPayload;
}

export interface HubContextValue {
  environment: Environment;
  windowDays: number;
  setWindowDays: (days: number) => void;
  services: ServiceSummary[];
  graph: GraphPayload | null;
  unresolved: UnresolvedPayload | null;
  healthOf: (slug: string) => HealthView;
  unreliable: ServiceHealth[];
  rows: ServiceRow[];
  /** Ningún servicio reporta y nadie llama a nada en este entorno. */
  isEnvironmentEmpty: boolean;
  isLoading: boolean;
  error: ApiError | null;
  reload: () => void;
  openHealthPanel: (slug: string) => void;
  notify: (text: string, severity: SnackbarSeverity) => void;
}

const HubContext = createContext<HubContextValue | null>(null);

export function useHub(): HubContextValue {
  const value = useContext(HubContext);
  if (!value) throw new Error('useHub fuera de HubProvider');
  return value;
}

interface HubProviderProps {
  environment: Environment;
  openHealthPanel: (slug: string) => void;
  notify: (text: string, severity: SnackbarSeverity) => void;
  children: React.ReactNode;
}

export function HubProvider({
  environment,
  openHealthPanel,
  notify,
  children,
}: HubProviderProps): React.ReactElement {
  const [windowDays, setWindowDays] = useState<number>(DEFAULT_WINDOW_DAYS);

  const bundle = useAsync<HubBundle>(
    async (signal) => {
      const [services, graph, health, unresolved] = await Promise.all([
        fetchServices(signal),
        fetchGraph(environment, windowDays, 0, signal),
        fetchHealth(environment, signal),
        fetchUnresolved(environment, signal),
      ]);
      return { services, graph, health, unresolved };
    },
    [environment, windowDays],
  );

  const value = useMemo<HubContextValue>(() => {
    const health = bundle.data?.health ?? null;
    const graph = bundle.data?.graph ?? null;
    const services = bundle.data?.services ?? [];
    const byHealth = healthIndex(health);
    const byTraffic = trafficIndex(graph);

    const healthOf = (slug: string): HealthView => healthViewOf(byHealth.get(slug));

    // Un servicio «está» en el entorno si el hub tiene fila de salud suya
    // (la crea el manifest) o si alguien lo tocó en el grafo.
    const present = new Set<string>([
      ...byHealth.keys(),
      ...(graph?.nodes ?? []).map((node) => node.service),
    ]);

    const rows: ServiceRow[] = services
      .filter((service) => present.has(service.reg_slug))
      .map((service) => {
        const traffic = trafficOf(byTraffic, service.reg_slug);
        return {
          slug: service.reg_slug,
          name: service.reg_name || service.reg_slug,
          description: service.reg_description,
          team: service.reg_owner_team,
          repoUrl: service.reg_repo_url,
          endpointCount: service.endpoint_count,
          consumerCount: traffic.consumerCount,
          dependencyCount: traffic.dependencyCount,
          callsInbound: traffic.callsInbound,
          health: healthOf(service.reg_slug),
        };
      });

    return {
      environment,
      windowDays,
      setWindowDays,
      services,
      graph,
      unresolved: bundle.data?.unresolved ?? null,
      healthOf,
      unreliable: unreliableServices(health),
      rows,
      isEnvironmentEmpty:
        !bundle.isLoading &&
        !bundle.error &&
        rows.length === 0 &&
        (bundle.data?.unresolved.hosts.length ?? 0) === 0,
      isLoading: bundle.isLoading,
      error: bundle.error,
      reload: bundle.reload,
      openHealthPanel,
      notify,
    };
  }, [bundle, environment, windowDays, openHealthPanel, notify]);

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

/** Nombre legible de un servicio; cae al slug cuando el catálogo no lo trae. */
export function useServiceName(): (slug: string) => string {
  const { services } = useHub();
  return useCallback(
    (slug: string): string =>
      services.find((service) => service.reg_slug === slug)?.reg_name || slug,
    [services],
  );
}
