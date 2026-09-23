import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { buildContract, isContractEmpty, type ContractBlock } from './contract';
import type { EndpointSchema } from '@/types/api';

const TITLE_KEY: Record<ContractBlock['id'], string> = {
  params: 'ENDPOINT.CONTRACT_PARAMS',
  body: 'ENDPOINT.CONTRACT_BODY',
  responses: 'ENDPOINT.CONTRACT_RESPONSES',
};

const EMPTY_KEY: Record<ContractBlock['id'], string> = {
  params: 'ENDPOINT.CONTRACT_NO_PARAMS',
  body: 'ENDPOINT.CONTRACT_NO_BODY',
  responses: 'ENDPOINT.CONTRACT_NO_RESPONSES',
};

const NAME_TONE = {
  normal: 'var(--cp-text-primary)',
  success: 'var(--cp-success)',
  error: 'var(--cp-error)',
};

interface ContractSectionProps {
  schema: EndpointSchema | null;
}

export function ContractSection({ schema }: ContractSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    params: true,
    body: false,
    responses: true,
  });

  const blocks = buildContract(schema);

  if (isContractEmpty(blocks)) {
    return (
      <div style={{ padding: 'var(--cp-sp-5)', maxWidth: 1000 }}>
        <div className="cp-card">
          <EmptyState
            icon="description"
            title={t('ENDPOINT.CONTRACT_EMPTY')}
            compact
          />
        </div>
      </div>
    );
  }

  const subtitleOf = (block: ContractBlock): string => {
    if (block.id === 'params') return t('ENDPOINT.CONTRACT_PARAMS_SUB', block.counts);
    if (block.id === 'body') return block.mediaTypes.join(' · ');
    return block.statusCodes.join(' · ');
  };

  return (
    <div style={{ padding: 'var(--cp-sp-5)', maxWidth: 1000 }}>
      {blocks.map((block) => {
        const isOpen = openBlocks[block.id];
        return (
          <div key={block.id} className="cp-card" style={{ marginBottom: 'var(--cp-sp-4)' }}>
            <button
              type="button"
              onClick={() =>
                setOpenBlocks((current) => ({ ...current, [block.id]: !current[block.id] }))
              }
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--cp-sp-3)',
                padding: '11px var(--cp-sp-4)',
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: `1px solid ${isOpen ? 'var(--cp-border-subtle)' : 'transparent'}`,
              }}
            >
              <Icon
                name={isOpen ? 'expand_more' : 'chevron_right'}
                size={15}
                color="var(--cp-text-secondary)"
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{t(TITLE_KEY[block.id])}</span>
              <span className="cp-code" style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
                {subtitleOf(block)}
              </span>
            </button>

            {isOpen ? (
              block.rows.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--cp-sp-4) 32px',
                    fontSize: 12,
                    color: 'var(--cp-text-secondary)',
                  }}
                >
                  {t(EMPTY_KEY[block.id])}
                </div>
              ) : (
                block.rows.map((row) => (
                  <div
                    key={`${block.id}-${row.name}`}
                    className="cp-trow"
                    style={{
                      gridTemplateColumns: '200px 140px 90px 1fr',
                      gap: 'var(--cp-sp-3)',
                      alignItems: 'baseline',
                      paddingLeft: 32,
                    }}
                  >
                    <span
                      className="cp-code"
                      style={{ fontSize: 12, fontWeight: 600, color: NAME_TONE[row.tone] }}
                    >
                      {row.name}
                    </span>
                    <span className="cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
                      {row.type}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          row.requirement === 'required'
                            ? 'var(--cp-error)'
                            : 'var(--cp-text-muted)',
                      }}
                    >
                      {row.requirement === 'none'
                        ? ''
                        : t(
                            row.requirement === 'required'
                              ? 'ENDPOINT.CONTRACT_REQUIRED'
                              : 'ENDPOINT.CONTRACT_OPTIONAL',
                          )}
                    </span>
                    <span style={{ color: 'var(--cp-text-secondary)', lineHeight: 1.45 }}>
                      {row.description}
                    </span>
                  </div>
                ))
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
