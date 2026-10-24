// The quests in Berlin: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'tor', emoji: '🏛️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 300, start: [611, 160], goal: [-659, -199], radius: 22,
    text: {
      nl: {
        title: 'Middernacht aan de Poort',
        where: 'Van de Gendarmenmarkt naar de Brandenburger Tor voor middernacht.',
        story: 'Het is oudejaarsavond, en heel Berlijn gaat naar de Brandenburger Tor voor het vuurwerk. Jij staat nog op de Gendarmenmarkt. Door Mitte en Unter den Linden op, voor het aftellen voorbij is.',
        hud: '🏛️ Naar de Brandenburger Tor!',
        done: 'PROSIT NEUJAHR! 🎆',
        win: '🎆 Het vuurwerk knalt boven de Quadriga. Gelukkig nieuwjaar!',
        lose: '🎆 Je hoort de knallen vanop Unter den Linden…',
      },
      en: {
        title: 'Midnight at the Gate',
        where: 'From the Gendarmenmarkt to the Brandenburg Gate before midnight.',
        story: 'It is New Year’s Eve, and all of Berlin is heading for the Brandenburg Gate to see the fireworks. You are still at the Gendarmenmarkt. Through Mitte and up Unter den Linden, before the countdown ends.',
        hud: '🏛️ To the Brandenburg Gate!',
        done: 'PROSIT NEUJAHR! 🎆',
        win: '🎆 The fireworks burst over the Quadriga. Happy New Year!',
        lose: '🎆 You hear the bangs from Unter den Linden…',
      },
    },
  },
];
