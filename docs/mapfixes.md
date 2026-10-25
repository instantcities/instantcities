# Map fixes

Every fix to Ghent's map: a street, bridge, path, quay, island or square that lay wrong (too high or
low, in the wrong place, crossing something it should pass over or under). From 2026-10-19 on, each
one is its own commit starting with `mapfix:` (see CLAUDE.md), so the newest are found with

    git log --grep '^mapfix:'

The ones from before that rule are listed here instead, by hand, newest first. "Mixed" means the
commit also changes other things; the map fix is the part named after the dash.

## Before the `mapfix:` rule

| Commit | Date | Fix | |
|---|---|---|---|
| cb616cd | 2026-10-18 | The Blaarmeersen's wooded island back on dry land (the map had the lake without it) — and buses climb the Sint-Michielsbrug's ramps instead of driving through them | mixed |
| 6717e9d | 2026-10-17 | Graslei: the quay's lower strip along the Leie, a step down from the street to the water | |
| c39f0e2 | 2026-10-15 | Lammerstraat: its bridge by the Zuid lifted, the paths along the water pass under it (#146) | |
| a521bf4 | 2026-10-15 | Walls as high as the front of a house, not its back yard; a check for fronts much lower than their street (#145) | |
| 2f46819 | 2026-10-12 | Fietsbrug at the Leiekaai passes under the Rooigemlaan's bridge (#135) | |
| fc5eb0b | 2026-10-12 | The Muidelaan's high bridge over the Verbindingskanaal (#134) | mixed |
| 0c32cc2 | 2026-10-10 | Ketelbrug stands higher, so the footway along the water passes under it | |
| 26058ec | 2026-10-09 | Oude Beestenmarkt bridge stands higher | mixed |
| 2fddf2b | 2026-10-09 | Voorhoutkaai: the lane along the water lies lower | mixed |
| 4416695 | 2026-10-09 | Dampoort: the Napoleon de Pauwbrug and the Oktrooiplein's bridge stand higher | |
| da63df0 | 2026-10-09 | Papegaaibrug: the fietsbrug along the Coupure goes down under it | |
| 9eddccf | 2026-10-08 | Europabrug as a high arched bridge (#106) | mixed |
| 2d824c3 | 2026-10-08 | Ramps as wide as the Sint-Michielsbrug | mixed |
| 0b42904 | 2026-10-07 | Kastanjestraat: the passage under the houses into the Pierkespark, cut out of the building the map had standing across it | mixed |
| 40fbaf8 | 2026-10-07 | Crossings by a bridge no longer float | |
| 96fc7d5 | 2026-10-07 | The Coupure's waterway line no longer lays the usual water and quay walls over its lower water and grass banks | |
| bc59342 | 2026-10-07 | The Coupure and the Brugse Vaart along the Groendreef lie lower than the other canals, between grass banks | |
| 43533b6 | 2026-10-05 | Bridges lie level with the street by default (#64) | mixed |
| a358440 | 2026-10-04 | Bridge types: Vleeshuisbrug and Grasbrug flat, Sint-Michielsbrug high and grand | |
