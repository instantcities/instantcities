// All player-facing text, in English (the default) and Dutch; {name}-style placeholders are filled in
// by t(). A city can say some of it its own way (WORDS in <city>/city.js: the title, the tagline).
import { WORDS } from './city.js';

export const LANGS = { en: '🇬🇧 EN', nl: '🇳🇱 NL' };

const STR = {
  en: {
    'audio.gameMusicHint': 'During missions and races', 'audio.paintball': 'Paintball gun', 'menu.gunMode': 'Car+paintball mode', 'gun.shoot': 'You carry a paintball gun, on foot, on a bike or on your animal: shoot with the 🔫 button. Whoever you hit is covered in blue paint and falls over.', 'gun.borrow': 'Standing by a car or bus? Tap 🚗 borrow to drive it, and again to get out.', 'gun.where': 'It works in every mission. Where you would throw tequila shots, you shoot paint instead.', 'gun.ok': 'Got it!', 'tb.shoot': 'shoot', 'car.steal': 'borrow', 'car.he': 'Hey!', 'car.exit': 'get out', 'bus.driver': 'Driver', 'bus.getIn': '🚌 Get in the bus!', 'bus.next': '🚌 Next stop: {stop}', 'deliver.next': '🍫 Next delivery: {stop}', 'bus.toilet': '🚽 “I really need the toilet! Can you drive on for a bit?”', 'audio.unlockGun': 'Show car+paintball mode', 'audio.paintballHint': 'The 🚗🔫 checkbox on the main menu: the paint gun and borrowing cars everywhere, not only in Paintball Fight', 'quest.paintHit': 'Splat!',
    'audio.title': 'Music settings', 'audio.back': '← Back', 'audio.effects': 'Sound effects', 'audio.music': 'Background music', 'audio.hold': 'Hold for 2 seconds for music settings',
    tag: 'Explore Ghent by bike, on foot or on horseback!',
    'row.track': 'Track', 'laps1': '1 lap', 'lapsN': '{n} laps',
    players1: '1 player', playersN: '{n} players',
    'weapons.on': '🐰 With weapons', 'weapons.off': '🏇 Just racing',
    'time.day': '☀️ Day', 'time.night': '🌙 Night', 'wx.clear': '🌤️ Dry', 'wx.rain': '🌧️ Rain', 'wx.snow': '❄️ Snow', 'sky.auto': '🔄 Weather: auto',
    'style.fun': 'Playful', 'style.pro': 'Professional', 'sound.on': '🔊 Sound on', 'sound.off': '🔇 Sound off', 'cards.on': '👁️ Info cards on', 'cards.off': '👁️ Info cards off',
    player: 'Player {n}', solo: 'Player', computer: 'Computer {n}',
    'key.jump': 'jump', 'key.item': 'use item',
    rename: 'Type your name', color: 'Colour',
    'start.go': 'Start game', 'start.keys': 'Press SPACE or ENTER to race', 'start.tap': 'Tap to race',
    paused: 'Paused', 'pause.map': '🗺️ Map', 'pause.share': 'Share…', 'pause.settings': 'Settings…', 'pause.copied': '✓ Link to your current location copied to clipboard!', 'pause.copiedTour': '✓ Link to the tour copied to clipboard!', resume: 'Resume', restart: '↺ Restart race', backToMenu: 'Start menu', 'site.back': '← Back to the website', 'site.chip': '🌐 Website', 'made.by': 'Made with ❤️ by', 'legal.privacy': 'Privacy', 'legal.terms': 'Terms', menu: '⌂ Menu',
    'bigmap.questHint': 'Your targets are on the map', 'bigmap.hint': 'Click a spot to teleport there', 'bigmap.ask': 'Teleport here?', 'bigmap.askTo': 'Teleport to {name}?', 'bigmap.blocked': 'You can’t stand there', 'bigmap.yes': '✨ Yes!', 'bigmap.no': 'Cancel', 'bigmap.close': '✕ Keep riding', 'bigmap.zoomIn': 'Zoom in', 'bigmap.zoomOut': 'Zoom out', 'bigmap.tabMap': '🗺️ Map', 'bigmap.tabIndex': '📍 Places index', 'bigmap.search': 'Look up a place or street…', 'bigmap.none': 'Nothing found', 'bigmap.places': 'Places', 'bigmap.sights': 'Sights', 'bigmap.streets': 'Streets', 'bigmap.indexHint': 'Click a place to see it on the map and teleport there', 'bigmap.sideHint': 'Point at a place in the list to see it on the map, click to teleport there', 'bigmap.k.museum': 'Museums', 'bigmap.k.culture': 'Theatre, music and film', 'bigmap.k.restaurant': 'Restaurants', 'bigmap.k.cafe': 'Cafés and bars', 'bigmap.k.market': 'Markets', 'bigmap.k.park': 'Parks and quarters', 'bigmap.k.church': 'Churches', 'bigmap.k.school': 'Schools and university', 'bigmap.k.library': 'Library', 'bigmap.k.hospital': 'Hospitals',
    results: 'Results', again: 'Race again', 'results.foot': 'SPACE / ENTER race again · T menu',
    'win.solo': '🏆 You win the derby!', 'win.player': '🏆 {rider} wins the derby!',
    'win.ai': '🐎 {name} wins! The bunnies demand a rematch.',
    'solo.place': 'You finished {place} on {track}.', duel: '{a} beat {b} this time.',
    lap: 'LAP', toGo: 'TO GO', wrongWay: 'WRONG WAY!', 'incoming.bunny': '🐰 INCOMING!', 'incoming.cloud': '🌧️ CLOUD INCOMING!',
    finish: 'FINISH!', go: 'GO!', banner: 'FINISH', bannerStart: 'START',
    'msg.lap': 'LAP {n}', 'msg.final': 'FINAL LAP!', 'msg.bonk': 'BONK! 🐰', 'msg.hit': 'Hit {name}!',
    'msg.ouch': 'OUCH! 🦔', 'msg.trap': '{name} found your hedgehog!', 'msg.soaked': 'SOAKED! 🌧️', 'msg.rained': 'Rained on {name}!',
    'kind.race': '🏁 Race', 'roam.hud': '🗺️ explore', 'sight.more': 'Read more ↗', 'sight.enter': '🚪 Go inside', 'sight.close': 'Close', 'start.keysRoam': 'Press SPACE or ENTER to ride', 'start.tapRoam': 'Tap to ride', 'msg.bike': 'WATCH OUT, CYCLIST! 🚲', 'msg.rails': 'OUCH! Stuck in the tram rails', 'msg.carKey': 'BONK! Jump onto the cars with {key}', 'msg.carTap': 'BONK! Tap JUMP to get onto the cars', 'msg.oofKey': 'OOF! Jump with {key}', 'msg.oofTap': 'OOF! Tap JUMP', 'msg.splash': 'SPLASH! 💦',
    'door.in': 'Go inside', 'door.out': 'Back out to', 'door.tap': 'Tap', 'bigmap.inside': 'Go inside',
    'tram.stop': 'Tram stop', 'tram.coming': 'Your tram is on its way', 'tram.next': 'Next stop: {name}', 'tram.off': '🚋 Off at {name}', 'tram.end': '🚋 End of the line! Everybody off', 'tram.on': '🚋 All aboard! Enjoy the view', 'tram.label': 'Tram', 'tram.board': 'Get on tram {ref} towards {to}?', 'tram.sit': '💺 Sit inside', 'tram.stand': '👀 View from outside',
    'tram.head': '🚋 TRAM', 'tram.headOn': '🚋 ON THE TRAM', 'bus.head': '🚌 BUS', 'bus.headOn': '🚌 ON THE BUS', 'tram.btnWait': 'Wait for the tram', 'tram.btnCancel': 'Never mind', 'tram.btnBoard': 'Get on', 'tram.btnOff': 'Get off at the next stop', 'tram.btnStay': 'Stay on after all', 'tram.btnGetOff': 'Get off', 'tram.askOff': 'Get off at {name}?', 'tram.btnYes': 'Yes, get off', 'tram.stopping': '🔔 You get off at the next stop', 'tram.lookKey': '<kbd>←</kbd><kbd>→</kbd> look around', 'bus.btnBoard': 'Get on',
    'bus.label': 'Bus', 'bus.line': 'Line {ref}', 'bus.ask': 'Get on the bus?', 'bus.stopping': '🔔 The bus stops at the next stop', 'bus.on': '🚌 All aboard! Enjoy the view out of the window', 'bus.off': '🚌 Off the bus', 'bus.offAt': '🚌 Off at {name}', 'bus.end': '🚌 End of the line! Everybody off',
    'hint.full': '<kbd>{fire}</kbd> use item · <kbd>{jump}</kbd> jump · hold <kbd>{back}</kbd> to throw back',
    'hint.jump': '<kbd>{jump}</kbd> jump',
    'tb.item': 'item', 'tb.jump': 'jump', 'tb.up': 'up', 'tb.down': 'down', 'hint.heli': '<kbd>{jump}</kbd> up · <kbd>{fire}</kbd> down', 'tb.steer': '◀ drag to steer ▶', 'tb.ride': '✥ drag to ride',
    mute: '🔇 sound off (M)',
    'level.easy': 'Easy', 'level.medium': 'Medium', 'level.long': 'Long', 'level.tricky': 'Tricky',
    'mount.horse': '🐎 Horse', 'mount.cow': '🐄 Cow', 'mount.tiger': '🐅 Tiger', 'mount.pig': '🐖 Pig', 'mount.unicorn': '🦄 Unicorn', 'mount.foot': '🏃 On foot', 'mount.heli': '🚁 Helicopter', 'mount.bike': '🚲 Bike',
    'kind.mission': '🎯 Missions', 'start.keysQuest': 'Press SPACE or ENTER for your mission', 'start.tapQuest': 'Tap for your mission',
    'mission.free': 'Free Roam', 'mission.freeTime': 'no time limit',
    'kind.tour': '🎥 Tour', 'start.keysTour': 'Press SPACE or ENTER for the tour', 'start.tapTour': 'Tap for the tour',
    'tour.auto': 'Autoplay', 'tour.autoSub': 'sit back and watch', 'tour.fly': 'Fly', 'tour.flySub': 'fly the dragon through the hoops yourself', 'tour.flyWelcome': 'Fly the dragon', 'tour.flyHint': 'Fly through the yellow hoops along the route. Arrows or WASD to fly, Space to climb, E or Shift to dive.', 'tour.flyHintTouch': 'Fly through the yellow hoops along the route. The stick to fly, ⤒ to climb and ⤓ to dive.', 'tour.flyEnd': 'That was the last hoop!', 'tour.flyEndText': 'You flew through {hits} of the {total} hoops, in {time}.', 'tour.flyNext': '{m} m to go', 'tour.trailer': 'Trailer', 'tour.trailerSub': 'the game in one minute',
    'tour.welcome': 'This is {city}', 'tour.welcomeSub': 'Known for its rich history, its stunning historic centre and lively traditions like the Light Festival, the Christmas market and the Gentse Feesten, and much more. Enjoy!', 'tour.label': 'Tour', 'tour.music': 'Music', 'tour.next': 'Go on ▶', 'tour.more': 'Read more ↗', 'tour.again': '↺ Again', 'tour.end': 'End of the tour', 'tour.endText': 'You are back where you set off, by St Michael’s Bridge. Fancy riding around yourself? Pick Missions in the menu.',
    'quest.go': '▶ START', 'quest.time': '⏱ You have {time}', 'quest.foot': 'SPACE / ENTER starts · Esc menu', 'quest.footTap': 'Tap START',
    'quest.inTime': 'Done in {time}.', 'quest.late': 'TOO LATE!', 'quest.puked': 'BLEEEH! 🤮', 'quest.retch': '🤢 WATCH OUT, THEY’RE GOING TO BE SICK!', 'quest.ran': 'BUMP! 🏃', 'quest.tequila': 'throw tequila shot', 'quest.tequilaHit': 'Sleep tight!', 'hint.tequila': '<kbd>{jump}</kbd> throw tequila shot', 'hint.paint': '<kbd>{fire}</kbd> shoot · <kbd>{jump}</kbd> jump / borrow a car', 'hint.bus': '<kbd>{jump}</kbd> jump / take the bus', 'quest.fries': 'throw fries', 'quest.friesShort': 'fries', 'quest.charging': 'charging', 'quest.friesHit': '🍟 Enjoy!',
    pad: '🎮 Gamepad {n} controls player {n}',
  },
  nl: {
    'audio.gameMusicHint': 'Tijdens missies en races', 'audio.paintball': 'Bolletjesgeweer', 'menu.gunMode': 'Auto+paintball-modus', 'gun.shoot': 'Je hebt een paintballgeweer, te voet, op de fiets of op je dier: schiet met de 🔫-knop. Wie geraakt wordt, zit onder de blauwe verf en valt om.', 'gun.borrow': 'Sta je bij een auto of bus? Tik op 🚗 leen om ermee te rijden, en nog eens om uit te stappen.', 'gun.where': 'Het werkt in elke missie. Waar je anders tequilashots gooit, schiet je nu verf.', 'gun.ok': 'Oké!', 'tb.shoot': 'schiet', 'car.steal': 'leen', 'car.he': 'He!', 'car.exit': 'uitstappen', 'bus.driver': 'Chauffeur', 'bus.getIn': '🚌 Stap in de bus!', 'bus.next': '🚌 Volgende halte: {stop}', 'deliver.next': '🍫 Volgende levering: {stop}', 'bus.toilet': '🚽 “Ik moet dringend naar ’t toilet! Rij jij even verder?”', 'audio.unlockGun': 'Auto+paintball-modus tonen', 'audio.paintballHint': 'Het 🚗🔫-vinkje in het hoofdmenu: verfgeweer en auto’s lenen overal, niet enkel in Paintball Gevecht', 'quest.paintHit': 'Geraakt!',
    'audio.title': 'Muziekinstellingen', 'audio.back': '← Terug', 'audio.effects': 'Geluidseffecten', 'audio.music': 'Achtergrondmuziek', 'audio.hold': 'Houd 2 seconden ingedrukt voor muziekinstellingen',
    tag: 'Exploreer Gent te fiets, te voet of te paard!',
    'row.track': 'Baan', 'laps1': '1 ronde', 'lapsN': '{n} rondes',
    players1: '1 speler', playersN: '{n} spelers',
    'weapons.on': '🐰 Met wapens', 'weapons.off': '🏇 Alleen racen',
    'time.day': '☀️ Dag', 'time.night': '🌙 Nacht', 'wx.clear': '🌤️ Droog', 'wx.rain': '🌧️ Regen', 'wx.snow': '❄️ Sneeuw', 'sky.auto': '🔄 Weer: automatisch',
    'style.fun': 'Speels', 'style.pro': 'Professioneel', 'sound.on': '🔊 Geluid aan', 'sound.off': '🔇 Geluid uit', 'cards.on': '👁️ Infokaartjes aan', 'cards.off': '👁️ Infokaartjes uit',
    player: 'Speler {n}', solo: 'Speler', computer: 'Computer {n}',
    'key.jump': 'springen', 'key.item': 'item',
    rename: 'Typ je naam', color: 'Kleur',
    'start.go': 'Start spel', 'start.keys': 'Druk op SPATIE of ENTER om te racen', 'start.tap': 'Tik om te racen',
    paused: 'Pauze', 'pause.map': '🗺️ Kaart', 'pause.share': 'Delen…', 'pause.settings': 'Instellingen…', 'pause.copied': '✓ Link naar je huidige plek gekopieerd!', 'pause.copiedTour': '✓ Link naar de tour gekopieerd!', resume: 'Verder', restart: '↺ Opnieuw', backToMenu: 'Startmenu', 'site.back': '← Terug naar de website', 'site.chip': '🌐 Website', 'made.by': 'Gemaakt met ❤️ door', 'legal.privacy': 'Privacy', 'legal.terms': 'Voorwaarden', menu: '⌂ Menu',
    'bigmap.questHint': 'Je doelen staan op de kaart', 'bigmap.hint': 'Klik op een plek om ernaartoe te teleporteren', 'bigmap.ask': 'Hierheen teleporteren?', 'bigmap.askTo': 'Naar {name} teleporteren?', 'bigmap.blocked': 'Daar kan je niet staan', 'bigmap.yes': '✨ Ja!', 'bigmap.no': 'Annuleren', 'bigmap.close': '✕ Verder rijden', 'bigmap.zoomIn': 'Inzoomen', 'bigmap.zoomOut': 'Uitzoomen', 'bigmap.tabMap': '🗺️ Kaart', 'bigmap.tabIndex': '📍 Plekkenindex', 'bigmap.search': 'Zoek een plek of straat…', 'bigmap.none': 'Niets gevonden', 'bigmap.places': 'Plekken', 'bigmap.sights': 'Bezienswaardigheden', 'bigmap.streets': 'Straten', 'bigmap.indexHint': 'Klik op een plek om ze op de kaart te zien en ernaartoe te teleporteren', 'bigmap.sideHint': 'Wijs een plek aan in de lijst om ze op de kaart te zien, klik om ernaartoe te teleporteren', 'bigmap.k.museum': 'Musea', 'bigmap.k.culture': 'Theater, muziek en film', 'bigmap.k.restaurant': 'Restaurants', 'bigmap.k.cafe': 'Cafés', 'bigmap.k.market': 'Markten', 'bigmap.k.park': 'Parken en buurten', 'bigmap.k.church': 'Kerken', 'bigmap.k.school': 'Scholen en universiteit', 'bigmap.k.library': 'Bibliotheek', 'bigmap.k.hospital': 'Ziekenhuizen',
    results: 'Uitslag', again: 'Nog een keer', 'results.foot': 'SPATIE / ENTER nog een keer · T menu',
    'win.solo': '🏆 Jij wint de derby!', 'win.player': '🏆 {rider} wint de derby!',
    'win.ai': '🐎 {name} wint! De konijnen willen een revanche.',
    'solo.place': 'Je werd {place} op {track}.', duel: '{a} versloeg {b} deze keer.',
    lap: 'RONDE', toGo: 'NOG', wrongWay: 'VERKEERDE KANT!', 'incoming.bunny': '🐰 KONIJN KOMT ERAAN!', 'incoming.cloud': '🌧️ WOLK KOMT ERAAN!',
    finish: 'FINISH!', go: 'GO!', banner: 'FINISH', bannerStart: 'START',
    'msg.lap': 'RONDE {n}', 'msg.final': 'LAATSTE RONDE!', 'msg.bonk': 'BOEM! 🐰', 'msg.hit': 'Raak: {name}!',
    'msg.ouch': 'AU! 🦔', 'msg.trap': '{name} vond je egel!', 'msg.soaked': 'KLETSNAT! 🌧️', 'msg.rained': 'Regen op {name}!',
    'kind.race': '🏁 Race', 'roam.hud': '🗺️ exploreer', 'sight.more': 'Lees meer ↗', 'sight.enter': '🚪 Ga binnen', 'sight.close': 'Sluiten', 'start.keysRoam': 'Druk op SPATIE of ENTER om te gaan rijden', 'start.tapRoam': 'Tik om te gaan rijden', 'msg.bike': 'PAS OP, FIETSER! 🚲', 'msg.rails': 'AU! Vast in de tramsporen', 'msg.carKey': 'BOEM! Spring op de auto’s met {key}', 'msg.carTap': 'BOEM! Tik op SPRING voor de auto’s', 'msg.oofKey': 'OEF! Spring met {key}', 'msg.oofTap': 'OEF! Tik op SPRING', 'msg.splash': 'PLONS! 💦',
    'door.in': 'Ga binnen', 'door.out': 'Terug naar buiten', 'door.tap': 'Tik', 'bigmap.inside': 'Binnen',
    'tram.stop': 'Tramhalte', 'tram.coming': 'Je tram komt eraan', 'tram.next': 'Volgende halte: {name}', 'tram.off': '🚋 Uitgestapt: {name}', 'tram.end': '🚋 Eindhalte! Iedereen uitstappen', 'tram.on': '🚋 Instappen! Geniet van het uitzicht', 'tram.label': 'Tram', 'tram.board': 'Instappen in tram {ref} richting {to}?', 'tram.sit': '💺 Ga binnen zitten', 'tram.stand': '👀 Uitzicht van buiten',
    'tram.head': '🚋 TRAM', 'tram.headOn': '🚋 OP DE TRAM', 'bus.head': '🚌 BUS', 'bus.headOn': '🚌 OP DE BUS', 'tram.btnWait': 'Wacht op de tram', 'tram.btnCancel': 'Toch niet', 'tram.btnBoard': 'Instappen', 'tram.btnOff': 'Afstappen bij de volgende halte', 'tram.btnStay': 'Toch blijven zitten', 'tram.btnGetOff': 'Afstappen', 'tram.askOff': 'Afstappen aan {name}?', 'tram.btnYes': 'Ja, afstappen', 'tram.stopping': '🔔 Je stapt af bij de volgende halte', 'tram.lookKey': '<kbd>←</kbd><kbd>→</kbd> rondkijken', 'bus.btnBoard': 'Instappen',
    'bus.label': 'Bus', 'bus.line': 'Lijn {ref}', 'bus.ask': 'Instappen in de bus?', 'bus.stopping': '🔔 De bus stopt aan de volgende halte', 'bus.on': '🚌 Ingestapt! Kijk maar naar buiten', 'bus.off': '🚌 Uitgestapt', 'bus.offAt': '🚌 Uitgestapt: {name}', 'bus.end': '🚌 Eindhalte! Iedereen uitstappen',
    'hint.full': '<kbd>{fire}</kbd> item · <kbd>{jump}</kbd> springen · houd <kbd>{back}</kbd> in om naar achteren te gooien',
    'hint.jump': '<kbd>{jump}</kbd> springen',
    'tb.item': 'item', 'tb.jump': 'spring', 'tb.up': 'omhoog', 'tb.down': 'omlaag', 'hint.heli': '<kbd>{jump}</kbd> omhoog · <kbd>{fire}</kbd> omlaag', 'tb.steer': '◀ sleep om te sturen ▶', 'tb.ride': '✥ sleep om te rijden',
    mute: '🔇 geluid uit (M)',
    'level.easy': 'Makkelijk', 'level.medium': 'Gemiddeld', 'level.long': 'Lang', 'level.tricky': 'Pittig',
    'mount.horse': '🐎 Paard', 'mount.cow': '🐄 Koe', 'mount.tiger': '🐅 Tijger', 'mount.pig': '🐖 Varken', 'mount.unicorn': '🦄 Eenhoorn', 'mount.foot': '🏃 Te voet', 'mount.heli': '🚁 Helikopter', 'mount.bike': '🚲 Fiets',
    'kind.mission': '🎯 Missies', 'start.keysQuest': 'Druk op SPATIE of ENTER voor je missie', 'start.tapQuest': 'Tik voor je missie',
    'mission.free': 'Vrij Verkennen', 'mission.freeTime': 'geen tijdslimiet',
    'kind.tour': '🎥 Tour', 'start.keysTour': 'Druk op SPATIE of ENTER voor de tour', 'start.tapTour': 'Tik voor de tour',
    'tour.auto': 'Automatisch', 'tour.autoSub': 'leun achterover en kijk', 'tour.fly': 'Vliegen', 'tour.flySub': 'vlieg zelf met de draak door de hoepels', 'tour.flyWelcome': 'Vlieg met de draak', 'tour.flyHint': 'Vlieg door de gele hoepels langs de route. Pijltjes of WASD om te vliegen, spatie omhoog, E of shift omlaag.', 'tour.flyHintTouch': 'Vlieg door de gele hoepels langs de route. De stick om te vliegen, ⤒ omhoog en ⤓ omlaag.', 'tour.flyEnd': 'Alle hoepels gehad!', 'tour.flyEndText': 'Je vloog door {hits} van de {total} hoepels, in {time}.', 'tour.flyNext': 'nog {m} m', 'tour.trailer': 'Trailer', 'tour.trailerSub': 'het spel in één minuut',
    'tour.welcome': 'Dit is {city}', 'tour.welcomeSub': 'Bekend om zijn rijke geschiedenis, het schitterende historische centrum en levendige tradities als het Lichtfestival, de Kerstmarkt en de Gentse Feesten, en nog veel meer. Enjoy!', 'tour.label': 'Tour', 'tour.music': 'Muziek', 'tour.next': 'Verder ▶', 'tour.more': 'Lees meer ↗', 'tour.again': '↺ Nog eens', 'tour.end': 'Einde van de tour', 'tour.endText': 'Je bent terug waar je vertrok, op de Sint-Michielshelling. Zin om zelf rond te rijden? Kies Missies in het menu.',
    'quest.go': '▶ START', 'quest.time': '⏱ Je hebt {time}', 'quest.foot': 'SPATIE / ENTER start · Esc menu', 'quest.footTap': 'Tik op START',
    'quest.inTime': 'Gelukt in {time}.', 'quest.late': 'TE LAAT!', 'quest.puked': 'BLEEEH! 🤮', 'quest.retch': '🤢 PAS OP, HIJ GAAT KOTSEN!', 'quest.ran': 'BOTS! 🏃', 'quest.tequila': 'gooi tequilashot', 'quest.tequilaHit': 'Slaapwel!', 'hint.tequila': '<kbd>{jump}</kbd> gooi tequilashot', 'hint.paint': '<kbd>{fire}</kbd> schieten · <kbd>{jump}</kbd> springen / auto lenen', 'hint.bus': '<kbd>{jump}</kbd> springen / bus nemen', 'quest.fries': 'gooi julientje', 'quest.friesShort': 'julientje', 'quest.charging': 'opladen', 'quest.friesHit': '🍟 Smakelijk!',
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
  // the city's name (the game's without "Instant"), under "Instant Cities", when the city has its own
  if (WORDS) {
    root.querySelectorAll('.title .cityname').forEach(el => { el.textContent = t('title').replace(/^Instant /, ''); });
    document.title = t('title');
  }
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
}
