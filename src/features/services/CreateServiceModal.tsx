import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createService } from '@/api/registry.api';
import { Modal } from '@/components/common/Modal';
import { Field } from '@/features/service-admin/AdminCard';
import { useMutation } from '@/hooks/useMutation';

interface CreateServiceModalProps {
  onClose: () => void;
  onCreated: (slug: string) => void;
}

/** Alta de un servicio. El token se emite después, desde su ficha. */
export function CreateServiceModal({
  onClose,
  onCreated,
}: CreateServiceModalProps): React.ReactElement {
  const { t } = useTranslation();
  const mutation = useMutation();
  const [slug, setSlug] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [team, setTeam] = useState<string>('');

  const submit = async (): Promise<void> => {
    const result = await mutation.run(
      () =>
        createService({
          reg_slug: slug.trim(),
          reg_name: name.trim(),
          reg_owner_team: team.trim(),
        }),
      t('ADMIN.SERVICE_CREATED'),
    );
    if (result) onCreated(result.reg_slug);
  };

  return (
    <Modal
      size="sm"
      onClose={onClose}
      header={<h4>{t('ADMIN.NEW_SERVICE_TITLE')}</h4>}
      footer={
        <>
          <button
            type="submit"
            form="cp-create-service"
            className="cp-btn cp-btn--primary"
            disabled={mutation.isBusy || !slug.trim()}
          >
            {t('ADMIN.CREATE')}
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--ghost"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            {t('ADMIN.CANCEL')}
          </button>
        </>
      }
    >
      <form
        id="cp-create-service"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cp-sp-4)' }}
        onSubmit={(event) => {
          event.preventDefault();
          if (slug.trim()) void submit();
        }}
      >
        <p style={{ fontSize: 12, color: 'var(--cp-text-secondary)' }}>
          {t('ADMIN.NEW_SERVICE_HINT')}
        </p>
        <Field label={t('ADMIN.FIELD_SLUG')} hint={t('ADMIN.SLUG_HINT')}>
          <input
            className="cp-input cp-code"
            autoFocus
            placeholder="billing"
            pattern="[-a-zA-Z0-9_]+"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </Field>
        <Field label={t('ADMIN.FIELD_NAME')}>
          <input className="cp-input" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label={t('ADMIN.FIELD_TEAM')}>
          <input className="cp-input" value={team} onChange={(event) => setTeam(event.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
