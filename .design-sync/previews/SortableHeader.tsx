import { useState } from 'react';
import { SortableHeader } from 'software-manager-front';

type Key = 'name' | 'calls' | 'endpoints';

export const EncabezadoDeTabla = () => {
  const [key, setKey] = useState<Key>('calls');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const onSort = (k: Key) => {
    if (k === key) setDir(dir === 'asc' ? 'desc' : 'asc');
    else {
      setKey(k);
      setDir('asc');
    }
  };
  return (
    <div className="cp-card">
      <div className="cp-thead" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', width: 440 }}>
        <SortableHeader label="Servicio" sortKey="name" activeKey={key} direction={dir} onSort={onSort} />
        <SortableHeader label="Llamadas" sortKey="calls" activeKey={key} direction={dir} onSort={onSort} align="right" />
        <SortableHeader label="Endpoints" sortKey="endpoints" activeKey={key} direction={dir} onSort={onSort} align="right" />
      </div>
    </div>
  );
};

export const Ascendente = () => (
  <SortableHeader label="Servicio" sortKey="name" activeKey="name" direction="asc" onSort={() => {}} />
);
