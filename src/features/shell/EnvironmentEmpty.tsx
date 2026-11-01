import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import { CreateServiceModal } from '@/features/services/CreateServiceModal';
import type { Environment } from '@/types/api';

interface EnvironmentEmptyProps {
  environment: Environment;
  /** Slugs dados de alta en el hub, aunque no tengan datos en este entorno. */
  registered: string[];
  onBackToProd: () => void;
  onOpenService: (slug: string) => void;
  /** Un hub recién instalado solo sale de aquí dando de alta su primer servicio. */
  onServiceCreated: (slug: string) => void;
}

/**
 * Lo normal en staging al principio. No es un error del hub: es que el
 * runtime del paquete cliente no está activado en ese entorno.
 */
export function EnvironmentEmpty({
  environment,
  registered,
  onBackToProd,
  onOpenService,
  onServiceCreated,
}: EnvironmentEmptyProps): React.ReactElement {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState<boolean>(false);

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
            <span style={{ display: 'flex', gap: 'var(--cp-sp-3)', justifyContent: 'center' }}>
              {environment === 'prod' ? null : (
                <button type="button" className="cp-btn cp-btn--primary" onClick={onBackToProd}>
                  {t('ENV_EMPTY.BACK_TO_PROD')}
                </button>
              )}
              <button
                type="button"
                className="cp-btn cp-btn--ghost"
                onClick={() => setIsCreating(true)}
              >
                {t('SERVICES.NEW')}
              </button>
            </span>
          }
        />
        {registered.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--cp-sp-2)',
              fontSize: 12,
              color: 'var(--cp-text-secondary)',
            }}
          >
            <span style={{ width: '100%' }}>
              {t('SERVICES.REGISTERED_ONLY', { env: environment })}
            </span>
            {registered.map((slug) => (
              <button
                key={slug}
                type="button"
                className="cp-chip cp-code"
                onClick={() => onOpenService(slug)}
              >
                {slug}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {isCreating ? (
        <CreateServiceModal
          onClose={() => setIsCreating(false)}
          onCreated={(slug) => {
            setIsCreating(false);
            onServiceCreated(slug);
          }}
        />
      ) : null}
    </div>
  );
}
