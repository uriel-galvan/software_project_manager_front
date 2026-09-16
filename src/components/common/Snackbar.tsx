import { useTranslation } from 'react-i18next';
import type { SnackbarMessage } from '@/types/ui';

interface SnackbarProps {
  message: SnackbarMessage | null;
  onDismiss: () => void;
}

export function Snackbar({ message, onDismiss }: SnackbarProps): React.ReactElement | null {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <div className={`cp-snackbar cp-snackbar--${message.severity}`} role="status">
      <span>{message.text}</span>
      <button type="button" onClick={onDismiss}>
        {t('COMMON.CLOSE')}
      </button>
    </div>
  );
}
