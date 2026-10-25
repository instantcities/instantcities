# Instant Cities for iOS

The game as a native iOS app, made with [Capacitor](https://capacitorjs.com), the same way as the
Instant Gent app. The app is the website's game in a WKWebView, with every city inside the app, so
it plays without a network from its first start. It opens on a page to pick a city; the game's
links back to the website lead there instead.

```
cd app
npm install
npm run ios        # build www/, sync it into ios/, open Xcode
```

Then pick a simulator or a phone in Xcode and press Run. To play on a real iPhone, Xcode needs a
team under Signing & Capabilities (a free Apple ID works for your own phone; the App Store needs a
paid Apple Developer account).

`npm run build` (`build.mjs`) makes `www/` from the game, laid out as the website is so the game's
own paths work unchanged: every city's code in `<city>/`, its game page in `<city>/play/` (made from
`core/game.html` as `tools/pages.mjs` does, so it never lags behind the template), `core/`'s code,
stylesheet and sounds, the paintings from `assets/img/art/`, Three.js from npm and the fonts from
`@fontsource`, with the city picker (from `_data/cities.yml`) at the root. It leaves out the offline
worker and the links to the website. The build stops if the page no longer looks the way it expects.

`www/` and the copy of it in `ios/App/App/public/` are not checked in; `ios/` itself is.
