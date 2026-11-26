// Views for Atlas: each route renders one HTML string from the baked data.
// Views never fetch: every figure comes from data.js with its year attached.

import { COUNTRIES, INDICATORS, SOURCE_NOTE } from "./data.js";
import { compact, grouped, dollars, bigDollars, formatValue, median } from "./format.js";
import { lineChart } from "./charts.js";

export const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
export const REGIONS = [...new Set(COUNTRIES.map((c) => c.region))].sort();
export const COLORS = ["#0e7c6b", "#e8a317", "#2f6fb2"];

function indicator(key) {
  return INDICATORS.find((i) => i.key === key);
}

function valueOf(country, key) {
  const entry = country.v[key];
  return entry ? entry[1] : null;
}

function yearOf(country, key) {
  const entry = country.v[key];
  return entry ? entry[0] : null;
}

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Home: hero, global strip, search + filters, ranked table. */
export function homeView(state) {
  const metric = indicator(state.metric) || indicator("pop");
  const query = state.query.trim().toLowerCase();
  let rows = COUNTRIES.filter((c) => {
    if (state.region !== "All" && c.region !== state.region) return false;
    if (query && !c.name.toLowerCase().includes(query)) return false;
    return true;
  });
  rows = rows
    .map((c) => ({ c, v: valueOf(c, metric.key) }))
    .filter((r) => r.v !== null)
    .sort((a, b) => (state.asc ? a.v - b.v : b.v - a.v));
  const max = rows.length ? Math.max(...rows.map((r) => r.v)) : 1;

  const totalPop = COUNTRIES.reduce((s, c) => s + (valueOf(c, "pop") || 0), 0);
  const medLife = median(COUNTRIES.map((c) => valueOf(c, "life")).filter((v) => v !== null));
  const medGdpPc = median(COUNTRIES.map((c) => valueOf(c, "gdp_pc")).filter((v) => v !== null));
  const totalGdp = COUNTRIES.reduce((s, c) => s + (valueOf(c, "gdp") || 0), 0);

  const regionOptions = ["All", ...REGIONS]
    .map((r) => `<option value="${esc(r)}"${state.region === r ? " selected" : ""}>${esc(r)}</option>`)
    .join("");
  const metricOptions = INDICATORS.map(
    (i) => `<option value="${i.key}"${metric.key === i.key ? " selected" : ""}>${esc(i.label)}</option>`,
  ).join("");
  const chips = ["pop", "gdp_pc", "life", "unemp"]
    .map((k) => {
      const ind = indicator(k);
      return `<button class="chip" data-metric="${k}" aria-pressed="${metric.key === k}">${esc(ind.label)}</button>`;
    })
    .join("");

  const tableRows = rows
    .map(({ c, v }, i) => {
      const yr = yearOf(c, metric.key);
      return `<tr>
        <td class="rank">${i + 1}</td>
        <td><a class="country-link" href="#/country/${c.code}">${esc(c.name)}</a>
          <div class="muted">${esc(c.region)}</div></td>
        <td class="num"><span class="rankbar"><span class="bar" style="width:${Math.max(1.5, (v / max) * 100).toFixed(1)}%"></span>${formatValue(metric.key, v)}</span></td>
        <td class="num year">${yr || "—"}</td>
      </tr>`;
    })
    .join("");

  return `
  <section class="hero">
    <h1>Every country's numbers, <em>in one place.</em></h1>
    <p>Population, GDP, life expectancy, jobs and more for 26 countries — real World Bank
    figures, each labelled with its year. Search a country, rank by any indicator, or put
    countries side by side.</p>
    <div class="stat-strip">
      <div class="stat"><div class="num">${compact(totalPop)}</div><div class="lbl">people covered (2024)</div></div>
      <div class="stat"><div class="num">${bigDollars(totalGdp)}</div><div class="lbl">combined GDP (2024)</div></div>
      <div class="stat"><div class="num">${medLife.toFixed(1)} yrs</div><div class="lbl">median life expectancy</div></div>
      <div class="stat"><div class="num">${dollars(medGdpPc)}</div><div class="lbl">median GDP per capita</div></div>
    </div>
  </section>
  <div class="controls">
    <input type="search" id="q" placeholder="Search a country…" value="${esc(state.query)}" aria-label="Search countries">
    <select id="region" aria-label="Filter by region">${regionOptions}</select>
    <select id="metric" aria-label="Rank by indicator">${metricOptions}</select>
    <button class="btn ghost" id="sortDir" aria-pressed="${state.asc}">${state.asc ? "↑ Lowest first" : "↓ Highest first"}</button>
  </div>
  <div class="chips" role="group" aria-label="Quick metrics">${chips}</div>
  <section class="card">
    <h2>Ranked by ${esc(metric.label)}</h2>
    <p class="hint">${esc(metric.label)} (${esc(metric.unit)}) · World Bank indicator ${esc(metric.code)} ·
    ${rows.length} of 26 countries shown · <a href="#/compare">Compare countries →</a></p>
    <div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Country</th><th class="num">${esc(metric.label)}</th><th class="num hide-m">Year</th></tr></thead>
      <tbody>${tableRows || `<tr><td colspan="4"><div class="empty">No countries match that search.</div></td></tr>`}</tbody>
    </table></div>
    <p class="muted">${esc(SOURCE_NOTE)}</p>
  </section>`;
}

/** Country detail: KPIs, two trend charts, full indicator table. */
export function countryView(code) {
  const c = byCode.get(code);
  if (!c) {
    return `<p class="empty">Unknown country code “${esc(code)}”. <a href="#/">Back to rankings</a></p>`;
  }
  const kpis = ["pop", "gdp_pc", "life", "unemp"]
    .map((k) => {
      const ind = indicator(k);
      return `<div class="kpi"><div class="k-label">${esc(ind.label)}</div>
        <div class="k-value">${formatValue(k, valueOf(c, k))}</div>
        <div class="k-year">${esc(ind.unit)} · ${yearOf(c, k) || "—"}</div></div>`;
    })
    .join("");

  const tableRows = INDICATORS.map((ind) => {
    const v = valueOf(c, ind.key);
    return `<tr><td>${esc(ind.label)} <span class="muted">(${esc(ind.unit)})</span></td>
      <td class="num"><strong>${formatValue(ind.key, v)}</strong></td>
      <td class="num year">${yearOf(c, ind.key) || "—"}</td>
      <td class="year hide-m">${esc(ind.code)}</td></tr>`;
  }).join("");

  const others = COUNTRIES.filter((o) => o.code !== c.code).slice(0, 3);
  const compareLinks = others
    .map((o) => `<a class="btn ghost" href="#/compare?${c.code},${o.code}">vs ${esc(o.name)}</a>`)
    .join(" ");

  return `
  <a class="backlink" href="#/">← All countries</a>
  <div class="country-head"><h1>${esc(c.name)}</h1><span class="region">${esc(c.region)} · ${esc(c.code)}</span></div>
  <div class="kpis">${kpis}</div>
  <div class="chart-grid">
    <section class="card chart-box"><h3>Population, 2014–2024</h3>
      <p class="hint">People, World Bank SP.POP.TOTL</p>
      ${lineChart(c.pop, { label: "Population", format: (v) => compact(v) })}</section>
    <section class="card chart-box"><h3>GDP per capita, 2014–2024</h3>
      <p class="hint">Current US$, World Bank NY.GDP.PCAP.CD</p>
      ${lineChart(c.gdpPc, { label: "GDP per capita", format: (v) => "$" + compact(v) })}</section>
  </div>
  <section class="card">
    <h2>All indicators</h2>
    <p class="hint">Latest available year per indicator. ${esc(SOURCE_NOTE)}</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Indicator</th><th class="num">Value</th><th class="num">Year</th><th class="num hide-m">WDI code</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table></div>
  </section>
  <section class="card">
    <h2>Compare ${esc(c.name)}</h2>
    <p class="hint">Put it side by side with another country, indicator by indicator.</p>
    <p>${compareLinks} <a class="btn" href="#/compare?${c.code}">Open the comparison →</a></p>
  </section>`;
}

/** Compare: pick up to three countries, grouped bars per indicator. */
export function compareView(codes) {
  const picked = codes.filter((code) => byCode.has(code)).slice(0, 3);
  while (picked.length < 3) {
    const next = ["USA", "CHN", "IND"].find((code) => !picked.includes(code));
    if (!next) break;
    picked.push(next);
  }
  const options = (selected) =>
    COUNTRIES.map((c) => `<option value="${c.code}"${c.code === selected ? " selected" : ""}>${esc(c.name)}</option>`).join("");
  const pickers = picked
    .map(
      (code, i) => `<div><label for="pick${i}">Country ${i + 1}</label>
        <select id="pick${i}" data-slot="${i}">${options(code)}</select></div>`,
    )
    .join("");
  const legend = picked
    .map((code, i) => `<span><i class="dot-swatch sw${i}"></i>${esc(byCode.get(code).name)}</span>`)
    .join("");

  const rows = INDICATORS.map((ind) => {
    const vals = picked.map((code) => valueOf(byCode.get(code), ind.key));
    const present = vals.filter((v) => v !== null);
    if (!present.length) return "";
    const max = Math.max(...present);
    const min = Math.min(...present);
    const bars = picked
      .map((code, i) => {
        const v = vals[i];
        const pct = v === null ? 0 : ind.key === "gini" || ind.key === "life" || ind.key === "fert"
          ? ((v - Math.min(0, min * 0.9)) / (max - Math.min(0, min * 0.9))) * 100
          : (v / max) * 100;
        return `<div class="cmp-bar"><span>${esc(byCode.get(code).name)}</span>
          <span class="track"><span class="fill sw${i}" style="display:block;width:${Math.max(v === null ? 0 : 2, pct).toFixed(1)}%"></span></span>
          <span class="val">${v === null ? "—" : formatValue(ind.key, v)}</span></div>`;
      })
      .join("");
    return `<div class="cmp-row"><div class="cmp-label">${esc(ind.label)}<span class="unit">${esc(ind.unit)} · ${esc(ind.code)}</span></div>
      <div class="cmp-bars">${bars}</div></div>`;
  }).join("");

  const totals = picked
    .map((code) => {
      const c = byCode.get(code);
      return `<tr><td><a class="country-link" href="#/country/${code}">${esc(c.name)}</a></td>
        <td class="num">${grouped(valueOf(c, "pop"))}</td>
        <td class="num">${dollars(valueOf(c, "gdp_pc"))}</td>
        <td class="num">${formatValue("life", valueOf(c, "life"))}</td></tr>`;
    })
    .join("");

  return `
  <a class="backlink" href="#/">← All countries</a>
  <h1 style="font-size:28px;margin:0 0 6px">Compare countries</h1>
  <p style="color:var(--ink-soft);margin:0 0 18px">Pick up to three countries. Bars scale to the largest value in each row.</p>
  <div class="compare-pickers">${pickers}</div>
  <div class="legend">${legend}</div>
  <section class="card">${rows}</section>
  <section class="card">
    <h2>At a glance</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Country</th><th class="num">Population</th><th class="num">GDP per capita</th><th class="num">Life expectancy</th></tr></thead>
      <tbody>${totals}</tbody>
    </table></div>
    <p class="muted">${esc(SOURCE_NOTE)}</p>
  </section>`;
}

/** About: sources, method and coverage notes. */
export function aboutView() {
  const withLiteracy = COUNTRIES.filter((c) => valueOf(c, "literacy") !== null).length;
  return `
  <a class="backlink" href="#/">← All countries</a>
  <section class="card prose">
    <h1 style="font-size:28px;margin:0 0 6px">Sources &amp; method</h1>
    <p>Atlas shows national statistics for 26 countries, drawn from the World Bank's
    World Development Indicators through the public World Bank API (api.worldbank.org),
    fetched on 26 November 2026 and baked into the site — the site makes no network
    requests of its own, so the numbers you see are exactly the numbers that were fetched.</p>
    <h2>What each figure means</h2>
    <p>Every figure carries the year it refers to, because the latest available year differs
    by indicator. Most indicators are 2024; the Gini index runs 2020–2024 depending on the
    country, and adult literacy (${withLiteracy} of 26 countries report it) runs 2019–2024.
    Where a country does not report an indicator, Atlas shows “—” rather than guessing.</p>
    <h2>The indicators</h2>
    <ul>
      <li><strong>Population</strong> — total, SP.POP.TOTL</li>
      <li><strong>GDP</strong> — current US$, NY.GDP.MKTP.CD</li>
      <li><strong>GDP per capita</strong> — current US$, NY.GDP.PCAP.CD</li>
      <li><strong>Life expectancy at birth</strong> — years, SP.DYN.LE00.IN</li>
      <li><strong>Fertility rate</strong> — births per woman, SP.DYN.TFRT.IN</li>
      <li><strong>Unemployment</strong> — % of labour force (modelled ILO estimate), SL.UEM.TOTL.ZS</li>
      <li><strong>Internet users</strong> — % of population, IT.NET.USER.ZS</li>
      <li><strong>Urban population</strong> — % of total, SP.URB.TOTL.IN.ZS</li>
      <li><strong>Under-5 mortality</strong> — per 1,000 live births, SH.DYN.MORT</li>
      <li><strong>Gini index</strong> — 0–100, SI.POV.GINI</li>
      <li><strong>Adult literacy</strong> — % ages 15+, SE.ADT.LITR.ZS</li>
    </ul>
    <h2>Trends</h2>
    <p>Country pages chart population and GDP per capita for 2014–2024, the full ten-year
    series from the same World Bank indicators, with the percentage change since 2014 shown
    on each chart.</p>
    <p class="muted">${esc(SOURCE_NOTE)} Atlas is independent and not affiliated with the World Bank.</p>
  </section>`;
}
