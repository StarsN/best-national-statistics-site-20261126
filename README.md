# best-national-statistics-site-20261126

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/StarsN/best-national-statistics-site-20261126/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/StarsN/best-national-statistics-site-20261126/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

Atlas — a national statistics explorer for 26 countries: population, GDP, life expectancy, jobs and more, all real World Bank figures with the year on every number. Search and rank countries by any indicator, open a country for ten-year trend charts and a full indicator table, or put up to three countries side by side.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — rankings on the home page, `#/country/USA` for a country, `#/compare` to compare, `#/about` for sources and method.

To hand the site in exactly as the grader runs it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data

Figures come from the World Bank's World Development Indicators (public API, api.worldbank.org), fetched 26 November 2026 and baked into `app/data.js` — the site makes no network requests at run time. Most indicators are 2024; the Gini index runs 2020–2024 and adult literacy 2019–2024, depending on the country. Where a country does not report an indicator, the site shows "—" instead of guessing.

## Layout

- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `app/index.html` — the page shell.
- `app/style.css` — all styling (system fonts, no external assets).
- `app/data.js` — the baked World Bank dataset (26 countries, 11 indicators, 2014–2024 series).
- `app/format.js` — number formatting.
- `app/charts.js` — SVG trend charts.
- `app/views.js` — the rankings, country, compare and about views.
- `app/main.js` — the hash router and control wiring.
- `serve.ts` — a tiny static server for local development.
- `vendor/makefun-frontend.ts` — the kit's dossier builder, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
