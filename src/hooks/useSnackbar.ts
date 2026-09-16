/** Cola de avisos. Éxito y error 3000 ms, advertencia 4000 ms. */
import { useCallback, useEffect, useState } from 'react';
import type { SnackbarMessage, SnackbarSeverity } from '@/types/ui';

const DURATION: Record<SnackbarSeverity, number> = {
  success: 3000,
  error: 3000,
  warning: 4000,
};

export interface SnackbarController {
  message: SnackbarMessage | null;
  notify: (text: string, severity: SnackbarSeverity) => void;
  dismiss: () => void;
}

export function useSnackbar(): SnackbarController {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);

  const notify = useCallback((text: string, severity: SnackbarSeverity): void => {
    setMessage({ id: Date.now(), text, severity });
  }, []);

  const dismiss = useCallback((): void => setMessage(null), []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(dismiss, DURATION[message.severity]);
    return () => window.clearTimeout(timer);
  }, [message, dismiss]);

  return { message, notify, dismiss };
}
