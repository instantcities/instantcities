// The game's own icons, drawn as lines (24 × 24, in the colour of the text round them) rather than
// emoji, which look different on every phone: on the action button, the menu button, the street sign
// under the minimap (where you are and what you are doing) and the menu's city picker.

const svg = body => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  // the action button: through a door, in or out, and a painting full screen
  enter: svg('<path d="M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5"/><path d="M3 12h11"/><path d="M10 8l4 4-4 4"/>'),
  exit: svg('<path d="M10 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5"/><path d="M10 12h11"/><path d="M17 8l4 4-4 4"/>'),
  view: svg('<path d="M3 8V4h4M21 8V4h-4M3 16v4h4M21 16v4h-4"/><rect x="7" y="8" width="10" height="8" rx="1"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  // where you are: in the street, or in a building
  pin: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  building: svg('<path d="M3 9l9-5 9 5"/><path d="M4 21h16M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18"/>'),
  // what you are doing: riding about, a mission, a race, the tour
  explore: svg('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
  mission: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  race: svg('<path d="M5 21V4"/><path d="M5 4h13l-2.5 4L18 12H5"/>'),
  tour: svg('<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3"/>'),
  city: svg('<path d="M3 21h18"/><path d="M5 21V10l4-3v14"/><path d="M9 21V4h6v17"/><path d="M15 21v-9h4v9"/><path d="M11.5 8h1M11.5 12h1M11.5 16h1"/>'),
};
