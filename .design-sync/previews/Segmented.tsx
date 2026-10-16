import { useState } from 'react';
import { Segmented } from 'software-manager-front';

export const Entornos = () => {
  const [v, setV] = useState<'dev' | 'staging' | 'prod'>('staging');
  return (
    <Segmented
      ariaLabel="Entorno"
      value={v}
      onChange={setV}
      options={[
        { value: 'dev', label: 'dev' },
        { value: 'staging', label: 'staging' },
        { value: 'prod', label: 'prod' },
      ]}
    />
  );
};

export const Idioma = () => (
  <Segmented
    ariaLabel="Idioma"
    value="es"
    onChange={() => {}}
    options={[
      { value: 'es', label: 'ES' },
      { value: 'en', label: 'EN' },
    ]}
  />
);

export const Ventana = () => (
  <Segmented
    ariaLabel="Ventana de tiempo"
    value={7}
    onChange={() => {}}
    options={[
      { value: 1, label: '24 h' },
      { value: 7, label: '7 d' },
      { value: 30, label: '30 d' },
    ]}
  />
);
