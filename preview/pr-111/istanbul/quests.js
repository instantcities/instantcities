// The quests in Istanbul: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'vapur', emoji: '⛴️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 330, start: [20, 447], goal: [-215, -890], radius: 22,
    text: {
      nl: {
        title: 'De boot naar Kadıköy',
        where: 'Van de Divan Yolu bij de Hippodroom naar de veerboten aan de kade van Eminönü.',
        story: 'De vapur naar Kadıköy, aan de Aziatische kant, vertrekt zo van Eminönü, en jij staat nog boven bij de Blauwe Moskee. Naar beneden dan, langs de tram, de Ankara Caddesi af naar Sirkeci en tussen de simitkarren door naar de kade.',
        hud: '⛴️ Naar de boot!',
        done: 'AAN BOORD! ⛴️',
        win: '⛴️ De loopplank gaat net achter je omhoog. Een glas thee, een simit voor de meeuwen, en op naar Azië!',
        lose: '⛴️ De boot is al op de Bosporus…',
      },
      en: {
        title: 'The boat to Kadıköy',
        where: 'From the Divan Yolu by the Hippodrome down to the ferries on the quay at Eminönü.',
        story: 'The vapur to Kadıköy, on the Asian side, leaves Eminönü any minute, and you are still up by the Blue Mosque. Down you go, along the tram, down the Ankara Caddesi to Sirkeci and between the simit carts to the quay.',
        hud: '⛴️ To the boat!',
        done: 'ON BOARD! ⛴️',
        win: '⛴️ The gangway goes up just behind you. A glass of tea, a simit for the gulls, and off to Asia!',
        lose: '⛴️ The boat is already out on the Bosphorus…',
      },
    },
  },
];
