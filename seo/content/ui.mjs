/** Interface strings for the static SEO pages (templates in seo/templates.mjs). */
export const UI = {
  pt: {
    locale: 'pt-BR',
    ogLocale: 'pt_BR',
    brandTag: 'Simulador de iluminação 3D',
    navCalc: 'Calculadora',
    navKelvin: 'Temperatura de cor',
    navUnits: 'Lux, lúmens e watts',
    openSim: 'Abrir simulador 3D',
    breadcrumbHome: 'Simulador 3D',
    langLabel: 'Idioma',
    quickAnswer: 'Resposta rápida',
    quick: (r) =>
      `Para ${r.article} de <strong>${r.area} m²</strong> (${r.w} × ${r.d} m) com paredes claras, conte com cerca de <strong>${r.lm} lúmens</strong>, algo como <strong>${r.watts} W de LED</strong>. A faixa recomendada é de ${r.luxMin} a ${r.luxMax} lux na luz geral e ${r.task} lux ${r.taskWhere}.`,
    recTitle: (name) => `Lux recomendado para ${name}`,
    colWhat: 'Onde',
    colLux: 'Iluminância',
    colKelvin: 'Temperatura de cor',
    general: 'Luz geral do cômodo',
    sizeTitle: (name) => `Quantos lúmens por tamanho de ${name}`,
    sizeIntro: (lux) => `Lúmens totais para chegar a ${lux} lux de média, somando todas as lâmpadas do cômodo. Os watts são para LED comum (cerca de 95 lm/W).`,
    colArea: 'Área',
    colLight: 'Paredes claras',
    colMedium: 'Paredes médias',
    colDark: 'Paredes escuras',
    colWatts: 'LED (paredes claras)',
    calcTitle: 'Calcule para o seu cômodo',
    calcRoom: 'Cômodo',
    calcWidth: 'Largura (m)',
    calcLength: 'Comprimento (m)',
    calcHeight: 'Pé-direito (m)',
    calcLux: 'Lux desejado',
    calcWalls: 'Cor das paredes',
    wallLight: 'Claras',
    wallMedium: 'Médias',
    wallDark: 'Escuras',
    calcArea: 'Área',
    calcNeed: 'Você precisa de',
    calcRange: 'Faixa recomendada',
    calcLed: 'Em LED',
    calcBulbs: 'Por exemplo',
    calcBulbsOf: (n, w, lm) => `${n} × lâmpada de ${w} W (${lm} lm)`,
    calcOr: 'ou',
    calcTry: 'Abrir o simulador 3D',
    calcNoJs: 'Ative o JavaScript para usar a calculadora, ou use a tabela acima.',
    tipsTitle: 'Dicas para iluminar',
    howTitle: 'Como a conta é feita',
    how: (ex) => `
      <p>A iluminância média (lux) é a luz que chega ao piso, por metro quadrado. Nem toda a luz que a lâmpada emite chega lá: parte é absorvida pelas paredes e pelo teto, e a lâmpada perde rendimento com o tempo. Por isso a conta usa dois fatores:</p>
      <p class="formula">lúmens = lux × área ÷ (aproveitamento × manutenção)</p>
      <ul>
        <li><strong>Aproveitamento</strong>: quanto da luz chega ao piso. Usamos 0,6 para paredes claras, 0,5 para médias e 0,4 para escuras (um pouco menos com pé-direito acima de 3 m).</li>
        <li><strong>Manutenção</strong>: 0,8, para compensar a perda de brilho do LED e a poeira.</li>
      </ul>
      <p>Exemplo: ${ex}</p>
      <p>O simulador 3D mostra a conta simples (lúmens ÷ área, sem as perdas), por isso o lux dele aparece maior que o desta página para as mesmas lâmpadas. Use o simulador para comparar posições e cores de luz, e esta página para escolher quantos lúmens comprar.</p>`,
    howExample: (r) => `${r.lux} lux × ${r.area} m² ÷ (0,6 × 0,8) = <strong>${r.lm} lúmens</strong>. Dividindo por 95 lm/W, dá cerca de ${r.watts} W de LED.`,
    careTitle: 'Leia antes de comprar',
    care: `
      <p>Estes números são uma <strong>estimativa para planejar e comparar</strong>, não um projeto luminotécnico. A conta considera a cor das paredes, a perda de luz com o tempo e uma eficiência média de LED (95 lm/W), mas não sabe qual luminária você vai usar, o ângulo do facho nem onde estão os móveis.</p>
      <ul>
        <li>Na loja, compare pelos <strong>lúmens da embalagem</strong>, não pelos watts. A eficiência varia de 80 a mais de 110 lm/W.</li>
        <li>Luminárias fechadas, com difusor fosco ou cúpula escura, entregam menos luz que a lâmpada sozinha.</li>
        <li>Na dúvida, mire no meio da faixa e use dimmer: dá para baixar a luz, mas não aumentar.</li>
        <li>Para obra, reforma grande ou espaço comercial, consulte um lighting designer, arquiteto ou engenheiro eletricista.</li>
      </ul>`,
    sourcesTitle: 'De onde vêm os valores',
    sources: 'As faixas são referências de conforto para residências, baseadas na antiga NBR 5413 (que trazia valores para casas), na NBR ISO/CIE 8995-1 (escritórios e áreas de circulação) e nas recomendações residenciais da IES (Illuminating Engineering Society). Normas de iluminação de trabalho não regulam residências; use os valores como ponto de partida.',
    faqTitle: 'Perguntas frequentes',
    faqWatts: (r) => [`Quantos watts de LED para ${r.article} de ${r.area} m²?`, `Cerca de ${r.watts} W de LED, somando todas as lâmpadas, para ${r.lm} lúmens (${r.lux} lux com paredes claras). Como a eficiência varia entre marcas, confira os lúmens na embalagem: são eles que dizem quanta luz a lâmpada dá.`],
    faqKelvin: (r) => [`Qual temperatura de cor usar ${r.inRoom}?`, `${r.kelvinText} Para comparar na prática, o simulador 3D deixa você trocar a temperatura de cada lâmpada e ver o efeito no cômodo.`],
    kelvinRange: (a, b) => (a === b ? `${a}K` : `${a}K a ${b}K`),
    ctaTitle: 'Veja antes de furar o teto',
    ctaText: 'Monte o cômodo em 3D, arraste as luminárias, troque watts e Kelvin e veja o resultado na hora.',
    ctaBtn: 'Abrir no simulador 3D',
    relatedTitle: 'Outros cômodos',
    guidesTitle: 'Guias',
    footerAbout: 'LuminaStudio 3D é um simulador gratuito para testar a iluminação de casa no navegador.',
    updated: 'Atualizado em',
    toc: 'Nesta página',
    lmUnit: 'lm',
    hubAllRooms: 'Lux e lúmens por cômodo',
    hubTableIntro: 'Lux recomendado em cada cômodo e quantos lúmens um ambiente de 12 m² com paredes claras precisa. Abra o cômodo para ver a tabela completa por tamanho.',
    colRoom: 'Cômodo',
    colLumens: (a) => `Lúmens (${a} m²)`,
    notFoundTitle: 'Página não encontrada',
  },
  en: {
    locale: 'en-US',
    ogLocale: 'en_US',
    brandTag: '3D lighting simulator',
    navCalc: 'Calculator',
    navKelvin: 'Color temperature',
    navUnits: 'Lux, lumens & watts',
    openSim: 'Open 3D simulator',
    breadcrumbHome: '3D Simulator',
    langLabel: 'Language',
    quickAnswer: 'Quick answer',
    quick: (r) =>
      `For ${r.article} of <strong>${r.area} m²</strong> (${r.w} × ${r.d} m, about ${r.sqft} sq ft) with light walls, plan on about <strong>${r.lm} lumens</strong>, roughly <strong>${r.watts} W of LED</strong>. The recommended range is ${r.luxMin} to ${r.luxMax} lux for general light and ${r.task} lux ${r.taskWhere}.`,
    recTitle: (name) => `Recommended lux for a ${name}`,
    colWhat: 'Where',
    colLux: 'Illuminance',
    colKelvin: 'Color temperature',
    general: 'General room light',
    sizeTitle: (name) => `How many lumens by ${name} size`,
    sizeIntro: (lux) => `Total lumens to reach an average of ${lux} lux, adding up every bulb in the room. Watts are for regular LED bulbs (about 95 lm/W). 1 m² ≈ 10.8 sq ft.`,
    colArea: 'Area',
    colLight: 'Light walls',
    colMedium: 'Mid-tone walls',
    colDark: 'Dark walls',
    colWatts: 'LED (light walls)',
    calcTitle: 'Calculate for your room',
    calcRoom: 'Room',
    calcWidth: 'Width (m)',
    calcLength: 'Length (m)',
    calcHeight: 'Ceiling height (m)',
    calcLux: 'Target lux',
    calcWalls: 'Wall color',
    wallLight: 'Light',
    wallMedium: 'Mid-tone',
    wallDark: 'Dark',
    calcArea: 'Area',
    calcNeed: 'You need',
    calcRange: 'Recommended range',
    calcLed: 'In LED',
    calcBulbs: 'For example',
    calcBulbsOf: (n, w, lm) => `${n} × ${w} W bulb (${lm} lm)`,
    calcOr: 'or',
    calcTry: 'Open the 3D simulator',
    calcNoJs: 'Turn on JavaScript to use the calculator, or use the table above.',
    tipsTitle: 'Lighting tips',
    howTitle: 'How the math works',
    how: (ex) => `
      <p>Average illuminance (lux) is the light that reaches the floor, per square meter. Not all the light a bulb emits gets there: walls and ceiling absorb part of it, and bulbs lose output over time. That is why the formula uses two factors:</p>
      <p class="formula">lumens = lux × area ÷ (utilization × maintenance)</p>
      <ul>
        <li><strong>Utilization</strong>: how much of the light reaches the floor. We use 0.6 for light walls, 0.5 for mid-tone and 0.4 for dark walls (a bit less for ceilings above 3 m / 10 ft).</li>
        <li><strong>Maintenance</strong>: 0.8, to account for LED depreciation and dust.</li>
      </ul>
      <p>Example: ${ex}</p>
      <p>The 3D simulator shows the simple figure (lumens ÷ area, without losses), so its lux reads higher than this page for the same bulbs. Use the simulator to compare positions and light colors, and this page to decide how many lumens to buy.</p>`,
    howExample: (r) => `${r.lux} lux × ${r.area} m² ÷ (0.6 × 0.8) = <strong>${r.lm} lumens</strong>. Divided by 95 lm/W, that is about ${r.watts} W of LED.`,
    careTitle: 'Read this before you buy',
    care: `
      <p>These numbers are an <strong>estimate for planning and comparing</strong>, not a lighting design. The math accounts for wall color, light loss over time and an average LED efficacy (95 lm/W), but it does not know which fixture you will use, its beam angle or where the furniture is.</p>
      <ul>
        <li>In the store, compare <strong>lumens on the box</strong>, not watts. Efficacy ranges from 80 to over 110 lm/W.</li>
        <li>Closed fixtures, frosted diffusers and dark shades deliver less light than the bare bulb.</li>
        <li>When in doubt, aim for the middle of the range and add a dimmer: you can turn light down, not up.</li>
        <li>For construction, major renovations or commercial spaces, talk to a lighting designer, architect or electrician.</li>
      </ul>`,
    sourcesTitle: 'Where the values come from',
    sources: 'The ranges are comfort references for homes, based on IES (Illuminating Engineering Society) residential recommendations, ISO 8995-1 / EN 12464-1 (offices and circulation areas) and the former Brazilian standard NBR 5413, which included residential values. Workplace lighting standards do not regulate homes; treat the values as a starting point.',
    faqTitle: 'Frequently asked questions',
    faqWatts: (r) => [`How many LED watts for ${r.article} of ${r.area} m² (${r.sqft} sq ft)?`, `About ${r.watts} W of LED across all bulbs, for ${r.lm} lumens (${r.lux} lux with light walls). Efficacy varies between brands, so check the lumens on the box: that is what tells you how much light the bulb gives.`],
    faqKelvin: (r) => [`What color temperature for ${r.inRoom}?`, `${r.kelvinText} To compare in practice, the 3D simulator lets you change each bulb’s color temperature and see the effect in the room.`],
    kelvinRange: (a, b) => (a === b ? `${a}K` : `${a}K to ${b}K`),
    ctaTitle: 'See it before you drill the ceiling',
    ctaText: 'Build the room in 3D, drag the fixtures around, change watts and Kelvin and see the result instantly.',
    ctaBtn: 'Open in the 3D simulator',
    relatedTitle: 'Other rooms',
    guidesTitle: 'Guides',
    footerAbout: 'LuminaStudio 3D is a free simulator for testing home lighting in your browser.',
    updated: 'Updated',
    toc: 'On this page',
    lmUnit: 'lm',
    hubAllRooms: 'Lux and lumens by room',
    hubTableIntro: 'Recommended lux for each room and how many lumens a 12 m² (130 sq ft) room with light walls needs. Open a room for the full chart by size.',
    colRoom: 'Room',
    colLumens: (a) => `Lumens (${a} m²)`,
    notFoundTitle: 'Page not found',
  },
  es: {
    locale: 'es-ES',
    ogLocale: 'es_ES',
    brandTag: 'Simulador de iluminación 3D',
    navCalc: 'Calculadora',
    navKelvin: 'Temperatura de color',
    navUnits: 'Lux, lúmenes y vatios',
    openSim: 'Abrir simulador 3D',
    breadcrumbHome: 'Simulador 3D',
    langLabel: 'Idioma',
    quickAnswer: 'Respuesta rápida',
    quick: (r) =>
      `Para ${r.article} de <strong>${r.area} m²</strong> (${r.w} × ${r.d} m) con paredes claras, cuenta con unos <strong>${r.lm} lúmenes</strong>, algo así como <strong>${r.watts} W de LED</strong>. El rango recomendado es de ${r.luxMin} a ${r.luxMax} lux de luz general y ${r.task} lux ${r.taskWhere}.`,
    recTitle: (name) => `Lux recomendados para ${name}`,
    colWhat: 'Dónde',
    colLux: 'Iluminancia',
    colKelvin: 'Temperatura de color',
    general: 'Luz general de la habitación',
    sizeTitle: (name) => `Cuántos lúmenes según el tamaño (${name})`,
    sizeIntro: (lux) => `Lúmenes totales para llegar a una media de ${lux} lux, sumando todas las bombillas de la habitación. Los vatios son para LED común (unos 95 lm/W).`,
    colArea: 'Superficie',
    colLight: 'Paredes claras',
    colMedium: 'Paredes medias',
    colDark: 'Paredes oscuras',
    colWatts: 'LED (paredes claras)',
    calcTitle: 'Calcula para tu habitación',
    calcRoom: 'Habitación',
    calcWidth: 'Ancho (m)',
    calcLength: 'Largo (m)',
    calcHeight: 'Altura del techo (m)',
    calcLux: 'Lux deseados',
    calcWalls: 'Color de las paredes',
    wallLight: 'Claras',
    wallMedium: 'Medias',
    wallDark: 'Oscuras',
    calcArea: 'Superficie',
    calcNeed: 'Necesitas',
    calcRange: 'Rango recomendado',
    calcLed: 'En LED',
    calcBulbs: 'Por ejemplo',
    calcBulbsOf: (n, w, lm) => `${n} × bombilla de ${w} W (${lm} lm)`,
    calcOr: 'o',
    calcTry: 'Abrir el simulador 3D',
    calcNoJs: 'Activa JavaScript para usar la calculadora, o usa la tabla de arriba.',
    tipsTitle: 'Consejos de iluminación',
    howTitle: 'Cómo se hace el cálculo',
    how: (ex) => `
      <p>La iluminancia media (lux) es la luz que llega al suelo, por metro cuadrado. No toda la luz que emite la bombilla llega: paredes y techo absorben una parte, y la bombilla pierde rendimiento con el tiempo. Por eso el cálculo usa dos factores:</p>
      <p class="formula">lúmenes = lux × superficie ÷ (aprovechamiento × mantenimiento)</p>
      <ul>
        <li><strong>Aprovechamiento</strong>: cuánta luz llega al suelo. Usamos 0,6 para paredes claras, 0,5 para medias y 0,4 para oscuras (algo menos con techos de más de 3 m).</li>
        <li><strong>Mantenimiento</strong>: 0,8, para compensar la pérdida de brillo del LED y el polvo.</li>
      </ul>
      <p>Ejemplo: ${ex}</p>
      <p>El simulador 3D muestra el cálculo simple (lúmenes ÷ superficie, sin pérdidas), por eso sus lux aparecen más altos que los de esta página con las mismas bombillas. Usa el simulador para comparar posiciones y colores de luz, y esta página para decidir cuántos lúmenes comprar.</p>`,
    howExample: (r) => `${r.lux} lux × ${r.area} m² ÷ (0,6 × 0,8) = <strong>${r.lm} lúmenes</strong>. Dividido entre 95 lm/W, son unos ${r.watts} W de LED.`,
    careTitle: 'Lee esto antes de comprar',
    care: `
      <p>Estas cifras son una <strong>estimación para planificar y comparar</strong>, no un proyecto de iluminación. El cálculo tiene en cuenta el color de las paredes, la pérdida de luz con el tiempo y una eficiencia media de LED (95 lm/W), pero no sabe qué luminaria vas a usar, su ángulo de apertura ni dónde están los muebles.</p>
      <ul>
        <li>En la tienda, compara por los <strong>lúmenes de la caja</strong>, no por los vatios. La eficiencia va de 80 a más de 110 lm/W.</li>
        <li>Las luminarias cerradas, con difusor opal o pantalla oscura, dan menos luz que la bombilla sola.</li>
        <li>Si dudas, apunta al centro del rango y añade un regulador: la luz se puede bajar, no subir.</li>
        <li>Para obra, reformas grandes o locales comerciales, consulta a un diseñador de iluminación, arquitecto o electricista.</li>
      </ul>`,
    sourcesTitle: 'De dónde salen los valores',
    sources: 'Los rangos son referencias de confort para viviendas, basadas en las recomendaciones residenciales de la IES (Illuminating Engineering Society), la ISO 8995-1 / UNE-EN 12464-1 (oficinas y zonas de paso) y la antigua norma brasileña NBR 5413, que incluía valores para viviendas. Las normas de iluminación de lugares de trabajo no regulan las viviendas; usa los valores como punto de partida.',
    faqTitle: 'Preguntas frecuentes',
    faqWatts: (r) => [`¿Cuántos vatios LED para ${r.article} de ${r.area} m²?`, `Unos ${r.watts} W de LED sumando todas las bombillas, para ${r.lm} lúmenes (${r.lux} lux con paredes claras). Como la eficiencia varía entre marcas, mira los lúmenes de la caja: son los que dicen cuánta luz da la bombilla.`],
    faqKelvin: (r) => [`¿Qué temperatura de color usar ${r.inRoom}?`, `${r.kelvinText} Para compararlo en la práctica, el simulador 3D te deja cambiar la temperatura de cada bombilla y ver el efecto en la habitación.`],
    kelvinRange: (a, b) => (a === b ? `${a}K` : `${a}K a ${b}K`),
    ctaTitle: 'Míralo antes de agujerear el techo',
    ctaText: 'Arma la habitación en 3D, arrastra las luminarias, cambia vatios y Kelvin y mira el resultado al instante.',
    ctaBtn: 'Abrir en el simulador 3D',
    relatedTitle: 'Otras habitaciones',
    guidesTitle: 'Guías',
    footerAbout: 'LuminaStudio 3D es un simulador gratuito para probar la iluminación de casa en el navegador.',
    updated: 'Actualizado el',
    toc: 'En esta página',
    lmUnit: 'lm',
    hubAllRooms: 'Lux y lúmenes por habitación',
    hubTableIntro: 'Lux recomendados en cada habitación y cuántos lúmenes necesita una estancia de 12 m² con paredes claras. Abre la habitación para ver la tabla completa por tamaño.',
    colRoom: 'Habitación',
    colLumens: (a) => `Lúmenes (${a} m²)`,
    notFoundTitle: 'Página no encontrada',
  },
};

/** Grammar bits per room id: "a living room", "in the living room"… */
export const ROOM_GRAMMAR = {
  pt: {
    living: { article: 'uma sala de estar', inRoom: 'na sala de estar' },
    bedroom: { article: 'um quarto', inRoom: 'no quarto' },
    kitchen: { article: 'uma cozinha', inRoom: 'na cozinha' },
    bathroom: { article: 'um banheiro', inRoom: 'no banheiro' },
    office: { article: 'um home office', inRoom: 'no home office' },
    dining: { article: 'uma sala de jantar', inRoom: 'na sala de jantar' },
    hallway: { article: 'um corredor', inRoom: 'no corredor' },
    laundry: { article: 'uma lavanderia', inRoom: 'na lavanderia' },
  },
  en: {
    living: { article: 'a living room', inRoom: 'a living room' },
    bedroom: { article: 'a bedroom', inRoom: 'a bedroom' },
    kitchen: { article: 'a kitchen', inRoom: 'a kitchen' },
    bathroom: { article: 'a bathroom', inRoom: 'a bathroom' },
    office: { article: 'a home office', inRoom: 'a home office' },
    dining: { article: 'a dining room', inRoom: 'a dining room' },
    hallway: { article: 'a hallway', inRoom: 'a hallway' },
    laundry: { article: 'a laundry room', inRoom: 'a laundry room' },
  },
  es: {
    living: { article: 'una sala de estar', inRoom: 'en la sala de estar' },
    bedroom: { article: 'un dormitorio', inRoom: 'en el dormitorio' },
    kitchen: { article: 'una cocina', inRoom: 'en la cocina' },
    bathroom: { article: 'un baño', inRoom: 'en el baño' },
    office: { article: 'una oficina en casa', inRoom: 'en la oficina en casa' },
    dining: { article: 'un comedor', inRoom: 'en el comedor' },
    hallway: { article: 'un pasillo', inRoom: 'en el pasillo' },
    laundry: { article: 'un lavadero', inRoom: 'en el lavadero' },
  },
};

/** "…and 500 lux on the desk" — the task-area wording used in the quick answer. */
export const TASK_WHERE = {
  pt: {
    living: 'onde você lê', bedroom: 'na cabeceira e no espelho', kitchen: 'na bancada', bathroom: 'no espelho',
    office: 'na mesa', dining: 'sobre a mesa', hallway: 'em escadas', laundry: 'no tanque e onde passa roupa',
  },
  en: {
    living: 'where you read', bedroom: 'at the bedside and mirror', kitchen: 'on the counter', bathroom: 'at the mirror',
    office: 'on the desk', dining: 'on the table', hallway: 'on stairs', laundry: 'at the sink and ironing board',
  },
  es: {
    living: 'donde lees', bedroom: 'en la cabecera y el espejo', kitchen: 'en la encimera', bathroom: 'en el espejo',
    office: 'en el escritorio', dining: 'sobre la mesa', hallway: 'en escaleras', laundry: 'en la pila y donde planchas',
  },
};

/** Why that color temperature, per room. */
export const KELVIN_WHY = {
  pt: {
    living: 'Branco quente (2700K a 3000K) deixa a sala acolhedora à noite.',
    bedroom: 'Branco quente (2700K a 3000K) é o mais confortável antes de dormir.',
    kitchen: 'Branco neutro (4000K) mostra bem as cores dos alimentos; 3000K se a cozinha for aberta para a sala.',
    bathroom: '3000K a 4000K, com IRC 80 ou mais para ver bem a pele no espelho.',
    office: 'Branco neutro (4000K) ajuda na concentração sem a frieza de 6500K.',
    dining: 'Branco quente (2700K a 3000K) deixa a comida mais apetitosa.',
    hallway: 'Use a mesma temperatura dos cômodos vizinhos, normalmente 2700K a 3000K.',
    laundry: '4000K a 5000K ajuda a ver manchas e diferenciar cores de roupa.',
  },
  en: {
    living: 'Warm white (2700K–3000K) keeps the living room cozy at night.',
    bedroom: 'Warm white (2700K–3000K) is the most comfortable before sleep.',
    kitchen: 'Neutral white (4000K) shows food colors well; 3000K if the kitchen is open to the living room.',
    bathroom: '3000K–4000K, with CRI 80 or higher so skin looks right in the mirror.',
    office: 'Neutral white (4000K) helps focus without the harshness of 6500K.',
    dining: 'Warm white (2700K–3000K) makes food look more appetizing.',
    hallway: 'Match the adjoining rooms, usually 2700K–3000K.',
    laundry: '4000K–5000K helps spot stains and tell clothing colors apart.',
  },
  es: {
    living: 'El blanco cálido (2700K a 3000K) hace la sala acogedora de noche.',
    bedroom: 'El blanco cálido (2700K a 3000K) es el más cómodo antes de dormir.',
    kitchen: 'El blanco neutro (4000K) muestra bien los colores de los alimentos; 3000K si la cocina está abierta al salón.',
    bathroom: '3000K a 4000K, con IRC 80 o más para ver bien la piel en el espejo.',
    office: 'El blanco neutro (4000K) ayuda a concentrarse sin la frialdad de 6500K.',
    dining: 'El blanco cálido (2700K a 3000K) hace que la comida se vea más apetitosa.',
    hallway: 'Usa la misma temperatura que las habitaciones vecinas, normalmente 2700K a 3000K.',
    laundry: '4000K a 5000K ayuda a ver manchas y distinguir los colores de la ropa.',
  },
};
