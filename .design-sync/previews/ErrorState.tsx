import { ErrorState } from 'software-manager-front';

const err = (i18nKey: string, status: number) => ({ message: i18nKey, status, i18nKey });

export const SinRespuesta = () => (
  <ErrorState error={err('ERRORS.NETWORK', 0)} onRetry={() => {}} />
);

export const ErrorDeServidor = () => (
  <ErrorState error={err('ERRORS.SERVER', 500)} onRetry={() => {}} />
);

export const SinReintento = () => <ErrorState error={err('ERRORS.FORBIDDEN', 403)} />;
