import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root no existe en index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
