import { game } from './frame.js';
export const SIGHTS = [
  {
    "id": "place-0",
    "emoji": "\ud83c\udfdb\ufe0f",
    "xy": [
      0,
      0
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Parthenon",
        "text": "The great temple of Athena has eight columns at each end and seventeen along each side."
      },
      "nl": {
        "name": "Parthenon",
        "text": "The great temple of Athena has eight columns at each end and seventeen along each side."
      }
    }
  },
  {
    "id": "place-1",
    "emoji": "\ud83c\udfdb\ufe0f",
    "xy": [
      -20,
      -60
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Erechtheion",
        "text": "An asymmetrical temple north of the Parthenon, known for its porch of six Caryatids."
      },
      "nl": {
        "name": "Erechtheion",
        "text": "An asymmetrical temple north of the Parthenon, known for its porch of six Caryatids."
      }
    }
  },
  {
    "id": "place-2",
    "emoji": "\ud83c\udfdb\ufe0f",
    "xy": [
      -140,
      0
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Propylaea",
        "text": "The monumental western gateway frames the approach to the summit."
      },
      "nl": {
        "name": "Propylaea",
        "text": "The monumental western gateway frames the approach to the summit."
      }
    }
  },
  {
    "id": "place-3",
    "emoji": "\ud83c\udfdb\ufe0f",
    "xy": [
      -153,
      36
    ],
    "r": 35,
    "text": {
      "en": {
        "name": "Temple of Athena Nike",
        "text": "A small Ionic temple stands beside the western entrance."
      },
      "nl": {
        "name": "Temple of Athena Nike",
        "text": "A small Ionic temple stands beside the western entrance."
      }
    }
  }
].map(({ xy, ...s }) => { const [x,z] = game(...xy); return { ...s, x, z }; });
