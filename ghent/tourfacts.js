// The tour's cards in short, and the sights' cards when exploring: three snappy facts per stop (and
// per sight), to read in a glance while the camera hovers there. Keyed by the stop's id (its sight in sights.js, or the tour's own 'dulle-griet'),
// each { <lang>: [three facts] }. Only facts sights.js and tour.js already tell, or that are well
// known; plain text, no full stops, as short as they go (a few words each).
export const FACTS = {
  'sint-michielsbrug': {
    nl: ['Gebouwd in 1909', 'Kijk oost: drie torens op een rij', 'De kerk kreeg nooit haar spits'],
    en: ['Built in 1909', 'Look east: three towers in a row', 'The church never got its spire'],
    fr: ['Construit en 1909', 'À l’est : trois tours alignées', 'L’église n’eut jamais sa flèche'],
    es: ['Construido en 1909', 'Al este: tres torres en fila', 'La iglesia nunca tuvo aguja'],
  },
  'sint-niklaas': {
    nl: ['Kerk van de kooplui, 13de eeuw', 'Blauwgrijze Doornikse steen', 'Ooit de uitkijkpost van Gent'],
    en: ['The merchants’ church, 1200s', 'Blue-grey Tournai stone', 'Once Ghent’s lookout'],
    fr: ['L’église des marchands, XIIIe s.', 'Pierre bleue de Tournai', 'Jadis la tour de guet de Gand'],
    es: ['Iglesia de mercaderes, s. XIII', 'Piedra azul de Tournai', 'Antes la atalaya de Gante'],
  },
  'sint-baafs': {
    nl: ['Het Lam Gods, 1432', 'Een van de meest gestolen schilderijen', 'Eén paneel nooit teruggevonden'],
    en: ['The Ghent Altarpiece, 1432', 'One of the most stolen paintings', 'One panel never found'],
    fr: ['L’Agneau mystique, 1432', 'L’un des tableaux les plus volés', 'Un panneau jamais retrouvé'],
    es: ['El Cordero Místico, 1432', 'De los cuadros más robados', 'Un panel nunca apareció'],
  },
  belfort: {
    nl: ['91 m hoog, uit 1313', 'Een gouden draak bovenop', 'UNESCO-werelderfgoed'],
    en: ['91 m tall, from 1313', 'A gilded dragon on top', 'UNESCO World Heritage'],
    fr: ['91 m, depuis 1313', 'Un dragon doré au sommet', 'Patrimoine de l’UNESCO'],
    es: ['91 m, desde 1313', 'Un dragón dorado en lo alto', 'Patrimonio de la UNESCO'],
  },
  stadhuis: {
    nl: ['Gotiek én renaissance', 'Bouw keer op keer stilgelegd', 'Pacificatie van Gent, 1576'],
    en: ['Gothic and Renaissance', 'Building halted again and again', 'Pacification of Ghent, 1576'],
    fr: ['Gothique et Renaissance', 'Chantier sans cesse arrêté', 'Pacification de Gand, 1576'],
    es: ['Gótico y renacentista', 'Obras paradas una y otra vez', 'Pacificación de Gante, 1576'],
  },
  vrijdagmarkt: {
    nl: ['Markten, feesten en opstanden', 'Waar de graven werden ingehuldigd', 'Jacob van Artevelde, 1338'],
    en: ['Markets, feasts and revolts', 'Where the Counts were sworn in', 'Jacob van Artevelde, 1338'],
    fr: ['Marchés, fêtes et révoltes', 'Où l’on intronisait les comtes', 'Jacob van Artevelde, 1338'],
    es: ['Mercados, fiestas y revueltas', 'Aquí se investía a los condes', 'Jacob van Artevelde, 1338'],
  },
  'dulle-griet': {
    nl: ['Kanon van 12 ton, 15de eeuw', 'Een loop van 64 cm', 'Hier sinds 1578'],
    en: ['A 12-tonne cannon, 1400s', 'A 64 cm bore', 'Here since 1578'],
    fr: ['Canon de 12 tonnes, XVe s.', 'Un calibre de 64 cm', 'Ici depuis 1578'],
    es: ['Cañón de 12 toneladas, s. XV', 'Una boca de 64 cm', 'Aquí desde 1578'],
  },
  'groot-vleeshuis': {
    nl: ['Vleeshal van 1406–1419', 'Hammen drogen onder het dak', 'Oost-Vlaamse streekproducten'],
    en: ['Meat hall from 1406–1419', 'Hams drying under the roof', 'East Flemish produce'],
    fr: ['Halle aux viandes, 1406–1419', 'Jambons sous la charpente', 'Produits du terroir flamand'],
    es: ['Mercado de carne, 1406–1419', 'Jamones bajo el techo', 'Productos de Flandes Oriental'],
  },
  gravensteen: {
    nl: ['Burcht van de graven, 1180', 'Later gevangenis en spinnerij', 'Studenten bezetten hem in 1949'],
    en: ['The Counts’ castle, 1180', 'Later a prison and a mill', 'Students took it in 1949'],
    fr: ['Château des comtes, 1180', 'Puis prison et filature', 'Occupé par des étudiants, 1949'],
    es: ['Castillo de los condes, 1180', 'Luego cárcel e hilandería', 'Tomado por estudiantes, 1949'],
  },
  graslei: {
    nl: ['De middeleeuwse haven', 'Hier losten schippers graan', 'Koornstapelhuis, rond 1200'],
    en: ['The medieval port', 'Grain was unloaded here', 'Koornstapelhuis, about 1200'],
    fr: ['Le port médiéval', 'On y déchargeait le grain', 'Koornstapelhuis, vers 1200'],
    es: ['El puerto medieval', 'Aquí se descargaba grano', 'Koornstapelhuis, hacia 1200'],
  },
  werregarenstraat: {
    nl: ['Het graffitistraatje', 'Spuiten mag hier legaal', 'Elke week nieuwe verf'],
    en: ['The graffiti street', 'Spraying here is legal', 'New paint every week'],
    fr: ['La ruelle des graffitis', 'Peindre ici est légal', 'Nouvelle peinture chaque semaine'],
    es: ['La calle del grafiti', 'Aquí pintar es legal', 'Pintura nueva cada semana'],
  },
  kouter: {
    nl: ['Het deftigste plein van Gent', 'Elke zondag bloemenmarkt', 'Brassband in de kiosk'],
    en: ['Ghent’s smartest square', 'A flower market every Sunday', 'A brass band in the bandstand'],
    fr: ['La place la plus chic de Gand', 'Marché aux fleurs le dimanche', 'Une fanfare au kiosque'],
    es: ['La plaza más elegante', 'Flores cada domingo', 'Una banda en el quiosco'],
  },
  vooruit: {
    nl: ['Feestlokaal van de arbeiders, 1914', 'Dansen, theater en concerten', 'Nu kunstencentrum VIERNULVIER'],
    en: ['The workers’ party hall, 1914', 'Dancing, theatre and concerts', 'Now arts centre VIERNULVIER'],
    fr: ['Salle des fêtes ouvrière, 1914', 'Danse, théâtre et concerts', 'Aujourd’hui VIERNULVIER'],
    es: ['Salón de los obreros, 1914', 'Baile, teatro y conciertos', 'Hoy el centro VIERNULVIER'],
  },
  'sint-pietersabdij': {
    nl: ['Abdij uit de 7de eeuw', 'Barokke koepelkerk', 'Wijngaard achter de muren'],
    en: ['A 7th-century abbey', 'A baroque domed church', 'Vines behind the walls'],
    fr: ['Abbaye du VIIe siècle', 'Église baroque à coupole', 'Une vigne derrière les murs'],
    es: ['Abadía del siglo VII', 'Iglesia barroca con cúpula', 'Viñedo tras los muros'],
  },
  provinciehuis: {
    nl: ['Kazerne als een burcht, 1902-1906', 'Tot 1955 het 2de Linieregiment', 'Provinciehuis sinds 2024'],
    en: ['Barracks like a castle, 1902-1906', 'The 2nd Line Regiment until 1955', 'Provincial House since 2024'],
    fr: ['Une caserne château fort, 1902-1906', 'Le 2e de ligne jusqu’en 1955', 'Maison provinciale depuis 2024'],
    es: ['Cuartel como un castillo, 1902-1906', 'El 2.º de Línea hasta 1955', 'Casa Provincial desde 2024'],
  },
  zuid: {
    nl: ['Eerste station van Gent', 'Knooppunt van De Lijn', 'Hier starten de stadsbussen'],
    en: ['Ghent’s first station', 'De Lijn’s hub', 'Where the city buses start'],
    fr: ['La première gare de Gand', 'Le nœud de De Lijn', 'Départ des bus de la ville'],
    es: ['La primera estación de Gante', 'El nudo de De Lijn', 'Aquí salen los autobuses'],
  },
  blaarmeersen: {
    nl: ['Sport en recreatie', 'Een strand aan de vijver', 'Roeibaan van 2,3 km'],
    en: ['Sports and leisure park', 'A beach on the lake', 'A 2.3 km rowing course'],
    fr: ['Sports et loisirs', 'Une plage au bord du lac', 'Bassin d’aviron de 2,3 km'],
    es: ['Deporte y ocio', 'Una playa en el lago', 'Canal de remo de 2,3 km'],
  },
  mammelokker: {
    nl: ['Pero zoogt haar vader in de cel', 'Hier woonden de cipiers', 'Gents voor borstzuiger'],
    en: ['Pero nursing her father in jail', 'The jailers lived here', 'Ghent dialect: breast-sucker'],
    fr: ['Péro allaite son père en prison', 'Les geôliers vivaient ici', 'Gantois pour « suceur de sein »'],
    es: ['Pero amamanta a su padre preso', 'Aquí vivían los carceleros', 'Gantés para «chupateta»'],
  },
  'karel-sabbeberg': {
    nl: ['De enige berg van Gent: 30 m', 'Tot 2003 een skipiste', 'Naar ultraloper Karel Sabbe'],
    en: ['Ghent’s only mountain: 30 m', 'A ski slope until 2003', 'Named after Karel Sabbe'],
    fr: ['La seule montagne de Gand : 30 m', 'Piste de ski jusqu’en 2003', 'Du nom de Karel Sabbe'],
    es: ['La única montaña de Gante: 30 m', 'Pista de esquí hasta 2003', 'Por el corredor Karel Sabbe'],
  },
  'rechtvaardige-rechters': {
    nl: ['Gestolen in 1934', 'Een miljoen frank losgeld', 'Gevonden! Niet verder vertellen'],
    en: ['Stolen in 1934', 'A million francs ransom', 'Found! Don’t tell anyone'],
    fr: ['Volé en 1934', 'Un million de francs de rançon', 'Trouvé ! Chut'],
    es: ['Robado en 1934', 'Un millón de francos de rescate', '¡Encontrado! No se lo digas a nadie'],
  },
};
