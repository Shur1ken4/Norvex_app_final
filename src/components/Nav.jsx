"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { F, FD, M, BK, WH, GY, BD, MT, LT, GN, RD, S, NX_GRAD, NX_1, R_MD, R_PILL, SHADOW_MD, SHADOW_SM } from "../lib/constants";
import { useNav, useSetScreen } from "../lib/nav";
import { useRole } from "../lib/role";
import { useTheme } from "../lib/theme";
import { useMode } from "../lib/mode";
import { useLang } from "../lib/i18n";
import { Btn } from "./ui";
import Notifications from "./Notifications";

export default function Nav() {
  const { connected, setConnected, address, simulated, disconnectDemo } = useNav();
  const { role } = useRole();
  const { theme, toggle } = useTheme();
  const { mode, setMode } = useMode();
  const { t } = useLang();
  const setScreen = useSetScreen();
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [menuOpen, setMenu] = useState(false);
  const label = address ? address.slice(0, 4) + ".." + address.slice(-4) : "Demo";
  const isAdmin = role === "admin";
  const isB2B = role === "admin" || role === "b2b";
  const menuItems = [["Dashboard",S.DASH],["New Portfolio",S.GOAL],["Simulator",S.SIMULATOR],["History",S.HISTORY],["Education",S.EDUCATION]]
    .concat(isAdmin?[["Admin Panel",S.ADMIN],["System Docs",S.SYSTEM]]:[])
    .concat(isB2B?[["API / B2B",S.B2B]]:[])
    .concat([["Settings",S.SETTINGS]]);

  const onLogout = () => {
    if (typeof window !== "undefined") {
      [
        "norvex_demo","norvex_goal","norvex_asset","norvex_pf_name",
        "norvex_brain","norvex_brain_committed","norvex_deployed",
      ].forEach((k) => sessionStorage.removeItem(k));
    }
    if (simulated) disconnectDemo();
    else setConnected(false);
    setScreen(S.LANDING);
  };

  return (
    <div className="no-print" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 28px",
      height: 64,
      borderBottom: isLanding ? "none" : "1px solid " + GY,
      position: "relative",
      background: WH,
    }}>
      {/* Logo */}
      <div
        style={{cursor: "pointer", display: "flex", alignItems: "center"}}
        onClick={function(){ setScreen(connected ? S.DASH : S.LANDING); }}
      >
        <span style={{fontSize: 23, fontWeight: 600, letterSpacing: "0.13em", color: "#1a2a4f", fontFamily: FD, lineHeight: 1}}>NORVEX</span>
      </div>

      {/* Right side */}
      <div style={{display: "flex", alignItems: "center", gap: 12}}>
        {!isLanding && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: GY,
            border: "1px solid " + BD,
            borderRadius: R_PILL,
            padding: 2,
          }}>
            {["lite", "pro"].map(function(m){
              var on = mode === m;
              return (
                <span
                  key={m}
                  onClick={function(){ setMode(m); }}
                  style={{
                    fontSize: 11,
                    fontFamily: M,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    textTransform: "capitalize",
                    color: on ? WH : LT,
                    background: on ? BK : "transparent",
                    borderRadius: R_PILL,
                    padding: "5px 12px",
                    cursor: "pointer",
                    transition: "background .15s, color .15s",
                  }}
                >
                  {m}
                </span>
              );
            })}
          </div>
        )}
        {connected && isAdmin && (
          <span
            onClick={function(){ setScreen(S.ADMIN); }}
            style={{fontSize: 13, color: LT, cursor: "pointer", fontFamily: F, fontWeight: 500}}
          >
            Admin
          </span>
        )}
        {connected && isB2B && (
          <span
            onClick={function(){ setScreen(S.B2B); }}
            style={{fontSize: 13, color: LT, cursor: "pointer", fontFamily: F, fontWeight: 500}}
          >
            API
          </span>
        )}
        {connected && <Notifications/>}
        {!isB2B && (
          <span
            onClick={function(){ setScreen(S.B2B); }}
            style={{
              fontSize: 12.5,
              color: NX_1,
              cursor: "pointer",
              fontFamily: F,
              fontWeight: 600,
              border: "1px solid " + NX_1,
              borderRadius: R_PILL,
              padding: "6px 13px",
              background: "rgba(37,99,235,0.06)",
              transition: "background .15s",
            }}
            onMouseEnter={function(e){ e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
            onMouseLeave={function(e){ e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
          >
            {t("For Business")}
          </span>
        )}
        {connected ? (
          <div
            onClick={function(){ setMenu(!menuOpen); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: GY,
              borderRadius: R_PILL,
              padding: "7px 14px",
              cursor: "pointer",
              border: "1px solid " + BD,
              transition: "background .15s",
            }}
          >
            <div style={{width: 7, height: 7, borderRadius: "50%", background: GN}}/>
            <span style={{fontSize: 12, fontFamily: M, color: LT, fontWeight: 600}}>{label}</span>
            {simulated && (
              <span style={{
                fontSize: 10,
                fontFamily: M,
                fontWeight: 700,
                color: MT,
                background: WH,
                border: "1px solid " + BD,
                borderRadius: 4,
                padding: "2px 5px",
                letterSpacing: "0.04em",
              }}>
                {t("demo")}
              </span>
            )}
          </div>
        ) : (
          <Btn small black onClick={function(){ setScreen(S.WAITLIST); }}>{t("Get Started")}</Btn>
        )}
      </div>

      {/* Dropdown menu */}
      {menuOpen && connected && (
        <div style={{
          position: "absolute",
          top: 70,
          right: 28,
          background: WH,
          border: "1px solid " + BD,
          borderRadius: R_MD,
          padding: "6px",
          minWidth: 210,
          zIndex: 100,
          boxShadow: "0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)",
        }}>
          {menuItems.map(function(item, i){
            return (
              <div
                key={i}
                onClick={function(){ setScreen(item[1]); setMenu(false); }}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  color: BK,
                  cursor: "pointer",
                  borderRadius: 8,
                  fontWeight: 500,
                  fontFamily: F,
                  transition: "background .1s",
                }}
                onMouseEnter={function(e){ e.currentTarget.style.background = GY; }}
                onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}
              >
                {t(item[0])}
              </div>
            );
          })}
          <div
            onClick={function(){ toggle(); }}
            style={{
              padding: "10px 14px",
              fontSize: 14,
              color: BK,
              cursor: "pointer",
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 500,
              fontFamily: F,
            }}
            onMouseEnter={function(e){ e.currentTarget.style.background = GY; }}
            onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}
          >
            <span>{t("Dark mode")}</span>
            <span style={{fontSize: 11, fontFamily: M, color: MT, fontWeight: 600}}>{theme === "dark" ? t("On") : t("Off")}</span>
          </div>
          <div style={{borderTop: "1px solid " + GY, margin: "4px 0"}}/>
          <div
            onClick={function(){ onLogout(); setMenu(false); }}
            style={{
              padding: "10px 14px",
              fontSize: 14,
              color: RD,
              cursor: "pointer",
              borderRadius: 8,
              fontWeight: 500,
              fontFamily: F,
            }}
            onMouseEnter={function(e){ e.currentTarget.style.background = "#FFF1F1"; }}
            onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}
          >
            {simulated ? t("Sign out (clear demo account)") : t("Disconnect")}
          </div>
        </div>
      )}
    </div>
  );
}
