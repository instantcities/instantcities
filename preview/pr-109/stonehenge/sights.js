import { game } from './frame.js';
export const SIGHTS = [
  {
    "id": "place-0",
    "emoji": "\ud83e\udea8",
    "xy": [
      0,
      0
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Stone circle",
        "text": "The surviving sarsens and lintels form part of a circle around the inner horseshoe of trilithons."
      },
      "nl": {
        "name": "Stone circle",
        "text": "The surviving sarsens and lintels form part of a circle around the inner horseshoe of trilithons."
      }
    }
  },
  {
    "id": "place-1",
    "emoji": "\ud83e\udea8",
    "xy": [
      40,
      -70
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Heel Stone",
        "text": "This unworked sarsen stands outside the main circle, beside the approach along the Avenue."
      },
      "nl": {
        "name": "Heel Stone",
        "text": "This unworked sarsen stands outside the main circle, beside the approach along the Avenue."
      }
    }
  },
  {
    "id": "place-2",
    "emoji": "\ud83e\udea8",
    "xy": [
      0,
      53
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "The earthwork",
        "text": "A circular bank and ditch surround the stones. The earthwork is older than the main stone setting."
      },
      "nl": {
        "name": "The earthwork",
        "text": "A circular bank and ditch surround the stones. The earthwork is older than the main stone setting."
      }
    }
  }
].map(({ xy, ...s }) => { const [x,z] = game(...xy); return { ...s, x, z }; });
