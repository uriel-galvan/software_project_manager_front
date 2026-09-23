/**
 * Expansión del grafo endpoint a endpoint, con el endpoint abierto como raíz.
 *
 * El hub no publica un grafo de endpoints: publica consumidores por endpoint
 * (`/endpoints/{id}/consumers/`) y un grafo a nivel servicio. Este hook encadena
 * lo primero. Para poder subir un nivel más hay que traducir la operación de
 * origen (`GET /api/invoices/{pk}/`) al endpoint que la emite, y para eso se
 * indexa el catálogo de cada servicio que aparece. Los índices se cachean:
 * subir la profundidad no vuelve a pedir lo ya visto.
 */
import { useEffect, useRef, useState } from 'react';
import { fetchConsumers, fetchServiceEndpoints } from '@/api/registry.api';
import type { EndpointDetail, Environment, HttpMethod, ObservedConsumer } from '@/types/api';
import type { GraphVizEdge, GraphVizNode } from '@/types/ui';

const MAX_NODES = 26;
const UNATTRIBUTED = 'unattributed';

export interface DependencyGraph {
  nodes: GraphVizNode[];
  edges: GraphVizEdge[];
}

const EMPTY: DependencyGraph = { nodes: [], edges: [] };

interface ParsedOperation {
  method: HttpMethod | 'TASK';
  path: string;
  kind: GraphVizNode['kind'];
}

export function parseOperation(operation: string): ParsedOperation {
  const match = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/.exec(operation);
  if (match) {
    return { method: match[1] as HttpMethod, path: match[2], kind: 'endpoint' };
  }
  if (operation.startsWith('task:')) {
    return { method: 'TASK', path: operation.slice(5), kind: 'task' };
  }
  if (operation === UNATTRIBUTED || operation.startsWith('label:')) {
    return { method: 'TASK', path: operation.replace(/^label:/, ''), kind: 'label' };
  }
  return { method: 'TASK', path: operation, kind: 'task' };
}

type EndpointIndex = Map<string, number>;

async function indexFor(
  cache: Map<string, EndpointIndex>,
  service: string,
  environment: Environment,
  signal: AbortSignal,
): Promise<EndpointIndex> {
  const cached = cache.get(service);
  if (cached) return cached;

  const index: EndpointIndex = new Map();
  try {
    const endpoints = await fetchServiceEndpoints(service, environment, true, signal);
    for (const endpoint of endpoints) {
      index.set(`${endpoint.regd3_method} ${endpoint.regd3_path_template}`, endpoint.regd3_index);
    }
  } catch {
    // Un servicio sin catálogo legible deja sus nodos sin ficha, no rompe el grafo.
  }
  cache.set(service, index);
  return index;
}

interface Frontier {
  nodeKey: string;
  endpointId: number;
}

export function useDependencyGraph(
  root: EndpointDetail | null,
  rootConsumers: ObservedConsumer[],
  environment: Environment,
  depth: number,
  isEnabled: boolean,
): DependencyGraph {
  const [graph, setGraph] = useState<DependencyGraph>(EMPTY);
  const indexCache = useRef<Map<string, EndpointIndex>>(new Map());

  const rootId = root?.regd3_index ?? 0;

  useEffect(() => {
    if (!isEnabled || !root) {
      setGraph(EMPTY);
      return undefined;
    }

    const controller = new AbortController();
    let alive = true;

    const build = async (): Promise<void> => {
      const nodes: GraphVizNode[] = [
        {
          key: 'root',
          service: root.service,
          method: root.regd3_method,
          path: root.regd3_path_template,
          calls: 0,
          depth: 0,
          endpointId: root.regd3_index,
          kind: 'endpoint',
          stale: false,
          isRoot: true,
          lastSeen: root.regd3_last_seen,
        },
      ];
      const edges: GraphVizEdge[] = [];
      const visited = new Set<number>([root.regd3_index]);

      let frontier: Frontier[] = [{ nodeKey: 'root', endpointId: root.regd3_index }];

      // La raíz ya trae sus consumidores cargados por la pantalla; el resto
      // se pide, y solo una vez por endpoint gracias a `visited`.
      const consumersOf = async (endpointId: number): Promise<ObservedConsumer[]> =>
        endpointId === root.regd3_index
          ? rootConsumers
          : (await fetchConsumers(endpointId, controller.signal)).consumers;

      for (let level = 1; level <= depth && nodes.length < MAX_NODES; level += 1) {
        const next: Frontier[] = [];

        for (const parent of frontier) {
          const consumers = await consumersOf(parent.endpointId);

          for (const [position, consumer] of consumers.entries()) {
            if (nodes.length >= MAX_NODES) break;
            const parsed = parseOperation(consumer.operation);
            const key = `${parent.nodeKey}_${level}_${position}`;

            let endpointId: number | null = null;
            if (parsed.kind === 'endpoint') {
              const index = await indexFor(
                indexCache.current,
                consumer.service,
                environment,
                controller.signal,
              );
              endpointId = index.get(consumer.operation) ?? null;
            }

            nodes.push({
              key,
              service: consumer.service || UNATTRIBUTED,
              method: parsed.method,
              path: parsed.path,
              calls: consumer.calls_window || consumer.calls_total,
              depth: level,
              endpointId,
              kind: parsed.kind,
              stale: consumer.calls_window === 0,
              isRoot: false,
              lastSeen: consumer.last_seen,
            });
            edges.push({
              from: key,
              to: parent.nodeKey,
              calls: consumer.calls_window || consumer.calls_total,
              stale: consumer.calls_window === 0,
            });

            if (endpointId !== null && !visited.has(endpointId)) {
              visited.add(endpointId);
              next.push({ nodeKey: key, endpointId });
            }
          }
        }

        frontier = next;
        if (frontier.length === 0) break;
      }

      if (alive) setGraph({ nodes, edges });
    };

    void build().catch(() => {
      if (alive) setGraph(EMPTY);
    });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, environment, depth, isEnabled, rootConsumers]);

  return graph;
}
