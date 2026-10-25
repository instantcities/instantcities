// The quests in Pisa: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'treno', emoji: '🚆', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 210, start: [-214, -529], goal: [20, 1375], radius: 22,
    text: {
      nl: {
        title: 'De trein naar Florence',
        where: 'Van de scheve toren naar het station Pisa Centrale.',
        story: 'Je hebt te lang de toren staan ‘ondersteunen’ voor de foto, en de laatste trein naar Florence vertrekt over een paar minuten uit Pisa Centrale, aan de andere kant van de stad. Door de Via Santa Maria, over de Arno en de Corso Italia af, snel!',
        hud: '🚆 Naar Pisa Centrale!',
        done: 'INGESTAPT! 🚆',
        win: '🚆 Je springt de trein in net als de deuren dichtgaan. Op naar Florence!',
        lose: '🚆 De trein rijdt al het station uit…',
      },
      en: {
        title: 'The train to Florence',
        where: 'From the Leaning Tower to Pisa Centrale station.',
        story: 'You spent too long “holding up” the tower for the photo, and the last train to Florence leaves Pisa Centrale in a few minutes, on the other side of town. Down Via Santa Maria, over the Arno and along Corso Italia, quick!',
        hud: '🚆 To Pisa Centrale!',
        done: 'ON BOARD! 🚆',
        win: '🚆 You jump on just as the doors close. Off to Florence!',
        lose: '🚆 The train is already pulling out…',
      },
    },
  },
];
