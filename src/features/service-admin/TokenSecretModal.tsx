import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { useHub } from '@/features/shell/HubContext';
import type { ServiceTokenSecret } from '@/types/api';

interface TokenSecretModalProps {
  secret: ServiceTokenSecret;
  onClose: () => void;
}

/** El token en claro, recién emitido, rotado o revelado. */
export function TokenSecretModal({ secret, onClose }: TokenSecretModalProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();

  const copy = (): void => {
    navigator.clipboard
      .writeText(secret.token)
      .then(() => hub.notify(t('ADMIN.TOKEN_COPIED'), 'success'))
      .catch(() => hub.notify(t('ENDPOINT.COPY_FAILED'), 'error'));
  };

  const codeBox: React.CSSProperties = {
    padding: 'var(--cp-sp-3)',
    borderRadius: 'var(--cp-r-sm)',
    background: 'var(--cp-bg-inset)',
    border: '1px solid var(--cp-border)',
    fontSize: 12,
    wordBreak: 'break-all',
    userSelect: 'all',
  };

  return (
    <Modal
      size="md"
      onClose={onClose}
      header={
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-2)' }}>
          <Icon name="key" size={16} />
          <h4>
            {t('ADMIN.SECRET_TITLE', { slug: secret.service, env: secret.regd4_environment })}
          </h4>
        </span>
      }
      footer={
        <>
          <button type="button" className="cp-btn cp-btn--primary" onClick={copy}>
            <Icon name="content_copy" size={14} />
            {t('ADMIN.COPY_TOKEN')}
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--ghost"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            {t('COMMON.CLOSE')}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>{t('ADMIN.SECRET_HINT')}</p>
      <div className="cp-code" style={{ ...codeBox, marginTop: 'var(--cp-sp-3)', fontWeight: 600 }}>
        {secret.token}
      </div>
      <div
        style={{
          marginTop: 'var(--cp-sp-4)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--cp-text-secondary)',
        }}
      >
        {t('ADMIN.SECRET_SNIPPET')}
      </div>
      <pre className="cp-code" style={{ ...codeBox, margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
        {`REGISTRY["HUB_TOKEN"] = "${secret.token}"\n\nREGISTRY_HUB_TOKEN=${secret.token}`}
      </pre>
    </Modal>
  );
}
