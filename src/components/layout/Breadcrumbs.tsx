import { useTranslation } from 'react-i18next';

export interface Crumb {
  label: string;
  isCode?: boolean;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  activeTab: 'states' | 'system' | null;
  onGoStates: () => void;
  onGoSystem: () => void;
}

export function Breadcrumbs(props: BreadcrumbsProps): React.ReactElement {
  const { t } = useTranslation();

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '3px 9px',
    borderRadius: 'var(--cp-r-xs)',
    fontSize: 12,
    fontWeight: 600,
    border: 0,
    cursor: 'pointer',
    background: isActive ? 'var(--cp-primary-50)' : 'transparent',
    color: isActive ? 'var(--cp-primary-500)' : 'var(--cp-text-secondary)',
  });

  return (
    <nav
      style={{
        position: 'sticky',
        top: 48,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--cp-sp-3)',
        height: 36,
        flex: '0 0 36px',
        padding: '0 var(--cp-sp-5)',
        background: 'var(--cp-bg-page)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      {props.crumbs.map((crumb, index) => {
        const isLast = index === props.crumbs.length - 1;
        const isClickable = !isLast && Boolean(crumb.onClick);
        return (
          <span
            key={`${crumb.label}-${index}`}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-3)' }}
          >
            <span
              className={crumb.isCode ? 'cp-code' : undefined}
              onClick={isClickable ? crumb.onClick : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(event) => {
                if (isClickable && event.key === 'Enter' && crumb.onClick) crumb.onClick();
              }}
              style={{
                fontSize: 13,
                fontWeight: 600,
                cursor: isClickable ? 'pointer' : 'default',
                color: isLast ? 'var(--cp-text-primary)' : 'var(--cp-primary-500)',
              }}
            >
              {crumb.label}
            </span>
            {isLast ? null : <span style={{ color: 'var(--cp-text-muted)' }}>/</span>}
          </span>
        );
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--cp-sp-1)' }}>
        <button
          type="button"
          style={tabStyle(props.activeTab === 'states')}
          onClick={props.onGoStates}
        >
          {t('NAV.STATES')}
        </button>
        <button
          type="button"
          style={tabStyle(props.activeTab === 'system')}
          onClick={props.onGoSystem}
        >
          {t('NAV.SYSTEM')}
        </button>
      </div>
    </nav>
  );
}
