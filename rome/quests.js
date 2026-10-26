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
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-547, -51], pad: [-547, -51], radius: 16,
    victims: [[-810, 870, 'Ponte Sisto'], [-126, 1205, 'Isola Tiberina']], drop: [1401, 1276, 'Colosseo'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Piazza Navona. Red twee zwemmers en breng ze naar het Colosseum.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Tiber, bij de Ponte Sisto, en nóg iemand gaat bijna kopje-onder in de Tiber, naast het Tibereiland! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het Colosseum, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Ponte Sisto!', '🚁 Naar het Tibereiland!', '🚁 Naar het Colosseum, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Piazza Navona. Save two swimmers and fly them to the Colosseum.',
        story: 'Alarm! A swimmer is in trouble in the Tiber, by the Ponte Sisto, and a second one is about to go under in the Tiber, beside the Isola Tiberina! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Colosseum, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Ponte Sisto!', '🚁 To the Isola Tiberina!', '🚁 To the Colosseum, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
