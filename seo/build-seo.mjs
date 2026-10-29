/**
 * Post-build SEO step (runs after `vite build`, see package.json):
 *
 *  - dist/pt/, dist/en/, dist/es/   the 3D simulator, one URL per language, each with its own
 *                                    title, description, canonical, hreflang, Open Graph, JSON-LD
 *                                    and a crawlable intro (replaced by React when the app loads)
 *  - dist/<lang>/<slug>/             static guide pages: calculator hub, one page per room and
 *                                    two guides (color temperature; lux vs lumens vs watts)
 *  - dist/index.html                 language chooser that redirects to the visitor's language
 *  - dist/404.html, sitemap.xml, robots.txt
 *
 * Everything is plain HTML + a small inline script for the calculator, so Google can read it
 * without running the 3D app.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, SITE_NAME, AUTHOR, CONTENT_UPDATED, DEFAULT_LANG } from './site.config.mjs';
import { ROOMS } from './content/rooms.mjs';
import { HUB, GUIDES } from './content/guides.mjs';
import { UI, ROOM_GRAMMAR, TASK_WHERE, KELVIN_WHY } from './content/ui.mjs';
import { TRANSLATIONS } from '../src/utils/i18n.js';
import { LANGS, HTML_LANG, LANG_NAMES, HUB_SLUG, detectLang } from './routes.mjs';
import { CREDIT_COPY, LINKEDIN, GITHUB } from './content/credit.mjs';
import {
  WALL_TONE_UF,
  MAINTENANCE_FACTOR,
  LED_LM_PER_W,
  lightLossFactor,
  lumensNeeded,
} from './illuminance.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/* ------------------------------------------------------------------ helpers */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const strip = (html) => String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const fmt = (n, lang, digits = 0) =>
  new Intl.NumberFormat(UI[lang].locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
/** Round lumens to a friendly number (nearest 50, or 10 under 1,000). */
const roundLm = (lm) => (lm < 1000 ? Math.round(lm / 10) * 10 : Math.round(lm / 50) * 50);
const ledWatts = (lm) => Math.round(lm / LED_LM_PER_W);

const pagePath = (lang, slug) => (slug ? `/${lang}/${slug}/` : `/${lang}/`);
const abs = (path) => `${SITE_URL}${path}`;

const WALL_SWATCH = { light: '#f4f4f0', medium: '#b8c4b9', dark: '#36393f' };

/** Link to the 3D simulator in the page's language. */
const simUrl = (lang) => `/${lang}/`;

function roomFacts(room, lang) {
  const [w, d] = room.size;
  const area = Number((w * d).toFixed(1));
  const lm = roundLm(lumensNeeded(room.target, area, 'light', 2.7));
  return {
    w: fmt(w, lang, 1),
    d: fmt(d, lang, 1),
    area: fmt(area, lang, 1),
    sqft: fmt(Math.round(area * 10.764), lang),
    lux: room.target,
    luxMin: room.lux[0],
    luxMax: room.lux[1],
    task: room.task[0] === room.task[1] ? `${room.task[0]}` : `${room.task[0]}–${room.task[1]}`,
    lm: fmt(lm, lang),
    watts: ledWatts(lm),
    taskWhere: TASK_WHERE[lang][room.id],
    kelvinText: KELVIN_WHY[lang][room.id],
    ...ROOM_GRAMMAR[lang][room.id],
  };
}

/* ------------------------------------------------------------------ shared markup */

const ICON_BULB =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>';
const ICON_CUBE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';

function head({ lang, title, description, path, alternates, jsonld = [], ogType = 'article', extra = '' }) {
  const links = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(alternates[l])}">`).join('\n    ');
  const ogAlt = LANGS.filter((l) => l !== lang)
    .map((l) => `<meta property="og:locale:alternate" content="${UI[l].ogLocale}">`)
    .join('\n    ');
  return `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="author" content="${AUTHOR.name}">
    <meta name="theme-color" content="#020617">
    <link rel="canonical" href="${abs(path)}">
    ${links}
    <link rel="alternate" hreflang="x-default" href="${abs(alternates[DEFAULT_LANG])}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${abs(path)}">
    <meta property="og:image" content="${abs('/og-image.png')}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(SITE_NAME)}">
    <meta property="og:locale" content="${UI[lang].ogLocale}">
    ${ogAlt}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${abs('/og-image.png')}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    ${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n    ')}
    ${extra}`;
}

const personLd = { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url, sameAs: AUTHOR.sameAs };

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

function faqLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
  };
}

function header(lang, alternates, current) {
  const u = UI[lang];
  const nav = [
    [pagePath(lang, HUB_SLUG[lang]), u.navCalc, 'hub'],
    [pagePath(lang, GUIDES[0].slug[lang]), u.navKelvin, 'kelvin'],
    [pagePath(lang, GUIDES[1].slug[lang]), u.navUnits, 'units'],
  ];
  return `<a class="skip" href="#main">${lang === 'en' ? 'Skip to content' : lang === 'es' ? 'Saltar al contenido' : 'Pular para o conteúdo'}</a>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="${pagePath(lang)}" aria-label="${SITE_NAME} — ${esc(u.brandTag)}">
        <span class="brand__icon">${ICON_BULB}</span>
        <span class="brand__name">LuminaStudio<span>3D</span></span>
      </a>
      <nav class="nav" aria-label="${esc(u.guidesTitle)}">
        ${nav.map(([href, label, id]) => `<a href="${href}"${id === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('\n        ')}
      </nav>
      <div class="lang" role="group" aria-label="${esc(u.langLabel)}">
        ${LANGS.map((l) => `<a href="${alternates[l]}" hreflang="${l}" lang="${HTML_LANG[l]}" title="${LANG_NAMES[l]}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('')}
      </div>
      <a class="btn btn--header" href="${pagePath(lang)}">${ICON_CUBE}<span>${esc(u.openSim)}</span></a>
    </div>
  </header>`;
}

/** Same signature as the app's AuthorCredit component, as static HTML + a tiny script. */
function credit(lang) {
  const c = CREDIT_COPY[lang];
  return `<div class="credit" data-credit>
        <button class="credit__toggle" type="button" aria-label="${esc(c.credits)}" aria-expanded="false" aria-controls="credit-card">
          <img class="credit__head" src="/assets/credit/bruno-head.webp" alt="" width="216" height="240" loading="lazy" decoding="async">
        </button>
        <div class="credit__card" id="credit-card" hidden>
          <span class="credit__by">by Bruno Villas Boas</span>
          <ul class="credit__menu">
            <li><a href="${LINKEDIN}" target="_blank" rel="noopener author" aria-label="LinkedIn ${esc(c.newTab)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>LinkedIn</a></li>
            <li><a href="${GITHUB}" target="_blank" rel="noopener author" aria-label="GitHub ${esc(c.newTab)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3Z"/></svg>GitHub</a></li>
            <li><button class="credit__insp" type="button" aria-controls="inspiration-note"><svg class="inspiration__bulb" viewBox="0 0 24 24" aria-hidden="true"><path class="bulb-glass" d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.1.9 1.8V17h6v-1c0-.7.3-1.3.9-1.8A6.5 6.5 0 0 0 12 2.5Z"/><path class="bulb-base" d="M9 18.5h6M9.8 21h4.4"/></svg>${esc(c.inspiration)}</button></li>
          </ul>
        </div>
        <div class="inspiration__note" id="inspiration-note" role="note" hidden>
          <div class="inspiration__top">
            <span class="inspiration__eyebrow">${esc(c.eyebrow)}</span>
            <button class="inspiration__back" type="button">← ${esc(c.back)}</button>
          </div>
          ${c.note.map((p) => `<p>${esc(p)}</p>`).join('\n          ')}
          <span class="inspiration__sign">Bruno</span>
        </div>
      </div>`;
}

const CREDIT_JS = `(()=>{const r=document.querySelector('[data-credit]');if(!r)return;const head=r.querySelector('.credit__toggle'),card=r.querySelector('.credit__card'),note=r.querySelector('.inspiration__note'),insp=r.querySelector('.credit__insp'),back=r.querySelector('.inspiration__back');let v=null;const set=(n)=>{v=n;card.hidden=n!=='menu';note.hidden=n!=='note';head.setAttribute('aria-expanded',String(n!==null));};head.addEventListener('click',()=>set(v?null:'menu'));insp.addEventListener('click',()=>{set('note');back.focus();});back.addEventListener('click',()=>{set('menu');requestAnimationFrame(()=>insp.focus());});document.addEventListener('pointerdown',(e)=>{if(v&&!r.contains(e.target))set(null);},true);document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&v){set(null);head.focus();}});})();`;

function footer(lang) {
  const u = UI[lang];
  return `<footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__about">
        <a class="brand" href="${pagePath(lang)}"><span class="brand__icon">${ICON_BULB}</span><span class="brand__name">LuminaStudio<span>3D</span></span></a>
        <p>${esc(u.footerAbout)}</p>
      </div>
      <div>
        <h2>${esc(u.hubAllRooms)}</h2>
        <ul>${ROOMS.map((r) => `<li><a href="${pagePath(lang, r.slug[lang])}">${esc(r.Name[lang])}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>${esc(u.guidesTitle)}</h2>
        <ul>
          <li><a href="${pagePath(lang, HUB_SLUG[lang])}">${esc(u.navCalc)}</a></li>
          ${GUIDES.map((g) => `<li><a href="${pagePath(lang, g.slug[lang])}">${esc(g.nav[lang])}</a></li>`).join('')}
          <li><a href="${pagePath(lang)}">${esc(u.openSim)}</a></li>
        </ul>
      </div>
      ${credit(lang)}
    </div>
  </footer>
  <script>${CREDIT_JS}</script>`;
}

function page({ lang, headHtml, body, current, alternates }) {
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
  <head>
    ${headHtml}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/guide.css">
  </head>
  <body>
  ${header(lang, alternates, current)}
  <main id="main">
${body}
  </main>
  ${footer(lang)}
  </body>
</html>
`;
}

const table = (inner) => `<div class="table-wrap"><table>${inner}</table></div>`;

function faqBlock(lang, faq) {
  return `<section class="faq" aria-labelledby="faq">
      <h2 id="faq">${esc(UI[lang].faqTitle)}</h2>
      ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('\n      ')}
    </section>`;
}

function careBlock(lang) {
  const u = UI[lang];
  return `<section class="care" aria-labelledby="care">
      <h2 id="care">${esc(u.careTitle)}</h2>
      ${u.care}
    </section>
    <h2 id="sources">${esc(u.sourcesTitle)}</h2>
    <p class="sources">${esc(u.sources)}</p>`;
}

function ctaBlock(lang, href) {
  const u = UI[lang];
  return `<section class="cta">
      <h2>${esc(u.ctaTitle)}</h2>
      <p>${esc(u.ctaText)}</p>
      <a class="btn" href="${href}">${ICON_CUBE}${esc(u.ctaBtn)}</a>
    </section>`;
}

function updatedLine(lang) {
  const d = new Date(`${CONTENT_UPDATED}T12:00:00Z`);
  const label = new Intl.DateTimeFormat(UI[lang].locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  return `<p class="updated">${esc(UI[lang].updated)} <time datetime="${CONTENT_UPDATED}">${label}</time></p>`;
}

function crumbs(items) {
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${items
    .map(([name, href], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${href}">${esc(name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/* ------------------------------------------------------------------ calculator */

function calculator(lang, selectedRoom) {
  const u = UI[lang];
  const sel = selectedRoom || ROOMS[0];
  const [w, d] = sel.size;
  const options = ROOMS.map(
    (r) =>
      `<option value="${r.id}" data-lux="${r.target}" data-min="${r.lux[0]}" data-max="${r.lux[1]}"${r.id === sel.id ? ' selected' : ''}>${esc(r.Name[lang])} (${r.lux[0]}–${r.lux[1]} lx)</option>`
  ).join('');
  const cfg = {
    lang,
    locale: u.locale,
    uf: WALL_TONE_UF,
    mf: MAINTENANCE_FACTOR,
    lmw: LED_LM_PER_W,
    bulbs: u.calcBulbsOf('{n}', '{w}', '{lm}'),
    or: u.calcOr,
  };
  const wall = (tone, label) =>
    `<label><input type="radio" name="wall" value="${tone}"${tone === 'light' ? ' checked' : ''}><i style="background:${WALL_SWATCH[tone]}"></i>${esc(label)}</label>`;
  return `<form class="calc" data-calc onsubmit="return false" aria-labelledby="calc">
      <div class="calc__grid">
        <div class="calc__field calc__field--wide">
          <label for="c-room">${esc(u.calcRoom)}</label>
          <select id="c-room" name="room">${options}</select>
        </div>
        <div class="calc__field"><label for="c-w">${esc(u.calcWidth)}</label><input id="c-w" name="w" type="number" inputmode="decimal" min="0.5" max="30" step="0.1" value="${w}"></div>
        <div class="calc__field"><label for="c-d">${esc(u.calcLength)}</label><input id="c-d" name="d" type="number" inputmode="decimal" min="0.5" max="30" step="0.1" value="${d}"></div>
        <div class="calc__field"><label for="c-h">${esc(u.calcHeight)}</label><input id="c-h" name="h" type="number" inputmode="decimal" min="2" max="8" step="0.05" value="2.7"></div>
        <div class="calc__field"><label for="c-lux">${esc(u.calcLux)}</label><input id="c-lux" name="lux" type="number" inputmode="numeric" min="20" max="2000" step="10" value="${sel.target}"></div>
        <fieldset class="calc__field calc__field--wide">
          <legend>${esc(u.calcWalls)}</legend>
          <div class="calc__walls">${wall('light', u.wallLight)}${wall('medium', u.wallMedium)}${wall('dark', u.wallDark)}</div>
        </fieldset>
      </div>
      <div class="calc__out" aria-live="polite">
        <div class="calc__stat calc__stat--main"><span>${esc(u.calcNeed)}</span><b data-out="lm">–</b><small data-out="range"></small></div>
        <div class="calc__stat"><span>${esc(u.calcLed)}</span><b data-out="w">–</b><small>≈ ${LED_LM_PER_W} lm/W</small></div>
        <div class="calc__stat"><span>${esc(u.calcArea)}</span><b data-out="area">–</b></div>
        <p class="calc__bulbs"><strong>${esc(u.calcBulbs)}:</strong> <span data-out="bulbs"></span></p>
        <a class="btn calc__try" href="${simUrl(lang)}">${ICON_CUBE}${esc(u.calcTry)}</a>
      </div>
      <noscript><p>${esc(u.calcNoJs)}</p></noscript>
    </form>
    <script>(()=>{const C=${JSON.stringify(cfg)};
const lightLossFactor=${lightLossFactor.toString().replace('WALL_TONE_UF', 'C.uf').replace('MAINTENANCE_FACTOR', 'C.mf')};
const f=document.querySelector('[data-calc]'),o=(k)=>f.querySelector('[data-out="'+k+'"]');
const nf=(n,d=0)=>new Intl.NumberFormat(C.locale,{maximumFractionDigits:d}).format(n);
const rl=(lm)=>lm<1000?Math.round(lm/10)*10:Math.round(lm/50)*50;
const num=(n,def)=>{const v=parseFloat(String(f.elements[n].value).replace(',','.'));return Number.isFinite(v)&&v>0?v:def;};
function run(){const w=num('w',3),d=num('d',3),h=num('h',2.7),lux=num('lux',150),tone=f.elements.wall.value||'light';
const sel=f.elements.room.selectedOptions[0];const area=w*d,k=lightLossFactor(tone,h);
const lm=rl(lux*area/k),mn=rl(+sel.dataset.min*area/k),mx=rl(+sel.dataset.max*area/k);
o('lm').textContent=nf(lm)+' lm';o('range').textContent=nf(mn)+'–'+nf(mx)+' lm ('+sel.dataset.min+'–'+sel.dataset.max+' lx)';
o('w').textContent='≈ '+nf(Math.round(lm/C.lmw))+' W';o('area').textContent=nf(area,1)+' m²';
const b=(bw,blm)=>C.bulbs.replace('{n}',Math.max(1,Math.ceil(lm/blm))).replace('{w}',bw).replace('{lm}',nf(blm));
o('bulbs').textContent=b(9,855)+' '+C.or+' '+b(15,1425);
}
f.elements.room.addEventListener('change',()=>{f.elements.lux.value=f.elements.room.selectedOptions[0].dataset.lux;run();});
f.addEventListener('input',run);run();})();</script>`;
}

/* ------------------------------------------------------------------ pages */

function alternatesFor(slugMap) {
  return Object.fromEntries(LANGS.map((l) => [l, pagePath(l, slugMap ? slugMap[l] : '')]));
}

function roomPage(room, lang) {
  const u = UI[lang];
  const f = roomFacts(room, lang);
  const path = pagePath(lang, room.slug[lang]);
  const alternates = alternatesFor(room.slug);
  const hubPath = pagePath(lang, HUB_SLUG[lang]);
  const description = strip(u.quick(f)).slice(0, 158).replace(/\s+\S*$/, '') + '…';
  const faq = [...room.faq[lang], u.faqWatts(f), u.faqKelvin(f)];
  const crumbItems = [
    [u.breadcrumbHome, pagePath(lang)],
    [u.navCalc, hubPath],
    [room.Name[lang], path],
  ];

  const recRows = `
        <thead><tr><th>${esc(u.colWhat)}</th><th class="num">${esc(u.colLux)}</th><th class="num">${esc(u.colKelvin)}</th></tr></thead>
        <tbody>
          <tr><td>${esc(u.general)}</td><td class="num"><strong>${room.lux[0]}–${room.lux[1]} lx</strong></td><td class="num">${u.kelvinRange(...room.kelvin)}</td></tr>
          <tr><td>${esc(room.task_label[lang])}</td><td class="num"><strong>${f.task} lx</strong></td><td class="num">${u.kelvinRange(...room.kelvin)}</td></tr>
        </tbody>`;
  const sizeRows = `
        <thead><tr><th>${esc(u.colArea)}</th><th class="num">${esc(u.colLight)}</th><th class="num">${esc(u.colMedium)}</th><th class="num">${esc(u.colDark)}</th><th class="num">${esc(u.colWatts)}</th></tr></thead>
        <tbody>
          ${room.areas
            .map((a) => {
              const lm = (tone) => roundLm(lumensNeeded(room.target, a, tone, 2.7));
              return `<tr><td>${fmt(a, lang)} m²${lang === 'en' ? ` <small>(${fmt(Math.round(a * 10.764), lang)} sq ft)</small>` : ''}</td><td class="num"><strong>${fmt(lm('light'), lang)} lm</strong></td><td class="num">${fmt(lm('medium'), lang)} lm</td><td class="num">${fmt(lm('dark'), lang)} lm</td><td class="num">≈ ${ledWatts(lm('light'))} W</td></tr>`;
            })
            .join('\n          ')}
        </tbody>`;

  const ids = lang === 'en'
    ? { rec: 'recommended-lux', size: 'lumens-by-size', calc: 'calc', tips: 'tips', how: 'how-to-calculate' }
    : lang === 'es'
      ? { rec: 'lux-recomendados', size: 'lumenes-por-tamano', calc: 'calc', tips: 'consejos', how: 'como-calcular' }
      : { rec: 'lux-recomendado', size: 'lumens-por-tamanho', calc: 'calc', tips: 'dicas', how: 'como-calcular' };
  const toc = [
    [ids.rec, u.recTitle(room.name[lang])],
    [ids.size, u.sizeTitle(room.name[lang])],
    [ids.calc, u.calcTitle],
    [ids.tips, u.tipsTitle],
    [ids.how, u.howTitle],
    ['faq', u.faqTitle],
  ];

  const body = `    ${crumbs(crumbItems)}
    <article>
    <h1>${esc(room.h1[lang])}</h1>
    ${updatedLine(lang)}
    <p class="lead">${esc(room.intro[lang])}</p>
    <div class="answer"><span class="answer__label">${esc(u.quickAnswer)}</span><p>${u.quick(f)}</p></div>
    <nav class="toc" aria-label="${esc(u.toc)}"><strong>${esc(u.toc)}</strong><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>

    <h2 id="${ids.rec}">${esc(u.recTitle(room.name[lang]))}</h2>
    ${table(recRows)}

    <h2 id="${ids.size}">${esc(u.sizeTitle(room.name[lang]))}</h2>
    <p>${esc(u.sizeIntro(room.target))}</p>
    ${table(sizeRows)}

    <h2 id="${ids.calc}">${esc(u.calcTitle)}</h2>
    ${calculator(lang, room)}

    <h2 id="${ids.tips}">${esc(u.tipsTitle)}</h2>
    <ul>${room.tips[lang].map((t) => `<li>${esc(t)}</li>`).join('')}</ul>

    <h2 id="${ids.how}">${esc(u.howTitle)}</h2>
    ${u.how(u.howExample(f))}

    ${careBlock(lang)}

    ${faqBlock(lang, faq)}
    </article>

    ${ctaBlock(lang, simUrl(lang))}

    <h2>${esc(u.relatedTitle)}</h2>
    <ul class="cards">${ROOMS.filter((r) => r.id !== room.id)
      .map((r) => `<li><a href="${pagePath(lang, r.slug[lang])}">${esc(r.Name[lang])}<small>${r.lux[0]}–${r.lux[1]} lux</small></a></li>`)
      .join('')}</ul>`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: room.h1[lang],
      description,
      inLanguage: HTML_LANG[lang],
      url: abs(path),
      image: abs('/og-image.png'),
      datePublished: CONTENT_UPDATED,
      dateModified: CONTENT_UPDATED,
      author: personLd,
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: abs('/apple-touch-icon.png') } },
      mainEntityOfPage: abs(path),
    },
    breadcrumbLd(crumbItems),
    faqLd(faq),
  ];

  return {
    path,
    alternates,
    html: page({
      lang,
      alternates,
      current: null,
      headHtml: head({ lang, title: room.title[lang], description, path, alternates, jsonld }),
      body,
    }),
  };
}

function hubPage(lang) {
  const u = UI[lang];
  const h = HUB[lang];
  const path = pagePath(lang, HUB_SLUG[lang]);
  const alternates = alternatesFor(HUB_SLUG);
  const crumbItems = [
    [u.breadcrumbHome, pagePath(lang)],
    [u.navCalc, path],
  ];
  const ex = ROOMS[0];
  const exFacts = roomFacts(ex, lang);
  const rows = `
        <thead><tr><th>${esc(u.colRoom)}</th><th class="num">${esc(u.general)}</th><th class="num">${esc(u.colKelvin)}</th><th class="num">${esc(u.colLumens(12))}</th></tr></thead>
        <tbody>
          ${ROOMS.map((r) => `<tr><td><a href="${pagePath(lang, r.slug[lang])}">${esc(r.Name[lang])}</a><br><small>${esc(r.task_label[lang])}: ${r.task[0] === r.task[1] ? r.task[0] : `${r.task[0]}–${r.task[1]}`} lx</small></td><td class="num"><strong>${r.lux[0]}–${r.lux[1]} lx</strong></td><td class="num">${u.kelvinRange(...r.kelvin)}</td><td class="num">${fmt(roundLm(lumensNeeded(r.target, 12, 'light', 2.7)), lang)} lm</td></tr>`).join('\n          ')}
        </tbody>`;
  const body = `    ${crumbs(crumbItems)}
    <h1>${esc(h.h1)}</h1>
    ${updatedLine(lang)}
    <p class="lead">${esc(h.intro)}</p>
    <h2 id="calc">${esc(u.calcTitle)}</h2>
    ${calculator(lang, ROOMS[0])}
    <h2 id="rooms">${esc(u.hubAllRooms)}</h2>
    <p>${esc(u.hubTableIntro)}</p>
    ${table(rows)}
    <h2 id="how">${esc(u.howTitle)}</h2>
    ${u.how(u.howExample(exFacts))}
    ${careBlock(lang)}
    ${faqBlock(lang, h.faq)}
    ${ctaBlock(lang, pagePath(lang))}
    <h2>${esc(u.guidesTitle)}</h2>
    <ul class="cards">${GUIDES.map((g) => `<li><a href="${pagePath(lang, g.slug[lang])}">${esc(g.nav[lang])}</a></li>`).join('')}</ul>`;
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: h.title,
      description: h.description,
      inLanguage: HTML_LANG[lang],
      url: abs(path),
      dateModified: CONTENT_UPDATED,
      author: personLd,
    },
    breadcrumbLd(crumbItems),
    faqLd(h.faq),
  ];
  return {
    path,
    alternates,
    html: page({ lang, alternates, current: 'hub', headHtml: head({ lang, title: h.title, description: h.description, path, alternates, jsonld, ogType: 'website' }), body }),
  };
}

function guidePage(guide, lang) {
  const u = UI[lang];
  const path = pagePath(lang, guide.slug[lang]);
  const alternates = alternatesFor(guide.slug);
  const crumbItems = [
    [u.breadcrumbHome, pagePath(lang)],
    [guide.nav[lang], path],
  ];
  const kelvinTable = table(`
        <thead><tr><th>${esc(u.colRoom)}</th><th class="num">${esc(u.colKelvin)}</th></tr></thead>
        <tbody>${ROOMS.map((r) => `<tr><td><a href="${pagePath(lang, r.slug[lang])}">${esc(r.Name[lang])}</a><br><small>${esc(KELVIN_WHY[lang][r.id])}</small></td><td class="num"><strong>${u.kelvinRange(...r.kelvin)}</strong></td></tr>`).join('')}</tbody>`);
  const ledRows = [5, 7, 9, 12, 15, 18, 24, 40]
    .map((w) => {
      const lm = w * LED_LM_PER_W;
      const area = (lm * lightLossFactor('light', 2.7)) / 150;
      return `<tr><td>${w} W</td><td class="num"><strong>~${fmt(roundLm(lm), lang)} lm</strong></td><td class="num">≈ ${fmt(area, lang, 1)} m²</td></tr>`;
    })
    .join('');
  const html = guide.body[lang]
    .replace('{{ROOM_KELVIN_TABLE}}', kelvinTable)
    .replace('{{LED_TABLE}}', ledRows)
    .replace('{{HUB_URL}}', pagePath(lang, HUB_SLUG[lang]))
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<div class="table-wrap"><div class="table-wrap">/g, '<div class="table-wrap">')
    .replace(/<\/table><\/div><\/div>/g, '</table></div>');
  const sim = simUrl(lang);
  const body = `    ${crumbs(crumbItems)}
    <article>
    <h1>${esc(guide.h1[lang])}</h1>
    ${updatedLine(lang)}
    ${html}
    ${careBlock(lang)}
    ${faqBlock(lang, guide.faq[lang])}
    </article>
    ${ctaBlock(lang, sim)}
    <h2>${esc(u.relatedTitle)}</h2>
    <ul class="cards">${ROOMS.map((r) => `<li><a href="${pagePath(lang, r.slug[lang])}">${esc(r.Name[lang])}<small>${r.lux[0]}–${r.lux[1]} lux</small></a></li>`).join('')}</ul>`;
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.h1[lang],
      description: guide.description[lang],
      inLanguage: HTML_LANG[lang],
      url: abs(path),
      image: abs('/og-image.png'),
      datePublished: CONTENT_UPDATED,
      dateModified: CONTENT_UPDATED,
      author: personLd,
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: abs('/apple-touch-icon.png') } },
      mainEntityOfPage: abs(path),
    },
    breadcrumbLd(crumbItems),
    faqLd(guide.faq[lang]),
  ];
  return {
    path,
    alternates,
    html: page({ lang, alternates, current: guide.id, headHtml: head({ lang, title: guide.title[lang], description: guide.description[lang], path, alternates, jsonld }), body }),
  };
}

/** The simulator, one copy per language, with its own head and a crawlable splash inside #root. */
function appPage(shell, lang) {
  const t = TRANSLATIONS[lang];
  const u = UI[lang];
  const path = pagePath(lang);
  const alternates = alternatesFor(null);
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: abs(path),
      description: t.metaDescription,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript and WebGL',
      inLanguage: HTML_LANG[lang],
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      image: abs('/og-image.png'),
      author: personLd,
    },
  ];
  const extras = head({ lang, title: t.metaTitle, description: t.metaDescription, path, alternates, jsonld, ogType: 'website' })
    // charset, viewport, title, description, author and theme-color are already in the Vite shell
    .split('\n')
    .filter((line) => !/<meta charset|name="viewport"|<title>|name="description"|name="author"|name="theme-color"|rel="icon"|apple-touch-icon|rel="manifest"/.test(line))
    .join('\n');
  const splash = `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:#020617;color:#cbd5e1;font-family:Inter,system-ui,sans-serif;text-align:center">
      <div style="max-width:560px">
        <h1 style="margin:0 0 10px;font-size:22px;color:#fff">LuminaStudio 3D — ${esc(t.subtitle)}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">${esc(t.metaDescription)}</p>
        <nav aria-label="${esc(u.guidesTitle)}" style="font-size:14px;line-height:2">
          <a href="${pagePath(lang, HUB_SLUG[lang])}" style="color:#fbbf24">${esc(u.navCalc)}</a> ·
          ${ROOMS.map((r) => `<a href="${pagePath(lang, r.slug[lang])}" style="color:#fbbf24">${esc(r.Name[lang])}</a>`).join(' · ')} ·
          ${GUIDES.map((g) => `<a href="${pagePath(lang, g.slug[lang])}" style="color:#fbbf24">${esc(g.nav[lang])}</a>`).join(' · ')}
        </nav>
        <noscript><p style="margin-top:16px;color:#94a3b8">JavaScript + WebGL.</p></noscript>
      </div>
    </div>`;
  const html = shell
    .replace(/<html lang="[^"]*">/, `<html lang="${HTML_LANG[lang]}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(t.metaTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(t.metaDescription)}" />`)
    .replace(/<!-- seo:head[^>]*-->/, extras.trim())
    .replace('<!-- seo:root -->', splash);
  if (html.includes('seo:head') || html.includes('seo:root')) throw new Error('SEO markers not replaced in app shell');
  return { path, alternates, html };
}

/** Root "/" fallback (the Worker normally redirects by country first); not indexed itself. */
function rootPage() {
  const detect = detectLang.toString();
  const langs = JSON.stringify(LANGS);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${SITE_NAME} — Simulador de iluminação 3D · 3D lighting simulator · Simulador de iluminación 3D</title>
    <meta name="robots" content="noindex, follow">
    <meta name="theme-color" content="#020617">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    ${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(pagePath(l))}">`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${abs(pagePath(DEFAULT_LANG))}">
    <script>(()=>{const LANGS=${langs};${detect.replace(/^function detectLang/, 'function detectLang')}
const c=document.cookie.match(/(?:^|; )lang=(pt|en|es)/);const l=c?c[1]:detectLang(location.pathname,navigator.languages||[navigator.language]);location.replace('/'+l+'/'+location.search+location.hash);})();</script>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020617;color:#cbd5e1;font:16px/1.6 system-ui,sans-serif}a{color:#fbbf24;margin:0 10px;font-weight:600}</style>
  </head>
  <body>
    <p>${LANGS.map((l) => `<a href="${pagePath(l)}" hreflang="${l}" lang="${HTML_LANG[l]}">${LANG_NAMES[l]}</a>`).join('')}</p>
  </body>
</html>
`;
}

function notFoundPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — ${SITE_NAME}</title>
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#020617">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:radial-gradient(600px 300px at 50% 0,rgba(251,191,36,.12),transparent 70%),#020617;color:#cbd5e1;font:16px/1.6 Inter,system-ui,sans-serif;text-align:center}h1{color:#fff;margin:0 0 6px;font-size:28px}p{margin:4px 0}a{color:#fbbf24;font-weight:600}</style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      ${LANGS.map((l) => `<p lang="${HTML_LANG[l]}">${UI[l].notFoundTitle} — <a href="${pagePath(l)}">${UI[l].openSim}</a> · <a href="${pagePath(l, HUB_SLUG[l])}">${UI[l].navCalc}</a></p>`).join('\n      ')}
    </main>
  </body>
</html>
`;
}

function sitemap(pages) {
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${abs(p.path)}</loc>
    <lastmod>${CONTENT_UPDATED}</lastmod>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(p.alternates[l])}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(p.alternates[DEFAULT_LANG])}"/>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

/* ------------------------------------------------------------------ write */

async function write(path, html) {
  const file = join(DIST, path.endsWith('/') ? `${path}index.html` : path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

const shell = await readFile(join(DIST, 'index.html'), 'utf8');
const pages = [];
for (const lang of LANGS) {
  pages.push(appPage(shell, lang));
  pages.push(hubPage(lang));
  for (const room of ROOMS) pages.push(roomPage(room, lang));
  for (const guide of GUIDES) pages.push(guidePage(guide, lang));
}
for (const p of pages) await write(p.path, p.html);

await write('/index.html', rootPage());
await write('/404.html', notFoundPage());
await write('/sitemap.xml', sitemap(pages));
await write('/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);

const css =
  (await readFile(join(ROOT, 'seo/page.css'), 'utf8')) +
  '\n' +
  (await readFile(join(ROOT, 'src/components/AuthorCredit.css'), 'utf8'));
await write('/assets/guide.css', css);
await mkdir(join(DIST, 'assets/credit'), { recursive: true });
await copyFile(join(ROOT, 'src/assets/img/credit/bruno-head.webp'), join(DIST, 'assets/credit/bruno-head.webp'));

console.log(`SEO: ${pages.length} pages + root, 404, sitemap.xml, robots.txt → ${SITE_URL}`);
