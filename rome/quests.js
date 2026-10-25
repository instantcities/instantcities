// The quests in Rome: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'trevi', emoji: '🪙', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 170, start: [-153, 32], goal: [510, -286], radius: 22,
    text: {
      nl: {
        title: 'Een muntje in de Trevi',
        where: 'Van het Pantheon naar de Trevifontein, voor je bus vertrekt.',
        story: 'Je bus vertrekt over een paar minuten uit Rome, en je hebt nog geen muntje in de Trevifontein gegooid. Zonder dat kom je nooit terug, zeggen ze. Rij door de oude straten en wees er op tijd.',
        hud: '🪙 Naar de Trevifontein!',
        done: 'PLONS! 🪙',
        win: '🪙 Over je schouder, en weg. Je komt terug naar Rome.',
        lose: '🚌 Te laat: de bus is weg, en je kans ook…',
      },
      en: {
        title: 'A coin in the Trevi',
        where: 'From the Pantheon to the Trevi Fountain, before your coach leaves.',
        story: 'Your coach leaves Rome in a few minutes, and you have not thrown your coin into the Trevi Fountain yet. Without it, they say, you will never come back. Ride through the old streets and get there in time.',
        hud: '🪙 To the Trevi Fountain!',
        done: 'SPLASH! 🪙',
        win: '🪙 Over your shoulder it goes. You will be back in Rome.',
        lose: '🚌 Too late: the coach has gone, and so has your chance…',
      },
    },
  },
];
