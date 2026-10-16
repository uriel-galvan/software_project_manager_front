import { CallVolume } from 'software-manager-front';

const col = { display: 'flex', flexDirection: 'column' as const, gap: 8, fontSize: 12 };

export const Exacto = () => (
  <div style={col}>
    <CallVolume value={842} />
    <CallVolume value={12400} />
    <CallVolume value={3480000} />
  </div>
);

export const EstimadoPorMuestreo = () => (
  <div style={col}>
    <CallVolume value={128000} sampleRate={0.25} />
    <CallVolume value={2300000} sampleRate={0.1} bold />
  </div>
);

export const Destacado = () => <CallVolume value={56700} bold />;
