// Lecce's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In order of how much you should not miss them.
export const SIGHTS = [
  {
    id: 'santa-croce', emoji: '⛪', x: 481.8, z: -117.8, r: 60,
    text: {
      nl: { name: 'Basilica di Santa Croce', text: 'Het hoogtepunt van de Leccese barok, gebouwd tussen 1549 en 1695. De gevel is bedekt met leeuwen, planten, mythische wezens en heiligen, allemaal gebeeldhouwd in zachte, honingkleurige Leccese kalksteen. Ernaast ligt het Palazzo dei Celestini, nu het stadsbestuur van de provincie.' },
      en: { name: 'Basilica di Santa Croce', text: 'The high point of Lecce Baroque, built between 1549 and 1695. Its façade is smothered in lions, plants, mythical beasts and saints, all carved in the soft, honey-coloured local limestone. Next door stands the Palazzo dei Celestini, now the provincial government’s seat.' },
      fr: { name: 'Basilique Santa Croce', text: 'Le sommet du baroque de Lecce, bâti entre 1549 et 1695. Sa façade déborde de lions, de plantes, de créatures fantastiques et de saints, tous sculptés dans la pierre calcaire locale, tendre et couleur de miel. À côté se dresse le Palazzo dei Celestini, aujourd’hui siège de la province.' },
      es: { name: 'Basílica de Santa Croce', text: 'La cumbre del barroco leccés, construida entre 1549 y 1695. Su fachada rebosa de leones, plantas, criaturas míticas y santos, todos tallados en la blanda piedra caliza local, de color miel. Al lado está el Palazzo dei Celestini, hoy sede del gobierno provincial.' },
    },
  },
  {
    id: 'piazza-duomo', emoji: '🔔', x: 67.1, z: 285.8, r: 80,
    text: {
      nl: { name: 'Piazza del Duomo', text: 'Een gesloten plein dat pas zichtbaar wordt als je er binnenstapt. De kathedraal werd in 1659 herbouwd door Giuseppe Zimbalo, en zijn campanile is 70 m hoog. Rond het plein staan ook het bisschoppelijk paleis en het seminarie, allemaal in dezelfde barokke steen.' },
      en: { name: 'Piazza del Duomo', text: 'An enclosed square that only reveals itself once you step inside. The cathedral was rebuilt in 1659 by Giuseppe Zimbalo, and its campanile is 70 m tall. The Bishop’s Palace and the Seminary stand around the square too, all in the same Baroque stone.' },
      fr: { name: 'Piazza del Duomo', text: 'Une place fermée qui ne se dévoile qu’une fois qu’on y entre. La cathédrale fut rebâtie en 1659 par Giuseppe Zimbalo, et son campanile mesure 70 m. Le palais épiscopal et le séminaire bordent aussi la place, tous dans la même pierre baroque.' },
      es: { name: 'Piazza del Duomo', text: 'Una plaza cerrada que solo se revela cuando entras en ella. La catedral fue reconstruida en 1659 por Giuseppe Zimbalo y su campanario mide 70 m. El Palacio Episcopal y el Seminario también rodean la plaza, todos en la misma piedra barroca.' },
    },
  },
  {
    id: 'sant-oronzo', emoji: '🏛️', x: 408.6, z: 140.7, r: 60,
    text: {
      nl: { name: 'Piazza Sant’Oronzo', text: 'Het hart van Lecce. Het Romeinse amfitheater uit de 2de eeuw ligt half onder het plein, en kon zo’n 25.000 toeschouwers kwijt. Op een van de zuilen uit Brindisi staat Sint-Oronzo, de beschermheilige van de stad. Vlakbij staat het Sedile, het oude stadhuis uit 1592.' },
      en: { name: 'Piazza Sant’Oronzo', text: 'The heart of Lecce. The 2nd-century Roman amphitheatre lies half sunk beneath the square and once held around 25,000 spectators. On a column that came from Brindisi stands Saint Oronzo, the city’s patron. Close by is the Sedile, the old town hall from 1592.' },
      fr: { name: 'Piazza Sant’Oronzo', text: 'Le cœur de Lecce. L’amphithéâtre romain du IIe siècle est à moitié enfoui sous la place et pouvait accueillir environ 25 000 spectateurs. Sur une colonne venue de Brindisi se dresse saint Oronce, patron de la ville. Tout près, le Sedile, l’ancien hôtel de ville de 1592.' },
      es: { name: 'Piazza Sant’Oronzo', text: 'El corazón de Lecce. El anfiteatro romano del siglo II está medio hundido bajo la plaza y tenía capacidad para unos 25.000 espectadores. Sobre una columna venida de Brindisi se alza san Oronzo, patrón de la ciudad. Cerca está el Sedile, el antiguo ayuntamiento de 1592.' },
    },
  },
  {
    id: 'castello-carlo-v', emoji: '🏰', x: 655.7, z: 187.7, r: 70,
    text: {
      nl: { name: 'Castello di Carlo V', text: 'Een kasteel met een vierkant grondplan en brede bastions, in de jaren 1530 herbouwd in opdracht van keizer Karel V om de stad tegen de Turken te beschermen. Het was ook een gevangenis en een kazerne. Tegenwoordig vind je er tentoonstellingen, en ook het papier-maché museum.' },
      en: { name: 'Charles V Castle', text: 'A castle with a square plan and broad bastions, rebuilt in the 1530s on the orders of Emperor Charles V to defend the city against the Turks. It has also been a prison and a barracks. Today it hosts exhibitions, and the papier-mâché museum.' },
      fr: { name: 'Château de Charles Quint', text: 'Un château à plan carré et larges bastions, reconstruit dans les années 1530 sur ordre de l’empereur Charles Quint pour défendre la ville contre les Turcs. Il fut aussi prison et caserne. Aujourd’hui, il accueille des expositions et le musée du papier mâché.' },
      es: { name: 'Castillo de Carlos V', text: 'Un castillo de planta cuadrada y anchos baluartes, reconstruido en la década de 1530 por orden del emperador Carlos V para defender la ciudad de los turcos. También fue cárcel y cuartel. Hoy acoge exposiciones y el museo de la cartapesta.' },
    },
  },
  {
    id: 'porta-napoli', emoji: '🚪', x: -14.5, z: -366.6, r: 45,
    text: {
      nl: { name: 'Porta Napoli', text: 'Een triomfboog uit 1548, gebouwd voor Karel V, en de grootste van de drie stadspoorten. Hij kijkt uit op de weg naar Napels, vandaar de naam. Op het plein ervoor staat een obelisk uit 1822, ter ere van koning Ferdinand I.' },
      en: { name: 'Porta Napoli', text: 'A triumphal arch from 1548, built for Charles V, and the grandest of the city’s three gates. It faces the road to Naples, hence the name. On the square in front stands an obelisk from 1822, in honour of King Ferdinand I.' },
      fr: { name: 'Porta Napoli', text: 'Un arc de triomphe de 1548, construit pour Charles Quint, la plus imposante des trois portes de la ville. Elle donne sur la route de Naples, d’où son nom. Sur la place devant elle se dresse un obélisque de 1822, en l’honneur du roi Ferdinand Ier.' },
      es: { name: 'Porta Napoli', text: 'Un arco de triunfo de 1548, levantado para Carlos V y la más grandiosa de las tres puertas de la ciudad. Mira hacia el camino de Nápoles, de ahí su nombre. En la plaza de delante hay un obelisco de 1822, en honor del rey Fernando I.' },
    },
  },
  {
    id: 'teatro-romano', emoji: '🎭', x: 194.4, z: 342.5, r: 35,
    text: {
      nl: { name: 'Teatro Romano', text: 'Een klein Romeins theater uit de tijd van keizer Augustus, pas in de jaren 1930 teruggevonden tussen de huizen. Het bood plaats aan zo’n 5.000 toeschouwers. Je ziet er nog het halfronde trappenstelsel en vloermozaïeken.' },
      en: { name: 'Roman Theatre', text: 'A small Roman theatre from the time of Emperor Augustus, only rediscovered in the 1930s among the houses. It held about 5,000 spectators. You can still see its semicircular tiers and floor mosaics.' },
      fr: { name: 'Théâtre romain', text: 'Un petit théâtre romain de l’époque de l’empereur Auguste, redécouvert seulement dans les années 1930 au milieu des maisons. Il pouvait accueillir environ 5 000 spectateurs. On y voit encore les gradins en demi-cercle et des mosaïques au sol.' },
      es: { name: 'Teatro Romano', text: 'Un pequeño teatro romano de la época del emperador Augusto, redescubierto solo en la década de 1930 entre las casas. Tenía capacidad para unos 5.000 espectadores. Aún se ven sus gradas semicirculares y mosaicos en el suelo.' },
    },
  },
  {
    id: 'porta-rudiae', emoji: '🚪', x: -436.6, z: 343.9, r: 40,
    text: {
      nl: { name: 'Porta Rudiae', text: 'De westelijke stadspoort, herbouwd in 1703 in barokke stijl. Ze is genoemd naar Rudiae, de oude stad van de dichter Ennius, even buiten Lecce. Boven de poort troont Sint-Oronzo, tussen Sint-Domenico en Sint-Irene.' },
      en: { name: 'Porta Rudiae', text: 'The city’s western gate, rebuilt in 1703 in Baroque style. It is named after Rudiae, the ancient town of the poet Ennius just outside Lecce. Above the gateway sits Saint Oronzo, flanked by Saint Domenico and Saint Irene.' },
      fr: { name: 'Porta Rudiae', text: 'La porte occidentale de la ville, reconstruite en 1703 dans le style baroque. Elle porte le nom de Rudiae, l’antique cité du poète Ennius, tout près de Lecce. Au-dessus de l’arche, saint Oronce trône entre saint Dominique et sainte Irène.' },
      es: { name: 'Porta Rudiae', text: 'La puerta occidental de la ciudad, reconstruida en 1703 en estilo barroco. Lleva el nombre de Rudiae, la antigua ciudad del poeta Ennio, cerca de Lecce. Sobre el arco se sienta san Oronzo, entre santo Domingo y santa Irene.' },
    },
  },
  {
    id: 'porta-san-biagio', emoji: '🚪', x: 416.0, z: 592.7, r: 40,
    text: {
      nl: { name: 'Porta San Biagio', text: 'De zuidelijke stadspoort, gebouwd in 1774 en gewijd aan de heilige Blasius. Hij leidt het oude centrum in vanaf de weg naar Otranto en de Adriatische kust, en is de laatste van de drie poorten die nog overeind staan.' },
      en: { name: 'Porta San Biagio', text: 'The southern city gate, built in 1774 and dedicated to Saint Blaise. It leads into the old town from the road to Otranto and the Adriatic coast, and is the last of the three gates still standing.' },
      fr: { name: 'Porta San Biagio', text: 'La porte sud de la ville, bâtie en 1774 et dédiée à saint Blaise. Elle ouvre sur la vieille ville depuis la route d’Otrante et de la côte adriatique, et c’est la dernière des trois portes encore debout.' },
      es: { name: 'Porta San Biagio', text: 'La puerta sur de la ciudad, levantada en 1774 y dedicada a san Blas. Da paso al casco antiguo desde el camino de Otranto y la costa adriática, y es la última de las tres puertas que siguen en pie.' },
    },
  },
  {
    id: 'villa-comunale', emoji: '🌳', x: 707.6, z: -189.6, r: 70,
    text: {
      nl: { name: 'Villa Comunale', text: 'Het stadspark Giuseppe Garibaldi, net buiten de oude muren. Een rustige plek tussen palmen en bomen, vlak bij het kasteel en het centrum. Perfect om even te schuilen voor de zuiderse zon.' },
      en: { name: 'Villa Comunale', text: 'The Giuseppe Garibaldi city park, just outside the old walls. A calm spot among palms and trees, close to the castle and the centre. A good place to hide from the southern sun for a while.' },
      fr: { name: 'Villa Comunale', text: 'Le parc municipal Giuseppe Garibaldi, juste hors des anciens remparts. Un coin tranquille parmi les palmiers et les arbres, près du château et du centre. Idéal pour se mettre un moment à l’abri du soleil du Sud.' },
      es: { name: 'Villa Comunale', text: 'El parque municipal Giuseppe Garibaldi, justo fuera de las antiguas murallas. Un rincón tranquilo entre palmeras y árboles, cerca del castillo y del centro. Ideal para resguardarse un rato del sol del sur.' },
    },
  },
  {
    id: 'santa-chiara', emoji: '⛪', x: 273.9, z: 274.8, r: 30,
    text: {
      nl: { name: 'Chiesa di Santa Chiara', text: 'Een kleine barokke kerk uit 1687, met een achthoekig grondplan. Binnen verbluft de rijkgedecoreerde koepel en het plafond in papier-maché: een ambacht waar Lecce om bekend staat. Ze staat vlak bij het Romeinse theater.' },
      en: { name: 'Chiesa di Santa Chiara', text: 'A small Baroque church from 1687, with an octagonal plan. Inside, the richly decorated dome and the papier-mâché ceiling stun: a craft Lecce is known for. It stands right by the Roman theatre.' },
      fr: { name: 'Église Santa Chiara', text: 'Une petite église baroque de 1687, de plan octogonal. À l’intérieur, la coupole richement décorée et le plafond en papier mâché éblouissent : un artisanat pour lequel Lecce est réputée. Elle se trouve tout près du théâtre romain.' },
      es: { name: 'Iglesia de Santa Chiara', text: 'Una pequeña iglesia barroca de 1687, de planta octogonal. Dentro asombran la cúpula ricamente decorada y el techo de cartapesta, un oficio por el que Lecce es famosa. Está justo al lado del teatro romano.' },
    },
  },
];
