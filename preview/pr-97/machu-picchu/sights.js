import { game } from './frame.js';
export const SIGHTS = [
  {
    "id": "place-0",
    "emoji": "\u26f0\ufe0f",
    "xy": [
      -35,
      -65
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Sacred Plaza",
        "text": "Carefully fitted stone walls enclose the ceremonial buildings on the upper side of the town."
      },
      "nl": {
        "name": "Sacred Plaza",
        "text": "Carefully fitted stone walls enclose the ceremonial buildings on the upper side of the town."
      }
    }
  },
  {
    "id": "place-1",
    "emoji": "\u26f0\ufe0f",
    "xy": [
      110,
      170
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Agricultural terraces",
        "text": "Retaining walls divide the slope into narrow strips of growing ground."
      },
      "nl": {
        "name": "Agricultural terraces",
        "text": "Retaining walls divide the slope into narrow strips of growing ground."
      }
    }
  },
  {
    "id": "place-2",
    "emoji": "\u26f0\ufe0f",
    "xy": [
      25,
      5
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Residential quarter",
        "text": "Groups of roofless stone buildings stand beside the central open spaces."
      },
      "nl": {
        "name": "Residential quarter",
        "text": "Groups of roofless stone buildings stand beside the central open spaces."
      }
    }
  },
  {
    "id": "place-3",
    "emoji": "\u26f0\ufe0f",
    "xy": [
      15,
      -410
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Huayna Picchu",
        "text": "The steep mountain rises beyond the northern end of the archaeological site."
      },
      "nl": {
        "name": "Huayna Picchu",
        "text": "The steep mountain rises beyond the northern end of the archaeological site."
      }
    }
  }
].map(({ xy, ...s }) => { const [x,z] = game(...xy); return { ...s, x, z }; });
