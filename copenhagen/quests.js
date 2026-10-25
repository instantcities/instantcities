// The quests in Copenhagen: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'nyhavn', emoji: '⛵', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 400, start: [-963, 309], goal: [693, -258], radius: 22,
    text: {
      nl: {
        title: 'De boot van Nyhavn',
        where: 'Van het Raadhuisplein naar Nyhavn voor de rondvaartboot vertrekt.',
        story: 'Je rondvaart vertrekt over een paar minuten uit Nyhavn. Op je fiets dan, met de rest van Kopenhagen mee, over de Strøget en langs Kongens Nytorv, naar de gekleurde huizen aan het water.',
        hud: '⛵ Naar Nyhavn!',
        done: 'AAN BOORD! ⛵',
        win: '⛵ Je springt aan boord terwijl de boot vertrekt.',
        lose: '⛵ De boot is al onder de brug…',
      },
      en: {
        title: 'The boat from Nyhavn',
        where: 'From the City Hall Square to Nyhavn before the harbour boat leaves.',
        story: 'Your harbour tour leaves from Nyhavn in a few minutes. Get on your bike and ride with the rest of Copenhagen, along the Strøget and past Kongens Nytorv, to the coloured houses on the water.',
        hud: '⛵ To Nyhavn!',
        done: 'ON BOARD! ⛵',
        win: '⛵ You jump aboard as the boat casts off.',
        lose: '⛵ The boat is already under the bridge…',
      },
    },
  },
];
