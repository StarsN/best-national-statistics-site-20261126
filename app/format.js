// Number formatting for Atlas: compact, comma-grouped and money forms, one job each.

/** 1,451,000,000 -> "1.45B"; 86,170 -> "86.2K"; 542 -> "542". */
export function compact(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return trim(value / 1e9) + "B";
  if (abs >= 1e6) return trim(value / 1e6) + "M";
  if (abs >= 1e3) return trim(value / 1e3) + "K";
  return trim(value);
}

function trim(n) {
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}

/** 340003797 -> "340,003,797". */
export function grouped(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

/** 86169.66 -> "$86,170"; 2591.99 -> "$2,592". */
export function dollars(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return "$" + Math.round(value).toLocaleString("en-US");
}

/** 29.28e9 -> "$29.28 trillion" style short money for GDP totals. */
export function bigDollars(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (Math.abs(value) >= 1e12) return "$" + trim(value / 1e12) + " trillion";
  if (Math.abs(value) >= 1e9) return "$" + trim(value / 1e9) + " billion";
  return dollars(value);
}

/** One decimal where it matters, two where the value is small. */
export function decimals(value, places = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(places);
}

/** Format a figure by indicator key, so tables and cards agree. */
export function formatValue(key, value) {
  if (value === null || value === undefined) return "—";
  switch (key) {
    case "pop": return grouped(value);
    case "gdp": return bigDollars(value);
    case "gdp_pc": return dollars(value);
    case "life": return decimals(value, 1) + " yrs";
    case "fert": return decimals(value, 2);
    case "unemp": return decimals(value, 1) + "%";
    case "internet": return decimals(value, 1) + "%";
    case "urban": return decimals(value, 1) + "%";
    case "mortality": return decimals(value, 1);
    case "gini": return decimals(value, 1);
    case "literacy": return decimals(value, 1) + "%";
    default: return String(value);
  }
}

/** Median of a list of numbers. */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
