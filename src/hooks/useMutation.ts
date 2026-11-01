/** Escritura contra el hub: estado de envío y aviso de éxito o error. */
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api/client';
import { useHub } from '@/features/shell/HubContext';

export interface Mutation {
  isBusy: boolean;
  /** Ejecuta `action`; devuelve `null` si falló (el error ya se avisó). */
  run: <T>(action: () => Promise<T>, successText?: string) => Promise<T | null>;
}

export function useMutation(): Mutation {
  const { t } = useTranslation();
  const { notify } = useHub();
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, successText?: string): Promise<T | null> => {
      setIsBusy(true);
      try {
        const result = await action();
        if (successText) notify(successText, 'success');
        return result;
      } catch (cause) {
        // Un 400 trae la regla violada en palabras del hub; es más útil que
        // cualquier texto genérico.
        const text =
          cause instanceof ApiError
            ? cause.status === 400
              ? cause.message
              : t(cause.i18nKey)
            : t('ERRORS.UNKNOWN');
        notify(text, 'error');
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [notify, t],
  );

  return { isBusy, run };
}
