// All player-facing text, in English (the default) and Dutch; {name}-style placeholders are filled in
// by t(). A city can say some of it its own way (WORDS in <city>/city.js: the title, the tagline).
import { WORDS } from './city.js';

export const LANGS = { en: '🇬🇧 EN', nl: '🇳🇱 NL' };

const STR = {
  en: {
    tag: 'Explore Ghent by bike, on foot or on horseback!',
    'row.track': 'Track', 'laps1': '1 lap', 'lapsN': '{n} laps',
    players1: '1 player', playersN: '{n} players',
    'weapons.on': '🐰 With weapons', 'weapons.off': '🏇 Just racing',
    'time.day': '☀️ Day', 'time.night': '🌙 Night', 'wx.clear': '🌤️ Dry', 'wx.rain': '🌧️ Rain', 'wx.snow': '❄️ Snow', 'sky.auto': '🔄 Weather: auto',
    'sound.on': '🔊 Sound on', 'sound.off': '🔇 Sound off',
    player: 'Player {n}', solo: 'Player', computer: 'Computer {n}',
    'key.jump': 'jump', 'key.item': 'use item',
    rename: 'Type your name', color: 'Colour',
    'start.keys': 'Press SPACE or ENTER to race', 'start.tap': 'Tap to race',
    paused: 'Paused', 'pause.map': '🗺️ Map', resume: 'Resume', restart: '↺ Restart race', backToMenu: '⌂ Back to menu', 'site.back': '← Back to the website', 'legal.privacy': 'Privacy', 'legal.terms': 'Terms', menu: '⌂ Menu',
    'bigmap.questHint': 'Your targets are on the map', 'bigmap.hint': 'Click a spot to teleport there', 'bigmap.ask': 'Teleport here?', 'bigmap.askTo': 'Teleport to {name}?', 'bigmap.blocked': 'You can’t stand there', 'bigmap.yes': '✨ Yes!', 'bigmap.no': 'Cancel', 'bigmap.close': '✕ Keep riding', 'bigmap.tabMap': '🗺️ Map', 'bigmap.tabIndex': '📍 Places index', 'bigmap.search': 'Look up a place or street…', 'bigmap.none': 'Nothing found', 'bigmap.places': 'Places', 'bigmap.sights': 'Sights', 'bigmap.streets': 'Streets', 'bigmap.indexHint': 'Click a place to see it on the map and teleport there', 'bigmap.sideHint': 'Point at a place in the list to see it on the map, click to teleport there', 'bigmap.k.museum': 'Museums', 'bigmap.k.culture': 'Theatre, music and film', 'bigmap.k.restaurant': 'Restaurants', 'bigmap.k.cafe': 'Cafés and bars', 'bigmap.k.market': 'Markets', 'bigmap.k.park': 'Parks and quarters', 'bigmap.k.church': 'Churches', 'bigmap.k.school': 'Schools and university', 'bigmap.k.library': 'Library', 'bigmap.k.hospital': 'Hospitals',
    results: 'Results', again: 'Race again', 'results.foot': 'SPACE / ENTER race again · T menu',
    'win.solo': '🏆 You win the derby!', 'win.player': '🏆 {rider} wins the derby!',
    'win.ai': '🐎 {name} wins! The bunnies demand a rematch.',
    'solo.place': 'You finished {place} on {track}.', duel: '{a} beat {b} this time.',
    lap: 'LAP', toGo: 'TO GO', wrongWay: 'WRONG WAY!', 'incoming.bunny': '🐰 INCOMING!', 'incoming.cloud': '🌧️ CLOUD INCOMING!',
    finish: 'FINISH!', go: 'GO!', banner: 'FINISH', bannerStart: 'START',
    'msg.lap': 'LAP {n}', 'msg.final': 'FINAL LAP!', 'msg.bonk': 'BONK! 🐰', 'msg.hit': 'Hit {name}!',
    'msg.ouch': 'OUCH! 🦔', 'msg.trap': '{name} found your hedgehog!', 'msg.soaked': 'SOAKED! 🌧️', 'msg.rained': 'Rained on {name}!',
    'kind.race': '🏁 Race', 'roam.hud': '🗺️ explore', 'sight.label': 'Sight', 'sight.secret': 'Secret found!', 'sight.more': 'Read more ↗', 'sight.close': 'Close', 'start.keysRoam': 'Press SPACE or ENTER to ride', 'start.tapRoam': 'Tap to ride', 'msg.bike': 'WATCH OUT, CYCLIST! 🚲', 'msg.carKey': 'BONK! Jump onto the cars with {key}', 'msg.carTap': 'BONK! Tap JUMP to get onto the cars', 'msg.oofKey': 'OOF! Jump with {key}', 'msg.oofTap': 'OOF! Tap JUMP', 'msg.splash': 'SPLASH! 💦',
    'tram.stop': 'Tram stop', 'tram.askKey': '<kbd>{key}</kbd> to wait for the tram', 'tram.askTap': 'Tap here to wait for the tram', 'tram.coming': 'Your tram is on its way', 'tram.next': 'Next stop: {name}', 'tram.exitKey': '<kbd>{key}</kbd> get off at the nearest stop · <kbd>←</kbd><kbd>→</kbd> look around', 'tram.exitTap': 'Tap here to get off', 'tram.off': '🚋 Off at {name}', 'tram.end': '🚋 End of the line! Everybody off', 'tram.on': '🚋 All aboard! Enjoy the view',
    'hint.full': '<kbd>{fire}</kbd> use item · <kbd>{jump}</kbd> jump · hold <kbd>{back}</kbd> to throw back',
    'hint.jump': '<kbd>{jump}</kbd> jump',
    'tb.item': 'item', 'tb.jump': 'jump', 'tb.steer': '◀ drag to steer ▶', 'tb.ride': '✥ drag to ride',
    mute: '🔇 sound off (M)',
    'level.easy': 'Easy', 'level.medium': 'Medium', 'level.long': 'Long', 'level.tricky': 'Tricky',
    'mount.horse': '🐎 Horse', 'mount.cow': '🐄 Cow', 'mount.tiger': '🐅 Tiger', 'mount.pig': '🐖 Pig', 'mount.unicorn': '🦄 Unicorn', 'mount.foot': '🏃 On foot', 'mount.bike': '🚲 Bike',
    'kind.mission': '🎯 Missions', 'start.keysQuest': 'Press SPACE or ENTER for your mission', 'start.tapQuest': 'Tap for your mission',
    'mission.free': 'Free exploring', 'mission.freeTime': 'no time limit',
    'kind.tour': '🎥 Tour', 'start.keysTour': 'Press SPACE or ENTER for the tour', 'start.tapTour': 'Tap for the tour',
    'tour.auto': 'Autoplay', 'tour.autoSub': 'sit back and watch', 'tour.click': 'Interactive', 'tour.clickSub': 'click on at every stop',
    'tour.welcome': 'Welcome to {city}!', 'tour.welcomeSub': 'Known for its rich history, its stunning historic centre and lively traditions like the Light Festival, the Christmas market and the Gentse Feesten, and much more. Enjoy!', 'tour.label': 'Tour', 'tour.next': 'Go on ▶', 'tour.more': 'Read more ↗', 'tour.again': '↺ Again', 'tour.end': 'End of the tour', 'tour.endText': 'You are back where you set off, by St Michael’s Bridge. Fancy riding around yourself? Pick Missions in the menu.',
    'quest.go': '▶ START', 'quest.time': '⏱ You have {time}', 'quest.foot': 'SPACE / ENTER starts · Esc menu', 'quest.footTap': 'Tap START',
    'quest.inTime': 'Done in {time}.', 'quest.late': 'TOO LATE!', 'quest.puked': 'BLEEEH! 🤮', 'quest.retch': '🤢 WATCH OUT, THEY’RE GOING TO BE SICK!', 'quest.ran': 'BUMP! 🏃',
    pad: '🎮 Gamepad {n} controls player {n}',
  },
  nl: {
    tag: 'Exploreer Gent te fiets, te voet of te paard!',
    'row.track': 'Baan', 'laps1': '1 ronde', 'lapsN': '{n} rondes',
    players1: '1 speler', playersN: '{n} spelers',
    'weapons.on': '🐰 Met wapens', 'weapons.off': '🏇 Alleen racen',
    'time.day': '☀️ Dag', 'time.night': '🌙 Nacht', 'wx.clear': '🌤️ Droog', 'wx.rain': '🌧️ Regen', 'wx.snow': '❄️ Sneeuw', 'sky.auto': '🔄 Weer: automatisch',
    'sound.on': '🔊 Geluid aan', 'sound.off': '🔇 Geluid uit',
    player: 'Speler {n}', solo: 'Speler', computer: 'Computer {n}',
    'key.jump': 'springen', 'key.item': 'item',
    rename: 'Typ je naam', color: 'Kleur',
    'start.keys': 'Druk op SPATIE of ENTER om te racen', 'start.tap': 'Tik om te racen',
    paused: 'Pauze', 'pause.map': '🗺️ Kaart', resume: 'Verder', restart: '↺ Opnieuw', backToMenu: '⌂ Terug naar menu', 'site.back': '← Terug naar de website', 'legal.privacy': 'Privacy', 'legal.terms': 'Voorwaarden', menu: '⌂ Menu',
    'bigmap.questHint': 'Je doelen staan op de kaart', 'bigmap.hint': 'Klik op een plek om ernaartoe te teleporteren', 'bigmap.ask': 'Hierheen teleporteren?', 'bigmap.askTo': 'Naar {name} teleporteren?', 'bigmap.blocked': 'Daar kan je niet staan', 'bigmap.yes': '✨ Ja!', 'bigmap.no': 'Annuleren', 'bigmap.close': '✕ Verder rijden', 'bigmap.tabMap': '🗺️ Kaart', 'bigmap.tabIndex': '📍 Plekkenindex', 'bigmap.search': 'Zoek een plek of straat…', 'bigmap.none': 'Niets gevonden', 'bigmap.places': 'Plekken', 'bigmap.sights': 'Bezienswaardigheden', 'bigmap.streets': 'Straten', 'bigmap.indexHint': 'Klik op een plek om ze op de kaart te zien en ernaartoe te teleporteren', 'bigmap.sideHint': 'Wijs een plek aan in de lijst om ze op de kaart te zien, klik om ernaartoe te teleporteren', 'bigmap.k.museum': 'Musea', 'bigmap.k.culture': 'Theater, muziek en film', 'bigmap.k.restaurant': 'Restaurants', 'bigmap.k.cafe': 'Cafés', 'bigmap.k.market': 'Markten', 'bigmap.k.park': 'Parken en buurten', 'bigmap.k.church': 'Kerken', 'bigmap.k.school': 'Scholen en universiteit', 'bigmap.k.library': 'Bibliotheek', 'bigmap.k.hospital': 'Ziekenhuizen',
    results: 'Uitslag', again: 'Nog een keer', 'results.foot': 'SPATIE / ENTER nog een keer · T menu',
    'win.solo': '🏆 Jij wint de derby!', 'win.player': '🏆 {rider} wint de derby!',
    'win.ai': '🐎 {name} wint! De konijnen willen een revanche.',
    'solo.place': 'Je werd {place} op {track}.', duel: '{a} versloeg {b} deze keer.',
    lap: 'RONDE', toGo: 'NOG', wrongWay: 'VERKEERDE KANT!', 'incoming.bunny': '🐰 KONIJN KOMT ERAAN!', 'incoming.cloud': '🌧️ WOLK KOMT ERAAN!',
    finish: 'FINISH!', go: 'GO!', banner: 'FINISH', bannerStart: 'START',
    'msg.lap': 'RONDE {n}', 'msg.final': 'LAATSTE RONDE!', 'msg.bonk': 'BOEM! 🐰', 'msg.hit': 'Raak: {name}!',
    'msg.ouch': 'AU! 🦔', 'msg.trap': '{name} vond je egel!', 'msg.soaked': 'KLETSNAT! 🌧️', 'msg.rained': 'Regen op {name}!',
    'kind.race': '🏁 Race', 'roam.hud': '🗺️ exploreer', 'sight.label': 'Bezienswaardigheid', 'sight.secret': 'Geheim gevonden!', 'sight.more': 'Lees meer ↗', 'sight.close': 'Sluiten', 'start.keysRoam': 'Druk op SPATIE of ENTER om te gaan rijden', 'start.tapRoam': 'Tik om te gaan rijden', 'msg.bike': 'PAS OP, FIETSER! 🚲', 'msg.carKey': 'BOEM! Spring op de auto’s met {key}', 'msg.carTap': 'BOEM! Tik op SPRING voor de auto’s', 'msg.oofKey': 'OEF! Spring met {key}', 'msg.oofTap': 'OEF! Tik op SPRING', 'msg.splash': 'PLONS! 💦',
    'tram.stop': 'Tramhalte', 'tram.askKey': '<kbd>{key}</kbd> om op de tram te wachten', 'tram.askTap': 'Tik hier om op de tram te wachten', 'tram.coming': 'Je tram komt eraan', 'tram.next': 'Volgende halte: {name}', 'tram.exitKey': '<kbd>{key}</kbd> uitstappen aan de dichtstbijzijnde halte · <kbd>←</kbd><kbd>→</kbd> rondkijken', 'tram.exitTap': 'Tik hier om uit te stappen', 'tram.off': '🚋 Uitgestapt: {name}', 'tram.end': '🚋 Eindhalte! Iedereen uitstappen', 'tram.on': '🚋 Instappen! Geniet van het uitzicht',
    'hint.full': '<kbd>{fire}</kbd> item · <kbd>{jump}</kbd> springen · houd <kbd>{back}</kbd> in om naar achteren te gooien',
    'hint.jump': '<kbd>{jump}</kbd> springen',
    'tb.item': 'item', 'tb.jump': 'spring', 'tb.steer': '◀ sleep om te sturen ▶', 'tb.ride': '✥ sleep om te rijden',
    mute: '🔇 geluid uit (M)',
    'level.easy': 'Makkelijk', 'level.medium': 'Gemiddeld', 'level.long': 'Lang', 'level.tricky': 'Pittig',
    'mount.horse': '🐎 Paard', 'mount.cow': '🐄 Koe', 'mount.tiger': '🐅 Tijger', 'mount.pig': '🐖 Varken', 'mount.unicorn': '🦄 Eenhoorn', 'mount.foot': '🏃 Te voet', 'mount.bike': '🚲 Fiets',
    'kind.mission': '🎯 Missies', 'start.keysQuest': 'Druk op SPATIE of ENTER voor je missie', 'start.tapQuest': 'Tik voor je missie',
    'mission.free': 'Vrij verkennen', 'mission.freeTime': 'geen tijdslimiet',
    'kind.tour': '🎥 Tour', 'start.keysTour': 'Druk op SPATIE of ENTER voor de tour', 'start.tapTour': 'Tik voor de tour',
    'tour.auto': 'Automatisch', 'tour.autoSub': 'leun achterover en kijk', 'tour.click': 'Interactief', 'tour.clickSub': 'klik zelf verder bij elke stop',
    'tour.welcome': 'Welkom in {city}!', 'tour.welcomeSub': 'Bekend om zijn rijke geschiedenis, het schitterende historische centrum en levendige tradities als het Lichtfestival, de Kerstmarkt en de Gentse Feesten, en nog veel meer. Enjoy!', 'tour.label': 'Tour', 'tour.next': 'Verder ▶', 'tour.more': 'Lees meer ↗', 'tour.again': '↺ Nog eens', 'tour.end': 'Einde van de tour', 'tour.endText': 'Je bent terug waar je vertrok, op de Sint-Michielshelling. Zin om zelf rond te rijden? Kies Missies in het menu.',
    'quest.go': '▶ START', 'quest.time': '⏱ Je hebt {time}', 'quest.foot': 'SPATIE / ENTER start · Esc menu', 'quest.footTap': 'Tik op START',
    'quest.inTime': 'Gelukt in {time}.', 'quest.late': 'TE LAAT!', 'quest.puked': 'BLEEEH! 🤮', 'quest.retch': '🤢 PAS OP, HIJ GAAT KOTSEN!', 'quest.ran': 'BOTS! 🏃',
    pad: '🎮 Gamepad {n} bestuurt speler {n}',
  },
};

let lang = 'en';

export function setLang(l) {
  lang = STR[l] ? l : 'en';
  document.documentElement.lang = lang;
}

export const getLang = () => lang;

export function t(key, vars = {}) {
  const s = WORDS?.[lang]?.[key] ?? STR[lang][key] ?? WORDS?.en?.[key] ?? STR.en[key] ?? key;
  return typeof s === 'string' ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s;
}

// Suffix after a finishing position: 1st / 1e.
export function ordinal(n) {
  if (lang === 'nl') return 'e';
  return ['th', 'st', 'nd', 'rd'][n] || 'th';
}

// A localized field from a config object like { nl: '…', en: '…' }.
export const local = obj => (typeof obj === 'string' ? obj : obj[lang] ?? obj.en ?? Object.values(obj)[0]);

// Fill every element marked data-i18n (text) or data-i18n-html (markup).
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  // the game's name, in front of its BETA badge, when the city has its own
  if (WORDS) {
    root.querySelectorAll('.title').forEach(el => { if (el.firstChild?.nodeType === 3) el.firstChild.nodeValue = `${t('title')} `; });
    document.title = t('title');
  }
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
}
