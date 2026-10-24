// The tour's cards in short: three snappy facts per stop, to read in a glance while the camera
// hovers there. Keyed by the stop's id (its sight in sights.js, or the tour's own 'dulle-griet'),
// each { <lang>: [three facts] }. Only facts sights.js and tour.js already tell, or that are well
// known; plain text, no full stops, the card brings its own emoji.
export const FACTS = {
  'sint-michielsbrug': {
    nl: ['Gebouwd in 1909, net voor de wereldexpo van 1913', 'Drie Gentse torens op één rij: kijk naar het oosten', 'De Sint-Michielskerk kreeg haar torenspits nooit'],
    en: ['Built in 1909, just before the 1913 World’s Fair', 'Ghent’s three towers in one row: look east', 'St Michael’s Church never got its spire'],
    fr: ['Construit en 1909, juste avant l’Expo de 1913', 'Les trois tours de Gand alignées : regardez à l’est', 'L’église Saint-Michel n’a jamais eu sa flèche'],
    es: ['Construido en 1909, justo antes de la Expo de 1913', 'Las tres torres de Gante en fila: mira al este', 'La iglesia de San Miguel nunca tuvo su aguja'],
  },
  'sint-niklaas': {
    nl: ['De kerk van de kooplui, uit de 13de eeuw', 'Blauwgrijze Doornikse steen: pure Scheldegotiek', 'Haar toren was Gents uitkijkpost, vóór het Belfort'],
    en: ['The merchants’ church, from the 13th century', 'Blue-grey Tournai stone: pure Scheldt Gothic', 'Its tower was Ghent’s lookout, before the Belfry'],
    fr: ['L’église des marchands, du XIIIe siècle', 'Pierre bleue de Tournai : pur gothique scaldien', 'Sa tour servait de guet, avant le Beffroi'],
    es: ['La iglesia de los mercaderes, del siglo XIII', 'Piedra gris azulada de Tournai: gótico del Escalda', 'Su torre fue la atalaya de Gante, antes del Campanario'],
  },
  'sint-baafs': {
    nl: ['Het Lam Gods van de Van Eycks, uit 1432', 'Een van de meest gestolen schilderijen ter wereld', 'Paneel gestolen in 1934, nooit teruggevonden'],
    en: ['Home of the Van Eycks’ Ghent Altarpiece, 1432', 'One of the most stolen paintings in the world', 'A panel stolen in 1934 was never found'],
    fr: ['L’Agneau mystique des Van Eyck, de 1432', 'L’un des tableaux les plus volés au monde', 'Un panneau volé en 1934, jamais retrouvé'],
    es: ['El Cordero Místico de los Van Eyck, de 1432', 'Uno de los cuadros más robados del mundo', 'Un panel robado en 1934 nunca apareció'],
  },
  belfort: {
    nl: ['91 meter hoog, begonnen in 1313', 'Bovenop waakt een vergulde draak', 'UNESCO-werelderfgoed, samen met de Lakenhalle'],
    en: ['91 metres tall, begun in 1313', 'A gilded dragon keeps watch on top', 'UNESCO World Heritage, with the Cloth Hall'],
    fr: ['91 mètres de haut, commencé en 1313', 'Un dragon doré veille au sommet', 'Patrimoine mondial de l’UNESCO, avec la halle aux draps'],
    es: ['91 metros de alto, empezado en 1313', 'Un dragón dorado vigila en lo alto', 'Patrimonio de la UNESCO, con la Lonja de los Paños'],
  },
  stadhuis: {
    nl: ['Twee stijlen in één: gotiek en renaissance', 'Geldgebrek en oorlog legden de bouw telkens stil', 'Hier tekende men in 1576 de Pacificatie van Gent'],
    en: ['Two styles in one: Gothic and Renaissance', 'Money and war kept halting the building', 'The Pacification of Ghent was signed here in 1576'],
    fr: ['Deux styles en un : gothique et Renaissance', 'L’argent et la guerre ont souvent stoppé le chantier', 'La Pacification de Gand y fut signée en 1576'],
    es: ['Dos estilos en uno: gótico y renacentista', 'El dinero y la guerra frenaron las obras una y otra vez', 'Aquí se firmó la Pacificación de Gante en 1576'],
  },
  vrijdagmarkt: {
    nl: ['Plein van markten, feesten en opstanden', 'Hier werden de graven van Vlaanderen ingehuldigd', 'Jacob van Artevelde, de brouwer die Gent in 1338 leidde'],
    en: ['A square of markets, feasts and revolts', 'The Counts of Flanders were sworn in here', 'Jacob van Artevelde, the brewer who led Ghent in 1338'],
    fr: ['La place des marchés, des fêtes et des révoltes', 'Les comtes de Flandre y étaient intronisés', 'Jacob van Artevelde, le brasseur qui mena Gand en 1338'],
    es: ['Plaza de mercados, fiestas y revueltas', 'Aquí se investía a los condes de Flandes', 'Jacob van Artevelde, el cervecero que guió Gante en 1338'],
  },
  'dulle-griet': {
    nl: ['Een kanon uit de 15de eeuw van 12 ton', 'De loop is 64 cm breed', 'Ligt hier al sinds 1578, felrood geverfd'],
    en: ['A 15th-century cannon weighing 12 tonnes', 'Its bore is 64 cm across', 'Lying here since 1578, painted bright red'],
    fr: ['Un canon du XVe siècle de 12 tonnes', 'Son calibre fait 64 cm', 'Ici depuis 1578, peint en rouge vif'],
    es: ['Un cañón del siglo XV de 12 toneladas', 'Su boca mide 64 cm', 'Aquí desde 1578, pintado de rojo vivo'],
  },
  'groot-vleeshuis': {
    nl: ['De vleeshal van de beenhouwers, uit 1406–1419', 'Onder het houten dak hangen hammen te drogen', 'Nu proef je er Oost-Vlaamse streekproducten'],
    en: ['The butchers’ meat hall, built 1406–1419', 'Hams still hang drying under the wooden roof', 'Now a place to taste East Flemish produce'],
    fr: ['La halle aux viandes des bouchers, 1406–1419', 'Des jambons sèchent sous la charpente en bois', 'On y goûte les produits de Flandre-Orientale'],
    es: ['El mercado de los carniceros, de 1406–1419', 'Bajo el techo de madera aún se secan jamones', 'Hoy se prueban productos de Flandes Oriental'],
  },
  gravensteen: {
    nl: ['De burcht van de graven, gebouwd in 1180', 'Later rechtbank, gevangenis en katoenspinnerij', 'In 1949 bezet door studenten, tegen duurder bier'],
    en: ['The Counts’ castle, built in 1180', 'Later a court, a prison and a cotton mill', 'Occupied by students in 1949 over pricier beer'],
    fr: ['Le château des comtes, bâti en 1180', 'Puis tribunal, prison et filature de coton', 'Occupé en 1949 par des étudiants, contre la bière plus chère'],
    es: ['El castillo de los condes, de 1180', 'Luego tribunal, cárcel e hilandería de algodón', 'Ocupado en 1949 por estudiantes, contra la cerveza cara'],
  },
  graslei: {
    nl: ['De middeleeuwse haven van Gent', 'Hier losten de schippers hun graan', 'Het Koornstapelhuis staat hier al sinds rond 1200'],
    en: ['Ghent’s medieval port', 'Boatmen unloaded their grain right here', 'The Koornstapelhuis has stood here since about 1200'],
    fr: ['Le port médiéval de Gand', 'Les bateliers y déchargeaient le grain', 'Le Koornstapelhuis est là depuis 1200 environ'],
    es: ['El puerto medieval de Gante', 'Aquí los barqueros descargaban el grano', 'El Koornstapelhuis está aquí desde hacia 1200'],
  },
};
