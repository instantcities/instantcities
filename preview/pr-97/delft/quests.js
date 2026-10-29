// The quests in Delft: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'vermeer', emoji: '🎨', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [-194, -210], thief: [-240, -235],
    text: {
      nl: {
        title: 'Wie heeft de Vermeer?',
        where: 'Start aan de Oude Delft bij het Prinsenhof. Vang de dief met het schilderij.',
        story: 'Alarm in het Prinsenhof: iemand is ervandoor met een Vermeer die er te leen hing, het meisje dat een brief leest bij het raam. Daar gaan ze, langs de Oude Delft. Vang hem voor het doek in een gracht belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🎨',
        win: '🎨 De Vermeer hangt weer veilig aan de muur, het licht valt nog net zo door het raam.',
        lose: '🦹 De dief is ontsnapt. De Vermeer is weg…',
      },
      en: {
        title: 'Who took the Vermeer?',
        where: 'Start on the Oude Delft by the Prinsenhof. Catch the thief with the painting.',
        story: 'Alarm in the Prinsenhof: someone has made off with a Vermeer on loan for an exhibition, the girl reading a letter by the window. There they go, along the Oude Delft. Catch them before the canvas ends up in a canal.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🎨',
        win: '🎨 The Vermeer is safely back on the wall, the light still falling through the window.',
        lose: '🦹 The thief got away. The Vermeer is gone…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [-88, 484], pad: [-88, 484], radius: 16,
    victims: [[-246, -295, 'Oude Delft'], [677, 400, 'Oostpoort']], drop: [126, -180, 'Markt'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan het station. Red twee zwemmers en breng ze naar de Markt.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Oude Delft, bij de Oude Kerk, en nóg iemand gaat bijna kopje-onder in het water bij de Oostpoort! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Markt, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Oude Kerk!', '🚁 Naar de Oostpoort!', '🚁 Naar de Markt, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the station. Save two swimmers and fly them to the Markt.',
        story: 'Alarm! A swimmer is in trouble in the Oude Delft, by the Old Church, and a second one is about to go under in the water at the Oostpoort! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Markt, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Old Church!', '🚁 To the Oostpoort!', '🚁 To the Markt, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
