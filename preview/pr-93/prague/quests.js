// The quests in Prague: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'orloj', emoji: '🕰️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 190, start: [-594, 170], goal: [245, 101], radius: 22,
    text: {
      nl: {
        title: 'Als de apostelen lopen',
        where: 'Van de Karelsbrug naar de astronomische klok voor het uur slaat.',
        story: 'Op het uur trekken de twaalf apostelen langs de raampjes van de astronomische klok, en je hebt je zusje beloofd dat je het zou filmen. Je staat nog op de Karelsbrug. Door de oude stad, snel!',
        hud: '🕰️ Naar de astronomische klok!',
        done: 'DING! 🕰️',
        win: '🕰️ De Dood luidt zijn bel, de apostelen lopen, en jij bent erbij.',
        lose: '🕰️ De laatste apostel is al voorbij…',
      },
      en: {
        title: 'When the apostles walk',
        where: 'From the Charles Bridge to the astronomical clock before the hour.',
        story: 'On the hour the twelve apostles parade past the windows of the astronomical clock, and you have promised your little sister you would film it. You are still on the Charles Bridge. Through the Old Town, quick!',
        hud: '🕰️ To the astronomical clock!',
        done: 'DING! 🕰️',
        win: '🕰️ Death rings his bell, the apostles walk, and you are there.',
        lose: '🕰️ The last apostle has gone by…',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [909, 44], pad: [909, 44], radius: 16,
    victims: [[-451, -175, 'Mánesův most'], [-496, 308, 'Karlův most']], drop: [286, 32, 'Staroměstské náměstí'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan het Náměstí Republiky. Red twee zwemmers en breng ze naar het Oudestadsplein.',
        story: 'Alarm! Er raakt een zwemmer in nood in de Moldau, bij de Mánesbrug, en nóg iemand gaat bijna kopje-onder in de Moldau, naast de Karelsbrug! Stijg op, vlieg door de cirkel boven elke zwemmer, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar het Oudestadsplein, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de zwemmers!',
        legs: ['🚁 Naar de Mánesbrug!', '🚁 Naar de Karelsbrug!', '🚁 Naar het Oudestadsplein, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee zwemmers veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de redders van de brandweer waren je voor.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Náměstí Republiky. Save two swimmers and fly them to the Old Town Square.',
        story: 'Alarm! A swimmer is in trouble in the Vltava, by the Mánes Bridge, and a second one is about to go under in the Vltava, beside Charles Bridge! Take off, fly through the circle over each swimmer, not too high, and the winch has them up at once; then fly both to the Old Town Square, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the swimmers!',
        legs: ['🚁 To the Mánes Bridge!', '🚁 To Charles Bridge!', '🚁 To the Old Town Square, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two swimmers safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade’s divers beat you to it.',
      },
    },
  },
];
