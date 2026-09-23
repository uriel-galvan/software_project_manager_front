/**
 * i18n del hub. Español por defecto, inglés como segundo idioma.
 * Ningún literal visible vive en un componente.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'api-hub:lang';

function initialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
  } catch {
    // Sin almacenamiento se usa el idioma por defecto del ecosistema.
  }
  return navigator.language.startsWith('en') ? 'en' : 'es';
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initialLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export function setLanguage(language: Language): void {
  void i18n.changeLanguage(language);
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Persistir el idioma es opcional; cambiarlo en caliente no lo es.
  }
}

export default i18n;
