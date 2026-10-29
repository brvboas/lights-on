/**
 * Site-wide SEO settings.
 *
 * SITE_URL is the public address used in canonical tags, hreflang links, Open Graph and the
 * sitemap. When you buy the domain, change the default below (or build with
 * `SITE_URL=https://your-domain npm run build`) and redeploy.
 */
export const SITE_URL = (process.env.SITE_URL || 'https://lights-on.bruvbc.workers.dev').replace(/\/+$/, '');

export const SITE_NAME = 'LuminaStudio 3D';

export const AUTHOR = {
  name: 'Bruno Villas Boas',
  url: 'https://www.linkedin.com/in/bruno-villas-boas/',
  sameAs: ['https://www.linkedin.com/in/bruno-villas-boas/', 'https://github.com/brvboas'],
};

/** Shown as "updated on" and used as dateModified / sitemap lastmod. Bump it when the copy changes. */
export const CONTENT_UPDATED = '2026-10-29';

/** Language used for hreflang="x-default" (visitors whose language isn't PT/EN/ES). */
export const DEFAULT_LANG = 'en';
