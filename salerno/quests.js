// The quests in Salerno: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'traghetto', emoji: '⛴️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 150, start: [330, -40], goal: [-729, 504], radius: 22,
    text: {
      nl: {
        title: 'De boot naar Amalfi',
        where: 'Van de Piazza Sedile di Portanova naar het Molo Manfredi.',
        story: 'De laatste boot naar Amalfi vertrekt over een paar minuten van het Molo Manfredi, en jij staat nog met een sfogliatella in je hand op de Piazza Portanova. Over de Via Roma of langs de Lungomare, naar de haven, snel!',
        hud: '⛴️ Naar het Molo Manfredi!',
        done: 'AAN BOORD! ⛴️',
        win: '⛴️ Je springt aan boord net als de loopplank omhoog gaat. Op naar Amalfi!',
        lose: '⛴️ De boot vaart al langs de kust…',
      },
      en: {
        title: 'The boat to Amalfi',
        where: 'From Piazza Sedile di Portanova to the Molo Manfredi.',
        story: 'The last boat to Amalfi leaves the Molo Manfredi in a few minutes, and you are still on Piazza Portanova with a sfogliatella in your hand. Along Via Roma or the Lungomare, down to the harbour, quick!',
        hud: '⛴️ To the Molo Manfredi!',
        done: 'ON BOARD! ⛴️',
        win: '⛴️ You jump aboard just as the gangway comes up. Off to Amalfi!',
        lose: '⛴️ The boat is already off along the coast…',
      },
    },
  },
];
