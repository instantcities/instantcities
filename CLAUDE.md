# Instant Cities

## Testing in a headless browser

Headless Chrome renders the game's WebGL on the CPU, which makes a laptop run hot. It is fine to
use for checking a change, but keep it light:

- Run one headless browser at a time; close it (`browser.close()`) as soon as the check is done.
- Prefer a short check (a screenshot, reading the DOM) over leaving the game running for minutes.
- Do not start several test scripts in parallel or leave one running in the background.

## Commit messages

- A commit that fixes the map (a street, bridge, path, quay, island or square that lies wrong: too high
  or low, in the wrong place, crossing something it should pass over or under) starts with `mapfix:`,
  e.g. `mapfix: Citadellaan bridge higher, the fietsbrug along the Schelde passes under it`. Keep a map
  fix in a commit of its own, not mixed with game or other changes, so `git log --grep '^mapfix:'`
  lists them all (the older ones, from before this rule, are listed in `docs/mapfixes.md`). A PR that
  is only a map fix gets the same prefix in its title.

## Facadinator pull requests

When a PR colours a street's fronts with `tools/facadinator.mjs`, its description always has the
screenshots of that street in the game (a few views of it, taken with one light headless browser, see
above), under a heading with the street's name and the progress: fronts coloured out of the street's
fronts, and the city total (as `tools/todo.mjs` prints it). Put the images on a separate
`pr<number>-screenshots` branch (kept out of the PR's diff) and link them with `?raw=true`.

## Pull request previews

Every PR gets a preview at `https://instantcities.net/preview/pr-<n>/` (`.github/workflows/preview.yml`,
on the `gh-pages` branch). After pushing to a PR, check that the `PR Preview` run succeeded and give
Wouter the link to the page the change shows on; if the run failed, say so and fix it.
