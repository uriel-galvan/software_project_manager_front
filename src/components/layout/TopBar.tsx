import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { Segmented } from '@/components/common/Segmented';
import { setLanguage, type Language } from '@/i18n';
import type { Environment } from '@/types/api';
import type { ThemeMode } from '@/types/ui';

const ENV_OPTIONS = [
  { value: 'dev' as const, label: 'dev' },
  { value: 'staging' as const, label: 'staging' },
  { value: 'prod' as const, label: 'prod' },
];

interface TopBarProps {
  environment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  hash: string;
  isLinkCopied: boolean;
  onCopyLink: () => void;
  onOpenSearch: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onGoHome: () => void;
}

export function TopBar(props: TopBarProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const otherLanguage: Language = i18n.language.startsWith('en') ? 'es' : 'en';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--cp-sp-5)',
        height: 48,
        flex: '0 0 48px',
        padding: '0 var(--cp-sp-5)',
        background: 'var(--cp-bg-card)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      <div
        onClick={props.onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter') props.onGoHome();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-3)',
          cursor: 'pointer',
          flex: '0 0 auto',
        }}
      >
        <Icon name="hub" size={20} color="var(--cp-primary-500)" />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('COMMON.APP_NAME')}</span>
      </div>

      <Segmented
        options={ENV_OPTIONS}
        value={props.environment}
        onChange={props.onEnvironmentChange}
        ariaLabel={t('SYSTEM.TITLE')}
      />

      <button
        type="button"
        onClick={props.onCopyLink}
        title={t('COMMON.COPY_LINK_HINT')}
        className="cp-code"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cp-sp-3)',
          height: 30,
          padding: '0 var(--cp-sp-3)',
          background: 'var(--cp-bg-inset)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--cp-r-sm)',
          cursor: 'pointer',
          color: 'var(--cp-text-secondary)',
          fontSize: 11,
        }}
      >
        <span className="cp-ellipsis" style={{ flex: 1, textAlign: 'left' }}>
          {props.hash}
        </span>
        <span style={{ fontWeight: 600, flex: '0 0 auto' }}>
          {props.isLinkCopied ? t('COMMON.COPIED') : t('COMMON.COPY')}
        </span>
      </button>

      <button
        type="button"
        className="cp-btn cp-btn--ghost"
        onClick={props.onOpenSearch}
        style={{ flex: '0 0 auto' }}
      >
        <Icon name="search" size={15} />
        {t('COMMON.SEARCH_ENDPOINTS')}
        <span
          className="cp-code"
          style={{
            padding: '1px 5px',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--cp-r-xs)',
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          Ctrl K
        </span>
      </button>

      <button
        type="button"
        className="cp-btn cp-btn--ghost"
        onClick={() => setLanguage(otherLanguage)}
        aria-label={otherLanguage}
        style={{ flex: '0 0 auto', textTransform: 'uppercase', fontWeight: 600 }}
      >
        {otherLanguage}
      </button>

      <button
        type="button"
        className="cp-btn cp-btn--ghost cp-btn--icon"
        title={t('COMMON.TOGGLE_THEME')}
        aria-label={t('COMMON.TOGGLE_THEME')}
        onClick={props.onToggleTheme}
        style={{ flex: '0 0 auto' }}
      >
        <Icon name={props.theme === 'dark' ? 'dark_mode' : 'light_mode'} size={15} />
      </button>
    </header>
  );
}
