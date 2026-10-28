// The race routes in Barcelona. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'rambla',
    name: { nl: 'Rambla en Barri Gòtic', en: 'Rambla and Gothic Quarter', fr: 'Rambla et quartier gothique', es: 'Rambla y Barrio Gótico' },
    blurb: {
      nl: 'Van de Plaça de Catalunya de Rambla af tot het standbeeld van Columbus, door de Gotische wijk langs de Plaça de Sant Jaume en de kathedraal en over de Portal de l’Àngel terug.',
      en: 'From Plaça de Catalunya down the Rambla to the Columbus monument, through the Gothic Quarter past Plaça de Sant Jaume and the cathedral, and back up Portal de l’Àngel.',
      fr: 'De la Plaça de Catalunya en descendant la Rambla jusqu’à la statue de Colomb, par le quartier gothique devant la Plaça de Sant Jaume et la cathédrale, et retour par le Portal de l’Àngel.',
      es: 'De la Plaça de Catalunya Rambla abajo hasta el monumento a Colón, por el Barrio Gótico junto a la Plaça de Sant Jaume y la catedral, y de vuelta por el Portal de l’Àngel.',
    },
    seed: 9800,
    hw: 4,
    bikers: 5,
  },
  // the open routes: from one place to another, start to finish
  {
    id: 'gaudi',
    name: { nl: 'Plaça de Catalunya → Sagrada Família', en: 'Plaça de Catalunya → Sagrada Família', fr: 'Plaça de Catalunya → Sagrada Família', es: 'Plaça de Catalunya → Sagrada Família' },
    blurb: {
      nl: 'Van de Plaça de Catalunya de Passeig de Gràcia op, langs de Casa Batlló, en dan dwars door de Eixample over de Carrer de València tot aan de Sagrada Família.',
      en: 'From Plaça de Catalunya up Passeig de Gràcia past Casa Batlló, then across the Eixample along Carrer de València to the Sagrada Família.',
      fr: 'De la Plaça de Catalunya en remontant le Passeig de Gràcia devant la Casa Batlló, puis à travers l’Eixample par le Carrer de València jusqu’à la Sagrada Família.',
      es: 'De la Plaça de Catalunya subiendo por el Passeig de Gràcia junto a la Casa Batlló, y luego a través del Eixample por el Carrer de València hasta la Sagrada Família.',
    },
    seed: 9810,
    hw: 4,
    bikers: 5,
  },
  {
    id: 'platja',
    name: { nl: 'Colom → Platja', en: 'Colom → Platja', fr: 'Colom → Platja', es: 'Colom → Platja' },
    blurb: {
      nl: 'Van het Columbusmonument langs de haven naar Barceloneta, door de Passeig de Joan de Borbó naar zee en over de boulevard langs het strand.',
      en: 'From the Columbus monument along the port to Barceloneta, down Passeig de Joan de Borbó to the sea and along the promenade by the beach.',
      fr: 'Du monument à Colomb le long du port jusqu’à la Barceloneta, par le Passeig de Joan de Borbó jusqu’à la mer et sur la promenade le long de la plage.',
      es: 'Del monumento a Colón por el puerto hasta la Barceloneta, por el Passeig de Joan de Borbó hasta el mar y por el paseo junto a la playa.',
    },
    seed: 9820,
    hw: 4,
    bikers: 4,
  },
];
