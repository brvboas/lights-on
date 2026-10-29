/**
 * Sources behind the lux calculation, shown in the simulator ("How it is calculated")
 * and on the static SEO pages. Most standards are paid documents: the links go to the
 * official or catalog page, not to a copy.
 */
export const REFERENCES = [
  {
    id: 'ies-handbook',
    title: 'The Lighting Handbook, 10th ed. (2011)',
    org: 'Illuminating Engineering Society (IES)',
    url: 'https://www.ies.org/',
    use: {
      pt: 'Método dos lúmens (cavidades zonais), índice do recinto e fator de utilização.',
      en: 'Lumen (zonal cavity) method, room index and coefficient of utilization.',
      es: 'Método de los lúmenes (cavidades zonales), índice del local y factor de utilización.',
    },
  },
  {
    id: 'cie-52',
    title: 'CIE 52:1982 — Calculations for interior lighting: applied method',
    org: 'Commission Internationale de l’Éclairage (CIE)',
    url: 'https://cie.co.at/publications/calculations-interior-lighting-applied-method',
    use: {
      pt: 'Cálculo do fator de utilização a partir do índice do recinto e das refletâncias.',
      en: 'Utilization factor from the room index and surface reflectances.',
      es: 'Factor de utilización a partir del índice del local y las reflectancias.',
    },
  },
  {
    id: 'ies-rp-11',
    title: 'ANSI/IES/ALA RP-11-26 — Lighting for Interior and Exterior Residential Environments',
    org: 'IES / American Lighting Association',
    url: 'https://webstore.ansi.org/standards/iesna/ansiiesalarp1126',
    use: {
      pt: 'Prática recomendada para iluminação residencial: níveis de lux por cômodo e tarefa.',
      en: 'Recommended practice for home lighting: lux levels per room and task.',
      es: 'Práctica recomendada para iluminación residencial: niveles de lux por habitación y tarea.',
    },
  },
  {
    id: 'nbr-8995',
    title: 'ABNT NBR ISO/CIE 8995-1:2013 — Iluminação de ambientes de trabalho, Parte 1: Interior',
    org: 'ABNT (Brasil) · ISO/CIE 8995-1',
    url: 'https://www.target.com.br/produtos/normas-tecnicas/43005/nbriso-cie8995-1-iluminacao-de-ambientes-de-trabalho-parte-1-interior',
    use: {
      pt: 'Norma brasileira atual de iluminância em interiores; base para home office e áreas de circulação.',
      en: 'Current Brazilian/ISO standard for indoor illuminance; basis for home office and circulation areas.',
      es: 'Norma brasileña/ISO vigente de iluminancia en interiores; base para oficina en casa y zonas de paso.',
    },
  },
  {
    id: 'en-12464',
    title: 'EN 12464-1:2021 — Light and lighting: Lighting of work places, Part 1: Indoor',
    org: 'CEN (Europa)',
    url: null,
    use: {
      pt: 'Equivalente europeu, com o mesmo conceito de iluminância média mantida.',
      en: 'European counterpart, same concept of maintained average illuminance.',
      es: 'Equivalente europeo (UNE-EN), con el mismo concepto de iluminancia media mantenida.',
    },
  },
  {
    id: 'nbr-5413',
    title: 'ABNT NBR 5413:1992 — Iluminância de interiores (cancelada em 2013)',
    org: 'ABNT (Brasil)',
    url: null,
    use: {
      pt: 'Substituída pela NBR ISO/CIE 8995-1; ainda é a referência mais citada de lux para residências no Brasil.',
      en: 'Replaced by NBR ISO/CIE 8995-1; still the most quoted residential lux reference in Brazil.',
      es: 'Reemplazada por la NBR ISO/CIE 8995-1; sigue siendo la referencia de lux residencial más citada en Brasil.',
    },
  },
];
