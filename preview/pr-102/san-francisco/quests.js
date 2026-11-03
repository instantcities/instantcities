// The quests in San Francisco: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'cablecar', emoji: '🚃', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 320, start: [-636, -170], goal: [-896, 1236], radius: 22,
    text: {
      nl: {
        title: 'De laatste cable car',
        where: 'Van Portsmouth Square naar de draaischijf van de cable car op Powell Street, bij Market Street.',
        story: 'Langs Portsmouth Square reed in 1873 de allereerste cable car, Clay Street op. Nu vertrekt de laatste cable car van vanavond van de draaischijf aan Powell en Market, en je vrienden zitten er al in. De bemanning duwt hem al rond. Door Chinatown, langs Union Square, en snel!',
        hud: '🚃 Naar de cable car!',
        done: 'DING DING! 🚃',
        win: '🚃 Je springt op de treeplank terwijl de gripman de bel luidt. Op naar de heuvels!',
        lose: '🚃 De bel klinkt in de verte. De laatste cable car is weg…',
      },
      en: {
        title: 'The last cable car',
        where: 'From Portsmouth Square to the cable car turntable on Powell Street, by Market Street.',
        story: 'The very first cable car ran up Clay Street past Portsmouth Square in 1873. Now the last cable car of the night leaves from the turntable at Powell and Market, and your friends are already on board. The crew are pushing it round. Through Chinatown, past Union Square, and hurry!',
        hud: '🚃 To the cable car!',
        done: 'DING DING! 🚃',
        win: '🚃 You jump onto the running board as the gripman rings the bell. Up the hills you go!',
        lose: '🚃 The bell rings in the distance. The last cable car has gone…',
      },
    },
  },
];
