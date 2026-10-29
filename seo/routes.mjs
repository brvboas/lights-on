/** Language + URL helpers for the SEO build (the app has its own copy of LANGS in App.jsx). */
export const LANGS = ['pt', 'en', 'es'];

/** <html lang> value per language. */
export const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };

/** Language names shown in the language picker (always in their own language). */
export const LANG_NAMES = { pt: 'Português', en: 'English', es: 'Español' };

/** Slug of the room-by-room lighting calculator page, per language. */
export const HUB_SLUG = {
  pt: 'calculadora-de-iluminacao',
  en: 'lighting-calculator',
  es: 'calculadora-de-iluminacion',
};

/** Language from the URL (/pt/, /en/, /es/), falling back to the browser language. */
export function detectLang(pathname = '/', browserLangs = []) {
  const fromPath = pathname.split('/')[1];
  if (LANGS.includes(fromPath)) return fromPath;
  for (const l of browserLangs) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (LANGS.includes(code)) return code;
  }
  return 'en';
}
