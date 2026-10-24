// The quests in Avignon: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'pont', emoji: '💃', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 150, start: [134, -310], goal: [44, -946], radius: 22,
    text: {
      nl: {
        title: 'Sur le pont d’Avignon',
        where: 'Van de Place de l’Horloge naar de Pont Saint-Bénezet.',
        story: '“Sur le pont d’Avignon, on y danse, on y danse…” Het dansen op de brug begint over een paar minuten, en jij staat nog op de Place de l’Horloge. Langs het Pausenpaleis en naar beneden, naar de Rhône, snel!',
        hud: '💃 Naar de brug!',
        done: 'ON Y DANSE! 💃',
        win: '💃 Je sluit aan in de kring net als het liedje begint.',
        lose: '💃 De dansers zijn al naar huis…',
      },
      en: {
        title: 'Sur le pont d’Avignon',
        where: 'From the Place de l’Horloge to the Pont Saint-Bénezet.',
        story: '“Sur le pont d’Avignon, on y danse, on y danse…” The dance on the bridge starts in a few minutes, and you are still at the Place de l’Horloge. Past the Palais des Papes and down to the Rhône, quick!',
        hud: '💃 To the bridge!',
        done: 'ON Y DANSE! 💃',
        win: '💃 You join the round just as the song begins.',
        lose: '💃 The dancers have gone home…',
      },
    },
  },
];
