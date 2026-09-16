import { useTranslation } from 'react-i18next';
import { compactNumber, exactNumber } from '@/utils/format';

interface CallVolumeProps {
  value: number | null;
  /** < 1 marca el número como estimado: hubo muestreo. */
  sampleRate?: number;
  bold?: boolean;
}

/** Compacto en la celda, exacto en el `title`. El «~» avisa de muestreo. */
export function CallVolume({
  value,
  sampleRate = 1,
  bold = false,
}: CallVolumeProps): React.ReactElement {
  const { t } = useTranslation();
  const sampled = sampleRate < 1;
  const title = sampled
    ? t('COMMON.CALLS_ESTIMATED', {
        count: exactNumber(value ?? 0),
        rate: Math.round(sampleRate * 100),
      })
    : t('COMMON.CALLS_EXACT', { count: exactNumber(value ?? 0) });

  return (
    <span
      className="cp-code"
      title={value === null ? undefined : title}
      style={{
        fontSize: 11,
        fontWeight: bold ? 600 : 400,
        color: sampled ? 'var(--cp-warning)' : 'inherit',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {compactNumber(value)}
      {sampled && value !== null ? '~' : ''}
    </span>
  );
}
