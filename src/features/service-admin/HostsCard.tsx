import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createHost, deleteHost, updateHost } from '@/api/registry.api';
import { EmptyState } from '@/components/common/EmptyState';
import { useHub } from '@/features/shell/HubContext';
import { ENVIRONMENTS } from '@/hooks/useHashRoute';
import { useMutation } from '@/hooks/useMutation';
import { AdminCard, RowAction } from './AdminCard';
import type { HostAlias } from '@/types/api';

const COLUMNS = '110px 1fr 1fr 90px 150px';

interface HostDraft {
  environment: string;
  host: string;
  isExternal: boolean;
}

interface HostsCardProps {
  slug: string;
  hosts: HostAlias[];
  onChanged: () => void;
}

/** Alias de red de TODOS los entornos: aquí se administra, no se navega. */
export function HostsCard({ slug, hosts, onChanged }: HostsCardProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const mutation = useMutation();

  const emptyDraft: HostDraft = { environment: hub.environment, host: '', isExternal: false };
  const [newHost, setNewHost] = useState<HostDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<HostDraft>(emptyDraft);

  const sorted = [...hosts].sort(
    (a, b) =>
      a.regd1_environment.localeCompare(b.regd1_environment) ||
      a.regd1_host.localeCompare(b.regd1_host),
  );

  const add = async (): Promise<void> => {
    const result = await mutation.run(
      () =>
        createHost({
          service: slug,
          regd1_environment: newHost.environment,
          regd1_host: newHost.host,
          regd1_isexternal: newHost.isExternal,
        }),
      t('ADMIN.HOST_SAVED'),
    );
    if (result) {
      setNewHost({ ...newHost, host: '', isExternal: false });
      onChanged();
    }
  };

  const startEdit = (host: HostAlias): void => {
    setEditingId(host.regd1_index);
    setEditDraft({
      environment: host.regd1_environment,
      host: host.regd1_host,
      isExternal: host.regd1_isexternal,
    });
  };

  const saveEdit = async (id: number): Promise<void> => {
    const result = await mutation.run(
      () =>
        updateHost(id, {
          regd1_environment: editDraft.environment,
          regd1_host: editDraft.host,
          regd1_isexternal: editDraft.isExternal,
        }),
      t('ADMIN.HOST_SAVED'),
    );
    if (result) {
      setEditingId(null);
      onChanged();
    }
  };

  const remove = async (host: HostAlias): Promise<void> => {
    const ok = window.confirm(
      t('ADMIN.HOST_DELETE_CONFIRM', { host: host.regd1_host, env: host.regd1_environment }),
    );
    if (!ok) return;
    const result = await mutation.run(
      async () => {
        await deleteHost(host.regd1_index);
        return true;
      },
      t('ADMIN.HOST_DELETED'),
    );
    if (result) onChanged();
  };

  return (
    <AdminCard title={t('ADMIN.HOSTS_TITLE')} hint={t('ADMIN.HOSTS_HINT')}>
      <div className="cp-thead" style={{ gridTemplateColumns: COLUMNS }}>
        <div>{t('ADMIN.COL_ENV')}</div>
        <div>{t('ADMIN.COL_HOST')}</div>
        <div>{t('ADMIN.COL_KEY')}</div>
        <div className="cp-center">{t('ADMIN.COL_EXTERNAL')}</div>
        <div aria-hidden="true" />
      </div>

      {sorted.length === 0 ? (
        <EmptyState compact icon="dns" title={t('ADMIN.HOSTS_EMPTY')} />
      ) : (
        sorted.map((host) =>
          editingId === host.regd1_index ? (
            <HostEditor
              key={host.regd1_index}
              draft={editDraft}
              onChange={setEditDraft}
              isBusy={mutation.isBusy}
              submitLabel={t('ADMIN.SAVE')}
              onSubmit={() => void saveEdit(host.regd1_index)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={host.regd1_index}
              className="cp-trow"
              style={{ gridTemplateColumns: COLUMNS }}
            >
              <div>
                <span className="cp-tag">{host.regd1_environment}</span>
              </div>
              <div className="cp-code cp-ellipsis" style={{ fontWeight: 600 }}>
                {host.regd1_host}
              </div>
              <div className="cp-code cp-ellipsis" style={{ color: 'var(--cp-text-secondary)' }}>
                {host.regd1_host_key}
              </div>
              <div className="cp-center">
                {host.regd1_isexternal ? <span className="cp-tag">{t('ADMIN.EXTERNAL')}</span> : '—'}
              </div>
              <div style={{ display: 'flex', gap: 'var(--cp-sp-3)', justifyContent: 'flex-end' }}>
                <RowAction
                  label={t('ADMIN.EDIT')}
                  disabled={mutation.isBusy}
                  onClick={() => startEdit(host)}
                />
                <RowAction
                  label={t('ADMIN.DELETE')}
                  danger
                  disabled={mutation.isBusy}
                  onClick={() => void remove(host)}
                />
              </div>
            </div>
          ),
        )
      )}

      <div style={{ borderTop: '1px solid var(--cp-border)', background: 'var(--cp-bg-inset)' }}>
        <HostEditor
          draft={newHost}
          onChange={setNewHost}
          isBusy={mutation.isBusy}
          submitLabel={t('ADMIN.ADD')}
          onSubmit={() => void add()}
        />
      </div>
    </AdminCard>
  );
}

interface HostEditorProps {
  draft: HostDraft;
  onChange: (draft: HostDraft) => void;
  isBusy: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

function HostEditor(props: HostEditorProps): React.ReactElement {
  const { t } = useTranslation();
  const { draft } = props;

  return (
    <form
      className="cp-trow"
      style={{ gridTemplateColumns: COLUMNS, gap: 'var(--cp-sp-2)' }}
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.host.trim()) props.onSubmit();
      }}
    >
      <select
        className="cp-select"
        value={draft.environment}
        onChange={(event) => props.onChange({ ...draft, environment: event.target.value })}
      >
        {/* El hub acepta cualquier entorno; un alias en uno fuera de la lista
            tiene que poder editarse sin que el select lo pierda. */}
        {[...new Set<string>([...ENVIRONMENTS, draft.environment])].map((env) => (
          <option key={env} value={env}>
            {env}
          </option>
        ))}
      </select>
      <input
        className="cp-input cp-code"
        style={{ gridColumn: 'span 2' }}
        placeholder={t('ADMIN.HOST_PLACEHOLDER')}
        value={draft.host}
        onChange={(event) => props.onChange({ ...draft, host: event.target.value })}
      />
      <div className="cp-center">
        <input
          type="checkbox"
          aria-label={t('ADMIN.COL_EXTERNAL')}
          checked={draft.isExternal}
          onChange={(event) => props.onChange({ ...draft, isExternal: event.target.checked })}
        />
      </div>
      <div style={{ display: 'flex', gap: 'var(--cp-sp-2)', justifyContent: 'flex-end' }}>
        {props.onCancel ? (
          <button type="button" className="cp-btn cp-btn--ghost" onClick={props.onCancel}>
            {t('ADMIN.CANCEL')}
          </button>
        ) : null}
        <button
          type="submit"
          className="cp-btn cp-btn--primary"
          disabled={props.isBusy || !draft.host.trim()}
        >
          {props.submitLabel}
        </button>
      </div>
    </form>
  );
}
