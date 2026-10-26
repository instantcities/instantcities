// The quests in Madrid: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'uvas', emoji: '🍇', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 260, start: [-615, -17], goal: [529, 135], radius: 22,
    text: {
      nl: {
        title: 'Twaalf druiven',
        where: 'Van het Koninklijk Paleis naar de Puerta del Sol voor middernacht.',
        story: 'Op oudejaarsavond eet heel Spanje twaalf druiven, een op elke slag van de klok op de Puerta del Sol. Je hebt je druiven, maar je staat nog aan het Koninklijk Paleis. De Calle Mayor af, snel!',
        hud: '🍇 Naar de Puerta del Sol!',
        done: '¡FELIZ AÑO! 🍇',
        win: '🍇 Twaalf slagen, twaalf druiven. ¡Feliz Año Nuevo!',
        lose: '🍇 De klok heeft geslagen. Je druiven moeten een jaar wachten…',
      },
      en: {
        title: 'Twelve grapes',
        where: 'From the Royal Palace to the Puerta del Sol before midnight.',
        story: 'On New Year’s Eve all of Spain eats twelve grapes, one on each stroke of the clock on the Puerta del Sol. You have your grapes, but you are still at the Royal Palace. Down the Calle Mayor, fast!',
        hud: '🍇 To the Puerta del Sol!',
        done: '¡FELIZ AÑO! 🍇',
        win: '🍇 Twelve strokes, twelve grapes. ¡Feliz Año Nuevo!',
        lose: '🍇 The clock has struck. Your grapes will have to wait a year…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [529, 135], pad: [529, 135], radius: 16,
    victims: [[-648, -673, 'Plaza de España'], [-590, -290, 'Sabatini']], drop: [116, 328, 'Plaza Mayor'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Puerta del Sol. Red twee toeristen en breng ze naar de Plaza Mayor.',
        story: 'Alarm! Op de heetste dag van het jaar sprongen twee toeristen in de fonteinen om af te koelen, en nu raken ze er niet meer uit: één in de vijver op de Plaza de España, de andere in de vijver van de Sabatini-tuinen, bij het Koninklijk Paleis! Stijg op, vlieg door de cirkel boven elke toerist, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Plaza Mayor, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de toeristen!',
        legs: ['🚁 Naar de Plaza de España!', '🚁 Naar de Sabatini-tuinen!', '🚁 Naar de Plaza Mayor, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee toeristen veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de brandweer heeft ze er al uit gevist.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Puerta del Sol. Save two tourists and fly them to the Plaza Mayor.',
        story: 'Alarm! On the hottest day of the year two tourists jumped into the fountains to cool off, and now they can’t get out: one in the pond on the Plaza de España, the other in the pond of the Sabatini Gardens, by the Royal Palace! Take off, fly through the circle over each tourist, not too high, and the winch has them up at once; then fly both to the Plaza Mayor, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the tourists!',
        legs: ['🚁 To the Plaza de España!', '🚁 To the Sabatini Gardens!', '🚁 To the Plaza Mayor, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two tourists safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade has fished them out already.',
      },
    },
  },
];
