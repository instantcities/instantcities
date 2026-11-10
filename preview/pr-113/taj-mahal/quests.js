// The quests at the Taj Mahal: a short mission, against the clock (the rules for each kind are in
// core/js/quests.js, and lecce/quests.js says what each field means). Positions are game metres on
// this site's map, as [x, z]. Words in English and Dutch; the other languages show the English.
export const QUESTS = [
  {
    id: 'sunrise', emoji: '🌅', player: { mount: 'foot', pick: 'karamel' }, kind: 'reach', time: 150, start: [-91, 330], goal: [-91, -150], radius: 24,
    text: {
      nl: {
        title: 'Zonsopgang bij de Taj',
        where: 'Van de grote poort naar het marmeren platform, voor de zon op is.',
        story: 'Iedereen wil de Taj zien als de zon opkomt, en de poort is net open. Ren door de tuin naar het platform voordat de eerste bussen er zijn.',
        hud: '🌅 Naar het platform!',
        done: 'Daar is de zon! 🌅',
        win: '🌅 Het marmer wordt roze. Het was de vroege start waard.',
        lose: '🚌 Te laat: de eerste groep is er al.',
      },
      en: {
        title: 'Sunrise at the Taj',
        where: 'From the great gate to the marble platform, before the sun is up.',
        story: 'Everyone wants to see the Taj at sunrise, and the gate has just opened. Run through the garden to the platform before the first coaches arrive.',
        hud: '🌅 To the platform!',
        done: 'There is the sun! 🌅',
        win: '🌅 The marble turns pink. Worth the early start.',
        lose: '🚌 Too late: the first group is already there.',
      },
    },
  },
];
