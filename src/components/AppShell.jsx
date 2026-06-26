"use client";
import { F, WH, GY, M, MT, BG, NX_GRAD, NX_1, R_LG, SHADOW_SM, SHADOW_MD } from "../lib/constants";
import { NavProvider, useSetScreen } from "../lib/nav";
import { ToastProvider } from "../lib/toast";
import { RoleProvider } from "../lib/role";
import { CurrencyProvider } from "../lib/currency";
import { ModeProvider } from "../lib/mode";
import { LangProvider, useLang } from "../lib/i18n";
import WalletProviders from "../app/providers";
import WalletBridge from "./WalletBridge";
import Nav from "./Nav";
import Breadcrumbs from "./Breadcrumbs";
import CommandPalette from "./CommandPalette";
import FeedbackWidget from "./FeedbackWidget";

function Footer() {
  const setScreen = useSetScreen();
  const t = useLang().t;
  return (
    <div className="no-print" style={{ borderTop: "1px solid " + GY }}>
    <div style={{
      padding: "28px 28px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      borderBottom: "1px solid " + GY,
    }}>
      <span style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: MT,
        fontFamily: M,
      }}>{t("Supported by")}</span>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 40,
        color: MT,
        opacity: 0.85,
      }}>
        <a href="https://ie.superteam.fun/" target="_blank" rel="noopener noreferrer" title="Superteam Ireland" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <img src="/svg/superteam.jpeg" alt="Superteam Ireland" width={40} height={40} style={{ width: 40, height: 40, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} loading="lazy" />
          <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontFamily: F, fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: "#0d6e47" }}>Superteam</span>
            <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.2em", color: "#0d6e47", opacity: 0.78 }}>IRELAND</span>
          </span>
        </a>
        <span style={{ width: 1, height: 34, background: GY }} />
        <a href="https://www.ndrc.ie/" target="_blank" rel="noopener noreferrer" title="NDRC Pre-Accelerator 2026" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/svg/ndrc.svg" alt="NDRC Pre-Accelerator 2026" height={36} style={{ height: 36, width: "auto" }} loading="lazy" />
        </a>
      </div>
    </div>
    <div style={{
      padding: "20px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    }}>
      <p style={{
        fontSize: 12,
        color: MT,
        fontFamily: M,
        margin: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: NX_GRAD,
          display: "inline-block",
          flexShrink: 0,
        }}/>
        <span>norvex v5 · built on solana · 2026</span>
      </p>
      <div style={{display: "flex", alignItems: "center", gap: 16}}>
        <a href="/about" style={{fontSize: 12, fontFamily: M, color: MT, textDecoration: "none", cursor: "pointer"}}>
          {t("About")}
        </a>
        <a href="/changelog" style={{fontSize: 12, fontFamily: M, color: MT, textDecoration: "none", cursor: "pointer"}}>
          {t("Changelog")}
        </a>
      </div>
    </div>
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <WalletProviders>
      <NavProvider>
        <ToastProvider>
          <RoleProvider>
            <CurrencyProvider>
              <ModeProvider>
                <LangProvider>
                <WalletBridge />
                <div className="nx-shell" style={{
                  minHeight: "100vh",
                  backgroundColor: WH,
                  fontFamily: F,
                  borderRadius: R_LG,
                  overflow: "hidden",
                }}>
                  <Nav />
                  <Breadcrumbs />
                  {children}
                  <Footer />
                  <FeedbackWidget />
                  <CommandPalette />
                </div>
                </LangProvider>
              </ModeProvider>
            </CurrencyProvider>
          </RoleProvider>
        </ToastProvider>
      </NavProvider>
    </WalletProviders>
  );
}
