// The quests in Lecce: a short mission somewhere in the city, against the clock (the rules for each
// kind are in js/quests.js). Positions are game metres on this city's map, as [x, z]; the big map in
// the game shows them when you ride about freely.
//   thief:   catch someone who runs off along the streets (from `thief`, if given); `loot` is what
//            they carry ('painting' by default, or 'statue')
//   reach:   get to `goal` within `radius` in time (`stand`: where you start, if not on the street
//            nearest `start`; `runners`: a stream of them along the streets through `route`, `per`
//            runner a metre, that you may not run into)
//   collect: pick up `count` things lying about without being caught; `item` is 'cap' by default or
//            'pasticciotto', `look` the crowd of 'students' by default or 'pizzica' dancers
//   rescue:  fly the police helicopter (`heli`) from `pad` to each of `victims` ([x, z, name]) in
//            turn, fly through `radius` of each, not too high, to pick them up, then land
//            with them all at `drop` ([x, z, name]); `legs` in the text: the HUD on the way to each
// text: the words for each language. title and where on the menu card, story before the start, hud
// while playing, done the moment it is won, then win or lose (losePuke: lost by being caught by a
// dancer, loseRun: by running into a runner).
export const QUESTS = [
  {
    id: 'statue', emoji: '🗿', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [431, 126], thief: [322, 115],
    text: {
      nl: {
        title: 'Sant’Oronzo is gestolen!',
        where: 'Start op de Piazza Sant’Oronzo. Vang de dief met het standbeeld.',
        story: 'Oh nee, iemand is ervandoor met het papier-maché standbeeld van Sant’Oronzo, dat morgen in de stoet van het feest moest! Daar loopt de dief, met de heilige boven het hoofd. Vang hem voor hij ontsnapt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🗿',
        win: '🗿 Sant’Oronzo is terug, net op tijd voor het feest!',
        lose: '🦹 De dief is ontsnapt. Sant’Oronzo is zoek…',
      },
      en: {
        title: 'Sant’Oronzo is stolen!',
        where: 'Start on Piazza Sant’Oronzo. Catch the thief with the statue.',
        story: 'Oh no, somebody ran off with the papier-mâché statue of Sant’Oronzo, which was meant for the feast procession tomorrow! There goes the thief, with the saint held high. Catch them before they get away.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🗿',
        win: '🗿 Sant’Oronzo is back, just in time for the feast!',
        lose: '🦹 The thief got away. Sant’Oronzo is missing…',
      },
      fr: {
        title: 'Sant’Oronzo a été volé !',
        where: 'Départ sur la Piazza Sant’Oronzo. Attrape le voleur avec la statue.',
        story: 'Oh non, quelqu’un s’est enfui avec la statue en papier mâché de Sant’Oronzo, prévue pour la procession de la fête de demain ! Voilà le voleur qui file, le saint au-dessus de la tête. Attrape-le avant qu’il s’échappe.',
        hud: '🦹 Attrape le voleur !',
        done: 'ATTRAPÉ ! 🗿',
        win: '🗿 Sant’Oronzo est de retour, juste à temps pour la fête !',
        lose: '🦹 Le voleur s’est échappé. Sant’Oronzo a disparu…',
      },
      es: {
        title: '¡Robaron a Sant’Oronzo!',
        where: 'Empiezas en la Piazza Sant’Oronzo. Atrapa al ladrón de la estatua.',
        story: '¡Oh no, alguien ha huido con la estatua de cartapesta de Sant’Oronzo, que tenía que salir mañana en la procesión de la fiesta! Ahí va el ladrón, con el santo en alto. Atrápalo antes de que escape.',
        hud: '🦹 ¡Atrapa al ladrón!',
        done: '¡ATRAPADO! 🗿',
        win: '🗿 ¡Sant’Oronzo ha vuelto, justo a tiempo para la fiesta!',
        lose: '🦹 El ladrón escapó. Sant’Oronzo ha desaparecido…',
      },
    },
  },
  {
    id: 'train', emoji: '🚆', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 150, start: [-14.5, -366.6], goal: [-254, 1094], radius: 22,
    text: {
      nl: {
        title: 'De laatste trein naar Bari',
        where: 'Start aan de Porta Napoli. Ren naar het station van Lecce.',
        story: 'Oeps, je hebt je pasticciotto te lang laten smaken! Laatste Trein naar Bari vertrekt zo meteen in het station van Lecce, en jij staat nog aan de Porta Napoli, aan de andere kant van het centrum. Zo snel als je kan!',
        hud: '🚆 Naar het station!',
        done: 'GEHAALD! 🚆',
        win: '🚆 Gehaald! Op naar Bari.',
        lose: '🚆 De laatste trein is vertrokken zonder jou.',
      },
      en: {
        title: 'The last train to Bari',
        where: 'Start at Porta Napoli. Run to Lecce station.',
        story: 'Oops, you lingered too long over your pasticciotto! Last Train to Bari leaves Lecce station any minute now, and you are still at Porta Napoli, on the other side of the old town. As fast as you can!',
        hud: '🚆 To the station!',
        done: 'MADE IT! 🚆',
        win: '🚆 Made it! Off to Bari.',
        lose: '🚆 The last train left without you.',
      },
      fr: {
        title: 'Le dernier train pour Bari',
        where: 'Départ à la Porta Napoli. Cours jusqu’à la gare de Lecce.',
        story: 'Oups, tu as trop traîné devant ton pasticciotto ! Dernier Train pour Bari part de la gare de Lecce dans un instant, et tu es encore à la Porta Napoli, de l’autre côté du centre historique. Le plus vite possible !',
        hud: '🚆 À la gare !',
        done: 'RÉUSSI ! 🚆',
        win: '🚆 Réussi ! En route pour Bari.',
        lose: '🚆 Le dernier train est parti sans toi.',
      },
      es: {
        title: 'El último tren a Bari',
        where: 'Empiezas en la Porta Napoli. Corre a la estación de Lecce.',
        story: '¡Uy, te entretuviste demasiado con tu pasticciotto! Último Tren a Bari sale de la estación de Lecce en un momento, y tú sigues en la Porta Napoli, al otro lado del casco antiguo. ¡Lo más rápido que puedas!',
        hud: '🚆 ¡A la estación!',
        done: '¡LO LOGRASTE! 🚆',
        win: '🚆 ¡Lo lograste! Rumbo a Bari.',
        lose: '🚆 El último tren se fue sin ti.',
      },
    },
  },
  {
    id: 'pizzica', emoji: '🥮', player: { mount: 'foot', pick: 'spekkie' }, icon: '🥮', kind: 'collect', item: 'pasticciotto', look: 'pizzica', time: 180, start: [30, 262], count: 10, zombies: 30, crowd: { street: 'Via Giuseppe Libertini', every: 6, clear: 18 },
    text: {
      nl: {
        title: 'Pizzica in de straten',
        where: 'Start bij de Duomo. Zoek 10 pasticciotti zonder dat een danser je meesleept in de pizzica.',
        story: 'Het is La Notte della Taranta: de dansers zijn van het podium de oude stad in gedanst! In hun witte jurken met rode sjerp draaien ze rond over de Via Libertini en rond de Duomo, en wie dichtbij komt, wordt meegesleept. Zoek de 10 verloren pasticciotti, zonder dat één danser je te pakken krijgt!',
        hud: '🥮 Zoek de pasticciotti!',
        done: 'ALLE PASTICCIOTTI! 🥮',
        win: '🥮 Alle 10 pasticciotti gevonden, en niemand heeft je meegesleept!',
        lose: '🥮 De tijd is om, er liggen nog pasticciotti.',
        losePuke: '💃 Gepakt! Een danser sleepte je mee in de pizzica.',
      },
      en: {
        title: 'Pizzica in the streets',
        where: 'Start at the Duomo. Find 10 pasticciotti without a dancer pulling you into the pizzica.',
        story: 'It’s La Notte della Taranta: the dancers have spun off the stage and into the old town! In their white dresses and red sashes they twirl along Via Libertini and round the Duomo, and anyone who comes close gets swept along. Find the 10 lost pasticciotti without a single dancer catching you!',
        hud: '🥮 Find the pasticciotti!',
        done: 'ALL THE PASTICCIOTTI! 🥮',
        win: '🥮 All 10 pasticciotti found, and nobody swept you off!',
        lose: '🥮 Time’s up, there are pasticciotti left.',
        losePuke: '💃 Caught! A dancer swept you into the pizzica.',
      },
      fr: {
        title: 'Pizzica dans les rues',
        where: 'Départ au Duomo. Trouve 10 pasticciotti sans qu’un danseur t’entraîne dans la pizzica.',
        story: 'C’est La Notte della Taranta : les danseurs ont quitté la scène pour envahir la vieille ville ! En robe blanche et ceinture rouge, ils tourbillonnent dans la Via Libertini et autour du Duomo, et celui qui s’approche est emporté. Trouve les 10 pasticciotti perdus sans qu’un seul danseur t’attrape !',
        hud: '🥮 Trouve les pasticciotti !',
        done: 'TOUS LES PASTICCIOTTI ! 🥮',
        win: '🥮 Les 10 pasticciotti trouvés, et personne ne t’a emporté !',
        lose: '🥮 Le temps est écoulé, il reste des pasticciotti.',
        losePuke: '💃 Attrapé ! Un danseur t’a entraîné dans la pizzica.',
      },
      es: {
        title: 'Pizzica en las calles',
        where: 'Empiezas en el Duomo. Encuentra 10 pasticciotti sin que un bailarín te arrastre a la pizzica.',
        story: '¡Es La Notte della Taranta: los bailarines han bajado del escenario y se han metido en el casco antiguo! Con sus vestidos blancos y fajines rojos giran por la Via Libertini y alrededor del Duomo, y quien se acerca se ve arrastrado. ¡Encuentra los 10 pasticciotti perdidos sin que ningún bailarín te atrape!',
        hud: '🥮 ¡Busca los pasticciotti!',
        done: '¡TODOS LOS PASTICCIOTTI! 🥮',
        win: '🥮 ¡Los 10 pasticciotti encontrados, y nadie te arrastró!',
        lose: '🥮 Se acabó el tiempo, quedan pasticciotti.',
        losePuke: '💃 ¡Atrapado! Un bailarín te arrastró a la pizzica.',
      },
    },
  },
  {
    id: 'procession', emoji: '🎺', player: { mount: 'horse', pick: 'hagelslag' }, kind: 'reach', time: 200, start: [482, -118], goal: [-437, 344], radius: 12,
    runners: { route: [[30, 215], [322, 115], [431, 126]], per: 1.2 },
    text: {
      nl: {
        title: 'De stoet van Sant’Oronzo',
        where: 'Start bij Santa Croce. Geraak aan de Porta Rudiae zonder tegen de stoet te botsen.',
        story: 'Het is het feest van Sant’Oronzo, de beschermheilige van Lecce: de stoet trekt van de Duomo door de Via Vittorio Emanuele II tot op de Piazza Sant’Oronzo, met muziek en een hele menigte. En jij moet dringend naar de Porta Rudiae, aan de overkant van het centrum! Dwars door de stoet gaan lukt niet: zoek een weg eromheen. Kijk op de kaart waar ze lopen.',
        hud: '🎺 Naar de Porta Rudiae, rond de stoet!',
        done: 'GEHAALD! 🎺',
        win: '🎺 Aan de Porta Rudiae, zonder de stoet te storen!',
        lose: '🎺 Te laat, de Porta Rudiae is nog ver.',
        loseRun: '💥 Bots! Je liep dwars door de stoet van Sant’Oronzo.',
      },
      en: {
        title: 'The procession of Sant’Oronzo',
        where: 'Start at Santa Croce. Get to Porta Rudiae without running into the procession.',
        story: 'It’s the feast of Sant’Oronzo, the patron saint of Lecce: the procession winds from the Duomo along Via Vittorio Emanuele II to Piazza Sant’Oronzo, with music and a huge crowd. And you urgently need to get to Porta Rudiae, on the far side of the old town! Straight through the procession won’t work: find a way round it. The map shows where it goes.',
        hud: '🎺 To Porta Rudiae, round the procession!',
        done: 'MADE IT! 🎺',
        win: '🎺 At Porta Rudiae, without disturbing the procession!',
        lose: '🎺 Too late, Porta Rudiae is still far away.',
        loseRun: '💥 Bump! You ran straight into the procession of Sant’Oronzo.',
      },
      fr: {
        title: 'La procession de Sant’Oronzo',
        where: 'Départ à Santa Croce. Rejoins la Porta Rudiae sans foncer dans la procession.',
        story: 'C’est la fête de Sant’Oronzo, le saint patron de Lecce : la procession serpente du Duomo par la Via Vittorio Emanuele II jusqu’à la Piazza Sant’Oronzo, avec de la musique et une foule immense. Et toi, tu dois filer à la Porta Rudiae, de l’autre côté du centre ! Passer au travers de la procession, impossible : trouve un chemin pour la contourner. La carte montre où elle passe.',
        hud: '🎺 À la Porta Rudiae, autour de la procession !',
        done: 'RÉUSSI ! 🎺',
        win: '🎺 À la Porta Rudiae, sans déranger la procession !',
        lose: '🎺 Trop tard, la Porta Rudiae est encore loin.',
        loseRun: '💥 Boum ! Tu as foncé dans la procession de Sant’Oronzo.',
      },
      es: {
        title: 'La procesión de Sant’Oronzo',
        where: 'Empiezas en Santa Croce. Llega a la Porta Rudiae sin chocar con la procesión.',
        story: 'Es la fiesta de Sant’Oronzo, el patrón de Lecce: la procesión serpentea desde el Duomo por la Via Vittorio Emanuele II hasta la Piazza Sant’Oronzo, con música y una multitud enorme. ¡Y tú tienes que llegar ya a la Porta Rudiae, al otro lado del casco antiguo! Cruzar la procesión no se puede: busca un camino para rodearla. El mapa muestra por dónde pasa.',
        hud: '🎺 ¡A la Porta Rudiae, rodeando la procesión!',
        done: '¡LO LOGRASTE! 🎺',
        win: '🎺 ¡En la Porta Rudiae, sin molestar a la procesión!',
        lose: '🎺 Demasiado tarde, la Porta Rudiae aún queda lejos.',
        loseRun: '💥 ¡Pum! Te metiste de lleno en la procesión de Sant’Oronzo.',
      },
    },
  },
  {
    id: 'heli', emoji: '🚁', icon: '🚁', player: { mount: 'foot', pick: 'bliksem' }, kind: 'rescue', heli: true, time: 180,
    start: [45, 263], pad: [45, 263], radius: 16,
    victims: [[789, -594, 'Via Quattro Novembre'], [1239, -183, 'Via Imperatore Adriano']], drop: [417, 141, 'Piazza Sant\'Oronzo'],
    text: {
      nl: {
        title: 'Heli\u00adredding',
        where: 'Start aan de Piazza del Duomo. Red twee toeristen en breng ze naar de Piazza Sant’Oronzo.',
        story: 'Alarm! Op de heetste dag van het jaar sprongen twee toeristen in de fonteinen om af te koelen, en nu raken ze er niet meer uit: één in de fontein in de Via Quattro Novembre, de andere in de fontein in de Via Imperatore Adriano! Stijg op, vlieg door de cirkel boven elke toerist, niet te hoog, en de lier haalt hem meteen op; en vlieg ze dan allebei naar de Piazza Sant’Oronzo, waar de ambulance wacht. Land in de lichtzuil. Je hebt 3 minuten!',
        hud: '🚁 Red de toeristen!',
        legs: ['🚁 Naar de Via Quattro Novembre!', '🚁 Naar de Via Imperatore Adriano!', '🚁 Naar de Piazza Sant’Oronzo, en landen!'],
        lower: '⬇ Lager vliegen!',
        done: 'GERED! 🚁',
        win: '🚁 Twee toeristen veilig bij de ambulance. Wat een redding!',
        lose: '🚁 Te laat, de brandweer heeft ze er al uit gevist.',
      },
      en: {
        title: 'Heli rescue',
        where: 'Start at the Piazza del Duomo. Save two tourists and fly them to the Piazza Sant’Oronzo.',
        story: 'Alarm! On the hottest day of the year two tourists jumped into the fountains to cool off, and now they can’t get out: one in the fountain on Via Quattro Novembre, the other in the fountain on Via Imperatore Adriano! Take off, fly through the circle over each tourist, not too high, and the winch has them up at once; then fly both to the Piazza Sant’Oronzo, where the ambulance is waiting. Land in the beam of light. You have 3 minutes!',
        hud: '🚁 Save the tourists!',
        legs: ['🚁 To Via Quattro Novembre!', '🚁 To Via Imperatore Adriano!', '🚁 To the Piazza Sant’Oronzo, and land!'],
        lower: '⬇ Fly lower!',
        done: 'RESCUED! 🚁',
        win: '🚁 Two tourists safe at the ambulance. What a rescue!',
        lose: '🚁 Too late, the fire brigade has fished them out already.',
      },
    },
  },
];
