import { game } from './frame.js';
export const SIGHTS = [
  {
    "id": "place-0",
    "emoji": "\ud83d\udd3a",
    "xy": [
      0,
      0
    ],
    "r": 100,
    "text": {
      "en": {
        "name": "Great Pyramid of Khufu",
        "text": "The largest of the three main pyramids. Most of its smooth outer casing has been lost."
      },
      "nl": {
        "name": "Great Pyramid of Khufu",
        "text": "The largest of the three main pyramids. Most of its smooth outer casing has been lost."
      }
    }
  },
  {
    "id": "place-1",
    "emoji": "\ud83d\udd3a",
    "xy": [
      -360,
      350
    ],
    "r": 100,
    "text": {
      "en": {
        "name": "Pyramid of Khafre",
        "text": "The second great pyramid retains pale casing stones near its summit."
      },
      "nl": {
        "name": "Pyramid of Khafre",
        "text": "The second great pyramid retains pale casing stones near its summit."
      }
    }
  },
  {
    "id": "place-2",
    "emoji": "\ud83d\udd3a",
    "xy": [
      250,
      440
    ],
    "r": 100,
    "text": {
      "en": {
        "name": "Great Sphinx",
        "text": "A limestone lion with a human head guards the eastern side of the plateau."
      },
      "nl": {
        "name": "Great Sphinx",
        "text": "A limestone lion with a human head guards the eastern side of the plateau."
      }
    }
  },
  {
    "id": "place-3",
    "emoji": "\ud83d\udd3a",
    "xy": [
      -570,
      730
    ],
    "r": 100,
    "text": {
      "en": {
        "name": "Pyramid of Menkaure",
        "text": "The smallest of the three main pyramids stands beside three much smaller pyramids."
      },
      "nl": {
        "name": "Pyramid of Menkaure",
        "text": "The smallest of the three main pyramids stands beside three much smaller pyramids."
      }
    }
  }
].map(({ xy, ...s }) => { const [x,z] = game(...xy); return { ...s, x, z }; });
