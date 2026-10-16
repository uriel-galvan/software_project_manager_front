import { Skeleton } from 'software-manager-front';

export const Lineas = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
    <Skeleton />
    <Skeleton width="70%" />
    <Skeleton width="45%" height={16} />
  </div>
);

export const Tarjeta = () => (
  <div className="cp-card" style={{ padding: 16, width: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Skeleton width={120} height={14} />
    <Skeleton />
    <Skeleton width="80%" />
  </div>
);
