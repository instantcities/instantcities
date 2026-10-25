// The demo: a film of about a minute about the game, cut together from the tour and from the game
// itself, to the tour's music, every shot fading to black and back in a flash (hand-written).
// The menu's 🎞️ Trailer card plays it (under Tour), or a link: /ghent/?demo; `node tools/demo.mjs
// ghent` films it frame by frame to tools/cache/demo/ghent.mp4, with the music under it.
//
// Each shot runs `for` seconds, one after the other, in this order, and has a `name` for its part of
// the bar at the top (as the tour's). What it shows is one of:
//   tour:    the tour, from [x, z] on its path (ghent/tour.js) on, playing on its own (welcome: from
//            its very start instead, its welcome and all; speed: how fast, the tour's speed button's
//            1; cards: false, without the cards about the sights that come up on it; pre: seconds
//            of it played out of sight before the shot shows)
//   quest:   a quest of quests.js by its id, from its start (brief: seconds its story card shows
//            before it begins; pre: seconds played out of sight before the shot shows, to get to the
//            good bit; tired: the thief weaving from the start, as after a while; behind: then put
//            on the thief's trail that many metres behind them; mount: riding that instead of the
//            quest's own; steady: never caught in the tram rails by bike)
//   race:    a race of races.js by its id, from the countdown (pre: seconds of it played out of sight)
//   explore: riding about freely, from at [x, z] looking at look [x, z], on mount (bike, foot, horse...);
//            car: at the wheel of one instead ('police', 'bus')
// and who plays it, for a quest or riding about (`drive`):
//   'chase': after the quest's thief, along the streets the thief ran down
//   'shoot': spraying the paintball gun at the passers-by and the cars going by, the nearest first
//   'race':  as the computer riders ride a race
//   board:   seconds into the shot the player gets into the quest's bus, walking up to it till then
//   unblock: no traffic in the way along those points (none from the start, and none appearing on them)
//   'heli':  flying the helicopter to the next swimmer, hovering low over them for the winch, and on
//            (turn: first that many seconds round in a banking circle, once on screen; turnSide: -1
//            the other way)
// pace: how much faster than real time the game plays in a shot (1.25: a quarter faster)
//   [[x, z], ...]: along those points, one after the other, and on straight after the last
// title, sub: words over the shot (per language, or the same in all), from `at` seconds into it
// (*this* in the accent colour, light blue: Instant *Gent*).
// card: the words big and bold in the middle, the picture darkened round them, with cta: a button
// under them (the film's last shot: its name and where to play it); hold: the last shot stays up at
// the end instead of going to black (the music still fades out).
// brand: the name in the bottom right corner all along; fade: seconds to black and back between two
// shots (fadeIn: up from black at the very start, 0: none, the first picture already the shot);
// welcome: the tour's welcome card in these words instead, up from the film's first picture (its
// thumbnail), its *part* typed in a letter at a time from welcomeType seconds on; music: the
// tour's (core/sounds/tour.mp3), from `from` seconds into it, fading out over the film's last
// `out` seconds.
export const DEMO = {
  fade: 0.18,
  fadeIn: 0,
  welcome: { nl: 'Dit is *Instant* Gent', en: 'This is *Instant* Ghent', fr: 'Voici *Instant* Gand', es: 'Esto es *Instant* Gante' },
  welcomeType: 1.4,
  music: { name: 'tour', from: 0, out: 2.5 },
  brand: { name: 'instant*gent*.be', sub: { nl: 'Gratis, in je browser', en: 'Free, in your browser', fr: 'Gratuit, dans ton navigateur', es: 'Gratis, en tu navegador' } },
  shots: [
    // as the tour sets off: up from black on a rainy night on the Sint-Michielshelling, its welcome,
    // the rain clearing into the sun as it goes onto the bridge, and on to the Korenmarkt
    { name: 'Gent', tour: [-425, -54], welcome: true, speed: 1.5, for: 13 },
    // along with the dragon from the Sint-Baafs, round to the Belfort where it lands on the spire
    { name: 'Belfort', tour: [202, 4], for: 5, speed: 1.5 },
    // Jacob van Artevelde at his pedestal on the Vrijdagmarkt, climbing up it, pointing out over the
    // square and turning to bronze: he starts up it as the camera gets to [182, -455] (tour.js
    // runner arrive), about as the shot shows, and is the statue 4.6 s later (ghent/tourcast.js)
    { name: 'Vrijdagmarkt', tour: [184, -451], pre: 1.2, for: 5.3, cards: false },
    // in the snow, at night, over the Christmas market on the Groentenmarkt
    { name: 'Kerstmarkt', tour: [-126, -333], for: 2.5 },
    // and then the game itself: on horseback off the Korenlei into the Leie, the Graslei across the
    // water, and on as one of the Bootjes van Gent towards the Sint-Michielsbrug
    { name: { nl: 'Bootje', en: 'Boat', fr: 'Bateau', es: 'Barco' }, explore: { at: [-312, -200], look: [-270, -200], mount: 'horse' }, drive: [[-292, -198], [-288, -170], [-288, -130], [-286, -100]], for: 5, title: { nl: 'Speel zelf', en: 'Play it yourself', fr: 'Joue toi-même', es: 'Juega tú' }, at: 0.4 },
    // by bike over the Korenmarkt, along the tram rails, and the front wheel caught in one: off you come
    { name: { nl: 'Tramsporen', en: 'Tram rails', fr: 'Rails du tram', es: 'Vías del tranvía' }, explore: { at: [-112, -60], look: [-160, -75], mount: 'bike' }, drive: [[-157.6, -73.9], [-185, -80]], for: 3.5 },
    // the bus driver mission: on foot behind the bus at its stop on the Zonnestraat as its driver
    // runs off to the toilet, a step to it and in (board), and off at the wheel onto the Kouter
    { name: 'Bus', quest: 'bus', drive: [[-147, 417], [-117, 417], [-105, 418], [-93, 420], [-66, 421], [-42, 419], [-12, 417]], board: 0.8, for: 5 },
    // and of a police car, siren going, flat out along the Coupure Links, a fietsstraat (already at
    // speed when it shows: off out of sight), over the blue bike disc on its red at [-802.5, 876.2]
    { name: { nl: 'Politie', en: 'Police', fr: 'Police', es: 'Policía' }, explore: { at: [-728, 904], look: [-768, 893], mount: 'foot' }, car: 'police', drive: [[-768, 893], [-788, 885], [-802.5, 876.2], [-829, 857], [-845, 839], [-906, 766], [-962, 699]], unblock: true, pre: 1.2, pace: 1.3, for: 4 },
    // a race through the old town, the four of them on whatever they ride
    { name: 'Race', race: 'gentcentrum', mount: 'cow', drive: 'race', for: 3, pre: 2.6 },
    // the police helicopter: off from its pad at the Blaarmeersen, round in a wide banking circle,
    // over the lake to the swimmer in trouble, hovering over them while the winch pulls them up
    { name: { nl: 'Helikopter', en: 'Helicopter', fr: 'Hélicoptère', es: 'Helicóptero' }, quest: 'heli', drive: 'heli', pre: 6, turn: 1, pace: 1.25, for: 8 },
    // the Mystic Lamb stolen again: after the thief by bike (steady: not caught in the rails), and caught
    { name: { nl: 'Lam Gods', en: 'Mystic Lamb', fr: 'Agneau mystique', es: 'Cordero Místico' }, quest: 'lamb', drive: 'chase', steady: true, for: 5.3, pre: 10, tired: true, behind: 12 },
    // the paintball fight on the Korenmarkt
    { name: 'Paintball', quest: 'paint', drive: 'shoot', for: 3, pre: 3.5 },
    // and back up over the Leie to the three towers, under the closing card: the name, and where to play it
    { name: 'Leie', tour: [-286, -235], for: 6, speed: 1.5, cards: false, card: true, hold: true, title: 'Instant *Gent*', at: 0.8, sub: { nl: 'Gent in 3D, te voet, te fiets of te paard', en: 'Ghent in 3D, on foot, by bike or on horseback', fr: 'Gand en 3D, à pied, à vélo ou à cheval', es: 'Gante en 3D, a pie, en bici o a caballo' }, cta: { nl: '▶ Speel gratis op instant*gent*.be', en: '▶ Play free at instant*gent*.be', fr: '▶ Joue gratuitement sur instant*gent*.be', es: '▶ Juega gratis en instant*gent*.be' } },
  ],
};
