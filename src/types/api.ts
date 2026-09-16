/**
 * Contratos de lectura del Registry Hub (`software_manager`).
 * Cada interfaz espeja un serializer o el payload literal de una vista DRF.
 */

/** Envoltura ASCEND: `software_manager/renderers.py`. */
export interface AscendSuccess<T> {
  status: 'success';
  data: T;
}

export interface AscendError {
  status: 'error';
  message?: string;
  detail?: string;
  code?: string;
}

export type AscendEnvelope<T> = AscendSuccess<T> | AscendError;

/**
 * Los `list` de ViewSet vienen paginados (`PAGE_SIZE = 50` en settings). Los
 * `@action` que construyen su `Response` a mano, no: `/services/{slug}/endpoints/`
 * y `/endpoints/{id}/consumers/` devuelven el payload plano.
 */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Environment = 'dev' | 'staging' | 'prod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/* ── catálogo ─────────────────────────────────────────────── */

/** `Regd1HostSerializer` */
export interface HostAlias {
  regd1_index: number;
  regd1_environment: string;
  regd1_host: string;
  regd1_host_key: string;
  regd1_isexternal: boolean;
}

/** `RegMstrSerializer` — `/services/apis/services/` */
export interface ServiceSummary {
  reg_index: number;
  reg_slug: string;
  reg_name: string;
  reg_description: string;
  reg_owner_team: string;
  reg_repo_url: string;
  endpoint_count: number;
  reg_created_at: string;
  reg_updated_at: string;
}

/** `RegMstrDetailSerializer` — `/services/apis/services/{slug}/` */
export interface ServiceDetail extends ServiceSummary {
  hosts: HostAlias[];
}

/** `Regd3EndpointSerializer` */
export interface EndpointSummary {
  regd3_index: number;
  service: string;
  regd3_environment: string;
  regd3_method: HttpMethod;
  regd3_path_template: string;
  regd3_summary: string;
  regd3_owner_team: string;
  regd3_tags: string[];
  regd3_isdeprecated: boolean;
  regd3_retired_at: string | null;
}

/** Bloques de `regd3_schema` — `catalog/services/openapi.py:extract_schema`. */
export interface OpenApiSchemaNode {
  type?: string;
  format?: string;
  enum?: unknown[];
  items?: OpenApiSchemaNode;
  properties?: Record<string, OpenApiSchemaNode>;
  required?: string[];
  description?: string;
  $ref?: string;
}

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchemaNode;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchemaNode;
}

export interface OpenApiRequestBody {
  required?: boolean;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponse {
  description?: string;
  content?: Record<string, OpenApiMediaType>;
}

export interface EndpointSchema {
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
}

/** Una entrada de `regd3_declared_deps` (bloque `x-registry` del manifest). */
export interface DeclaredDependency {
  servicio?: string;
  llamada?: string;
  origen?: string;
}

/** `Regd3EndpointDetailSerializer` — `/services/apis/endpoints/{pk}/` */
export interface EndpointDetail extends EndpointSummary {
  regd3_description: string;
  regd3_use_case: string;
  regd3_requires: Record<string, unknown>;
  regd3_declared_deps: DeclaredDependency[];
  regd3_operation_id: string;
  regd3_schema: EndpointSchema;
  regd3_shape: string;
  regd3_inbound_label: string;
  regd3_first_seen: string;
  regd3_last_seen: string;
}

/* ── grafo ────────────────────────────────────────────────── */

/** `GraphView` — `/services/apis/graph/` */
export interface GraphNode {
  service: string;
  reliable: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  calls: number;
  errors: number;
  operations: number;
  stale: boolean;
}

export interface GraphPayload {
  environment: string;
  since_days: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  warnings: string[];
}

/** `UnresolvedView` — `/services/apis/unresolved/` */
export interface UnresolvedHost {
  host: string;
  calls: number;
}

export interface UnresolvedPayload {
  environment: string;
  hosts: UnresolvedHost[];
}

/** `HealthReportView` — `/services/apis/health/` */
export interface HealthSignals {
  reporting_incomplete: boolean;
  deploys_without_reporting: boolean;
  partial_sampling: boolean;
}

export interface ServiceHealth {
  service: string;
  last_batch_at: string | null;
  last_manifest_at: string | null;
  batches_24h: number;
  instances_24h: number;
  calls_24h: number;
  dropped_24h: number;
  sample_rate: number;
  signals: HealthSignals;
  reliable: boolean;
}

export interface HealthPayload {
  environment: string;
  services: ServiceHealth[];
}

/* ── impacto ──────────────────────────────────────────────── */

/** `graph/services/impact.py:consumidores` — salud embebida por consumidor. */
export interface ConsumerHealth {
  reporting: boolean;
  dropped_24h: number;
  reliable: boolean;
}

export interface ObservedConsumer {
  service: string;
  operation: string;
  call_site: string;
  /** La clave real es `calls_{dias}d`; el cliente la normaliza a `calls_window`. */
  calls_window: number;
  calls_total: number;
  estimated_calls: number;
  errors: number;
  last_seen: string;
  health: ConsumerHealth;
}

export interface DeclaredOnlyConsumer {
  service: string;
  declared_call: string;
  declared_in: string;
}

export interface ConsumersPayload {
  endpoint: string;
  service: string;
  retired_at: string | null;
  consumers: ObservedConsumer[];
  declared_only: DeclaredOnlyConsumer[];
}

/* ── búsqueda ─────────────────────────────────────────────── */

export interface SearchPayload {
  query: string;
  results: EndpointSummary[];
}

/* ── salud del proceso ────────────────────────────────────── */

export interface HealthzPayload {
  db: boolean;
  redis: boolean;
}
