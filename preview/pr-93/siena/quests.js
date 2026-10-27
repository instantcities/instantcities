// The quests in Siena: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'palio', emoji: '🐎', player: { mount: 'horse', pick: 'hagelslag' }, kind: 'reach', time: 150, start: [-308, -302], goal: [191, -54], radius: 22,
    text: {
      nl: {
        title: 'Op tijd voor de Palio',
        where: 'Van de Piazza San Domenico naar de Piazza del Campo.',
        story: 'Het paard van de contrada is net gezegend in de kerk, en de Palio begint zo meteen. Breng het door de steegjes naar de Campo, voor de startkoord gespannen wordt!',
        hud: '🐎 Naar de Campo!',
        done: 'AAN DE START! 🐎',
        win: '🐎 Je komt de Campo op terwijl de hele stad juicht. Het paard staat klaar aan de koord.',
        lose: '🐎 De mortaretto knalt, de Palio is begonnen zonder jullie…',
      },
      en: {
        title: 'In time for the Palio',
        where: 'From Piazza San Domenico to the Piazza del Campo.',
        story: 'The contrada’s horse has just been blessed in the church, and the Palio starts any minute now. Bring it through the lanes to the Campo before the starting rope goes up!',
        hud: '🐎 To the Campo!',
        done: 'AT THE START! 🐎',
        win: '🐎 You ride into the Campo as the whole town cheers. The horse is ready at the rope.',
        lose: '🐎 The mortaretto goes off, the Palio has started without you…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-643, -585], pad: [-643, -585], radius: 16,
    victims: [[-317, -66, 'Fontebranda'], [161, -84, 'Fonte Gaia']], drop: [-68, 105, 'Piazza del Duomo'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Fortezza Medicea. Red twee toeristen en breng ze naar de Piazza del Duomo.',
        story: 'Alarm! Op de heetste dag van het jaar sprongen twee toeristen in de fonteinen om af te koelen, en nu raken ze er niet meer uit: één in de Fontebranda, de oude fontein onderaan de heuvel, de andere in de Fonte Gaia op de Piazza del Campo! Stijg op, vlieg door de cirkel boven elke toerist, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Piazza del Duomo, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de toeristen!',
        legs: ['🚁 Naar de Fontebranda!', '🚁 Naar de Fonte Gaia!', '🚁 Naar de Piazza del Duomo, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee toeristen veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de brandweer heeft ze er al uit gevist.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Fortezza Medicea. Save two tourists and fly them to the Piazza del Duomo.',
        story: 'Alarm! On the hottest day of the year two tourists jumped into the fountains to cool off, and now they can’t get out: one in the Fontebranda, the old fountain down the hill, the other in the Fonte Gaia on the Piazza del Campo! Take off, fly through the circle over each tourist, not too high, and the winch has them up at once; then fly both to the Piazza del Duomo, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the tourists!',
        legs: ['🚁 To the Fontebranda!', '🚁 To the Fonte Gaia!', '🚁 To the Piazza del Duomo, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two tourists safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade has fished them out already.',
      },
    },
  },
];
