// The race route at Stonehenge: once round the stones on a path 95 m from the middle, outside the
// bank and the ditch and round the Heel Stone, along the four paths of area.json (same id), in riding
// order, and it closes on the first. seed: the dice for the items and obstacles on it; anything else
// is passed to realTrack (js/realtrack.js). hw: half the path's width, as in area.json.
export const RACES = [
  {
    id: 'stones',
    name: { nl: 'Rond de stenen', en: 'Round the stones', fr: 'Autour des pierres', es: 'Alrededor de las piedras' },
    blurb: {
      nl: 'Eenmaal rond de steencirkel op het pad buiten de walgracht, langs de Heel Stone en de Avenue die naar het noordoosten loopt.',
      en: 'Once round the stone circle on the path outside the bank and ditch, past the Heel Stone and the Avenue that runs away to the north-east.',
      fr: 'Un tour du cercle de pierres sur le sentier au-delà du fossé et du talus, devant la Heel Stone et l’Avenue qui part vers le nord-est.',
      es: 'Una vuelta al círculo de piedras por el sendero fuera del foso y el talud, junto a la Heel Stone y la Avenida que se aleja al nordeste.',
    },
    seed: 7400,
    hw: 3,
    bikers: 0,
    theme: { pavement: 0.8, lampEvery: 1e9, ground: '#9aa266', dirt: '#bdb394', sky: 0x4a94de, horizon: 0xe4eaee },
  },
];
