# Game info-card links

Exploration cards, indoor exhibits and tour cards use `core/js/info-links.js` to find their website destinations. Artwork close-ups keep their artwork-page links. Archaeological-site cards link to the named place's section on `/sites/<site>/`; these places do not have separate articles.

The lookup is generated from `_data/landmarks/` and `_data/site_places/`. It matches ids and names, including explicit aliases for tour titles. Indoor cards use the nearest artwork or the building's page. Secret cards can link too, when a page exists.

After adding or renaming website entries, run:

```
node tools/info-pages.mjs
node tools/info-links-check.mjs
```

To also verify HTTP responses and rendered section anchors against a running Jekyll site:

```
node tools/info-links-check.mjs http://127.0.0.1:4000
```

## Cards still without a matching page

The audit on 27 October 2026 checked 601 exploration, exhibit, tour and artwork cards. 582 have links, to 374 distinct destinations. All destinations returned successful HTTP responses on the local website, including the archaeological-site anchors. An Acropolis browser check confirmed the tour's Read more link is visible.

These 19 cards have no dedicated matching website entry. They keep their links hidden; completing coverage requires adding articles or specific sections about them and registering those destinations. Nearby landmarks are not assumed to be the same subject.

| Map | Cards without a page |
| --- | --- |
| Angkor Wat | The causeway (tour) |
| Copenhagen | Amagertorv (tour) |
| Ghent | Glass Alley; Provincial House (Leopold Barracks); Mad Meg / Dulle Griet (tour) |
| Madrid | Callao (tour) |
| Paris | Châtelet (tour) |
| Pisa | Piazza dei Miracoli; Via Santa Maria (tour) |
| Pompeii | Vesuvius (tour) |
| Prague | Four St Vitus Cathedral exhibits: Six centuries in the building, Mucha’s window, St John of Nepomuk, The St Wenceslas Chapel |
| Rome | Piazza Colonna; Piazza Venezia (tour) |
| Rotterdam | Plein 1940 (tour) |
| San Francisco | Portsmouth Square (tour) |
| Venice | Campo San Bartolomeo (tour) |

Tour welcome/end screens and transport/door action prompts are controls, rather than place information cards, and are not included in this count.
