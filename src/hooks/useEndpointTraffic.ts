/**
 * Consumidores y volumen por endpoint.
 *
 * El hub no publica una agregación en bloque: `/graph/` es a nivel servicio y
 * el detalle vive en `/endpoints/{id}/consumers/`. La tabla se pinta primero
 * con el catálogo y estas dos columnas se rellenan después, de seis en seis,
 * para no abrir cuarenta peticiones de golpe.
 */
import { useEffect, useRef, useState } from 'react';
import { fetchConsumers } from '@/api/registry.api';
import type { EndpointTraffic } from '@/types/ui';

const CONCURRENCY = 6;

async function mapWithLimit<T>(
  ids: number[],
  limit: number,
  worker: (id: number) => Promise<T>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, ids.length) }, async () => {
    while (cursor < ids.length) {
      const id = ids[cursor];
      cursor += 1;
      await worker(id);
    }
  });
  await Promise.all(runners);
}

export interface TrafficState {
  byEndpoint: Map<number, EndpointTraffic>;
  isLoading: boolean;
}

export function useEndpointTraffic(endpointIds: number[]): TrafficState {
  const [byEndpoint, setByEndpoint] = useState<Map<number, EndpointTraffic>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // La caché sobrevive a los cambios de filtro: un endpoint ya medido no se vuelve a pedir.
  const cache = useRef<Map<number, EndpointTraffic>>(new Map());

  const signature = endpointIds.join(',');

  useEffect(() => {
    const pending = endpointIds.filter((id) => !cache.current.has(id));
    if (pending.length === 0) {
      setByEndpoint(new Map(cache.current));
      setIsLoading(false);
      return undefined;
    }

    let alive = true;
    const controller = new AbortController();
    setIsLoading(true);

    void mapWithLimit(pending, CONCURRENCY, async (id) => {
      try {
        const payload = await fetchConsumers(id, controller.signal);
        const traffic: EndpointTraffic = {
          consumers: payload.consumers.length,
          calls: payload.consumers.reduce((sum, row) => sum + row.calls_window, 0),
          callsTotal: payload.consumers.reduce((sum, row) => sum + row.calls_total, 0),
          errors: payload.consumers.reduce((sum, row) => sum + row.errors, 0),
        };
        cache.current.set(id, traffic);
        if (alive) setByEndpoint(new Map(cache.current));
      } catch {
        // Un endpoint que falla deja su celda en «—»; no tumba la tabla.
        cache.current.set(id, { consumers: 0, calls: 0, callsTotal: 0, errors: 0 });
      }
    }).finally(() => {
      if (alive) setIsLoading(false);
    });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return { byEndpoint, isLoading };
}
