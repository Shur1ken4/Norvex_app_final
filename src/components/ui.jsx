"use client";
import { F, FD, M, BK, WH, GY, BD, MT, LT, RD, BODY2, MUTEDFILL, TINT_RD_BD, R_PILL, R_LG, R_SM, NX_GRAD, NX_ON, NX_1, SHADOW_SM, SHADOW_MD, SHADOW_LG } from "../lib/constants";

export function Btn(p){
  // Variants: primary (blue gradient) > black (solid) > danger > outline (default).
  var primary = !!p.primary;
  var black = !!p.black && !primary;
  var disabled = !!p.disabled;

  var base = {
    border: primary ? "none" : ("1px solid " + (black ? BK : p.danger ? TINT_RD_BD : "var(--bd-strong)")),
    borderRadius: R_PILL,
    padding: p.small ? "10px 20px" : "14px 28px",
    fontSize: p.small ? 14 : 15,
    fontWeight: 500,
    fontFamily: F,
    letterSpacing: "0",
    cursor: disabled ? "default" : "pointer",
    width: p.full ? "100%" : "auto",
    transition: "box-shadow .15s ease, transform .12s ease, opacity .15s ease, background .15s ease",
    boxShadow: disabled ? "none" : primary ? "0 1px 2px rgba(37,99,235,0.22)" : "none",
    background: disabled ? MUTEDFILL : primary ? NX_GRAD : black ? BK : "transparent",
    color: disabled ? MT : primary ? NX_ON : black ? WH : p.danger ? RD : BK,
  };

  var hover = {};
  if (!disabled) {
    if (primary) hover = { boxShadow: "0 3px 14px rgba(37,99,235,0.32)", transform: "translateY(-1px)" };
    else if (black) hover = { transform: "translateY(-1px)" };
    else hover = { background: "var(--gy)" };
  }

  return (
    <button
      className={p.className}
      onClick={p.onClick}
      disabled={disabled}
      style={Object.assign(base, p.style || {})}
      onMouseEnter={function(e){ if (!disabled) { Object.assign(e.currentTarget.style, hover); } }}
      onMouseLeave={function(e){ if (!disabled) { e.currentTarget.style.boxShadow = base.boxShadow; e.currentTarget.style.transform = "none"; e.currentTarget.style.background = base.background; } }}
    >
      {p.children}
    </button>
  );
}

export function Label(p){
  return (
    <p style={{
      fontSize: 11,
      fontFamily: F,
      color: NX_1,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      fontWeight: 600,
      marginBottom: p.mb || 12,
    }}>
      {p.children}
    </p>
  );
}

export function H2(p){
  return (
    <h2 style={{
      fontFamily: FD,
      fontSize: 32,
      fontWeight: 500,
      margin: "0 0 " + (p.mb || 12) + "px",
      color: BK,
      letterSpacing: "-0.8px",
      lineHeight: 1.12,
    }}>
      {p.children}
    </h2>
  );
}

export function Sub(p){
  return (
    <p style={{
      fontSize: 16,
      color: BODY2,
      margin: "0 0 " + (p.mb || 28) + "px",
      lineHeight: 1.55,
      fontWeight: 400,
    }}>
      {p.children}
    </p>
  );
}

export function Card(p){
  // Default radius bumps to R_LG (16). `elev` adds soft shadow. `accent` wraps in a 1px gradient border.
  var inner = {
    background: p.dark ? BK : p.hl ? GY : WH,
    border: p.accent ? "0" : ("1px solid " + (p.dark ? "rgba(255,255,255,0.07)" : BD)),
    borderRadius: p.accent ? "calc(" + R_LG + " - 1px)" : R_LG,
    padding: p.p || 24,
    boxShadow: p.elev ? SHADOW_LG : "none",
  };

  if (p.accent) {
    return (
      <div style={Object.assign({background: NX_GRAD, borderRadius: R_LG, padding: 1, boxShadow: p.elev ? SHADOW_MD : "none"}, p.style || {})}>
        <div style={inner}>{p.children}</div>
      </div>
    );
  }

  return <div style={Object.assign(inner, p.style || {})}>{p.children}</div>;
}

export function Row(p){
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "11px 0",
      borderBottom: p.last ? "none" : "1px solid " + GY,
    }}>
      <span style={{fontSize: 13, color: BODY2, fontWeight: 400}}>{p.l}</span>
      <span style={{fontSize: 13, fontWeight: 600, color: p.vc || BK, fontFamily: M}}>{p.v}</span>
    </div>
  );
}

export function Stat(p){
  return (
    <div style={{
      background: WH,
      borderRadius: R_LG,
      padding: "20px 22px",
      border: "1px solid " + BD,
      boxShadow: "none",
    }}>
      <p style={{fontSize: p.big ? 36 : 24, fontWeight: 500, margin: "0 0 4px", color: p.c || BK, letterSpacing: "-0.6px", fontFamily: FD}}>{p.n}</p>
      <p style={{fontSize: 11, color: MT, margin: 0, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: F}}>{p.d}</p>
    </div>
  );
}

export function Tab(p){
  return (
    <button
      onClick={p.onClick}
      style={{
        background: p.active ? BK : "transparent",
        color: p.active ? WH : LT,
        border: "1px solid " + (p.active ? BK : BD),
        borderRadius: R_PILL,
        padding: "6px 14px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: M,
        letterSpacing: "0.01em",
        transition: "all .15s ease",
      }}
    >
      {p.children}
    </button>
  );
}

export function Toggle(p){
  return (
    <div
      onClick={p.onClick}
      style={{
        width: 38,
        height: 22,
        borderRadius: 11,
        background: p.on ? "var(--nx-1)" : BD,
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        boxShadow: p.on ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
      }}
    >
      <div style={{
        width: 17,
        height: 17,
        borderRadius: "50%",
        background: WH,
        position: "absolute",
        top: 2.5,
        left: p.on ? 18.5 : 2.5,
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}/>
    </div>
  );
}

export function MiniChart(p){
  var pts = p.data || [50,52,48,55,60,58,65,62,68,72];
  var minV = Math.min.apply(null, pts);
  var maxV = Math.max.apply(null, pts);
  var range = maxV - minV + 1;
  var points = pts.map(function(v, i){
    return (i * (120 / (pts.length - 1))) + "," + (30 - ((v - minV) / range) * 28);
  }).join(" ");

  return (
    <svg viewBox="0 0 120 30" style={{width: p.w || 120, height: p.h || 30}}>
      <polyline points={points} fill="none" stroke={p.c || "var(--nx-1)"} strokeWidth={1.5}/>
    </svg>
  );
}

export function SysCode(p){
  return (
    <pre style={{
      background: GY,
      borderRadius: R_SM,
      padding: "14px 16px",
      fontFamily: M,
      fontSize: 11,
      lineHeight: 1.8,
      color: LT,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      margin: 0,
      overflowX: "auto",
      border: "1px solid " + BD,
    }}>
      {p.children}
    </pre>
  );
}
