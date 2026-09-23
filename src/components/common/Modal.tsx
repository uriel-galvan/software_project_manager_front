import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

interface ModalProps {
  size?: 'sm' | 'md' | 'lg';
  align?: 'center' | 'top';
  onClose: () => void;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** El cuerpo ya trae su propio padding (paleta de búsqueda). */
  bare?: boolean;
}

export function Modal({
  size = 'md',
  align = 'center',
  onClose,
  header,
  footer,
  children,
  bare = false,
}: ModalProps): React.ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="cp-modal-backdrop"
      onClick={onClose}
      style={{ alignItems: align === 'top' ? 'flex-start' : 'center' }}
    >
      <div
        className={`cp-modal cp-modal--${size}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={align === 'top' ? { marginTop: 56 } : undefined}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cp-sp-3)',
            padding: 'var(--cp-sp-4) var(--cp-sp-5)',
            borderBottom: '1px solid var(--cp-border-subtle)',
          }}
        >
          {header}
          <button
            type="button"
            className="cp-btn cp-btn--ghost cp-btn--icon"
            style={{ marginLeft: 'auto' }}
            aria-label={t('COMMON.CLOSE')}
            onClick={onClose}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
        <div className={bare ? undefined : 'cp-modal-body'} style={{ overflowY: 'auto' }}>
          {children}
        </div>
        {footer ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cp-sp-4)',
              padding: 'var(--cp-sp-4) var(--cp-sp-5)',
              background: 'var(--cp-bg-inset)',
              borderTop: '1px solid var(--cp-border-subtle)',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
