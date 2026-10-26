// The quests in Barcelona: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'ferry', emoji: '⛴️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 400, start: [-495, -740], goal: [320, 808], radius: 22,
    text: {
      nl: {
        title: 'De boot naar Mallorca',
        where: 'Van de Plaça de Catalunya naar de haven bij het Columbusmonument.',
        story: 'Je ferry naar Mallorca vertrekt uit de haven onderaan de Rambla, en jij staat nog bovenaan. Naar beneden dan, langs de bloemenkraampjes, de Boqueria en het Liceu, tussen de drukte door, tot waar Columbus naar zee wijst.',
        hud: '⛴️ Naar de haven!',
        done: 'AAN BOORD! ⛴️',
        win: '⛴️ De loopplank gaat net achter je omhoog. ¡Bon viatge!',
        lose: '⛴️ De ferry is al op zee…',
      },
      en: {
        title: 'The boat to Mallorca',
        where: 'From Plaça de Catalunya down to the port by the Columbus monument.',
        story: 'Your ferry to Mallorca leaves from the port at the bottom of the Rambla, and you are still at the top. Down you go, past the flower stalls, the Boqueria and the Liceu, between the crowds, to where Columbus points out to sea.',
        hud: '⛴️ To the port!',
        done: 'ON BOARD! ⛴️',
        win: '⛴️ The ramp goes up just behind you. ¡Bon viatge!',
        lose: '⛴️ The ferry is already out at sea…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-495, -740], pad: [-495, -740], radius: 16,
    victims: [[549, 711, 'Colom'], [822, 384, 'Moll d\'Espanya']], drop: [48, 213, 'Plaça Reial'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Plaça de Catalunya. Red twee zwemmers en breng ze naar de Plaça Reial.',
        story: 'Alarm! Er raakt een zwemmer in nood in de haven, aan de voet van het Columbusmonument, en nóg iemand gaat bijna kopje-onder in de Port Vell, bij de Moll d’Espanya! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Plaça Reial, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar het Columbusmonument!', '🚁 Naar de Moll d’Espanya!', '🚁 Naar de Plaça Reial, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at Plaça de Catalunya. Save two swimmers and fly them to the Plaça Reial.',
        story: 'Alarm! A swimmer is in trouble in the harbour at the foot of the Columbus Monument, and a second one is about to go under in the Port Vell, by the Moll d’Espanya! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Plaça Reial, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Columbus Monument!', '🚁 To the Moll d’Espanya!', '🚁 To the Plaça Reial, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
