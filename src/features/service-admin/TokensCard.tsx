import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchTokens,
  issueToken,
  revealToken,
  revokeToken,
  rotateToken,
  updateToken,
} from '@/api/registry.api';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useHealthCopy } from '@/features/health/useHealthCopy';
import { useHub } from '@/features/shell/HubContext';
import { useAsync } from '@/hooks/useAsync';
import { ENVIRONMENTS } from '@/hooks/useHashRoute';
import { useMutation } from '@/hooks/useMutation';
import { formatDateTime } from '@/utils/format';
import { AdminCard, RowAction } from './AdminCard';
import { TokenSecretModal } from './TokenSecretModal';
import type { ServiceToken, ServiceTokenSecret } from '@/types/api';

const COLUMNS = '110px 1fr 150px 110px 120px 230px';

interface TokenDraft {
  environment: string;
  label: string;
}

interface TokensCardProps {
  slug: string;
}

/** Tokens de ingesta del servicio: emitir, ver, mover de entorno, rotar, revocar. */
export function TokensCard({ slug }: TokensCardProps): React.ReactElement {
  const { t } = useTranslation();
  const hub = useHub();
  const copy = useHealthCopy();
  const mutation = useMutation();

  const [showRevoked, setShowRevoked] = useState<boolean>(false);
  const [secret, setSecret] = useState<ServiceTokenSecret | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<TokenDraft>({ environment: '', label: '' });

  const tokens = useAsync<ServiceToken[]>(
    (signal) => fetchTokens(slug, showRevoked, signal),
    [slug, showRevoked],
  );

  const list = tokens.data ?? [];
  const activeEnvs = new Set(list.filter((x) => x.is_active).map((x) => x.regd4_environment));
  // Un vigente por entorno: solo se ofrece emitir donde no lo hay.
  const freeEnvs = ENVIRONMENTS.filter((env) => !activeEnvs.has(env));
  const [newToken, setNewToken] = useState<TokenDraft>({ environment: '', label: '' });
  const issueEnv = freeEnvs.includes(newToken.environment as (typeof freeEnvs)[number])
    ? newToken.environment
    : (freeEnvs.find((env) => env === hub.environment) ?? freeEnvs[0] ?? '');

  const issue = async (): Promise<void> => {
    const result = await mutation.run(() => issueToken(slug, issueEnv, newToken.label.trim()));
    if (result) {
      setSecret(result);
      setNewToken({ environment: '', label: '' });
      tokens.reload();
    }
  };

  const reveal = async (token: ServiceToken): Promise<void> => {
    const result = await mutation.run(() => revealToken(token.regd4_index));
    if (result) setSecret(result);
  };

  const rotate = async (token: ServiceToken): Promise<void> => {
    if (!window.confirm(t('ADMIN.ROTATE_CONFIRM', { env: token.regd4_environment }))) return;
    const result = await mutation.run(() => rotateToken(token.regd4_index));
    if (result) {
      setSecret(result);
      tokens.reload();
    }
  };

  const revoke = async (token: ServiceToken): Promise<void> => {
    if (!window.confirm(t('ADMIN.REVOKE_CONFIRM', { env: token.regd4_environment }))) return;
    const result = await mutation.run(
      () => revokeToken(token.regd4_index),
      t('ADMIN.TOKEN_REVOKED'),
    );
    if (result) tokens.reload();
  };

  const saveEdit = async (token: ServiceToken): Promise<void> => {
    const moved = editDraft.environment !== token.regd4_environment;
    if (
      moved &&
      !window.confirm(
        t('ADMIN.ENV_CHANGE_CONFIRM', {
          from: token.regd4_environment,
          to: editDraft.environment,
        }),
      )
    ) {
      return;
    }
    const result = await mutation.run(
      () =>
        updateToken(token.regd4_index, {
          label: editDraft.label.trim(),
          ...(moved ? { environment: editDraft.environment } : {}),
        }),
      t('ADMIN.TOKEN_UPDATED'),
    );
    if (result) {
      setEditingId(null);
      tokens.reload();
    }
  };

  return (
    <AdminCard
      title={t('ADMIN.TOKENS_TITLE')}
      hint={t('ADMIN.TOKENS_HINT')}
      actions={
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cp-sp-2)',
            fontSize: 12,
            color: 'var(--cp-text-secondary)',
          }}
        >
          <input
            type="checkbox"
            checked={showRevoked}
            onChange={(event) => setShowRevoked(event.target.checked)}
          />
          {t('ADMIN.SHOW_REVOKED')}
        </label>
      }
    >
      <div className="cp-thead" style={{ gridTemplateColumns: COLUMNS }}>
        <div>{t('ADMIN.COL_ENV')}</div>
        <div>{t('ADMIN.COL_LABEL')}</div>
        <div>{t('ADMIN.COL_CREATED')}</div>
        <div>{t('ADMIN.COL_LAST_USED')}</div>
        <div>{t('ADMIN.COL_STATUS')}</div>
        <div aria-hidden="true" />
      </div>

      {tokens.error ? (
        <ErrorState error={tokens.error} onRetry={tokens.reload} />
      ) : tokens.isLoading && !tokens.data ? (
        <TableSkeleton columns={COLUMNS} rows={2} />
      ) : list.length === 0 ? (
        <EmptyState compact icon="key_off" title={t('ADMIN.TOKENS_EMPTY')} />
      ) : (
        list.map((token) =>
          editingId === token.regd4_index ? (
            <form
              key={token.regd4_index}
              className="cp-trow"
              style={{ gridTemplateColumns: COLUMNS, gap: 'var(--cp-sp-2)' }}
              onSubmit={(event) => {
                event.preventDefault();
                void saveEdit(token);
              }}
            >
              <select
                className="cp-select"
                value={editDraft.environment}
                onChange={(event) =>
                  setEditDraft({ ...editDraft, environment: event.target.value })
                }
              >
                {[...new Set<string>([...ENVIRONMENTS, token.regd4_environment])].map((env) => (
                  <option
                    key={env}
                    value={env}
                    disabled={env !== token.regd4_environment && activeEnvs.has(env)}
                  >
                    {env}
                  </option>
                ))}
              </select>
              <input
                className="cp-input"
                style={{ gridColumn: 'span 4' }}
                placeholder={t('ADMIN.LABEL_PLACEHOLDER')}
                value={editDraft.label}
                onChange={(event) => setEditDraft({ ...editDraft, label: event.target.value })}
              />
              <div style={{ display: 'flex', gap: 'var(--cp-sp-2)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="cp-btn cp-btn--ghost"
                  onClick={() => setEditingId(null)}
                >
                  {t('ADMIN.CANCEL')}
                </button>
                <button
                  type="submit"
                  className="cp-btn cp-btn--primary"
                  disabled={mutation.isBusy}
                >
                  {t('ADMIN.SAVE')}
                </button>
              </div>
            </form>
          ) : (
            <div
              key={token.regd4_index}
              className="cp-trow"
              style={{
                gridTemplateColumns: COLUMNS,
                opacity: token.is_active ? 1 : 0.55,
              }}
            >
              <div>
                <span className="cp-tag">{token.regd4_environment}</span>
              </div>
              <div className="cp-ellipsis">{token.regd4_label || '—'}</div>
              <div className="cp-code" style={{ color: 'var(--cp-text-secondary)' }}>
                {formatDateTime(token.regd4_created_at)}
              </div>
              <div style={{ color: 'var(--cp-text-secondary)' }}>
                {copy.relative(token.regd4_last_used_at)}
              </div>
              <div style={{ display: 'flex', gap: 'var(--cp-sp-2)', flexWrap: 'wrap' }}>
                <span
                  className="cp-tag"
                  style={
                    token.is_active
                      ? { background: 'var(--cp-success-surface)', color: 'var(--cp-success)' }
                      : undefined
                  }
                >
                  {t(token.is_active ? 'ADMIN.STATUS_ACTIVE' : 'ADMIN.STATUS_REVOKED')}
                </span>
                {token.is_active && !token.is_recoverable ? (
                  <span
                    className="cp-tag"
                    title={t('ADMIN.NOT_RECOVERABLE_HINT')}
                    style={{ background: 'var(--cp-warning-surface)' }}
                  >
                    {t('ADMIN.NOT_RECOVERABLE')}
                  </span>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 'var(--cp-sp-3)', justifyContent: 'flex-end' }}>
                {token.is_active ? (
                  <>
                    <RowAction
                      label={t('ADMIN.REVEAL')}
                      disabled={mutation.isBusy || !token.is_recoverable}
                      onClick={() => void reveal(token)}
                    />
                    <RowAction
                      label={t('ADMIN.EDIT')}
                      disabled={mutation.isBusy}
                      onClick={() => {
                        setEditingId(token.regd4_index);
                        setEditDraft({
                          environment: token.regd4_environment,
                          label: token.regd4_label,
                        });
                      }}
                    />
                    <RowAction
                      label={t('ADMIN.ROTATE')}
                      disabled={mutation.isBusy}
                      onClick={() => void rotate(token)}
                    />
                    <RowAction
                      label={t('ADMIN.REVOKE')}
                      danger
                      disabled={mutation.isBusy}
                      onClick={() => void revoke(token)}
                    />
                  </>
                ) : null}
              </div>
            </div>
          ),
        )
      )}

      {freeEnvs.length > 0 ? (
        <form
          className="cp-trow"
          style={{
            gridTemplateColumns: COLUMNS,
            gap: 'var(--cp-sp-2)',
            borderTop: '1px solid var(--cp-border)',
            background: 'var(--cp-bg-inset)',
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (issueEnv) void issue();
          }}
        >
          <select
            className="cp-select"
            value={issueEnv}
            onChange={(event) => setNewToken({ ...newToken, environment: event.target.value })}
          >
            {freeEnvs.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
          <input
            className="cp-input"
            style={{ gridColumn: 'span 4' }}
            placeholder={t('ADMIN.LABEL_PLACEHOLDER')}
            value={newToken.label}
            onChange={(event) => setNewToken({ ...newToken, label: event.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="cp-btn cp-btn--primary"
              disabled={mutation.isBusy || !issueEnv || tokens.isLoading}
            >
              {t('ADMIN.ISSUE')}
            </button>
          </div>
        </form>
      ) : null}

      {secret ? <TokenSecretModal secret={secret} onClose={() => setSecret(null)} /> : null}
    </AdminCard>
  );
}
