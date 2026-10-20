/** Modo planeación de la paleta — RAG sobre la documentación (`/knowledge/ask/`). */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { askPlanner } from '@/api/registry.api';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Icon } from '@/components/common/Icon';
import { MethodBadge } from '@/components/common/MethodBadge';
import { Modal } from '@/components/common/Modal';
import { ServiceRef } from '@/components/common/ServiceRef';
import { Skeleton } from '@/components/common/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useServiceName } from '@/features/shell/HubContext';
import type { Environment, PlannerAnswer } from '@/types/api';

interface PlannerModeProps {
  environment: Environment;
  onClose: () => void;
  onOpenEndpoint: (slug: string, endpointId: number) => void;
  /** Selector Buscar / Planear, que vive en el encabezado de ambos modos. */
  toggle: React.ReactNode;
}

export function PlannerMode(props: PlannerModeProps): React.ReactElement {
  const { t } = useTranslation();
  const serviceName = useServiceName();
  const [draft, setDraft] = useState<string>('');
  const [asked, setAsked] = useState<string>('');
  // Repreguntar lo mismo vuelve a consultar: el modelo puede responder distinto.
  const [submits, setSubmits] = useState<number>(0);

  const plan = useAsync<PlannerAnswer | null>(
    async (signal) => {
      if (!asked) return null;
      return askPlanner(asked, props.environment, signal);
    },
    [asked, submits, props.environment],
  );

  const submit = (): void => {
    const question = draft.trim();
    if (!question) return;
    setAsked(question);
    setSubmits((value) => value + 1);
  };

  const answer = plan.data;

  return (
    <Modal
      size="lg"
      align="top"
      bare
      onClose={props.onClose}
      header={
        <>
          {props.toggle}
          <Icon name="auto_awesome" size={16} color="var(--cp-text-secondary)" />
          <input
            autoFocus
            className="cp-input"
            value={draft}
            maxLength={1000}
            placeholder={t('PLANNER.PLACEHOLDER')}
            aria-label={t('PLANNER.PLACEHOLDER')}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14, height: 26 }}
          />
        </>
      }
      footer={
        <>
          <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
            {t('PLANNER.FOOTER_HINT')}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--cp-text-secondary)' }}>
            {t('SEARCH.FOOTER', { env: props.environment })}
          </span>
        </>
      }
    >
      <div style={{ maxHeight: 480, overflow: 'auto' }}>
        {!asked ? (
          <EmptyState compact icon="auto_awesome" title={t('PLANNER.HINT')} />
        ) : plan.isLoading ? (
          <div style={{ padding: 'var(--cp-sp-5)', display: 'grid', gap: 'var(--cp-sp-3)' }}>
            <span style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>
              {t('PLANNER.THINKING')}
            </span>
            <Skeleton height={14} />
            <Skeleton height={14} />
            <Skeleton height={14} width="60%" />
          </div>
        ) : plan.error ? (
          <ErrorState error={plan.error} onRetry={plan.reload} />
        ) : answer ? (
          <div style={{ padding: 'var(--cp-sp-5)', display: 'grid', gap: 'var(--cp-sp-4)' }}>
            {!answer.grounded ? (
              <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
                {t('PLANNER.NOT_GROUNDED')}
              </span>
            ) : null}
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.55 }}>
              {answer.answer}
            </div>
            {answer.sources.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--cp-sp-2)' }}>
                <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
                  {t('PLANNER.SOURCES')}
                </span>
                {answer.sources.map((source) => (
                  <div
                    key={source.regd3_index}
                    className="cp-trow cp-trow--clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => props.onOpenEndpoint(source.service, source.regd3_index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        props.onOpenEndpoint(source.service, source.regd3_index);
                      }
                    }}
                    style={{
                      gridTemplateColumns: '70px minmax(0,1fr) 130px',
                      gap: 'var(--cp-sp-3)',
                    }}
                  >
                    <MethodBadge method={source.method} />
                    <span className="cp-code cp-ellipsis" style={{ fontSize: 12 }}>
                      {source.path}
                    </span>
                    <ServiceRef
                      slug={source.service}
                      name={serviceName(source.service)}
                      size={13}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
