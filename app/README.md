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
`@fontsource`, with the city picker (from `_data/cities.yml`) at the root. Each city's About page
(`<city>/index.html`) is the website's own page of the city, with its landmarks', places' and art
pages next to it: the build runs Jekyll (`bundle exec jekyll build`, so the site's gems need to be
installed; Homebrew's Ruby 3.3 is used where it is there), keeps their links inside the app, and
gives each landmark's and painting's card a "Visit in 3D" button straight into the game. It leaves out the offline
worker and the links to the website. The build stops if the page no longer looks the way it expects.

`www/` and the copy of it in `ios/App/App/public/` are not checked in; `ios/` itself is.

## A build in TestFlight

The app is `net.instantcities.app` in App Store Connect
(<https://appstoreconnect.apple.com/apps/6826871341/distribution>). Raise `CURRENT_PROJECT_VERSION`
in the Xcode project first (App Store Connect takes each build number once per version; 1.0 (1) is
uploaded). Then, from `app/`:

```
npm run build && npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/InstantCities.xcarchive -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath build/InstantCities.xcarchive \
  -exportOptionsPlist app-store-assets/ExportOptions.plist -exportPath build/export -allowProvisioningUpdates
```

The second command uploads (`ExportOptions.plist` says so). Apple processes the build for 10 to 30
minutes; it then shows in TestFlight.
