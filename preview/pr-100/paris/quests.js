// The quests in Paris: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'joconde', emoji: '🖼️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [-800, -542], thief: [-765, -493],
    text: {
      nl: {
        title: 'De Mona Lisa is gestolen!',
        where: 'Start aan het Louvre. Vang de dief met het schilderij.',
        story: 'In 1911 wandelde een werkman het Louvre uit met de Mona Lisa onder zijn jas, en twee jaar lang was ze zoek. Nu gebeurt het opnieuw: daar gaat de dief, het schilderij onder de arm. Vang hem voor hij de Seine over is.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖼️',
        win: '🖼️ De Mona Lisa hangt terug aan haar muur. Ze glimlacht.',
        lose: '🦹 De dief is ontsnapt. De Mona Lisa is weg…',
      },
      en: {
        title: 'The Mona Lisa is stolen!',
        where: 'Start at the Louvre. Catch the thief with the painting.',
        story: 'In 1911 a workman walked out of the Louvre with the Mona Lisa under his coat, and she was gone for two years. Now it is happening again: there goes the thief, the painting under their arm. Catch them before they cross the Seine.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖼️',
        win: '🖼️ The Mona Lisa is back on her wall. She smiles.',
        lose: '🦹 The thief got away. The Mona Lisa is gone…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [505, 5], pad: [505, 5], radius: 16,
    victims: [[152, 521, 'Notre-Dame'], [-672, -210, 'Pont Neuf']], drop: [-965, -561, 'Louvre'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan het plein voor het Hôtel de Ville. Red twee zwemmers en breng ze naar de piramide van het Louvre.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Seine, naast de Notre-Dame, en nóg iemand gaat bijna kopje-onder in de Seine, aan de punt van het eiland bij de Pont Neuf! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de piramide van het Louvre, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Notre-Dame!', '🚁 Naar de Pont Neuf!', '🚁 Naar de piramide van het Louvre, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the square of the Hôtel de Ville. Save two swimmers and fly them to the Louvre’s pyramid.',
        story: 'Alarm! A swimmer is in trouble in the Seine, beside Notre-Dame, and a second one is about to go under in the Seine, at the tip of the island by the Pont Neuf! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Louvre’s pyramid, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To Notre-Dame!', '🚁 To the Pont Neuf!', '🚁 To the Louvre’s pyramid, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
