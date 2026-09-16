/** Carga asíncrona con abort, para que un cambio de entorno no pise datos viejos. */
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  reload: () => void;
}

export function useAsync<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const reload = useCallback((): void => setNonce((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;
    setIsLoading(true);
    setError(null);

    loader(controller.signal)
      .then((result) => {
        if (!alive) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (!alive || (cause instanceof DOMException && cause.name === 'AbortError')) return;
        setData(null);
        setError(
          cause instanceof ApiError
            ? cause
            : new ApiError(String(cause), 0, 'ERRORS.UNKNOWN'),
        );
        setIsLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, isLoading, error, reload };
}
