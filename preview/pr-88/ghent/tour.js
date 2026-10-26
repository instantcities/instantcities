// The tour: a flight through the old town, from the Sint-Michielshelling over the Korenmarkt and
// the Sint-Baafsplein, past the Belfort and the Stadhuis to the Vrijdagmarkt and the Dulle Griet,
// down the Langemunt, right onto the Groentenmarkt past the neuzekes, by the Gravensteen, and low on
// the Leie between the Graslei and the Korenlei back to where it set off (hand-written).
//
// from:  where on the path [x, z] it sets off, if not at its start.
// path:  where the camera flies, [x, z, height] in game metres (the height above the street; left
//        out, the one before it). It follows the streets, a little over the roofs, and down in the
//        street at the start and the end; between the stops it climbs higher still (core/js/tour.js).
// stops: where it slows down and a card tells you what you are looking at: a sight of sights.js
//        (sight: its id) or its own words (emoji and text), at [x, z] on the path, looking at
//        look [x, y, z]; link: a page to read more, per language; card: how many metres before it its
//        card comes up, if not the usual.
// names: the street or square below, shown in passing, at [x, z] on the path.
// glances: on the way, the camera slows down and looks aside at look [x, y, z] for a moment, at [x, z]
//        (hold: it stands still there that many seconds; reach: it goes up to it and turns back, so
//        it looks no further than there coming up to it; who: one of city.js's characters, looked at
//        wherever they walk, see below).
// boat:  a stretch from [x, z] to [x, z] where it goes along behind a boat, which then sails `away`.
// boats: more boats on the water, moored or sailing a line.
// bus:   a bus driving along a line [x, z] beside the camera from the start.
// fall:  a cyclist riding a line [x, z] into the tram rails, who comes off as the camera gets to at.
// low:   stretches from [x, z] to [x, z] where it skims the street (or the water) instead of climbing.
// skies: the sky from [x, z] on the path on (a city without snow gets rain).
// end:   what it turns to look at, back where it set off.
// phases: the tour's parts on the bar at the top, each from [x, z] on the path.
// facts: the three short facts on a stop's card, per language (set from tourfacts.js below).
// Stops, names and glances each go in the order the path passes them: it goes over some streets twice.
// flyer:  one that comes flying in as the camera passes `join` to fly along with it and, from `leave` to `land`, away to
//        its place: the Belfort's dragon, which lands on the spire (stands: what stands there in
//        the city, kept out of sight until then; make: the one flying; home: where it sits, [x, y, z],
//        if the one standing there is not made yet).
// runner: one who waits in the street at `from`, runs along the path ahead of the camera from when it
//        gets to `go` (pace: how fast, the camera's 1; lead: metres ahead of it at least), off the
//        path at `off` straight to `to`, getting there as the camera gets to `arrive`, and then
//        climbs up (climb: seconds) to stand where `stands` does: Artevelde, onto his pedestal.
import { FACTS } from './tourfacts.js';
import { STATUE_FOOT, CLIMB_TIME } from './tourcast-config.js';

export const TOUR = {
  from: [-323, -66], // on the Sint-Michielshelling: the Graslei, the Leie, the bridge and St Nicholas’ Church right ahead
  path: [
    [-425, -54, 5], [-395, -59], [-355, -63], [-318, -66, 6.5], [-292, -68, 7.5], [-262, -69, 7], [-245, -70, 6],
    [-215, -70, 5.5], [-190, -71, 5], [-172, -70, 7], [-160, -67, 12], [-140, -63, 24], [-118, -58, 30], [-93, -50],
    [-70, -45], [-48, -39], [-20, -33], [10, -29],
    [40, -24, 30], [70, -18], [103, -12], [135, -4], [165, 8],
    // a wide turn up from the cathedral, and on west to the Belfort to come round it, level with
    // its golden dragon: a circle (26 m round the spire) from its south side round the west to its
    // north, joined and left along it, then down to the Botermarkt
    [188, 16, 34], [202, 4, 42], [198, -12, 54], [178, -20, 68], [150, -18, 86], [125, -15, 100], [108, -14, 107],
    [91.0, -14.0, 110], [81.1, -16.0], [72.6, -21.6], [67.0, -30.1], [65.0, -40.0], [67.0, -49.9], [72.6, -58.4, 108], [81.1, -64.0, 104], [91.0, -66.0, 98],
    [112, -68, 88], [128, -78, 70], [140, -94, 46], [147, -108, 22], [149, -117, 8],
    // down to just before the wedding party at the Stadhuis's perron, and on low up the Belfortstraat (by the
    // Stroppendragers coming down it)
    [142.5, -124.4, 2.4], [151, -131, 5], [158, -139, 6], [167, -157, 8], [182, -190, 9], [215, -224, 10], [250, -262, 10],
    // along the Belfortstraat to its corner, round it into the Kammerstraat (over the street, not across the
    // block's roofs inside the bend), and down it before the Vrijdagmarkt, to come onto it low
    [273, -284, 11], [295, -307, 12], [310, -322, 13], [301, -333, 13], [276, -352, 11], [255, -368, 9], [240, -381, 7.5], [218, -401, 6.5], [195, -424, 6],
    // low over the Vrijdagmarkt up to Artevelde's statue in its middle, past the front of it, and low through the streets from there: across the Grootkanonplein
    // past the Dulle Griet (clear of its three trees) and down the Langemunt to the Groentenmarkt
    [182, -455, 4.5], [170, -478, 4], [163, -495, 4], [146, -492, 4.5], [125, -491, 5], [110, -492], [103, -494], [99, -498], [76, -509.5], [56, -522], [50, -526],
    [43, -529.5], [37, -525], [22, -505], [4, -485], [-12, -463], [-27, -441], [-47, -410], [-64, -387],
    [-80, -367], [-92, -355], [-100, -352, 5], [-108, -350, 4.5], [-117, -350, 3.5], [-125, -348, 3],
    // onto the Groentenmarkt in an arc, to come straight at the neuzekes carts, between the trees
    [-130, -341, 2.7], [-129.5, -333.4, 2.4], [-124, -325, 2.2],
    [-126, -333, 6], [-122, -345, 14], [-127, -357, 12], [-136, -370, 18], [-152, -392, 22], [-170, -425, 28], [-190, -455], [-215, -470, 30], [-250, -467, 32], [-290, -461, 30],
    // down the Burgstraat as far as the corner, before De Gekroonde Hoofden, and round into the Jan Breydelstraat
    [-326, -455, 22], [-345, -451, 18], [-340, -430, 24], [-334, -400, 28], [-322, -375, 30], [-312, -350, 26], [-306, -320, 19], [-299, -296, 11],
    [-288, -266, 5], [-286, -235, 3], [-289, -200], [-290, -173], [-289, -140],
    // off the water onto the Korenlei, down it past Zakman, and beside the bridge (not over it) onto
    // the Sint-Michielshelling, back to where it set off
    [-293, -122, 3.5], [-302, -112, 3], [-307.5, -100, 2.6], [-307, -88], [-313, -80.5, 3], [-326, -72, 3.5],
    [-345, -67, 4], [-370, -62, 5], [-395, -59], [-425, -54],
  ],
  stops: [
    {
      sight: 'sint-michielsbrug', at: [-245, -70], look: [-60, 30, -60], card: 75, // up as it goes onto the bridge
      link: { nl: 'https://visit.gent.be/nl/zien-doen/sint-michielsbrug-romantiek-gent', en: 'https://visit.gent.be/en/see-do/st-michaels-bridge-romantic-ghent', fr: 'https://visit.gent.be/fr/voir-et-faire/pont-saint-michel-romantiques', es: 'https://visit.gent.be/es/ver-y-hacer/el-romantico-puente-de-san-miguel' },
    },
    {
      sight: 'sint-niklaas', at: [-160, -67], look: [-70, 20, -84],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/sint-niklaaskerk', en: 'https://visit.gent.be/en/see-do/st-nicholas-church', fr: 'https://visit.gent.be/fr/voir-et-faire/eglise-saint-nicolas', es: 'https://visit.gent.be/es/ver-y-hacer/iglesia-de-san-nicolas' },
    },
    {
      sight: 'sint-baafs', at: [165, 8], look: [244, 92, 47],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/sint-baafskathedraal', en: 'https://visit.gent.be/en/see-do/st-bavos-cathedral', fr: 'https://visit.gent.be/fr/voir-et-faire/cathedrale-saint-bavon', es: 'https://visit.gent.be/es/ver-y-hacer/catedral-de-san-bavon' },
    },
    {
      sight: 'belfort', at: [67, -30], look: [91, 114, -40],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/het-belfort-van-gent', en: 'https://visit.gent.be/en/see-do/ghent-belfry', fr: 'https://visit.gent.be/fr/voir-et-faire/le-beffroi', es: 'https://visit.gent.be/es/ver-y-hacer/el-campanario' },
    },
    {
      sight: 'stadhuis', at: [198, -207], look: [140, 10, -160],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/stadhuis-van-gent', en: 'https://visit.gent.be/en/see-do/ghent-town-hall', fr: 'https://visit.gent.be/fr/voir-et-faire/lhotel-de-ville-de-gand', es: 'https://visit.gent.be/es/ver-y-hacer/el-ayuntamiento-de-gante' },
    },
    {
      sight: 'vrijdagmarkt', at: [195, -424], look: [158, 6, -506],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/blijde-intrede-op-de-vrijdagmarkt', en: 'https://visit.gent.be/en/see-do/royal-welcome-vrijdagmarkt', fr: 'https://visit.gent.be/fr/voir-et-faire/joyeuse-entree-sur-le-vrijdagmarkt', es: 'https://visit.gent.be/es/ver-y-hacer/entrando-en-la-vrijdagmarkt' },
    },
    {
      id: 'dulle-griet', emoji: '💣', at: [50, -529], look: [28, 2, -539],
      text: {
        nl: { name: 'Dulle Griet', text: 'Een reusachtig kanon uit de 15de eeuw, 5 m lang en 12 ton zwaar, gesmeed uit ijzeren staven met ringen eromheen. De loop is 64 cm breed. Het bleek te zwaar om mee op te trekken, en Gent heeft het nooit meer laten vertrekken: sinds 1578 ligt het hier rood geverfd naast de Vrijdagmarkt.' },
        en: { name: 'Mad Meg (Dulle Griet)', text: 'A giant 15th-century cannon, 5 m long and 12 tonnes heavy, forged from iron bars held together by hoops. Its bore is 64 cm across. Too heavy to take on campaign, it never left again: since 1578 it has lain here, painted red, just off the Vrijdagmarkt.' },
        fr: { name: 'Margot l’Enragée (Dulle Griet)', text: 'Un canon géant du XVe siècle, long de 5 m et lourd de 12 tonnes, forgé de barres de fer cerclées d’anneaux. Son calibre fait 64 cm. Trop lourd pour partir en campagne, il n’est plus jamais reparti : depuis 1578 il repose ici, peint en rouge, à côté du Vrijdagmarkt.' },
        es: { name: 'Margarita la Loca (Dulle Griet)', text: 'Un cañón gigante del siglo XV, de 5 m de largo y 12 toneladas, forjado con barras de hierro unidas por aros. Su boca mide 64 cm. Demasiado pesado para llevarlo a la guerra, ya nunca se movió: desde 1578 descansa aquí, pintado de rojo, junto al Vrijdagmarkt.' },
      },
    },
    {
      sight: 'groot-vleeshuis', at: [-122, -345], look: [-185, 8, -350],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/groot-vleeshuis', en: 'https://visit.gent.be/en/eat-drink/great-butchers-hall', fr: 'https://visit.gent.be/fr/boire-manger/la-grande-boucherie', es: 'https://visit.gent.be/es/comida-bebida/la-lonja-de-la-carne' },
    },
    {
      sight: 'gravensteen', at: [-215, -470], look: [-255, 14, -515],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/gravensteen', en: 'https://visit.gent.be/en/see-do/castle-counts', fr: 'https://visit.gent.be/fr/voir-et-faire/le-chateau-des-comtes', es: 'https://visit.gent.be/es/ver-y-hacer/castillo-de-los-condes' },
    },
    {
      sight: 'graslei', at: [-289, -200], look: [-245, 8, -200],
      link: { nl: 'https://visit.gent.be/nl/zien-doen/historiek-op-de-gras-en-korenlei', en: 'https://visit.gent.be/en/see-do/history-graslei-and-korenlei', fr: 'https://visit.gent.be/fr/voir-et-faire/lhistoire-des-graslei-et-korenlei', es: 'https://visit.gent.be/es/ver-y-hacer/los-historicos-graslei-y-korenlei' },
    },
  ],
  // on the bridge a look to the left, down the Leie to the Graslei; on the Korenmarkt slowly by the
  // cyclist coming off; round the Belfort at its dragon (just landed there); on the Botermarkt up to the wedding
  // party, low, and back; down at the Stroppendragers in the Belfortstraat; Artevelde from the front on the Vrijdagmarkt, climbing onto his pedestal; on the Groentenmarkt straight up to the neuzekes carts, low, and back; and
  // at De Gekroonde Hoofden from the corner of the Burgstraat; at the end down the Korenlei, close by Zakman walking up it
  // (who: a character of city.js, looked at where they walk, put at `put` walking towards `to` as the
  // camera passes `when`, so they are just coming by)
  glances: [
    { at: [-292, -68], look: [-262, 9, -200], before: 40, after: 30, slow: 8 },
    { at: [-186, -70.8], look: [-157.6, 0.8, -73.9], before: 20, after: 6, slow: 18 }, // the cyclist in the rails, slowly by
    { at: [81.1, -64], look: [91, 114, -40], before: 45, after: 40, slow: 12 }, // the dragon, as it goes round
    { at: [142.5, -124.4], look: [135.2, 1.3, -128.4], before: 35, after: 12, slow: 2, reach: true }, // the newly-weds, and back
    { at: [167, -157], look: [195, 1.5, -201], before: 22, after: 18, slow: 6 }, // the Stroppendragers coming up the Belfortstraat (stroppen.js), straight after
    { at: [163, -495], look: [158, 8.5, -506], before: 50, after: 25, slow: 7 }, // Artevelde, from the front, as he climbs up onto his pedestal (up at him, turning to bronze up there)
    { at: [-124, -325], look: [-119, 1.2, -319], before: 40, after: 12, slow: 2, reach: true }, // the neuzekes, and back
    { at: [-345, -451], look: [-360, 9, -461], before: 35, after: 15, slow: 9 }, // De Gekroonde Hoofden, from the corner of the Burgstraat
    { at: [-307.5, -100], look: [-303, 1.4, -96], before: 20, after: 6, slow: 5, who: { name: 'Zakman', when: [-290, -180], put: [-303, -88], to: [-309, -150] } },
  ],
  // no climbing over the roofs: up to the Belfort's spire and round it (the path's own heights), and
  // skimming the street: from the start over the bridge to the Korenmarkt, from the Kammerstraat over the Vrijdagmarkt
  // through the streets to the Groentenmarkt,
  // and on the Leie between the Graslei and the Korenlei, and down the Korenlei, back to where it started
  low: [[[-425, -54], [-172, -70]], [[170, -6], [-122, -345]], [[-215, -470], [-425, -54]]],
  // on the Leie, along behind one of the Bootjes van Gent, which sails on under the bridge
  // (close behind it: ahead, in metres along the path)
  boat: { from: [-286, -235], to: [-289, -140], ahead: 9, away: [[-279, -62], [-276, -30], [-270, 0], [-262, 30]] },
  // and more of them on the Leie from the start: one moored along the Graslei's quay, and one coming
  // down the middle towards the bridge as the camera looks down the river from it (line: [x, z]
  // from where it starts, speed in m/s; moored without one)
  boats: [
    { line: [[-274, -178], [-273, -196]] },
    { line: [[-286, -218], [-289.5, -172], [-288.5, -127], [-280, -66], [-276, -30], [-270, 0], [-262, 30]], speed: 3 },
  ],
  // a De Lijn bus beside the camera from the start, up the Sint-Michielshelling and over the bridge
  // (bus lines 10, 11 and 12 as transit.js has them), to its stop at the end of the line on the
  // Korenmarkt, slower than the camera, which overtakes it (lane: metres right of the line, ahead:
  // metres ahead of the camera at the start, pace: how fast it goes, the camera's 1)
  bus: { line: [[-440, -51], [-426, -53], [-409, -57], [-398, -59], [-375, -62], [-356, -64], [-346, -65], [-315, -66], [-303, -67], [-249, -69], [-247, -69]], lane: 3.5, ahead: 6, pace: 0.7 },
  // on the Korenmarkt a cyclist rides along the tram rails from the Sint-Niklaas side, gets the front
  // wheel caught in one and comes off, as you see them do there all the time (pace: how fast, the
  // camera's 1; it comes off as the camera gets to at)
  fall: { line: [[-123.3, -63.2], [-132.2, -65.3], [-145.7, -68.4], [-155, -72.2], [-157.6, -73.9]], at: [-196, -70.5], pace: 0.35 },
  // the sky as it goes, each from [x, z] on: it sets off on a rainy night, which turns to day just as
  // it goes onto the bridge (its card up by then); night falls over the Vrijdagmarkt (a fade takes 8 s), and it
  // starts to snow by the Dulle Griet, on into the Langemunt; and it is
  // dry and sunny again by the Gravensteen, and so along the Graslei and the Korenlei; and night
  // again (dry) at the end, coming round onto the Sint-Michielshelling, as it set off
  skies: [
    { at: [-425, -54], sky: 'night:rain' },
    { at: [-329, -65], sky: 'day:clear' },
    { at: [195, -424], sky: 'night:clear' },
    { at: [76, -509.5], sky: 'night:snow' },
    { at: [-170, -425], sky: 'day:clear' },
    { at: [-313, -80.5], sky: 'night:clear' },
  ],
  // the Belfort's gilded dragon comes flying in over the Korenmarkt, once the cyclist has come off in the rails (join), flies along, and lands on top of the spire as the
  // camera comes round it, just before it turns to look at it there
  flyer: { stands: 'dragon', join: [-172, -70], home: [91, 110.5, -40], leave: [150, -18], land: [72.6, -21.6] },
  // and Jacob van Artevelde sets off from halfway down the Kammerstraat as the camera comes down the
  // Belfortstraat, so he is well ahead as it turns the corner, out onto the Vrijdagmarkt and straight
  // across to his statue, getting there just past the square's stop, and is up on it and bronze as the
  // camera comes up to look at him from the front
  runner: { stands: 'artevelde', from: [255, -368], go: [250, -262], pace: 0.47, lead: 6, off: [195, -424], to: STATUE_FOOT, arrive: [182, -455], climb: CLIMB_TIME },
  // and at the end, back where it set off, it turns to the three towers again
  end: { look: [-60, 30, -60] },
  // the tour's parts, as the bar at the top shows them: each starts at [x, z] on the path, and a
  // click on one goes back to its start
  phases: [
    { name: 'Sint-Michielsbrug', at: [-425, -54] },
    { name: 'Korenmarkt', at: [-215, -70] },
    { name: 'Sint-Baafsplein', at: [10, -29] },
    { name: 'Belfort & Stadhuis', at: [125, -15] },
    { name: 'Vrijdagmarkt', at: [250, -262] },
    { name: 'Dulle Griet & Langemunt', at: [103, -494] },
    { name: 'Groentenmarkt', at: [-10, -464] },
    { name: 'Gravensteen', at: [-136, -370] },
    { name: 'Graslei', at: [-322, -375] },
    { name: 'Korenlei', at: [-290, -173] },
  ],
  names: [
    { name: 'Sint-Michielshelling', at: [-395, -59] },
    { name: 'Korenmarkt', at: [-215, -70] },
    { name: 'Cataloniëstraat', at: [-93, -50] },
    { name: 'Emile Braunplein', at: [10, -29] },
    { name: 'Sint-Baafsplein', at: [103, -12] },
    { name: 'Botermarkt', at: [146, -108] },
    { name: 'Belfortstraat', at: [215, -224] },
    { name: 'Kammerstraat', at: [301, -333] },
    { name: 'Vrijdagmarkt', at: [182, -455] },
    { name: 'Grootkanonplein', at: [76, -514] },
    { name: 'Langemunt', at: [-10, -464] },
    { name: 'Groentenmarkt', at: [-107, -338] },
    { name: 'Sint-Veerleplein', at: [-190, -455] },
    { name: 'De Gekroonde Hoofden', at: [-326, -455] },
    { name: 'Jan Breydelstraat', at: [-322, -375] },
    { name: 'Leie: Graslei en Korenlei', at: [-286, -235] },
    { name: 'Korenlei', at: [-302, -112] },
    { name: 'Sint-Michielshelling', at: [-360, -63] },
  ],
};

// each stop's card: three short facts (tourfacts.js) instead of the sight's sentences
for (const st of TOUR.stops) st.facts = FACTS[st.sight ?? st.id];
