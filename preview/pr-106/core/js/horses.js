import { LOOK } from './city.js';

// The characters, each with a name and its own colours: the shirt (or silk), the cap, and the coat
// and mane of whatever animal they ride in a race. Riding about, the animal has its species' own coat
// instead (COATS in horse.js). They are all equally fast and strong, whatever they ride.
// The computer always rides horses. `cop`: in uniform, like the cop chasing the painting on the loading
// screen, with a moustache and a badge on the cap.
export const STABLE = [
  { id: 'hagelslag', name: 'Hagelslag', coat: 0x8b4a2b, mane: 0x2b1a10, silk: 0xe53935, cap: 0xffffff },
  { id: 'stroopwafel', name: 'Stroopwafel', coat: 0x3b2f2a, mane: 0x141414, silk: 0x1e88e5, cap: 0xffffff },
  { id: 'bliksem', name: 'Bliksem', coat: 0xdcd6cc, mane: 0x8a8a8a, silk: 0xfdd835, cap: 0x212121 },
  { id: 'karamel', name: 'Karamel', coat: 0xc8954c, mane: 0xf1e2bd, silk: 0x43a047, cap: 0xffffff },
  { id: 'vla', name: 'Vla', coat: 0xf6f3ee, mane: 0x16120f, silk: 0xff7043, cap: 0x212121 },
  { id: 'tijgerbrood', name: 'Tijgerbrood', coat: 0xf08a24, mane: 0x16120f, silk: 0x26c6da, cap: 0x212121 },
  { id: 'spekkie', name: 'Spekkie', coat: 0xf7b8c4, mane: 0xe98ea0, silk: 0x8e24aa, cap: 0xfdd835 },
  { id: 'suikerspin', name: 'Suikerspin', coat: 0xfaf7ff, mane: 0xff80ab, silk: 0xff80ab, cap: 0xffffff },
  { id: 'agent', name: 'Agent', coat: 0x4a2f1f, mane: 0x16120f, silk: 0x23395d, cap: 0x23395d, cop: true },
];

// What a character can ride, or go on foot or by bike, and in an Italian town (LOOK style 'italian') on
// a Vespa. They are all equally fast.
export const ITALIAN = LOOK?.style === 'italian';
export const MOUNTS = ['bike', ...(ITALIAN ? ['vespa'] : []), 'foot', 'horse', 'cow', 'tiger', 'pig', 'unicorn'];
// The colours an animal comes in when you pick it: a brown horse, a white cow, a pink pig... You can
// still change them after.
export const MOUNT_COLORS = { horse: 'hagelslag', cow: 'vla', tiger: 'tijgerbrood', pig: 'spekkie', unicorn: 'suikerspin' };

// Fixed colours per player seat, used for HUDs, name tags and the minimap.
export const PLAYER_COLORS = [0xe53935, 0x1e88e5, 0x43a047, 0xfb8c00];
