// The quests in Rotterdam: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'erasmusbrug', emoji: '🦢', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 240, start: [145, -97], goal: [39, 1344], radius: 22,
    text: {
      nl: {
        title: 'Naar de Zwaan',
        where: 'Van de Markthal naar het midden van de Erasmusbrug.',
        story: 'Het is Wereldhavendagen, en straks vaart de grote zeilschepenparade onder de Erasmusbrug door. Je vrienden staan al op de brug, en jij staat nog met een zak kibbeling in de Markthal. Over de Blaak en langs de Leuvehaven naar de Zwaan, snel!',
        hud: '🦢 Naar de Erasmusbrug!',
        done: 'OP DE BRUG! 🦢',
        win: '🦢 Je staat net op tijd naast je vrienden als de eerste mast onder de brug door glijdt.',
        lose: '🦢 De parade is al voorbij, je ziet alleen nog de achtersteven…',
      },
      en: {
        title: 'To the Swan',
        where: 'From the Markthal to the middle of the Erasmusbrug.',
        story: 'It is the World Port Days, and the parade of tall ships is about to sail under the Erasmusbrug. Your friends are already on the bridge, and you are still in the Markthal with a bag of fried fish. Along the Blaak and the Leuvehaven to the Swan, quick!',
        hud: '🦢 To the Erasmusbrug!',
        done: 'ON THE BRIDGE! 🦢',
        win: '🦢 You reach your friends just as the first mast glides under the bridge.',
        lose: '🦢 The parade has gone by, all you see is a stern…',
      },
    },
  },
];
