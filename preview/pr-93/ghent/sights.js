// Ghent's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, enter? (the building to go into, inside.js: a button on the card), emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } }, facts (three short ones, from tourfacts.js), secret?: true for one to find by yourself, which is not
// counted, pointed to, put on the big map or given a page on the site }. In order of how much you
// should not miss them.
import { FACTS } from './tourfacts.js';

export const SIGHTS = [
  {
    enter: 'sint-baafs', id: 'sint-baafs', page: '/preview/pr-93/ghent/landmark/sint-baafs-kathedraal/', emoji: '🖼️', x: 292, z: 50, r: 100,
    text: {
      nl: { name: 'Sint-Baafskathedraal', text: 'Gebouwd van de 13de tot de 16de eeuw, met een toren van 89 m. Binnen hangt Het Lam Gods van de gebroeders Van Eyck (1432), een van de beroemdste en meest gestolen schilderijen ter wereld. Het paneel De Rechtvaardige Rechters, gestolen in 1934, is nooit teruggevonden.' },
      en: { name: 'St Bavo’s Cathedral', text: 'Built from the 13th to the 16th century, with an 89 m tower. Inside hangs the Van Eyck brothers’ Adoration of the Mystic Lamb (1432), one of the most famous and most stolen paintings in the world. Its Just Judges panel, stolen in 1934, has never been found.' },
      fr: { name: 'Cathédrale Saint-Bavon', text: 'Construite du XIIIe au XVIe siècle, avec une tour de 89 m. À l’intérieur, l’Agneau mystique des frères Van Eyck (1432), l’un des tableaux les plus célèbres et les plus volés au monde. Le panneau des Juges intègres, volé en 1934, n’a jamais été retrouvé.' },
      es: { name: 'Catedral de San Bavón', text: 'Construida entre los siglos XIII y XVI, con una torre de 89 m. Dentro está La Adoración del Cordero Místico de los hermanos Van Eyck (1432), uno de los cuadros más famosos y más robados del mundo. Su panel de los Jueces Justos, robado en 1934, nunca apareció.' },
    },
  },
  {
    id: 'belfort', emoji: '🐉', x: 89, z: -41, r: 50,
    text: {
      nl: { name: 'Belfort', text: 'De 91 m hoge stadstoren, begonnen in 1313. Hier bewaarde Gent zijn privileges, en de wachters hielden uitkijk naar brand en vijanden. Bovenop waakt een vergulde draak. Samen met de Lakenhalle ernaast staat het op de UNESCO-werelderfgoedlijst.' },
      en: { name: 'Belfry', text: 'The town’s 91 m tower, begun in 1313. Ghent kept its charters of rights here, and watchmen looked out for fire and enemies. A gilded dragon keeps watch on top. With the Cloth Hall beside it, it is a UNESCO World Heritage Site.' },
      fr: { name: 'Beffroi', text: 'La tour de la ville, haute de 91 m, commencée en 1313. Gand y gardait ses privilèges, et les guetteurs y surveillaient incendies et ennemis. Un dragon doré veille au sommet. Avec la halle aux draps voisine, il est inscrit au patrimoine mondial de l’UNESCO.' },
      es: { name: 'Campanario', text: 'La torre de la ciudad, de 91 m, empezada en 1313. Aquí guardaba Gante sus privilegios, y los vigías buscaban incendios y enemigos. En lo alto vigila un dragón dorado. Junto con la Lonja de los Paños es Patrimonio de la Humanidad de la UNESCO.' },
    },
  },
  {
    id: 'gravensteen', emoji: '🏰', x: -256, z: -510, r: 75,
    text: {
      nl: { name: 'Gravensteen', text: 'De burcht van de graven van Vlaanderen, in 1180 gebouwd door Filips van de Elzas. Later was het een rechtbank, een gevangenis en zelfs een katoenspinnerij. Rond 1900 kreeg het zijn kantelen terug. In 1949 bezetten studenten het, uit protest tegen duurder bier.' },
      en: { name: 'Gravensteen', text: 'The castle of the Counts of Flanders, built in 1180 by Philip of Alsace. It later served as a court, a prison and even a cotton mill, and got its battlements back around 1900. In 1949 students occupied it, in protest against the price of beer going up.' },
      fr: { name: 'Château des Comtes', text: 'Le château des comtes de Flandre, bâti en 1180 par Philippe d’Alsace. Il fut ensuite tribunal, prison et même filature de coton, et retrouva ses créneaux vers 1900. En 1949, des étudiants l’occupèrent pour protester contre la hausse du prix de la bière.' },
      es: { name: 'Castillo de los Condes', text: 'El castillo de los condes de Flandes, construido en 1180 por Felipe de Alsacia. Después fue tribunal, cárcel y hasta hilandería de algodón, y recuperó sus almenas hacia 1900. En 1949 lo ocuparon estudiantes, protestando porque subía el precio de la cerveza.' },
    },
  },
  {
    id: 'graslei', emoji: '🌾', x: -240, z: -190, r: 55,
    text: {
      nl: { name: 'Graslei en Korenlei', text: 'De middeleeuwse haven van Gent, aan weerskanten van de Leie. Schippers losten hier graan, en de gilden bouwden er hun huizen. Het Koornstapelhuis, de grijze romaanse graanschuur van rond 1200, is een van de oudste huizen van de stad.' },
      en: { name: 'Graslei and Korenlei', text: 'Ghent’s medieval port, on both banks of the Leie. Boatmen unloaded grain here and the guilds built their houses along the quay. The Koornstapelhuis, the grey Romanesque grain store from around 1200, is one of the oldest houses in town.' },
      fr: { name: 'Graslei et Korenlei', text: 'Le port médiéval de Gand, sur les deux rives de la Lys. Les bateliers y déchargeaient le grain et les corporations y bâtirent leurs maisons. Le Koornstapelhuis, grenier roman gris d’environ 1200, est l’une des plus vieilles maisons de la ville.' },
      es: { name: 'Graslei y Korenlei', text: 'El puerto medieval de Gante, a ambas orillas del Lys. Los barqueros descargaban aquí el grano y los gremios construyeron sus casas en el muelle. El Koornstapelhuis, granero románico gris de hacia 1200, es una de las casas más antiguas de la ciudad.' },
    },
  },
  {
    id: 'sint-michielsbrug', emoji: '🌉', x: -290, z: -68, r: 40,
    text: {
      nl: { name: 'Sint-Michielsbrug', text: 'Gebouwd begin 20ste eeuw, vlak voor de wereldtentoonstelling van 1913. Kijk naar het oosten en je ziet de drie Gentse torens op een rij: Sint-Niklaas, het Belfort en Sint-Baafs. Achter je staat de Sint-Michielskerk, waarvan de toren nooit afraakte.' },
      en: { name: 'St Michael’s Bridge', text: 'Built at the start of the 20th century, just before the 1913 World Fair. Look east to see Ghent’s three towers in a row: St Nicholas’, the Belfry and St Bavo’s. Behind you stands St Michael’s Church, whose tower was never finished.' },
      fr: { name: 'Pont Saint-Michel', text: 'Construit au début du XXe siècle, juste avant l’Exposition universelle de 1913. Regarde vers l’est : les trois tours de Gand s’alignent, Saint-Nicolas, le Beffroi et Saint-Bavon. Derrière toi, l’église Saint-Michel, dont la tour n’a jamais été achevée.' },
      es: { name: 'Puente de San Miguel', text: 'Construido a principios del siglo XX, justo antes de la Exposición Universal de 1913. Mira al este y verás las tres torres de Gante en fila: San Nicolás, el Campanario y San Bavón. Detrás tienes la iglesia de San Miguel, cuya torre nunca se terminó.' },
    },
  },
  {
    enter: 'sint-niklaas', id: 'sint-niklaas', page: '/preview/pr-93/ghent/landmark/sint-niklaaskerk/', emoji: '⛪', x: -71, z: -79, r: 70,
    text: {
      nl: { name: 'Sint-Niklaaskerk', text: 'De kerk van de kooplui, uit de 13de eeuw, in blauwgrijze Doornikse steen: Scheldegotiek. Haar toren staat midden op het dak en diende ook als uitkijkpost, lang voor het Belfort er stond. Vandaag gaan er ook concerten en tentoonstellingen door.' },
      en: { name: 'St Nicholas’ Church', text: 'The merchants’ church, from the 13th century, in blue-grey Tournai stone: Scheldt Gothic. Its tower sits right on the middle of the roof and doubled as a lookout, long before the Belfry stood. Today it also hosts concerts and exhibitions.' },
      fr: { name: 'Église Saint-Nicolas', text: 'L’église des marchands, du XIIIe siècle, en pierre bleu-gris de Tournai : du gothique scaldien. Sa tour se dresse au milieu du toit et servait aussi de poste de guet, bien avant le Beffroi. On y donne aujourd’hui aussi des concerts et des expositions.' },
      es: { name: 'Iglesia de San Nicolás', text: 'La iglesia de los mercaderes, del siglo XIII, en piedra gris azulada de Tournai: gótico del Escalda. Su torre se alza en mitad del tejado y servía de atalaya mucho antes del Campanario. Hoy también acoge conciertos y exposiciones.' },
    },
  },
  {
    enter: 'stadhuis', id: 'stadhuis', emoji: '🏛️', x: 120, z: -165, r: 65,
    text: {
      nl: { name: 'Stadhuis', text: 'Een stadhuis in twee stijlen: sierlijke laatgotiek aan de Hoogpoort, strakke renaissance aan de Botermarkt. Het geld en de godsdienstoorlogen legden de bouw telkens stil. Hier werd in 1576 de Pacificatie van Gent getekend, een vrede tussen de Nederlandse gewesten.' },
      en: { name: 'City Hall', text: 'A city hall in two styles: ornate late Gothic on the Hoogpoort, sober Renaissance on the Botermarkt. Running out of money and the wars of religion kept halting the building work. The Pacification of Ghent, a peace between the Low Countries’ provinces, was signed here in 1576.' },
      fr: { name: 'Hôtel de ville', text: 'Un hôtel de ville en deux styles : gothique flamboyant côté Hoogpoort, Renaissance sobre côté Botermarkt. Le manque d’argent et les guerres de religion ont sans cesse arrêté le chantier. La Pacification de Gand, une paix entre les provinces des Pays-Bas, y fut signée en 1576.' },
      es: { name: 'Ayuntamiento', text: 'Un ayuntamiento en dos estilos: gótico florido en la Hoogpoort y sobrio renacimiento en la Botermarkt. La falta de dinero y las guerras de religión pararon la obra una y otra vez. Aquí se firmó en 1576 la Pacificación de Gante, una paz entre las provincias de los Países Bajos.' },
    },
  },
  {
    id: 'vrijdagmarkt', emoji: '🍺', x: 183, z: -490, r: 60,
    text: {
      nl: { name: 'Vrijdagmarkt', text: 'Het plein van markten, feesten en opstanden, waar de graven van Vlaanderen werden ingehuldigd. In het midden wijst Jacob van Artevelde, de brouwer die Gent in 1338 leidde. Aan de overkant staat Ons Huis, het grote huis van de socialistische arbeidersbeweging.' },
      en: { name: 'Vrijdagmarkt', text: 'The square of markets, feasts and uprisings, where the Counts of Flanders were sworn in. In the middle Jacob van Artevelde, the brewer who led Ghent in 1338, points the way. Across the square stands Ons Huis, the big home of the socialist workers’ movement.' },
      fr: { name: 'Marché du Vendredi', text: 'La place des marchés, des fêtes et des révoltes, où l’on intronisait les comtes de Flandre. Au milieu, Jacob van Artevelde, le brasseur qui mena Gand en 1338, montre le chemin. En face se dresse Ons Huis, la grande maison du mouvement ouvrier socialiste.' },
      es: { name: 'Vrijdagmarkt', text: 'La plaza de mercados, fiestas y revueltas, donde se investía a los condes de Flandes. En el centro señala Jacobo van Artevelde, el cervecero que gobernó Gante en 1338. Enfrente está Ons Huis, la gran casa del movimiento obrero socialista.' },
    },
  },
  {
    id: 'groot-vleeshuis', emoji: '🥩', x: -188, z: -344, r: 60,
    text: {
      nl: { name: 'Groot Vleeshuis', text: 'De overdekte vleeshal van de beenhouwers, gebouwd van 1406 tot 1419. Onder het indrukwekkende houten dakgebinte hangen nog altijd hammen te drogen. Vandaag koop en proef je er Oost-Vlaamse streekproducten.' },
      en: { name: 'Groot Vleeshuis', text: 'The butchers’ covered meat hall, built from 1406 to 1419. Hams still hang drying under its impressive wooden roof. Today you can buy and taste East Flemish regional produce here.' },
      fr: { name: 'Grande Boucherie', text: 'La halle couverte des bouchers, bâtie de 1406 à 1419. Des jambons sèchent toujours sous son impressionnante charpente en bois. On y achète et goûte aujourd’hui des produits régionaux de Flandre-Orientale.' },
      es: { name: 'Gran Carnicería', text: 'El mercado cubierto de los carniceros, construido entre 1406 y 1419. Bajo su impresionante techumbre de madera aún cuelgan jamones secándose. Hoy se compran y prueban aquí productos regionales de Flandes Oriental.' },
    },
  },
  {
    // the covered gallery of the Pieter Vanderdoncktdoorgang, by Zuid (glazenstraatje.js): one to find
    id: 'glazen-straatje', emoji: '🏮', x: 672, z: 533, r: 30, secret: true,
    arrival: { x: 685.5, z: 492.5, look: [681.6, 506] },
    text: {
      nl: { name: 'Glazen Straatje', text: 'De Pieter Vanderdoncktdoorgang, tussen de Brabantdam en de Vlaanderenstraat: de enige winkelgalerij van Gent onder glas en ijzer (1846-52, verlengd in 1886). Wat ooit winkeltjes waren, zijn al lang ramen in rood en roze licht: het hart van de Gentse rosse buurt.' },
      en: { name: 'Glass Alley', text: 'The Pieter Vanderdoncktdoorgang, between the Brabantdam and the Vlaanderenstraat: Ghent’s only shopping arcade under glass and iron (1846-52, extended in 1886). Its little shops have long since become windows lit red and pink: the heart of Ghent’s red-light district.' },
      fr: { name: 'Glazen Straatje', text: 'Le passage Pieter Vanderdonckt, entre le Brabantdam et la Vlaanderenstraat : la seule galerie marchande de Gand sous verre et fer (1846-52, prolongée en 1886). Ses petites boutiques sont depuis longtemps des vitrines éclairées de rouge et de rose : le cœur du quartier rouge gantois.' },
      es: { name: 'Callejón de Cristal', text: 'El pasaje Pieter Vanderdonckt, entre el Brabantdam y la Vlaanderenstraat: la única galería comercial de Gante bajo vidrio y hierro (1846-52, ampliada en 1886). Sus tiendecitas hace tiempo que son escaparates con luz roja y rosa: el corazón del barrio rojo de Gante.' },
    },
  },
  {
    id: 'werregarenstraat', emoji: '🎨', x: 74, z: -301, r: 35,
    arrival: { x: 75.6, z: -321.5, look: [77.5, -293.8] },
    text: {
      nl: { name: 'Werregarenstraatje', text: 'Het graffitistraatje: sinds de jaren negentig mag hier iedereen legaal spuiten. De muren krijgen zo bijna elke week een nieuwe laag verf, dus geen twee bezoeken zien er hetzelfde uit.' },
      en: { name: 'Graffiti Street', text: 'The Werregarenstraatje: since the 1990s anyone may spray paint here, legally. The walls get a fresh layer of paint almost every week, so no two visits look the same.' },
      fr: { name: 'Ruelle des graffitis', text: 'Le Werregarenstraatje : depuis les années 1990, chacun peut y peindre à la bombe en toute légalité. Les murs reçoivent une nouvelle couche presque chaque semaine, si bien qu’aucune visite ne ressemble à la précédente.' },
      es: { name: 'Calle del grafiti', text: 'El Werregarenstraatje: desde los años noventa cualquiera puede pintar aquí con spray, legalmente. Las paredes reciben una capa nueva casi cada semana, así que ninguna visita se parece a la anterior.' },
    },
  },
  {
    id: 'kouter', emoji: '💐', x: 0, z: 448, r: 70,
    text: {
      nl: { name: 'Kouter', text: 'Het deftigste plein van Gent, ooit een akker en een plek voor parades en schuttersfeesten. Al sinds de 18de eeuw is hier elke zondag bloemenmarkt, met een brassband in de muziekkiosk. In de blauwe kiosk drink je er een glas bij.' },
      en: { name: 'Kouter', text: 'Ghent’s smartest square, once a field and a place for parades and archers’ feasts. There has been a flower market here every Sunday since the 18th century, with a brass band in the bandstand. The blue kiosk serves a drink to go with it.' },
      fr: { name: 'Kouter', text: 'La place la plus chic de Gand, jadis un champ et un lieu de parades et de fêtes des archers. Depuis le XVIIIe siècle, un marché aux fleurs s’y tient chaque dimanche, avec une fanfare dans le kiosque. Le kiosque bleu sert un verre pour l’accompagner.' },
      es: { name: 'Kouter', text: 'La plaza más elegante de Gante, antes un campo y lugar de desfiles y fiestas de arqueros. Desde el siglo XVIII hay mercado de flores cada domingo, con una banda en el quiosco de música. El quiosco azul sirve algo de beber para acompañarlo.' },
    },
  },
  {
    id: 'vooruit', emoji: '🎭', x: 300, z: 795, r: 55,
    text: {
      nl: { name: 'Vooruit', text: 'Het feestlokaal van de socialistische coöperatie Vooruit, geopend in 1914: arbeiders kwamen hier dansen, naar theater en concerten, en eten in het café. Na jaren verval redden kunstenaars het in de jaren tachtig. Vandaag is het kunstencentrum VIERNULVIER.' },
      en: { name: 'Vooruit', text: 'The party hall of the socialist co-operative Vooruit, opened in 1914: workers came here to dance, for theatre and concerts, and to eat in the café. Artists rescued it from decay in the 1980s. Today it is the arts centre VIERNULVIER.' },
      fr: { name: 'Vooruit', text: 'La salle des fêtes de la coopérative socialiste Vooruit, ouverte en 1914 : les ouvriers venaient y danser, au théâtre, au concert et manger au café. Des artistes l’ont sauvée de la ruine dans les années 1980. C’est aujourd’hui le centre d’art VIERNULVIER.' },
      es: { name: 'Vooruit', text: 'El salón de fiestas de la cooperativa socialista Vooruit, abierto en 1914: los obreros venían a bailar, al teatro, a conciertos y a comer en el café. Unos artistas lo salvaron de la ruina en los años ochenta. Hoy es el centro de artes VIERNULVIER.' },
    },
  },
  {
    id: 'sint-pietersabdij', emoji: '⛪', x: 240, z: 1500, r: 70,
    text: {
      nl: { name: 'Sint-Pietersabdij', text: 'De abdij op de Blandijnberg werd in de 7de eeuw gesticht, volgens de overlevering door de heilige Amandus, en werd een van de rijkste van Vlaanderen. De barokke kerk met haar koepel (1629-1720) is van Pieter Huyssens. De Fransen hieven de abdij op in 1796; vandaag is ze een kunsthal, met achter de muren een abdijtuin met wijngaard en ruïnes.' },
      en: { name: 'St Peter’s Abbey', text: 'The abbey on the Blandijnberg hill was founded in the 7th century, by Saint Amand as the story goes, and grew into one of the richest in Flanders. The baroque church with its dome (1629-1720) is by Pieter Huyssens. The French dissolved the abbey in 1796; today it is an exhibition hall, with an abbey garden of vines and ruins behind its walls.' },
      fr: { name: 'Abbaye Saint-Pierre', text: 'L’abbaye du mont Blandin fut fondée au VIIe siècle, par saint Amand selon la tradition, et devint l’une des plus riches de Flandre. L’église baroque et sa coupole (1629-1720) sont de Pieter Huyssens. Les Français supprimèrent l’abbaye en 1796 ; c’est aujourd’hui un lieu d’expositions, avec derrière ses murs un jardin avec vigne et ruines.' },
      es: { name: 'Abadía de San Pedro', text: 'La abadía del monte Blandijn se fundó en el siglo VII, según la tradición por san Amando, y llegó a ser una de las más ricas de Flandes. La iglesia barroca con su cúpula (1629-1720) es de Pieter Huyssens. Los franceses suprimieron la abadía en 1796; hoy es una sala de exposiciones, con un jardín de viñas y ruinas tras sus muros.' },
    },
  },
  {
    id: 'zuid', emoji: '🚌', x: 668, z: 742, r: 60,
    text: {
      nl: { name: 'Gent Zuid', text: 'Hier stond tot 1928 het Zuidstation, het eerste station van Gent. Vandaag is het het knooppunt van De Lijn: hier vertrekken en eindigen de meeste stadsbussen, en de trams rijden er langs op weg naar het centrum en Sint-Pieters.' },
      en: { name: 'Gent Zuid', text: 'Until 1928 the Zuidstation, Ghent’s first railway station, stood here. Today it is De Lijn’s hub: most city buses start and end here, and the trams pass on their way to the centre and Sint-Pieters.' },
      fr: { name: 'Gand-Sud', text: 'Jusqu’en 1928 se dressait ici la gare du Sud, la première gare de Gand. C’est aujourd’hui le nœud de De Lijn : la plupart des bus urbains y partent et y arrivent, et les trams y passent vers le centre et Saint-Pierre.' },
      es: { name: 'Gante Sur', text: 'Hasta 1928 aquí estaba la estación Sur, la primera de Gante. Hoy es el nudo de De Lijn: la mayoría de los autobuses urbanos salen y llegan aquí, y los tranvías pasan camino del centro y de Sint-Pieters.' },
    },
  },
  {
    // the Provinciehuis in the old Leopoldskazerne, modelled by hand (ghent/provinciehuis.js): the card counts from its courtyard garden
    id: 'provinciehuis', page: '', emoji: '🏰', x: -75, z: 1805, r: 70,
    text: {
      nl: { name: 'Provinciehuis (Leopoldskazerne)', text: 'Deze kazerne met torentjes en kantelen, als een burcht, werd gebouwd van 1902 tot 1906. Tot 1955 woonde hier het 2de Linieregiment, meer dan 1.300 soldaten. Sinds 2024 werkt de provincie Oost-Vlaanderen hier, in de oude vleugels en een nieuwe grijsgroene erbij, rond een tuin met PROVINCIEHUIS in grote letters.' },
      en: { name: 'Provincial House (Leopold Barracks)', text: 'These barracks, with turrets and battlements like a castle, were built from 1902 to 1906. Until 1955 they were home to the 2nd Line Regiment, over 1,300 soldiers. Since 2024 the province of East Flanders has worked here, in the old wings and a new grey-green one, around a garden with PROVINCIEHUIS in big letters.' },
      fr: { name: 'Maison provinciale (caserne Léopold)', text: 'Cette caserne à tourelles et créneaux, comme un château fort, fut bâtie de 1902 à 1906. Jusqu’en 1955 y logeait le 2e régiment de ligne, plus de 1 300 soldats. Depuis 2024, la province de Flandre-Orientale y travaille, dans les vieilles ailes et une nouvelle gris-vert, autour d’un jardin avec PROVINCIEHUIS en grandes lettres.' },
      es: { name: 'Casa Provincial (cuartel Leopoldo)', text: 'Este cuartel con torrecillas y almenas, como un castillo, se construyó de 1902 a 1906. Hasta 1955 vivió aquí el 2.º Regimiento de Línea, más de 1.300 soldados. Desde 2024 trabaja aquí la provincia de Flandes Oriental, en las alas antiguas y una nueva gris verdosa, alrededor de un jardín con PROVINCIEHUIS en letras grandes.' },
    },
  },
  {
    id: 'blaarmeersen', emoji: '🏖️', x: -3160, z: 1335, r: 140,
    text: {
      nl: { name: 'Blaarmeersen', text: 'Het sport- en recreatiedomein van Gent, aan de Watersportbaan. Op warme dagen ligt het strand aan de zwemvijver vol, en rond de 2,3 km lange roeibaan lopen de joggers hun rondjes. Er is ook een camping, een atletiekpiste en beachvolley.' },
      en: { name: 'Blaarmeersen', text: 'Ghent’s sports and leisure park, by the Watersportbaan. On hot days the beach on the swimming lake is packed, and joggers run their laps round the 2.3 km rowing course. There is also a campsite, an athletics track and beach volleyball.' },
      fr: { name: 'Blaarmeersen', text: 'Le domaine de sport et de loisirs de Gand, au bord du Watersportbaan. Les jours de chaleur, la plage du lac de baignade est bondée, et les joggeurs font leurs tours autour du bassin d’aviron de 2,3 km. Il y a aussi un camping, une piste d’athlétisme et du beach-volley.' },
      es: { name: 'Blaarmeersen', text: 'El parque de deporte y ocio de Gante, junto al Watersportbaan. Los días de calor la playa del lago de baño se llena, y los corredores dan vueltas al canal de remo de 2,3 km. Hay también camping, pista de atletismo y vóley playa.' },
    },
  },
  {
    id: 'mammelokker', emoji: '🤱', x: 105, z: -70, r: 38,
    text: {
      nl: { name: 'Mammelokker', text: 'Kijk boven de deur van dit huisje tegen de Lakenhalle: een jonge vrouw die een oude man de borst geeft. Het is de Romeinse legende van Pero, die haar vader Cimon zoogde toen hij in de gevangenis van honger moest sterven. Toen dat uitkwam, liet men hem vrij. Hier woonden de cipiers van de stadsgevangenis, die van 1742 tot 1902 in de kelders van de Lakenhalle zat. Mammelokker is Gents voor borstzuiger. Het reliëf is van 1741, in 1962 opnieuw uitgehouwen door Jan Anteunis.' },
      en: { name: 'Mammelokker', text: 'Look above the door of this little house against the Cloth Hall: a young woman giving an old man her breast. It is the Roman legend of Pero, who nursed her father Cimon when he was left to starve in prison. When it came out, he was set free. The warders of the town prison, which was in the Cloth Hall’s cellars from 1742 to 1902, lived here. Mammelokker is Ghent dialect for breast-sucker. The relief dates from 1741, recarved by Jan Anteunis in 1962.' },
      fr: { name: 'Mammelokker', text: 'Regarde au-dessus de la porte de cette maisonnette contre la halle aux draps : une jeune femme qui donne le sein à un vieil homme. C’est la légende romaine de Péro, qui allaita son père Cimon, condamné à mourir de faim en prison. Quand on le découvrit, il fut libéré. Ici vivaient les geôliers de la prison de la ville, installée dans les caves de la halle de 1742 à 1902. Mammelokker veut dire « suceur de sein » en gantois. Le relief date de 1741, resculpté par Jan Anteunis en 1962.' },
      es: { name: 'Mammelokker', text: 'Mira encima de la puerta de esta casita junto a la Lonja de los Paños: una joven que da el pecho a un anciano. Es la leyenda romana de Pero, que amamantó a su padre Cimón cuando lo dejaron morir de hambre en la cárcel. Cuando se supo, lo liberaron. Aquí vivían los carceleros de la prisión de la ciudad, que estuvo en los sótanos de la Lonja de 1742 a 1902. Mammelokker significa «chupapechos» en el dialecto de Gante. El relieve es de 1741, tallado de nuevo por Jan Anteunis en 1962.' },
    },
  },
  {
    id: 'karel-sabbeberg', emoji: '⛰️', x: -3361, z: 1586, r: 120,
    text: {
      nl: { name: 'Karel Sabbeberg', text: 'De enige berg van Gent, zo’n 30 meter hoog, en door mensen gemaakt. Tot 2003 skieden Gentenaars hier op borstelmatten. In 2019 kreeg hij de naam van ultraloper Karel Sabbe, die er duizenden keren op en af liep om te trainen. Boven staat sinds 2009 een uitkijktoren met zicht over de stad.' },
      en: { name: 'Karel Sabbeberg', text: 'Ghent’s only mountain, some 30 metres high, and man-made. Until 2003 Ghent skied here on brush mats. In 2019 it was named after the ultrarunner Karel Sabbe, who ran up and down it thousands of times in training. Since 2009 a lookout tower on top looks out over the city.' },
      fr: { name: 'Karel Sabbeberg', text: 'La seule montagne de Gand, haute d’une trentaine de mètres, et faite de main d’homme. Jusqu’en 2003, on y skiait sur des tapis à brosses. En 2019, elle a pris le nom de l’ultratrailer Karel Sabbe, qui l’a montée et descendue des milliers de fois pour s’entraîner. Depuis 2009, une tour d’observation au sommet donne sur la ville.' },
      es: { name: 'Karel Sabbeberg', text: 'La única montaña de Gante, de unos 30 metros, y hecha por el hombre. Hasta 2003 se esquiaba aquí sobre pistas de cepillo. En 2019 recibió el nombre del ultrafondista Karel Sabbe, que la subió y bajó miles de veces para entrenar. Desde 2009 una torre mirador en la cima da vista a la ciudad.' },
    },
  },
  {
    // the easter egg: on the deck of the lookout tower (ghent/sabbeberg.js)
    id: 'rechtvaardige-rechters', emoji: '🕵️', x: -3361, z: 1586, r: 22, secret: true,
    text: {
      nl: { name: 'De Rechtvaardige Rechters — gevonden!', text: 'In de nacht van 10 april 1934 werd dit paneel van Het Lam Gods gestolen uit de Sint-Baafskathedraal. De dief vroeg een miljoen frank losgeld en stuurde als bewijs de achterkant terug, met Johannes de Doper. Het paneel zelf werd nooit gevonden: in de kathedraal hangt een kopie van Jef Van der Veken. En kijk, daar boven op de toren staat het. Niet verder vertellen.' },
      en: { name: 'The Just Judges — found!', text: 'On the night of 10 April 1934 this panel of the Ghent Altarpiece was stolen from St Bavo’s Cathedral. The thief asked a million francs in ransom and sent back its reverse, with John the Baptist, as proof. The panel itself was never found: the cathedral shows a copy by Jef Van der Veken. And look, there it is, on top of the tower. Don’t tell anyone.' },
      fr: { name: 'Les Juges intègres — retrouvés !', text: 'Dans la nuit du 10 avril 1934, ce panneau de l’Agneau mystique fut volé à la cathédrale Saint-Bavon. Le voleur réclama un million de francs de rançon et renvoya le revers, avec saint Jean-Baptiste, comme preuve. Le panneau lui-même n’a jamais été retrouvé : la cathédrale expose une copie de Jef Van der Veken. Et regarde, il est là-haut sur la tour. Ne le dis à personne.' },
      es: { name: 'Los Jueces Justos, ¡encontrados!', text: 'La noche del 10 de abril de 1934 robaron este panel del Cordero Místico de la catedral de San Bavón. El ladrón pidió un millón de francos de rescate y devolvió el reverso, con san Juan Bautista, como prueba. El panel nunca apareció: en la catedral hay una copia de Jef Van der Veken. Y mira, ahí está, arriba en la torre. No se lo digas a nadie.' },
    },
  },
];
for (const s of SIGHTS) s.facts = FACTS[s.id];
