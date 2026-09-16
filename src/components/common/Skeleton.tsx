interface SkeletonProps {
  width?: number | string;
  height?: number;
}

export function Skeleton({ width = '100%', height = 11 }: SkeletonProps): React.ReactElement {
  return <span className="cp-skeleton" style={{ display: 'block', width, height }} />;
}

interface TableSkeletonProps {
  rows?: number;
  columns: string;
}

/** Skeleton dentro del contenedor: nunca «sin datos» mientras carga. */
export function TableSkeleton({ rows = 5, columns }: TableSkeletonProps): React.ReactElement {
  const widths = ['70%', '55%', '40%', '60%', '45%', '50%', '35%'];
  return (
    <div aria-busy="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="cp-trow" style={{ gridTemplateColumns: columns }}>
          {columns.split(' ').map((_column, columnIndex) => (
            <Skeleton key={columnIndex} width={widths[columnIndex % widths.length]} />
          ))}
        </div>
      ))}
    </div>
  );
}
