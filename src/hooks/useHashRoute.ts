/**
 * Routing por hash. La URL es el estado compartible: `#/prod/services/crm`
 * se pega en Slack y abre exactamente la misma vista.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Environment } from '@/types/api';
import type { Route, ScreenName } from '@/types/ui';

const ENVIRONMENTS: readonly Environment[] = ['dev', 'staging', 'prod'];
const DEFAULT_ENV: Environment = 'prod';

export function isEnvironment(value: string): value is Environment {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}

export function routeToHash(route: Route): string {
  const base = `/${route.env}`;
  switch (route.screen) {
    case 'states':
      return `${base}/_estados`;
    case 'system':
      return `${base}/_sistema`;
    case 'service':
      return `${base}/services/${route.slug}`;
    case 'endpoint':
      return `${base}/services/${route.slug}/endpoints/${route.endpointId}`;
    case 'endpointDeps':
      return `${base}/services/${route.slug}/endpoints/${route.endpointId}/dependencies`;
    default:
      return `${base}/services`;
  }
}

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#?\/?/, '').split('/').filter(Boolean);
  const env = parts[0] && isEnvironment(parts[0]) ? parts[0] : DEFAULT_ENV;

  if (parts[1] === '_estados') return { screen: 'states', env };
  if (parts[1] === '_sistema') return { screen: 'system', env };

  if (parts[1] === 'services' && parts[2]) {
    const slug = parts[2];
    if (parts[3] === 'endpoints' && parts[4]) {
      const endpointId = Number(parts[4]);
      const screen: ScreenName = parts[5] === 'dependencies' ? 'endpointDeps' : 'endpoint';
      if (Number.isFinite(endpointId)) return { screen, env, slug, endpointId };
    }
    return { screen: 'service', env, slug };
  }

  return { screen: 'services', env };
}

export interface HashRouter {
  route: Route;
  navigate: (route: Route) => void;
  setEnvironment: (env: Environment) => void;
}

export function useHashRoute(): HashRouter {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    // Entrar sin hash deja una URL que no dice nada: se estampa la ruta
    // resuelta para que copiar el enlace sirva desde el primer segundo.
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${routeToHash(route)}`);
    }
    const onHashChange = (): void => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((next: Route): void => {
    window.location.hash = routeToHash(next);
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  const setEnvironment = useCallback(
    (env: Environment): void => {
      // El entorno no cambia de pantalla: la misma vista, otra población.
      navigate({ ...route, env });
    },
    [navigate, route],
  );

  return { route, navigate, setEnvironment };
}
