// The quests in Paris: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'joconde', emoji: '🖼️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [-800, -542], thief: [-765, -493],
    text: {
      nl: {
        title: 'De Mona Lisa is gestolen!',
        where: 'Start aan het Louvre. Vang de dief met het schilderij.',
        story: 'In 1911 wandelde een werkman het Louvre uit met de Mona Lisa onder zijn jas, en twee jaar lang was ze zoek. Nu gebeurt het opnieuw: daar gaat de dief, het schilderij onder de arm. Vang hem voor hij de Seine over is.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖼️',
        win: '🖼️ De Mona Lisa hangt terug aan haar muur. Ze glimlacht.',
        lose: '🦹 De dief is ontsnapt. De Mona Lisa is weg…',
      },
      en: {
        title: 'The Mona Lisa is stolen!',
        where: 'Start at the Louvre. Catch the thief with the painting.',
        story: 'In 1911 a workman walked out of the Louvre with the Mona Lisa under his coat, and she was gone for two years. Now it is happening again: there goes the thief, the painting under their arm. Catch them before they cross the Seine.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖼️',
        win: '🖼️ The Mona Lisa is back on her wall. She smiles.',
        lose: '🦹 The thief got away. The Mona Lisa is gone…',
      },
    },
  },
];
