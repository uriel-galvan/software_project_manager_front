/**
 * DUMB — el sistema de diseño tal y como está implementado: los tokens que
 * esta pantalla enseña son exactamente los que consumen las otras cuatro.
 */
import { useTranslation } from 'react-i18next';
import { MethodBadge } from '@/components/common/MethodBadge';
import { SystemComponents } from './SystemComponents';
import type { HttpMethod } from '@/types/api';
import type { ThemeMode } from '@/types/ui';

const METHODS: readonly { method: HttpMethod; useKey: string; token: string }[] = [
  { method: 'GET', useKey: 'SYSTEM.USE_GET', token: '--cp-method-get-fg' },
  { method: 'POST', useKey: 'SYSTEM.USE_POST', token: '--cp-method-post-fg' },
  { method: 'PUT', useKey: 'SYSTEM.USE_PUT', token: '--cp-method-put-fg' },
  { method: 'PATCH', useKey: 'SYSTEM.USE_PATCH', token: '--cp-method-patch-fg' },
  { method: 'DELETE', useKey: 'SYSTEM.USE_DELETE', token: '--cp-method-delete-fg' },
];

const SURFACES: readonly string[] = [
  '--cp-bg-page',
  '--cp-bg-card',
  '--cp-bg-tinted',
  '--cp-bg-inset',
  '--cp-border-subtle',
  '--cp-border',
  '--cp-border-strong',
  '--cp-primary-500',
];

const SPACING: readonly { token: string; width: number; useKey: string }[] = [
  { token: '--cp-sp-1', width: 2, useKey: 'SYSTEM.SPACE_1' },
  { token: '--cp-sp-2', width: 5, useKey: 'SYSTEM.SPACE_2' },
  { token: '--cp-sp-3', width: 8, useKey: 'SYSTEM.SPACE_3' },
  { token: '--cp-sp-4', width: 13, useKey: 'SYSTEM.SPACE_4' },
  { token: '--cp-sp-5', width: 16, useKey: 'SYSTEM.SPACE_5' },
  { token: '--cp-sp-6', width: 26, useKey: 'SYSTEM.SPACE_6' },
];

interface SystemPageProps {
  theme: ThemeMode;
}

export function SystemPage({ theme }: SystemPageProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ flex: 1, padding: '22px var(--cp-sp-5) 60px' }}>
      <h1>{t('SYSTEM.TITLE')}</h1>
      <p style={{ fontSize: 12, color: 'var(--cp-text-secondary)', margin: '4px 0 20px' }}>
        {t('SYSTEM.SUBTITLE')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--cp-sp-4)',
          alignItems: 'start',
        }}
      >
        <Panel title={t('SYSTEM.METHOD_COLORS')}>
          {METHODS.map((entry) => (
            <div
              key={entry.method}
              style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 8 }}
            >
              <span style={{ width: 76 }}>
                <MethodBadge method={entry.method} size="md" />
              </span>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--cp-r-sm)',
                  background: `var(${entry.token})`,
                }}
              />
              <span className="cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
                {entry.token}
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--cp-text-secondary)' }}>
                {t(entry.useKey)}
              </span>
            </div>
          ))}
        </Panel>

        <Panel title={t('SYSTEM.TYPOGRAPHY')}>
          <div style={{ marginTop: 'var(--cp-sp-3)' }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{t('SYSTEM.TYPE_SAMPLE_TITLE')}</div>
            <div style={{ fontSize: 11, marginTop: 3 }}>{t('SYSTEM.TYPE_SAMPLE_BODY')}</div>
          </div>
          <div style={{ height: 1, background: 'var(--cp-border-subtle)', margin: '11px 0' }} />
          <div className="cp-code" style={{ fontSize: 16, fontWeight: 500 }}>
            /api/customers/{'{id}'}/
          </div>
          <div style={{ fontSize: 11, color: 'var(--cp-text-secondary)', marginTop: 3 }}>
            {t('SYSTEM.TYPE_SAMPLE_CODE')}
          </div>
        </Panel>

        <Panel title={t('SYSTEM.SURFACES', { theme })}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--cp-sp-3)',
              marginTop: 'var(--cp-sp-3)',
            }}
          >
            {SURFACES.map((token) => (
              <div key={token}>
                <div
                  style={{
                    height: 40,
                    borderRadius: 'var(--cp-r-sm)',
                    background: `var(${token})`,
                    border: '1px solid var(--cp-border)',
                  }}
                />
                <div
                  className="cp-code"
                  style={{ fontSize: 10, color: 'var(--cp-text-secondary)', marginTop: 4 }}
                >
                  {token}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t('SYSTEM.SPACING')}>
          {SPACING.map((entry) => (
            <div
              key={entry.token}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}
            >
              <span className="cp-code" style={{ width: 70, color: 'var(--cp-text-secondary)' }}>
                {entry.token}
              </span>
              <span
                style={{
                  height: 9,
                  width: entry.width,
                  background: 'var(--cp-primary-50)',
                  borderLeft: '2px solid var(--cp-primary-500)',
                }}
              />
              <span style={{ color: 'var(--cp-text-secondary)' }}>{t(entry.useKey)}</span>
            </div>
          ))}
        </Panel>
      </div>

      <h4 style={{ margin: '26px 0 12px' }}>{t('SYSTEM.SHARED_COMPONENTS')}</h4>
      <SystemComponents methods={METHODS.map((entry) => entry.method)} />
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="cp-card" style={{ padding: 15 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: 'var(--cp-text-secondary)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
