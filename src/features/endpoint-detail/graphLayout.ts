/**
 * Colocación del grafo: una columna por profundidad, los nodos agrupados
 * por servicio dentro de cada columna. Sin librería de layout — el grafo es
 * un DAG poco profundo y por niveles, y una fuerza dirigida lo haría menos
 * legible, no más.
 */
import type { GraphVizEdge, GraphVizNode } from '@/types/ui';

const NODE_W = 218;
const NODE_H = 40;
const NODE_GAP = 8;
const COLUMN_GAP = 74;
const GROUP_HEADER = 24;
const GROUP_PAD = 8;
const GROUP_GAP = 16;

export interface LaidOutNode extends GraphVizNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LaidOutGroup {
  key: string;
  service: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LaidOutEdge {
  path: string;
  width: number;
  isStale: boolean;
  label: string;
  labelX: number;
  labelY: number;
}

export interface GraphLayout {
  width: number;
  height: number;
  nodes: LaidOutNode[];
  groups: LaidOutGroup[];
  edges: LaidOutEdge[];
}

export const EMPTY_LAYOUT: GraphLayout = {
  width: 0,
  height: 0,
  nodes: [],
  groups: [],
  edges: [],
};

function groupHeight(count: number): number {
  return GROUP_HEADER + GROUP_PAD + count * (NODE_H + NODE_GAP) - NODE_GAP + GROUP_PAD;
}

interface LayoutInput {
  nodes: GraphVizNode[];
  edges: GraphVizEdge[];
  depth: number;
  minVolume: number;
  compact: (value: number) => string;
}

export function layoutGraph({
  nodes,
  edges,
  depth,
  minVolume,
  compact,
}: LayoutInput): GraphLayout {
  const visible = nodes.filter(
    (node) => node.isRoot || (node.depth <= depth && node.calls >= minVolume),
  );
  if (visible.length === 0) return EMPTY_LAYOUT;

  const keys = new Set(visible.map((node) => node.key));
  const visibleEdges = edges.filter((edge) => keys.has(edge.from) && keys.has(edge.to));
  const maxDepth = visible.reduce((max, node) => Math.max(max, node.depth), 0);

  // Las columnas van de la profundidad mayor a la raíz: el tráfico entra por
  // la izquierda y desemboca en el endpoint abierto.
  const columns: GraphVizNode[][] = [];
  for (let level = maxDepth; level >= 0; level -= 1) {
    const column = visible.filter((node) => node.depth === level);
    if (column.length) columns.push(column);
  }

  const columnHeights = columns.map((column) => {
    const services = [...new Set(column.map((node) => node.service))];
    return (
      services.reduce(
        (total, service) =>
          total + groupHeight(column.filter((node) => node.service === service).length),
        0,
      ) +
      (services.length - 1) * GROUP_GAP
    );
  });
  const height = Math.max(...columnHeights, 120);

  const laidOut: LaidOutNode[] = [];
  const groups: LaidOutGroup[] = [];

  columns.forEach((column, columnIndex) => {
    const x = columnIndex * (NODE_W + GROUP_PAD * 2 + COLUMN_GAP);
    let y = Math.max(0, (height - columnHeights[columnIndex]) / 2);

    for (const service of [...new Set(column.map((node) => node.service))]) {
      const members = column.filter((node) => node.service === service);
      const boxHeight = groupHeight(members.length);

      groups.push({
        key: `${columnIndex}-${service}`,
        service,
        x,
        y,
        w: NODE_W + GROUP_PAD * 2,
        h: boxHeight,
      });

      members.forEach((node, memberIndex) => {
        laidOut.push({
          ...node,
          x: x + GROUP_PAD,
          y: y + GROUP_HEADER + GROUP_PAD + memberIndex * (NODE_H + NODE_GAP),
          w: NODE_W,
          h: NODE_H,
        });
      });

      y += boxHeight + GROUP_GAP;
    }
  });

  const positions = new Map(laidOut.map((node) => [node.key, node]));

  const edgePaths: LaidOutEdge[] = visibleEdges.flatMap((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return [];

    const x1 = from.x + from.w;
    const y1 = from.y + from.h / 2;
    const x2 = to.x;
    const y2 = to.y + to.h / 2;
    const midX = (x1 + x2) / 2;

    return [
      {
        path: `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`,
        width: Math.max(1, Math.min(5, Math.log10(Math.max(10, edge.calls)) * 1.1)),
        isStale: edge.stale,
        label: compact(edge.calls),
        labelX: midX,
        labelY: (y1 + y2) / 2 - 5,
      },
    ];
  });

  return {
    width: Math.max(columns.length * (NODE_W + GROUP_PAD * 2 + COLUMN_GAP) - COLUMN_GAP, 300),
    height,
    nodes: laidOut,
    groups,
    edges: edgePaths,
  };
}
