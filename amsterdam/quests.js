// The quests in Amsterdam: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'centraal', emoji: '🚆', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 390, start: [-76, 252], goal: [833, -1185], radius: 22,
    text: {
      nl: {
        title: 'De laatste trein',
        where: 'Van het Spui naar Centraal Station voor je trein vertrekt.',
        story: 'Je trein naar huis vertrekt over een paar minuten van Centraal Station. Spring op je fiets en race door de oude stad, over de grachten en de Dam over. Pas op voor trams, toeristen en de tienduizend andere fietsers.',
        hud: '🚆 Naar Centraal Station!',
        done: 'INSTAPPEN! 🚆',
        win: '🚆 De deuren gaan achter je dicht. Gehaald.',
        lose: '🚆 De lichtjes verdwijnen in de verte…',
      },
      en: {
        title: 'The last train',
        where: 'From the Spui to Centraal Station before your train leaves.',
        story: 'Your train home leaves from Centraal Station in a few minutes. Grab your bike and race through the old town, over the canals and across the Dam. Watch out for trams, tourists and the other ten thousand cyclists.',
        hud: '🚆 To Centraal Station!',
        done: 'ALL ABOARD! 🚆',
        win: '🚆 The doors close behind you. Made it.',
        lose: '🚆 Its lights disappear down the track…',
      },
    },
  },
];
