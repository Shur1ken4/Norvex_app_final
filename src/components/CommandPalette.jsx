"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { F, M, BK, WH, GY, BD, MT, LT } from "../lib/constants";
import { useNav } from "../lib/nav";
import { useRole } from "../lib/role";
import { useTheme } from "../lib/theme";

export default function CommandPalette() {
  const router = useRouter();
  const { setConnected } = useNav();
  const { role } = useRole();
  const { toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const isAdmin = role === "admin";
    const isB2B = role === "admin" || role === "b2b";
    const nav = [
      ["Dashboard", "/dashboard"],
      ["New Portfolio", "/goal"],
      ["Simulator", "/simulator"],
      ["History", "/history"],
      ["Education", "/education"],
      ["About", "/about"],
      ["Changelog", "/changelog"],
      ["Settings", "/settings"],
    ];
    if (isB2B) nav.push(["API / B2B", "/b2b"]);
    if (isAdmin) { nav.push(["Admin Panel", "/admin"]); nav.push(["System Docs", "/system"]); }
    const list = nav.map(([label, path]) => ({ label, run: () => router.push(path) }));
    list.push({ label: "Toggle dark mode", run: () => toggle() });
    list.push({ label: "Disconnect", run: () => { setConnected(false); router.push("/"); } });
    return list;
  }, [role, router, toggle, setConnected]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => i.label.toLowerCase().includes(s)) : items;
  }, [q, items]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "/" && !typing && !open) { e.preventDefault(); setOpen(true); }
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { setActive(0); }, [q, open]);

  if (!open) return null;

  const choose = (i) => { setOpen(false); setQ(""); i.run(); };

  return (
    <div className="no-print" onClick={() => setOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:120,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80}}>
      <div onClick={(e) => e.stopPropagation()} style={{background:WH,border:"1px solid "+BD,borderRadius:12,width:"100%",maxWidth:420,margin:"0 16px",boxShadow:"0 12px 40px rgba(0,0,0,0.25)",overflow:"hidden"}}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && filtered[active]) choose(filtered[active]);
          }}
          placeholder="Type a command or page…"
          style={{width:"100%",padding:16,fontSize:15,fontFamily:F,border:"none",borderBottom:"1px solid "+GY,outline:"none",boxSizing:"border-box",background:WH,color:BK}} />
        <div style={{maxHeight:320,overflowY:"auto",padding:6}}>
          {filtered.length === 0 && <p style={{fontSize:13,color:MT,padding:12,margin:0}}>No matches.</p>}
          {filtered.map((i, idx) => (
            <div key={i.label} onMouseEnter={() => setActive(idx)} onClick={() => choose(i)}
              style={{padding:"10px 12px",fontSize:14,color:BK,cursor:"pointer",borderRadius:8,background:idx===active?GY:"transparent",display:"flex",justifyContent:"space-between"}}>
              <span>{i.label}</span>{idx===active && <span style={{fontSize:11,fontFamily:M,color:MT}}>↵</span>}
            </div>
          ))}
        </div>
        <div style={{padding:"8px 12px",borderTop:"1px solid "+GY,fontSize:10,fontFamily:M,color:MT}}>⌘K to toggle · ↑↓ to move · ↵ to select · esc to close</div>
      </div>
    </div>
  );
}
