/** Modelos de vista: lo que las pantallas consumen, ya derivado del API. */
import type { Environment, HttpMethod, ServiceHealth } from './api';

export type ThemeMode = 'light' | 'dark';

/** Estado de salud del reporte, derivado de `ServiceHealth.signals`. */
export type HealthStatus = 'ok' | 'incomplete' | 'no_reporting' | 'no_data';

export interface HealthView {
  status: HealthStatus;
  raw: ServiceHealth | null;
}

/** Fila del catálogo de servicios: catálogo + grafo + salud, ya cruzados. */
export interface ServiceRow {
  slug: string;
  name: string;
  description: string;
  team: string;
  repoUrl: string;
  endpointCount: number;
  /** Servicios distintos que llaman a este. */
  consumerCount: number;
  /** Servicios distintos a los que este llama. */
  dependencyCount: number;
  /** Llamadas entrantes en la ventana del grafo. */
  callsInbound: number;
  health: HealthView;
}

export type ServiceSortKey =
  | 'name'
  | 'endpointCount'
  | 'consumerCount'
  | 'dependencyCount'
  | 'callsInbound';

export type EndpointSortKey = 'path' | 'consumers' | 'calls';

export type SortDirection = 'asc' | 'desc';

export interface ServiceFilters {
  query: string;
  team: string;
  health: HealthStatus | '';
}

export interface EndpointFilters {
  methods: HttpMethod[];
  query: string;
  tag: string;
  onlyDeprecated: boolean;
  onlyUndocumented: boolean;
  includeRetired: boolean;
}

/** Métricas de tráfico de un endpoint, cargadas bajo demanda. */
export interface EndpointTraffic {
  consumers: number;
  calls: number;
  errors: number;
  callsTotal: number;
}

/** Dependencia a nivel servicio, derivada de las aristas del grafo. */
export interface ServiceDependency {
  slug: string;
  operations: number;
  calls: number;
  errors: number;
  stale: boolean;
  reliable: boolean;
}

export type ScreenName =
  | 'services'
  | 'service'
  | 'endpoint'
  | 'endpointDeps'
  | 'states'
  | 'system';

export interface Route {
  screen: ScreenName;
  env: Environment;
  slug?: string;
  endpointId?: number;
}

export type EndpointSection = 'doc' | 'contract' | 'deps';

export type SnackbarSeverity = 'success' | 'error' | 'warning';

export interface SnackbarMessage {
  id: number;
  text: string;
  severity: SnackbarSeverity;
}

/** Nodo del grafo de dependencias por endpoint. */
export interface GraphVizNode {
  key: string;
  service: string;
  method: HttpMethod | 'TASK';
  path: string;
  calls: number;
  depth: number;
  endpointId: number | null;
  kind: 'endpoint' | 'task' | 'label';
  stale: boolean;
  isRoot: boolean;
  lastSeen: string | null;
}

export interface GraphVizEdge {
  from: string;
  to: string;
  calls: number;
  stale: boolean;
}
