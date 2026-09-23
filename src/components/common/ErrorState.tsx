import { useTranslation } from 'react-i18next';
import type { ApiError } from '@/api/client';
import { EmptyState } from './EmptyState';

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="cloud_off"
      title={t('ERRORS.TITLE')}
      body={t(error.i18nKey)}
      action={
        onRetry ? (
          <button type="button" className="cp-btn cp-btn--primary" onClick={onRetry}>
            {t('COMMON.RETRY')}
          </button>
        ) : undefined
      }
    />
  );
}
