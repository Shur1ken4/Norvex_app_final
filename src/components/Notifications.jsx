"use client";
import { useState } from "react";
import { M, BK, WH, GY, BD, MT, LT, GN } from "../lib/constants";

const ITEMS = [
  { t: "2h ago", m: "Yield compounded +$18.40", c: GN },
  { t: "1d ago", m: "Rebalanced: corrected to 8% growth", c: BK },
  { t: "3d ago", m: "Weekly summary: +0.8% this week", c: BK },
  { t: "5d ago", m: "Health check passed — risk 3.8%/5%", c: GN },
];

export default function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} title="Notifications" style={{cursor:"pointer",position:"relative",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MT} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={{position:"absolute",top:0,right:0,width:6,height:6,borderRadius:"50%",background:GN}}/>
      </div>
      {open && (
        <div style={{position:"absolute",top:34,right:0,background:WH,border:"1px solid "+BD,borderRadius:8,padding:8,minWidth:240,zIndex:20,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
          <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.1em",textTransform:"uppercase",margin:"4px 8px 8px"}}>Notifications</p>
          {ITEMS.map((it, i) => (
            <div key={i} style={{display:"flex",gap:8,padding:"8px",borderTop:i?"1px solid "+GY:"none"}}>
              <span style={{fontSize:10,fontFamily:M,color:MT,minWidth:42}}>{it.t}</span>
              <span style={{fontSize:12,color:LT}}>{it.m}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
