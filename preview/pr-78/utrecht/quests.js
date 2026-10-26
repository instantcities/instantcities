// The quests in Utrecht: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'domtoren', emoji: '🔔', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'reach', time: 120, start: [-452, -132], goal: [-155, 141], radius: 22,
    text: {
      nl: {
        title: 'Voor de klokken luiden',
        where: 'Van de Neude naar de Domtoren.',
        story: 'De rondleiding naar de top van de Domtoren vertrekt om twaalf uur, en jij staat nog met je fiets op de Neude. Door de straatjes naar het Domplein, voor de klokken luiden!',
        hud: '🔔 Naar de Domtoren!',
        done: 'NET OP TIJD! 🔔',
        win: '🔔 Je zet je fiets tegen de toren terwijl de gids de deur opendoet. 465 treden, daar ga je!',
        lose: '🔔 De klokken slaan twaalf, de groep is al naar boven…',
      },
      en: {
        title: 'Before the bells ring',
        where: 'From the Neude to the Dom Tower.',
        story: 'The tour to the top of the Dom Tower leaves at noon, and you are still on the Neude with your bike. Through the lanes to the Domplein, before the bells ring!',
        hud: '🔔 To the Dom Tower!',
        done: 'JUST IN TIME! 🔔',
        win: '🔔 You lean your bike against the tower as the guide opens the door. 465 steps, off you go!',
        lose: '🔔 The bells strike twelve, the group has gone up without you…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-91, -207], pad: [-91, -207], radius: 16,
    victims: [[-533, 606, 'Catharijnesingel'], [-49, 871, 'Oudegracht']], drop: [-140, 101, 'Domplein'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan het Janskerkhof. Red twee zwemmers en breng ze naar het Domplein, onder de Domtoren.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Catharijnesingel, en nóg iemand gaat bijna kopje-onder in de Oudegracht, beneden bij de werven! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het Domplein, onder de Domtoren, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Catharijnesingel!', '🚁 Naar de Oudegracht!', '🚁 Naar het Domplein, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Janskerkhof. Save two swimmers and fly them to the Domplein, under the Dom Tower.',
        story: 'Alarm! A swimmer is in trouble in the Catharijnesingel, and a second one is about to go under in the Oudegracht, down by the wharves! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Domplein, under the Dom Tower, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Catharijnesingel!', '🚁 To the Oudegracht!', '🚁 To the Domplein, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
