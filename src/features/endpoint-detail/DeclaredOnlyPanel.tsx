import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import { ServiceRef } from '@/components/common/ServiceRef';
import type { DeclaredOnlyConsumer } from '@/types/api';

interface DeclaredOnlyPanelProps {
  declaredOnly: DeclaredOnlyConsumer[];
  serviceName: (slug: string) => string;
  onOpenService: (slug: string) => void;
}

/**
 * Una dependencia declarada que nunca se observa es código muerto o
 * documentación que miente. Ninguna de las dos mitades del hub lo sabe sola.
 */
export function DeclaredOnlyPanel(props: DeclaredOnlyPanelProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="cp-card">
      <div className="cp-card-head">
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            border: '1.5px solid var(--cp-text-secondary)',
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {t('ENDPOINT.DECLARED_ONLY_TITLE')}
        </span>
        <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
          {t('ENDPOINT.DECLARED_ONLY_HINT')}
        </span>
      </div>

      {props.declaredOnly.length === 0 ? (
        <EmptyState
          compact
          icon="fact_check"
          title={t('ENDPOINT.NO_OUTGOING_TITLE')}
          body={t('ENDPOINT.NO_OUTGOING_BODY')}
        />
      ) : (
        props.declaredOnly.map((declared, index) => (
          <div
            key={`${declared.service}-${declared.declared_call}-${index}`}
            style={{
              padding: '10px var(--cp-sp-4)',
              borderBottom: '1px solid var(--cp-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cp-sp-3)' }}>
              <ServiceRef
                slug={declared.service}
                name={props.serviceName(declared.service)}
                size={14}
                onClick={() => props.onOpenService(declared.service)}
              />
              <span className="cp-code cp-ellipsis" style={{ fontSize: 12 }}>
                {declared.declared_call}
              </span>
            </div>
            {declared.declared_in ? (
              <div
                className="cp-code"
                style={{
                  marginTop: 4,
                  paddingLeft: 22,
                  fontSize: 11,
                  color: 'var(--cp-text-secondary)',
                }}
              >
                {t('ENDPOINT.DECLARED_IN', { origin: declared.declared_in })}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
