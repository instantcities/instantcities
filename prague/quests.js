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
];
