// The quests in Rotterdam: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'erasmusbrug', emoji: '🦢', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 240, start: [145, -97], goal: [39, 1344], radius: 22,
    text: {
      nl: {
        title: 'Naar de Zwaan',
        where: 'Van de Markthal naar het midden van de Erasmusbrug.',
        story: 'Het is Wereldhavendagen, en straks vaart de grote zeilschepenparade onder de Erasmusbrug door. Je vrienden staan al op de brug, en jij staat nog met een zak kibbeling in de Markthal. Over de Blaak en langs de Leuvehaven naar de Zwaan, snel!',
        hud: '🦢 Naar de Erasmusbrug!',
        done: 'OP DE BRUG! 🦢',
        win: '🦢 Je staat net op tijd naast je vrienden als de eerste mast onder de brug door glijdt.',
        lose: '🦢 De parade is al voorbij, je ziet alleen nog de achtersteven…',
      },
      en: {
        title: 'To the Swan',
        where: 'From the Markthal to the middle of the Erasmusbrug.',
        story: 'It is the World Port Days, and the parade of tall ships is about to sail under the Erasmusbrug. Your friends are already on the bridge, and you are still in the Markthal with a bag of fried fish. Along the Blaak and the Leuvehaven to the Swan, quick!',
        hud: '🦢 To the Erasmusbrug!',
        done: 'ON THE BRIDGE! 🦢',
        win: '🦢 You reach your friends just as the first mast glides under the bridge.',
        lose: '🦢 The parade has gone by, all you see is a stern…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 240,
    start: [-998, -149], pad: [-998, -149], radius: 16,
    victims: [[509, -25, 'Oude Haven'], [240, 1277, 'Erasmusbrug']], drop: [-491, -389, 'Stadhuis'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan het Schouwburgplein. Red twee zwemmers en breng ze naar het Stadhuis aan de Coolsingel.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Oude Haven, bij de Kubuswoningen, en nóg iemand gaat bijna kopje-onder in de Nieuwe Maas, bij de Erasmusbrug! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het Stadhuis aan de Coolsingel, waar de ambulance wacht. Land in de lichtzuil. Je hebt 4 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Oude Haven!', '🚁 Naar de Erasmusbrug!', '🚁 Naar het Stadhuis aan de Coolsingel, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Schouwburgplein. Save two swimmers and fly them to the City Hall on the Coolsingel.',
        story: 'Alarm! A swimmer is in trouble in the Oude Haven, by the Cube Houses, and a second one is about to go under in the Nieuwe Maas, by the Erasmus Bridge! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the City Hall on the Coolsingel, where the ambulance is waiting. Land in the beam of light. You have 4 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Oude Haven!', '🚁 To the Erasmus Bridge!', '🚁 To the City Hall on the Coolsingel, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
