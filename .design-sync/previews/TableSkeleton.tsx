import { TableSkeleton } from 'software-manager-front';

export const CargandoTabla = () => (
  <div className="cp-card" style={{ width: 560 }}>
    <TableSkeleton rows={5} columns="2fr 1fr 1fr 1fr 80px" />
  </div>
);

export const PocasFilas = () => (
  <div className="cp-card" style={{ width: 560 }}>
    <TableSkeleton rows={2} columns="2fr 1fr 1fr" />
  </div>
);
