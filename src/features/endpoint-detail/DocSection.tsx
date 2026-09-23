import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icon';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { isDocumented } from '@/hooks/useEndpointMarks';
import { formatDate } from '@/utils/format';
import type { EndpointDetail } from '@/types/api';

interface DocSectionProps {
  endpoint: EndpointDetail;
  repoUrl: string;
}

export function DocSection({ endpoint, repoUrl }: DocSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const copy = useHealthCopy();
  const documented = isDocumented(endpoint);

  const provenance: { key: string; value: string; tone?: string }[] = [
    { key: t('ENDPOINT.PROV_OPERATION_ID'), value: endpoint.regd3_operation_id || '—' },
    { key: t('ENDPOINT.PROV_SHAPE'), value: endpoint.regd3_shape || '—' },
    { key: t('ENDPOINT.PROV_INBOUND'), value: endpoint.regd3_inbound_label || '—' },
    { key: t('ENDPOINT.PROV_ENVIRONMENT'), value: endpoint.regd3_environment },
    { key: t('ENDPOINT.PROV_FIRST_SEEN'), value: formatDate(endpoint.regd3_first_seen) },
    {
      key: t('ENDPOINT.PROV_LAST_SEEN'),
      value: copy.relative(endpoint.regd3_last_seen),
      tone: endpoint.regd3_retired_at ? 'var(--cp-error)' : undefined,
    },
    {
      key: t('ENDPOINT.PROV_DOC'),
      value: t(documented ? 'ENDPOINT.PROV_DOC_PRESENT' : 'ENDPOINT.PROV_DOC_ABSENT'),
      tone: documented ? 'var(--cp-success)' : 'var(--cp-warning)',
    },
  ];

  return (
    <div
      style={{
        padding: 'var(--cp-sp-5)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 'var(--cp-sp-5)',
        alignItems: 'start',
      }}
    >
      <div className="cp-card" style={{ padding: '18px 20px' }}>
        {documented ? (
          <>
            <h3>{endpoint.regd3_summary || endpoint.regd3_operation_id}</h3>
            {endpoint.regd3_description ? (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--cp-text-secondary)',
                  margin: '8px 0 0',
                  maxWidth: '68ch',
                  textWrap: 'pretty',
                }}
              >
                {endpoint.regd3_description}
              </p>
            ) : null}

            {endpoint.regd3_use_case ? (
              <>
                <Divider />
                <h4>{t('ENDPOINT.USE_CASE')}</h4>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--cp-text-secondary)',
                    margin: '6px 0 0',
                    maxWidth: '68ch',
                  }}
                >
                  {endpoint.regd3_use_case}
                </p>
              </>
            ) : null}

            {Object.keys(endpoint.regd3_requires ?? {}).length > 0 ? (
              <>
                <Divider />
                <h4>{t('ENDPOINT.REQUIRES')}</h4>
                <pre
                  className="cp-code"
                  style={{
                    fontSize: 11,
                    margin: '6px 0 0',
                    padding: 'var(--cp-sp-3)',
                    background: 'var(--cp-bg-inset)',
                    borderRadius: 'var(--cp-r-sm)',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(endpoint.regd3_requires, null, 2)}
                </pre>
              </>
            ) : null}
          </>
        ) : (
          <div>
            <h3>{t('ENDPOINT.NO_DOCS_TITLE')}</h3>
            <p
              style={{
                fontSize: 12,
                color: 'var(--cp-text-secondary)',
                margin: '8px 0 14px',
                maxWidth: '62ch',
                textWrap: 'pretty',
              }}
            >
              {t('ENDPOINT.NO_DOCS_BODY')}
            </p>
            <div
              style={{
                background: 'var(--cp-bg-inset)',
                border: '1px solid var(--cp-border)',
                borderRadius: 'var(--cp-r)',
                padding: '12px var(--cp-sp-4)',
              }}
            >
              <SectionLabel text={t('ENDPOINT.NO_DOCS_WHERE')} />
              <div className="cp-code" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.7 }}>
                {endpoint.regd3_operation_id || endpoint.regd3_path_template}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--cp-text-secondary)',
                  marginTop: 'var(--cp-sp-2)',
                }}
              >
                {t('ENDPOINT.NO_DOCS_HINT')}
              </div>
            </div>
            {repoUrl ? (
              <a
                className="cp-btn cp-btn--primary"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 'var(--cp-sp-4)' }}
              >
                <Icon name="open_in_new" size={14} />
                {t('ENDPOINT.OPEN_REPO')}
              </a>
            ) : null}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cp-sp-4)' }}>
        <div className="cp-card" style={{ padding: '13px var(--cp-sp-4)' }}>
          <SectionLabel text={t('ENDPOINT.TAGS')} />
          <div
            style={{ display: 'flex', gap: 5, marginTop: 'var(--cp-sp-3)', flexWrap: 'wrap' }}
          >
            {endpoint.regd3_tags.length === 0 ? (
              <span style={{ color: 'var(--cp-text-muted)' }}>—</span>
            ) : (
              endpoint.regd3_tags.map((tag) => (
                <span key={tag} className="cp-tag">
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="cp-card" style={{ padding: '13px var(--cp-sp-4)' }}>
          <SectionLabel text={t('ENDPOINT.PROVENANCE')} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
              marginTop: 'var(--cp-sp-3)',
            }}
          >
            {provenance.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'var(--cp-sp-3)',
                }}
              >
                <span style={{ color: 'var(--cp-text-secondary)' }}>{item.key}</span>
                <span
                  className="cp-code cp-ellipsis"
                  style={{ textAlign: 'right', color: item.tone ?? 'var(--cp-text-secondary)' }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider(): React.ReactElement {
  return (
    <div
      style={{
        height: 1,
        background: 'var(--cp-border-subtle)',
        margin: 'var(--cp-sp-5) 0',
      }}
    />
  );
}

function SectionLabel({ text }: { text: string }): React.ReactElement {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: 'var(--cp-text-secondary)',
      }}
    >
      {text}
    </div>
  );
}
