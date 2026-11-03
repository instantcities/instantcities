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
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-563, -74], pad: [-563, -74], radius: 16,
    victims: [[78, 256, 'Lungomare Trieste'], [923, 671, 'Piazza della Concordia']], drop: [194, -301, 'Duomo'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Villa Comunale. Red twee zwemmers en breng ze naar de Duomo.',
        story: 'Alarm! Er raakt een zwemmer in nood in zee voor de Lungomare Trieste, en nóg iemand gaat bijna kopje-onder in zee voor de Piazza della Concordia! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Duomo, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Lungomare!', '🚁 Naar de Piazza della Concordia!', '🚁 Naar de Duomo, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Villa Comunale. Save two swimmers and fly them to the Duomo.',
        story: 'Alarm! A swimmer is in trouble in the sea off the Lungomare Trieste, and a second one is about to go under in the sea off the Piazza della Concordia! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Duomo, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Lungomare!', '🚁 To the Piazza della Concordia!', '🚁 To the Duomo, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
