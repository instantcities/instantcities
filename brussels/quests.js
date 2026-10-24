// The quests in Brussels: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'manneken', emoji: '💦', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [-101, 235], thief: [-60, 191],
    text: {
      nl: {
        title: 'Manneken Pis is gestolen!',
        where: 'Start aan Manneken Pis. Vang de dief.',
        story: 'Manneken Pis is door de eeuwen heen al een paar keer gestolen, en elke keer kreeg Brussel hem terug. Het gebeurt opnieuw: daar gaat de dief met het bronzen ventje onder de arm. Vang hem in de straatjes rond de Grote Markt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 💦',
        win: '💦 Manneken Pis staat terug op zijn hoek, even brutaal als altijd.',
        lose: '🦹 De dief is ontsnapt. De hoek is leeg…',
      },
      en: {
        title: 'Manneken Pis is stolen!',
        where: 'Start at the Manneken Pis. Catch the thief.',
        story: 'The Manneken Pis has been stolen several times over the centuries, and every time Brussels got him back. It is happening again: there goes the thief with the little bronze boy under his arm. Catch them in the lanes round the Grand-Place.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 💦',
        win: '💦 Manneken Pis is back on his corner, as cheeky as ever.',
        lose: '🦹 The thief got away. The corner is empty…',
      },
    },
  },
];
