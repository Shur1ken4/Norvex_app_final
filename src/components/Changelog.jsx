"use client";
import { M, BK, GY, BD, MT, LT } from "../lib/constants";
import { Label, H2, Sub, Card } from "./ui";

const LOG = [
  { v: "v6", date: "May 2026", items: ["Role-based access (user / admin / B2B)", "Real multi-portfolio accounts + revenue tracking", "Dark mode, command palette (⌘K), breadcrumbs", "Asset selector (SOL/ETH/BTC) + crash markers", "B2B compliance, sandbox keys, webhooks", "PDF/CSV export, changelog"] },
  { v: "v5", date: "Apr 2026", items: ["System docs, 5 brand white-label themes", "Guardrail what-if simulator", "Demo simulated-wallet accounts", "Waitlist referral loop"] },
  { v: "v4", date: "Mar 2026", items: ["Admin brain panel + debate transcripts", "B2B API playground", "Live demo mode, NPS survey"] },
  { v: "v3", date: "Feb 2026", items: ["Portfolio simulator", "Norvex-vs-direct comparison", "AI confidence scores"] },
];

export default function Changelog() {
  return (
    <div style={{ padding: "40px 20px", maxWidth: 440, margin: "0 auto" }}>
      <Label>WHAT&apos;S NEW</Label>
      <H2>Changelog</H2>
      <Sub>Norvex ships continuously. Recent highlights:</Sub>
      {LOG.map((rel, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: BK }}>{rel.v}</span>
            <span style={{ fontSize: 11, fontFamily: M, color: MT }}>{rel.date}</span>
          </div>
          {rel.items.map((it, j) => (
            <p key={j} style={{ fontSize: 12, color: LT, lineHeight: 1.5, margin: "0 0 4px", paddingLeft: 14, borderLeft: "2px solid " + BD }}>{it}</p>
          ))}
        </Card>
      ))}
    </div>
  );
}
