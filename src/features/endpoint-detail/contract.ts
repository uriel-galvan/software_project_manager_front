/**
 * Traducción del `regd3_schema` (OpenAPI ya desreferenciado por
 * `catalog/services/openapi.py`) a las filas que pinta la sección Contrato.
 */
import type {
  EndpointSchema,
  OpenApiParameter,
  OpenApiSchemaNode,
} from '@/types/api';

export interface ContractRow {
  name: string;
  type: string;
  requirement: 'required' | 'optional' | 'none';
  description: string;
  tone: 'normal' | 'success' | 'error';
}

export interface ContractBlock {
  id: 'params' | 'body' | 'responses';
  rows: ContractRow[];
  /** Subtítulo ya resuelto: cuántos parámetros, qué medios, qué códigos. */
  counts: { path: number; query: number; header: number };
  mediaTypes: string[];
  statusCodes: string[];
}

/** `{type: 'array', items: {type: 'string'}}` → `string[]` */
export function describeType(node: OpenApiSchemaNode | undefined): string {
  if (!node) return '—';
  if (node.type === 'array') return `${describeType(node.items)}[]`;
  if (node.enum?.length) return node.enum.map(String).join(' | ');
  if (node.format) return `${node.type ?? 'object'}<${node.format}>`;
  return node.type ?? 'object';
}

function parameterRows(parameters: OpenApiParameter[]): ContractRow[] {
  return parameters.map((parameter) => ({
    name: parameter.in === 'header' ? parameter.name : parameter.name,
    type: parameter.in === 'header' ? 'header' : describeType(parameter.schema),
    requirement: parameter.required ? 'required' : 'optional',
    description: parameter.description ?? '',
    tone: 'normal',
  }));
}

function bodyRows(schema: EndpointSchema): ContractRow[] {
  const content = schema.requestBody?.content ?? {};
  const media = Object.values(content)[0];
  const node = media?.schema;
  const required = new Set(node?.required ?? []);
  const properties = node?.properties ?? {};

  return Object.entries(properties).map(([name, property]) => ({
    name,
    type: describeType(property),
    requirement: required.has(name) ? 'required' : 'optional',
    description: property.description ?? '',
    tone: 'normal',
  }));
}

function responseRows(schema: EndpointSchema): ContractRow[] {
  return Object.entries(schema.responses ?? {}).map(([code, response]) => {
    const media = Object.values(response.content ?? {})[0];
    const node = media?.schema;
    const fields = Object.keys(node?.properties ?? {});
    return {
      name: code,
      type: node ? describeType(node) : '—',
      requirement: 'none' as const,
      description: fields.length ? fields.join(', ') : (response.description ?? ''),
      tone: code.startsWith('2') ? ('success' as const) : code.startsWith('4') || code.startsWith('5') ? ('error' as const) : ('normal' as const),
    };
  });
}

export function buildContract(schema: EndpointSchema | null | undefined): ContractBlock[] {
  const safe: EndpointSchema = schema ?? {};
  const parameters = safe.parameters ?? [];

  return [
    {
      id: 'params',
      rows: parameterRows(parameters),
      counts: {
        path: parameters.filter((parameter) => parameter.in === 'path').length,
        query: parameters.filter((parameter) => parameter.in === 'query').length,
        header: parameters.filter((parameter) => parameter.in === 'header').length,
      },
      mediaTypes: [],
      statusCodes: [],
    },
    {
      id: 'body',
      rows: bodyRows(safe),
      counts: { path: 0, query: 0, header: 0 },
      mediaTypes: Object.keys(safe.requestBody?.content ?? {}),
      statusCodes: [],
    },
    {
      id: 'responses',
      rows: responseRows(safe),
      counts: { path: 0, query: 0, header: 0 },
      mediaTypes: [],
      statusCodes: Object.keys(safe.responses ?? {}),
    },
  ];
}

/** `true` cuando el manifest no trajo nada: es el spec del servicio lo que falta. */
export function isContractEmpty(blocks: ContractBlock[]): boolean {
  return blocks.every((block) => block.rows.length === 0);
}
