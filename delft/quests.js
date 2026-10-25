// The quests in Delft: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'vermeer', emoji: '🎨', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [-194, -210], thief: [-240, -235],
    text: {
      nl: {
        title: 'Wie heeft de Vermeer?',
        where: 'Start aan de Oude Delft bij het Prinsenhof. Vang de dief met het schilderij.',
        story: 'Alarm in het Prinsenhof: iemand is ervandoor met een Vermeer die er te leen hing, het meisje dat een brief leest bij het raam. Daar gaan ze, langs de Oude Delft. Vang hem voor het doek in een gracht belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🎨',
        win: '🎨 De Vermeer hangt weer veilig aan de muur, het licht valt nog net zo door het raam.',
        lose: '🦹 De dief is ontsnapt. De Vermeer is weg…',
      },
      en: {
        title: 'Who took the Vermeer?',
        where: 'Start on the Oude Delft by the Prinsenhof. Catch the thief with the painting.',
        story: 'Alarm in the Prinsenhof: someone has made off with a Vermeer on loan for an exhibition, the girl reading a letter by the window. There they go, along the Oude Delft. Catch them before the canvas ends up in a canal.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🎨',
        win: '🎨 The Vermeer is safely back on the wall, the light still falling through the window.',
        lose: '🦹 The thief got away. The Vermeer is gone…',
      },
    },
  },
];
