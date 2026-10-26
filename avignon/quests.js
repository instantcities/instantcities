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
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [378, -8], pad: [378, -8], radius: 16,
    victims: [[-6, -1029, 'Pont Saint-Bénézet'], [-457, -476, 'Rhône']], drop: [188, -463, 'Place du Palais'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan Les Halles. Red twee zwemmers en breng ze naar het plein voor het Pausenpaleis.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Rhône, onder de Pont Saint-Bénézet, en nóg iemand gaat bijna kopje-onder in de Rhône, langs de stadswallen! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het plein voor het Pausenpaleis, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Pont d’Avignon!', '🚁 Naar de stadswallen!', '🚁 Naar het plein voor het Pausenpaleis, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at Les Halles. Save two swimmers and fly them to the square in front of the Palais des Papes.',
        story: 'Alarm! A swimmer is in trouble in the Rhône, under the Pont Saint-Bénézet, and a second one is about to go under in the Rhône, along the ramparts! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the square in front of the Palais des Papes, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Pont d’Avignon!', '🚁 To the ramparts!', '🚁 To the square in front of the Palais des Papes, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
