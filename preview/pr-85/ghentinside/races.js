// The routes: a walk through each building along its aisles. The game wants a route to put a
// track on; here they are only the paths to ride about on (riding about freely is the point).
// Nothing to jump or collect: no pickups, no obstacles.
const blurb = (nl, en) => ({ nl, en, fr: en, es: en });
const base = { hw: 3, pickups: [], obstacles: [], bikers: 0 };

export const RACES = [
  { id: 'baafs', name: { nl: 'Sint-Baafskathedraal', en: 'St Bavo’s Cathedral', fr: 'Cathédrale Saint-Bavon', es: 'Catedral de San Bavón' }, blurb: blurb('Een rondje door de zijbeuken en rond het koor van de kathedraal.', 'A lap through the aisles and round the choir of the cathedral.'), seed: 11, ...base },
  { id: 'niklaas', name: { nl: 'Sint-Niklaaskerk', en: 'St Nicholas’ Church', fr: 'Église Saint-Nicolas', es: 'Iglesia de San Nicolás' }, blurb: blurb('Een rondje door de zijbeuken van de kerk van de kooplui.', 'A lap through the aisles of the merchants’ church.'), seed: 12, ...base },
  { id: 'stadhuis', name: { nl: 'Stadhuis', en: 'City Hall', fr: 'Hôtel de ville', es: 'Ayuntamiento' }, blurb: blurb('Een rondje door de zalen van het stadhuis.', 'A lap through the halls of the city hall.'), seed: 13, ...base },
];
