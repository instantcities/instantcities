# Quality tour

For the normal workflow, open `/<city>/?shots=60` on `serve.py` in a GPU-backed browser, then run
`node tools/tourshots.mjs <city>`. See `.claude/skills/quality-tour/SKILL.md` for the routine.

For short automated checks, `node tools/qualitytour.mjs ghent --from 0 --to 60 --every 60`
takes flight and street-level views and makes contact sheets in `tools/cache/quality/ghent/`.
Headless WebGL runs on the CPU, so keep checks brief and run only one browser at a time.
The flat score highlights views with little detail; it is a hint, not a verdict.
With `MAPILLARY_TOKEN` set it also fetches a nearby reference photo.
