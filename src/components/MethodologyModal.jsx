import React, { useEffect, useRef } from 'react';
import { X, Calculator, ExternalLink, BookOpen } from 'lucide-react';
import {
  ROOM_LUX,
  MAINTENANCE_FACTOR,
  LED_LM_PER_W,
  WORK_PLANE_HEIGHT,
} from '../utils/illuminance';
import { REFERENCES } from '../utils/references';
import { ROOM_TYPES } from '../utils/lightingPhysics';

const LOCALE = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

/** Copy for the "How it is calculated" panel. */
const TEXT = {
  pt: {
    title: 'Como o lux é calculado',
    subtitle: 'Método dos lúmens, o cálculo padrão de luminotécnica',
    yourRoom: 'No seu cômodo agora',
    roomIndex: 'Índice do recinto',
    utilization: 'Fator de utilização',
    maintenance: 'Fator de manutenção',
    result: 'Iluminância média',
    walls: (pct, capped) =>
      capped ? `paredes claras: refletância ≥ ${pct}% (limite da tabela)` : `paredes com refletância ≈ ${pct}%`,
    formulaTitle: 'A fórmula',
    formula: 'lux = lúmens × CU × FM ÷ área',
    bullets: [
      ['Plano de trabalho', 'o lux é a média na altura de uma mesa (0,75 m), como nas normas.'],
      ['Índice do recinto (K)', 'K = 2 × área ÷ (h × perímetro), com h = pé-direito − 0,75 m. Num retângulo: K = C × L ÷ [h × (C + L)]. Cômodos pequenos ou com pé-direito alto têm K baixo: mais luz bate nas paredes antes de chegar à mesa.'],
      ['Fator de utilização (CU)', 'parte da luz que chega ao plano de trabalho. Vem de uma tabela que cruza K com a refletância das paredes, para luminária difusa de teto, teto branco (70%) e piso médio (20%). A refletância da parede é estimada pela cor escolhida.'],
      ['Fator de manutenção (FM)', `${String(MAINTENANCE_FACTOR).replace('.', ',')}, para a perda de brilho do LED e a poeira com o tempo.`],
      ['Watts', `convertidos com a eficiência média de LED residencial, ${LED_LM_PER_W} lm/W. Na loja, compare pelos lúmens da embalagem.`],
    ],
    rangesTitle: 'Lux recomendado por cômodo',
    colRoom: 'Cômodo',
    colGeneral: 'Luz geral',
    colTask: 'Tarefa',
    moodTitle: 'Clima da luz',
    moods: [
      ['Penumbra / Cinema', 'abaixo de 50 lx'],
      ['Aconchegante', '50 a 150 lx'],
      ['Bem iluminado', '150 a 300 lx'],
      ['Intenso / Trabalho', '300 lx ou mais'],
    ],
    renderTitle: 'E o 3D?',
    render: 'O brilho do 3D acompanha o lux calculado: cada lâmpada emite seus lúmens e a luz diminui com o quadrado da distância, e a luz que rebate nas paredes entra como luz ambiente. É uma visualização aproximada, para comparar posições e cores; o número de lux vem da fórmula acima.',
    limitsTitle: 'Limites do cálculo',
    limits: 'É uma estimativa para planejar e comparar, não um projeto luminotécnico. Um projeto real usa os dados fotométricos da luminária escolhida (curva de distribuição e tabela de CU do fabricante), o ângulo do facho e a posição dos móveis. Para obra ou espaço comercial, consulte um lighting designer, arquiteto ou engenheiro eletricista.',
    refsTitle: 'Referências',
    refsNote: 'As normas são documentos pagos; os links levam à página oficial ou de catálogo. Normas de trabalho não regulam residências: os valores são referências de conforto.',
    fullPage: 'Página completa com calculadora',
    close: 'Fechar',
  },
  en: {
    title: 'How lux is calculated',
    subtitle: 'The lumen method, the standard lighting design calculation',
    yourRoom: 'Your room right now',
    roomIndex: 'Room index',
    utilization: 'Coefficient of utilization',
    maintenance: 'Maintenance factor',
    result: 'Average illuminance',
    walls: (pct, capped) =>
      capped ? `light walls: reflectance ≥ ${pct}% (table limit)` : `walls reflecting ≈ ${pct}%`,
    formulaTitle: 'The formula',
    formula: 'lux = lumens × CU × MF ÷ area',
    bullets: [
      ['Work plane', 'lux is the average at table height (0.75 m / 30 in), as in the standards.'],
      ['Room index (K)', 'K = 2 × area ÷ (h × perimeter), where h = ceiling height − 0.75 m. For a rectangle: K = L × W ÷ [h × (L + W)]. Small rooms and tall ceilings have a low K: more light hits the walls before reaching the table.'],
      ['Coefficient of utilization (CU)', 'share of the light that reaches the work plane. It comes from a table that crosses K with wall reflectance, for a diffuse ceiling fixture, a white ceiling (70%) and a mid-tone floor (20%). Wall reflectance is estimated from the paint you pick.'],
      ['Maintenance factor (MF)', `${MAINTENANCE_FACTOR}, for LED depreciation and dust over time.`],
      ['Watts', `converted with the average residential LED efficacy, ${LED_LM_PER_W} lm/W. In the store, compare the lumens on the box.`],
    ],
    rangesTitle: 'Recommended lux per room',
    colRoom: 'Room',
    colGeneral: 'General',
    colTask: 'Task',
    moodTitle: 'Light mood',
    moods: [
      ['Dim / Home theater', 'below 50 lx'],
      ['Cozy', '50 to 150 lx'],
      ['Well lit', '150 to 300 lx'],
      ['Bright / Task', '300 lx or more'],
    ],
    renderTitle: 'What about the 3D view?',
    render: 'The 3D brightness follows the calculated lux: each lamp emits its lumens and the light falls off with the square of the distance, and light bouncing off the walls is added as ambient light. It is an approximate view for comparing positions and colors; the lux figure comes from the formula above.',
    limitsTitle: 'Limits',
    limits: 'This is an estimate for planning and comparing, not a lighting design. A real design uses the photometric data of the chosen fixture (distribution curve and the manufacturer’s CU table), the beam angle and where the furniture is. For construction or commercial spaces, talk to a lighting designer, architect or electrician.',
    refsTitle: 'References',
    refsNote: 'Standards are paid documents; links go to the official or catalog page. Workplace standards do not regulate homes: treat the values as comfort references.',
    fullPage: 'Full page with calculator',
    close: 'Close',
  },
  es: {
    title: 'Cómo se calculan los lux',
    subtitle: 'Método de los lúmenes, el cálculo estándar de luminotecnia',
    yourRoom: 'Tu habitación ahora',
    roomIndex: 'Índice del local',
    utilization: 'Factor de utilización',
    maintenance: 'Factor de mantenimiento',
    result: 'Iluminancia media',
    walls: (pct, capped) =>
      capped ? `paredes claras: reflectancia ≥ ${pct} % (límite de la tabla)` : `paredes con reflectancia ≈ ${pct} %`,
    formulaTitle: 'La fórmula',
    formula: 'lux = lúmenes × CU × FM ÷ superficie',
    bullets: [
      ['Plano de trabajo', 'los lux son la media a la altura de una mesa (0,75 m), como en las normas.'],
      ['Índice del local (K)', 'K = 2 × superficie ÷ (h × perímetro), con h = altura del techo − 0,75 m. En un rectángulo: K = L × A ÷ [h × (L + A)]. Las habitaciones pequeñas o con techos altos tienen un K bajo: más luz choca con las paredes antes de llegar a la mesa.'],
      ['Factor de utilización (CU)', 'parte de la luz que llega al plano de trabajo. Sale de una tabla que cruza K con la reflectancia de las paredes, para luminaria difusa de techo, techo blanco (70 %) y suelo medio (20 %). La reflectancia de la pared se estima a partir del color elegido.'],
      ['Factor de mantenimiento (FM)', `${String(MAINTENANCE_FACTOR).replace('.', ',')}, por la pérdida de brillo del LED y el polvo con el tiempo.`],
      ['Vatios', `convertidos con la eficiencia media de un LED residencial, ${LED_LM_PER_W} lm/W. En la tienda, compara los lúmenes de la caja.`],
    ],
    rangesTitle: 'Lux recomendados por habitación',
    colRoom: 'Habitación',
    colGeneral: 'Luz general',
    colTask: 'Tarea',
    moodTitle: 'Ambiente de la luz',
    moods: [
      ['Penumbra / Cine', 'menos de 50 lx'],
      ['Acogedor', '50 a 150 lx'],
      ['Bien iluminado', '150 a 300 lx'],
      ['Intenso / Trabajo', '300 lx o más'],
    ],
    renderTitle: '¿Y la vista 3D?',
    render: 'El brillo del 3D sigue los lux calculados: cada lámpara emite sus lúmenes y la luz disminuye con el cuadrado de la distancia, y la luz que rebota en las paredes se suma como luz ambiente. Es una vista aproximada para comparar posiciones y colores; la cifra de lux sale de la fórmula de arriba.',
    limitsTitle: 'Límites del cálculo',
    limits: 'Es una estimación para planificar y comparar, no un proyecto de iluminación. Un proyecto real usa los datos fotométricos de la luminaria elegida (curva de distribución y tabla de CU del fabricante), el ángulo de apertura y la posición de los muebles. Para obras o locales comerciales, consulta a un diseñador de iluminación, arquitecto o electricista.',
    refsTitle: 'Referencias',
    refsNote: 'Las normas son documentos de pago; los enlaces llevan a la página oficial o de catálogo. Las normas de lugares de trabajo no regulan las viviendas: los valores son referencias de confort.',
    fullPage: 'Página completa con calculadora',
    close: 'Cerrar',
  },
};

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">{title}</h3>
      {children}
    </section>
  );
}

/**
 * "How it is calculated" panel: live worked example for the current room, the formula,
 * recommended ranges, moods, render notes, limits and references.
 * Desktop: centered dialog. Phones: full-height sheet.
 */
export default function MethodologyModal({ open, onClose, lang, t, data, hubUrl }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const x = TEXT[lang] || TEXT.en;

  // Focus the close button once when it opens; Esc closes
  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const nf = (n, d = 2) =>
    new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n);
  const h = Math.max(0.5, data.height - WORK_PLANE_HEIGHT);
  const rhoPct = Math.round(Math.min(0.5, Math.max(0.1, data.rho)) * 100);
  const mfLabel = lang === 'en' ? 'MF' : 'FM';

  const steps = [
    {
      label: `${x.roomIndex} (K)`,
      expr: `2 × ${nf(data.area, 1)} m² ÷ (${nf(h)} m × ${nf(data.perimeter, 1)} m)`,
      value: nf(data.k),
    },
    {
      label: `${x.utilization} (CU)`,
      expr: `K ${nf(data.k)} · ${x.walls(rhoPct, data.rho > 0.5)}`,
      value: nf(data.cu),
    },
    { label: `${x.maintenance} (${mfLabel})`, expr: '', value: nf(MAINTENANCE_FACTOR, 1) },
    {
      label: x.result,
      expr: `${nf(data.lumens, 0)} lm × ${nf(data.cu)} × ${nf(MAINTENANCE_FACTOR, 1)} ÷ ${nf(data.area, 1)} m²`,
      value: `${nf(data.lux, 0)} lux`,
      strong: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 max-sm:p-0 max-sm:items-end"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-sm:rounded-b-none max-w-2xl w-full max-h-[88vh] max-sm:max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 id="methodology-title" className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              {x.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{x.subtitle}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={x.close}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-5 text-[13px] leading-relaxed text-slate-300">
          <Section title={x.yourRoom}>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80">
              {steps.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className={`text-xs ${s.strong ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>
                      {s.label}
                    </div>
                    {s.expr && <div className="text-[11px] text-slate-400 break-words">{s.expr}</div>}
                  </div>
                  <div className={`shrink-0 tabular-nums ${s.strong ? 'text-base font-bold text-amber-300' : 'text-sm font-semibold text-slate-100'}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={x.formulaTitle}>
            <p className="font-mono text-[13px] text-amber-200 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-center">
              {x.formula}
            </p>
            <ul className="space-y-1.5">
              {x.bullets.map(([k, v]) => (
                <li key={k}>
                  <strong className="text-slate-100">{k}:</strong> {v}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={x.rangesTitle}>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-950/70 text-slate-400">
                  <tr>
                    <th className="text-left font-semibold px-3 py-2">{x.colRoom}</th>
                    <th className="text-right font-semibold px-3 py-2">{x.colGeneral}</th>
                    <th className="text-right font-semibold px-3 py-2">{x.colTask}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {ROOM_TYPES.map((id) => {
                    const r = ROOM_LUX[id];
                    const active = id === data.roomType;
                    return (
                      <tr key={id} className={active ? 'bg-amber-500/10 text-amber-200' : ''}>
                        <td className="px-3 py-1.5">{t.roomTypes[id]}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{r.lux[0]}–{r.lux[1]} lx</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">
                          {r.task[0] === r.task[1] ? r.task[0] : `${r.task[0]}–${r.task[1]}`} lx
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={x.moodTitle}>
            <ul className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              {x.moods.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-2 rounded-xl bg-slate-950/50 border border-slate-800 px-3 py-1.5 text-xs">
                  <span className="text-slate-200">{k}</span>
                  <span className="text-slate-400 whitespace-nowrap">{v}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={x.renderTitle}>
            <p>{x.render}</p>
          </Section>

          <Section title={x.limitsTitle}>
            <p>{x.limits}</p>
          </Section>

          <Section title={x.refsTitle}>
            <ol className="space-y-2.5">
              {REFERENCES.map((r) => (
                <li key={r.id} className="flex gap-2.5">
                  <BookOpen className="w-3.5 h-3.5 mt-1 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-100 hover:text-amber-300 underline decoration-slate-600 underline-offset-2 break-words"
                      >
                        {r.title}
                        <ExternalLink className="inline w-3 h-3 ml-1 -mt-0.5" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-100 break-words">{r.title}</span>
                    )}
                    <div className="text-[11px] text-slate-500">{r.org}</div>
                    <div className="text-xs text-slate-400">{r.use[lang] || r.use.en}</div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-slate-500">{x.refsNote}</p>
          </Section>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-800 bg-slate-900 shrink-0 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <a
            href={hubUrl}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2"
          >
            {x.fullPage}
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            {x.close}
          </button>
        </div>
      </div>
    </div>
  );
}
