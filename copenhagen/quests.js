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
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-963, 309], pad: [-963, 309], radius: 16,
    victims: [[-245, 559, 'Frederiksholms Kanal'], [626, -305, 'Nyhavn']], drop: [928, -838, 'Amalienborg'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Rådhuspladsen. Red twee zwemmers en breng ze naar het plein van Amalienborg.',
        story: 'Alarm! Er raakt een zwemmer in nood in de gracht naast Christiansborg, en nóg iemand gaat bijna kopje-onder in Nyhavn, tussen de gekleurde huizen! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het plein van Amalienborg, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar Christiansborg!', '🚁 Naar Nyhavn!', '🚁 Naar het plein van Amalienborg, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Rådhuspladsen. Save two swimmers and fly them to the square of Amalienborg.',
        story: 'Alarm! A swimmer is in trouble in the canal beside Christiansborg, and a second one is about to go under in Nyhavn, between the coloured houses! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the square of Amalienborg, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To Christiansborg!', '🚁 To Nyhavn!', '🚁 To the square of Amalienborg, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
