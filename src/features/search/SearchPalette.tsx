/** SMART — paleta de búsqueda híbrida (`/services/apis/search/`). */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSearch } from '@/api/registry.api';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { MethodBadge } from '@/components/common/MethodBadge';
import { Modal } from '@/components/common/Modal';
import { ServiceRef } from '@/components/common/ServiceRef';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useServiceName } from '@/features/shell/HubContext';
import type { EndpointSummary, Environment } from '@/types/api';

const DEBOUNCE_MS = 250;
const LIMIT = 8;
const COLUMNS = '70px minmax(0,1.2fr) minmax(0,1fr) 130px';

interface SearchPaletteProps {
  environment: Environment;
  onClose: () => void;
  onOpenEndpoint: (slug: string, endpointId: number) => void;
}

export function SearchPalette(props: SearchPaletteProps): React.ReactElement {
  const { t } = useTranslation();
  const serviceName = useServiceName();
  const [query, setQuery] = useState<string>('');
  const [debounced, setDebounced] = useState<string>('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const search = useAsync<EndpointSummary[]>(
    async (signal) => {
      if (!debounced) return [];
      const payload = await fetchSearch(debounced, props.environment, LIMIT, signal);
      return payload.results;
    },
    [debounced, props.environment],
  );

  const results = search.data ?? [];

  return (
    <Modal
      size="lg"
      align="top"
      bare
      onClose={props.onClose}
      header={
        <>
          <Icon name="search" size={16} color="var(--cp-text-secondary)" />
          <input
            autoFocus
            className="cp-input"
            value={query}
            placeholder={t('SEARCH.PLACEHOLDER')}
            aria-label={t('SEARCH.PLACEHOLDER')}
            onChange={(event) => setQuery(event.target.value)}
            style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14, height: 26 }}
          />
        </>
      }
      footer={
        <>
          <span style={{ fontSize: 11, color: 'var(--cp-text-secondary)' }}>
            {debounced ? t('SEARCH.RESULTS', { count: results.length }) : t('SEARCH.HINT')}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: 'var(--cp-text-secondary)',
            }}
          >
            {t('SEARCH.FOOTER', { env: props.environment })}
          </span>
        </>
      }
    >
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {!debounced ? (
          <EmptyState compact icon="search" title={t('SEARCH.HINT')} />
        ) : search.isLoading ? (
          <TableSkeleton columns={COLUMNS} rows={4} />
        ) : results.length === 0 ? (
          <EmptyState
            compact
            icon="search_off"
            title={t('SEARCH.EMPTY_TITLE', { env: props.environment, query: debounced })}
            body={t('SEARCH.EMPTY_BODY')}
          />
        ) : (
          results.map((endpoint) => (
            <div
              key={endpoint.regd3_index}
              className="cp-trow cp-trow--clickable"
              role="button"
              tabIndex={0}
              onClick={() => props.onOpenEndpoint(endpoint.service, endpoint.regd3_index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  props.onOpenEndpoint(endpoint.service, endpoint.regd3_index);
                }
              }}
              style={{
                gridTemplateColumns: COLUMNS,
                gap: 'var(--cp-sp-3)',
                opacity: endpoint.regd3_retired_at ? 0.55 : 1,
              }}
            >
              <MethodBadge method={endpoint.regd3_method} />
              <span className="cp-code cp-ellipsis" style={{ fontSize: 12 }}>
                {endpoint.regd3_path_template}
              </span>
              <span className="cp-ellipsis" style={{ color: 'var(--cp-text-secondary)' }}>
                {endpoint.regd3_summary || '—'}
              </span>
              <ServiceRef
                slug={endpoint.service}
                name={serviceName(endpoint.service)}
                size={13}
              />
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
