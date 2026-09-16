/**
 * DUMB — catálogo de los estados explícitos del hub.
 *
 * No es decoración: con dos o tres servicios instrumentados al principio,
 * estos estados son la mayoría de lo que la gente va a ver, y la pantalla
 * fija qué dice el hub en cada uno.
 */
import { useTranslation } from 'react-i18next';

type Severity = 'ambiguous' | 'severe' | 'incomplete' | 'nudge' | 'escape' | 'frequent';

interface StateCard {
  id: string;
  severityKey: string;
  severity: Severity;
  hasCode: boolean;
}

const CARDS: readonly StateCard[] = [
  { id: '1', severityKey: 'STATES.SEV_AMBIGUOUS', severity: 'ambiguous', hasCode: false },
  { id: '2', severityKey: 'STATES.SEV_SEVERE', severity: 'severe', hasCode: false },
  { id: '3', severityKey: 'STATES.SEV_INCOMPLETE', severity: 'incomplete', hasCode: false },
  { id: '4', severityKey: 'STATES.SEV_NUDGE', severity: 'nudge', hasCode: true },
  { id: '5', severityKey: 'STATES.SEV_ESCAPE', severity: 'escape', hasCode: false },
  { id: '6', severityKey: 'STATES.SEV_FREQUENT', severity: 'frequent', hasCode: true },
];

const TONE: Record<Severity, { fg: string; bg: string; border: string }> = {
  ambiguous: {
    fg: 'var(--cp-warning)',
    bg: 'var(--cp-warning-surface)',
    border: 'var(--cp-warning-border)',
  },
  severe: {
    fg: 'var(--cp-error)',
    bg: 'var(--cp-error-surface)',
    border: 'var(--cp-error-border)',
  },
  incomplete: {
    fg: 'var(--cp-warning)',
    bg: 'var(--cp-warning-surface)',
    border: 'var(--cp-warning-border)',
  },
  nudge: {
    fg: 'var(--cp-primary-500)',
    bg: 'var(--cp-primary-50)',
    border: 'var(--cp-primary-200)',
  },
  escape: {
    fg: 'var(--cp-warning)',
    bg: 'var(--cp-warning-surface)',
    border: 'var(--cp-warning-border)',
  },
  frequent: {
    fg: 'var(--cp-text-secondary)',
    bg: 'var(--cp-bg-card)',
    border: 'var(--cp-border)',
  },
};

export function StatesPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ flex: 1, padding: '22px var(--cp-sp-5) 60px' }}>
      <h1>{t('STATES.TITLE')}</h1>
      <p
        style={{
          fontSize: 12,
          color: 'var(--cp-text-secondary)',
          margin: '4px 0 20px',
          maxWidth: '70ch',
        }}
      >
        {t('STATES.SUBTITLE')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 'var(--cp-sp-4)',
        }}
      >
        {CARDS.map((card) => {
          const tone = TONE[card.severity];
          return (
            <div key={card.id} className="cp-card">
              <div style={{ padding: '11px var(--cp-sp-4)', borderBottom: '1px solid var(--cp-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-3)' }}>
                  <span
                    style={{ width: 6, height: 6, borderRadius: '50%', background: tone.fg }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {t(`STATES.CARD_${card.id}_TITLE`)}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                      color: tone.fg,
                    }}
                  >
                    {t(card.severityKey)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--cp-text-secondary)',
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {t(`STATES.CARD_${card.id}_WHY`)}
                </div>
              </div>

              <div style={{ padding: 'var(--cp-sp-4)', background: 'var(--cp-bg-inset)' }}>
                <div
                  style={{
                    background: tone.bg,
                    border: `1px solid ${tone.border}`,
                    borderRadius: 'var(--cp-r)',
                    padding: '11px var(--cp-sp-4)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {t(`STATES.CARD_${card.id}_DEMO_TITLE`)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--cp-text-secondary)',
                      marginTop: 5,
                      lineHeight: 1.5,
                    }}
                  >
                    {t(`STATES.CARD_${card.id}_DEMO_BODY`)}
                  </div>
                  {card.hasCode ? (
                    <div
                      className="cp-code"
                      style={{
                        fontSize: 11,
                        marginTop: 'var(--cp-sp-3)',
                        padding: '7px 9px',
                        background: 'var(--cp-n-100)',
                        borderRadius: 'var(--cp-r-sm)',
                        color: 'var(--cp-text-secondary)',
                      }}
                    >
                      {t(`STATES.CARD_${card.id}_CODE`)}
                    </div>
                  ) : null}
                  <div
                    className="cp-btn cp-btn--ghost"
                    style={{ marginTop: 'var(--cp-sp-3)', cursor: 'default' }}
                  >
                    {t(`STATES.CARD_${card.id}_CTA`)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
