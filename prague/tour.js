// The tour: a flight along the race route (races.js) over the roofs, slowing down at the sights on
// the way for a card about each (in English and Dutch; the other languages show the English), with
// the name of the street below in passing. Made from the route in map.js, then hand-written; see
// ghent/tour.js for everything a tour can have.
export const TOUR = {
  path: [
    [250, 57, 3], [237, 30, 16], [223, 3], [209, -19], [197, -47], [185, -75], [173, -103], [162, -131],
    [150, -158], [138, -186], [127, -214], [113, -234], [82, -224], [53, -214], [26, -201], [-3, -189],
    [-31, -178], [-61, -178], [-92, -186], [-120, -197], [-149, -207], [-178, -215], [-196, -216], [-207, -186],
    [-214, -156], [-220, -134], [-218, -103], [-227, -72], [-235, -43], [-243, -13], [-255, 18], [-263, 48],
    [-264, 67], [-232, 70], [-201, 68], [-171, 67], [-141, 65], [-110, 67], [-79, 67], [-68, 69],
    [-64, 100], [-62, 130], [-60, 134], [-44, 160], [-29, 185], [-14, 211], [4, 234], [34, 226],
    [65, 224], [84, 206], [101, 187], [105, 187], [134, 175], [158, 166], [185, 148], [211, 131],
    [237, 115], [263, 100], [257, 71], [250, 57],
  ],
  stops: [
    {
      emoji: '⛪', at: [197, -47], look: [290, 30, 32],
      text: {
        en: { name: 'Old Town Square', text: 'The Týn church with its two spiky towers, and the memorial to the reformer Jan Hus in the middle.' },
        nl: { name: 'Oudestadsplein', text: 'De Týnkerk met haar twee puntige torens, en in het midden het monument voor de hervormer Jan Hus.' },
      },
    },
    {
      emoji: '✡️', at: [113, -234], look: [76, 6, -327],
      text: {
        en: { name: 'Josefov', text: 'The Jewish Quarter, with the Old-New Synagogue, the oldest working synagogue in Europe.' },
        nl: { name: 'Josefov', text: 'De Joodse wijk, met de Oud-Nieuwe Synagoge, de oudste synagoge van Europa waar nog gebeden wordt.' },
      },
    },
    {
      emoji: '📚', at: [-60, 134], look: [-156, 6, 184],
      text: {
        en: { name: 'Klementinum', text: 'The old Jesuit college beside the Charles Bridge, with a baroque library hall.' },
        nl: { name: 'Klementinum', text: 'Het oude jezuïetencollege naast de Karelsbrug, met een barokke bibliotheekzaal.' },
      },
    },
    {
      emoji: '🕰️', at: [211, 131], look: [245, 30, 101],
      text: {
        en: { name: 'Astronomical clock', text: 'Made in 1410. Every hour the twelve apostles pass by its little windows.' },
        nl: { name: 'Astronomische klok', text: 'Gemaakt in 1410. Elk uur trekken de twaalf apostelen langs haar raampjes.' },
      },
    },
  ],
  end: { look: [290, 15, 32] },
  names: [
    { name: 'Staroměstské náměstí', at: [250, 57] },
    { name: 'Pařížská', at: [209, -19] },
    { name: 'Široká', at: [113, -234] },
    { name: '17. listopadu', at: [-196, -216] },
    { name: 'Křižovnická', at: [-220, -134] },
    { name: 'Platnéřská', at: [-264, 67] },
    { name: 'Mariánské náměstí', at: [-68, 69] },
    { name: 'Husova', at: [-60, 134] },
    { name: 'Karlova', at: [4, 234] },
    { name: 'Malé náměstí', at: [105, 187] },
  ],
};
