// Norvex monetization model (locked with the user).
export const MGMT = 0.0075;        // 0.75%/yr management fee on AUM
export const PERF = 0.10;          // 10% performance fee on gains
export const B2B_PARTNER = 0.40;   // partner keeps 40% of the product fee
export const NORVEX_SHARE = 0.60;  // Norvex keeps 60% on B2B-origin portfolios

// Prorated management fee for a position held `days` days.
export function mgmtFee(value, days = 365) {
  return (Number(value) || 0) * MGMT * (Math.max(0, days) / 365);
}

// Performance fee on positive gains only.
export function perfFee(gain) {
  return Math.max(0, Number(gain) || 0) * PERF;
}

// Total Norvex revenue from one portfolio. B2B-origin portfolios are revenue-shared.
export function norvexRevenue(pf) {
  const value = Number(pf.value ?? pf.amount ?? 0);
  const ret = Number(pf.return_pct ?? 0) / 100;
  const days = pf.created_at
    ? Math.max(1, (Date.now() - new Date(pf.created_at).getTime()) / 86400000)
    : 365;
  const gain = value * Math.max(0, ret);
  const gross = mgmtFee(value, days) + perfFee(gain);
  return (pf.origin === "b2b" ? gross * NORVEX_SHARE : gross);
}
