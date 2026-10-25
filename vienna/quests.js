// The quests in Vienna: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'oper', emoji: '🎶', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 190, start: [620, -308], goal: [240, 452], radius: 22,
    text: {
      nl: {
        title: 'Te laat voor de opera',
        where: 'Van de Stephansdom naar de Staatsopera voor het doek opgaat.',
        story: 'Je ticket voor de opera van vanavond zit in je zak, het doek gaat over een paar minuten op en jij staat nog aan de Stephansdom. De Graben af, door de oude stad, langs de Albertina: in Wenen gaan de deuren dicht voor laatkomers.',
        hud: '🎶 Naar de Staatsopera!',
        done: 'BRAVO! 🎶',
        win: '🎶 Je glipt op je stoel net als het licht uitgaat.',
        lose: '🎶 De deuren zijn dicht. Je hoort het vanuit de hal…',
      },
      en: {
        title: 'Late for the opera',
        where: 'From the Stephansdom to the State Opera before the curtain rises.',
        story: 'Your ticket for tonight’s opera is in your pocket, the curtain rises in a few minutes and you are still at the Stephansdom. Down the Graben, through the old town, past the Albertina: Vienna’s doors close on latecomers.',
        hud: '🎶 To the State Opera!',
        done: 'BRAVO! 🎶',
        win: '🎶 You slip into your seat as the lights go down.',
        lose: '🎶 The doors have closed. You will hear it from the hall…',
      },
    },
  },
];
