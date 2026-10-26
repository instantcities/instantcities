// The quests in Berlin: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'tor', emoji: '🏛️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 300, start: [611, 160], goal: [-659, -199], radius: 22,
    text: {
      nl: {
        title: 'Middernacht aan de Poort',
        where: 'Van de Gendarmenmarkt naar de Brandenburger Tor voor middernacht.',
        story: 'Het is oudejaarsavond, en heel Berlijn gaat naar de Brandenburger Tor voor het vuurwerk. Jij staat nog op de Gendarmenmarkt. Door Mitte en Unter den Linden op, voor het aftellen voorbij is.',
        hud: '🏛️ Naar de Brandenburger Tor!',
        done: 'PROSIT NEUJAHR! 🎆',
        win: '🎆 Het vuurwerk knalt boven de Quadriga. Gelukkig nieuwjaar!',
        lose: '🎆 Je hoort de knallen vanop Unter den Linden…',
      },
      en: {
        title: 'Midnight at the Gate',
        where: 'From the Gendarmenmarkt to the Brandenburg Gate before midnight.',
        story: 'It is New Year’s Eve, and all of Berlin is heading for the Brandenburg Gate to see the fireworks. You are still at the Gendarmenmarkt. Through Mitte and up Unter den Linden, before the countdown ends.',
        hud: '🏛️ To the Brandenburg Gate!',
        done: 'PROSIT NEUJAHR! 🎆',
        win: '🎆 The fireworks burst over the Quadriga. Happy New Year!',
        lose: '🎆 You hear the bangs from Unter den Linden…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 240,
    start: [611, 160], pad: [611, 160], radius: 16,
    victims: [[1413, -586, 'Berliner Dom'], [-746, -774, 'Reichstag']], drop: [-635, -199, 'Pariser Platz'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Gendarmenmarkt. Red twee zwemmers en breng ze naar de Brandenburger Tor.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Spree, naast de Berliner Dom, en nóg iemand gaat bijna kopje-onder in de Spree, achter de Rijksdag! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Brandenburger Tor, waar de ambulance wacht. Land in de lichtzuil. Je hebt 4 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Berliner Dom!', '🚁 Naar de Rijksdag!', '🚁 Naar de Brandenburger Tor, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Gendarmenmarkt. Save two swimmers and fly them to the Brandenburg Gate.',
        story: 'Alarm! A swimmer is in trouble in the Spree, beside the Berliner Dom, and a second one is about to go under in the Spree, behind the Reichstag! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Brandenburg Gate, where the ambulance is waiting. Land in the beam of light. You have 4 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Berliner Dom!', '🚁 To the Reichstag!', '🚁 To the Brandenburg Gate, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
