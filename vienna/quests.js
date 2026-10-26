// The quests in Vienna: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'oper', emoji: '🎶', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 190, start: [620, -308], goal: [240, 452], radius: 22,
    text: {
      nl: {
        title: 'Te laat voor de opera',
        where: 'Van de Stephansdom naar de Staatsopera voor het doek opgaat.',
        story: 'Je ticket voor de opera van vanavond zit in je zak, het doek gaat over een paar minuten op en jij staat nog aan de Stephansdom. De Graben af, door de oude stad, langs de Albertina: in Wenen gaan de deuren dicht voor laatkomers.',
        hud: '🎶 Naar de Staatsopera!',
        done: 'BRAVO! 🎶',
        win: '🎶 Je glipt op je stoel net als het licht uitgaat.',
        lose: '🎶 De deuren zijn dicht. Je hoort het vanuit de hal…',
      },
      en: {
        title: 'Late for the opera',
        where: 'From the Stephansdom to the State Opera before the curtain rises.',
        story: 'Your ticket for tonight’s opera is in your pocket, the curtain rises in a few minutes and you are still at the Stephansdom. Down the Graben, through the old town, past the Albertina: Vienna’s doors close on latecomers.',
        hud: '🎶 To the State Opera!',
        done: 'BRAVO! 🎶',
        win: '🎶 You slip into your seat as the lights go down.',
        lose: '🎶 The doors have closed. You will hear it from the hall…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-317, -32], pad: [-317, -32], radius: 16,
    victims: [[947, -882, 'Schwedenplatz'], [1250, -772, 'Donaukanal']], drop: [585, -270, 'Stephansplatz'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Heldenplatz. Red twee zwemmers en breng ze naar de Stephansplatz, bij de kathedraal.',
        story: 'Alarm! Er raakt een zwemmer in nood in het Donaukanal, bij de Schwedenplatz, en nóg iemand gaat bijna kopje-onder verderop in het Donaukanal, richting de Urania! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Stephansplatz, bij de kathedraal, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Schwedenplatz!', '🚁 Naar de Urania!', '🚁 Naar de Stephansplatz, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Heldenplatz. Save two swimmers and fly them to the Stephansplatz, by the cathedral.',
        story: 'Alarm! A swimmer is in trouble in the Danube Canal, by the Schwedenplatz, and a second one is about to go under further down the Danube Canal, towards the Urania! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Stephansplatz, by the cathedral, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Schwedenplatz!', '🚁 To the Urania!', '🚁 To the Stephansplatz, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
