/**
 * Cloudflare Worker in front of the static site. It only handles "/" (see run_worker_first
 * in wrangler.jsonc); every other URL is served straight from dist/ by Workers Assets.
 *
 * "/" sends the visitor to /pt/, /en/ or /es/:
 *   1. the language they picked before in the app (cookie "lang"),
 *   2. their country (Cloudflare geolocation): Portuguese- or Spanish-speaking → pt / es,
 *   3. their browser language (Accept-Language),
 *   4. English.
 */
const LANGS = ['pt', 'en', 'es'];

const PT_COUNTRIES = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);
const ES_COUNTRIES = new Set([
  'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO',
  'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ',
]);

function pickLang(request) {
  const cookie = request.headers.get('Cookie') || '';
  const saved = cookie.match(/(?:^|;\s*)lang=(pt|en|es)\b/)?.[1];
  if (saved) return saved;

  const country = request.cf?.country;
  if (PT_COUNTRIES.has(country)) return 'pt';
  if (ES_COUNTRIES.has(country)) return 'es';

  const accept = request.headers.get('Accept-Language') || '';
  for (const part of accept.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (LANGS.includes(code)) return code;
  }
  return 'en';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      const target = new URL(`/${pickLang(request)}/${url.search}`, url);
      return new Response(null, {
        status: 302,
        headers: {
          Location: target.toString(),
          // the answer depends on the visitor, so shared caches must not reuse it
          'Cache-Control': 'private, no-store',
          Vary: 'Cookie, Accept-Language',
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
