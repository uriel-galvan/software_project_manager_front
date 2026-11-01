import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { unlockService, updateService } from '@/api/registry.api';
import { useMutation } from '@/hooks/useMutation';
import { AdminCard, Field } from './AdminCard';
import type { ServiceCardField, ServiceCardInput, ServiceDetail } from '@/types/api';

const FIELDS: { key: ServiceCardField; labelKey: string; multiline?: boolean }[] = [
  { key: 'reg_name', labelKey: 'ADMIN.FIELD_NAME' },
  { key: 'reg_owner_team', labelKey: 'ADMIN.FIELD_TEAM' },
  { key: 'reg_repo_url', labelKey: 'ADMIN.FIELD_REPO' },
  { key: 'reg_description', labelKey: 'ADMIN.FIELD_DESCRIPTION', multiline: true },
];

function cardOf(service: ServiceDetail): Record<ServiceCardField, string> {
  return {
    reg_name: service.reg_name,
    reg_description: service.reg_description,
    reg_owner_team: service.reg_owner_team,
    reg_repo_url: service.reg_repo_url,
  };
}

interface ServiceCardFormProps {
  service: ServiceDetail;
  onSaved: () => void;
}

/** Ficha editable. Lo que se guarda queda fijado frente al manifest. */
export function ServiceCardForm({ service, onSaved }: ServiceCardFormProps): React.ReactElement {
  const { t } = useTranslation();
  const mutation = useMutation();
  const [draft, setDraft] = useState<Record<ServiceCardField, string>>(() => cardOf(service));

  const original = cardOf(service);
  const changes: ServiceCardInput = {};
  for (const { key } of FIELDS) {
    if (draft[key].trim() !== original[key]) changes[key] = draft[key].trim();
  }
  const isDirty = Object.keys(changes).length > 0;
  const locked = new Set(service.reg_locked_fields);

  const save = async (): Promise<void> => {
    const result = await mutation.run(
      () => updateService(service.reg_slug, changes),
      t('ADMIN.SAVED'),
    );
    if (result) onSaved();
  };

  const unlock = async (): Promise<void> => {
    if (!window.confirm(t('ADMIN.UNLOCK_CONFIRM'))) return;
    const result = await mutation.run(
      () => unlockService(service.reg_slug),
      t('ADMIN.UNLOCKED'),
    );
    if (result) onSaved();
  };

  return (
    <AdminCard
      title={t('ADMIN.CARD_TITLE')}
      hint={t('ADMIN.CARD_HINT')}
      actions={
        locked.size > 0 ? (
          <button
            type="button"
            className="cp-btn cp-btn--ghost"
            disabled={mutation.isBusy}
            onClick={() => void unlock()}
          >
            {t('ADMIN.UNLOCK')}
          </button>
        ) : undefined
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (isDirty) void save();
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--cp-sp-4)',
          padding: 'var(--cp-sp-4)',
        }}
      >
        <Field label={t('ADMIN.FIELD_SLUG')} hint={t('ADMIN.SLUG_HINT')}>
          <input className="cp-input cp-code" value={service.reg_slug} disabled />
        </Field>

        {FIELDS.map(({ key, labelKey, multiline }) => (
          <div key={key} style={multiline ? { gridColumn: '1 / -1' } : undefined}>
            <Field
              label={t(labelKey)}
              badge={locked.has(key) ? t('ADMIN.LOCKED_BADGE') : undefined}
            >
              {multiline ? (
                <textarea
                  className="cp-input"
                  rows={3}
                  style={{ height: 'auto', padding: 'var(--cp-sp-2) var(--cp-sp-3)' }}
                  value={draft[key]}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                />
              ) : (
                <input
                  className="cp-input"
                  type={key === 'reg_repo_url' ? 'url' : 'text'}
                  value={draft[key]}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                />
              )}
            </Field>
          </div>
        ))}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--cp-sp-3)' }}>
          <button
            type="submit"
            className="cp-btn cp-btn--primary"
            disabled={!isDirty || mutation.isBusy}
          >
            {t('ADMIN.SAVE')}
          </button>
          {isDirty ? (
            <button
              type="button"
              className="cp-btn cp-btn--ghost"
              onClick={() => setDraft(original)}
            >
              {t('ADMIN.CANCEL')}
            </button>
          ) : null}
        </div>
      </form>
    </AdminCard>
  );
}
