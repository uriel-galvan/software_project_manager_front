/** Modo claro/oscuro. Se estampa en el root; los tokens hacen el resto. */
import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '@/types/ui';

const STORAGE_KEY = 'api-hub:theme';

function initialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Ventana privada o almacenamiento bloqueado: se cae al tema del sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface ThemeController {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export function useTheme(): ThemeController {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persistir es una comodidad, no un requisito de la vista.
    }
  }, [theme]);

  const toggleTheme = useCallback((): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
