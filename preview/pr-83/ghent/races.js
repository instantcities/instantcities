// The race routes in Ghent. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers.
export const RACES = [
  {
    id: 'gentcentrum',
    name: { nl: 'Gent Centrum', en: 'Ghent Centre', fr: 'Centre de Gand', es: 'Centro de Gante' },
    blurb: {
      nl: 'Langs het Belfort, de Sint-Baafskathedraal en de Sint-Niklaaskerk: Sint-Baafsplein, Lange Kruisstraat, Voldersstraat, Veldstraat en Korenmarkt.',
      en: 'Past the Belfry, St Bavo’s Cathedral and St Nicholas’ Church: Sint-Baafsplein, Lange Kruisstraat, Voldersstraat, Veldstraat and Korenmarkt.',
      fr: 'Au pied du Beffroi, de la cathédrale Saint-Bavon et de l’église Saint-Nicolas : Sint-Baafsplein, Lange Kruisstraat, Voldersstraat, Veldstraat et Korenmarkt.',
      es: 'Junto al Campanario, la catedral de San Bavón y la iglesia de San Nicolás: Sint-Baafsplein, Lange Kruisstraat, Voldersstraat, Veldstraat y Korenmarkt.',
    },
    seed: 9050,
  },
  {
    id: 'brugsepoort',
    name: { nl: 'Brugse Poort', en: 'Brugse Poort', fr: 'Brugse Poort', es: 'Brugse Poort' },
    blurb: {
      nl: 'De Brugse Poort: Cederstraat, Sparrestraat, Meibloemstraat, Boerderijstraat en Kastanjestraat.',
      en: 'The Brugse Poort: Cederstraat, Sparrestraat, Meibloemstraat, Boerderijstraat and Kastanjestraat.',
      fr: 'Le Brugse Poort : Cederstraat, Sparrestraat, Meibloemstraat, Boerderijstraat et Kastanjestraat.',
      es: 'El Brugse Poort: Cederstraat, Sparrestraat, Meibloemstraat, Boerderijstraat y Kastanjestraat.',
    },
    seed: 9000,
    bikers: 10,
  },
  // the open routes: from one place to another, start to finish
  {
    id: 'pietersdampoort',
    name: { nl: 'Sint-Pieters → Dampoort', en: 'Sint-Pieters → Dampoort', fr: 'Sint-Pieters → Dampoort', es: 'Sint-Pieters → Dampoort' },
    blurb: {
      nl: 'Van station Gent-Sint-Pieters dwars door de stad naar station Dampoort: Kortrijksepoortstraat, Veldstraat, Korenmarkt, Vrijdagmarkt en Steendam.',
      en: 'From Gent-Sint-Pieters station right across the city to Dampoort station: Kortrijksepoortstraat, Veldstraat, Korenmarkt, Vrijdagmarkt and Steendam.',
      fr: 'De la gare de Gand-Saint-Pierre à la gare de Dampoort, à travers toute la ville : Kortrijksepoortstraat, Veldstraat, Korenmarkt, Vrijdagmarkt et Steendam.',
      es: 'De la estación de Gent-Sint-Pieters a la de Dampoort, cruzando toda la ciudad: Kortrijksepoortstraat, Veldstraat, Korenmarkt, Vrijdagmarkt y Steendam.',
    },
    seed: 9150,
    bikers: 8,
  },
  {
    id: 'overpoort',
    name: { nl: 'Overpoort → S.M.A.K.', en: 'Overpoort → S.M.A.K.', fr: 'Overpoort → S.M.A.K.', es: 'Overpoort → S.M.A.K.' },
    blurb: {
      nl: 'Van het Sint-Pietersplein door de Overpoortstraat en over de dreven van het Citadelpark tot aan het S.M.A.K.',
      en: 'From Sint-Pietersplein down the Overpoortstraat and along the lanes of the Citadelpark to the S.M.A.K.',
      fr: 'De la Sint-Pietersplein par l’Overpoortstraat et les allées du Citadelpark jusqu’au S.M.A.K.',
      es: 'De la Sint-Pietersplein por la Overpoortstraat y los paseos del Citadelpark hasta el S.M.A.K.',
    },
    seed: 9200,
    bikers: 5,
  },
];
