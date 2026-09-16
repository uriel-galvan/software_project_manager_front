/**
 * Derivados del grafo a nivel servicio: el backend devuelve aristas
 * (`source`, `target`, `calls`…) y las pantallas piden totales por servicio.
 */
import type { GraphPayload } from '@/types/api';
import type { ServiceDependency } from '@/types/ui';

export interface ServiceTraffic {
  consumerCount: number;
  dependencyCount: number;
  callsInbound: number;
  callsOutbound: number;
}

const EMPTY: ServiceTraffic = {
  consumerCount: 0,
  dependencyCount: 0,
  callsInbound: 0,
  callsOutbound: 0,
};

export function trafficIndex(graph: GraphPayload | null): Map<string, ServiceTraffic> {
  const index = new Map<string, ServiceTraffic>();
  const ensure = (slug: string): ServiceTraffic => {
    const current = index.get(slug) ?? { ...EMPTY };
    index.set(slug, current);
    return current;
  };

  for (const edge of graph?.edges ?? []) {
    const target = ensure(edge.target);
    target.consumerCount += 1;
    target.callsInbound += edge.calls;

    const source = ensure(edge.source);
    source.dependencyCount += 1;
    source.callsOutbound += edge.calls;
  }
  return index;
}

export function trafficOf(
  index: Map<string, ServiceTraffic>,
  slug: string,
): ServiceTraffic {
  return index.get(slug) ?? EMPTY;
}

function toDependency(
  slug: string,
  edge: { calls: number; errors: number; operations: number; stale: boolean },
  reliable: boolean,
): ServiceDependency {
  return {
    slug,
    operations: edge.operations,
    calls: edge.calls,
    errors: edge.errors,
    stale: edge.stale,
    reliable,
  };
}

export interface ServiceNeighbours {
  incoming: ServiceDependency[];
  outgoing: ServiceDependency[];
}

/** Quién llama al servicio y a quién llama, ordenado por volumen. */
export function neighboursOf(graph: GraphPayload | null, slug: string): ServiceNeighbours {
  const reliability = new Map<string, boolean>(
    (graph?.nodes ?? []).map((node) => [node.service, node.reliable]),
  );
  const byCalls = (a: ServiceDependency, b: ServiceDependency): number => b.calls - a.calls;

  const incoming = (graph?.edges ?? [])
    .filter((edge) => edge.target === slug)
    .map((edge) => toDependency(edge.source, edge, reliability.get(edge.source) ?? false))
    .sort(byCalls);

  const outgoing = (graph?.edges ?? [])
    .filter((edge) => edge.source === slug)
    .map((edge) => toDependency(edge.target, edge, reliability.get(edge.target) ?? false))
    .sort(byCalls);

  return { incoming, outgoing };
}
