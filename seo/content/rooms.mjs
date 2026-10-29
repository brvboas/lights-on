/**
 * Room-by-room lighting data and copy for the static SEO pages.
 * The lux values live in src/utils/illuminance.js (ROOM_LUX), shared with the 3D simulator.
 *
 * Lux ranges are typical comfort recommendations for homes, based on the former Brazilian
 * NBR 5413 (which had residential values), ISO 8995-1 / EN 12464-1 (offices, circulation
 * areas) and IES residential guidance. Workplace standards don't regulate homes, so the
 * pages present these as references, not rules.
 *
 *   lux     – general (ambient) illuminance range for the whole room
 *   target  – value used for the "quick answer" and the size table
 *   task    – range on the spot where you do something (desk, counter, mirror…)
 *   kelvin  – suggested color temperature range
 *   size    – typical room (width × length, m) used in the quick answer
 *   areas   – floor areas listed in the size table (m²)
 */
import { ROOM_LUX } from '../../src/utils/illuminance.js';

export const ROOMS = [
  {
    id: 'living',
    ...ROOM_LUX.living,
    kelvin: [2700, 3000],
    size: [4, 3.5],
    areas: [9, 12, 16, 20, 25, 30],
    slug: { pt: 'quantos-lumens-para-sala', en: 'how-many-lumens-for-living-room', es: 'cuantos-lumenes-para-sala' },
    name: { pt: 'sala de estar', en: 'living room', es: 'sala de estar' },
    Name: { pt: 'Sala de estar', en: 'Living room', es: 'Sala de estar' },
    title: {
      pt: 'Quantos lúmens e lux para sala de estar? Tabela + calculadora',
      en: 'How Many Lumens for a Living Room? Lux Chart + Calculator',
      es: '¿Cuántos lúmenes para una sala de estar? Tabla + calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa uma sala de estar?',
      en: 'How many lumens does a living room need?',
      es: '¿Cuántos lúmenes y lux necesita una sala de estar?',
    },
    task_label: {
      pt: 'Leitura no sofá ou poltrona',
      en: 'Reading on the sofa or armchair',
      es: 'Lectura en el sofá o sillón',
    },
    intro: {
      pt: 'A sala de estar é o cômodo que mais muda de função: recebe visita, vira cinema, vira canto de leitura. Por isso, em vez de uma única lâmpada forte no centro, ela fica melhor com uma luz geral moderada e pontos extras onde você senta para ler.',
      en: 'The living room changes roles more than any other room: it hosts guests, turns into a home theater, becomes a reading corner. That is why it works better with moderate general light plus extra points where you sit and read, instead of one strong bulb in the middle of the ceiling.',
      es: 'La sala de estar es la habitación que más cambia de función: recibe visitas, se convierte en cine, en rincón de lectura. Por eso funciona mejor con una luz general moderada y puntos extra donde te sientas a leer, en vez de una sola bombilla potente en el centro del techo.',
    },
    tips: {
      pt: [
        'Divida a luz em camadas: plafon ou pendente para a luz geral, e abajur ou luminária de piso junto ao sofá para leitura.',
        'Use 2700K a 3000K. Luz amarelada deixa a sala acolhedora à noite; branco frio (6500K) dá cara de consultório.',
        'Coloque dimmer na luz principal: você instala lúmens de sobra para limpeza e visitas e baixa para ver TV.',
        'Evite luz refletindo na tela da TV. Prefira luz lateral ou indireta, como uma fita de LED atrás do painel.',
      ],
      en: [
        'Layer the light: a ceiling fixture or pendant for general light, and a table or floor lamp by the sofa for reading.',
        'Go for 2700K–3000K. Warm white makes the room cozy at night; cool white (6500K) feels like a clinic.',
        'Put the main light on a dimmer: you can install plenty of lumens for cleaning and guests and dim them for movies.',
        'Keep light from reflecting on the TV screen. Use side or indirect light, such as an LED strip behind the TV.',
      ],
      es: [
        'Divide la luz en capas: plafón o colgante para la luz general, y lámpara de mesa o de pie junto al sofá para leer.',
        'Usa 2700K a 3000K. La luz cálida hace la sala acogedora de noche; el blanco frío (6500K) la hace parecer una consulta médica.',
        'Pon un regulador (dimmer) en la luz principal: instalas lúmenes de sobra para limpiar o recibir y los bajas para ver la tele.',
        'Evita que la luz se refleje en la pantalla. Mejor luz lateral o indirecta, como una tira LED detrás del mueble de la tele.',
      ],
    },
    faq: {
      pt: [
        ['Uma lâmpada só no centro da sala é suficiente?', 'Numa sala pequena (até uns 10 m²) até ilumina, mas costuma deixar os cantos escuros e faz sombra em quem está sentado. A partir disso, distribua a luz em dois ou três pontos: a mesma quantidade de lúmens espalhada ilumina de forma mais uniforme e cansa menos a vista.'],
        ['Spot ou plafon na sala?', 'Plafon e pendente fazem a luz geral, espalhada. Spots direcionam a luz para um ponto (quadro, estante, mesa lateral) e criam contraste. O mais comum é combinar: um plafon ou pendente para o geral e alguns spots ou luminárias de apoio.'],
      ],
      en: [
        ['Is one light in the center of the living room enough?', 'In a small room (up to about 10 m² / 110 sq ft) it can work, but it usually leaves the corners dark and casts shadows on whoever is sitting. Beyond that, spread the light over two or three points: the same lumens spread out light the room more evenly and are easier on the eyes.'],
        ['Spotlights or a ceiling fixture in the living room?', 'Ceiling fixtures and pendants give general, diffuse light. Spotlights aim light at one place (a painting, a bookshelf, a side table) and add contrast. The usual answer is both: one fixture for general light plus a few spots or lamps for accents.'],
      ],
      es: [
        ['¿Basta con una sola luz en el centro de la sala?', 'En una sala pequeña (hasta unos 10 m²) puede bastar, pero suele dejar las esquinas oscuras y hace sombra a quien está sentado. A partir de ahí, reparte la luz en dos o tres puntos: los mismos lúmenes repartidos iluminan de forma más uniforme y cansan menos la vista.'],
        ['¿Focos o plafón en la sala?', 'El plafón y el colgante dan luz general, difusa. Los focos dirigen la luz a un punto (un cuadro, una estantería, una mesa auxiliar) y crean contraste. Lo más habitual es combinarlos: un plafón o colgante para lo general y algunos focos o lámparas de apoyo.'],
      ],
    },
  },
  {
    id: 'bedroom',
    ...ROOM_LUX.bedroom,
    kelvin: [2700, 3000],
    size: [3.5, 3],
    areas: [8, 10, 12, 15, 20],
    slug: { pt: 'quantos-lumens-para-quarto', en: 'how-many-lumens-for-bedroom', es: 'cuantos-lumenes-para-dormitorio' },
    name: { pt: 'quarto', en: 'bedroom', es: 'dormitorio' },
    Name: { pt: 'Quarto', en: 'Bedroom', es: 'Dormitorio' },
    title: {
      pt: 'Quantos lúmens e lux para quarto? Tabela por m² + calculadora',
      en: 'How Many Lumens for a Bedroom? Lux Chart by Size + Calculator',
      es: '¿Cuántos lúmenes para un dormitorio? Tabla por m² + calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa um quarto?',
      en: 'How many lumens does a bedroom need?',
      es: '¿Cuántos lúmenes y lux necesita un dormitorio?',
    },
    task_label: {
      pt: 'Leitura na cama, espelho e guarda-roupa',
      en: 'Reading in bed, mirror and wardrobe',
      es: 'Lectura en la cama, espejo y armario',
    },
    intro: {
      pt: 'No quarto a luz precisa fazer duas coisas opostas: ajudar a se vestir e arrumar as coisas, e não atrapalhar o sono. Por isso a luz geral pode ser mais baixa que na sala, e a luz de leitura fica perto da cama, num ponto que não ofusque quem está deitado.',
      en: 'Bedroom lighting has two opposite jobs: helping you get dressed and tidy up, and not getting in the way of sleep. That is why the general light can be lower than in the living room, with reading light close to the bed, placed where it does not glare at whoever is lying down.',
      es: 'En el dormitorio la luz tiene dos tareas opuestas: ayudarte a vestirte y ordenar, y no estorbar el sueño. Por eso la luz general puede ser más baja que en la sala, y la luz de lectura va cerca de la cama, en un punto que no deslumbre a quien está acostado.',
    },
    tips: {
      pt: [
        'Prefira 2700K (branco quente). Luz fria e forte à noite atrapalha a sensação de sono.',
        'Tenha um interruptor ou luminária ao alcance da cama, para não levantar no escuro.',
        'Evite luminária bem em cima do travesseiro: deitado, você olha direto para ela. Desloque o ponto para o pé da cama ou use luz indireta.',
        'Na frente do guarda-roupa ou do espelho, reforce para 300 lux ou mais para enxergar as cores das roupas.',
      ],
      en: [
        'Pick 2700K (warm white). Bright cool light at night works against feeling sleepy.',
        'Keep a switch or lamp within reach of the bed so you never get up in the dark.',
        'Avoid a fixture right above the pillow: lying down, you stare straight into it. Move it toward the foot of the bed or use indirect light.',
        'In front of the wardrobe or mirror, boost to 300 lux or more to see clothing colors properly.',
      ],
      es: [
        'Elige 2700K (blanco cálido). La luz fría e intensa de noche juega en contra del sueño.',
        'Ten un interruptor o una lámpara al alcance de la cama para no levantarte a oscuras.',
        'Evita una luminaria justo encima de la almohada: acostado, la miras de frente. Desplázala hacia los pies de la cama o usa luz indirecta.',
        'Frente al armario o al espejo, refuerza hasta 300 lux o más para ver bien los colores de la ropa.',
      ],
    },
    faq: {
      pt: [
        ['Qual a melhor cor de luz para o quarto?', 'Branco quente, entre 2700K e 3000K, que é mais confortável à noite. Se o quarto também é lugar de estudo, use uma luminária de mesa de 4000K só na escrivaninha.'],
        ['Pode usar fita de LED no quarto?', 'Pode, como luz decorativa ou indireta (atrás da cabeceira, sob a cama). Ela costuma ter poucos lúmens por metro, então raramente substitui a luz principal; some na conta só se o fabricante informar os lúmens.'],
      ],
      en: [
        ['What is the best light color for a bedroom?', 'Warm white, between 2700K and 3000K, which is more comfortable at night. If the bedroom is also where you study, add a 4000K desk lamp just for the desk.'],
        ['Can I use LED strips in the bedroom?', 'Yes, as decorative or indirect light (behind the headboard, under the bed). Strips usually have few lumens per meter, so they rarely replace the main light; only count them if the manufacturer lists their lumens.'],
      ],
      es: [
        ['¿Cuál es el mejor color de luz para el dormitorio?', 'Blanco cálido, entre 2700K y 3000K, que es más cómodo de noche. Si el dormitorio también es lugar de estudio, usa una lámpara de escritorio de 4000K solo para la mesa.'],
        ['¿Se puede usar tira LED en el dormitorio?', 'Sí, como luz decorativa o indirecta (detrás del cabecero, bajo la cama). Suelen tener pocos lúmenes por metro, así que rara vez sustituyen la luz principal; súmalas solo si el fabricante indica sus lúmenes.'],
      ],
    },
  },
  {
    id: 'kitchen',
    ...ROOM_LUX.kitchen,
    kelvin: [3000, 4000],
    size: [3, 3],
    areas: [6, 9, 12, 15, 20],
    slug: { pt: 'quantos-lumens-para-cozinha', en: 'how-many-lumens-for-kitchen', es: 'cuantos-lumenes-para-cocina' },
    name: { pt: 'cozinha', en: 'kitchen', es: 'cocina' },
    Name: { pt: 'Cozinha', en: 'Kitchen', es: 'Cocina' },
    title: {
      pt: 'Quantos lúmens e lux para cozinha? Bancada, tabela e calculadora',
      en: 'How Many Lumens for a Kitchen? Counter Lux, Chart + Calculator',
      es: '¿Cuántos lúmenes para una cocina? Encimera, tabla y calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa uma cozinha?',
      en: 'How many lumens does a kitchen need?',
      es: '¿Cuántos lúmenes y lux necesita una cocina?',
    },
    task_label: {
      pt: 'Bancada, pia e fogão',
      en: 'Countertop, sink and stove',
      es: 'Encimera, fregadero y fogones',
    },
    intro: {
      pt: 'Cozinha é lugar de faca, fogo e água quente, então é onde a luz mais faz diferença para a segurança. O erro mais comum é ter só uma luz central: na bancada, o próprio corpo faz sombra justo onde você está cortando.',
      en: 'The kitchen is where knives, fire and hot water meet, so it is where good light matters most for safety. The most common mistake is a single central light: at the counter, your own body casts a shadow right where you are cutting.',
      es: 'La cocina es lugar de cuchillos, fuego y agua caliente, así que es donde la luz más importa para la seguridad. El error más común es tener solo una luz central: en la encimera, tu propio cuerpo hace sombra justo donde estás cortando.',
    },
    tips: {
      pt: [
        'Ilumine a bancada separadamente: fita ou perfil de LED embaixo do armário aéreo acaba com a sombra do corpo.',
        'Use 3000K a 4000K. 4000K mostra as cores dos alimentos com mais fidelidade; 3000K combina melhor com cozinhas integradas à sala.',
        'Perto do fogão, prefira luminárias fechadas e fáceis de limpar, por causa da gordura.',
        'Em cozinha integrada, separe os circuitos: luz forte de trabalho e luz mais baixa para quando ela vira parte da sala.',
      ],
      en: [
        'Light the counter separately: an LED strip or profile under the wall cabinets removes the body shadow.',
        'Use 3000K–4000K. 4000K shows food colors more faithfully; 3000K blends better with open-plan kitchens.',
        'Near the stove, choose closed fixtures that are easy to clean, because of grease.',
        'In an open kitchen, split the circuits: bright task light, and a softer light for when the kitchen becomes part of the living area.',
      ],
      es: [
        'Ilumina la encimera aparte: una tira o perfil LED bajo los muebles altos elimina la sombra del cuerpo.',
        'Usa 3000K a 4000K. 4000K muestra los colores de los alimentos con más fidelidad; 3000K encaja mejor en cocinas abiertas al salón.',
        'Cerca de los fogones, elige luminarias cerradas y fáciles de limpiar, por la grasa.',
        'En una cocina abierta, separa los circuitos: luz intensa de trabajo y una más suave para cuando la cocina pasa a ser parte del salón.',
      ],
    },
    faq: {
      pt: [
        ['Quantos lux na bancada da cozinha?', 'Entre 300 e 500 lux na superfície de trabalho. Para chegar lá sem exagerar na luz geral, use uma fonte de luz dedicada sobre ou sob o armário, perto da bancada.'],
        ['Luz branca ou amarela na cozinha?', 'Branco neutro (4000K) é o mais usado, porque mostra bem as cores dos alimentos. Se a cozinha é aberta para a sala, 3000K combina melhor com o resto da casa.'],
      ],
      en: [
        ['How many lux on a kitchen counter?', 'Between 300 and 500 lux on the work surface. To get there without overdoing the general light, add a dedicated light source above or under the cabinets, close to the counter.'],
        ['Warm or cool light in the kitchen?', 'Neutral white (4000K) is the most common choice because it shows food colors well. If the kitchen opens to the living room, 3000K matches the rest of the home better.'],
      ],
      es: [
        ['¿Cuántos lux en la encimera de la cocina?', 'Entre 300 y 500 lux en la superficie de trabajo. Para llegar sin exagerar la luz general, usa una fuente de luz dedicada sobre o bajo los muebles altos, cerca de la encimera.'],
        ['¿Luz blanca o cálida en la cocina?', 'El blanco neutro (4000K) es el más usado porque muestra bien los colores de los alimentos. Si la cocina está abierta al salón, 3000K combina mejor con el resto de la casa.'],
      ],
    },
  },
  {
    id: 'bathroom',
    ...ROOM_LUX.bathroom,
    kelvin: [3000, 4000],
    size: [2.5, 2],
    areas: [3, 4, 5, 6, 8],
    slug: { pt: 'quantos-lumens-para-banheiro', en: 'how-many-lumens-for-bathroom', es: 'cuantos-lumenes-para-bano' },
    name: { pt: 'banheiro', en: 'bathroom', es: 'baño' },
    Name: { pt: 'Banheiro', en: 'Bathroom', es: 'Baño' },
    title: {
      pt: 'Quantos lúmens e lux para banheiro? Espelho, tabela e calculadora',
      en: 'How Many Lumens for a Bathroom? Mirror Lux, Chart + Calculator',
      es: '¿Cuántos lúmenes para un baño? Espejo, tabla y calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa um banheiro?',
      en: 'How many lumens does a bathroom need?',
      es: '¿Cuántos lúmenes y lux necesita un baño?',
    },
    task_label: {
      pt: 'Espelho e pia',
      en: 'Mirror and vanity',
      es: 'Espejo y lavabo',
    },
    intro: {
      pt: 'O banheiro é pequeno, mas exige bastante luz no lugar certo: o espelho. Uma luz só no teto, atrás de você, deixa o rosto na sombra justamente na hora de fazer a barba ou se maquiar.',
      en: 'Bathrooms are small but need plenty of light in the right spot: the mirror. A single ceiling light behind you leaves your face in shadow exactly when you are shaving or putting on makeup.',
      es: 'El baño es pequeño, pero necesita bastante luz en el lugar correcto: el espejo. Una sola luz en el techo, detrás de ti, deja la cara en sombra justo cuando te afeitas o te maquillas.',
    },
    tips: {
      pt: [
        'Ilumine o rosto de frente ou pelos lados do espelho, e não só de cima: luz de cima faz sombra embaixo dos olhos.',
        'Perto do chuveiro, use luminárias próprias para área úmida (grau de proteção IP44 ou maior).',
        'Use 3000K a 4000K com bom índice de reprodução de cor (IRC 80 ou mais; 90 é melhor para maquiagem).',
        'Revestimento escuro absorve muita luz: nesse caso, fique no alto da faixa.',
      ],
      en: [
        'Light your face from the front or the sides of the mirror, not only from above: overhead light casts shadows under the eyes.',
        'Near the shower, use fixtures rated for damp areas (IP44 or higher).',
        'Use 3000K–4000K with a good color rendering index (CRI 80 or more; 90 is better for makeup).',
        'Dark tiles absorb a lot of light: in that case, aim for the top of the range.',
      ],
      es: [
        'Ilumina la cara de frente o por los lados del espejo, no solo desde arriba: la luz cenital hace sombra bajo los ojos.',
        'Cerca de la ducha, usa luminarias aptas para zonas húmedas (grado de protección IP44 o superior).',
        'Usa 3000K a 4000K con buen índice de reproducción cromática (IRC 80 o más; 90 es mejor para maquillarse).',
        'Los revestimientos oscuros absorben mucha luz: en ese caso, apunta a la parte alta del rango.',
      ],
    },
    faq: {
      pt: [
        ['Quantos lúmens para iluminar o espelho do banheiro?', 'Para chegar a 300–500 lux no rosto, conte com algo entre 800 e 1.600 lúmens só na luz do espelho, dividida dos dois lados ou numa barra logo acima dele, voltada para a frente.'],
        ['Qual lâmpada usar no banheiro?', 'LED de 3000K a 4000K, com IRC 80 ou mais. Perto do chuveiro, a luminária precisa ser própria para umidade (IP44 ou superior).'],
      ],
      en: [
        ['How many lumens for a bathroom mirror?', 'To reach 300–500 lux on your face, plan on roughly 800 to 1,600 lumens for the mirror light alone, split between both sides or in a bar right above it, facing forward.'],
        ['What bulb should I use in a bathroom?', 'LED at 3000K–4000K with CRI 80 or higher. Near the shower, the fixture must be rated for damp areas (IP44 or higher).'],
      ],
      es: [
        ['¿Cuántos lúmenes para iluminar el espejo del baño?', 'Para llegar a 300–500 lux en la cara, cuenta con unos 800 a 1.600 lúmenes solo para la luz del espejo, repartidos a ambos lados o en una barra justo encima, orientada hacia delante.'],
        ['¿Qué bombilla usar en el baño?', 'LED de 3000K a 4000K, con IRC 80 o más. Cerca de la ducha, la luminaria debe ser apta para humedad (IP44 o superior).'],
      ],
    },
  },
  {
    id: 'office',
    ...ROOM_LUX.office,
    kelvin: [4000, 4000],
    size: [3, 3],
    areas: [6, 9, 12, 15],
    slug: { pt: 'quantos-lumens-para-home-office', en: 'how-many-lumens-for-home-office', es: 'cuantos-lumenes-para-oficina-en-casa' },
    name: { pt: 'home office', en: 'home office', es: 'oficina en casa' },
    Name: { pt: 'Home office', en: 'Home office', es: 'Oficina en casa' },
    title: {
      pt: 'Quantos lúmens e lux para home office e estudo? Tabela + calculadora',
      en: 'How Many Lumens for a Home Office? Desk Lux, Chart + Calculator',
      es: '¿Cuántos lúmenes para una oficina en casa? Lux en el escritorio + calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa um home office?',
      en: 'How many lumens does a home office need?',
      es: '¿Cuántos lúmenes y lux necesita una oficina en casa?',
    },
    task_label: {
      pt: 'Mesa de trabalho ou estudo',
      en: 'Desk (work or study)',
      es: 'Escritorio (trabajo o estudio)',
    },
    intro: {
      pt: 'No home office você passa horas lendo e olhando para a tela, então aqui vale a referência das normas de escritório: cerca de 500 lux na mesa. A luz geral pode ser um pouco mais baixa, desde que a mesa tenha reforço.',
      en: 'In a home office you spend hours reading and looking at a screen, so office standards are the right reference here: about 500 lux on the desk. The general light can be somewhat lower, as long as the desk gets extra light.',
      es: 'En la oficina en casa pasas horas leyendo y mirando la pantalla, así que aquí vale la referencia de las normas de oficina: unos 500 lux en el escritorio. La luz general puede ser algo más baja, siempre que el escritorio tenga refuerzo.',
    },
    tips: {
      pt: [
        'Use 4000K (branco neutro): ajuda na concentração sem a frieza de 6500K.',
        'Posicione a luz ao lado ou à frente da mesa, nunca atrás de você: atrás, ela reflete na tela.',
        'Uma luminária de mesa articulada garante os 500 lux na área de trabalho sem gastar tanto na luz geral.',
        'Para videochamadas, uma luz suave à frente do rosto (ou uma janela à frente) funciona melhor que um spot de cima.',
      ],
      en: [
        'Use 4000K (neutral white): it helps focus without the harshness of 6500K.',
        'Place lights beside or in front of the desk, never behind you: from behind, they reflect on the screen.',
        'An adjustable desk lamp delivers 500 lux on the work area without overspending on general light.',
        'For video calls, soft light in front of your face (or a window in front of you) works better than an overhead spot.',
      ],
      es: [
        'Usa 4000K (blanco neutro): ayuda a concentrarse sin la frialdad de 6500K.',
        'Coloca la luz al lado o delante del escritorio, nunca detrás de ti: desde atrás se refleja en la pantalla.',
        'Un flexo o lámpara articulada asegura los 500 lux en la zona de trabajo sin gastar tanto en luz general.',
        'Para videollamadas, una luz suave delante de la cara (o una ventana delante) funciona mejor que un foco desde arriba.',
      ],
    },
    faq: {
      pt: [
        ['Quantos lux para estudar ou trabalhar em casa?', 'Cerca de 500 lux na mesa, que é o valor das normas de escritório (ISO 8995-1 / EN 12464-1) para ler, escrever e usar computador. No resto do cômodo, 300 lux já é confortável.'],
        ['Luz fria é melhor para estudar?', 'Não precisa ser fria. 4000K já é neutra e boa para concentração; 6500K pode cansar em uso longo, principalmente à noite.'],
      ],
      en: [
        ['How many lux for studying or working from home?', 'About 500 lux on the desk, the value office standards (ISO 8995-1 / EN 12464-1) set for reading, writing and computer work. Around 300 lux is comfortable for the rest of the room.'],
        ['Is cool white light better for studying?', 'It does not need to be cool. 4000K is already neutral and good for focus; 6500K can get tiring over long sessions, especially at night.'],
      ],
      es: [
        ['¿Cuántos lux para estudiar o trabajar en casa?', 'Unos 500 lux en el escritorio, el valor que fijan las normas de oficina (ISO 8995-1 / EN 12464-1) para leer, escribir y usar el ordenador. En el resto de la habitación, 300 lux ya son cómodos.'],
        ['¿La luz fría es mejor para estudiar?', 'No hace falta que sea fría. 4000K ya es neutra y buena para concentrarse; 6500K puede cansar en sesiones largas, sobre todo de noche.'],
      ],
    },
  },
  {
    id: 'dining',
    ...ROOM_LUX.dining,
    kelvin: [2700, 3000],
    size: [3.5, 3],
    areas: [8, 10, 12, 16, 20],
    slug: { pt: 'quantos-lumens-para-sala-de-jantar', en: 'how-many-lumens-for-dining-room', es: 'cuantos-lumenes-para-comedor' },
    name: { pt: 'sala de jantar', en: 'dining room', es: 'comedor' },
    Name: { pt: 'Sala de jantar', en: 'Dining room', es: 'Comedor' },
    title: {
      pt: 'Quantos lúmens para sala de jantar? Pendente, lux e calculadora',
      en: 'How Many Lumens for a Dining Room? Pendant Height, Lux + Calculator',
      es: '¿Cuántos lúmenes para un comedor? Colgante, lux y calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa uma sala de jantar?',
      en: 'How many lumens does a dining room need?',
      es: '¿Cuántos lúmenes y lux necesita un comedor?',
    },
    task_label: {
      pt: 'Tampo da mesa',
      en: 'Table top',
      es: 'Superficie de la mesa',
    },
    intro: {
      pt: 'Na sala de jantar a estrela é a mesa. A luz geral pode ser suave; o que importa é um pendente ou luminária bem centrado sobre o tampo, na altura certa para não ofuscar quem está sentado.',
      en: 'In the dining room the table is the star. General light can be soft; what matters is a pendant or fixture centered over the table, hung at the right height so it does not glare at anyone seated.',
      es: 'En el comedor la protagonista es la mesa. La luz general puede ser suave; lo importante es un colgante o luminaria bien centrado sobre la mesa, a la altura justa para no deslumbrar a quien está sentado.',
    },
    tips: {
      pt: [
        'Pendente a cerca de 70–80 cm do tampo: mais alto ofusca, mais baixo atrapalha a visão de quem está do outro lado.',
        'Em mesas compridas, use dois ou três pendentes menores alinhados em vez de um só.',
        '2700K deixa a comida com aparência mais apetitosa e o clima mais acolhedor.',
        'Dimmer aqui faz muita diferença: luz forte para jogos ou lição de casa, baixa para o jantar.',
      ],
      en: [
        'Hang the pendant about 70–80 cm (28–32 in) above the table: higher glares, lower blocks the view across the table.',
        'For long tables, use two or three smaller pendants in a row instead of one.',
        '2700K makes food look more appetizing and the mood warmer.',
        'A dimmer makes a big difference here: bright for board games or homework, low for dinner.',
      ],
      es: [
        'Cuelga el colgante a unos 70–80 cm de la mesa: más alto deslumbra, más bajo tapa la vista de quien está enfrente.',
        'En mesas largas, usa dos o tres colgantes más pequeños en fila en lugar de uno solo.',
        '2700K hace que la comida se vea más apetitosa y el ambiente más acogedor.',
        'Un regulador marca la diferencia: luz intensa para juegos o deberes, baja para la cena.',
      ],
    },
    faq: {
      pt: [
        ['Qual a altura do pendente sobre a mesa de jantar?', 'Em geral, de 70 a 80 cm entre o tampo e a parte de baixo da luminária. Ajuste para que ninguém sentado veja a lâmpada diretamente.'],
        ['Quantos lúmens no pendente da mesa?', 'Para uma mesa de 4 a 6 lugares, algo entre 800 e 1.500 lúmens no pendente costuma bastar, com a luz geral do ambiente complementando.'],
      ],
      en: [
        ['How high should a pendant hang over a dining table?', 'Usually 70 to 80 cm (28 to 32 in) between the table top and the bottom of the fixture. Adjust so nobody seated sees the bulb directly.'],
        ['How many lumens for a dining table pendant?', 'For a 4- to 6-seat table, roughly 800 to 1,500 lumens in the pendant is usually enough, with the room’s general light filling in.'],
      ],
      es: [
        ['¿A qué altura colgar la lámpara sobre la mesa del comedor?', 'Normalmente entre 70 y 80 cm desde la mesa hasta la parte baja de la luminaria. Ajústala para que nadie sentado vea la bombilla directamente.'],
        ['¿Cuántos lúmenes para el colgante de la mesa?', 'Para una mesa de 4 a 6 personas, entre 800 y 1.500 lúmenes en el colgante suelen bastar, con la luz general de la habitación como complemento.'],
      ],
    },
  },
  {
    id: 'hallway',
    ...ROOM_LUX.hallway,
    kelvin: [2700, 3000],
    size: [4, 1.2],
    areas: [3, 5, 8, 10],
    slug: { pt: 'quantos-lumens-para-corredor', en: 'how-many-lumens-for-hallway', es: 'cuantos-lumenes-para-pasillo' },
    name: { pt: 'corredor', en: 'hallway', es: 'pasillo' },
    Name: { pt: 'Corredor e hall', en: 'Hallway', es: 'Pasillo y recibidor' },
    title: {
      pt: 'Quantos lúmens e lux para corredor e hall? Tabela + calculadora',
      en: 'How Many Lumens for a Hallway? Lux Chart + Calculator',
      es: '¿Cuántos lúmenes para un pasillo? Tabla de lux + calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa um corredor?',
      en: 'How many lumens does a hallway need?',
      es: '¿Cuántos lúmenes y lux necesita un pasillo?',
    },
    task_label: {
      pt: 'Escadas e degraus',
      en: 'Stairs and steps',
      es: 'Escaleras y peldaños',
    },
    intro: {
      pt: 'Corredores e halls não são lugar de leitura, então pedem pouca luz: por volta de 100 lux, o valor das normas para áreas de circulação. O que importa é a uniformidade, sem trechos escuros nem um ponto de luz que ofusca no meio do caminho.',
      en: 'Hallways are not reading spaces, so they need little light: around 100 lux, the value standards set for circulation areas. What matters is evenness, with no dark stretches and no single glaring light halfway down.',
      es: 'Pasillos y recibidores no son lugares de lectura, así que piden poca luz: unos 100 lux, el valor de las normas para zonas de paso. Lo que importa es la uniformidad, sin tramos oscuros ni un punto de luz que deslumbre a mitad de camino.',
    },
    tips: {
      pt: [
        'Em corredores longos, distribua pontos a cada 1,5–2 m em vez de uma lâmpada forte no meio.',
        'Use o mesmo tom de luz (Kelvin) dos cômodos vizinhos, para não ter mudança brusca de cor ao passar.',
        'Sensor de presença ou balizadores baixos ajudam à noite, sem acender tudo.',
        'Em escadas, ilumine os degraus (balizadores laterais ou fita sob o degrau) para enxergar a borda.',
      ],
      en: [
        'In long hallways, place lights every 1.5–2 m (5–6.5 ft) rather than one strong bulb in the middle.',
        'Match the color temperature (Kelvin) of the adjoining rooms, so the color does not jump as you walk through.',
        'Motion sensors or low step lights help at night without turning everything on.',
        'On stairs, light the treads (side step lights or a strip under each step) so the edges are visible.',
      ],
      es: [
        'En pasillos largos, reparte puntos de luz cada 1,5–2 m en lugar de una bombilla potente en el medio.',
        'Usa la misma temperatura de color (Kelvin) que las habitaciones vecinas, para que el color no cambie de golpe al pasar.',
        'Un sensor de movimiento o balizas bajas ayudan de noche sin encender todo.',
        'En escaleras, ilumina los peldaños (balizas laterales o tira bajo cada escalón) para ver el borde.',
      ],
    },
    faq: {
      pt: [
        ['Quantos lux para corredor?', 'Cerca de 100 lux, que é o valor de referência para áreas de circulação na ISO 8995-1. Em escadas, mire em 150 lux nos degraus.'],
        ['Quantos spots colocar no corredor?', 'Um a cada 1,5 a 2 metros costuma dar uma luz uniforme. Spots de 5 a 7 W de LED bastam na maioria dos corredores residenciais.'],
      ],
      en: [
        ['How many lux for a hallway?', 'About 100 lux, the reference value for circulation areas in ISO 8995-1. On stairs, aim for 150 lux on the steps.'],
        ['How many spotlights in a hallway?', 'One every 1.5 to 2 meters (5 to 6.5 ft) usually gives even light. 5–7 W LED spots are enough for most home hallways.'],
      ],
      es: [
        ['¿Cuántos lux para un pasillo?', 'Unos 100 lux, el valor de referencia para zonas de paso en la ISO 8995-1. En escaleras, apunta a 150 lux en los peldaños.'],
        ['¿Cuántos focos poner en el pasillo?', 'Uno cada 1,5 a 2 metros suele dar una luz uniforme. Focos LED de 5 a 7 W bastan en la mayoría de pasillos de vivienda.'],
      ],
    },
  },
  {
    id: 'laundry',
    ...ROOM_LUX.laundry,
    kelvin: [4000, 5000],
    size: [2.5, 2],
    areas: [3, 4, 5, 6, 8],
    slug: { pt: 'quantos-lumens-para-lavanderia', en: 'how-many-lumens-for-laundry-room', es: 'cuantos-lumenes-para-lavadero' },
    name: { pt: 'lavanderia', en: 'laundry room', es: 'lavadero' },
    Name: { pt: 'Lavanderia e área de serviço', en: 'Laundry room', es: 'Lavadero' },
    title: {
      pt: 'Quantos lúmens para lavanderia e área de serviço? Lux + calculadora',
      en: 'How Many Lumens for a Laundry Room? Lux Chart + Calculator',
      es: '¿Cuántos lúmenes para un lavadero? Tabla de lux + calculadora',
    },
    h1: {
      pt: 'Quantos lúmens e lux precisa uma lavanderia?',
      en: 'How many lumens does a laundry room need?',
      es: '¿Cuántos lúmenes y lux necesita un lavadero?',
    },
    task_label: {
      pt: 'Tanque e passar roupa',
      en: 'Sink and ironing',
      es: 'Pila y planchado',
    },
    intro: {
      pt: 'Na lavanderia ou área de serviço você precisa enxergar manchas e diferenciar cores de roupa. É um dos poucos lugares da casa onde luz mais branca (4000K a 5000K) faz sentido.',
      en: 'In the laundry room you need to spot stains and tell clothing colors apart. It is one of the few places in a home where whiter light (4000K–5000K) makes sense.',
      es: 'En el lavadero necesitas ver manchas y distinguir los colores de la ropa. Es uno de los pocos lugares de la casa donde una luz más blanca (4000K a 5000K) tiene sentido.',
    },
    tips: {
      pt: [
        'Use 4000K a 5000K e lâmpadas com IRC alto (80+) para ver cores e manchas.',
        'Coloque um ponto de luz sobre o tanque e outro onde você passa roupa, não só no centro.',
        'Luminárias fechadas e próprias para umidade duram mais perto do tanque e da máquina.',
        'Se a área de serviço é estreita, uma régua ou tubular de LED no comprimento ilumina melhor que um plafon redondo.',
      ],
      en: [
        'Use 4000K–5000K and high-CRI bulbs (80+) to see colors and stains.',
        'Put one light over the sink and another where you iron, not only in the center.',
        'Closed, damp-rated fixtures last longer near the sink and washing machine.',
        'In a narrow laundry area, a linear LED batten along its length works better than a round ceiling fixture.',
      ],
      es: [
        'Usa 4000K a 5000K y bombillas con IRC alto (80+) para ver colores y manchas.',
        'Pon un punto de luz sobre la pila y otro donde planchas, no solo en el centro.',
        'Las luminarias cerradas y aptas para humedad duran más cerca de la pila y la lavadora.',
        'Si el lavadero es estrecho, una regleta o tubo LED a lo largo ilumina mejor que un plafón redondo.',
      ],
    },
    faq: {
      pt: [
        ['Qual a melhor luz para área de serviço?', 'Branco neutro a frio, de 4000K a 5000K, com IRC 80 ou mais. Ela mostra melhor as manchas e as cores das roupas.'],
        ['Quantos lux para passar roupa?', 'Entre 300 e 500 lux na tábua ou mesa. Um ponto de luz dedicado sobre ela costuma resolver.'],
      ],
      en: [
        ['What is the best light for a laundry room?', 'Neutral to cool white, 4000K–5000K, with CRI 80 or higher. It shows stains and clothing colors best.'],
        ['How many lux for ironing?', 'Between 300 and 500 lux on the ironing board or table. A dedicated light above it usually does the job.'],
      ],
      es: [
        ['¿Cuál es la mejor luz para el lavadero?', 'Blanco neutro a frío, de 4000K a 5000K, con IRC 80 o más. Muestra mejor las manchas y los colores de la ropa.'],
        ['¿Cuántos lux para planchar?', 'Entre 300 y 500 lux sobre la tabla o la mesa. Un punto de luz dedicado encima suele bastar.'],
      ],
    },
  },
];
