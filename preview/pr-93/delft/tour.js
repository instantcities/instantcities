// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [75, -125, 3], [57, -148, 16], [34, -160], [8, -145], [-11, -160], [7, -180], [32, -196], [57, -212],
    [83, -228], [108, -245], [133, -261], [159, -277], [184, -294], [204, -312], [179, -328], [152, -343],
    [126, -359], [101, -375], [77, -390], [51, -385], [24, -369], [-2, -354], [-29, -338], [-55, -323],
    [-80, -309], [-103, -293], [-129, -278], [-154, -264], [-179, -251], [-203, -235], [-194, -210], [-180, -183],
    [-165, -157], [-150, -130], [-136, -104], [-124, -78], [-113, -49], [-100, -24], [-86, 3], [-72, 30],
    [-58, 57], [-43, 84], [-29, 110], [-16, 138], [-2, 165], [11, 192], [24, 219], [37, 246],
    [49, 275], [60, 304], [71, 332], [85, 360], [99, 388], [122, 386], [148, 371], [173, 357],
    [186, 335], [176, 308], [164, 281], [151, 253], [139, 225], [126, 197], [113, 171], [100, 144],
    [88, 116], [75, 89], [63, 61], [50, 33], [37, 6], [23, -21], [18, -48], [45, -63],
    [69, -78], [95, -94], [121, -110], [125, -134], [101, -139], [75, -125],
  ],
  stops: [
    {
      emoji: '⛪', at: [57, -148], look: [188, 60, -221],
      text: {
        en: { name: 'Markt and Nieuwe Kerk', text: 'The long market square, with the town hall at one end and the Nieuwe Kerk at the other. Its tower is 108 metres tall, and the princes of Orange lie buried below it.' },
        nl: { name: 'Markt en Nieuwe Kerk', text: 'Het lange marktplein, met het stadhuis aan het ene eind en de Nieuwe Kerk aan het andere. De toren is 108 meter hoog, en de prinsen van Oranje liggen eronder begraven.' },
      },
    },
    {
      emoji: '🎨', at: [83, -228], look: [86, 6, -195],
      text: {
        en: { name: 'Vermeer Centrum', text: 'On the Voldersgracht, where the painters’ guild of Saint Luke stood. Johannes Vermeer led it, and painted the View of Delft from just outside the town.' },
        nl: { name: 'Vermeer Centrum', text: 'Aan de Voldersgracht, waar het Sint-Lucasgilde van de schilders stond. Johannes Vermeer was er hoofdman, en schilderde het Gezicht op Delft van net buiten de stad.' },
      },
    },
    {
      emoji: '⛪', at: [-179, -251], look: [-190, 30, -292],
      text: {
        en: { name: 'Oude Kerk', text: 'The oldest church in Delft. Its tower leans about two metres over the canal, and Vermeer lies buried inside.' },
        nl: { name: 'Oude Kerk', text: 'De oudste kerk van Delft. De toren helt zo’n twee meter over de gracht, en Vermeer ligt er begraven.' },
      },
    },
    {
      emoji: '🔫', at: [-194, -210], look: [-283, 8, -244],
      text: {
        en: { name: 'Prinsenhof', text: 'The old convent where William of Orange lived. He was shot on its stairs on 10 July 1584, and the bullet holes are still in the wall.' },
        nl: { name: 'Prinsenhof', text: 'Het oude klooster waar Willem van Oranje woonde. Op 10 juli 1584 werd hij er op de trap neergeschoten, en de kogelgaten zitten nog in de muur.' },
      },
    },
    {
      emoji: '🌾', at: [100, 144], look: [37, 4, 6],
      text: {
        en: { name: 'Koornmarkt', text: 'The canal where the grain was traded, now lined with terraces on the quay and on pontoons in the water.' },
        nl: { name: 'Koornmarkt', text: 'De gracht waar het graan verhandeld werd, nu vol terrassen op de kade en op vlotten in het water.' },
      },
    },
  ],
  // a clear day from the start, and night along the Koornmarkt, when the canals mirror the lights
  skies: [
    { at: [34, -160], sky: 'day:clear' },
    { at: [173, 357], sky: 'night:clear' },
  ],
  end: { look: [188, 60, -221] },
  names: [
    { name: 'Markt', at: [75, -125] },
    { name: 'Voldersgracht', at: [-11, -160] },
    { name: 'Vrouwjuttenland', at: [204, -312] },
    { name: 'Choorstraat', at: [77, -390] },
    { name: 'Heilige Geestkerkhof', at: [-103, -293] },
    { name: 'Oude Delft', at: [-203, -235] },
    { name: 'Breestraat', at: [99, 388] },
    { name: 'Koornmarkt', at: [186, 335] },
    { name: 'Oude Langendijk', at: [18, -48] },
    { name: 'Markt', at: [125, -134] },
  ],
};
