// The quests in Madrid: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'uvas', emoji: '🍇', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 260, start: [-615, -17], goal: [529, 135], radius: 22,
    text: {
      nl: {
        title: 'Twaalf druiven',
        where: 'Van het Koninklijk Paleis naar de Puerta del Sol voor middernacht.',
        story: 'Op oudejaarsavond eet heel Spanje twaalf druiven, een op elke slag van de klok op de Puerta del Sol. Je hebt je druiven, maar je staat nog aan het Koninklijk Paleis. De Calle Mayor af, snel!',
        hud: '🍇 Naar de Puerta del Sol!',
        done: '¡FELIZ AÑO! 🍇',
        win: '🍇 Twaalf slagen, twaalf druiven. ¡Feliz Año Nuevo!',
        lose: '🍇 De klok heeft geslagen. Je druiven moeten een jaar wachten…',
      },
      en: {
        title: 'Twelve grapes',
        where: 'From the Royal Palace to the Puerta del Sol before midnight.',
        story: 'On New Year’s Eve all of Spain eats twelve grapes, one on each stroke of the clock on the Puerta del Sol. You have your grapes, but you are still at the Royal Palace. Down the Calle Mayor, fast!',
        hud: '🍇 To the Puerta del Sol!',
        done: '¡FELIZ AÑO! 🍇',
        win: '🍇 Twelve strokes, twelve grapes. ¡Feliz Año Nuevo!',
        lose: '🍇 The clock has struck. Your grapes will have to wait a year…',
      },
    },
  },
];
