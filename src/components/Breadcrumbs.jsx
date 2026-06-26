"use client";
import { usePathname, useRouter } from "next/navigation";
import { M, MT, LT, GY } from "../lib/constants";
import { useLang } from "../lib/i18n";

const LABELS = {
  dashboard: "Dashboard", goal: "New Portfolio", simulator: "Simulator",
  building: "Building", preview: "Preview", deployed: "Deployed", connect: "Connect",
  tutorial: "Tutorial", waitlist: "Waitlist", history: "History", education: "Education",
  settings: "Settings", about: "About", b2b: "B2B", admin: "Admin", system: "System",
  changelog: "Changelog", demo: "Demo",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useLang().t;
  // Hide on landing and login.
  if (!pathname || pathname === "/" || pathname.startsWith("/login")) return null;
  const seg = pathname.split("/").filter(Boolean)[0];
  const label = LABELS[seg];
  if (!label) return null;

  return (
    <div className="no-print" style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",borderBottom:"1px solid "+GY,fontSize:11,fontFamily:M}}>
      <span onClick={() => router.push("/")} style={{color:MT,cursor:"pointer"}}>{t("Home")}</span>
      <span style={{color:MT}}>›</span>
      <span style={{color:LT}}>{t(label)}</span>
    </div>
  );
}
