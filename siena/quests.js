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
];
