// The quests in Amsterdam: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'centraal', emoji: '🚆', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 390, start: [-76, 252], goal: [833, -1185], radius: 22,
    text: {
      nl: {
        title: 'De laatste trein',
        where: 'Van het Spui naar Centraal Station voor je trein vertrekt.',
        story: 'Je trein naar huis vertrekt over een paar minuten van Centraal Station. Spring op je fiets en race door de oude stad, over de grachten en de Dam over. Pas op voor trams, toeristen en de tienduizend andere fietsers.',
        hud: '🚆 Naar Centraal Station!',
        done: 'INSTAPPEN! 🚆',
        win: '🚆 De deuren gaan achter je dicht. Gehaald.',
        lose: '🚆 De lichtjes verdwijnen in de verte…',
      },
      en: {
        title: 'The last train',
        where: 'From the Spui to Centraal Station before your train leaves.',
        story: 'Your train home leaves from Centraal Station in a few minutes. Grab your bike and race through the old town, over the canals and across the Dam. Watch out for trams, tourists and the other ten thousand cyclists.',
        hud: '🚆 To Centraal Station!',
        done: 'ALL ABOARD! 🚆',
        win: '🚆 The doors close behind you. Made it.',
        lose: '🚆 Its lights disappear down the track…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 240,
    start: [-598, -597], pad: [-598, -597], radius: 16,
    victims: [[703, -1012, 'IJ'], [856, 512, 'Amstel']], drop: [179, -356, 'Dam'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Westermarkt. Red twee zwemmers en breng ze naar de Dam.',
        story: 'Alarm! Er raakt een zwemmer in nood in het IJ, vlak voor het Centraal Station, en nóg iemand gaat bijna kopje-onder in de Amstel, bij de Blauwbrug! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Dam, waar de ambulance wacht. Land in de lichtzuil. Je hebt 4 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar het Centraal Station!', '🚁 Naar de Amstel!', '🚁 Naar de Dam, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Westermarkt. Save two swimmers and fly them to the Dam.',
        story: 'Alarm! A swimmer is in trouble in the IJ, right in front of Centraal Station, and a second one is about to go under in the Amstel, by the Blauwbrug! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Dam, where the ambulance is waiting. Land in the beam of light. You have 4 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To Centraal Station!', '🚁 To the Amstel!', '🚁 To the Dam, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
