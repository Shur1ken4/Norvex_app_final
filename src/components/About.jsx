"use client";
import { F, M, BK, WH, GY, BD, MT, LT } from "../lib/constants";
import { Label, H2, Sub, Card } from "./ui";

const TEAM = [
  { name: "Sergei", title: "Co-founder / CEO", initials: "S", creds: "Quant finance + structured products. Ex-trading. Designs the allocation engine and risk framework." },
  { name: "Aleksander", title: "Co-founder / CTO", initials: "A", creds: "Solana + Rust engineer. Builds the vault programs, AI orchestration, and on-chain execution." },
];

export default function About() {
  return (
    <div style={{padding:"40px 20px",maxWidth:440,margin:"0 auto"}}>
      <Label>THE TEAM</Label>
      <H2>Built by operators, not tourists</H2>
      <Sub>Norvex is built on Solana and validated by Superteam Ireland.</Sub>
      {TEAM.map((m, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{width:48,height:48,borderRadius:"50%",background:GY,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:BK,flexShrink:0}}>{m.initials}</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px", color: BK }}>{m.name}</p>
              <p style={{ fontSize: 11, fontFamily: M, color: MT, margin: "0 0 6px" }}>{m.title}</p>
              <p style={{ fontSize: 12, color: LT, lineHeight: 1.5, margin: 0 }}>{m.creds}</p>
            </div>
          </div>
        </Card>
      ))}
      <Card hl style={{ marginTop: 12 }}>
        <Label mb={6}>VALIDATION</Label>
        <p style={{ fontSize: 13, color: LT, lineHeight: 1.6, margin: 0 }}>
          4th place, Superteam Ireland hackathon (5,400+ submissions). Built on Solana. 20+ investor conversations.
        </p>
      </Card>
    </div>
  );
}
