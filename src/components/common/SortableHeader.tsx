import type { SortDirection } from '@/types/ui';

interface SortableHeaderProps<K extends string> {
  label: string;
  sortKey: K;
  activeKey: K;
  direction: SortDirection;
  onSort: (key: K) => void;
  align?: 'left' | 'right';
}

export function SortableHeader<K extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
}: SortableHeaderProps<K>): React.ReactElement {
  const isActive = activeKey === sortKey;
  return (
    <div
      className="cp-sortable"
      onClick={() => onSort(sortKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSort(sortKey);
      }}
      style={{
        textAlign: align,
        color: isActive ? 'var(--cp-primary-500)' : undefined,
      }}
    >
      {label} {isActive ? (direction === 'desc' ? '↓' : '↑') : ''}
    </div>
  );
}
