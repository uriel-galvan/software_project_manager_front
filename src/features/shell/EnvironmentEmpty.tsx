import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import type { Environment } from '@/types/api';

interface EnvironmentEmptyProps {
  environment: Environment;
  onBackToProd: () => void;
}

/**
 * Lo normal en staging al principio. No es un error del hub: es que el
 * runtime del paquete cliente no está activado en ese entorno.
 */
export function EnvironmentEmpty({
  environment,
  onBackToProd,
}: EnvironmentEmptyProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '80px 16px' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--cp-warning)',
          }}
        >
          {t('ENV_EMPTY.EYEBROW')}
        </div>
        <EmptyState
          icon="cloud_off"
          title={t('ENV_EMPTY.TITLE', { env: environment })}
          body={t('ENV_EMPTY.BODY', { env: environment })}
          action={
            environment === 'prod' ? undefined : (
              <button type="button" className="cp-btn cp-btn--primary" onClick={onBackToProd}>
                {t('ENV_EMPTY.BACK_TO_PROD')}
              </button>
            )
          }
        />
      </div>
    </div>
  );
}
