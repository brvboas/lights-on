import { useEffect, useRef, useState } from 'react';
import headImg from '../assets/img/credit/bruno-head.webp';
import './AuthorCredit.css';

const LINKEDIN = 'https://www.linkedin.com/in/bruno-villas-boas/';
const GITHUB = 'https://github.com/brvboas';

const COPY = {
  pt: {
    newTab: '(abre em nova aba)',
    inspiration: 'inspiração',
    eyebrow: 'De onde veio a ideia',
    note: [
      'Quis que o site parecesse um cômodo à noite, antes de alguém acender a luz. Por isso tudo é escuro, azul-grafite, e os painéis flutuam como vidro fosco por cima da cena: quem tem que aparecer é a luz das lâmpadas.',
      'O âmbar só entra onde tem energia: o botão de acender tudo, a aba das lâmpadas, os números de lúmen. O azul ficou pra câmera e pros móveis, como luz fria de tela. E dá pra acender e apagar com duplo clique e tirar foto com flash, como numa visita de obra.',
      'Fiz porque escolher lâmpada é sempre um chute: 9 W ou 12 W, 3000 K ou 4000 K? Aqui dá pra testar antes de furar o teto.',
    ],
  },
  en: {
    newTab: '(opens in a new tab)',
    inspiration: 'inspiration',
    eyebrow: 'Where the idea came from',
    note: [
      'I wanted the site to feel like a room at night, right before someone flips the switch. That is why everything is dark slate and the panels float like frosted glass over the scene: the lamps are the ones that should shine.',
      'Amber only shows up where there is energy: the all-lights button, the lamps tab, the lumen numbers. Blue went to the camera and the furniture, like the cold light of a screen. You can double-click lamps on and off and take a photo with a flash, like on a site visit.',
      'I made it because picking a bulb is always a guess: 9 W or 12 W, 3000 K or 4000 K? Here you can try it before drilling the ceiling.',
    ],
  },
};

/** Footer signature (Bruno's standard): head opens LinkedIn/GitHub, the lamp opens a note about the design. */
export default function AuthorCredit({ lang = 'pt' }) {
  const c = COPY[lang] ?? COPY.pt;
  const [open, setOpen] = useState(null); // 'links' | 'inspiration' | null
  const rootRef = useRef(null);
  const linksBtn = useRef(null);
  const inspBtn = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(null);
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const btn = open === 'links' ? linksBtn.current : inspBtn.current;
      setOpen(null);
      btn?.focus();
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (id) => setOpen((cur) => (cur === id ? null : id));

  return (
    <div className="credit" ref={rootRef}>
      <div className="credit__item">
        <button
          ref={linksBtn}
          className="credit__toggle"
          type="button"
          aria-expanded={open === 'links'}
          aria-controls="credit-menu"
          onClick={() => toggle('links')}
        >
          <img className="credit__head" src={headImg} alt="" width="216" height="240" loading="lazy" decoding="async" />
          <span className="credit__name">by Bruno Villas Boas</span>
        </button>
        <ul className="credit__menu" id="credit-menu" hidden={open !== 'links'}>
          <li>
            <a href={LINKEDIN} target="_blank" rel="noopener author" aria-label={`LinkedIn ${c.newTab}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
              LinkedIn
            </a>
          </li>
          <li>
            <a href={GITHUB} target="_blank" rel="noopener author" aria-label={`GitHub ${c.newTab}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3Z" /></svg>
              GitHub
            </a>
          </li>
        </ul>
      </div>
      <div className="credit__item">
        <button
          ref={inspBtn}
          className="inspiration__toggle"
          type="button"
          aria-expanded={open === 'inspiration'}
          aria-controls="inspiration-note"
          onClick={() => toggle('inspiration')}
        >
          <svg className="inspiration__bulb" viewBox="0 0 24 24" aria-hidden="true">
            <path className="bulb-glass" d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.1.9 1.8V17h6v-1c0-.7.3-1.3.9-1.8A6.5 6.5 0 0 0 12 2.5Z" />
            <path className="bulb-base" d="M9 18.5h6M9.8 21h4.4" />
          </svg>
          {c.inspiration}
        </button>
        <div className="inspiration__note" id="inspiration-note" role="note" hidden={open !== 'inspiration'}>
          <span className="inspiration__eyebrow">{c.eyebrow}</span>
          {c.note.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <span className="inspiration__sign">Bruno</span>
        </div>
      </div>
    </div>
  );
}
