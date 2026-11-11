# Instant Cities: App Store texts

Every text App Store Connect asks for, in the order its pages ask for it, ready to copy. Open the
app at App Store Connect → Apps → Instant Cities
(<https://appstoreconnect.apple.com/apps/6826871341/distribution>). Each text sits in its own block,
so the block's copy button takes exactly that field. English (U.K.) and Dutch: add Dutch with the language menu at the top right of the page, then fill
the same fields again. Character counts are in brackets.
How a new build goes up is in `../README.md`.

## 1. TestFlight

TestFlight → **Test Information** (left column, under Additional).

**Beta App Description**

```text
Instant Cities is a 3D game set in 28 real cities. Pick a city, then ride, race or take the tour through its streets.
```

**Feedback Email**: Wouter's own address.

**What to Test** (per build, on the build's page)

```text
First build. Try a few cities: does each one load, and does the Cities button bring you back to the list?
```

## 2. App Information

| Field | EN | NL |
| --- | --- | --- |
| Name (14/30) | `Instant Cities` | `Instant Cities` |
| Subtitle | `Ride through cities in 3D` (25/30) | `Fiets door steden in 3D` (23/30) |
| Privacy Policy URL | `https://instantcities.net/privacy/` | same |

| Field | Value |
| --- | --- |
| Category | Games |
| Subcategories | Adventure, Racing |
| Content Rights | "Yes, it contains, shows or accesses third-party content", and "Yes, I have the necessary rights" (OpenStreetMap data under the ODbL, credited in the game and in the description) |
| Age Rating | Every question "None", except **Cartoon or Fantasy Violence: Infrequent/Mild** (riders spin and fall over, the paintball mission). Expect 9+. |

## 3. Version page

### Screenshots

Upload the JPEGs in `framed/<lang>/<device>/` (a gradient, a line on top, the game below), in numbered order.
The raw game pictures are in `screenshots/`. Make them again with `node tools/storeshots.mjs`
(the game in a headless browser, about 25 minutes), then `python3 tools/storeframes.py` (the
frames, and the lines on top).

| Tab in App Store Connect | Folder | Size |
| --- | --- | --- |
| iPhone with Dynamic Island (medium display) | `iphone/` | 1206 × 2622 |
| iPad 13" display | `ipad/` | 2064 × 2752 |

The other iPhone sizes are scaled from these. Upload the `en/` set under English (U.K.) and the
`nl/` set under Dutch.

### Promotional Text

EN (89/170)

```text
28 cities in 3D, from Paris and New York to Ghent and Delft. Free, no ads, works offline.
```

NL (97/170)

```text
28 steden in 3D, van Parijs en New York tot Gent en Delft. Gratis, zonder reclame, werkt offline.
```

### Description

EN

```text
Ride a bike, walk or gallop through the real streets of 28 cities in 3D. The streets, the water and the buildings come from OpenStreetMap. The best-known landmarks are modelled by hand.

The cities: Paris, Rome, London, New York, Venice, Barcelona, Istanbul, Amsterdam, San Francisco, Florence, Prague, Vienna, Berlin, Madrid, Copenhagen, Brussels, Bruges, Antwerp, Avignon, Salerno, Pompeii, Siena, Pisa, Utrecht, Rotterdam, Delft, Lecce and Ghent.

In each city you can:
• ride around for as long as you like
• race along a route through the centre
• take the tour: it flies past the sights and tells you about each one
• play short missions against the clock

The app is free, has no ads and no account, and collects no data. Every city is inside the app, so it also works without internet. The game speaks English, Dutch, French, German, Spanish and Italian.

Map data © OpenStreetMap contributors.
```

NL

```text
Fiets, wandel of galoppeer door de echte straten van 28 steden in 3D. De straten, het water en de gebouwen komen uit OpenStreetMap. De bekendste monumenten zijn met de hand gemaakt.

De steden: Parijs, Rome, Londen, New York, Venetië, Barcelona, Istanbul, Amsterdam, San Francisco, Florence, Praag, Wenen, Berlijn, Madrid, Kopenhagen, Brussel, Brugge, Antwerpen, Avignon, Salerno, Pompeï, Siena, Pisa, Utrecht, Rotterdam, Delft, Lecce en Gent.

In elke stad kun je:
• vrij rondrijden, zo lang je wilt
• een race rijden door het centrum
• de rondleiding volgen: die vliegt langs de bezienswaardigheden en vertelt over elk ervan
• korte missies spelen tegen de klok

De app is gratis, zonder reclame en zonder account, en verzamelt geen gegevens. Alle steden zitten in de app, dus hij werkt ook zonder internet. Het spel spreekt Nederlands, Engels, Frans, Duits, Spaans en Italiaans.

Kaartgegevens © OpenStreetMap-bijdragers.
```

### Keywords

EN (99/100)

```text
3d,city,bike,cycling,horse,race,europe,travel,explore,tour,paris,rome,london,new york,openstreetmap
```

NL (93/100)

```text
3d,stad,steden,fiets,paard,race,europa,reizen,ontdekken,rondleiding,parijs,gent,openstreetmap
```

### URLs and copyright

| Field | EN | NL |
| --- | --- | --- |
| Support URL | `https://instantcities.net/` | `https://instantcities.net/nl/` |
| Marketing URL | `https://instantcities.net/` | `https://instantcities.net/nl/` |
| Copyright | `2026 Wouter Smet` | same |

## 4. App Privacy

**Data Collection** → Get Started → "No, we do not collect data from this app". The app has no
analytics, no account and no network use; its settings stay on the device. Export compliance
needs no answer: the build says it uses no non-exempt encryption.

## 5. Pricing and Availability

- Price: **Free** (USD 0.00).
- Availability: all countries and regions.

## 6. App Review Information

- Sign-in required: **no**.
- Contact: Wouter's name, phone and e-mail (only Apple's reviewers see them).

**Notes** (English only; Apple's reviewers read these)

```text
Instant Cities is a free 3D game set in 28 real cities. No account or sign-in is needed, and the app works fully offline: every city is inside the app.

To play: pick a city from the list, wait for it to load, then tap "Start" in the menu. Drag on the screen to steer. The tabs in the menu switch between missions, a race and the tour, which flies through the city on its own. The "Cities" button in the menu goes back to the list.

The cities are built from OpenStreetMap data (© OpenStreetMap contributors, ODbL).
```
