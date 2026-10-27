# Instant Cities

A browser game set in 3D models of old city centres, built from OpenStreetMap data.

Play it at [instantcities.net](https://instantcities.net).

> Beta: expect rough edges, and saved settings may reset between versions.

## What is it?

You move through real streets and buildings. One player, or two on the same keyboard with a split screen.

- 27 cities. Ghent and Lecce in full; a first piece of Rome, Paris, Amsterdam, Venice,
  Barcelona, London, Bruges, Antwerp, Brussels, Florence, Prague, Vienna, Copenhagen, Berlin and more.
- 7 sites that are not cities: the Taj Mahal, Angkor Wat, Pompeii, Stonehenge, Giza, the Acropolis and Machu Picchu,
  with the monuments modelled by hand.
- **Race** along the streets, pick up items (bunnies, hedgehogs, rain clouds) and watch out for roadworks.
- **Roam freely**, take a **guided tour**, or play short **quests** against the clock.
- **Go inside** famous buildings like the Louvre, Sint-Baafs and the Sistine Chapel.
- **Ride** a bike, a horse, a cow, a tiger, a pig or a unicorn, or just walk.
- Works on phones and tablets too (landscape is best).

Available in English and Dutch.

## Controls

| | Player 1 | Player 2 |
|---|---|---|
| Move | W A S D | Arrow keys |
| Jump | Space | Right Shift |
| Use item | E | Enter |

Gamepads work too. M toggles music, N toggles sound effects, Esc pauses.

## Run it yourself

```bash
python3 serve.py                              # just the games: http://localhost:8321/ghent/play/
bundle install && bundle exec jekyll serve    # the whole site: http://localhost:4000/
```

You need a local server (the game uses ES modules) and an internet connection (Three.js and fonts load from CDNs).

## Want to dig in?

The details (how the maps are built, adding a city, the tools, the project layout) are in the
[developer guide](docs/developer-guide.md). More notes are in [`docs/`](docs/).

## Credits

Forked from [Instant Gent](https://github.com/woutersmet/instant-gent).

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL). Ghent 3D
models: Stad Gent; heights: Digitaal Vlaanderen (Modellicentie Gratis Hergebruik). Police siren:
[Work With Sounds](https://commons.wikimedia.org/wiki/File:WWS_Policecarsiren.ogg) / Konrad Gutkowski, CC BY 4.0.
