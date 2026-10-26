// The quests in Pisa: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'treno', emoji: '🚆', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 210, start: [-214, -529], goal: [20, 1375], radius: 22,
    text: {
      nl: {
        title: 'De trein naar Florence',
        where: 'Van de scheve toren naar het station Pisa Centrale.',
        story: 'Je hebt te lang de toren staan ‘ondersteunen’ voor de foto, en de laatste trein naar Florence vertrekt over een paar minuten uit Pisa Centrale, aan de andere kant van de stad. Door de Via Santa Maria, over de Arno en de Corso Italia af, snel!',
        hud: '🚆 Naar Pisa Centrale!',
        done: 'INGESTAPT! 🚆',
        win: '🚆 Je springt de trein in net als de deuren dichtgaan. Op naar Florence!',
        lose: '🚆 De trein rijdt al het station uit…',
      },
      en: {
        title: 'The train to Florence',
        where: 'From the Leaning Tower to Pisa Centrale station.',
        story: 'You spent too long “holding up” the tower for the photo, and the last train to Florence leaves Pisa Centrale in a few minutes, on the other side of town. Down Via Santa Maria, over the Arno and along Corso Italia, quick!',
        hud: '🚆 To Pisa Centrale!',
        done: 'ON BOARD! 🚆',
        win: '🚆 You jump on just as the doors close. Off to Florence!',
        lose: '🚆 The train is already pulling out…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [182, -106], pad: [182, -106], radius: 16,
    victims: [[160, 357, 'Ponte di Mezzo'], [-269, 493, 'Santa Maria della Spina']], drop: [-156, -602, 'Piazza dei Miracoli'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Piazza dei Cavalieri. Red twee zwemmers en breng ze naar het gras bij de Scheve Toren.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Arno, bij de Ponte di Mezzo, en nóg iemand gaat bijna kopje-onder in de Arno, bij Santa Maria della Spina! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het gras bij de Scheve Toren, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Ponte di Mezzo!', '🚁 Naar Santa Maria della Spina!', '🚁 Naar het gras bij de Scheve Toren, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Piazza dei Cavalieri. Save two swimmers and fly them to the lawn by the Leaning Tower.',
        story: 'Alarm! A swimmer is in trouble in the Arno, by the Ponte di Mezzo, and a second one is about to go under in the Arno, by Santa Maria della Spina! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the lawn by the Leaning Tower, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Ponte di Mezzo!', '🚁 To Santa Maria della Spina!', '🚁 To the lawn by the Leaning Tower, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
