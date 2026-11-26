// SVG charts for Atlas, drawn with plain strings: no library, no network.
// Every chart is deterministic from its data, so screenshots always match.

/**
 * A labelled line chart for a [year, value] series.
 * Returns an SVG string sized by viewBox (scales to its container).
 */
export function lineChart(series, { label, format }) {
  const width = 460;
  const height = 220;
  const padL = 58;
  const padR = 12;
  const padT = 28;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const values = series.map(([, v]) => v);
  const years = series.map(([y]) => y);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.12;
  max += span * 0.12;
  const x = (i) => padL + (i / (series.length - 1)) * innerW;
  const y = (v) => padT + (1 - (v - min) / (max - min)) * innerH;
  const points = series.map(([, v], i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${padL},${padT + innerH} ${points} ${x(series.length - 1).toFixed(1)},${padT + innerH}`;
  const ticks = 4;
  let grid = "";
  for (let t = 0; t <= ticks; t++) {
    const v = min + ((max - min) * t) / ticks;
    const gy = y(v);
    grid += `<line class="grid-line" x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}"/>` +
      `<text class="axis" x="${padL - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end">${format(v)}</text>`;
  }
  let labels = "";
  series.forEach(([yr], i) => {
    if (i % 2 === 0 || i === series.length - 1) {
      labels += `<text class="axis" x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle">${yr}</text>`;
    }
  });
  const last = series[series.length - 1];
  const first = series[0];
  const change = ((last[1] - first[1]) / first[1]) * 100;
  const sign = change >= 0 ? "+" : "";
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label} trend, ${first[0]} to ${last[0]}">
    ${grid}
    <polygon class="area-path" points="${area}"/>
    <polyline class="line-path" points="${points}"/>
    <circle class="dot" cx="${x(series.length - 1).toFixed(1)}" cy="${y(last[1]).toFixed(1)}" r="4"/>
    ${labels}
    <text class="axis" x="${padL}" y="14" text-anchor="start" style="font-weight:700;fill:#17233b">${label}</text>
    <text class="axis" x="${width - padR}" y="14" text-anchor="end" style="font-weight:700;fill:#0e7c6b">${sign}${change.toFixed(1)}% since ${first[0]}</text>
  </svg>`;
}

/** A single horizontal bar (0-100 scale) for the rankings table. */
export function rankBar(fraction) {
  const pct = Math.max(1.5, Math.min(100, fraction * 100));
  return `<span class="bar" style="width:${pct.toFixed(1)}%"></span>`;
}
