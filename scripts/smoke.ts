/**
 * Comprobación de humo: pega contra el hub de verdad y pasa las respuestas por
 * las funciones puras que alimentan las pantallas. No sustituye a una suite;
 * lo que verifica es lo que el tipado no puede — que la forma real del payload
 * y la derivación coincidan.
 */
import { buildContract, isContractEmpty } from '../src/features/endpoint-detail/contract';
import { parseOperation } from '../src/features/endpoint-detail/useDependencyGraph';
import { neighboursOf, trafficIndex, trafficOf } from '../src/utils/graph';
import { healthIndex, statusOf, unreliableServices } from '../src/utils/health';
import { compactNumber, formatDate, relativeParts } from '../src/utils/format';
import type {
  ConsumersPayload,
  EndpointDetail,
  EndpointSummary,
  GraphPayload,
  HealthPayload,
  Paginated,
  ServiceSummary,
  UnresolvedPayload,
} from '../src/types/api';

const BASE = process.env.HUB_URL ?? 'http://localhost:8001';
const ENV = process.env.HUB_ENV ?? 'dev';

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}/services/apis${path}`);
  const payload = (await response.json()) as { status: string; data: T };
  if (payload.status !== 'success') throw new Error(`${path}: ${payload.status}`);
  return payload.data;
}

let failures = 0;
function check(label: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ok   ${label} — ${detail}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL ${label} — ${detail}`);
}

async function main(): Promise<void> {
  const services = await get<Paginated<ServiceSummary>>('/services/?page=1');
  check('catálogo', Array.isArray(services.results), `${services.count} servicios, paginado`);

  const graph = await get<GraphPayload>(`/graph/?environment=${ENV}&since=7`);
  const health = await get<HealthPayload>(`/health/?environment=${ENV}`);
  const unresolved = await get<UnresolvedPayload>(`/unresolved/?environment=${ENV}`);

  const traffic = trafficIndex(graph);
  const byHealth = healthIndex(health);
  const present = new Set<string>([
    ...byHealth.keys(),
    ...graph.nodes.map((node) => node.service),
  ]);
  const rows = services.results.filter((service) => present.has(service.reg_slug));
  check(
    'filas de la tabla',
    rows.length > 0 || unresolved.hosts.length > 0,
    `${rows.length} servicios en ${ENV}, ${unresolved.hosts.length} hosts sin dueño`,
  );

  for (const row of rows) {
    const stats = trafficOf(traffic, row.reg_slug);
    const status = statusOf(byHealth.get(row.reg_slug));
    const neighbours = neighboursOf(graph, row.reg_slug);
    check(
      `servicio ${row.reg_slug}`,
      Number.isFinite(stats.callsInbound) && status.length > 0,
      `salud=${status} consumidores=${stats.consumerCount} depende-de=${stats.dependencyCount} ` +
        `llamadas=${compactNumber(stats.callsInbound)} vecinos=${neighbours.incoming.length}/${neighbours.outgoing.length}`,
    );

    const endpoints = await get<EndpointSummary[]>(
      `/services/${row.reg_slug}/endpoints/?environment=${ENV}`,
    );
    check(
      `endpoints de ${row.reg_slug}`,
      Array.isArray(endpoints),
      `${endpoints.length} vigentes (catálogo dice ${row.endpoint_count})`,
    );

    const sample = endpoints.slice(0, 3);
    for (const item of sample) {
      const detail = await get<EndpointDetail>(`/endpoints/${item.regd3_index}/`);
      const consumers = await get<ConsumersPayload>(
        `/endpoints/${item.regd3_index}/consumers/`,
      );
      const blocks = buildContract(detail.regd3_schema);
      const windowKey = Object.keys(
        (consumers.consumers[0] ?? {}) as Record<string, unknown>,
      ).find((key) => /^calls_\d+d$/.test(key));

      check(
        `${detail.regd3_method} ${detail.regd3_path_template}`,
        detail.regd3_environment === ENV || detail.regd3_environment.length > 0,
        `contrato=${isContractEmpty(blocks) ? 'vacío' : blocks.map((b) => `${b.id}:${b.rows.length}`).join(' ')} ` +
          `consumidores=${consumers.consumers.length} ventana=${windowKey ?? 'n/a'} ` +
          `primera-vez=${formatDate(detail.regd3_first_seen)} (${relativeParts(detail.regd3_last_seen).key})`,
      );

      for (const consumer of consumers.consumers) {
        const parsed = parseOperation(consumer.operation);
        check(
          `  origen ${consumer.operation}`,
          parsed.path.length > 0,
          `tipo=${parsed.kind} método=${parsed.method}`,
        );
      }
    }
  }

  const unreliable = unreliableServices(health);
  check(
    'servicios poco fiables',
    Array.isArray(unreliable),
    unreliable.length ? unreliable.map((row) => row.service).join(', ') : 'ninguno',
  );

  console.log(failures === 0 ? '\nTODO OK' : `\n${failures} FALLOS`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
