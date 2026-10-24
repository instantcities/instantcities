// The quests in London: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'bigben', emoji: '🕰️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 240, start: [-267, -533], goal: [36, 476], radius: 22,
    text: {
      nl: {
        title: 'Voor de Big Ben slaat',
        where: 'Van Trafalgar Square naar de Big Ben voor die twaalf uur slaat.',
        story: 'Je hebt om twaalf uur afgesproken onder de Big Ben, en het is bijna zover. Whitehall af, langs de Horse Guards en Downing Street. Pas op voor de zwarte taxi’s en de rode bussen, en hou links!',
        hud: '🕰️ Naar de Big Ben!',
        done: 'BONG! 🕰️',
        win: '🕰️ Net bij de eerste slag. Stipt op tijd.',
        lose: '🕰️ Twaalf slagen, en je bent nog op Whitehall…',
      },
      en: {
        title: 'Before Big Ben strikes',
        where: 'From Trafalgar Square to Big Ben before it strikes twelve.',
        story: 'You promised to meet a friend under Big Ben at noon, and it is nearly twelve. Down Whitehall you go, past the Horse Guards and Downing Street. Mind the black cabs and the red buses, and keep left!',
        hud: '🕰️ To Big Ben!',
        done: 'BONG! 🕰️',
        win: '🕰️ Just as the first stroke rings out. Perfectly punctual.',
        lose: '🕰️ Twelve strokes, and you are still on Whitehall…',
      },
    },
  },
];
