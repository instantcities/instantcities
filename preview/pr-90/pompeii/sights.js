// Pompeii's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In English and Dutch; the other languages show the English.
export const SIGHTS = [
  {
    id: 'forum', emoji: '🏛️', x: -137, z: 144, r: 80,
    text: {
      en: { name: 'The Forum', text: 'The square at the middle of Pompeii, 140 metres long, closed to carts. Temples, the basilica, the market and the offices of the town stood round it, and people came to trade, vote and hear the news.' },
      nl: { name: 'Het Forum', text: 'Het plein in het midden van Pompeii, 140 meter lang en gesloten voor karren. Tempels, de basiliek, de markt en de kantoren van de stad lagen eromheen. Mensen kwamen er handel drijven, stemmen en nieuws horen.' },
    },
  },
  {
    id: 'jupiter', emoji: '⛩️', x: -174, z: 58, r: 55,
    text: {
      en: { name: 'Temple of Jupiter', text: 'The main temple of the town, at the north end of the Forum, built for Jupiter, Juno and Minerva. Vesuvius stands right behind it. An earthquake in AD 62 had already damaged it, and it was still being repaired in AD 79.' },
      nl: { name: 'Jupitertempel', text: 'De hoofdtempel van de stad, aan het noordeinde van het Forum, gebouwd voor Jupiter, Juno en Minerva. De Vesuvius staat er vlak achter. Een aardbeving in het jaar 62 had hem al beschadigd, en in 79 werd hij nog hersteld.' },
    },
  },
  {
    id: 'basilica', emoji: '⚖️', x: -176, z: 226, r: 60,
    text: {
      en: { name: 'The Basilica', text: 'The law court and exchange, on the south-west corner of the Forum, about 150 BC. It is the oldest basilica we know of, and one of the biggest buildings in town.' },
      nl: { name: 'De basiliek', text: 'De rechtbank en beurs, op de zuidwesthoek van het Forum, rond 150 v.Chr. Het is de oudste basiliek die we kennen en een van de grootste gebouwen van de stad.' },
    },
  },
  {
    id: 'apollo', emoji: '☀️', x: -183, z: 160, r: 50,
    text: {
      en: { name: 'Temple of Apollo', text: 'The oldest temple in Pompeii, from the 6th century BC, standing in a court with a colonnade of 48 columns. Apollo was the town’s protector. The statues here are copies.' },
      nl: { name: 'Apollotempel', text: 'De oudste tempel van Pompeii, uit de 6de eeuw v.Chr., in een hof met een zuilengang van 48 zuilen. Apollo was de beschermer van de stad. De beelden hier zijn kopieën.' },
    },
  },
  {
    id: 'stepping-stones', emoji: '🪨', x: -60, z: 100, r: 40,
    text: {
      en: { name: 'Stepping stones', text: 'Streets ran with rainwater and rubbish, so there are blocks of lava to cross on. The gaps between them are as wide as a cart’s wheels, and you can still see the ruts the carts cut in the paving.' },
      nl: { name: 'Stapstenen', text: 'Straten stonden vol regenwater en afval, dus er liggen blokken lava om over te steken. De openingen ertussen zijn zo breed als de wielen van een kar, en je ziet nog de sporen die de karren in het plaveisel sleten.' },
    },
  },
  {
    id: 'stabian-baths', emoji: '🛁', x: 148, z: 52, r: 60,
    text: {
      en: { name: 'The Stabian Baths', text: 'The oldest public baths in Pompeii, with a gymnasium, a swimming pool and rooms of different heat. Most citizens went most days, and the stucco ceilings are still there.' },
      nl: { name: 'De Stabiaanse thermen', text: 'De oudste openbare baden van Pompeii, met een sportplein, een zwembad en zalen van verschillende temperatuur. De meeste inwoners kwamen er bijna dagelijks, en de stucplafonds zijn er nog.' },
    },
  },
  {
    id: 'lupanare', emoji: '🏮', x: 68, z: 11, r: 40,
    text: {
      en: { name: 'The Lupanare', text: 'A small two-floor brothel with ten rooms, the best known of the town’s many. Its stone beds and the pictures and graffiti on its walls are still there.' },
      nl: { name: 'Het Lupanar', text: 'Een klein bordeel op twee verdiepingen met tien kamers, het bekendste van de vele in de stad. De stenen bedden en de schilderingen en graffiti op de muren zijn er nog.' },
    },
  },
  {
    id: 'casa-del-fauno', emoji: '🗿', x: -170, z: -139, r: 70,
    text: {
      en: { name: 'House of the Faun', text: 'The biggest house in Pompeii, filling a whole block, with two atria and two gardens. A small bronze faun dances in its pool. The huge mosaic of Alexander the Great in battle was found here.' },
      nl: { name: 'Huis van de Faun', text: 'Het grootste huis van Pompeii, een heel bouwblok groot, met twee atria en twee tuinen. Een kleine bronzen faun danst in de vijver. Het enorme mozaïek van Alexander de Grote in de strijd werd hier gevonden.' },
    },
  },
  {
    id: 'grand-theatre', emoji: '🎭', x: 237, z: 214, r: 70,
    text: {
      en: { name: 'The Great Theatre', text: 'A Greek-style theatre cut into the hillside in the 2nd century BC, for about 5,000 people. The smaller Odeon beside it was roofed, for concerts and readings.' },
      nl: { name: 'Het Grote Theater', text: 'Een theater in Griekse stijl, in de 2de eeuw v.Chr. in de heuvel uitgehouwen, voor zo’n 5.000 mensen. Het kleinere Odeon ernaast had een dak, voor concerten en voordrachten.' },
    },
  },
  {
    id: 'amphitheatre', emoji: '🏟️', x: 952, z: -126, r: 120,
    text: {
      en: { name: 'The Amphitheatre', text: 'Built about 70 BC, the oldest stone amphitheatre there is, for some 20,000 people. In AD 59 a fight between the fans of Pompeii and Nuceria here ended in a riot, and Rome shut the arena for ten years.' },
      nl: { name: 'Het amfitheater', text: 'Gebouwd rond 70 v.Chr., het oudste stenen amfitheater dat er is, voor zo’n 20.000 mensen. In het jaar 59 liep hier een gevecht tussen de fans van Pompeii en Nuceria uit op rellen, en Rome sloot de arena tien jaar.' },
    },
  },
];
