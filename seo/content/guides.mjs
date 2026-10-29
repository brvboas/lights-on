/** Hub (calculator) and guide pages. Body HTML is trusted, hand-written copy. */
export const HUB = {
  pt: {
    title: 'Calculadora de iluminação: quantos lúmens e lux por cômodo (grátis)',
    description: 'Calcule quantos lúmens, lux e watts de LED seu cômodo precisa (sala, quarto, cozinha, banheiro…), considerando a cor das paredes. Com tabela por m².',
    h1: 'Calculadora de iluminação por cômodo',
    intro: 'Informe as medidas do cômodo e a cor das paredes para saber quantos lúmens e quantos watts de LED usar. Abaixo da calculadora estão os valores de lux recomendados para cada ambiente da casa.',
    faq: [
      ['Qual a diferença entre lux e lúmen?', 'Lúmen (lm) é a quantidade de luz que a lâmpada emite. Lux (lx) é quanta luz chega a cada metro quadrado do ambiente: 1 lux = 1 lúmen por m². A mesma lâmpada de 1.000 lúmens dá muito mais lux num banheiro de 4 m² do que numa sala de 20 m².'],
      ['Quantos lúmens por metro quadrado?', 'Depende do cômodo: de cerca de 300 lm/m² em corredores e quartos até 900 lm/m² ou mais em home office, já considerando as perdas. Multiplique a área pelo lux desejado e divida por cerca de 0,34 (cômodo de uns 12 m², paredes claras); em cômodos menores ou com paredes escuras, o divisor é menor e você precisa de mais lúmens.'],
      ['Como converter watts em lúmens?', 'Em LED comum, multiplique os watts por cerca de 95: uma lâmpada de 9 W dá uns 850 lúmens. Como a eficiência varia de marca para marca, o valor confiável é o que vem na embalagem.'],
    ],
  },
  en: {
    title: 'Lighting Calculator: How Many Lumens and Lux per Room (Free)',
    description: 'Work out how many lumens, lux and LED watts your room needs (living room, bedroom, kitchen, bathroom…), adjusted for wall color. Chart by size included.',
    h1: 'Room lighting calculator',
    intro: 'Enter your room’s size and wall color to see how many lumens and LED watts to use. Below the calculator you will find the recommended lux for every room in the house.',
    faq: [
      ['What is the difference between lux and lumens?', 'Lumens (lm) measure how much light a bulb emits. Lux (lx) measures how much light lands on each square meter: 1 lux = 1 lumen per m². The same 1,000-lumen bulb gives far more lux in a 4 m² bathroom than in a 20 m² living room.'],
      ['How many lumens per square meter?', 'It depends on the room: from about 300 lm/m² in hallways and bedrooms to 900 lm/m² or more in a home office, losses included. Multiply the area by the target lux and divide by about 0.34 (a room of about 12 m² / 130 sq ft with light walls); smaller rooms and dark walls need a smaller divisor, so more lumens. Per square foot, divide those numbers by 10.8.'],
      ['How do I convert watts to lumens?', 'For a regular LED bulb, multiply the watts by about 95: a 9 W bulb gives around 850 lumens. Efficacy varies between brands, so the reliable number is the one printed on the box.'],
    ],
  },
  es: {
    title: 'Calculadora de iluminación: cuántos lúmenes y lux por habitación (gratis)',
    description: 'Calcula cuántos lúmenes, lux y vatios LED necesita tu habitación (sala, dormitorio, cocina, baño…) según el color de las paredes. Con tabla por m².',
    h1: 'Calculadora de iluminación por habitación',
    intro: 'Indica las medidas de la habitación y el color de las paredes para saber cuántos lúmenes y vatios LED usar. Debajo de la calculadora están los lux recomendados para cada estancia de la casa.',
    faq: [
      ['¿Cuál es la diferencia entre lux y lúmenes?', 'El lumen (lm) mide cuánta luz emite la bombilla. El lux (lx) mide cuánta luz llega a cada metro cuadrado: 1 lux = 1 lumen por m². La misma bombilla de 1.000 lúmenes da muchos más lux en un baño de 4 m² que en una sala de 20 m².'],
      ['¿Cuántos lúmenes por metro cuadrado?', 'Depende de la habitación: desde unos 300 lm/m² en pasillos y dormitorios hasta 900 lm/m² o más en una oficina en casa, con las pérdidas incluidas. Multiplica la superficie por los lux deseados y divide entre 0,34 (habitación de unos 12 m², paredes claras); en habitaciones más pequeñas o con paredes oscuras el divisor es menor y necesitas más lúmenes.'],
      ['¿Cómo convertir vatios en lúmenes?', 'En un LED común, multiplica los vatios por unos 95: una bombilla de 9 W da unos 850 lúmenes. Como la eficiencia varía entre marcas, el dato fiable es el que viene en la caja.'],
    ],
  },
};

export const GUIDES = [
  {
    id: 'kelvin',
    slug: { pt: 'temperatura-de-cor-por-comodo', en: 'color-temperature-by-room', es: 'temperatura-de-color-por-habitacion' },
    nav: { pt: 'Temperatura de cor', en: 'Color temperature', es: 'Temperatura de color' },
    title: {
      pt: 'Temperatura de cor: 2700K, 3000K, 4000K ou 6500K? Guia por cômodo',
      en: 'Color Temperature Guide: 2700K, 3000K, 4000K or 6500K for Each Room',
      es: 'Temperatura de color: ¿2700K, 3000K, 4000K o 6500K? Guía por habitación',
    },
    description: {
      pt: 'Luz quente ou fria? Veja o que significam 2700K, 3000K, 4000K e 6500K e qual temperatura de cor usar em cada cômodo da casa, com tabela e dicas.',
      en: 'Warm or cool light? Learn what 2700K, 3000K, 4000K and 6500K mean and which color temperature to use in each room of your home, with a chart and tips.',
      es: '¿Luz cálida o fría? Descubre qué significan 2700K, 3000K, 4000K y 6500K y qué temperatura de color usar en cada habitación de la casa, con tabla y consejos.',
    },
    h1: {
      pt: 'Temperatura de cor: qual Kelvin usar em cada cômodo',
      en: 'Color temperature: which Kelvin to use in each room',
      es: 'Temperatura de color: qué Kelvin usar en cada habitación',
    },
    body: {
      pt: `
        <p>A temperatura de cor, medida em Kelvin (K), diz se a luz parece amarelada ou azulada. Quanto <strong>menor o número, mais quente</strong> (amarela) a luz; quanto <strong>maior, mais fria</strong> (branca-azulada). Ela não muda quanta luz a lâmpada dá, só o clima que ela cria.</p>
        <h2 id="escala">A escala na prática</h2>
        <table>
          <thead><tr><th>Kelvin</th><th>Como parece</th><th>Onde costuma funcionar</th></tr></thead>
          <tbody>
            <tr><td><span class="swatch" style="--k:#ffa257"></span>2200K–2700K</td><td>Quente, como lâmpada incandescente ou vela</td><td>Quarto, sala à noite, luminárias de apoio</td></tr>
            <tr><td><span class="swatch" style="--k:#ffb46b"></span>3000K</td><td>Quente suave, menos amarelado</td><td>Sala, sala de jantar, cozinha integrada, banheiro</td></tr>
            <tr><td><span class="swatch" style="--k:#ffd1a3"></span>4000K</td><td>Branco neutro</td><td>Cozinha, home office, banheiro, área de serviço</td></tr>
            <tr><td><span class="swatch" style="--k:#ffe4ce"></span>5000K</td><td>Branco luz do dia</td><td>Lavanderia, garagem, oficina</td></tr>
            <tr><td><span class="swatch" style="--k:#fff9fd"></span>6500K</td><td>Branco frio, azulado</td><td>Garagem, depósito; em casa costuma parecer luz de hospital</td></tr>
          </tbody>
        </table>
        <h2 id="por-comodo">Temperatura de cor por cômodo</h2>
        {{ROOM_KELVIN_TABLE}}
        <h2 id="dicas">Dicas</h2>
        <ul>
          <li><strong>Ambientes integrados pedem a mesma temperatura.</strong> Sala e cozinha abertas com 2700K de um lado e 6500K do outro ficam com cara de dois lugares diferentes.</li>
          <li><strong>Olhe também o IRC</strong> (índice de reprodução de cor). IRC 80 é o mínimo para casa; 90 ou mais mostra pele, comida e tecidos com cores mais fiéis.</li>
          <li><strong>Luz fria não é "mais forte".</strong> Uma lâmpada de 6500K parece mais clara, mas o que define quanta luz ela dá são os lúmens.</li>
          <li><strong>Lâmpadas com temperatura ajustável</strong> (smart ou "tunable white") resolvem cômodos de uso misto, como quarto que também é escritório.</li>
        </ul>`,
      en: `
        <p>Color temperature, measured in Kelvin (K), tells you whether light looks yellowish or bluish. The <strong>lower the number, the warmer</strong> (yellower) the light; the <strong>higher, the cooler</strong> (bluish white). It does not change how much light a bulb gives, only the mood it creates.</p>
        <h2 id="scale">The scale in practice</h2>
        <table>
          <thead><tr><th>Kelvin</th><th>What it looks like</th><th>Where it usually works</th></tr></thead>
          <tbody>
            <tr><td><span class="swatch" style="--k:#ffa257"></span>2200K–2700K</td><td>Warm, like an incandescent bulb or candle</td><td>Bedroom, living room at night, accent lamps</td></tr>
            <tr><td><span class="swatch" style="--k:#ffb46b"></span>3000K</td><td>Soft warm, less yellow</td><td>Living room, dining room, open kitchen, bathroom</td></tr>
            <tr><td><span class="swatch" style="--k:#ffd1a3"></span>4000K</td><td>Neutral white</td><td>Kitchen, home office, bathroom, laundry</td></tr>
            <tr><td><span class="swatch" style="--k:#ffe4ce"></span>5000K</td><td>Daylight white</td><td>Laundry, garage, workshop</td></tr>
            <tr><td><span class="swatch" style="--k:#fff9fd"></span>6500K</td><td>Cool, bluish white</td><td>Garage, storage; at home it often feels like a hospital</td></tr>
          </tbody>
        </table>
        <h2 id="by-room">Color temperature by room</h2>
        {{ROOM_KELVIN_TABLE}}
        <h2 id="tips">Tips</h2>
        <ul>
          <li><strong>Open-plan spaces need one color temperature.</strong> A living room and kitchen with 2700K on one side and 6500K on the other look like two different places.</li>
          <li><strong>Check the CRI too</strong> (color rendering index). CRI 80 is the minimum for homes; 90 or higher shows skin, food and fabrics more faithfully.</li>
          <li><strong>Cool light is not "brighter".</strong> A 6500K bulb looks crisper, but lumens are what define how much light it gives.</li>
          <li><strong>Tunable white bulbs</strong> solve mixed-use rooms, such as a bedroom that doubles as an office.</li>
        </ul>`,
      es: `
        <p>La temperatura de color, medida en Kelvin (K), indica si la luz se ve amarillenta o azulada. Cuanto <strong>menor el número, más cálida</strong> (amarilla) es la luz; cuanto <strong>mayor, más fría</strong> (blanca azulada). No cambia cuánta luz da la bombilla, solo el ambiente que crea.</p>
        <h2 id="escala">La escala en la práctica</h2>
        <table>
          <thead><tr><th>Kelvin</th><th>Cómo se ve</th><th>Dónde suele funcionar</th></tr></thead>
          <tbody>
            <tr><td><span class="swatch" style="--k:#ffa257"></span>2200K–2700K</td><td>Cálida, como una bombilla incandescente o una vela</td><td>Dormitorio, sala de noche, lámparas de apoyo</td></tr>
            <tr><td><span class="swatch" style="--k:#ffb46b"></span>3000K</td><td>Cálida suave, menos amarilla</td><td>Sala, comedor, cocina abierta, baño</td></tr>
            <tr><td><span class="swatch" style="--k:#ffd1a3"></span>4000K</td><td>Blanco neutro</td><td>Cocina, oficina en casa, baño, lavadero</td></tr>
            <tr><td><span class="swatch" style="--k:#ffe4ce"></span>5000K</td><td>Blanco luz de día</td><td>Lavadero, garaje, taller</td></tr>
            <tr><td><span class="swatch" style="--k:#fff9fd"></span>6500K</td><td>Blanco frío, azulado</td><td>Garaje, trastero; en casa suele parecer luz de hospital</td></tr>
          </tbody>
        </table>
        <h2 id="por-habitacion">Temperatura de color por habitación</h2>
        {{ROOM_KELVIN_TABLE}}
        <h2 id="consejos">Consejos</h2>
        <ul>
          <li><strong>Los espacios abiertos piden una sola temperatura.</strong> Sala y cocina abiertas con 2700K de un lado y 6500K del otro parecen dos lugares distintos.</li>
          <li><strong>Mira también el IRC</strong> (índice de reproducción cromática). IRC 80 es el mínimo para casa; 90 o más muestra piel, comida y telas con colores más fieles.</li>
          <li><strong>La luz fría no es "más potente".</strong> Una bombilla de 6500K parece más clara, pero lo que define cuánta luz da son los lúmenes.</li>
          <li><strong>Las bombillas de temperatura regulable</strong> (smart o "tunable white") resuelven habitaciones de uso mixto, como un dormitorio que también es despacho.</li>
        </ul>`,
    },
    faq: {
      pt: [
        ['Luz amarela ou branca: qual é melhor?', 'Depende do uso. Luz amarela (2700K–3000K) é melhor para relaxar: sala, quarto, sala de jantar. Luz branca neutra (4000K) é melhor para tarefas: cozinha, home office, banheiro. Luz fria (6500K) raramente é a melhor escolha dentro de casa.'],
        ['3000K ou 4000K na cozinha?', '4000K se a cozinha é fechada e você quer ver bem as cores dos alimentos. 3000K se ela é integrada à sala, para manter a casa com a mesma temperatura.'],
      ],
      en: [
        ['Warm or cool white: which is better?', 'It depends on the use. Warm light (2700K–3000K) is better for relaxing: living room, bedroom, dining room. Neutral white (4000K) is better for tasks: kitchen, home office, bathroom. Cool light (6500K) is rarely the best choice inside a home.'],
        ['3000K or 4000K in the kitchen?', '4000K if the kitchen is closed off and you want to see food colors clearly. 3000K if it is open to the living room, so the whole space keeps one color temperature.'],
      ],
      es: [
        ['¿Luz cálida o blanca: cuál es mejor?', 'Depende del uso. La luz cálida (2700K–3000K) es mejor para relajarse: sala, dormitorio, comedor. El blanco neutro (4000K) es mejor para tareas: cocina, oficina en casa, baño. La luz fría (6500K) rara vez es la mejor opción dentro de casa.'],
        ['¿3000K o 4000K en la cocina?', '4000K si la cocina es cerrada y quieres ver bien los colores de los alimentos. 3000K si está abierta al salón, para que todo el espacio tenga la misma temperatura.'],
      ],
    },
  },
  {
    id: 'units',
    slug: { pt: 'lux-lumens-e-watts', en: 'lux-lumens-and-watts', es: 'lux-lumenes-y-vatios' },
    nav: { pt: 'Lux, lúmens e watts', en: 'Lux, lumens & watts', es: 'Lux, lúmenes y vatios' },
    title: {
      pt: 'Lux, lúmens e watts: qual a diferença? Tabela de equivalência LED',
      en: 'Lux vs Lumens vs Watts: What Is the Difference? LED Equivalence Chart',
      es: 'Lux, lúmenes y vatios: ¿cuál es la diferencia? Tabla de equivalencias LED',
    },
    description: {
      pt: 'Entenda de uma vez lux, lúmens e watts, veja quantos lúmens tem uma lâmpada LED de 9 W, 12 W ou 15 W e qual LED substitui a incandescente de 60 W ou 100 W.',
      en: 'Finally understand lux, lumens and watts, see how many lumens a 9 W, 12 W or 15 W LED gives and which LED replaces a 60 W or 100 W incandescent bulb.',
      es: 'Entiende de una vez lux, lúmenes y vatios, mira cuántos lúmenes da una bombilla LED de 9 W, 12 W o 15 W y qué LED sustituye a la incandescente de 60 W o 100 W.',
    },
    h1: {
      pt: 'Lux, lúmens e watts: a diferença explicada',
      en: 'Lux, lumens and watts explained',
      es: 'Lux, lúmenes y vatios: la diferencia explicada',
    },
    body: {
      pt: `
        <p>Na embalagem da lâmpada aparecem vários números, mas só três importam para saber se o cômodo vai ficar bem iluminado:</p>
        <ul>
          <li><strong>Lúmen (lm)</strong>: quanta luz a lâmpada <em>emite</em>. É o número para comparar lâmpadas.</li>
          <li><strong>Lux (lx)</strong>: quanta luz <em>chega</em> a uma superfície, por metro quadrado (1 lux = 1 lúmen por m²). É o que as recomendações por cômodo usam.</li>
          <li><strong>Watt (W)</strong>: quanta energia a lâmpada <em>consome</em>. Com LED, watts dizem pouco sobre a luz, porque a eficiência varia.</li>
        </ul>
        <p>Uma forma de lembrar: os lúmens são a água que sai do chuveiro, os lux são quanta água cai em cada pedaço do chão, e os watts são a conta de luz.</p>
        <h2 id="equivalencia">Tabela de equivalência: incandescente × LED</h2>
        <table>
          <thead><tr><th>Incandescente</th><th>Lúmens</th><th>LED equivalente (≈ 95 lm/W)</th></tr></thead>
          <tbody>
            <tr><td>25 W</td><td>~250 lm</td><td>3 W</td></tr>
            <tr><td>40 W</td><td>~450 lm</td><td>5 W</td></tr>
            <tr><td>60 W</td><td>~800 lm</td><td>9 W</td></tr>
            <tr><td>75 W</td><td>~1.100 lm</td><td>12 W</td></tr>
            <tr><td>100 W</td><td>~1.600 lm</td><td>15–18 W</td></tr>
            <tr><td>150 W</td><td>~2.600 lm</td><td>24–28 W</td></tr>
          </tbody>
        </table>
        <h2 id="led">Quantos lúmens tem cada lâmpada LED</h2>
        <table>
          <thead><tr><th>LED</th><th>Lúmens típicos</th><th>Ilumina, a 150 lux (paredes claras)</th></tr></thead>
          <tbody>{{LED_TABLE}}</tbody>
        </table>
        <p>A última coluna mostra quantos m² cada lâmpada sozinha deixaria com 150 lux, o nível de uma sala de estar, já com as perdas. Para outros cômodos, use a <a href="{{HUB_URL}}">calculadora</a>.</p>
        <h2 id="de-lumens-para-lux">De lúmens para lux</h2>
        <p class="formula">lux ≈ lúmens × CU × 0,8 ÷ área</p>
        <p>É o método dos lúmens. O CU (fator de utilização) é a parte da luz que chega à altura de uma mesa; o 0,8 compensa a perda de brilho do LED e a poeira. Num cômodo de 4 × 3 m com pé-direito de 2,7 m e paredes claras, o CU fica perto de 0,42, então chegam cerca de 0,34 dos lúmens; com paredes escuras, cerca de 0,25. Por isso duas salas do mesmo tamanho, com as mesmas lâmpadas, podem parecer bem diferentes.</p>`,
      en: `
        <p>A bulb box shows lots of numbers, but only three matter to know whether your room will be well lit:</p>
        <ul>
          <li><strong>Lumen (lm)</strong>: how much light the bulb <em>emits</em>. This is the number to compare bulbs by.</li>
          <li><strong>Lux (lx)</strong>: how much light <em>lands</em> on a surface, per square meter (1 lux = 1 lumen per m²; 1 foot-candle ≈ 10.8 lux). Room recommendations use lux.</li>
          <li><strong>Watt (W)</strong>: how much power the bulb <em>uses</em>. With LEDs, watts say little about light, because efficacy varies.</li>
        </ul>
        <p>One way to remember it: lumens are the water coming out of the shower head, lux is how much water lands on each tile, and watts are the bill.</p>
        <h2 id="equivalence">Equivalence chart: incandescent vs LED</h2>
        <table>
          <thead><tr><th>Incandescent</th><th>Lumens</th><th>Equivalent LED (≈ 95 lm/W)</th></tr></thead>
          <tbody>
            <tr><td>25 W</td><td>~250 lm</td><td>3 W</td></tr>
            <tr><td>40 W</td><td>~450 lm</td><td>5 W</td></tr>
            <tr><td>60 W</td><td>~800 lm</td><td>9 W</td></tr>
            <tr><td>75 W</td><td>~1,100 lm</td><td>12 W</td></tr>
            <tr><td>100 W</td><td>~1,600 lm</td><td>15–18 W</td></tr>
            <tr><td>150 W</td><td>~2,600 lm</td><td>24–28 W</td></tr>
          </tbody>
        </table>
        <h2 id="led">How many lumens each LED bulb gives</h2>
        <table>
          <thead><tr><th>LED</th><th>Typical lumens</th><th>Lights, at 150 lux (light walls)</th></tr></thead>
          <tbody>{{LED_TABLE}}</tbody>
        </table>
        <p>The last column shows how many m² each bulb alone would bring to 150 lux, a living-room level, losses included. For other rooms, use the <a href="{{HUB_URL}}">calculator</a>.</p>
        <h2 id="lumens-to-lux">From lumens to lux</h2>
        <p class="formula">lux ≈ lumens × CU × 0.8 ÷ area</p>
        <p>This is the lumen method. CU (coefficient of utilization) is the share of the light that reaches table height; the 0.8 covers LED depreciation and dust. In a 4 × 3 m (13 × 10 ft) room with a 2.7 m (9 ft) ceiling and light walls, CU is about 0.42, so roughly 0.34 of the lumens arrive; with dark walls, about 0.25. That is why two rooms of the same size with the same bulbs can look very different.</p>`,
      es: `
        <p>En la caja de una bombilla aparecen muchos números, pero solo tres importan para saber si la habitación quedará bien iluminada:</p>
        <ul>
          <li><strong>Lumen (lm)</strong>: cuánta luz <em>emite</em> la bombilla. Es el número para comparar bombillas.</li>
          <li><strong>Lux (lx)</strong>: cuánta luz <em>llega</em> a una superficie, por metro cuadrado (1 lux = 1 lumen por m²). Es lo que usan las recomendaciones por habitación.</li>
          <li><strong>Vatio (W)</strong>: cuánta energía <em>consume</em> la bombilla. Con LED, los vatios dicen poco sobre la luz, porque la eficiencia varía.</li>
        </ul>
        <p>Una forma de recordarlo: los lúmenes son el agua que sale de la ducha, los lux son cuánta agua cae en cada baldosa, y los vatios son la factura.</p>
        <h2 id="equivalencias">Tabla de equivalencias: incandescente vs LED</h2>
        <table>
          <thead><tr><th>Incandescente</th><th>Lúmenes</th><th>LED equivalente (≈ 95 lm/W)</th></tr></thead>
          <tbody>
            <tr><td>25 W</td><td>~250 lm</td><td>3 W</td></tr>
            <tr><td>40 W</td><td>~450 lm</td><td>5 W</td></tr>
            <tr><td>60 W</td><td>~800 lm</td><td>9 W</td></tr>
            <tr><td>75 W</td><td>~1.100 lm</td><td>12 W</td></tr>
            <tr><td>100 W</td><td>~1.600 lm</td><td>15–18 W</td></tr>
            <tr><td>150 W</td><td>~2.600 lm</td><td>24–28 W</td></tr>
          </tbody>
        </table>
        <h2 id="led">Cuántos lúmenes da cada bombilla LED</h2>
        <table>
          <thead><tr><th>LED</th><th>Lúmenes típicos</th><th>Ilumina, a 150 lux (paredes claras)</th></tr></thead>
          <tbody>{{LED_TABLE}}</tbody>
        </table>
        <p>La última columna muestra cuántos m² dejaría cada bombilla sola a 150 lux, el nivel de una sala de estar, con las pérdidas incluidas. Para otras habitaciones, usa la <a href="{{HUB_URL}}">calculadora</a>.</p>
        <h2 id="de-lumenes-a-lux">De lúmenes a lux</h2>
        <p class="formula">lux ≈ lúmenes × CU × 0,8 ÷ superficie</p>
        <p>Es el método de los lúmenes. El CU (factor de utilización) es la parte de la luz que llega a la altura de una mesa; el 0,8 compensa la pérdida de brillo del LED y el polvo. En una habitación de 4 × 3 m con techo de 2,7 m y paredes claras, el CU ronda 0,42, así que llega cerca de 0,34 de los lúmenes; con paredes oscuras, unos 0,25. Por eso dos salas del mismo tamaño, con las mismas bombillas, pueden verse muy distintas.</p>`,
    },
    faq: {
      pt: [
        ['Quantos lúmens tem uma lâmpada LED de 9 W?', 'Cerca de 800 a 900 lúmens, o equivalente a uma incandescente de 60 W. O valor exato está na embalagem e varia entre marcas.'],
        ['Mais watts é sempre mais luz?', 'Só dentro da mesma tecnologia e marca. Uma LED de 12 W eficiente pode dar mais luz que outra de 15 W. Compare sempre pelos lúmens.'],
      ],
      en: [
        ['How many lumens is a 9 W LED bulb?', 'About 800 to 900 lumens, equivalent to a 60 W incandescent. The exact value is on the box and varies by brand.'],
        ['Are more watts always more light?', 'Only within the same technology and brand. An efficient 12 W LED can give more light than another 15 W one. Always compare by lumens.'],
      ],
      es: [
        ['¿Cuántos lúmenes tiene una bombilla LED de 9 W?', 'Unos 800 a 900 lúmenes, el equivalente a una incandescente de 60 W. El valor exacto está en la caja y varía según la marca.'],
        ['¿Más vatios siempre es más luz?', 'Solo dentro de la misma tecnología y marca. Un LED de 12 W eficiente puede dar más luz que otro de 15 W. Compara siempre por lúmenes.'],
      ],
    },
  },
];
