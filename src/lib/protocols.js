// Protocol allocation data — single source of truth for the marketing landing's
// Strategy Constructor / Allocation Engine and the Pro "where your money goes"
// breakdowns. These are the destinations the brain's safe/growth legs map to.

export const PROTOCOLS = [
  { key: "kamino",  name: "Kamino",          kind: "Lending",        apy: 8.5, downside: -2,  leg: "safe" },
  { key: "stable",  name: "Stable Vaults",   kind: "Money market",   apy: 5.2, downside: -1,  leg: "safe" },
  { key: "jito",    name: "Jito",            kind: "Liquid staking", apy: 7.8, downside: -4,  leg: "safe" },
  { key: "jupiter", name: "Jupiter",         kind: "Directional",    apy: 22,  downside: -18, leg: "growth" },
  { key: "options", name: "Options Overlay", kind: "Structured",     apy: 14,  downside: -9,  leg: "growth" },
];

// Intra-leg weights so a 2-leg safe/growth split renders the reference site's
// 4-line breakdown. Safe spreads across Kamino + Jito; growth across Jupiter +
// Options. With safe 65 / growth 35 this reproduces Kamino 40 / Jito 25 /
// Jupiter 20 / Options 15.
const SAFE_W = { kamino: 0.615, jito: 0.385 };
const GROWTH_W = { jupiter: 0.571, options: 0.429 };

function find(key) {
  return PROTOCOLS.find(function (p) { return p.key === key; });
}

// Map the brain's 2-leg safe/growth split into the 4-line protocol breakdown,
// returning each protocol enriched with its share (pct) and dollar amount (usd).
export function splitToProtocols(safePct, growthPct, amount) {
  var amt = Number(amount) || 0;
  var sp = Number(safePct) || 0;
  var gp = Number(growthPct) || 0;
  var rows = [
    { key: "kamino",  raw: sp * SAFE_W.kamino },
    { key: "jito",    raw: sp * SAFE_W.jito },
    { key: "jupiter", raw: gp * GROWTH_W.jupiter },
    { key: "options", raw: gp * GROWTH_W.options },
  ];
  return rows.map(function (r) {
    return Object.assign({}, find(r.key), {
      pct: Math.round(r.raw),
      usd: Math.round(amt * r.raw / 100),
    });
  });
}

// Blend an arbitrary { key: weightPct } mix into headline metrics for the
// Strategy Constructor. Weights are normalized so they need not sum to 100.
export function blend(weights, amount) {
  var amt = Number(amount) || 10000;
  var total = 0;
  Object.keys(weights || {}).forEach(function (k) { total += Number(weights[k]) || 0; });
  if (total <= 0) return { apy: 0, downside: 0, income12m: 0, stressLoss: 0, total: 0 };
  var apy = 0, downside = 0;
  PROTOCOLS.forEach(function (pr) {
    var w = (Number(weights[pr.key]) || 0) / total;
    apy += w * pr.apy;
    downside += w * pr.downside;
  });
  return {
    apy: apy,
    downside: downside,
    income12m: amt * apy / 100,
    stressLoss: amt * downside / 100,
    total: total,
  };
}
