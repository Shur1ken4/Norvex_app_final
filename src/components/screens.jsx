"use client";
import { useState, useEffect, useRef } from "react";
import { F, FD, M, BK, WH, GY, BD, MT, LT, GN, RD, AM, BG, S, BODY2, MUTEDFILL, TINT_GN_BG, TINT_GN_BD, TINT_RD_BG, TINT_RD_BD, TINT_AM_BG, TINT_AM_BD, NX_GRAD, NX_1, NX_2, HERO_GLOW, R_SM, R_MD, R_LG, R_PILL, SHADOW_SM, SHADOW_MD, SHADOW_LG, PAD_SECTION, PAD_LG } from "../lib/constants";
import { Btn, Label, H2, Sub, Card, Row, Stat, Tab, Toggle, MiniChart, SysCode } from "./ui";
import { PROTOCOLS, splitToProtocols, blend } from "../lib/protocols";
import { useToast } from "../lib/toast";
import { useRole } from "../lib/role";
import { useCurrency, CURRENCIES } from "../lib/currency";
import { useNav } from "../lib/nav";
import { useMode } from "../lib/mode";
import { useLang } from "../lib/i18n";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createVaultOnChain, explorerTxUrl, VAULT_CONFIGURED } from "../lib/chain/vault";
import NPSModal from "./NPSModal";

// ━━━ SHARED BUILDING BLOCKS (reused on Landing, Goal, Preview, Dashboard) ━━━

// "Where the money actually goes" — maps a 2-leg safe/growth split to the 4-line
// protocol breakdown (Kamino / Jito / Jupiter / Options).
function ProtocolRows(props){
  var cur=props.cur;var rows=splitToProtocols(props.safePct,props.growthPct,props.amount);
  return <div>{rows.map(function(r,i){return <div key={i} style={{marginBottom:i<rows.length-1?12:0}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
      <span style={{fontSize:13,color:BK,fontWeight:600}}>{r.name} <span style={{fontSize:11,color:MT,fontWeight:400}}>· {r.kind}</span></span>
      <span style={{fontSize:13,fontFamily:M,fontWeight:600,color:BK}}>{cur.format(r.usd)} <span style={{color:MT,fontWeight:400}}>· {r.pct}%</span></span>
    </div>
    <div style={{height:6,borderRadius:3,background:GY,overflow:"hidden"}}><div style={{width:r.pct+"%",height:"100%",background:r.leg==="growth"?MT:NX_GRAD,borderRadius:3}}/></div>
  </div>;})}</div>;
}

// VaR / CVaR / Sharpe / Max-DD tiles from the brain's Monte Carlo result.
function AnalyticsCards(props){
  var mc=props.mc;if(!mc)return null;
  var tiles=[{n:(mc.var95*100).toFixed(1)+"%",d:"VaR 95"},{n:(mc.cvar95*100).toFixed(1)+"%",d:"CVaR 95"},{n:Number(mc.sharpe).toFixed(2),d:"Sharpe"},{n:(mc.maxDD*100).toFixed(1)+"%",d:"Max drawdown"}];
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>{tiles.map(function(t,i){return <div key={i} style={{background:GY,borderRadius:R_SM,padding:"12px 8px",textAlign:"center"}}><p style={{fontSize:16,fontFamily:M,fontWeight:700,color:BK,margin:"0 0 2px"}}>{t.n}</p><p style={{fontSize:9,fontFamily:M,color:MT,margin:0,letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.d}</p></div>;})}</div>;
}

// Deterministic guardrail / stress checks with pass-fail dots.
function StressList(props){
  var checks=props.checks;if(!checks||!checks.length)return null;
  return <div>{checks.map(function(c,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<checks.length-1?"1px solid "+GY:"none"}}><span style={{width:7,height:7,borderRadius:"50%",background:c.passed?GN:RD,flexShrink:0}}/><span style={{fontSize:12,color:BK,fontWeight:500,flex:1}}>{c.name}</span><span style={{fontSize:11,fontFamily:M,color:MT}}>{c.detail}</span></div>;})}</div>;
}

// Bull / Bear / PM reasoning detail from the multi-agent debate.
function DebateBlock(props){
  var d=props.debate;if(!d)return null;
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <div style={{background:TINT_GN_BG,border:"1px solid "+TINT_GN_BD,borderRadius:R_SM,padding:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontFamily:M,fontWeight:700,color:GN,letterSpacing:"0.04em"}}>BULL</span><span style={{fontSize:11,fontFamily:M,color:MT}}>{Math.round(d.bullConfidence)}/100</span></div>
        <p style={{fontSize:12,color:LT,margin:0,lineHeight:1.5}}>{d.bullCase}</p>
      </div>
      <div style={{background:TINT_RD_BG,border:"1px solid "+TINT_RD_BD,borderRadius:R_SM,padding:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontFamily:M,fontWeight:700,color:RD,letterSpacing:"0.04em"}}>BEAR</span><span style={{fontSize:11,fontFamily:M,color:MT}}>{Math.round(d.bearConfidence)}/100</span></div>
        <p style={{fontSize:12,color:LT,margin:0,lineHeight:1.5}}>{d.bearCase}</p>
      </div>
    </div>
    <div style={{background:GY,borderRadius:R_SM,padding:12}}><span style={{fontSize:11,fontFamily:M,fontWeight:700,color:NX_1,letterSpacing:"0.04em"}}>PM DECISION</span><p style={{fontSize:12,color:LT,margin:"6px 0 0",lineHeight:1.5}}>{d.pmRationale}</p></div>
  </div>;
}

// Inline line/glyph icon set used by the "Why blockchain" section.
function BIcon(props){
  var n=props.n,c=props.c||"#2563EB",s=props.s||26,w=props.w||1.8;
  var P={fill:"none",stroke:c,strokeWidth:w,strokeLinecap:"round",strokeLinejoin:"round"};
  var body;
  if(n==="shield")body=<g {...P}><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></g>;
  else if(n==="lock")body=<g {...P}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g>;
  else if(n==="globe")body=<g {...P}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18-2.6-2.6-2.6-15.4 0-18z"/></g>;
  else if(n==="droplet")body=<g {...P}><path d="M12 3s6 6.4 6 10.4a6 6 0 0 1-12 0C6 9.4 12 3 12 3z"/></g>;
  else if(n==="bolt")body=<g {...P}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7z"/></g>;
  else if(n==="compose")body=<g {...P}><circle cx="9.5" cy="12" r="5"/><circle cx="14.5" cy="12" r="5"/></g>;
  else if(n==="eye")body=<g {...P}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>;
  else if(n==="person")body=<g {...P}><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/></g>;
  else if(n==="rings")body=<g fill="none" strokeWidth="2" strokeLinecap="round"><circle cx="9.2" cy="10" r="4" stroke="#22C55E"/><circle cx="14.8" cy="10" r="4" stroke="#3B82F6"/><circle cx="12" cy="15" r="4" stroke="#F59E0B"/></g>;
  else body=null;
  return <svg width={s} height={s} viewBox="0 0 24 24">{body}</svg>;
}

// Expandable "protocols we work with" cards — click to reveal a plain-language
// explanation, a few headline numbers, and a link to the project.
function PartnerCards(props){
  var items=props.items;var t=useLang().t;
  var open=useState(-1),idx=open[0],setIdx=open[1];
  return <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:680,margin:"0 auto"}}>
    {items.map(function(e,i){
      var isOpen=idx===i;
      return <div key={i} style={{borderRadius:R_MD,border:"1px solid "+(isOpen?NX_1:BD),background:WH,overflow:"hidden",transition:"border-color .15s ease, box-shadow .15s ease",boxShadow:isOpen?"0 8px 24px rgba(37,99,235,0.10)":"none"}}>
        <button onClick={function(){setIdx(isOpen?-1:i);}} aria-expanded={isOpen} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",fontFamily:F}}>
          <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:e.bg,border:"1px solid "+BD,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src={e.img} alt={e.name} loading="lazy" style={{width:24,height:24,objectFit:"contain"}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:14,fontWeight:700,color:BK,margin:"0 0 1px",fontFamily:F}}>{e.name}</p>
            <p style={{fontSize:11,color:MT,margin:0,lineHeight:1.3}}>{e.sub}</p>
          </div>
          <span style={{fontSize:14,color:isOpen?NX_1:MT,flexShrink:0,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s ease"}} aria-hidden="true">⌄</span>
        </button>
        {isOpen&&<div style={{padding:"0 16px 16px",borderTop:"1px solid "+BD}}>
          <p style={{fontSize:13.5,color:LT,margin:"14px 0 14px",lineHeight:1.6}}>{e.desc}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {e.facts.map(function(f,fi){return <div key={fi} style={{background:BG,borderRadius:R_SM,padding:"10px 12px",textAlign:"center"}}>
              <p style={{fontSize:17,fontWeight:700,color:NX_1,margin:"0 0 2px",fontFamily:FD,letterSpacing:"-0.5px"}}>{f.v}</p>
              <p style={{fontSize:10,color:MT,margin:0,lineHeight:1.3,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:M}}>{f.k}</p>
            </div>;})}
          </div>
          <a href={e.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,color:NX_1,textDecoration:"none",fontFamily:F}}>{t("Visit")+" "+e.name}<span aria-hidden="true">↗</span></a>
        </div>}
      </div>;
    })}
  </div>;
}

// Name / blurb for a strategy given its max-loss budget (%).
function stratName(ml){return ml<=5?"Protected":ml<=12?"Balanced":ml<=18?"Growth":"High Conviction";}
function stratBlurb(ml){return ml<=5?"Capital-preservation first":ml<=12?"Balanced income and upside":ml<=18?"More upside, capped downside":"Maximum upside within your limit";}
// Read amount / asset / horizon / risk-intent out of a plain-English goal.
function detectIntent(t){
  t=(t||"").toLowerCase();
  var pm=t.match(/(\d{1,2})\s*%/);
  var pct=pm?Math.min(25,Math.max(1,Number(pm[1]))):null;
  var asset=t.indexOf("eth")>=0?"ETH":(t.indexOf("btc")>=0||t.indexOf("bitcoin")>=0)?"BTC":(t.indexOf("sol")>=0?"SOL":null);
  var ym=t.match(/(\d+)\s*year/),mm=t.match(/(\d+)\s*month/);
  var horizon=ym?Math.min(60,12*Number(ym[1])):mm?Math.max(1,Number(mm[1])):12;
  var am=t.replace(/,/g,"").match(/(\d{3,7})\s*(k)?/);
  var amount=am?Math.max(1,Number(am[1])*(am[2]?1000:1)):null;
  var bucket=/protect|safe|preserv|capital|secure|conservativ|don'?t lose|no loss|nervous|cautious|stomach/.test(t)?0
    :/aggressiv|maxim|degen|moon|risk it|high (conviction|growth)|go big|yolo|as much|grow fast|amplif/.test(t)?2:1;
  return {pct:pct,asset:asset,horizon:horizon,amount:amount,bucket:bucket};
}

// "Describe your goal → AI suggests THREE strategies" panel. On submit it fires
// three parallel /api/brain calls (best match for the stated intent + a safer and
// a bolder alternative), then renders ranked strategy cards — each with a plain
// WHY and an expandable per-protocol "where the money goes" breakdown (plus, in
// Pro, the Monte-Carlo analytics + agent debate). Used inside GoalInput.
function GoalSuggest(props){
  var cur=useCurrency();var cs=cur.symbol;var isPro=useMode().isPro;var nav=useNav();var t=useLang().t;
  var sGoal=useState(""),goal=sGoal[0],setGoal=sGoal[1];
  var sAmt=useState(1000),amount=sAmt[0],setAmount=sAmt[1];
  var sAsset=useState("SOL"),asset=sAsset[0],setAsset=sAsset[1];
  var sHor=useState(12),horizon=sHor[0],setHor=sHor[1];
  var sFine=useState(false),fine=sFine[0],setFine=sFine[1];
  var sLoad=useState(false),loading=sLoad[0],setLoading=sLoad[1];
  var sErr=useState(null),err=sErr[0],setErr=sErr[1];
  var sRes=useState(null),pack=sRes[0],setPack=sRes[1];   // {list:[res,res,res], text}
  var sOpen=useState({}),open=sOpen[0],setOpen=sOpen[1];
  var lab={fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 8px"};
  var examples=[t("Grow my")+" "+cs+"10,000 "+t("aggressively over a year"),t("Protect")+" "+cs+"50K "+t("but beat my savings"),t("Play crypto upside with")+" "+cs+"1,000, "+t("cap loss at 15%")];
  function composeFor(ml,a,amt,hor){return "Invest "+cs+amt.toLocaleString()+" in "+a+" over "+hor+" months. Maximum loss "+ml+"%.";}
  function chipBtn(active){return {flex:1,background:active?BK:WH,color:active?WH:LT,border:"1px solid "+(active?BK:BD),borderRadius:R_SM,padding:"8px 0",fontSize:12,fontWeight:600,fontFamily:M,cursor:"pointer"};}

  function suggest(){
    var d=detectIntent(goal);
    var a=d.asset||asset;if(d.asset&&d.asset!==asset)setAsset(d.asset);
    var hor=d.horizon||horizon;if(d.horizon&&d.horizon!==horizon)setHor(d.horizon);
    var amt=d.amount||amount;if(d.amount&&d.amount!==amount)setAmount(d.amount);
    var budgets,matched;
    if(d.pct!=null){budgets=[Math.max(2,d.pct-7),d.pct,Math.min(25,d.pct+8)];matched=1;}
    else{budgets=[3,10,20];matched=d.bucket;}
    setLoading(true);setErr(null);setPack(null);setOpen({});
    Promise.all(budgets.map(function(ml){
      return fetch("/api/brain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal:composeFor(ml,a,amt,hor),asset:a,amount:amt,wallet_address:nav.address})})
        .then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
    })).then(function(arr){
      if(arr&&arr.every(function(x){return x&&x.allocation;})){
        var order=[matched].concat([0,1,2].filter(function(i){return i!==matched;}));
        setPack({list:order.map(function(i){return arr[i];}),text:goal.trim()||composeFor(budgets[matched],a,amt,hor)});
      }else{setErr(t("Could not build strategies — try rephrasing your goal."));}
    }).finally(function(){setLoading(false);});
  }

  function toggleOpen(i){setOpen(function(p){var n=Object.assign({},p);n[i]=!n[i];return n;});}

  function card(res,i){
    var sp=Math.round(res.allocation.safePct),gp=Math.round(res.allocation.growthPct);
    var amt=Number(res.parsed.amount);
    var ml=Math.round(res.parsed.maxDd*100);
    var scn=res.scenarios||[];
    var bull=scn[0],bear=scn[scn.length-1];
    var isMatch=i===0;var isOpen=!!open[i];
    return <div key={i} style={{border:"1px solid "+(isMatch?"var(--nx-1)":BD),borderRadius:R_LG,padding:"18px",marginBottom:12,background:isMatch?"var(--nx-soft)":WH,position:"relative"}}>
      {isMatch&&<span style={{position:"absolute",top:-9,left:16,fontSize:9.5,fontFamily:M,fontWeight:700,color:WH,background:NX_1,borderRadius:R_PILL,padding:"3px 10px",letterSpacing:"0.04em"}}>{t("BEST MATCH FOR YOUR GOAL")}</span>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:isMatch?6:0,marginBottom:12}}>
        <div><p style={{fontSize:16,fontWeight:700,color:BK,margin:"0 0 2px"}}>{t(stratName(ml))}</p><p style={{fontSize:12,color:MT,margin:0}}>{t(stratBlurb(ml))}</p></div>
        <div style={{display:"flex",gap:16,flexShrink:0,alignItems:"flex-start"}}>
          <div style={{textAlign:"right"}}><p style={{fontSize:16,fontFamily:FD,fontWeight:600,color:GN,margin:0,letterSpacing:"-0.4px"}}>{t("Uncapped")}</p><p style={{fontSize:10,color:MT,margin:0,fontFamily:M}}>{t("upside")}</p></div>
          <div style={{textAlign:"right"}}><p style={{fontSize:16,fontFamily:FD,fontWeight:600,color:RD,margin:0,letterSpacing:"-0.4px"}}>{"−"+ml+"%"}</p><p style={{fontSize:10,color:MT,margin:0,fontFamily:M}}>{t("max loss")}</p><p style={{fontSize:9,color:MT,margin:"1px 0 0",fontFamily:M}}>{t("only if")+" "+res.parsed.asset+" → 0"}</p></div>
        </div>
      </div>
      <div style={{display:"flex",gap:2,height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{width:sp+"%",background:NX_GRAD}}/><div style={{width:gp+"%",background:MT}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:12,color:LT}}><b>{sp}%</b> {t("safe")}</span><span style={{fontSize:12,color:MT}}><b>{gp}%</b> {t("growth")}</span></div>
      {bull&&bear&&<div style={{display:"flex",gap:18,marginBottom:12}}>
        <div><p style={{fontSize:15,fontFamily:FD,fontWeight:600,color:GN,margin:0}}>{(bull.pct>=0?"+":"")+bull.pct.toFixed(1)+"%"}</p><p style={{fontSize:10,color:MT,margin:0,fontFamily:M}}>{t(bull.label)+" "+t("upside")}</p></div>
        <div><p style={{fontSize:15,fontFamily:FD,fontWeight:600,color:bear.pct>=0?GN:RD,margin:0}}>{(bear.pct>=0?"+":"")+bear.pct.toFixed(1)+"%"}</p><p style={{fontSize:10,color:MT,margin:0,fontFamily:M}}>{t(bear.label)+" "+t("case")}</p></div>
      </div>}
      {res.reasoning&&<div style={{display:"flex",gap:8,marginBottom:12}}><span style={{fontSize:10,fontFamily:M,color:NX_1,fontWeight:700,flexShrink:0,marginTop:2,letterSpacing:"0.04em"}}>{t("WHY")}</span><p style={{fontSize:12.5,color:LT,lineHeight:1.55,margin:0}}>{res.reasoning}</p></div>}
      <div onClick={function(){toggleOpen(i);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:12,fontWeight:600,color:NX_1,padding:"9px 0 4px",borderTop:"1px solid "+BD}}><span>{t("See where the money goes")}</span><span style={{fontFamily:M,fontSize:11,transform:isOpen?"rotate(180deg)":"none",transition:"transform .15s",display:"inline-block"}}>{"▾"}</span></div>
      {isOpen&&<div style={{paddingTop:10}}>
        <ProtocolRows cur={cur} safePct={sp} growthPct={gp} amount={amt}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,margin:"14px 0 0"}}>{scn.map(function(x,j){var up=x.pct>=0;return <div key={j} style={{background:GY,borderRadius:R_SM,padding:10,textAlign:"center"}}><p style={{fontSize:9,color:MT,margin:"0 0 3px",fontFamily:M}}>{t(x.label)}</p><p style={{fontSize:15,fontWeight:800,color:up?GN:RD,margin:"0 0 1px"}}>{(up?"+":"")+x.pct.toFixed(1)+"%"}</p><p style={{fontSize:10,color:BODY2,margin:0,fontFamily:M}}>{(x.dollars>=0?"+":"")+cur.format(x.dollars)}</p></div>;})}</div>
        <Card style={{background:GY,border:"1px solid "+BD,margin:"12px 0 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:600,color:LT}}>{t("Maximum loss")}</span><span style={{fontSize:12,fontWeight:700,color:BODY2,fontFamily:M}}>{cur.format(res.maxLossUsd)}</span></div></Card>
        {isPro&&<div style={{marginTop:14}}>
          <p style={Object.assign({},lab,{margin:"0 0 8px"})}>{t("Risk analytics · Monte Carlo")}</p>
          <AnalyticsCards mc={res.mc}/>
          <p style={Object.assign({},lab,{margin:"14px 0 8px"})}>{t("AI reasoning · Bull vs Bear")}</p>
          <DebateBlock debate={res.debate}/>
        </div>}
      </div>}
      <Btn black={isMatch} outline={!isMatch} full style={{marginTop:14}} onClick={function(){if(props.onUse)props.onUse(res,pack.text,res.parsed.asset);}}>{isMatch?t("Use this strategy →"):t("Use this instead →")}</Btn>
    </div>;
  }

  return <div style={Object.assign({background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:"clamp(20px,3vw,28px)",boxShadow:SHADOW_MD},props.style||{})}>
    <p style={lab}>{t("I want to invest")}</p>
    <div style={{display:"flex",alignItems:"center",gap:4,border:"1px solid "+BD,borderRadius:R_MD,padding:"14px 18px",background:BG,marginBottom:10}}>
      <span style={{fontSize:30,fontFamily:FD,fontWeight:500,color:MT,letterSpacing:"-1px"}}>{cs}</span>
      <input type="number" min={0} value={amount===0?"":amount} placeholder="0" onChange={function(e){var v=e.target.value;setAmount(v===""?0:Math.max(0,Number(v)||0));}} style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:30,fontFamily:FD,fontWeight:500,color:BK,letterSpacing:"-1px",width:"100%",padding:0}}/>
      <span style={{fontSize:13,fontFamily:M,color:MT}}>USDC</span>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:22}}>{[1000,5000,10000,25000,50000].map(function(a,i){return <button key={i} onClick={function(){setAmount(a);}} style={{background:amount===a?"var(--nx-soft)":WH,color:amount===a?NX_1:LT,border:"1px solid "+(amount===a?"var(--nx-1)":BD),borderRadius:R_PILL,padding:"6px 14px",fontSize:12,fontWeight:600,fontFamily:M,cursor:"pointer"}}>{cs+a.toLocaleString()}</button>;})}</div>

    <p style={lab}>{t("Describe your goal in plain English")}</p>
    <textarea value={goal} onChange={function(e){setGoal(e.target.value);}} placeholder={t("e.g.")+" "+examples[0]} style={{width:"100%",minHeight:80,padding:14,fontSize:15,fontFamily:F,border:"1px solid "+BD,borderRadius:R_MD,resize:"vertical",color:BK,lineHeight:1.5,outline:"none",boxSizing:"border-box",background:BG}}/>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"8px 0 14px"}}>{examples.map(function(ex,i){return <span key={i} onClick={function(){setGoal(ex);}} style={{fontSize:11,color:LT,background:GY,border:"1px solid "+BD,borderRadius:R_PILL,padding:"5px 10px",cursor:"pointer"}}>{ex}</span>;})}</div>

    <p onClick={function(){setFine(!fine);}} style={{fontSize:12,color:LT,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 0 14px"}}><span>{t("Fine-tune asset & horizon")}</span><span style={{fontFamily:M,color:MT}}>{fine?"−":"+"}</span></p>
    {fine&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
      <div><p style={lab}>{t("Growth asset")}</p><div style={{display:"flex",gap:6}}>{["SOL","ETH","BTC"].map(function(a,i){return <button key={i} onClick={function(){setAsset(a);}} style={chipBtn(asset===a)}>{a}</button>;})}</div></div>
      <div><p style={lab}>{t("Horizon")}</p><div style={{display:"flex",gap:6}}>{[3,6,12].map(function(h,i){return <button key={i} onClick={function(){setHor(h);}} style={chipBtn(horizon===h)}>{h+t("m")}</button>;})}</div></div>
    </div>}

    <Btn primary full disabled={loading} onClick={suggest}>{loading?t("Building 3 strategies…"):t("Suggest strategies →")}</Btn>
    {err&&<Card style={{background:TINT_RD_BG,border:"1px solid "+TINT_RD_BD,marginTop:12}}><p style={{fontSize:12,color:RD,margin:0}}>{err}</p></Card>}

    {pack&&<div style={{marginTop:24,paddingTop:22,borderTop:"1px solid "+BD}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
        <span style={{fontSize:13,fontFamily:FD,fontWeight:600,color:BK}}>{t("Three strategies for your goal")}</span>
        {pack.list[0]&&pack.list[0].mode==="fallback"&&<span style={{fontSize:10,fontFamily:M,color:MT}}>{t("deterministic mode")}</span>}
      </div>
      <p style={{fontSize:12,color:MT,margin:"0 0 16px"}}>{t("The best match for what you described, plus a safer and a bolder option — just in case.")}</p>
      {pack.list.map(function(res,i){return card(res,i);})}
    </div>}
  </div>;
}

// Protocol-level "build a strategy from the rails up" constructor (marketing demo).
function StrategyConstructor(props){
  var cur=props.cur;var cs=cur.symbol;var deployable=!!props.deployable;var t=useLang().t;
  var sW=useState({kamino:40,stable:0,jito:25,jupiter:20,options:15}),w=sW[0],setW=sW[1];
  var sA=useState(props.defaultAmount||10000),amount=sA[0],setAmount=sA[1];
  var sAs=useState("SOL"),asset=sAs[0],setAsset=sAs[1];
  function setKey(k,v){setW(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  var b=blend(w,amount);
  var balanced=Math.round(b.total)===100;
  function deploy(){
    if(!balanced||!props.onDeploy)return;
    var safeW=(Number(w.kamino)||0)+(Number(w.stable)||0)+(Number(w.jito)||0);
    var growthW=(Number(w.jupiter)||0)+(Number(w.options)||0);
    var tot=safeW+growthW||1;
    var growthPct=Math.round(growthW/tot*100);var safePct=100-growthPct;
    var ddAbs=Math.abs(b.downside);
    var maxDd=Math.max(0.01,Math.round(ddAbs)/100);
    var exp=Math.round(b.apy*10)/10;
    var bull=Math.round(b.apy*1.6*10)/10;
    var bear=-Math.round(ddAbs*10)/10;
    var scenarios=[
      {label:"Bull",pct:bull,dollars:Math.round(amount*bull/100)},
      {label:"Expected",pct:exp,dollars:Math.round(amount*exp/100)},
      {label:"Bear",pct:bear,dollars:Math.round(amount*bear/100)},
    ];
    var legs=PROTOCOLS.filter(function(pr){return (Number(w[pr.key])||0)>0;}).map(function(pr){return pr.name;});
    var brain={
      mode:"manual",
      parsed:{amount:amount,asset:asset,maxDd:maxDd,riskScore:Math.min(100,Math.round(ddAbs*5)),horizonDays:365},
      allocation:{safePct:safePct,growthPct:growthPct,safe:Math.round(amount*safePct/100),growth:Math.round(amount*growthPct/100)},
      scenarios:scenarios,mc:null,debate:null,guardrails:null,
      reasoning:"You built this allocation yourself across "+legs.join(", ")+". Blended target return "+b.apy.toFixed(1)+"% with an estimated "+ddAbs.toFixed(1)+"% downside on "+cur.format(amount)+".",
      maxLossUsd:Math.round(amount*ddAbs/100),
    };
    var goalText="Custom allocation — "+legs.join(", ")+" · "+cs+amount.toLocaleString()+" in "+asset+".";
    props.onDeploy(brain,goalText,asset);
  }
  return <Card elev>
    {deployable&&<div style={{marginBottom:18}}>
      <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 8px"}}>{t("Amount to deploy")}</p>
      <div style={{display:"flex",alignItems:"center",gap:4,border:"1px solid "+BD,borderRadius:R_MD,padding:"10px 14px",background:BG,marginBottom:10}}>
        <span style={{fontSize:22,fontFamily:FD,fontWeight:500,color:MT}}>{cs}</span>
        <input type="number" min={0} value={amount===0?"":amount} placeholder="0" onChange={function(e){var v=e.target.value;setAmount(v===""?0:Math.max(0,Number(v)||0));}} style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:22,fontFamily:FD,fontWeight:500,color:BK,width:"100%",padding:0}}/>
        <span style={{fontSize:12,fontFamily:M,color:MT}}>USDC</span>
      </div>
      <div style={{display:"flex",gap:6}}>{["SOL","ETH","BTC"].map(function(a){var on=asset===a;return <button key={a} onClick={function(){setAsset(a);}} style={{flex:1,background:on?BK:WH,color:on?WH:LT,border:"1px solid "+(on?BK:BD),borderRadius:R_SM,padding:"7px 0",fontSize:12,fontWeight:600,fontFamily:M,cursor:"pointer"}}>{a}</button>;})}</div>
    </div>}
    {PROTOCOLS.map(function(pr){return <div key={pr.key} style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:600,color:BK}}>{pr.name} <span style={{fontSize:11,color:MT,fontWeight:400}}>· {pr.kind} · {pr.apy}% APY</span></span>
        <span style={{fontSize:13,fontFamily:M,fontWeight:700,color:NX_1}}>{w[pr.key]}%</span>
      </div>
      <input type="range" min={0} max={100} value={w[pr.key]} onChange={function(e){setKey(pr.key,Number(e.target.value));}} style={{width:"100%",accentColor:"#2563EB"}}/>
    </div>;})}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
      <Stat n={b.apy.toFixed(1)+"%"} d={t("Blended APY")} c={NX_1}/>
      <Stat n={b.downside.toFixed(1)+"%"} d={t("Est. downside")} c={RD}/>
      <Stat n={"+"+cur.format(b.income12m)} d={t("Projected 12-mo income")} c={GN}/>
      <Stat n={"−"+cur.format(Math.abs(b.stressLoss))} d={t("Stress-case loss")} c={RD}/>
    </div>
    <p style={{fontSize:11,fontFamily:M,color:balanced?MT:RD,margin:"14px 0 0",textAlign:"center"}}>{t("Total weight")+" "+b.total+"%"+(balanced?"":" — "+t("adjust to 100%"))}</p>
    {deployable&&<Btn black full disabled={!balanced} style={{marginTop:14}} onClick={deploy}>{balanced?(t("Deploy")+" "+cur.format(amount)+" →"):t("Adjust weights to 100%")}</Btn>}
  </Card>;
}

// Interactive "How it works" — auto-advancing stepper with a live per-step preview panel.
function HowItWorks(props){
  var cur=props.cur;var s=cur.symbol;var t=useLang().t;
  var sa=useState(0),active=sa[0],setActive=sa[1];
  var sh=useState(false),hover=sh[0],setHover=sh[1];
  var steps=[
    {n:"01",t:t("Say your goal"),d:t("Type it in plain English. No jargon, no forms — just what you want your money to do.")},
    {n:"02",t:t("AI builds it"),d:t("Seven agents debate Bull vs Bear, run 10,000 simulations, then a PM allocates within your risk budget.")},
    {n:"03",t:t("Deploy in one click"),d:t("Review the scenarios and downside, then deploy to an isolated on-chain vault you control.")},
    {n:"04",t:t("AI manages 24/7"),d:t("Monitoring, rebalancing and compounding around the clock. Withdraw anytime, no lockups.")},
  ];
  useEffect(function(){
    if(hover)return;
    var id=setInterval(function(){setActive(function(a){return (a+1)%4;});},3800);
    return function(){clearInterval(id);};
  },[hover]);
  var chart=[42,44,43,47,52,50,56,54,61,59,66,71];
  function panel(){
    if(active===0)return <div>
      <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.06em",margin:"0 0 10px"}}>{t("YOUR GOAL")}</p>
      <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_MD,padding:"16px 18px",fontSize:16,color:BK,lineHeight:1.5,boxShadow:SHADOW_SM}}>
        {"\""+t("Grow")+" "+s+"10,000 "+t("steadily over a year without risking more than I can stomach.")+"\""}
        <span style={{display:"inline-block",width:2,height:18,background:NX_1,marginLeft:2,verticalAlign:"-3px",animation:"nxblink 1s steps(2) infinite"}}/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
        {[t("Steady growth"),t("12-month horizon"),t("Capped downside")].map(function(c,i){return <span key={i} style={{fontSize:12,fontFamily:M,color:NX_1,background:"var(--nx-soft)",border:"1px solid "+BD,borderRadius:R_PILL,padding:"4px 12px"}}>{c}</span>;})}
      </div>
    </div>;
    if(active===1)return <div>
      <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.06em",margin:"0 0 12px"}}>{t("AGENT DEBATE")}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:TINT_GN_BG,border:"1px solid "+TINT_GN_BD,borderRadius:R_MD,padding:"12px 14px"}}>
          <p style={{fontSize:12,fontWeight:700,color:GN,margin:"0 0 4px"}}>{t("Bull")+" · 72%"}</p>
          <p style={{fontSize:12,color:LT,margin:0,lineHeight:1.45}}>{t("Lending yields stable; add a growth sleeve for upside.")}</p>
        </div>
        <div style={{background:TINT_RD_BG,border:"1px solid "+TINT_RD_BD,borderRadius:R_MD,padding:"12px 14px"}}>
          <p style={{fontSize:12,fontWeight:700,color:RD,margin:"0 0 4px"}}>{t("Bear")+" · 28%"}</p>
          <p style={{fontSize:12,color:LT,margin:0,lineHeight:1.45}}>{t("Cap directional exposure; enforce the max-loss budget.")}</p>
        </div>
      </div>
      <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.06em",margin:"0 0 8px"}}>{t("ALLOCATION")}</p>
      <div style={{display:"flex",height:14,borderRadius:R_PILL,overflow:"hidden",border:"1px solid "+BD}}>
        <div style={{width:"65%",background:NX_1}}/>
        <div style={{width:"35%",background:NX_2}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,fontFamily:M}}>
        <span style={{color:NX_1}}>{"65% "+t("Safe")}</span><span style={{color:NX_2}}>{"35% "+t("Growth")}</span>
      </div>
    </div>;
    if(active===2)return <div>
      <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.06em",margin:"0 0 12px"}}>{t("SCENARIOS · 1 YEAR")}</p>
      {[{l:t("Best case"),v:"+18.2%",c:GN},{l:t("Expected"),v:"+14.6%",c:NX_1},{l:t("Worst case"),v:"−2.4%",c:RD}].map(function(r,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<2?"1px solid "+BD:"none"}}>
        <span style={{fontSize:13,color:LT}}>{r.l}</span>
        <span style={{fontSize:15,fontFamily:M,fontWeight:700,color:r.c}}>{r.v}</span>
      </div>;})}
      <button style={{width:"100%",marginTop:16,background:BK,color:WH,border:"none",borderRadius:R_MD,padding:"13px",fontSize:14,fontWeight:600,fontFamily:F,cursor:"pointer"}}>{t("Deploy on-chain →")}</button>
      <p style={{fontSize:11,fontFamily:M,color:MT,textAlign:"center",margin:"10px 0 0"}}>{t("Isolated vault · only your wallet can withdraw")}</p>
    </div>;
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.06em",margin:0}}>{t("LIVE PERFORMANCE")}</p>
        <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontFamily:M,color:GN}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:GN,animation:"nxpulse 1.6s ease-in-out infinite"}}/>{t("ACTIVE")}
        </span>
      </div>
      <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_MD,padding:"16px",boxShadow:SHADOW_SM}}>
        <MiniChart data={chart} w={260} h={64} c={NX_1}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
        <div><p style={{fontSize:11,color:MT,margin:"0 0 2px"}}>{t("Value")}</p><p style={{fontSize:16,fontFamily:M,fontWeight:700,color:BK,margin:0}}>{cur.format(11460)}</p></div>
        <div><p style={{fontSize:11,color:MT,margin:"0 0 2px"}}>{t("Rebalanced")}</p><p style={{fontSize:16,fontFamily:M,fontWeight:700,color:GN,margin:0}}>{"4"+t("h")+" "+t("ago")}</p></div>
      </div>
    </div>;
  }
  return <div onMouseEnter={function(){setHover(true);}} onMouseLeave={function(){setHover(false);}} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"stretch"}} className="nx-hero">
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {steps.map(function(st,i){var on=i===active;return <button key={i} onClick={function(){setActive(i);}} style={{textAlign:"left",cursor:"pointer",background:on?WH:"transparent",border:"1px solid "+(on?NX_1:BD),borderRadius:R_LG,padding:"18px 20px",position:"relative",overflow:"hidden",transition:"border-color .2s,background .2s",boxShadow:on?SHADOW_SM:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{flexShrink:0,width:34,height:34,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:M,fontSize:13,fontWeight:700,color:on?WH:NX_1,background:on?NX_1:"var(--nx-soft)",border:"1px solid "+(on?NX_1:BD)}}>{st.n}</span>
          <span style={{fontSize:16,fontWeight:600,color:on?BK:LT,letterSpacing:"-0.2px"}}>{st.t}</span>
        </div>
        {on&&<p style={{fontSize:13.5,color:LT,margin:"12px 0 0",lineHeight:1.55,paddingLeft:46}}>{st.d}</p>}
        {on&&<div style={{position:"absolute",left:0,bottom:0,height:3,width:"100%",background:BD}}><div style={{height:"100%",background:NX_GRAD,animation:hover?"none":"nxfill 3.8s linear"}}/></div>}
      </button>;})}
    </div>
    <div style={{background:BG,border:"1px solid "+BD,borderRadius:R_LG,padding:"24px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
      {panel()}
    </div>
  </div>;
}

// ━━━ CONSUMER SCREENS ━━━
// Animated Lite/Pro experience switch. A black indicator slides between the two
// options (spring easing) while the labels cross-fade — the same control drives
// the global [data-mode] skin via useMode().
function ModeSwitch(){
  var m=useMode();var isPro=m.mode==="pro";var OPT_W=68;
  return <div style={{position:"relative",display:"inline-flex",background:GY,border:"1px solid "+BD,borderRadius:R_PILL,padding:3}}>
    <div style={{position:"absolute",top:3,bottom:3,left:3+(isPro?OPT_W:0),width:OPT_W,background:BK,borderRadius:R_PILL,boxShadow:SHADOW_SM,transition:"left .42s cubic-bezier(.16,1,.3,1)"}}/>
    {["lite","pro"].map(function(opt){
      var on=(opt==="pro")===isPro;
      return <span key={opt} onClick={function(){m.setMode(opt);}} style={{position:"relative",zIndex:1,width:OPT_W,textAlign:"center",fontSize:12,fontFamily:M,fontWeight:600,letterSpacing:"0.02em",textTransform:"capitalize",color:on?WH:LT,padding:"7px 0",cursor:"pointer",userSelect:"none",transition:"color .3s ease"}}>{opt}</span>;
    })}
  </div>;
}

export function Landing(p){
  var sf=useState(-1),faq=sf[0],setFaq=sf[1];
  var cur=useCurrency();var s=cur.symbol;var t=useLang().t;
  var stats=[{n:"14.6%",d:t("Avg target return")},{n:"≤13%",d:t("Max downside")},{n:"4+",d:t("Vetted protocols")},{n:s+"100",d:t("Minimum")}];
  var validators=[{n:t("4th place"),d:"Superteam Ireland"},{n:"5,400+",d:t("Hackathon submissions")},{n:"20+",d:t("Investor conversations")},{n:"Solana",d:t("Built on-chain")}];
  var rows=[[t("Minimum"),s+"100",s+"1M+",s+"0",t("Any")],[t("Personalized"),"AI",t("Manual"),t("No"),t("No")],[t("Downside protection"),t("Yes"),t("Sometimes"),t("Yes"),t("No")],[t("Fees"),"0.75%","2-5%","0%",t("Gas")],[t("AI-managed"),t("Yes"),t("No"),t("No"),t("No")],["24/7",t("Yes"),t("No"),t("No"),t("Manual")]];
  var faqs=[
    {q:t("Is my money safe?"),a:t("Your principal sits in a separate safe leg (e.g. Kamino lending). Only a small budget you set is exposed to growth, and 5 deterministic guardrails enforce your max loss — both off-chain (Monte Carlo VaR check) and on-chain (Anchor vault assertion).")},
    {q:t("How does the AI work?"),a:t("7 agents parse your goal, run 10,000 Monte Carlo simulations, debate Bull vs Bear, then a PM agent allocates — all validated by deterministic guardrails before anything goes on-chain. The LLM cannot exceed your risk budget; the math overrides it if it tries.")},
    {q:t("What are the fees?"),a:t("0.75%/yr management + 10% of performance. No hidden spreads, no entry/exit fees. Far below private banking's 2-5% all-in fee.")},
    {q:t("Can I withdraw anytime?"),a:t("Yes. No lockups. Withdrawals are always available on-chain through the same vault. There's no minimum holding period.")},
    {q:t("What if crypto crashes?"),a:t("In a -40% crash the growth leg may zero, but the safe leg's yield covers most of it — net loss stays within the limit you set (often ~2-3%), vs -40% holding directly. We log every realized outcome so you can see the model's track record.")},
    {q:t("What's the minimum?"),a:s+"100. "+t("We built Norvex specifically to remove the private-banking gatekeeping. Real personalized investing should not need")+" "+s+"1M "+t("to access.")},
    {q:t("Who has custody of my funds?"),a:t("You do. Norvex never holds your funds. All assets sit in isolated on-chain vaults that only your wallet can withdraw from. Norvex orchestrates strategy; you keep the keys.")},
    {q:t("What's the difference vs. a robo-advisor?"),a:t("Robo-advisors pick a static portfolio of stocks/ETFs. Norvex parses your goal in plain English, debates strategy with multi-agent AI, and enforces a hard max-loss budget via on-chain guardrails — every cycle, not annually.")},
    {q:t("Is it regulated?"),a:t("Norvex's B2B model is the regulated wedge — the partner (bank/wallet/neobank) holds the license. The consumer product is in regulated preview; full MiCA-aligned launch is planned with a licensed partner.")},
  ];
  var gradTextStyle={backgroundImage:NX_GRAD,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",WebkitTextFillColor:"transparent"};

  // Reference-site marketing sections.
  var riskProfiles=[
    {name:t("Conservative"),range:"8–15%",sub:t("Principal protection first. Yield-bearing safe legs with a thin growth sleeve."),accent:GN},
    {name:t("Moderate"),range:"12–18%",sub:t("Balanced income and upside. The most popular starting point."),accent:NX_1,rec:true},
    {name:t("Aggressive"),range:"20%+",sub:t("Amplified, capped upside. Larger growth sleeve, hard max-loss still enforced."),accent:AM},
  ];
  var neobankSteps=[
    {n:"L1",t:t("User app"),d:t("Your branded mobile or web app.")},
    {n:"L2",t:t("Norvex AI layer"),d:t("Goal parsing + multi-agent strategy.")},
    {n:"L3",t:t("Strategy engine"),d:t("Monte Carlo + deterministic guardrails.")},
    {n:"L4",t:t("Execution layer"),d:t("Order routing and rebalancing.")},
    {n:"L5",t:t("Web3 rails"),d:t("On-chain vaults on Solana.")},
  ];
  var partners=[{src:"/svg/revolut-wordmark.svg",h:14,filter:"invert(1) brightness(1.6)"},{src:"/svg/binance.svg",h:18,filter:"brightness(1.1)"},{src:"/svg/Phantom-logo-purple.svg",h:16,filter:"brightness(1.2)"},{src:"/svg/solana-logo.svg",h:13,filter:"none"}];
  var trustBlocks=[
    {t:t("Defined downside"),d:t("Every strategy enforces a hard max-loss budget — in math and on-chain.")},
    {t:t("Diversified protocols"),d:t("Funds spread across vetted lending, staking and structured venues.")},
    {t:t("AI monitoring"),d:t("Positions are monitored, rebalanced and compounded 24/7.")},
    {t:t("Transparent on-chain"),d:t("Allocations commit to isolated vaults with a public audit trail.")},
  ];
  var ecosystem=[
    {img:"/svg/kamino.svg",name:"Kamino",sub:t("Interest on your holdings"),bg:"#FFFFFF",url:"https://kamino.finance",
      desc:t("A lending platform that functions much like a savings account. Your funds are lent to borrowers who pledge more collateral than they receive, generating consistent interest with no fixed lock-up period."),
      facts:[{v:"~$2B",k:t("Assets on platform")},{v:"8.5%",k:t("Typical annual return")},{v:t("Audited"),k:t("Independently reviewed")}]},
    {img:"/svg/jito.svg",name:"Jito",sub:t("Rewards for securing the network"),bg:"#FFFFFF",url:"https://jito.network",
      desc:t("Allocates your Solana holdings to help operate and secure the network, earning rewards in return. Funds remain accessible and may be withdrawn at any time."),
      facts:[{v:"~$2.5B",k:t("Assets held")},{v:"7.8%",k:t("Annual reward")},{v:t("Anytime"),k:t("Withdrawals")}]},
    {img:"/svg/jupiter.svg",name:"Jupiter",sub:t("Best-price trade execution"),bg:"#FFFFFF",url:"https://jup.ag",
      desc:t("A price-comparison engine for transactions. It evaluates every marketplace simultaneously and routes each trade through the most cost-effective option, ensuring optimal pricing."),
      facts:[{v:"$1T+",k:t("Volume processed")},{v:t("Optimal"),k:t("Pricing")},{v:"0",k:t("Hidden fees")}]},
    {img:"/svg/pyth.svg",name:"Pyth",sub:t("Accurate market pricing"),bg:"#FFFFFF",url:"https://pyth.network",
      desc:t("A real-time pricing service that aggregates live market data from leading trading firms, ensuring every position is valued accurately at all times."),
      facts:[{v:"500+",k:t("Prices tracked")},{v:"<1s",k:t("Update interval")},{v:"100+",k:t("Data sources")}]},
    {img:"/svg/zeta.svg",name:"Zeta",sub:t("Downside protection"),bg:"#FFFFFF",url:"https://zeta.markets",
      desc:t("Provides protective contracts that limit potential losses or generate additional income — the same risk-management instruments used by institutional desks."),
      facts:[{v:t("Capped"),k:t("Downside risk")},{v:"~14%",k:t("Income potential")},{v:t("Transparent"),k:t("On-record")}]},
    {img:"/svg/raydium.svg",name:"Raydium",sub:t("Instant trade settlement"),bg:"#FFFFFF",url:"https://raydium.io",
      desc:t("Maintains deep pools of capital that enable trades to settle instantly and smoothly, minimising price impact when entering or exiting positions."),
      facts:[{v:"$1B+",k:t("Pooled capital")},{v:t("Instant"),k:t("Settlement")},{v:t("Leading"),k:t("Solana venue")}]},
    {img:"/svg/solana-mark.svg",name:"Solana",sub:t("The underlying network"),bg:"#FFFFFF",url:"https://solana.com",
      desc:t("The high-performance network underpinning the platform. Transactions are confirmed in under a second at a cost of less than one cent each."),
      facts:[{v:"~0.4s",k:t("Confirmation time")},{v:"<$0.01",k:t("Per transaction")},{v:"65k",k:t("Transactions / sec")}]},
  ];
  function applyStrategy(resObj,text,a){if(typeof window!=="undefined"){sessionStorage.setItem("norvex_goal",text);sessionStorage.setItem("norvex_asset",a);sessionStorage.removeItem("norvex_pf_name");sessionStorage.setItem("norvex_brain",JSON.stringify(resObj));}p.setScreen(S.PREVIEW);}


  return <div style={{padding:"0 20px"}}>
    {/* Experience switch — Lite (guided) vs Pro (full depth + premium skin) */}
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:10,padding:"24px 0 4px"}}>
      <span style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.12em",textTransform:"uppercase"}}>{t("Choose your experience")}</span>
      <ModeSwitch/>
    </div>
    {/* HERO — light two-column, marketing site style */}
    <div style={{margin:"24px 0 16px",borderRadius:R_LG,background:"var(--gy)",backgroundImage:"var(--dot-grid)",border:"1px solid "+BD,padding:"clamp(40px,7vw,72px) clamp(24px,4vw,48px)",display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:40,alignItems:"center"}} className="nx-hero">
      {/* Left: headline + CTAs */}
      <div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:WH,border:"1px solid "+BD,borderRadius:R_PILL,padding:"5px 14px",marginBottom:24}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:GN,flexShrink:0}}/>
          <span style={{fontSize:12,fontFamily:M,color:LT,letterSpacing:"0.01em"}}>{t("Now in private beta · AI-structured investing")}</span>
        </div>
        <h1 style={{fontFamily:FD,fontSize:"clamp(34px,5.4vw,60px)",fontWeight:500,lineHeight:1.04,letterSpacing:"-1.6px",margin:"0 0 22px",color:BK}}>
          <span style={{display:"block"}}>{t("Your private banker.")}</span>
          <span style={Object.assign({display:"block"},gradTextStyle)}>{t("Built by AI.")}</span>
        </h1>
        <p style={{fontSize:17,color:LT,margin:"0 0 32px",lineHeight:1.55,maxWidth:480}}>
          {t("Tell it your goal in plain English. It builds a portfolio with protected downside and real upside. Starting at")+" "+s+"100."}
        </p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn primary onClick={function(){p.go&&p.go("/demo");}}>{t("Start now")}</Btn>
        </div>
      </div>
      {/* Right: live preview card */}
      <div style={{background:WH,borderRadius:R_LG,border:"1px solid "+BD,padding:24,boxShadow:SHADOW_MD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:10,fontFamily:M,color:MT,letterSpacing:"0.14em",textTransform:"uppercase"}}>{t("LIVE STRATEGY PREVIEW")}</span>
          <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontFamily:M,color:GN,fontWeight:600}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:GN,flexShrink:0}}/>
            {t("Monitored")}
          </span>
        </div>
        <p style={{fontSize:12,color:LT,margin:"0 0 4px"}}>{t("Protected Growth")+" · "+s+"10,000"}</p>
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:16}}>
          <span style={{fontSize:36,fontWeight:500,letterSpacing:"-0.8px",color:NX_1,fontFamily:FD}}>+11.4%</span>
          <span style={{fontSize:12,color:RD,fontFamily:M,fontWeight:600}}>{t("Max downside")+" −3.8%"}</span>
        </div>
        <svg viewBox="0 0 300 60" style={{width:"100%",height:56,marginBottom:16}}>
          <defs><linearGradient id="hero-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--nx-1)" stopOpacity="0.18"/><stop offset="100%" stopColor="var(--nx-1)" stopOpacity="0"/></linearGradient></defs>
          <polygon points="0,55 30,52 60,50 90,47 120,44 150,40 180,35 210,28 240,22 270,16 300,10 300,60 0,60" fill="url(#hero-chart-fill)"/>
          <polyline points="0,55 30,52 60,50 90,47 120,44 150,40 180,35 210,28 240,22 270,16 300,10" fill="none" stroke="var(--nx-1)" strokeWidth={2}/>
        </svg>
        {[{l:"Kamino · "+t("stable yield"),p:40},{l:"Jito · "+t("staking"),p:25},{l:"Jupiter · "+t("upside"),p:20},{l:t("Options overlay"),p:15}].map(function(a,i){return <div key={i} style={{marginBottom:i<3?10:0}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:11,color:LT}}>{a.l}</span>
            <span style={{fontSize:11,fontFamily:M,fontWeight:600,color:BK}}>{a.p}%</span>
          </div>
          <div style={{height:4,borderRadius:2,background:GY,overflow:"hidden"}}><div style={{width:a.p+"%",height:"100%",background:NX_GRAD,borderRadius:2}}/></div>
        </div>;})}
      </div>
    </div>

    {/* STATS row — plain large numbers */}
    <div style={{display:"flex",gap:48,padding:"32px 0 40px",flexWrap:"wrap",borderBottom:"1px solid "+BD}}>
      {stats.map(function(st,i){return <div key={i}>
        <p style={{fontSize:40,fontWeight:500,margin:"0 0 4px",letterSpacing:"-1px",fontFamily:FD,color:i%2===0?NX_1:BK}}>{st.n}</p>
        <p style={{fontSize:13,color:MT,margin:0,fontFamily:F}}>{st.d}</p>
      </div>;})}
    </div>

    {/* HOW IT WORKS — white cards, blue step numbers */}
    <div style={{padding:"72px 0 8px"}}>
      <Label>{t("HOW IT WORKS")}</Label>
      <h2 style={{fontFamily:FD,fontSize:"clamp(28px,3.6vw,40px)",fontWeight:500,letterSpacing:"-1px",margin:"0 0 8px",color:BK,lineHeight:1.1}}>{t("Four steps from a sentence to a strategy.")}</h2>
      <p style={{fontSize:16,color:LT,margin:"0 0 32px",lineHeight:1.55,maxWidth:560}}>{t("Norvex turns plain-English goals into structured, automated investment products. Click a step to see it.")}</p>
      <HowItWorks cur={cur}/>
    </div>

    {/* RISK PROFILES */}
    <div style={{padding:"72px 0 8px"}}>
      <Label>{t("RISK PROFILES")}</Label>
      <h2 style={{fontFamily:FD,fontSize:"clamp(28px,3.6vw,40px)",fontWeight:500,letterSpacing:"-1px",margin:"0 0 8px",color:BK,lineHeight:1.1}}>{t("Pick how much risk fits you.")}</h2>
      <p style={{fontSize:16,color:LT,margin:"0 0 32px",lineHeight:1.55,maxWidth:560}}>{t("Every profile enforces a hard, deterministic max-loss budget. You choose the upside.")}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
        {riskProfiles.map(function(rp,i){return <div key={i} style={{background:WH,border:"1px solid "+(rp.rec?NX_1:BD),borderRadius:R_LG,padding:"28px 24px",position:"relative"}}>
          {rp.rec&&<span style={{position:"absolute",top:16,right:16,fontSize:10,fontFamily:M,color:NX_1,background:"var(--nx-soft)",border:"1px solid "+NX_1,borderRadius:R_PILL,padding:"2px 8px",fontWeight:600}}>{t("POPULAR")}</span>}
          <p style={{fontSize:15,fontWeight:600,color:BK,margin:"0 0 6px"}}>{rp.name}</p>
          <p style={{fontFamily:FD,fontSize:34,fontWeight:500,letterSpacing:"-1px",color:rp.accent,margin:"0 0 4px"}}>{rp.range}</p>
          <p style={{fontSize:11,fontFamily:M,color:MT,margin:"0 0 14px",letterSpacing:"0.04em",textTransform:"uppercase"}}>{t("Target annual return")}</p>
          <p style={{fontSize:14,color:LT,margin:0,lineHeight:1.55}}>{rp.sub}</p>
        </div>;})}
      </div>
    </div>

    {/* WHY BLOCKCHAIN — concept orbit + protocols we work with */}
    <div style={{padding:"72px 0 8px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <Label>{t("WHY BLOCKCHAIN")}</Label>
        <h2 style={{fontFamily:FD,fontSize:"clamp(28px,3.6vw,40px)",fontWeight:500,letterSpacing:"-1px",margin:"0 0 8px",color:BK,lineHeight:1.1}}>{t("Built on the best of blockchain.")}</h2>
        <p style={{fontSize:16,color:LT,margin:0,lineHeight:1.55}}>{t("The properties that let an AI invest on your behalf — trustless, transparent and composable — without you ever giving up the keys.")}</p>
      </div>
      <div style={{position:"relative",width:"100%",maxWidth:560,aspectRatio:"1 / 1",margin:"0 auto"}}>
        <svg viewBox="0 0 100 100" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
          <defs><marker id="eco_arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill={MT}/></marker></defs>
          <circle cx={50} cy={50} r={40} fill="none" stroke={BD} strokeWidth={0.3} strokeDasharray="0.6 1.6"/>
          <circle cx={50} cy={50} r={15} fill="none" stroke={BD} strokeWidth={0.3} opacity={0.7}/>
          <circle cx={50} cy={50} r={19} fill="none" stroke={BD} strokeWidth={0.3} opacity={0.4}/>
          {[0,1,2,3,4,5].map(function(i){
            var r3=function(v){return Math.round(v*1000)/1000;};
            var a=(-90+i*60)*Math.PI/180,nx=r3(50+40*Math.cos(a)),ny=r3(50+40*Math.sin(a)),ix=r3(50+21*Math.cos(a)),iy=r3(50+21*Math.sin(a));
            var da=(-60+i*60)*Math.PI/180,bx=r3(50+40*Math.cos(da)),by=r3(50+40*Math.sin(da));
            return <g key={i}>
              <line x1={nx} y1={ny} x2={ix} y2={iy} stroke={MT} strokeWidth={0.3} strokeDasharray="0.8 1.4" markerEnd="url(#eco_arrow)"/>
              <circle cx={bx} cy={by} r={0.8} fill={NX_1}/>
            </g>;
          })}
        </svg>
        {/* center node */}
        <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",textAlign:"center",zIndex:2}}>
          <div style={{width:"clamp(64px,13vw,84px)",height:"clamp(64px,13vw,84px)",borderRadius:"50%",background:WH,border:"1px solid "+BD,boxShadow:SHADOW_LG,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
            <span style={{fontFamily:FD,fontSize:"clamp(26px,5vw,34px)",fontWeight:600,letterSpacing:"0.04em",color:"#1a2a4f",lineHeight:1}}>N</span>
          </div>
          <p style={{fontSize:13,fontWeight:700,letterSpacing:"0.14em",color:"#1a2a4f",fontFamily:FD,margin:"10px 0 2px"}}>NORVEX</p>
          <p style={{fontSize:10,color:MT,margin:0,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:M}}>{t("Intelligent investing layer")}</p>
        </div>
        {/* concept nodes */}
        {[{t:t("Security"),n:"lock",bg:"#0F1115",c:"#fff"},{t:t("Liquidity"),n:"droplet",bg:"#7C3AED",c:"#fff"},{t:t("Interoperability"),n:"rings",bg:"#FFFFFF",c:""},{t:t("Auditability"),n:"eye",bg:"#13284B",c:"#fff"},{t:t("Efficiency"),n:"bolt",bg:"#13284B",c:"#fff"},{t:t("Ownership"),n:"person",bg:"#0F1115",c:"#fff"}].map(function(nd,i){
          var r3=function(v){return Math.round(v*1000)/1000;};
          var a=(-90+i*60)*Math.PI/180,x=r3(50+40*Math.cos(a)),y=r3(50+40*Math.sin(a));
          return <div key={i} style={{position:"absolute",left:x+"%",top:y+"%",transform:"translate(-50%,-50%)",textAlign:"center",width:96,zIndex:2}}>
            <div style={{width:48,height:48,borderRadius:"50%",margin:"0 auto 7px",background:nd.bg,border:"1px solid "+BD,boxShadow:SHADOW_MD,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <BIcon n={nd.n} c={nd.c} s={24} w={1.9}/>
            </div>
            <p style={{fontSize:11,fontWeight:700,fontFamily:M,letterSpacing:"0.05em",textTransform:"uppercase",color:MT,margin:0,lineHeight:1.3}}>{nd.t}</p>
          </div>;
        })}
      </div>

      {/* PROTOCOLS WE WORK WITH — expandable partner cards */}
      <div style={{marginTop:48,textAlign:"center"}}>
        <Label>{t("PROTOCOLS WE WORK WITH")}</Label>
        <p style={{fontSize:14,color:LT,margin:"4px 0 20px",lineHeight:1.55}}>{t("Vetted, audited venues your strategy routes through. Tap any one to see what it does.")}</p>
      </div>
      <PartnerCards items={ecosystem}/>
    </div>

    {/* COMPARE — light white table */}
    <div style={{margin:"72px 0 0",borderRadius:R_LG,border:"1px solid "+BD,overflow:"hidden",boxShadow:"none"}}>
      <div style={{padding:"24px 24px 16px"}}>
        <Label>{t("HOW NORVEX COMPARES")}</Label>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr repeat(4, 1fr)",alignItems:"center",padding:"12px 24px",background:GY,borderTop:"1px solid "+BD,borderBottom:"1px solid "+BD}}>
        <span style={{fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.08em",textTransform:"uppercase"}}>{t("Feature")}</span>
        <span style={{fontSize:13,fontWeight:800,textAlign:"center",backgroundImage:NX_GRAD,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",WebkitTextFillColor:"transparent"}}>Norvex</span>
        <span style={{fontSize:12,fontWeight:600,color:LT,textAlign:"center"}}>{t("Private Bank")}</span>
        <span style={{fontSize:12,fontWeight:600,color:LT,textAlign:"center"}}>{t("Savings")}</span>
        <span style={{fontSize:12,fontWeight:600,color:LT,textAlign:"center"}}>{t("Direct Crypto")}</span>
      </div>
      {rows.map(function(r,i){return <div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr repeat(4, 1fr)",alignItems:"center",padding:"13px 24px",borderBottom:i<rows.length-1?"1px solid "+GY:"none",background:WH}}>
        <span style={{fontSize:13,color:BK,fontWeight:600}}>{r[0]}</span>
        <span style={{fontSize:13,fontWeight:700,fontFamily:M,textAlign:"center",backgroundImage:NX_GRAD,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",WebkitTextFillColor:"transparent"}}>{r[1]}</span>
        <span style={{fontSize:13,color:MT,fontFamily:M,textAlign:"center"}}>{r[2]}</span>
        <span style={{fontSize:13,color:MT,fontFamily:M,textAlign:"center"}}>{r[3]}</span>
        <span style={{fontSize:13,color:MT,fontFamily:M,textAlign:"center"}}>{r[4]}</span>
      </div>;})}
    </div>

    {/* NEOBANK FLOW — dark strip with L1–L5 + partner logos */}
    <div style={{margin:"72px 0 0",borderRadius:R_LG,background:BK,padding:"48px 32px",overflow:"hidden"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <p style={{fontSize:11,fontFamily:F,color:NX_2,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>{t("FOR NEOBANKS & FINTECHS")}</p>
        <h2 style={{fontFamily:FD,fontSize:30,fontWeight:500,margin:"0 0 12px",color:WH,letterSpacing:"-0.6px",lineHeight:1.15}}>{t("One API, five layers of yield infrastructure")}</h2>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.6)",margin:"0 auto",maxWidth:560,lineHeight:1.55}}>{t("Embed AI-managed on-chain investing into your product. We handle parsing, strategy, guardrails, execution and settlement.")}</p>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"stretch",gap:10,marginBottom:40}}>
        {neobankSteps.map(function(st,i){return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:R_MD,padding:"16px 18px",minWidth:150,maxWidth:190}}>
              <span style={{fontSize:11,fontFamily:M,fontWeight:700,color:NX_2,letterSpacing:"0.06em"}}>{st.n}</span>
              <p style={{fontSize:14,fontWeight:600,color:WH,margin:"6px 0 4px",fontFamily:F}}>{st.t}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0,lineHeight:1.45}}>{st.d}</p>
            </div>
            {i<neobankSteps.length-1&&<span style={{color:"rgba(255,255,255,0.25)",fontSize:16,fontFamily:M}}>→</span>}
          </div>
        );})}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",gap:36,paddingTop:32,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        {partners.map(function(pt,i){return (
          <img key={i} src={pt.src} alt="" loading="lazy" style={{height:pt.h,opacity:0.8,filter:pt.filter}}/>
        );})}
      </div>
      <div style={{textAlign:"center",marginTop:36}}>
        <Btn primary onClick={function(){p.setScreen(S.B2B);}}>{t("Explore the B2B API →")}</Btn>
      </div>
    </div>

    {/* TRUST & RISK — 4 reassurance cards */}
    <div style={{padding:"72px 0 0"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <Label>{t("BUILT FOR TRUST")}</Label>
        <H2 mb={10}>{t("Designed around your downside")}</H2>
        <Sub mb={0}>{t("Risk controls aren't an afterthought — they're enforced in math and on-chain.")}</Sub>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
        {trustBlocks.map(function(tb,i){return (
          <Card key={i}>
            <div style={{width:36,height:36,borderRadius:R_SM,background:"var(--nx-soft)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
              <span style={{fontSize:14,fontWeight:800,fontFamily:M,color:NX_1}}>{i+1}</span>
            </div>
            <p style={{fontSize:15,fontWeight:600,color:BK,margin:"0 0 6px",fontFamily:F}}>{tb.t}</p>
            <p style={{fontSize:13,color:BODY2,margin:0,lineHeight:1.55}}>{tb.d}</p>
          </Card>
        );})}
      </div>
    </div>

    {/* FAQ — narrow centered column */}
    <div style={{padding:"72px 0 24px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <Label>{t("FAQ")}</Label>
        <h2 style={{fontFamily:FD,fontSize:"clamp(30px, 4vw, 44px)",fontWeight:500,letterSpacing:"-1px",margin:"0 0 28px",color:BK,lineHeight:1.08}}>{t("Questions, answered.")}</h2>
        {faqs.map(function(f,i){var open=faq===i;return <div key={i}>
          <div onClick={function(){setFaq(open?-1:i);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:"1px solid "+GY,cursor:"pointer"}}>
            <span style={{fontSize:15,fontWeight:600,color:BK}}>{f.q}</span>
            <span style={{width:26,height:26,borderRadius:"50%",background:open?BK:GY,color:open?WH:BK,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:600,lineHeight:1,transition:"background .15s",flexShrink:0,marginLeft:16}}>{open?"–":"+"}</span>
          </div>
          {open&&<Card hl style={{marginTop:6,marginBottom:6}}><p style={{fontSize:13,color:LT,lineHeight:1.6,margin:0}}>{f.a}</p></Card>}
        </div>;})}
      </div>
    </div>

    {/* FINAL CTA */}
    <div style={{padding:"64px 0 80px",textAlign:"center"}}>
      <h2 style={{fontFamily:FD,fontSize:"clamp(28px,3.6vw,40px)",fontWeight:500,letterSpacing:"-1px",margin:"0 0 20px",color:BK,lineHeight:1.1}}>{t("Start with a sentence.")}</h2>
      <Btn primary onClick={function(){p.setScreen(S.WAITLIST);}}>{t("Get Early Access")}</Btn>
    </div>
  </div>;
}

export function Waitlist(p){var s=useState(""),email=s[0],setEmail=s[1],s2=useState(false),joined=s2[0],setJoined=s2[1];var s3=useState(null),position=s3[0],setPosition=s3[1];var s4=useState(false),busy=s4[0],setBusy=s4[1];var s5=useState(null),ref=s5[0],setRef=s5[1];var s6=useState(0),refs=s6[0],setRefs=s6[1];var tt=useToast();var t=useLang().t;
  function getRefCookie(){if(typeof document==="undefined")return null;var m=document.cookie.match(/(?:^|; )norvex_ref=([^;]+)/);return m?decodeURIComponent(m[1]):null;}
  function join(){setBusy(true);fetch("/api/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email,referred_by:getRefCookie()})}).then(function(r){return r.json();}).then(function(d){setPosition(d.position||null);setRef(d.referral_code||null);setRefs(d.referrals||0);tt.showToast(d.position?(t("Waitlist joined — you are #")+d.position):t("Waitlist joined"));}).catch(function(){}).finally(function(){setJoined(true);setBusy(false);});}
  var refLink=ref?("norvexapp.vercel.app/r/"+ref):null;
  if(joined)return <div style={{padding:"80px 20px",maxWidth:960,margin:"0 auto",textAlign:"center"}}><div style={{width:56,height:56,borderRadius:"50%",background:TINT_GN_BG,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:24}}>{"✓"}</div><H2>{t("You're on the list")}</H2>{position?<p style={{fontSize:15,fontFamily:M,fontWeight:700,color:BK,margin:"0 0 8px"}}>{t("You are #")+position}</p>:null}<Sub mb={16}>{t("We'll notify you when access opens.")}</Sub>{refLink&&<Card hl style={{marginBottom:16,textAlign:"left"}}><Label mb={6}>{t("SKIP THE LINE")}</Label><p style={{fontSize:12,color:LT,margin:"0 0 8px",lineHeight:1.5}}>{t("Share your link — each friend who joins moves you up.")}</p><div style={{display:"flex",gap:6}}><input readOnly value={refLink} style={{flex:1,padding:8,fontSize:11,fontFamily:M,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none",color:LT}}/><Btn small black onClick={function(){if(navigator.clipboard){navigator.clipboard.writeText("https://"+refLink);}tt.showToast(t("Referral link copied"));}}>{t("Copy")}</Btn></div><p style={{fontSize:11,fontFamily:M,color:MT,margin:"8px 0 0"}}>{refs+" "+t(refs===1?"friend referred":"friends referred")}</p></Card>}<Btn black full onClick={function(){p.onConnect();p.setScreen(S.TUTORIAL);}}>{t("Try Demo (Testnet)")}</Btn></div>;return <div style={{padding:"60px 20px",maxWidth:960,margin:"0 auto"}}><Label>{t("EARLY ACCESS")}</Label><H2>{t("Join the waitlist")}</H2><Sub>{t("Be first to try AI-powered investing.")}</Sub><input value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="your@email.com" style={{width:"100%",padding:14,fontSize:15,fontFamily:F,border:"1px solid "+BD,borderRadius:8,boxSizing:"border-box",outline:"none",marginBottom:12}}/><Btn black full disabled={!email.includes("@")||busy} onClick={join}>{busy?t("Joining..."):t("Join Waitlist")}</Btn><p style={{fontSize:12,color:MT,textAlign:"center",marginTop:16,cursor:"pointer"}} onClick={function(){p.onConnect();p.setScreen(S.TUTORIAL);}}>{t("Skip to demo")+" "}{">"}</p></div>;}

function SplitAnim(){var w=useState(false),on=w[0],setOn=w[1];var tr=useLang().t;useEffect(function(){var t=setTimeout(function(){setOn(true);},80);return function(){clearTimeout(t);};},[]);return <div style={{margin:"0 0 32px"}}><div style={{display:"flex",gap:3,height:16,borderRadius:8,overflow:"hidden"}}><div style={{width:(on?"92%":"0%"),background:BK,transition:"width 0.8s ease",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,boxSizing:"border-box"}}><span style={{fontSize:9,color:WH,fontFamily:M,whiteSpace:"nowrap"}}>{on?"92% "+tr("safe"):""}</span></div><div style={{flex:1,background:MT,transition:"all 0.8s ease"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:11,color:LT}}>{"$9,200 "+tr("protected")}</span><span style={{fontSize:11,color:MT}}>{"$800 "+tr("growth")}</span></div></div>;}

export function Tutorial(p){var s=useState(0),step=s[0],setStep=s[1];var t=useLang().t;var slides=[{t:"You set the rules",b:"Tell our AI your goal. How much to invest, how much you can lose. The AI follows YOUR rules."},{t:"Your money splits in two",b:"Safe part earns yield. Growth part captures crypto upside. If growth fails, safe covers the loss."},{t:"You can never lose more than you allow",b:"5 guardrails enforce your limit: math, AI constraints, circuit breakers, smart contracts, and clear disclosure."}];return <div style={{padding:"60px 20px",maxWidth:960,margin:"0 auto"}}><div style={{display:"flex",gap:4,marginBottom:32}}>{[0,1,2].map(function(i){return <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#2563EB":BD,transition:"background 0.3s"}}/>;})}</div><p style={{fontSize:52,fontWeight:800,color:"#2563EB",margin:"0 0 16px",fontFamily:M,letterSpacing:"-0.03em"}}>{"0"+(step+1)}</p><h2 style={{fontSize:22,fontWeight:800,margin:"0 0 12px",color:BK,letterSpacing:"-0.02em"}}>{t(slides[step].t)}</h2><p style={{fontSize:15,color:LT,lineHeight:1.6,margin:"0 0 24px"}}>{t(slides[step].b)}</p>{step===1&&<SplitAnim/>}{step<2?<Btn black full onClick={function(){setStep(step+1);}}>{t("Next")}</Btn>:<Btn primary full onClick={function(){p.setScreen(S.CONNECT);}}>{t("Connect Wallet →")}</Btn>}<p style={{fontSize:12,color:MT,textAlign:"center",marginTop:12,cursor:"pointer"}} onClick={function(){p.setScreen(S.CONNECT);}}>{t("Skip")}</p></div>;}

export function Connect(p){var s=useState(false),co=s[0],setCo=s[1];var t=useLang().t;return <div style={{padding:"60px 20px",maxWidth:960,margin:"0 auto"}}><Label>{t("STEP 1")}</Label><H2>{t("Connect your wallet")}</H2><Sub>{t("No signup. No email. Just your Solana wallet.")}</Sub>{["Phantom","Solflare","Backpack"].map(function(w,i){return <button key={i} onClick={function(){if(!co){setCo(true);setTimeout(function(){p.onConnect();p.setScreen(S.GOAL);},1200);}}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",background:co&&i===0?GY:WH,border:"1px solid "+BD,borderRadius:8,marginBottom:8,cursor:co?"default":"pointer",fontFamily:F,fontSize:15,fontWeight:500,color:BK}}><span>{w}</span>{co&&i===0?<span style={{fontSize:12,color:MT,fontFamily:M}}>{t("connecting...")}</span>:<span style={{color:MUTEDFILL}}>{">"}</span>}</button>;})}</div>;}

export function GoalInput(p){
  var cur=useCurrency();var cs=cur.symbol;var isPro=useMode().isPro;var t=useLang().t;
  var sMore=useState(false),showMore=sMore[0],setShowMore=sMore[1];

  function buildWith(text,name){if(typeof window!=="undefined"){sessionStorage.setItem("norvex_goal",text);sessionStorage.setItem("norvex_asset","SOL");if(name)sessionStorage.setItem("norvex_pf_name",name);else sessionStorage.removeItem("norvex_pf_name");}p.setScreen(S.BUILDING);}
  function useStrategy(res,text,a){if(typeof window!=="undefined"){sessionStorage.setItem("norvex_brain",JSON.stringify(res));sessionStorage.setItem("norvex_goal",text);sessionStorage.setItem("norvex_asset",a||"SOL");sessionStorage.removeItem("norvex_brain_committed");}p.setScreen(S.PREVIEW);}

  return <div style={{padding:"24px 20px 40px",maxWidth:640,margin:"0 auto"}}>
  <div style={{padding:"0 0 24px"}}>
    <Label>{t("NEW PORTFOLIO · STEP 2")}</Label>
    <H2>{t("Describe your goal.")}</H2>
  </div>

  <GoalSuggest onUse={useStrategy} style={{boxShadow:"none"}}/>

  {/* Pro option 2 — build your own allocation by hand and deploy it directly */}
  {isPro&&<div style={{borderTop:"1px solid "+BD,margin:"24px 0 0",paddingTop:24}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
      <Label>{t("OR BUILD IT YOURSELF")}</Label>
      <span style={{fontSize:9.5,fontFamily:M,fontWeight:700,color:WH,background:NX_1,borderRadius:R_PILL,padding:"2px 8px",letterSpacing:"0.06em"}}>PRO</span>
    </div>
    <Sub>{t("Prefer hands-on control? Mix the underlying protocols yourself, watch the blended return and downside update live, then deploy your own allocation.")}</Sub>
    <StrategyConstructor cur={cur} deployable defaultAmount={10000} onDeploy={useStrategy}/>
  </div>}

  {/* More options — templates + simulate */}
  <div style={{borderTop:"1px solid "+BD,margin:"24px 0 0",paddingTop:16}}>
    <p onClick={function(){setShowMore(!showMore);}} style={{fontSize:13,color:LT,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",justifyContent:"space-between",margin:0}}><span>{t("Or start from a template")}</span><span style={{fontFamily:M,color:MT}}>{showMore?"−":"+"}</span></p>
    {showMore&&<div style={{marginTop:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:20}}>{[{name:"The Saver",sub:cs+"5K · "+t("max 3% loss"),safe:96,goal:"Grow my "+cs+"5,000 USDC safely. Max 3% loss."},{name:"The Grower",sub:cs+"10K · "+t("max 10% loss"),safe:88,goal:"Grow my "+cs+"10,000. Max 10% loss."},{name:"Degen Lite",sub:cs+"1K · "+t("max 25% loss"),safe:75,goal:"Play crypto upside with "+cs+"1,000. Handle 25% loss."},{name:"Wedding Fund",sub:cs+"15K · "+t("no loss"),safe:98,goal:"Wedding fund "+cs+"15,000. No loss allowed."}].map(function(tp,i){return <div key={i} onClick={function(){buildWith(tp.goal,tp.name);}} style={{background:WH,border:"1px solid "+BD,borderRadius:R_SM,padding:12,cursor:"pointer"}}><p style={{fontSize:13,fontWeight:600,color:BK,margin:"0 0 2px"}}>{t(tp.name)}</p><p style={{fontSize:11,color:MT,margin:"0 0 8px",fontFamily:M}}>{tp.sub}</p><div style={{display:"flex",gap:2,height:6,borderRadius:3,overflow:"hidden"}}><div style={{width:tp.safe+"%",background:NX_GRAD}}/><div style={{width:(100-tp.safe)+"%",background:MT}}/></div></div>;})}</div>
      <Btn outline full onClick={function(){p.setScreen(S.SIMULATOR);}}>{t("Simulate first")}</Btn>
    </div>}
  </div>
  </div>;}

export function Simulator(p){var s=useState(0),period=s[0],setPeriod=s[1],s2=useState(10000),amt=s2[0],setAmt=s2[1],s3=useState(5),risk=s3[0],setRisk=s3[1];var s4=useState(false),cmp=s4[0],setCmp=s4[1];var s5=useState("SOL"),asset=s5[0],setAsset=s5[1];var tt=useToast();var cur=useCurrency();var cs=cur.symbol;var t=useLang().t;
  var assetFactor=({SOL:1,ETH:0.85,BTC:0.70})[asset];
  var directDD=[-20,-35,-55,-72];
  var safePct=Math.max(75,100-risk*2.5);var growthPct=100-safePct;
  var data=[{l:"30d",sr:0.5*safePct/92,gr:2.1,dd:-1.2,ch:[50,51,50,52,53,52,54,53,55,54],ev:[]},{l:"90d",sr:1.4*safePct/92,gr:8.3,dd:-3.8,ch:[50,51,49,48,50,53,55,54,56,58],ev:[]},{l:"1yr",sr:5.8*safePct/92,gr:34,dd:-4.9,ch:[50,52,48,46,50,55,53,58,62,65],ev:[{i:3,t:"FTX"},{i:7,t:"recovery"}]},{l:"2yr",sr:11.9*safePct/92,gr:67,dd:-7.2,ch:[50,48,45,42,50,55,60,58,65,72],ev:[{i:2,t:"Luna"},{i:4,t:"FTX"},{i:8,t:"recovery"}]}];
  var d=data[period];var safeRet=d.sr;var growthRet=d.gr*assetFactor*growthPct/100;var totalRet=safeRet+growthRet;
  var dGr=d.gr*assetFactor;var dDirect=Math.round(directDD[period]*assetFactor);
  return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
    <div style={{padding:"0 0 20px"}}>
      <Label>{t("PORTFOLIO SIMULATOR")}</Label>
      <H2>{t("What if you had invested?")}</H2>
      <Sub>{t("Adjust amount, risk, and time period. See projected outcomes vs holding directly.")}</Sub>
    </div>
    <Card hl style={{marginBottom:16}}>
      <div style={{marginBottom:12}}><p style={{fontSize:11,fontFamily:M,color:MT,margin:"0 0 4px"}}>{t("INVESTMENT AMOUNT")}</p><input type="number" value={amt} onChange={function(e){setAmt(Number(e.target.value)||0);}} style={{width:"100%",padding:10,fontSize:16,fontWeight:700,fontFamily:M,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none"}}/></div>
      <div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontSize:11,fontFamily:M,color:MT,margin:0}}>{t("RISK TOLERANCE")}</p><p style={{fontSize:11,fontFamily:M,color:BK,fontWeight:700,margin:0}}>{risk}% {t("max loss")}</p></div><input type="range" min={1} max={25} value={risk} onChange={function(e){setRisk(Number(e.target.value));}} style={{width:"100%",marginTop:6,accentColor:"#2563EB"}}/><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:MT}}>{t("Conservative")}</span><span style={{fontSize:10,color:MT}}>{t("Aggressive")}</span></div></div>
      <div style={{marginBottom:12}}><p style={{fontSize:11,fontFamily:M,color:MT,margin:"0 0 4px"}}>{t("GROWTH ASSET")}</p><div style={{display:"flex",gap:6}}>{["SOL","ETH","BTC"].map(function(a,i){return <button key={i} onClick={function(){setAsset(a);}} style={{flex:1,background:asset===a?BK:WH,color:asset===a?WH:LT,border:"1px solid "+(asset===a?BK:BD),borderRadius:6,padding:"6px 0",fontSize:12,fontWeight:700,fontFamily:M,cursor:"pointer"}}>{a}</button>;})}</div></div>
      <div style={{display:"flex",gap:2,height:8,borderRadius:4,overflow:"hidden",marginTop:8}}><div style={{width:safePct+"%",background:BK}}/><div style={{width:growthPct+"%",background:MT}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:11,color:LT}}>{Math.round(safePct)}% {t("safe")}</span><span style={{fontSize:11,color:MT}}>{Math.round(growthPct)}% {t("growth")}</span></div>
    </Card>
    <div style={{display:"flex",gap:4,marginBottom:16}}>{[t("30 days"),t("90 days"),t("1 year"),t("2 years")].map(function(pr,i){return <Tab key={i} active={period===i} onClick={function(){setPeriod(i);}}>{pr}</Tab>;})}</div>
    <Card hl style={{marginBottom:16,padding:"16px 12px"}}>
      <svg viewBox="0 0 120 44" style={{width:"100%",height:54}}>
        <defs><linearGradient id="sim-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--nx-1)" stopOpacity="0.22"/><stop offset="100%" stopColor="var(--nx-1)" stopOpacity="0"/></linearGradient></defs>
        <polygon points={(d.ch.map(function(v,i){return (i*(120/(d.ch.length-1)))+","+(34-((v-Math.min.apply(null,d.ch))/(Math.max.apply(null,d.ch)-Math.min.apply(null,d.ch)+1))*28);}).join(" "))+" 120,44 0,44"} fill="url(#sim-chart-fill)"/>
        <polyline points={d.ch.map(function(v,i){return (i*(120/(d.ch.length-1)))+","+(34-((v-Math.min.apply(null,d.ch))/(Math.max.apply(null,d.ch)-Math.min.apply(null,d.ch)+1))*28);}).join(" ")} fill="none" stroke="var(--nx-1)" strokeWidth={1.5}/>
        {d.ev.map(function(e,i){var x=e.i*(120/(d.ch.length-1));return <g key={i}><line x1={x} y1={2} x2={x} y2={34} stroke={MT} strokeWidth={0.5} strokeDasharray="2 2"/><text x={x} y={42} fontSize={4} fill={MT} textAnchor="middle" fontFamily="JetBrains Mono">{e.t}</text></g>;})}
      </svg>
      {d.ev.length===0&&<p style={{fontSize:10,fontFamily:M,color:MT,margin:"4px 0 0",textAlign:"center"}}>{t("Pick 1yr/2yr to see crash markers")}</p>}
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:16}}>
      <Stat n={"+"+safeRet.toFixed(1)+"%"} d={t("Safe leg")} c={GN}/><Stat n={"+"+growthRet.toFixed(1)+"%"} d={t("Growth leg")} c={GN}/><Stat n={"+"+totalRet.toFixed(1)+"%"} d={t("Total")} c={GN}/><Stat n={d.dd+"%"} d={t("Max DD")} c={RD}/>
    </div>
    <Card style={{marginBottom:12}}><p style={{fontSize:12,color:LT,lineHeight:1.6,margin:0}}>{t("With")+" "+cs+amt.toLocaleString()+" "+t("at")+" "+risk+"% "+t("max loss over")+" "+d.l+": "+t("projected return")+" +"+totalRet.toFixed(1)+"% ("+cs+Math.round(amt*totalRet/100).toLocaleString()+"). "+t("Max drawdown")+" "+d.dd+"%, "+t("within your")+" "+risk+"% "+t("limit. Past performance not a guarantee.")}</p></Card>
    <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,cursor:"pointer"}}><input type="checkbox" checked={cmp} onChange={function(e){setCmp(e.target.checked);}} style={{accentColor:"#2563EB",width:15,height:15}}/><span style={{fontSize:12,color:LT}}>{t("Show comparison vs holding directly")}</span></label>
    {cmp&&<Card hl style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontFamily:M,color:MT}}>{t("WITH NORVEX")}</span><span style={{fontSize:11,fontFamily:M,color:MT}}>{asset} {t("DIRECTLY")}</span></div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BD}}><span style={{fontSize:13,fontWeight:700,color:GN,fontFamily:M}}>+{totalRet.toFixed(1)}%</span><span style={{fontSize:13,fontWeight:700,color:GN,fontFamily:M}}>+{dGr.toFixed(1)}%</span></div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}><span style={{fontSize:13,fontWeight:700,color:RD,fontFamily:M}}>{t("Max loss")+" "+d.dd+"% ("+cs+Math.round(amt*Math.abs(d.dd)/100).toLocaleString()+")"}</span><span style={{fontSize:13,fontWeight:700,color:RD,fontFamily:M}}>{t("Max loss")+" "+dDirect+"% ("+cs+Math.round(amt*Math.abs(dDirect)/100).toLocaleString()+")"}</span></div>
      <p style={{fontSize:11,color:LT,margin:"8px 0 0",lineHeight:1.5}}>{t("Norvex caps your downside at")+" "+risk+"%. "+t("Holding")+" "+asset+" "+t("directly exposes the full")+" "+Math.abs(dDirect)+"% "+t("drawdown.")}</p>
    </Card>}
    <div style={{display:"flex",gap:8}}>
      <Btn outline style={{flex:1}} onClick={function(){var txt="Norvex simulation: "+cs+amt.toLocaleString()+" in "+asset+" at "+risk+"% max loss over "+d.l+". Projected +"+totalRet.toFixed(1)+"%, max DD "+d.dd+"%. Holding "+asset+" directly: max loss "+dDirect+"%.";if(navigator.clipboard){navigator.clipboard.writeText(txt);}tt.showToast(t("Results copied to clipboard"));}}>{t("Copy results")}</Btn>
      <Btn black style={{flex:2}} onClick={function(){p.setScreen(S.BUILDING);}}>{t("Build This Portfolio →")}</Btn>
    </div>
  </div>;}

export function Building(p){var s=useState(0),step=s[0],setStep=s[1];var nav=useNav();var cur=useCurrency();var isPro=useMode().isPro;var tr=useLang().t;var steps=[tr("Parsing goal"),tr("Analyzing markets"),tr("Running 10K sims"),tr("Agents debating"),tr("Validating guardrails"),tr("Constructing")];
  useEffect(function(){
    var goal=(typeof window!=="undefined"&&sessionStorage.getItem("norvex_goal"))||("Grow my "+cur.symbol+"10,000 USDC. Max 5% loss.");
    var asset=(typeof window!=="undefined"&&sessionStorage.getItem("norvex_asset"))||"SOL";
    var fetchDone=false,animDone=false;
    function maybeGo(){if(fetchDone&&animDone)p.setScreen(S.PREVIEW);}
    fetch("/api/brain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal:goal,asset:asset,wallet_address:nav.address})})
      .then(function(r){return r.json();})
      .then(function(res){if(typeof window!=="undefined")sessionStorage.setItem("norvex_brain",JSON.stringify(res));})
      .catch(function(){if(typeof window!=="undefined")sessionStorage.removeItem("norvex_brain");})
      .finally(function(){fetchDone=true;maybeGo();});
    var t=setInterval(function(){setStep(function(st){if(st>=5){clearInterval(t);animDone=true;maybeGo();return st;}return st+1;});},700);
    return function(){clearInterval(t);};
  },[]);
  return <div style={{padding:"80px 20px",maxWidth:960,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:40}}><div style={{width:48,height:48,border:"2px solid "+BD,borderTopColor:"#2563EB",borderRadius:"50%",margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/><h2 style={{fontSize:20,fontWeight:700,margin:"0 0 6px",color:BK,letterSpacing:"-0.02em"}}>{tr("Building portfolio")}</h2></div>{steps.map(function(st,i){var done=i<step,active=i===step;return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",opacity:i<=step?1:0.3}}><span style={{fontSize:14,width:20,textAlign:"center",color:done?"#2563EB":active?BK:MT}}>{done?"✓":active?"●":"·"}</span><span style={{fontSize:13,color:done?MT:active?BK:MUTEDFILL,fontWeight:active?600:400,textDecoration:done?"line-through":"none"}}>{st}</span></div>;})}{isPro&&step>=5&&<Card hl style={{marginTop:16}}><p style={{fontSize:11,fontFamily:M,color:LT,margin:0,lineHeight:1.5}}>{tr("Running the real AI pipeline (Monte Carlo + Bull/Bear debate)…")}</p></Card>}</div>;}

export function Preview(p){var s=useState(false),showR=s[0],setR=s[1];var s2=useState(false),dep=s2[0],setDep=s2[1];var sb=useState(null),brain=sb[0],setBrain=sb[1];
  var cur=useCurrency();var isPro=useMode().isPro;var t=useLang().t;var sDet=useState(false),showDet=sDet[0],setShowDet=sDet[1];var open=isPro||showDet;
  var sCG=useState(null),custGrowth=sCG[0],setCustGrowth=sCG[1];var sRR=useState(false),rerun=sRR[0],setRerun=sRR[1];var sCA=useState(null),custAsset=sCA[0],setCustAsset=sCA[1];
  useEffect(function(){try{var raw=sessionStorage.getItem("norvex_brain");if(raw)setBrain(JSON.parse(raw));}catch(e){}},[]);
  function money(n){return cur.format(n);}
  var hasB=!!(brain&&brain.allocation);
  var amount=hasB?Number(brain.parsed.amount):10000;
  var asset=hasB?brain.parsed.asset:"SOL";
  var safePct=hasB?Math.round(brain.allocation.safePct):92;
  var growthPct=hasB?Math.round(brain.allocation.growthPct):8;
  var maxLoss=hasB?brain.maxLossUsd:500;
  var maxDdPct=hasB?Math.round(brain.parsed.maxDd*100):5;
  var bullC=hasB&&brain.debate?Math.round(brain.debate.bullConfidence):65;
  var bearC=hasB&&brain.debate?Math.round(brain.debate.bearConfidence):90;
  var scn=hasB?brain.scenarios:null;
  var reasoning=hasB?brain.reasoning:null;
  var mc=hasB?brain.mc:null;
  var checks=hasB&&brain.guardrails?brain.guardrails.checks:null;
  var debate=hasB?brain.debate:null;
  var effGrowth=custGrowth!=null?custGrowth:growthPct;
  var effSafe=100-effGrowth;
  var effAsset=custAsset||asset;
  function rerunAI(){
    if(typeof window==="undefined"||!hasB)return;
    setRerun(true);
    sessionStorage.setItem("norvex_asset",effAsset);
    fetch("/api/brain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal:(sessionStorage.getItem("norvex_goal")||"")+" Target "+effGrowth+"% growth allocation.",asset:effAsset,amount:amount,wallet_address:null})})
      .then(function(r){return r.json();}).then(function(d){if(d&&d.allocation){sessionStorage.setItem("norvex_brain",JSON.stringify(d));setBrain(d);setCustGrowth(null);}}).catch(function(){}).finally(function(){setRerun(false);});
  }
  return <div style={{padding:"40px 20px",maxWidth:960,margin:"0 auto"}}><Label>{t("AI-BUILT PORTFOLIO")}</Label><H2 mb={4}>{t("Principal-Protected Note")}</H2><Sub mb={20}>{hasB?(t("Grow my")+" "+money(amount)+" "+asset+". "+t("Max")+" "+maxDdPct+"% "+t("loss.")):t("Grow my $10K. Max 5% loss.")}</Sub><div style={{display:"flex",gap:2,height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{width:effSafe+"%",background:BK,transition:"width .2s"}}/><div style={{width:effGrowth+"%",background:MT,transition:"width .2s"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><span style={{fontSize:20,fontWeight:800}}>{effSafe}%</span><span style={{fontSize:12,color:MT,marginLeft:6}}>{t("Safe")}</span></div><div><span style={{fontSize:20,fontWeight:800,color:LT}}>{effGrowth}%</span><span style={{fontSize:12,color:MT,marginLeft:6}}>{t("Growth")}</span></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>{(scn?scn.map(function(x){return {l:x.label,v:(x.pct>=0?"+":"")+x.pct.toFixed(1)+"%",s:(x.dollars>=0?"+":"")+money(x.dollars),c:x.pct>=0?GN:RD};}):[{l:"Bull +50%",v:"+9.8%",s:"+$980",c:GN},{l:"Flat",v:"+5.1%",s:"+$510",c:BK},{l:"Bear -40%",v:"-3.2%",s:"-$320",c:RD}]).map(function(sc,i){return <div key={i} style={{background:GY,borderRadius:8,padding:12,textAlign:"center"}}><p style={{fontSize:10,color:MT,margin:"0 0 4px",fontFamily:M}}>{t(sc.l)}</p><p style={{fontSize:20,fontWeight:800,color:sc.c,margin:"0 0 2px"}}>{sc.v}</p><p style={{fontSize:11,color:BODY2,margin:0,fontFamily:M}}>{sc.s}</p></div>;})}</div><Card style={{background:GY,marginBottom:12,border:"1px solid "+BD}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:LT}}>{t("Maximum loss")}</span><span style={{fontSize:13,fontWeight:700,color:BODY2,fontFamily:M}}>{money(maxLoss)+" ("+maxDdPct+".0%)"}</span></div></Card>{!isPro&&<div onClick={function(){setShowDet(!showDet);}} style={{fontSize:13,color:NX_1,cursor:"pointer",fontWeight:500,margin:"0 0 12px"}}>{showDet?t("Hide full breakdown"):t("Show full breakdown — AI confidence, fees & comparison")}</div>}{open&&<div>{hasB&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("WHERE THE MONEY GOES")}</Label><ProtocolRows cur={cur} safePct={effSafe} growthPct={effGrowth} amount={amount}/></Card>}{hasB&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("TUNE THIS ALLOCATION")}</Label><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:LT}}>{t("Growth exposure")}</span><span style={{fontSize:13,fontFamily:M,fontWeight:700,color:NX_1}}>{effGrowth}%</span></div><input type="range" min={0} max={25} value={effGrowth} onChange={function(e){setCustGrowth(Number(e.target.value));}} style={{width:"100%",accentColor:"#2563EB",marginBottom:14}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:12,color:LT}}>{t("Underlying asset")}</span><div style={{display:"flex",gap:6}}>{["SOL","ETH","BTC"].map(function(a){var on=effAsset===a;return <span key={a} onClick={function(){setCustAsset(a);}} style={{fontSize:12,fontFamily:M,fontWeight:600,padding:"4px 12px",borderRadius:R_PILL,cursor:"pointer",color:on?WH:LT,background:on?BK:GY,border:"1px solid "+(on?BK:BD)}}>{a}</span>;})}</div></div><Btn small black disabled={rerun} onClick={rerunAI}>{rerun?t("Re-running AI…"):t("Re-run AI with these settings →")}</Btn></Card>}{mc&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("ADVANCED ANALYTICS")} <span style={{fontWeight:400,color:MT,letterSpacing:0,textTransform:"none"}}>· {t("Monte Carlo, 10,000 sims")}</span></Label><AnalyticsCards mc={mc}/></Card>}{checks&&<Card hl style={{marginBottom:12}}><Label mb={6}>{t("STRESS TESTS & GUARDRAILS")}</Label><StressList checks={checks}/></Card>}{debate&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("AI REASONING")}</Label><DebateBlock debate={debate}/></Card>}<div style={{display:"flex",gap:6,marginBottom:12}}>{[{l:"Bull",v:bullC},{l:"Bear",v:bearC},{l:"PM",v:"Bear"}].map(function(c,i){return <div key={i} style={{flex:1,background:GY,borderRadius:6,padding:"6px 8px",textAlign:"center"}}><p style={{fontSize:9,fontFamily:M,color:MT,margin:"0 0 2px"}}>{t(c.l)+" "+t("CONFIDENCE")}</p><p style={{fontSize:13,fontWeight:800,fontFamily:M,color:BK,margin:0}}>{typeof c.v==="number"?c.v+"/100":t(c.v)}</p></div>;})}</div><Card hl style={{marginBottom:12}}><Label mb={6}>{t("NORVEX VS HOLDING DIRECTLY")}</Label><div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:12,color:LT}}>{t("If crypto crashes 40%")}</span><span style={{fontSize:13,fontFamily:M,fontWeight:700}}><span style={{color:GN}}>-$320</span> <span style={{color:MT}}>{t("vs")}</span> <span style={{color:RD}}>-$4,000</span></span></div><p style={{fontSize:11,color:LT,margin:"6px 0 0"}}>{t("That is 12.5x better downside protection.")}</p></Card><Row l={t("Fee")} v={t("0.75%/yr + 10% perf")}/><Row l={t("Withdraw")} v={t("Anytime")} last/><Card hl style={{marginTop:12}}><Label mb={6}>{t("FEE CALCULATOR")}</Label><Row l={t("Management (0.75%/yr)")} v={money(amount*0.0075)}/><Row l={t("Performance (est. 10% gain × 10% fee)")} v={money(amount*0.01)}/><Row l={t("Total on")+" "+money(amount)+" / 1yr"} v={money(amount*0.0175)} last vc={BK}/></Card></div>}<div style={{marginTop:12,marginBottom:20}}><span onClick={function(){setR(!showR);}} style={{fontSize:12,color:MT,cursor:"pointer",fontFamily:M}}>{showR?t("Hide"):t("Why this allocation?")}</span>{showR&&<Card hl style={{marginTop:8}}><p style={{fontSize:12,color:LT,lineHeight:1.6,margin:0}}>{reasoning||t("10K sims. Bull argued more growth; Bear countered with crash data. PM chose the Monte-Carlo-optimal split within your limit.")}</p></Card>}</div><Btn outline full className="no-print" style={{marginBottom:8}} onClick={function(){if(typeof window!=="undefined")window.print();}}>{t("Download PDF")}</Btn><div className="no-print" style={{display:"flex",gap:8}}><Btn outline style={{flex:1}} onClick={function(){p.setScreen(S.GOAL);}}>{t("Adjust")}</Btn><Btn black style={{flex:2}} disabled={dep} onClick={function(){setDep(true);setTimeout(function(){p.setScreen(S.DEPLOYED);},700);}}>{dep?t("Deploying…"):(t("Deploy")+" "+money(amount)+" →")}</Btn></div></div>;}

export function Deployed(p){
  var s=useState(false),show=s[0],setShow=s[1];
  var tt=useToast();var nav=useNav();var wallet=useWallet();var conn=useConnection();var isPro=useMode().isPro;
  var sx=useState(null),txSig=sx[0],setTxSig=sx[1];
  var so=useState(false),onbusy=so[0],setOnbusy=so[1];
  var sAmt=useState(10000),amt=sAmt[0],setAmt=sAmt[1];
  var sAsset=useState("SOL"),dAsset=sAsset[0],setDAsset=sAsset[1];
  var sName=useState("Portfolio"),pname=sName[0],setPname=sName[1];
  var sState=useState("saving"),saveState=sState[0],setSaveState=sState[1]; // saving | saved | retry
  var committed=useRef(false);
  var cur=useCurrency();var tr=useLang().t;
  function money(n){return cur.format(n);}

  function readBrainAndSetUI(){
    var asset="SOL",goalText="Grow my $10K. Max 5% loss.",demo=true,nameLocal="Portfolio";
    var amtLocal=10000,sp=92,gp=8,mdd=0.05,brainStr=null;
    if(typeof window!=="undefined"){
      sessionStorage.setItem("norvex_deployed","1");
      asset=sessionStorage.getItem("norvex_asset")||"SOL";
      goalText=sessionStorage.getItem("norvex_goal")||goalText;
      demo=sessionStorage.getItem("norvex_sim_wallet")?true:(sessionStorage.getItem("norvex_demo")==="1");
      nameLocal=sessionStorage.getItem("norvex_pf_name")||"Portfolio";
      brainStr=sessionStorage.getItem("norvex_brain");
      try{
        var b=JSON.parse(brainStr||"null");
        if(b&&b.allocation){
          amtLocal=Number(b.parsed.amount)||amtLocal;
          sp=b.allocation.safePct;gp=b.allocation.growthPct;
          mdd=b.parsed.maxDd;asset=b.parsed.asset||asset;
        }
      }catch(e){}
    }
    setAmt(amtLocal);setDAsset(asset);setPname(nameLocal);
    return {asset:asset,goalText:goalText,demo:demo,nameLocal:nameLocal,amtLocal:amtLocal,sp:sp,gp:gp,mdd:mdd,brainStr:brainStr};
  }

  function commit(ctx){
    if(!nav.address){setSaveState("saving");return;}
    if(typeof window!=="undefined"){
      var lastCommitted=sessionStorage.getItem("norvex_brain_committed");
      if(ctx.brainStr && lastCommitted===ctx.brainStr){setSaveState("saved");committed.current=true;return;}
    }
    if(committed.current) return;
    committed.current=true;
    setSaveState("saving");
    fetch("/api/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      wallet_address:nav.address,name:ctx.nameLocal,asset:ctx.asset,goal_text:ctx.goalText,
      amount:ctx.amtLocal,max_drawdown:ctx.mdd,safe_pct:ctx.sp,growth_pct:ctx.gp,
      origin:"consumer",is_demo:ctx.demo
    })}).then(function(r){return r.json();}).then(function(d){
      if(d&&d.stored){
        if(typeof window!=="undefined"&&ctx.brainStr) sessionStorage.setItem("norvex_brain_committed",ctx.brainStr);
        setSaveState("saved");
        tt.showToast(money(ctx.amtLocal)+" "+tr("portfolio saved"));
        fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          wallet_address:nav.address,type:"deploy",screen:"/deployed",meta:{asset:ctx.asset,amount:ctx.amtLocal}
        })}).catch(function(){});
      }else{
        setSaveState("retry");committed.current=false;
        tt.showToast(tr("Could not save portfolio — tap Retry"));
      }
    }).catch(function(){
      setSaveState("retry");committed.current=false;
      tt.showToast(tr("Network error — tap Retry"));
    });
  }

  function deployOnChain(){if(!wallet.publicKey)return;setOnbusy(true);var gp2=8,mdd2=0.05;try{var b=JSON.parse(sessionStorage.getItem("norvex_brain")||"null");if(b&&b.allocation){gp2=b.allocation.growthPct;mdd2=b.parsed.maxDd;}}catch(e){}var total=20000000;var growth=Math.floor(total*gp2/100);createVaultOnChain({connection:conn.connection,owner:wallet.publicKey,sendTransaction:wallet.sendTransaction,id:Math.floor(Date.now()/1000)%1000000000,amountLamports:total,maxDdBps:Math.round(mdd2*10000),growthLamports:growth}).then(function(sig){setTxSig(sig);tt.showToast(tr("On-chain vault created on devnet"));}).catch(function(e){tt.showToast(tr("On-chain deploy failed:")+" "+((e&&e.message)||tr("error")));}).finally(function(){setOnbusy(false);});}

  // Effect 1: reveal the success card on mount (no deps).
  useEffect(function(){var t=setTimeout(function(){setShow(true);},300);return function(){clearTimeout(t);};},[]);

  // Effect 2: read sessionStorage + try to commit. Re-runs when nav.address hydrates.
  useEffect(function(){
    var ctx=readBrainAndSetUI();
    commit(ctx);
  },[nav.address]);

  function onRetry(){var ctx=readBrainAndSetUI();committed.current=false;commit(ctx);}
  function onDashboard(){
    if(saveState!=="saved"){tt.showToast(tr("Saving — one moment"));return;}
    p.setScreen(S.DASH);
  }

  return <div style={{padding:"80px 20px",maxWidth:960,margin:"0 auto",textAlign:"center",opacity:show?1:0,transition:"opacity 0.5s"}}>
    <div style={{width:56,height:56,borderRadius:"50%",background:TINT_GN_BG,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:24}}>{saveState==="saved"?"✓":saveState==="retry"?"!":"…"}</div>
    <H2>{saveState==="saved"?(pname+" "+tr("deployed")):saveState==="retry"?tr("Save failed"):tr("Saving your portfolio…")}</H2>
    <Sub>{saveState==="saved"?(money(amt)+" "+tr("in")+" "+dAsset+" "+tr("working for you. AI managing 24/7.")):saveState==="retry"?tr("Couldn't save to your account. Tap Retry below — your allocation is preserved."):tr("Connecting to your account and saving the allocation.")}</Sub>
    {isPro&&VAULT_CONFIGURED&&!nav.simulated&&wallet.connected&&wallet.publicKey&&saveState==="saved"&&<Card hl style={{marginBottom:12,textAlign:"left"}}><Label mb={6}>{tr("ON-CHAIN (DEVNET)")}</Label>{txSig?<p style={{fontSize:12,color:LT,margin:0}}>{tr("Vault created on-chain.")} <a href={explorerTxUrl(txSig)} target="_blank" rel="noreferrer" style={{color:BK,textDecoration:"underline"}}>{tr("View on Solana Explorer →")}</a></p>:<div><p style={{fontSize:12,color:LT,margin:"0 0 8px",lineHeight:1.5}}>{tr("Optionally commit this allocation to the real on-chain vault (devnet, ~0.02 SOL + rent).")}</p><Btn small black disabled={onbusy} onClick={deployOnChain}>{onbusy?tr("Confirming…"):tr("Deploy on-chain (devnet)")}</Btn></div>}</Card>}
    {saveState==="retry"?<Btn black full onClick={onRetry}>{tr("Retry save")}</Btn>:<Btn black full disabled={saveState!=="saved"} onClick={onDashboard}>{saveState==="saved"?tr("Dashboard →"):tr("Saving…")}</Btn>}
  </div>;
}

export function Dashboard(p){var nav=useNav();var address=nav.address;var tt=useToast();var t=useLang().t;
  var s=useState(0),sel=s[0],setSel=s[1];var sp=useState(null),pfs=sp[0],setPfs=sp[1];var sd=useState(false),isDemo=sd[0],setIsDemo=sd[1];var stt=useState(false),trail=stt[0],setTrail=stt[1];
  var cur=useCurrency();var isPro=useMode().isPro;var sDet=useState(false),showDet=sDet[0],setShowDet=sDet[1];var open=isPro||showDet;
  var sB=useState(null),dBrain=sB[0],setDBrain=sB[1];
  useEffect(function(){if(typeof window==="undefined")return;try{var raw=sessionStorage.getItem("norvex_brain");if(raw){var b=JSON.parse(raw);if(b&&b.allocation)setDBrain(b);}}catch(e){}},[]);
  function load(){if(!address){setPfs([]);return;}fetch("/api/portfolios?wallet="+encodeURIComponent(address)).then(function(r){return r.json();}).then(function(d){setPfs((d.portfolios||[]).filter(function(x){return x.status!=="closed";}));}).catch(function(){setPfs([]);});}
  useEffect(function(){if(typeof window!=="undefined")setIsDemo(sessionStorage.getItem("norvex_demo")==="1");if(address){fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wallet_address:address,type:"view",screen:"/dashboard"})}).catch(function(){});}load();},[address]);
  function money(n){return cur.format(n);}
  if(pfs===null)return <div style={{padding:"120px 20px",textAlign:"center"}}><p style={{fontSize:13,fontFamily:M,color:MT}}>{t("Loading…")}</p></div>;
  if(pfs.length===0)return <div style={{padding:"60px 20px",maxWidth:960,margin:"0 auto",textAlign:"center"}}><Label>{t("DASHBOARD")}</Label><H2>{t("No portfolios yet")}</H2><Sub>{t("Create your first AI-built portfolio in under a minute.")}</Sub><Btn black full onClick={function(){p.setScreen(S.GOAL);}}>{t("Create a portfolio →")}</Btn>{isDemo&&<p style={{fontSize:12,color:MT,marginTop:16}}>{t("Demo account — no real funds.")}</p>}<NPSModal/></div>;
  var pf=pfs[Math.min(sel,pfs.length-1)];
  var value=Number(pf.value||pf.amount||0);var ret=Number(pf.return_pct||0);var safePct=Number(pf.safe_pct||92);var growthPct=Number(pf.growth_pct||8);
  var days=pf.created_at?Math.max(1,Math.round((Date.now()-new Date(pf.created_at).getTime())/86400000)):1;
  var retStr=(ret>=0?"+":"")+ret.toFixed(2)+"%";var retColor=ret>=0?GN:RD;
  var hist=[{t:t("Day")+" 0",m:t("PM allocated")+" "+Math.round(safePct)+"/"+Math.round(growthPct)+" — Bull 65 / Bear 90"},{t:t("Day")+" "+Math.min(12,days),m:t("Drift")+" 2.1% — "+t("within band, no action")},{t:t("Day")+" "+days,m:t("Compounded yield")+" +"+money(value*0.0018)}];
  function withdraw(){fetch("/api/portfolio/close",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:pf.id,wallet_address:address})}).then(function(){tt.showToast(t("Withdrawal initiated"));setSel(0);load();}).catch(function(){});}
  function shareCard(){var txt="My Norvex portfolio: "+money(value)+" ("+retStr+") over "+days+" days on "+(pf.asset||"SOL")+". Built by AI on Solana.";if(navigator.clipboard){navigator.clipboard.writeText(txt);}tt.showToast(t("Performance card copied — share it!"));}
  return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
  <div style={{padding:"0 0 20px"}}>
    <Label>{t("DASHBOARD")}</Label>
    <H2>{t("Your portfolios.")}</H2>
    <Sub>{t("Real-time value, AI activity, decision history. Withdraw anytime.")}</Sub>
  </div>
  <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{pfs.map(function(x,i){return <button key={i} onClick={function(){setSel(i);}} style={{background:sel===i?BK:WH,color:sel===i?WH:LT,border:"1px solid "+(sel===i?BK:BD),borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:600,fontFamily:M,cursor:"pointer"}}>{(x.name||"Portfolio")+" ("+money(x.value||x.amount)+")"}</button>;})}<button onClick={function(){p.setScreen(S.GOAL);}} style={{background:WH,color:LT,border:"1px dashed "+BD,borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:600,fontFamily:M,cursor:"pointer"}}>{t("+ New")}</button></div>
  <div style={{marginBottom:24}}><p style={{fontSize:10,fontFamily:M,color:MT,letterSpacing:"0.12em",textTransform:"uppercase",margin:"0 0 10px"}}>{t("Portfolio Value")} · {pf.asset||"SOL"}</p><div style={{display:"flex",alignItems:"baseline",gap:10}}><span style={{fontSize:44,fontWeight:800,letterSpacing:"-0.04em",fontFamily:M}}>{money(value)}</span><span style={{fontSize:15,fontWeight:700,color:retColor,fontFamily:M}}>{retStr}</span></div><p style={{fontSize:11,fontFamily:M,color:MT,margin:"6px 0 0",letterSpacing:"0.04em"}}>{days} {days===1?t("day"):t("days")} / {t("AI managed")}{pf.is_demo?" · "+t("demo"):""}</p></div><Card hl style={{marginBottom:16,padding:"16px 12px"}}><svg viewBox="0 0 400 80" style={{width:"100%",height:64}}><defs><linearGradient id="dash-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--nx-1)" stopOpacity="0.22"/><stop offset="100%" stopColor="var(--nx-1)" stopOpacity="0"/></linearGradient></defs><polygon points="0,70 40,65 80,60 120,55 160,50 200,48 240,40 280,32 320,25 360,18 400,12 400,80 0,80" fill="url(#dash-chart-fill)"/><polyline points="0,70 40,65 80,60 120,55 160,50 200,48 240,40 280,32 320,25 360,18 400,12" fill="none" stroke="var(--nx-1)" strokeWidth={2.5}/></svg></Card><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}><Card hl><Label mb={4}>{t("SAFE")+" / "+Math.round(safePct)+"%"}</Label><p style={{fontSize:24,fontWeight:800,margin:"0 0 2px",letterSpacing:"-0.02em",fontFamily:M}}>{money(value*safePct/100)}</p><p style={{fontSize:11,fontFamily:M,color:GN}}>{t("yield earning")}</p></Card><Card hl><Label mb={4}>{t("GROWTH")+" / "+Math.round(growthPct)+"%"}</Label><p style={{fontSize:24,fontWeight:800,margin:"0 0 2px",letterSpacing:"-0.02em",fontFamily:M}}>{money(value*growthPct/100)}</p><p style={{fontSize:11,fontFamily:M,color:GN}}>{(pf.asset||"SOL")+" "+t("upside")}</p></Card></div><Card style={{background:TINT_GN_BG,marginBottom:16,border:"1px solid "+TINT_GN_BD}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600}}>{t("Risk")}</span><span style={{fontFamily:M,color:GN,fontWeight:600}}>{t("Healthy")+" (3.8%/5%)"}</span></div></Card>
  {!isPro&&<div onClick={function(){setShowDet(!showDet);}} style={{fontSize:13,color:NX_1,cursor:"pointer",fontWeight:500,margin:"0 0 16px"}}>{showDet?t("Hide details"):t("Show details — AI activity, history & benchmark")}</div>}
  {open&&<div><Label mb={8}>{t("AI ACTIVITY")}</Label>{[{t:"2"+t("h")+" "+t("ago"),m:t("Compounded")+" "+money(value*0.0018)},{t:"1"+t("d")+" "+t("ago"),m:t("Rebalanced: corrected to")+" "+Math.round(growthPct)+"% ("+t("Bear conf.")+" 90)"},{t:"3"+t("d")+" "+t("ago"),m:t("Health check passed")}].map(function(a,i){return <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<2?"1px solid "+GY:"none",alignItems:"flex-start"}}><span style={{fontSize:10,fontFamily:M,color:MT,minWidth:52,paddingTop:1}}>{a.t}</span><span style={{fontSize:12,color:BK,fontWeight:500,lineHeight:1.5}}>{a.m}</span></div>;})}
  <div style={{marginTop:8}}><span onClick={function(){setTrail(!trail);}} style={{fontSize:12,color:MT,cursor:"pointer",fontFamily:M}}>{trail?t("Hide decision history"):t("View decision history")}</span>{trail&&<Card hl style={{marginTop:8}}>{hist.map(function(h,i){return <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<2?"1px solid "+BD:"none"}}><span style={{fontSize:10,fontFamily:M,color:MT,minWidth:44}}>{h.t}</span><span style={{fontSize:12,color:LT}}>{h.m}</span></div>;})}</Card>}</div>
  <Card hl style={{marginTop:12,marginBottom:12}}><Label mb={6}>{t("PERFORMANCE VS BENCHMARK")}</Label><div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:12,color:LT}}>{t("Your portfolio")}</span><span style={{fontSize:13,fontFamily:M,fontWeight:700,color:retColor}}>{retStr+" · "+t("max DD")+" 3.8%"}</span></div><div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:12,color:LT}}>{t("Holding")+" "+(pf.asset||"SOL")+" "+t("directly")}</span><span style={{fontSize:13,fontFamily:M,fontWeight:700,color:BK}}>{"+12% · "+t("max DD")+" -40%"}</span></div><p style={{fontSize:11,color:LT,margin:"6px 0 0",lineHeight:1.5}}>{t("Similar upside capture, a fraction of the drawdown.")}</p></Card>
  {dBrain&&<Card hl style={{marginTop:12,marginBottom:12}}><Label mb={10}>{t("WHERE THE MONEY GOES")}</Label><ProtocolRows cur={cur} safePct={Math.round(dBrain.allocation.safePct)} growthPct={Math.round(dBrain.allocation.growthPct)} amount={value}/></Card>}
  {dBrain&&dBrain.mc&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("ADVANCED ANALYTICS")} <span style={{fontWeight:400,color:MT,letterSpacing:0,textTransform:"none"}}>· {t("Monte Carlo, 10,000 sims")}</span></Label><AnalyticsCards mc={dBrain.mc}/></Card>}
  {dBrain&&dBrain.guardrails&&dBrain.guardrails.checks&&<Card hl style={{marginBottom:12}}><Label mb={6}>{t("STRESS TESTS & GUARDRAILS")}</Label><StressList checks={dBrain.guardrails.checks}/></Card>}
  {dBrain&&dBrain.debate&&<Card hl style={{marginBottom:12}}><Label mb={10}>{t("AI REASONING")}</Label><DebateBlock debate={dBrain.debate}/></Card>}
  <Card hl style={{marginBottom:12}}><Label mb={10}>{t("REBALANCE PREFERENCES")}</Label><Row l={t("Auto-compound yield")} v={t("On")}/><Row l={t("Drift band before rebalance")} v="±5%"/><Row l={t("Risk ceiling")} v={t("max DD")+" "+Math.round((dBrain&&dBrain.parsed?dBrain.parsed.maxDd*100:5))+"%"} last/><p style={{fontSize:11,color:LT,margin:"10px 0 12px",lineHeight:1.5}}>{t("Changing your targets builds a fresh AI allocation while this one keeps running.")}</p><Btn small black onClick={function(){p.setScreen(S.GOAL);}}>{t("Adjust via new build →")}</Btn></Card>
  <div style={{display:"flex",gap:8,marginBottom:12}} className="no-print"><Btn outline style={{flex:1}} onClick={shareCard}>{t("Share")}</Btn><Btn outline style={{flex:1}} onClick={function(){if(typeof window!=="undefined")window.print();}}>{t("Download PDF")}</Btn></div></div>}
  {isDemo&&<div style={{marginBottom:16,padding:16,borderRadius:R_LG,background:"linear-gradient(135deg, #1e3a5f 0%, #1D4ED8 100%)",border:"1px solid rgba(59,130,246,0.30)",boxShadow:"0 4px 16px rgba(37,99,235,0.25)"}}><p style={{fontSize:13,fontWeight:700,color:"#EFF6FF",margin:"0 0 8px"}}>{t("This is a demo — no real funds.")}</p><Btn full onClick={function(){p.setScreen(S.CONNECT);}} style={{background:"rgba(255,255,255,0.15)",color:"#EFF6FF",border:"1px solid rgba(255,255,255,0.25)",backdropFilter:"blur(8px)"}}>{t("Ready for real? Connect wallet")}</Btn></div>}<div style={{display:"flex",gap:8}} className="no-print"><Btn outline style={{flex:1}} onClick={function(){p.setScreen(S.GOAL);}}>{t("Add")}</Btn><Btn danger outline style={{flex:1}} onClick={withdraw}>{t("Withdraw")}</Btn></div><NPSModal/></div>;}

// ━━━ B2B ━━━
export function B2B(p){var s=useState(0),tab=s[0],setTab=s[1],s2=useState(""),q=s2[0],setQ=s2[1],s3=useState(false),ran=s3[0],setRan=s3[1];
  var s6=useState(-1),openEP=s6[0],setOpenEP=s6[1];
  var s7=useState(10000),bUsers=s7[0],setBUsers=s7[1];var s8=useState(5000),bDep=s8[0],setBDep=s8[1];var s9=useState(false),running=s9[0],setRunning=s9[1];var s10=useState(""),apiKey=s10[0],setApiKey=s10[1];var s11=useState({deposit:true,withdraw:true,rebalance:false}),hooks=s11[0],setHooks=s11[1];var s12=useState(null),resp=s12[0],setResp=s12[1];var tt2=useToast();
  var cur=useCurrency();var cs=cur.symbol;var tr=useLang().t;
  var sForm=useState(false),showForm=sForm[0],setShowForm=sForm[1];
  var sReq=useState({company:"",first:"",last:"",contact:""}),req=sReq[0],setReq=sReq[1];
  function setReqK(k,v){setReq(function(p){var n=Object.assign({},p);n[k]=v;return n;});}
  function submitRequest(){
    if(!req.company.trim()||!req.first.trim()||!req.last.trim()||!req.contact.trim()){tt2.showToast(tr("Please fill in all fields"));return;}
    try{fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"b2b_api_request",screen:"/b2b",meta:{company:req.company,name:req.first+" "+req.last,contact:req.contact,theme:th.id,partner:customName||th.name,tvl:tvl,users:bUsers}})}).catch(function(){});}catch(e){}
    setShowForm(false);setReq({company:"",first:"",last:"",contact:""});
    tt2.showToast(tr("Request received — we'll be in touch within 24h"));
  }
  function runPipeline(){setRunning(true);setRan(false);fetch("/api/brain",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal:q||("Grow "+cs+"5,000 USDC with max 10% loss")})}).then(function(r){return r.json();}).then(function(d){setResp(d);setRan(true);}).catch(function(){setResp(null);setRan(true);}).finally(function(){setRunning(false);});}
  function genKey(){var k="nvx_test_sk_"+Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,10);setApiKey(k);}
  var tvl=bUsers*bDep;var annualRev=tvl*0.0075;var partnerShare=annualRev*0.4;var perUser=bUsers>0?partnerShare/bUsers:0;
  function money(n){return cur.format(n);}
  var themes=[
    {id:"phantom",name:"Phantom",bg:"#1A1B22",card:"#2C2D30",accent:"#AB9FF2",accent2:"#4E44CE",text:"#E8E8F0",muted:"#7A7B85",safe:"#AB9FF2",danger:"#FF6B6B",logo:"/svg/Phantom-logo-purple.svg",logoFilter:"brightness(1.1)",logoH:14,deployText:"#FFFFFF",swatch:"#AB9FF2"},
    {id:"solana",name:"Solana",bg:"#101014",card:"#1A1A24",accent:"#14F195",accent2:"#9945FF",text:"#E8E8F0",muted:"#6B7280",safe:"#14F195",danger:"#F43F5E",logo:"/svg/solana-logo.svg",logoFilter:"none",logoH:11,deployText:"#062818",swatch:"#14F195"},
    {id:"revolut",name:"Revolut",bg:"#000000",card:"#141414",accent:"#FFFFFF",accent2:"#9CA3AF",text:"#FFFFFF",muted:"#8E8E93",safe:"#00C853",danger:"#FF3B30",logo:"/svg/revolut-wordmark.svg",logoFilter:"invert(1) brightness(1.5)",logoH:13,deployText:"#000000",swatch:"#000000"},
    {id:"binance",name:"Binance",bg:"#181A20",card:"#1E2329",accent:"#FCD535",accent2:"#F0B90B",text:"#EAECEF",muted:"#848E9C",safe:"#0ECB81",danger:"#F6465D",logo:"/svg/binance.svg",logoFilter:"hue-rotate(0deg) brightness(1.1)",logoH:14,deployText:"#1A1A1A",swatch:"#FCD535"},
    {id:"custom",name:"Custom",bg:"#0F0F14",card:"#1A1A24",accent:"#06b6d4",accent2:"#22d3ee",text:"#E8E8F0",muted:BODY2,safe:"#10b981",danger:"#ef4444",logo:null,logoFilter:"none",logoH:14,deployText:"#0F0F14",swatch:"#06b6d4"},
  ];
  var s4=useState(0),themeIdx=s4[0],setThemeIdx=s4[1];
  var th=themes[themeIdx];
  var s5=useState(""),customName=s5[0],setCustomName=s5[1];
  var displayName=customName||th.name;
  var b2bPartners=[{src:"/svg/revolut-wordmark.svg",h:14,filter:"invert(1) brightness(1.6)"},{src:"/svg/binance.svg",h:18,filter:"brightness(1.1)"},{src:"/svg/Phantom-logo-purple.svg",h:16,filter:"brightness(1.2)"},{src:"/svg/solana-logo.svg",h:13,filter:"none"}];
  return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
    {/* Premium dark hero — sets a high-end tone before the white content below */}
    <div style={{position:"relative",overflow:"hidden",borderRadius:R_LG,background:BK,padding:"38px 28px",marginBottom:20,boxShadow:SHADOW_MD}}>
      <div aria-hidden="true" style={{position:"absolute",top:-90,right:-70,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle, "+NX_1+"55, transparent 70%)",filter:"blur(30px)",pointerEvents:"none"}}/>
      <div aria-hidden="true" style={{position:"absolute",bottom:-110,left:-80,width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle, "+NX_2+"33, transparent 70%)",filter:"blur(34px)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1}}>
        <p style={{fontSize:11,fontFamily:F,color:NX_2,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,margin:"0 0 12px"}}>{tr("FOR BUSINESS")}</p>
        <h1 style={{fontFamily:FD,fontSize:32,fontWeight:500,margin:"0 0 12px",color:WH,letterSpacing:"-0.8px",lineHeight:1.12,maxWidth:560}}>{tr("Structured products API.")}</h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.65)",margin:"0 0 26px",lineHeight:1.55,maxWidth:520}}>{tr("Your users get AI-built, principal-protected investing. You keep the customer and earn a revenue share.")}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:30,marginBottom:26}}>
          {[{v:"40%",k:tr("Revenue share")},{v:"4 "+tr("weeks"),k:tr("To go live")},{v:"1",k:tr("Endpoint to integrate")},{v:tr("5-layer"),k:tr("Guardrails")}].map(function(m,i){return (
            <div key={i}>
              <p style={{fontSize:26,fontFamily:FD,fontWeight:500,color:WH,margin:0,letterSpacing:"-0.6px"}}>{m.v}</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",margin:"3px 0 0",fontFamily:M}}>{m.k}</p>
            </div>
          );})}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:26,paddingTop:22,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:M,letterSpacing:"0.1em",textTransform:"uppercase"}}>{tr("Built for")}</span>
          {b2bPartners.map(function(pt,i){return (<img key={i} src={pt.src} alt="" loading="lazy" style={{height:pt.h,opacity:0.75,filter:pt.filter}}/>);})}
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:3,marginBottom:16,flexWrap:"wrap"}}>{["Overview","Playground","White-Label","API Docs","Pricing","Compliance"].map(function(t,i){return <Tab key={i} active={tab===i} onClick={function(){setTab(i);}}>{tr(t)}</Tab>;})}</div>
    {tab===0&&<div>
    {/* WHO BUILDS ON NORVEX — premium use-case cards */}
    <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 12px"}}>{tr("WHO BUILDS ON NORVEX")}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:30}}>
      {[
        {t:"Crypto Wallets",d:"Earn tab powered by Norvex.",x:"Phantom, Backpack",c:NX_1,icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h.01"/></svg>)},
        {t:"Neobanks",d:"White-label yield products.",x:"Revolut, N26",c:NX_2,icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/></svg>)},
        {t:"DeFi Protocols",d:"Structured products on your protocol.",x:"Kamino, Drift",c:GN,icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>)},
      ].map(function(u,i){return (
        <div key={i} style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:18,boxShadow:SHADOW_SM}}>
          <div style={{width:38,height:38,borderRadius:R_MD,background:u.c,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>{u.icon}</div>
          <p style={{fontSize:15,fontWeight:700,margin:"0 0 5px",color:BK,fontFamily:FD,letterSpacing:"-0.3px"}}>{tr(u.t)}</p>
          <p style={{fontSize:13,color:BODY2,margin:"0 0 12px",lineHeight:1.5}}>{tr(u.d)}</p>
          <span style={{fontSize:10,fontFamily:M,color:MT,background:GY,border:"1px solid "+BD,borderRadius:R_PILL,padding:"3px 9px"}}>{u.x}</span>
        </div>
      );})}
    </div>
    {/* WHAT YOU EARN — premium revenue calculator */}
    <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"0 0 12px"}}>{tr("WHAT YOU EARN")}</p>
    <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:20,boxShadow:SHADOW_SM,marginBottom:30}}>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1}}><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 5px",letterSpacing:"0.06em"}}>{tr("YOUR USERS")}</p><input type="number" value={bUsers} onChange={function(e){setBUsers(Number(e.target.value)||0);}} style={{width:"100%",padding:"10px 12px",fontSize:15,fontWeight:700,fontFamily:M,border:"1px solid "+BD,borderRadius:R_SM,boxSizing:"border-box",outline:"none"}}/></div>
        <div style={{flex:1}}><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 5px",letterSpacing:"0.06em"}}>{tr("AVG DEPOSIT ($)")}</p><input type="number" value={bDep} onChange={function(e){setBDep(Number(e.target.value)||0);}} style={{width:"100%",padding:"10px 12px",fontSize:15,fontWeight:700,fontFamily:M,border:"1px solid "+BD,borderRadius:R_SM,boxSizing:"border-box",outline:"none"}}/></div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:BK,borderRadius:R_MD,padding:"16px 18px",marginBottom:8}}>
        <div><p style={{fontSize:12,color:WH,margin:"0 0 2px",fontWeight:600}}>{tr("Your share (40%)")}</p><p style={{fontSize:10,color:"rgba(255,255,255,0.45)",margin:0,fontFamily:M,letterSpacing:"0.04em"}}>{tr("Per year")}</p></div>
        <p style={{fontSize:26,fontWeight:600,color:"#34d399",margin:0,fontFamily:FD,letterSpacing:"-0.6px"}}>{money(partnerShare)}</p>
      </div>
      <Row l={tr("Total TVL")} v={money(tvl)}/>
      <Row l={tr("Annual revenue (platform)")} v={money(annualRev)}/>
      <Row l={tr("Per-user revenue / yr")} v={money(perUser)} last/>
    </div>
    {/* HOW TO GO LIVE — numbered premium timeline */}
    <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"0 0 12px"}}>{tr("HOW TO GO LIVE")}</p>
    <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:"8px 20px",boxShadow:SHADOW_SM,marginBottom:4}}>
      {[{w:"Week 1",d:"API key + sandbox testing"},{w:"Week 2",d:"Frontend widget integration"},{w:"Week 3",d:"Testing with 10 users"},{w:"Week 4",d:"Go live"}].map(function(it,i){return (
        <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"14px 0",borderBottom:i<3?"1px solid "+GY:"none"}}>
          <div style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:i===3?BK:GY,border:"1px solid "+(i===3?BK:BD),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,fontFamily:M,color:i===3?WH:LT}}>{i+1}</div>
          <div style={{paddingTop:3}}>
            <p style={{fontSize:11,fontFamily:M,fontWeight:700,color:NX_1,margin:"0 0 2px",letterSpacing:"0.04em"}}>{tr(it.w)}</p>
            <p style={{fontSize:13,color:LT,margin:0}}>{tr(it.d)}</p>
          </div>
        </div>
      );})}
    </div>
    </div>}
    {tab===1&&<div>
      <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 6px"}}>{tr("API PLAYGROUND")}</p>
      <p style={{fontSize:13,color:BODY2,margin:"0 0 16px",lineHeight:1.5}}>{tr("Type a goal. Watch the AI brain respond.")}</p>
      <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:20,boxShadow:SHADOW_SM,marginBottom:12}}>
        <p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 8px",letterSpacing:"0.08em"}}>{tr("SANDBOX KEY")}</p>
        {apiKey?<div style={{display:"flex",gap:6,marginBottom:16}}><input readOnly value={apiKey} style={{flex:1,padding:"10px 12px",fontSize:11,fontFamily:M,border:"1px solid "+BD,borderRadius:R_SM,boxSizing:"border-box",outline:"none",color:LT,background:GY}}/><Btn small black onClick={function(){if(navigator.clipboard){navigator.clipboard.writeText(apiKey);}tt2.showToast(tr("Sandbox key copied"));}}>{tr("Copy")}</Btn></div>:<div style={{marginBottom:16}}><Btn small black full onClick={function(){genKey();tt2.showToast(tr("Sandbox key generated"));}}>{tr("Generate Sandbox Key")}</Btn></div>}
        <p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 8px",letterSpacing:"0.08em"}}>{tr("YOUR REQUEST")}</p>
        <textarea value={q} onChange={function(e){setQ(e.target.value);}} placeholder={"Grow "+cs+"5,000 USDC with max 10% loss"} style={{width:"100%",minHeight:64,padding:12,fontSize:14,fontFamily:F,border:"1px solid "+BD,borderRadius:R_SM,resize:"vertical",boxSizing:"border-box",outline:"none",marginBottom:10}}/>
        <Btn black full small disabled={running} onClick={runPipeline}>{running?tr("Running pipeline…"):tr("Run AI Pipeline →")}</Btn>
      </div>
      {ran&&<div style={{background:BK,borderRadius:R_LG,padding:20,boxShadow:SHADOW_MD}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><p style={{fontSize:10,fontFamily:M,color:NX_2,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,margin:0}}>{tr("RESPONSE")}</p><span style={{fontSize:10,fontFamily:M,color:"rgba(255,255,255,0.5)"}}>{(resp&&resp.latencyMs?(resp.latencyMs/1000).toFixed(1):"6.2")+"s"}</span></div><div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{[{l:"Bull",v:resp&&resp.debate?(Math.round(resp.debate.bullConfidence)+"/100"):"60/100"},{l:"Bear",v:resp&&resp.debate?(Math.round(resp.debate.bearConfidence)+"/100"):"88/100"},{l:"PM",v:"Bear"}].map(function(c,i){return <span key={i} style={{fontSize:10,fontFamily:M,color:"rgba(255,255,255,0.85)",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:R_PILL,padding:"3px 9px"}}>{c.l}: {c.v}</span>;})}</div><pre style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.7)",lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{resp?JSON.stringify({mode:resp.mode,allocation:resp.allocation,asset:resp.parsed&&resp.parsed.asset,var_95:resp.mc&&resp.mc.var95,scenarios:resp.scenarios,guardrails_passed:resp.guardrails&&resp.guardrails.passedCount,latency_ms:resp.latencyMs,cost:resp.costUsd},null,2):"(no response)"}</pre></div>}</div>}
    {tab===2&&<div>
      <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 6px"}}>{tr("WHITE-LABEL EDITOR")}</p>
      <p style={{fontSize:13,color:BODY2,margin:"0 0 16px",lineHeight:1.5}}>{tr("Preview how Norvex integrates into your app. Select a brand theme or customize.")}</p>
      <p style={{fontSize:10,fontFamily:M,color:MT,letterSpacing:"0.08em",margin:"0 0 8px"}}>{tr("BRAND THEME")}</p>
      <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>{themes.map(function(t,i){return <button key={i} onClick={function(){setThemeIdx(i);}} style={{display:"flex",alignItems:"center",gap:6,background:themeIdx===i?BK:WH,color:themeIdx===i?WH:LT,border:"1px solid "+(themeIdx===i?BK:BD),borderRadius:6,padding:"7px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:M}}><div style={{width:10,height:10,borderRadius:3,background:t.swatch||t.accent}}/>{t.name}</button>;})}</div>
      <Card hl style={{marginBottom:12}}><p style={{fontSize:11,fontFamily:M,color:MT,margin:"0 0 4px"}}>{tr("PARTNER NAME (OPTIONAL)")}</p><input value={customName} onChange={function(e){setCustomName(e.target.value);}} placeholder={th.name+" Wallet"} style={{width:"100%",padding:8,fontSize:13,fontFamily:F,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none"}}/></Card>
      <div style={{position:"relative",display:"flex",justifyContent:"center",padding:"36px 0 32px",borderRadius:R_LG,overflow:"hidden",border:"1px solid "+BD,boxShadow:SHADOW_MD}}>
        {/* Hero backdrop behind the iPhone */}
        <img src="/images/pexels-steve-126964322.jpg" alt="" aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",zIndex:0}}/>
        <div aria-hidden="true" style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.85) 100%)",zIndex:1}}/>
        <div aria-hidden="true" style={{position:"absolute",top:-80,left:-60,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle, "+th.accent+"40, transparent 70%)",filter:"blur(20px)",zIndex:1,pointerEvents:"none"}}/>
        <div aria-hidden="true" style={{position:"absolute",bottom:-100,right:-80,width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle, "+th.accent2+"38, transparent 70%)",filter:"blur(24px)",zIndex:1,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:300,aspectRatio:"1424/2956",filter:"drop-shadow(0 28px 56px rgba(0,0,0,0.55))"}}>
          {/* App screen (behind the frame; shows through the transparent screen cutout) */}
          <div style={{position:"absolute",top:"1.6%",left:"3.7%",right:"3.7%",bottom:"1.6%",background:th.bg,borderRadius:"12%/5.8%",overflow:"hidden",display:"flex",flexDirection:"column",zIndex:1}}>
            {/* Status bar (time + signal/wifi/battery glyphs flank the dynamic island) */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4% 8% 0.5%",fontFamily:M,fontSize:9,fontWeight:700,color:th.text}}>
              <span>9:41</span>
              <span style={{display:"flex",gap:3,alignItems:"center",opacity:0.92}}>
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 5h1.5v2H1V5zm2.5-1.5H5V7H3.5V3.5zM6 2h1.5v5H6V2zm2.5-1.5H10V7H8.5V0.5z" fill="currentColor"/></svg>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M5 7.5l-1.4-1.7c.4-.3.9-.5 1.4-.5s1 .2 1.4.5L5 7.5zm-2.6-3l1 1.1c.4-.3.9-.5 1.6-.5s1.2.2 1.6.5l1-1.1C6.9 4 6 3.5 5 3.5S3.1 4 2.4 4.5zm-2-2L1.5 3.6C2.4 2.8 3.6 2.3 5 2.3s2.6.5 3.5 1.3l1.1-1.1C8.3 1.4 6.7 0.8 5 0.8S1.7 1.4 0.4 2.5z" fill="currentColor"/></svg>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><rect x="0.5" y="1" width="12" height="6" rx="1.2" stroke="currentColor" strokeOpacity="0.5" fill="none"/><rect x="1.6" y="2.1" width="9" height="3.8" rx="0.6" fill="currentColor"/><rect x="13" y="2.8" width="1.4" height="2.4" rx="0.5" fill="currentColor" fillOpacity="0.6"/></svg>
              </span>
            </div>
            {/* Spacer for dynamic island */}
            <div style={{height:"2.5%"}}/>
            {/* App header (brand logo if available, else partner-name text) */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3% 6% 2%"}}>
              {th.logo&&!customName ? <img src={th.logo} alt={th.name} style={{height:th.logoH,width:"auto",filter:th.logoFilter,display:"block"}}/> : <span style={{fontSize:14,fontWeight:800,color:th.text,letterSpacing:"-0.01em"}}>{displayName}</span>}
              <div style={{display:"flex",gap:4}}>
                <span style={{fontSize:8,color:th.muted,padding:"3px 7px",borderRadius:999,background:th.card,fontFamily:M}}>{tr("Portfolio")}</span>
                <span style={{fontSize:8,color:th.accent,padding:"3px 7px",borderRadius:999,background:th.accent+"22",fontWeight:700,fontFamily:M}}>{tr("Earn")}</span>
              </div>
            </div>
            {/* Scrollable body */}
            <div style={{flex:1,padding:"0 6%",overflow:"hidden"}}>
              {/* Blurred "Total Balance" placeholder — establishes parent app context */}
              <div style={{filter:"blur(2.5px)",opacity:0.55,marginBottom:6}}>
                <div style={{background:th.card,borderRadius:10,padding:"8px 10px"}}>
                  <p style={{fontSize:7,color:th.muted,margin:"0 0 2px",fontFamily:M,letterSpacing:"0.1em"}}>{tr("TOTAL BALANCE")}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <span style={{fontSize:14,fontWeight:800,color:th.text,fontFamily:M}}>{cs+"12,847.32"}</span>
                    <span style={{fontSize:9,color:th.safe,fontFamily:M,fontWeight:700}}>+1.84%</span>
                  </div>
                </div>
              </div>
              {/* Blurred quick action chips */}
              <div style={{filter:"blur(2px)",opacity:0.5,display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:3,marginBottom:8}}>
                {["Send","Receive","Swap","Buy"].map(function(a,i){return <div key={i} style={{background:th.card,borderRadius:6,padding:"6px 0",textAlign:"center"}}><div style={{width:10,height:10,borderRadius:3,background:th.accent,margin:"0 auto 2px",opacity:0.7}}/><span style={{fontSize:7,color:th.muted,fontFamily:M}}>{tr(a)}</span></div>;})}
              </div>
              {/* Norvex section — focal point, kept sharp + subtle glow ring */}
              <div style={{position:"relative",borderRadius:11,padding:1,background:"linear-gradient(135deg, "+th.accent+"55, transparent 60%)",marginBottom:8,boxShadow:"0 6px 18px "+th.accent+"22"}}>
                {/* Principal-Protected Note card */}
                <div style={{background:th.card,borderRadius:10,padding:"10px 11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{minWidth:0,flex:1}}>
                    <p style={{fontSize:8,color:th.muted,margin:"0 0 2px",fontFamily:M,letterSpacing:"0.08em"}}>{tr("POWERED BY NORVEX")}</p>
                    <p style={{fontSize:12,fontWeight:800,color:th.text,margin:0,lineHeight:1.15}}>{tr("Principal-Protected Note")}</p>
                  </div>
                  <div style={{textAlign:"right",marginLeft:6}}>
                    <p style={{fontSize:13,fontWeight:800,color:th.safe,margin:"0 0 2px",fontFamily:M}}>+4.12%</p>
                    <p style={{fontSize:8,color:th.muted,margin:0,fontFamily:M}}>{"47 "+tr("days")}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:2,height:5,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{width:"92%",background:th.accent}}/><div style={{width:"8%",background:th.accent2}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:8,color:th.muted,fontFamily:M}}>92% Kamino</span>
                  <span style={{fontSize:8,color:th.muted,fontFamily:M}}>8% Jupiter</span>
                </div>
                </div>
              </div>
              {/* Scenario row */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>{[{l:"Bull",v:"+9.8%",c:th.safe},{l:"Flat",v:"+5.1%",c:th.text},{l:"Bear",v:"-3.2%",c:th.danger}].map(function(sc,i){return <div key={i} style={{background:th.card,borderRadius:6,padding:"6px 4px",textAlign:"center"}}><p style={{fontSize:7,color:th.muted,margin:"0 0 2px",fontFamily:M,letterSpacing:"0.06em"}}>{tr(sc.l)}</p><p style={{fontSize:11,fontWeight:800,color:sc.c,margin:0,fontFamily:M}}>{sc.v}</p></div>;})}</div>
              {/* CTA row (pill buttons) */}
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <div style={{flex:1,background:th.card,borderRadius:999,padding:"8px 0",textAlign:"center",border:"1px solid "+th.accent+"33"}}><span style={{fontSize:10,color:th.muted,fontFamily:M,fontWeight:600}}>{tr("Adjust")}</span></div>
                <div style={{flex:2,background:th.accent,borderRadius:999,padding:"8px 0",textAlign:"center",boxShadow:"0 4px 12px "+th.accent+"55"}}><span style={{fontSize:10,fontWeight:800,color:th.deployText||"#FFFFFF",fontFamily:M}}>{tr("Deploy")+" "+cs+"1,000 →"}</span></div>
              </div>
              {/* AI Activity */}
              <p style={{fontSize:8,fontFamily:M,color:th.muted,letterSpacing:"0.1em",margin:"0 0 5px"}}>{tr("AI ACTIVITY")}</p>
              {[{t:"2h",m:tr("Compounded yield")+" +"+cs+"4.18",c:th.safe},{t:"1d",m:tr("Rebalanced to 92/8 (Bear 90)"),c:th.text},{t:"3d",m:tr("Guardrails: 6/6 passed"),c:th.safe}].map(function(a,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<2?"1px solid "+th.card:"none"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:5,height:5,borderRadius:"50%",background:a.c}}/><span style={{fontSize:9,color:th.text}}>{a.m}</span></div><span style={{fontSize:8,color:th.muted,fontFamily:M}}>{a.t}</span></div>;})}
              {/* Blurred "Recent transactions" placeholder */}
              <div style={{filter:"blur(2.5px)",opacity:0.5,marginTop:10}}>
                <p style={{fontSize:7,fontFamily:M,color:th.muted,letterSpacing:"0.1em",margin:"0 0 5px"}}>{tr("RECENT")}</p>
                {[{n:"Apple Pay",a:"-"+cs+"24.50",c:th.danger},{n:tr("Salary deposit"),a:"+"+cs+"4,200.00",c:th.safe},{n:tr("USDC swap"),a:"-"+cs+"500.00",c:th.muted}].map(function(rx,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<2?"1px solid "+th.card:"none"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:14,height:14,borderRadius:7,background:th.card}}/><span style={{fontSize:9,color:th.text}}>{rx.n}</span></div><span style={{fontSize:9,color:rx.c,fontFamily:M,fontWeight:700}}>{rx.a}</span></div>;})}
              </div>
            </div>
            {/* Bottom tab bar */}
            <div style={{borderTop:"1px solid "+th.card,padding:"2% 4% 5%",display:"flex",justifyContent:"space-around",alignItems:"center"}}>{[{l:"Home",on:false},{l:"Earn",on:true},{l:"Send",on:false},{l:"Profile",on:false}].map(function(t,i){return <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:t.on?1:0.55}}><div style={{width:14,height:14,borderRadius:4,background:t.on?th.accent:th.card}}/><span style={{fontSize:7,fontFamily:M,color:t.on?th.accent:th.muted,fontWeight:t.on?700:500}}>{tr(t.l)}</span></div>;})}</div>
            {/* Home indicator */}
            <div style={{display:"flex",justifyContent:"center",padding:"0 0 6px"}}><div style={{width:"32%",height:3,borderRadius:2,background:th.text,opacity:0.4}}/></div>
          </div>
          {/* iPhone 16 Pro Max frame (transparent screen cutout reveals content) */}
          <img src="/svg/iPhone%2016%20Pro%20Max%20Black%20Titanium.svg" alt="" aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:2,display:"block"}}/>
        </div>
      </div>
      <div style={{marginTop:12,background:BK,borderRadius:R_LG,padding:18,boxShadow:SHADOW_SM}}><p style={{fontSize:10,fontFamily:M,color:NX_2,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,margin:"0 0 10px"}}>{tr("THEME VALUES")}</p><pre style={{fontFamily:M,fontSize:11,color:"rgba(255,255,255,0.72)",lineHeight:1.85,margin:0,whiteSpace:"pre-wrap"}}>{"background: "+th.bg+"\ncard: "+th.card+"\naccent: "+th.accent+"\naccent2: "+th.accent2+"\ntext: "+th.text+"\nsafe: "+th.safe+"\ndanger: "+th.danger}</pre></div>
    </div>}
    {tab===3&&<div>
      <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 6px"}}>{tr("API REFERENCE")}</p>
      <p style={{fontSize:13,color:BODY2,margin:"0 0 16px",lineHeight:1.5}}>{tr("Four endpoints. REST + WebSocket.")}</p>
      {[{m:"POST",path:"/v1/portfolios",desc:"Create AI portfolio",body:'{ "goal": "...", "amount": 10000, "asset": "USDC", "wallet": "8xKf..." }',resp:'{ "id": "pf_abc", "allocation": {...}, "scenarios": {...}, "tx": "5xYm..." }'},{m:"GET",path:"/v1/portfolios/:id",desc:"Get status + NAV",body:"(none)",resp:'{ "value": 10412, "pnl": 4.12, "safe": 9582, "growth": 830, "status": "active" }'},{m:"POST",path:"/v1/portfolios/:id/withdraw",desc:"Withdraw funds",body:'{ "amount": "all" }',resp:'{ "tx": "7kPq...", "withdrawn": 10412, "status": "completed" }'},{m:"WS",path:"/v1/stream",desc:"Real-time updates",body:"Subscribe: portfolio_id",resp:"{ event: 'nav_update', value: 10415, timestamp: ... }"}].map(function(e,i){var ex=openEP===i;var mc=e.m==="POST"?GN:e.m==="GET"?NX_1:AM;return <div key={i} style={{marginBottom:10,background:WH,border:"1px solid "+BD,borderRadius:R_LG,boxShadow:SHADOW_SM,overflow:"hidden"}}><div onClick={function(){setOpenEP(ex?-1:i);}} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",cursor:"pointer"}}><span style={{fontSize:10,fontFamily:M,color:"#fff",fontWeight:700,background:mc,borderRadius:R_SM,padding:"3px 8px",minWidth:42,textAlign:"center"}}>{e.m}</span><div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontFamily:M,color:BK,margin:0,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis"}}>{e.path}</p><p style={{fontSize:11,color:MT,margin:"2px 0 0"}}>{tr(e.desc)}</p></div><span style={{fontSize:18,color:MT,fontFamily:M,lineHeight:1}}>{ex?"−":"+"}</span></div>{ex&&<div style={{background:BK,padding:"14px 16px"}}><p style={{fontSize:10,fontFamily:M,color:NX_2,margin:"0 0 4px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{tr("REQUEST BODY")}</p><pre style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.7)",margin:"0 0 12px",whiteSpace:"pre-wrap",lineHeight:1.6}}>{e.body}</pre><p style={{fontSize:10,fontFamily:M,color:NX_2,margin:"0 0 4px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{tr("RESPONSE")}</p><pre style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.7)",margin:0,whiteSpace:"pre-wrap",lineHeight:1.6}}>{e.resp}</pre></div>}</div>;})}</div>}
    {tab===4&&<div>
      <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 6px"}}>{tr("PRICING")}</p>
      <p style={{fontSize:13,color:BODY2,margin:"0 0 16px",lineHeight:1.5}}>{tr("Usage-based. You only pay as your TVL grows.")}</p>
      {[
        {plan:"Starter",price:tr("Free"),note:tr("Up to")+" "+cs+"100K TVL",dark:false,rec:false,feats:["Sandbox + production keys","Core REST API","Community support"]},
        {plan:"Growth",price:"15 bps",note:tr("Per year on TVL"),dark:true,rec:true,feats:["Everything in Starter","Custom branding","Webhooks & analytics","Dedicated support"]},
        {plan:"Enterprise",price:tr("Custom"),note:tr("Volume pricing"),dark:false,rec:false,feats:["Everything in Growth","SLA guarantee","White-glove onboarding","Custom contracts"]},
      ].map(function(pl,i){return (
        <div key={i} style={{position:"relative",marginBottom:10,background:pl.dark?BK:WH,border:"1px solid "+(pl.dark?BK:BD),borderRadius:R_LG,padding:20,boxShadow:pl.dark?SHADOW_MD:SHADOW_SM}}>
          {pl.rec&&<span style={{position:"absolute",top:16,right:16,fontSize:9,fontFamily:M,fontWeight:700,color:BK,background:NX_2,borderRadius:R_PILL,padding:"3px 9px",letterSpacing:"0.04em"}}>{tr("RECOMMENDED")}</span>}
          <p style={{fontSize:14,fontWeight:700,color:pl.dark?WH:BK,margin:"0 0 4px",fontFamily:FD}}>{tr(pl.plan)}</p>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:14}}>
            <span style={{fontSize:30,fontWeight:600,fontFamily:FD,color:pl.dark?WH:BK,letterSpacing:"-0.8px"}}>{pl.price}</span>
            <span style={{fontSize:11,color:pl.dark?"rgba(255,255,255,0.5)":MT,fontFamily:M}}>{pl.note}</span>
          </div>
          {pl.feats.map(function(ft,j){return (
            <div key={j} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pl.dark?NX_2:GN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{fontSize:12.5,color:pl.dark?"rgba(255,255,255,0.8)":LT,lineHeight:1.4}}>{tr(ft)}</span>
            </div>
          );})}
          <div style={{marginTop:14}}><Btn small full black={!pl.dark} primary={pl.dark} onClick={function(){setShowForm(true);}}>{pl.plan==="Enterprise"?tr("Contact sales"):tr("Get started")}</Btn></div>
        </div>
      );})}
    </div>}
    {tab===5&&<div>
      <p style={{fontSize:11,fontFamily:M,color:NX_1,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,margin:"4px 0 6px"}}>{tr("COMPLIANCE")}</p>
      <p style={{fontSize:13,color:BODY2,margin:"0 0 16px",lineHeight:1.5}}>{tr("Built for regulated partners from day one.")}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:18}}>
        {[
          {t:"Regulatory",d:"MiCA-ready architecture. Structured products issued under partner license.",icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>)},
          {t:"KYC / AML",d:"Integrates with your existing KYC/AML provider — Norvex stores no PII.",icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>)},
          {t:"Audits",d:"Smart contracts audited (OtterSec / Halborn) before mainnet.",icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>)},
          {t:"Data",d:"GDPR-compliant. No personal data stored on-chain.",icon:(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)},
        ].map(function(c,i){return (
          <div key={i} style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:18,boxShadow:SHADOW_SM}}>
            <div style={{width:36,height:36,borderRadius:R_MD,background:BK,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>{c.icon}</div>
            <p style={{fontSize:14,fontWeight:700,margin:"0 0 4px",color:BK,fontFamily:FD}}>{tr(c.t)}</p>
            <p style={{fontSize:12.5,color:BODY2,margin:0,lineHeight:1.5}}>{tr(c.d)}</p>
          </div>
        );})}
      </div>
      <div style={{background:WH,border:"1px solid "+BD,borderRadius:R_LG,padding:20,boxShadow:SHADOW_SM}}><p style={{fontSize:10,fontFamily:M,color:NX_1,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,margin:"0 0 12px"}}>{tr("WEBHOOKS")}</p><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 6px",letterSpacing:"0.06em"}}>{tr("ENDPOINT")}</p><input placeholder="https://yourapp.com/webhooks/norvex" style={{width:"100%",padding:"10px 12px",fontSize:12,fontFamily:M,border:"1px solid "+BD,borderRadius:R_SM,boxSizing:"border-box",outline:"none",marginBottom:12}}/>{["deposit","withdraw","rebalance"].map(function(ev,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<2?"1px solid "+GY:"none"}}><span style={{fontSize:13,color:LT,fontFamily:M}}>{tr(ev)}</span><Toggle on={hooks[ev]} onClick={function(){var c=Object.assign({},hooks);c[ev]=!c[ev];setHooks(c);}}/></div>;})}</div>
    </div>}
    <div style={{marginTop:20}}><Btn black full onClick={function(){setShowForm(true);}}>{tr("Request API Access")}</Btn></div>
    {showForm&&(function(){
      var inS={width:"100%",padding:"11px 12px",fontSize:14,fontFamily:F,border:"1px solid "+BD,borderRadius:R_SM,boxSizing:"border-box",outline:"none",color:BK,background:BG};
      var lbS={fontSize:11,fontFamily:M,color:MT,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 6px",display:"block"};
      return <div onClick={function(){setShowForm(false);}} style={{position:"fixed",inset:0,background:"rgba(15,15,20,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:WH,borderRadius:R_LG,padding:24,maxWidth:440,width:"100%",boxShadow:SHADOW_MD,maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <p style={{fontSize:19,fontWeight:700,color:BK,margin:0,fontFamily:FD}}>{tr("Request API Access")}</p>
            <span onClick={function(){setShowForm(false);}} style={{fontSize:20,color:MT,cursor:"pointer",lineHeight:1,fontFamily:M}}>{"×"}</span>
          </div>
          <p style={{fontSize:13,color:BODY2,margin:"0 0 18px",lineHeight:1.5}}>{tr("Tell us a bit about you and we'll be in touch within 24h.")}</p>
          <div style={{marginBottom:12}}><label style={lbS}>{tr("Company")}</label><input value={req.company} onChange={function(e){setReqK("company",e.target.value);}} placeholder={tr("Acme Neobank")} style={inS}/></div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1}}><label style={lbS}>{tr("First name")}</label><input value={req.first} onChange={function(e){setReqK("first",e.target.value);}} placeholder={tr("Jane")} style={inS}/></div>
            <div style={{flex:1}}><label style={lbS}>{tr("Last name")}</label><input value={req.last} onChange={function(e){setReqK("last",e.target.value);}} placeholder={tr("Doe")} style={inS}/></div>
          </div>
          <div style={{marginBottom:18}}><label style={lbS}>{tr("Work email or LinkedIn")}</label><input value={req.contact} onChange={function(e){setReqK("contact",e.target.value);}} placeholder={tr("jane@acme.com or linkedin.com/in/jane")} style={inS}/></div>
          <Btn black full onClick={submitRequest}>{tr("Submit request")}</Btn>
        </div>
      </div>;
    })()}
  </div>;}

// ━━━ ADMIN ━━━
function _curSym(){if(typeof window==="undefined")return "€";var c=localStorage.getItem("norvex_currency");return c==="USD"?"$":c==="GBP"?"£":"€";}
function adminMoney(n){return _curSym()+Math.round(Number(n)||0).toLocaleString();}

export function Admin(p){var s=useState(0),tab=s[0],setTab=s[1];var sd=useState(null),data=sd[0],setData=sd[1];var tr=useLang().t;var tabs=["Analytics","Revenue","Users","Health","Brain","Backtest","Agents","Training","Protocols","Guardrails","Settings"];
  useEffect(function(){fetch("/api/admin/analytics").then(function(r){return r.ok?r.json():null;}).then(function(d){setData(d);}).catch(function(){setData(null);});},[]);
  return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
    <div style={{padding:"0 0 20px"}}>
      <Label>{tr("ADMIN PANEL")}</Label>
      <H2>{tr("Brain Command Center.")}</H2>
      <Sub>{tr("Real-time analytics, revenue, decision logs, backtests and strategy control.")}</Sub>
    </div>
    <div style={{display:"flex",gap:3,marginBottom:14,flexWrap:"wrap"}}>{tabs.map(function(t,i){return <Tab key={i} active={tab===i} onClick={function(){setTab(i);}}>{tr(t)}</Tab>;})}</div>
    {tab===0&&<AdminAnalytics data={data}/>}
    {tab===1&&<AdminRevenue data={data}/>}
    {tab===2&&<AdminUsers data={data}/>}
    {tab===3&&<AdminHealth data={data}/>}
    {tab===4&&<AdminBrain/>}
    {tab===5&&<AdminBacktest/>}
    {tab===6&&<AdminAgents/>}
    {tab===7&&<AdminTraining/>}
    {tab===8&&<AdminProtocols/>}
    {tab===9&&<AdminGuardrails/>}
    {tab===10&&<AdminSettings/>}
    <div style={{marginTop:16}}><Btn outline full onClick={function(){p.setScreen(S.DASH);}}>{tr("< Dashboard")}</Btn></div>
  </div>;}

function AdminSettings(){
  var cur=useCurrency();var t=useLang().t;
  return <div>
    <Label mb={8}>{t("DISPLAY CURRENCY")}</Label>
    <p style={{fontSize:12,color:LT,marginBottom:12,lineHeight:1.5}}>{t("Choose the symbol shown across the entire app — Landing, Simulator, Goal, Preview, Deployed, Dashboard, Admin, and the white-label mockup. Default is Euro for EU markets.")}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
      {CURRENCIES.map(function(c){var active=cur.code===c.code;return <button key={c.code} onClick={function(){cur.setCode(c.code);}} style={{background:active?BK:WH,color:active?WH:BK,border:"1px solid "+(active?BK:BD),borderRadius:10,padding:"14px 8px",cursor:"pointer",fontFamily:F,boxShadow:active?SHADOW_SM:"none",transition:"all 0.15s"}}>
        <div style={{fontSize:28,fontWeight:800,lineHeight:1,marginBottom:6,fontFamily:M}}>{c.symbol}</div>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:"-0.01em"}}>{c.code}</div>
        <div style={{fontSize:10,color:active?WH:MT,marginTop:2,fontFamily:M}}>{c.name}</div>
      </button>;})}
    </div>
    <Card hl>
      <Label mb={6}>{t("PREVIEW")}</Label>
      <Row l={t("Sample amount")} v={cur.format(12847)}/>
      <Row l={t("Compact (1.2M)")} v={cur.formatK(1247000)}/>
      <Row l={t("Small balance")} v={cur.format(100)} last/>
    </Card>
  </div>;
}

function AdminAnalytics(props){var data=props.data;var t=useLang().t;if(!data)return <Card hl><p style={{fontSize:12,color:LT,margin:0}}>{t("Loading analytics… (admin access required)")}</p></Card>;
  var c=data.counts||{};var rev=data.revenue||{};var u=data.usage||{};
  return <div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}><Stat n={adminMoney(data.tvl)} d={t("Total TVL")} big/><Stat n={String(c.portfolios||0)} d={t("Portfolios")} big/><Stat n={adminMoney((rev.total||0)/12)} d={t("Revenue/mo")} big/></div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}><Stat n={String(c.accounts||0)} d={t("Accounts")}/><Stat n={(data.avgReturn>=0?"+":"")+(data.avgReturn||0)+"%"} d={t("Avg return")} c={GN}/><Stat n={(c.real||0)+" / "+(c.demo||0)} d={t("Real / demo")}/><Stat n={adminMoney(rev.total)} d={t("Revenue (life)")}/></div>
  <Card hl style={{marginBottom:8}}><Label mb={8}>{t("USAGE (FOCUS GROUP)")}</Label><div style={{display:"flex",gap:8}}>{[{d:"Sessions",v:u.sessions||0},{d:"Sims",v:u.sims||0},{d:"Deploys",v:u.deploys||0}].map(function(r,i){var max=Math.max(1,u.sessions||0,u.sims||0,u.deploys||0);return <div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:48,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:Math.max((r.v/max)*48,4),background:BK,borderRadius:"4px 4px 0 0"}}/></div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"4px 0 0"}}>{t(r.d)}</p><p style={{fontSize:11,fontWeight:700,margin:0}}>{r.v}</p></div>;})}</div></Card>
  <Card hl><Label mb={8}>{t("PORTFOLIO MIX")}</Label><div style={{display:"flex",gap:4}}>{[{l:"Real",c:c.real||0},{l:"Demo",c:c.demo||0}].map(function(r,i){var max=Math.max(1,c.real||0,c.demo||0);return <div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:48,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:Math.max((r.c/max)*48,4),background:i===0?BK:BD,borderRadius:"4px 4px 0 0"}}/></div><p style={{fontSize:9,fontFamily:M,color:MT,margin:"4px 0 0"}}>{t(r.l)}</p><p style={{fontSize:11,fontWeight:700,margin:0}}>{r.c}</p></div>;})}</div></Card>
</div>;}

function AdminRevenue(props){var data=props.data;var t=useLang().t;if(!data)return <Card hl><p style={{fontSize:12,color:LT,margin:0}}>{t("Loading…")}</p></Card>;var rev=data.revenue||{};
  return <div><Label mb={8}>{t("MONETIZATION")}</Label><p style={{fontSize:12,color:LT,marginBottom:12}}>{t("0.75%/yr management + 10% performance. B2B portfolios revenue-shared 60% to Norvex.")}</p>
  <Card hl style={{marginBottom:8}}><Row l={t("Management fees")} v={adminMoney(rev.mgmt)}/><Row l={t("Performance fees")} v={adminMoney(rev.perf)}/><Row l={t("Total Norvex revenue")} v={adminMoney(rev.total)} vc={GN}/><Row l={t("Monthly run-rate")} v={adminMoney((rev.total||0)/12)} last/></Card>
  <Card><Row l={t("Total TVL")} v={adminMoney(data.tvl)}/><Row l={t("Effective take rate")} v={data.tvl?((rev.total/data.tvl*100).toFixed(2)+"%"):"—"} last/></Card></div>;}

function AdminUsers(props){var data=props.data;var s=useState(-1),open=s[0],setOpen=s[1];var t=useLang().t;if(!data)return <Card hl><p style={{fontSize:12,color:LT,margin:0}}>{t("Loading…")}</p></Card>;var accts=data.accounts||[];var pfs=data.portfolios||[];
  if(accts.length===0)return <Card hl><p style={{fontSize:12,color:LT,margin:0}}>{t("No accounts yet. They appear as testers connect or create demo accounts.")}</p></Card>;
  return <div><Label mb={8}>{t("USERS")+" ("+accts.length+")"}</Label>{accts.map(function(a,i){var isOpen=open===i;var mine=pfs.filter(function(x){return x.wallet_address===a.wallet_address;});return <div key={i} style={{marginBottom:4}}>
    <div onClick={function(){setOpen(isOpen?-1:i);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:isOpen?GY:WH,border:"1px solid "+(isOpen?BK:BD),borderRadius:isOpen?"8px 8px 0 0":8,cursor:"pointer"}}>
      <div style={{flex:1}}><p style={{fontSize:12,fontFamily:M,fontWeight:700,margin:0}}>{(a.wallet_address||"").slice(0,4)+".."+(a.wallet_address||"").slice(-4)}</p><p style={{fontSize:10,color:MT,margin:0}}>{(a.role||"user")+(a.is_demo?" · demo":"")}</p></div>
      <div style={{textAlign:"right"}}><p style={{fontSize:12,fontWeight:700,margin:0,fontFamily:M}}>{adminMoney(a.total_value)}</p><p style={{fontSize:10,color:MT,margin:0}}>{(a.portfolios||0)+" "+t("pf")}</p></div>
    </div>
    {isOpen&&<div style={{border:"1px solid "+BK,borderTop:"none",borderRadius:"0 0 8px 8px",padding:10}}>{mine.length?mine.map(function(x,j){return <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:11,color:LT}}>{(x.name||t("Portfolio"))+" · "+(x.asset||"SOL")}</span><span style={{fontSize:11,fontFamily:M}}>{adminMoney(x.value||x.amount)}</span></div>;}):<p style={{fontSize:11,color:MT,margin:0}}>{t("No portfolios.")}</p>}</div>}
  </div>;})}</div>;}

function AdminHealth(props){var data=props.data;var ok=!!(data&&data.configured);var tr=useLang().t;
  var svcs=[{n:"API Gateway",ok:true},{n:"AI Orchestrator",ok:true},{n:"Database (Neon)",ok:ok},{n:"Rebalance Bot",ok:true},{n:"Vault Program",ok:true}];
  return <div><Card hl style={{marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:ok?GN:RD}}/><span style={{fontSize:14,fontWeight:700}}>{ok?tr("All systems operational"):tr("Database not reachable")}</span></div></Card>
  {svcs.map(function(s,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<svcs.length-1?"1px solid "+GY:"none"}}><span style={{fontSize:13,color:LT}}>{tr(s.n)}</span><span style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontFamily:M,color:s.ok?GN:RD}}><div style={{width:8,height:8,borderRadius:"50%",background:s.ok?GN:RD}}/>{s.ok?tr("healthy"):tr("down")}</span></div>;})}
  <Card hl style={{marginTop:12}}><Label mb={8}>{tr("ALERT THRESHOLDS")}</Label>{[ "Drawdown exceeds 4%","Protocol score below 65","AI cost per portfolio > $0.05"].map(function(t,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<2?"1px solid "+BD:"none"}}><span style={{fontSize:12,color:LT}}>{tr(t)}</span><Toggle on={i<2} onClick={function(){}}/></div>;})}</Card></div>;}

function AdminBrain(){var s=useState(-1),expanded=s[0],setExp=s[1];var sd=useState(null),logs=sd[0],setLogs=sd[1];var tr=useLang().t;
  useEffect(function(){fetch("/api/admin/decisions").then(function(r){return r.ok?r.json():{decisions:[]};}).then(function(d){setLogs(d.decisions||[]);}).catch(function(){setLogs([]);});},[]);
  function ago(ts){if(!ts)return "";var v=Math.round((Date.now()-new Date(ts).getTime())/1000);if(v<60)return v+tr("s ago");if(v<3600)return Math.round(v/60)+tr("m ago");if(v<86400)return Math.round(v/3600)+tr("h ago");return Math.round(v/86400)+tr("d ago");}
  function fmtTranscript(t){if(!t||typeof t!=="object")return null;try{return "BULL (conf "+Math.round(t.bullConfidence)+"): "+t.bullCase+"\n\nBEAR (conf "+Math.round(t.bearConfidence)+"): "+t.bearCase+"\n\nPM DECISION: "+Math.round(t.decisionGrowthPct)+"% growth. "+t.pmRationale;}catch(e){return null;}}
  return <div>
    <Label mb={8}>{tr("AI BRAIN MONITOR")}</Label>
    <p style={{fontSize:12,color:LT,marginBottom:12}}>{tr("Real decisions logged by the live pipeline. Click to inspect the debate transcript.")}</p>
    {logs===null&&<p style={{fontSize:12,color:MT}}>{tr("Loading…")}</p>}
    {logs&&logs.length===0&&<Card hl><p style={{fontSize:12,color:LT,margin:0}}>{tr("No decisions logged yet. Build a portfolio (or run the B2B playground) to populate the brain monitor.")}</p></Card>}
    {(logs||[]).map(function(log,i){var isOpen=expanded===i;var alloc=log.allocation||{};var trans=fmtTranscript(log.transcript);var gp=log.guardrails_passed||0;return <div key={log.id||i} style={{marginBottom:6}}>
      <Card hl={isOpen} style={{cursor:"pointer",borderColor:isOpen?BK:BD}} onClick={function(){setExp(isOpen?-1:i);}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:700}}>{tr("Portfolio Manager")}</span><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:10,fontFamily:M,background:gp>=6?TINT_GN_BG:TINT_AM_BG,color:gp>=6?GN:AM,padding:"2px 6px",borderRadius:3}}>{gp}/6</span><span style={{fontSize:10,fontFamily:M,color:MT}}>{ago(log.created_at)}</span></div></div>
        <p style={{fontSize:12,color:LT,margin:"0 0 4px"}}>{Math.round(alloc.safePct||0)+"/"+Math.round(alloc.growthPct||0)+" split · "+((log.parsed&&log.parsed.asset)||"SOL")}</p>
        <div style={{display:"flex",gap:12}}><span style={{fontSize:10,fontFamily:M,color:MT}}>{tr("Cost:")} ${Number(log.cost||0).toFixed(3)}</span><span style={{fontSize:10,fontFamily:M,color:MT}}>{tr("Latency:")} {((log.latency_ms||0)/1000).toFixed(1)}s</span><span style={{fontSize:10,fontFamily:M,color:GN}}>{log.model}</span></div>
      </Card>
      {isOpen&&<Card style={{marginTop:2,borderTop:"2px solid "+BK}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:trans?10:0}}>
          <div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 2px"}}>{tr("GOAL")}</p><pre style={{fontFamily:M,fontSize:10,color:LT,margin:0,whiteSpace:"pre-wrap",background:GY,padding:8,borderRadius:4}}>{log.goal||"—"}</pre></div>
          <div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 2px"}}>{tr("ALLOCATION")}</p><pre style={{fontFamily:M,fontSize:10,color:LT,margin:0,whiteSpace:"pre-wrap",background:GY,padding:8,borderRadius:4}}>{JSON.stringify(alloc,null,1)}</pre></div>
        </div>
        {trans&&<div><p style={{fontSize:10,fontFamily:M,color:AM,fontWeight:700,margin:"0 0 4px"}}>{tr("BULL / BEAR DEBATE TRANSCRIPT")}</p><pre style={{fontFamily:M,fontSize:10,color:LT,lineHeight:1.6,margin:0,whiteSpace:"pre-wrap",background:TINT_AM_BG,padding:10,borderRadius:6,border:"1px solid "+TINT_AM_BD}}>{trans}</pre></div>}
      </Card>}
    </div>;})}
  </div>;}

function AdminBacktest(){var s=useState(1),range=s[0],setRange=s[1];var sd=useState(null),data=sd[0],setData=sd[1];var t=useLang().t;
  var ranges=["6 months","1 year","2 years","All time"];var colors=[GN,BK,AM,MT];
  useEffect(function(){setData(null);fetch("/api/backtest?range="+range).then(function(r){return r.ok?r.json():{strategies:[]};}).then(function(d){setData(d.strategies||[]);}).catch(function(){setData([]);});},[range]);
  return <div>
    <Label mb={8}>{t("BACKTESTING ENGINE")}</Label>
    <p style={{fontSize:12,color:LT,marginBottom:12}}>{t("Real Monte-Carlo backtest (live engine, SOL params). AI split vs simple strategies.")}</p>
    <div style={{display:"flex",gap:3,marginBottom:14}}>{ranges.map(function(r,i){return <Tab key={i} active={range===i} onClick={function(){setRange(i);}}>{t(r)}</Tab>;})}</div>
    {!data&&<p style={{fontSize:12,color:MT}}>{t("Running simulation…")}</p>}
    {data&&data.length>0&&<div>
    <Card hl style={{marginBottom:12,padding:"16px 12px"}}><Label mb={4}>{t("CUMULATIVE RETURN")}</Label><div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>{data.map(function(st,i){var val=parseFloat(st.ret);return <div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:Math.max(Math.abs(val)*0.8,4),background:colors[i%4],borderRadius:"4px 4px 0 0",marginBottom:4,opacity:st.best?1:0.5}}/><p style={{fontSize:9,fontFamily:M,color:MT,margin:0}}>{st.name.split("(")[0].trim()}</p><p style={{fontSize:12,fontWeight:700,color:colors[i%4],margin:0}}>{st.ret}</p></div>;})}</div></Card>
    {data.map(function(st,i){return <Card key={i} hl={st.best} style={{marginBottom:6,borderColor:st.best?GN+"44":BD}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:12,fontWeight:700}}>{st.name}</span>{st.best&&<span style={{fontSize:9,fontFamily:M,background:TINT_GN_BG,color:GN,padding:"2px 6px",borderRadius:3}}>{t("BEST RISK-ADJUSTED")}</span>}</div>
      <div style={{display:"flex",gap:16}}><span style={{fontSize:11,fontFamily:M,color:LT}}>{t("Return:")} <b style={{color:colors[i%4]}}>{st.ret}</b></span><span style={{fontSize:11,fontFamily:M,color:LT}}>{t("Sharpe:")} <b>{st.sharpe}</b></span><span style={{fontSize:11,fontFamily:M,color:LT}}>{t("Max DD:")} <b style={{color:parseFloat(st.dd)<-10?RD:BK}}>{st.dd}</b></span></div>
    </Card>;})}
    </div>}
  </div>;}

function AdminAgents(){var s=useState(-1),open=s[0],setOpen=s[1];
  var agents=[
    {name:"NLP Parser",model:"Claude Haiku",lat:"300ms",cost:"$0.003",calls:1,status:"active",override:0,
     prompt:"You extract investment parameters from natural language. Return JSON: amount, max_dd, risk_score (0-100), preferred_assets, time_horizon. If ambiguous, use conservative interpretation. If amount or max_dd cannot be inferred, ask ONE clarifying question.",
     lastInput:'"Grow my $10K USDC. Max 5% loss."',lastOutput:'{ "amount": 10000, "asset": "USDC", "max_dd": 0.05, "risk": 15, "horizon": "open" }'},
    {name:"Market Analyst",model:"APIs (no LLM)",lat:"500ms",cost:"$0",calls:1,status:"active",override:0,
     prompt:"(Deterministic) Fetches: Pyth prices, DeFi Llama yields, Jupiter funding rates. Computes 30d/90d volatility. Classifies market regime.",
     lastInput:"assets: [SOL, USDC], protocols: [kamino, jupiter]",lastOutput:'{ sol_price: 178, vol_30d: 0.52, kamino_apy: 6.2, regime: "risk_on" }'},
    {name:"Risk Engine",model:"Python/NumPy",lat:"1.5s",cost:"$0",calls:1,status:"active",override:0,
     prompt:"(Deterministic) GBM + Merton jump diffusion. 10K paths. Sweeps safe/growth ratios 99/1 to 75/25. Returns optimal ratio maximizing Sharpe subject to VaR95 <= max_dd.",
     lastInput:"market_data + allocation_sweep",lastOutput:'{ optimal: { safe: 92, growth: 8 }, var_95: 0.042, sharpe: 1.18 }'},
    {name:"Bull/Bear Analyst",model:"Claude Sonnet",lat:"2s",cost:"$0.02",calls:1,status:"active",override:0,
     prompt:"First argue BULL case (why more growth). Then argue BEAR case (why less growth). Then DECIDE citing which is stronger. Decision MUST keep VaR95 <= max_dd. Include confidence scores.",
     lastInput:"market analysis + Monte Carlo results + user params",lastOutput:'BULL: 12% (confidence 65). BEAR: 8% (confidence 90). DECISION: 8% -- Bear stronger.'},
    {name:"Protocol Scorer",model:"Deterministic",lat:"200ms",cost:"$0",calls:1,status:"active",override:0,
     prompt:"(Deterministic) Score = audit(0-30) + tvl_stability(0-25) + age(0-20) + incidents(0-15) + insurance(0-10). Block if < 60.",
     lastInput:"[kamino, jupiter, marinade, drift, solend]",lastOutput:"kamino:87, jupiter:74, marinade:82, drift:71, solend:58(BLOCKED)"},
    {name:"Guardrail Validator",model:"Rust",lat:"50ms",cost:"$0",calls:1,status:"active",override:0,
     prompt:"(Deterministic) 6 checks: growth<=25%, VaR<=max_dd, stress -50%, stress -80%, exploit test, protocols>=60. ALL must pass.",
     lastInput:"allocation: 92/8, var: 0.042, protocols: [87, 74]",lastOutput:"APPROVED: 6/6 passed"},
    {name:"PM Explainer",model:"Claude Sonnet",lat:"1s",cost:"$0.01",calls:1,status:"active",override:0,
     prompt:"Present allocation to user. Generate: 3 scenario cards (bull/flat/bear with exact $), 2-sentence reasoning, max loss in dollars, fee disclosure. Be honest. Plain English. No jargon.",
     lastInput:"validated allocation + reasoning",lastOutput:'"92% safe (Kamino), 8% growth (Jupiter). Max loss: $500 (5%)."'},
  ];
  var t=useLang().t;
  return <div>
    <Label mb={8}>{t("AGENT ARCHITECTURE")}</Label>
    <p style={{fontSize:12,color:LT,marginBottom:12}}>{t("Click any agent to inspect system prompt, recent I/O, and metrics.")}</p>
    {agents.map(function(ag,i){var isOpen=open===i;return <div key={i} style={{marginBottom:4}}>
      <div onClick={function(){setOpen(isOpen?-1:i);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:isOpen?GY:WH,border:"1px solid "+(isOpen?BK:BD),borderRadius:isOpen?"8px 8px 0 0":8,cursor:"pointer"}}>
        <span style={{fontSize:14,fontWeight:800,fontFamily:M,minWidth:18}}>{i+1}</span>
        <div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,margin:0}}>{ag.name}</p><p style={{fontSize:10,fontFamily:M,color:MT,margin:0}}>{ag.model} / {ag.lat} / {ag.cost}</p></div>
        <div style={{width:8,height:8,borderRadius:"50%",background:GN}}/>
      </div>
      {isOpen&&<div style={{border:"1px solid "+BK,borderTop:"none",borderRadius:"0 0 8px 8px",padding:12}}>
        <p style={{fontSize:10,fontFamily:M,color:AM,fontWeight:700,margin:"0 0 4px"}}>{t("SYSTEM PROMPT")}</p>
        <pre style={{fontFamily:M,fontSize:10,color:LT,lineHeight:1.5,margin:"0 0 10px",whiteSpace:"pre-wrap",background:GY,padding:10,borderRadius:6}}>{ag.prompt}</pre>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 2px"}}>{t("LAST INPUT")}</p><pre style={{fontFamily:M,fontSize:9,color:LT,margin:0,whiteSpace:"pre-wrap",background:GY,padding:6,borderRadius:4}}>{ag.lastInput}</pre></div>
          <div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 2px"}}>{t("LAST OUTPUT")}</p><pre style={{fontFamily:M,fontSize:9,color:LT,margin:0,whiteSpace:"pre-wrap",background:GY,padding:6,borderRadius:4}}>{ag.lastOutput}</pre></div>
        </div>
        <div style={{display:"flex",gap:12}}><span style={{fontSize:10,fontFamily:M,color:MT}}>{t("Total calls:")} {ag.calls}</span><span style={{fontSize:10,fontFamily:M,color:MT}}>{t("Overrides:")} {ag.override}</span><span style={{fontSize:10,fontFamily:M,color:GN}}>{t("Status:")} {ag.status}</span></div>
      </div>}
    </div>;})}
  </div>;}

function AdminTraining(){
  var s=useState(-1),openSkill=s[0],setOpenSkill=s[1];
  var s2=useState(false),showAdd=s2[0],setShowAdd=s2[1];
  var s3=useState([
    {name:"detect_high_volatility",agent:"Market Analyst",on:true,v:"1.2",prompt:"Check if 7d realized vol exceeds 2x the 30d average. If so, flag HIGH_VOL and recommend reducing growth by 30%."},
    {name:"compare_protocol_yields",agent:"Protocol Scorer",on:true,v:"1.0",prompt:"Compare yields across safe-leg protocols. If current yield >100bps below best alternative, recommend switching."},
    {name:"explain_for_beginners",agent:"PM Explainer",on:true,v:"1.1",prompt:"User is first-time investor. Use metaphors. Avoid jargon. Compare to savings accounts."},
    {name:"whale_movement_alert",agent:"On-Chain Analyst",on:false,v:"0.1",prompt:"Monitor transfers >$1M of growth asset. If whale selling exceeds 3x daily avg, flag dump risk."},
  ]),skills=s3[0],setSkills=s3[1];
  var s4=useState(""),newName=s4[0],setNewName=s4[1];var s5=useState(""),newPrompt=s5[0],setNewPrompt=s5[1];
  var t=useLang().t;
  function toggleSkill(idx){var copy=skills.slice();copy[idx]=Object.assign({},copy[idx],{on:!copy[idx].on});setSkills(copy);}
  return <div>
    <Card hl style={{marginBottom:12}}><Label mb={6}>{t("OUTCOME DATASET")}</Label><Row l={t("Total allocations")} v="1"/><Row l={t("Beat expectations")} v="1 (100%)"/><Row l={t("Training data points")} v={"47 "+t("snapshots")}/><Row l={t("Learning loop")} v={t("Active")} last vc={GN}/></Card>
    <Card hl style={{marginBottom:12}}><Label mb={6}>{t("A/B TEST: PM PROMPT")}</Label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Card style={{border:"2px solid "+GN}}><p style={{fontSize:11,fontWeight:700,margin:"0 0 4px"}}>{t("Variant A (live)")}</p><p style={{fontSize:10,color:MT,margin:"0 0 4px"}}>{t("Conservative bias")}</p><p style={{fontSize:14,fontFamily:M,fontWeight:700,color:GN,margin:0}}>Sharpe 1.18</p></Card>
        <Card><p style={{fontSize:11,fontWeight:700,margin:"0 0 4px"}}>{t("Variant B (test)")}</p><p style={{fontSize:10,color:MT,margin:"0 0 4px"}}>{t("Balanced bias")}</p><p style={{fontSize:14,fontFamily:M,fontWeight:700,color:AM,margin:0}}>Sharpe 1.05</p></Card>
      </div>
      <div style={{display:"flex",gap:8}}><Btn small black style={{flex:1}}>{t("Deploy A (winner)")}</Btn><Btn small outline style={{flex:1}}>{t("Swap to B")}</Btn></div>
    </Card>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Label mb={0}>{t("AGENT SKILLS")}</Label><Btn small black onClick={function(){setShowAdd(!showAdd);}}>{showAdd?t("Cancel"):t("+ Add Skill")}</Btn></div>
    {showAdd&&<Card style={{marginBottom:8,border:"2px solid "+BK}}>
      <input value={newName} onChange={function(e){setNewName(e.target.value);}} placeholder={t("skill_name")} style={{width:"100%",padding:8,fontSize:12,fontFamily:M,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none",marginBottom:6}}/>
      <textarea value={newPrompt} onChange={function(e){setNewPrompt(e.target.value);}} placeholder={t("Prompt fragment...")} style={{width:"100%",minHeight:50,padding:8,fontSize:12,fontFamily:M,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none",resize:"vertical",marginBottom:6}}/>
      <Btn small black full onClick={function(){if(newName&&newPrompt){setSkills(skills.concat([{name:newName,agent:"Custom",on:true,v:"1.0",prompt:newPrompt}]));setNewName("");setNewPrompt("");setShowAdd(false);}}}>{t("Save Skill")}</Btn>
    </Card>}
    {skills.map(function(sk,i){var isOpen=openSkill===i;return <div key={i} style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:"1px solid "+GY}}>
        <Toggle on={sk.on} onClick={function(){toggleSkill(i);}}/>
        <div style={{flex:1,cursor:"pointer"}} onClick={function(){setOpenSkill(isOpen?-1:i);}}>
          <p style={{fontSize:12,fontFamily:M,color:sk.on?BK:MT,margin:0}}>{sk.name}</p>
          <p style={{fontSize:10,color:MT,margin:0}}>{sk.agent} / v{sk.v}</p>
        </div>
        <span style={{fontSize:11,color:MT}}>{isOpen?"-":"+"}</span>
      </div>
      {isOpen&&<Card hl style={{marginTop:2}}>
        <pre style={{fontFamily:M,fontSize:10,color:LT,lineHeight:1.5,margin:"0 0 8px",whiteSpace:"pre-wrap"}}>{sk.prompt}</pre>
        <div style={{display:"flex",gap:6}}><Btn small outline>{t("Edit")}</Btn><Btn small outline>{t("Duplicate")}</Btn><Btn small danger outline>{t("Delete")}</Btn></div>
      </Card>}
    </div>;})}
    <Card style={{marginTop:12,background:GY}}><Label mb={4}>{t("VERSION CONTROL")}</Label>{[{v:"v1.2",date:"May 15",change:"Updated detect_high_volatility threshold"},{v:"v1.1",date:"May 1",change:"Added explain_for_beginners skill"},{v:"v1.0",date:"Apr 4",change:"Initial agent configuration"}].map(function(ver,i){return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<2?"1px solid "+BD:"none"}}><div><span style={{fontSize:11,fontFamily:M,fontWeight:700,marginRight:8}}>{ver.v}</span><span style={{fontSize:11,color:LT}}>{t(ver.change)}</span></div><span style={{fontSize:10,fontFamily:M,color:MT,cursor:"pointer"}}>{t("rollback")}</span></div>;})}</Card>
  </div>;}

function AdminProtocols(){var s=useState(-1),open=s[0],setOpen=s[1];var lv=useState(null),live=lv[0],setLive=lv[1];
  useEffect(function(){fetch("/api/market").then(function(r){return r.json();}).then(function(d){var m={};(d.protocols||[]).forEach(function(p){m[p.name]=p;});setLive(m);}).catch(function(){});},[]);
  function fmtTvl(n){if(n==null)return null;var s=_curSym();if(n>=1e9)return s+(n/1e9).toFixed(1)+"B";if(n>=1e6)return s+(n/1e6).toFixed(0)+"M";return s+Math.round(n).toLocaleString();}
  var protocols=[
    {name:"Kamino",score:87,yield:"6.4%",tvl:"$1.2B",trend:"stable",status:GN,history:[80,82,84,85,86,87,87],audits:["OtterSec (2024)","Sec3 (2025)"],incidents:[]},
    {name:"Jupiter Perps",score:74,yield:"-",tvl:"$890M",trend:"growing",status:GN,history:[68,70,71,72,73,74,74],audits:["OtterSec (2024)"],incidents:["Minor oracle delay (Jan 2025, resolved)"]},
    {name:"Marinade",score:82,yield:"7.1%",tvl:"$1.5B",trend:"stable",status:GN,history:[78,79,80,81,81,82,82],audits:["Halborn (2023)","Neodyme (2024)"],incidents:[]},
    {name:"Drift",score:71,yield:"-",tvl:"$340M",trend:"stable",status:GN,history:[65,66,68,69,70,71,71],audits:["OtterSec (2024)"],incidents:["Liquidation engine lag (Mar 2025, patched)"]},
    {name:"Solend",score:58,yield:"4.2%",tvl:"$180M",trend:"declining",status:RD,history:[72,70,68,65,62,60,58],audits:["Kudelski (2023)"],incidents:["Governance attack attempt (Nov 2022)","TVL decline ongoing"]},
  ];
  if(live){protocols=protocols.map(function(pr){var L=live[pr.name];if(!L)return pr;return Object.assign({},pr,{score:L.score,tvl:L.tvl!=null?fmtTvl(L.tvl):pr.tvl,status:L.score>=60?GN:RD,liveBadge:L.live});});}
  var t=useLang().t;
  return <div>
    <Label mb={8}>{t("PROTOCOL RISK DASHBOARD")}</Label>
    <p style={{fontSize:12,color:LT,marginBottom:12}}>{t("Click any protocol for details, score history, audits, and incidents.")}</p>
    {protocols.map(function(pr,i){var isOpen=open===i;return <div key={i} style={{marginBottom:4}}>
      <div onClick={function(){setOpen(isOpen?-1:i);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:isOpen?GY:WH,border:"1px solid "+(pr.score<60?RD+"44":BD),borderRadius:isOpen?"8px 8px 0 0":8,cursor:"pointer"}}>
        <div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,margin:0}}>{pr.name}</p><p style={{fontSize:10,fontFamily:M,color:MT,margin:0}}>{t("TVL:")} {pr.tvl} / {t("Yield:")} {pr.yield}</p></div>
        <MiniChart data={pr.history} w={60} h={20} c={pr.score>=60?GN:RD}/>
        <div style={{textAlign:"right",minWidth:50}}><p style={{fontSize:14,fontWeight:800,color:pr.score>=60?BK:RD,margin:0,fontFamily:M}}>{pr.score}</p><p style={{fontSize:9,color:pr.status,margin:0,fontFamily:M}}>{t(pr.trend)}</p></div>
      </div>
      {isOpen&&<div style={{border:"1px solid "+BD,borderTop:"none",borderRadius:"0 0 8px 8px",padding:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:4,marginBottom:10}}>{["Audit","TVL","Age","Incidents","Insurance"].map(function(cat,j){var scores=[pr.score>=60?25:15, pr.score>=60?20:10, pr.score>=60?18:12, pr.incidents.length===0?15:5, pr.score>=60?9:5];return <div key={j} style={{textAlign:"center"}}><div style={{height:scores[j]*2,background:BK,borderRadius:2,marginBottom:2,opacity:0.3+scores[j]/30}}/><p style={{fontSize:8,fontFamily:M,color:MT,margin:0}}>{t(cat)}</p><p style={{fontSize:10,fontWeight:700,margin:0}}>{scores[j]}</p></div>;})}</div>
        <p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 4px"}}>{t("AUDITS")}</p>
        {pr.audits.map(function(a,j){return <p key={j} style={{fontSize:11,color:GN,margin:"2px 0"}}>{"✓ "+a}</p>;})}
        {pr.incidents.length>0&&<div style={{marginTop:6}}><p style={{fontSize:10,fontFamily:M,color:RD,margin:"0 0 4px"}}>{t("INCIDENTS")}</p>{pr.incidents.map(function(inc,j){return <p key={j} style={{fontSize:11,color:RD,margin:"2px 0"}}>{"! "+inc}</p>;})}</div>}
      </div>}
    </div>;})}
  </div>;}

function AdminGuardrails(){
  var s=useState(25),growthCap=s[0],setGC=s[1];var s2=useState(80),stopLoss=s2[0],setSL=s2[1];var s3=useState(5),driftThresh=s3[0],setDT=s3[1];
  var s4=useState(false),simRan=s4[0],setSimRan=s4[1];var s5=useState(null),cfgs=s5[0],setCfgs=s5[1];var tt=useToast();var t=useLang().t;
  function loadCfg(){fetch("/api/admin/config").then(function(r){return r.ok?r.json():{versions:[]};}).then(function(d){setCfgs(d.versions||[]);}).catch(function(){setCfgs([]);});}
  useEffect(function(){loadCfg();},[]);
  function saveVer(){fetch("/api/admin/config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({growthCap:growthCap/100,note:"Growth cap "+growthCap+"%"})}).then(function(r){return r.json();}).then(function(d){setCfgs(d.versions||[]);tt.showToast(t("Saved strategy v")+((d.versions||[]).length));}).catch(function(){});}
  function activate(id){fetch("/api/admin/config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activate:id})}).then(function(r){return r.json();}).then(function(d){setCfgs(d.versions||[]);tt.showToast(t("Strategy activated — live pipeline updated"));}).catch(function(){});}
  var activeCfg=(cfgs||[]).find(function(c){return c.active;});
  return <div>
    <Card style={{border:"2px solid "+BK,marginBottom:12}}>
      <Label mb={6}>{t("STRATEGY CONTROL PLANE")}</Label>
      <p style={{fontSize:12,color:LT,margin:"0 0 8px"}}>{t("The active strategy is read by the live AI pipeline. Save the what-if cap below as a new version, then activate it — no retraining.")}</p>
      {activeCfg?<Row l={t("Active version")} v={"v"+activeCfg.version+" · "+t("cap")+" "+Math.round(Number(activeCfg.growth_cap)*100)+"%"} vc={GN}/>:null}
      <div style={{display:"flex",gap:6,marginTop:8}}><Btn small black style={{flex:1}} onClick={saveVer}>{t("Save cap")+" "+growthCap+"% "+t("as new version")}</Btn></div>
      {(cfgs||[]).length>0&&<div style={{marginTop:10}}>{(cfgs||[]).map(function(c,i){return <div key={c.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<(cfgs.length-1)?"1px solid "+GY:"none"}}><span style={{fontSize:11,fontFamily:M,color:c.active?BK:MT}}>{"v"+c.version+" · "+t("cap")+" "+Math.round(Number(c.growth_cap)*100)+"%"+(c.active?" ("+t("active")+")":"")}</span>{!c.active&&<span onClick={function(){activate(c.id);}} style={{fontSize:10,fontFamily:M,color:BK,cursor:"pointer",textDecoration:"underline"}}>{t("activate")}</span>}</div>;})}</div>}
    </Card>
    <Label mb={8}>{t("GUARDRAIL AUDIT LOG")}</Label>
    {[{t:"2h ago",check:"Drift check",result:"PASS",detail:"2.1% < 5%"},{t:"47d ago",check:"Full 6-point validation",result:"PASS",detail:"All passed"},{t:"47d ago",check:"Stress: -80% crash",result:"PASS",detail:"Loss 4.2% < 5%"},{t:"47d ago",check:"Growth cap",result:"PASS",detail:"8% < 25%"}].map(function(log,i){return <div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<3?"1px solid "+GY:"none"}}><span style={{fontSize:10,fontFamily:M,color:MT,minWidth:48}}>{t(log.t)}</span><div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,margin:0}}>{t(log.check)}</p><p style={{fontSize:10,color:MT,margin:0}}>{t(log.detail)}</p></div><span style={{fontSize:10,fontFamily:M,color:GN,fontWeight:700}}>{t(log.result)}</span></div>;})}
    <Card hl style={{marginTop:12,marginBottom:12}}><Label mb={4}>{t("STATS")}</Label><Row l={t("Total checks")} v="94"/><Row l={t("Passed")} v="94 (100%)"/><Row l={t("Rejections")} v="0"/><Row l={t("Circuit breakers")} v="0" last/></Card>
    <Card style={{border:"2px solid "+BK}}>
      <Label mb={8}>{t("WHAT-IF SIMULATOR")}</Label>
      <p style={{fontSize:12,color:LT,marginBottom:10}}>{t("Adjust guardrail parameters and see the impact on historical performance.")}</p>
      <div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:LT}}>{t("Growth cap")}</span><span style={{fontSize:11,fontFamily:M,fontWeight:700}}>{growthCap}%</span></div><input type="range" min={5} max={50} value={growthCap} onChange={function(e){setGC(Number(e.target.value));setSimRan(false);}} style={{width:"100%",accentColor:"#2563EB"}}/></div>
      <div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:LT}}>{t("Stop-loss trigger")}</span><span style={{fontSize:11,fontFamily:M,fontWeight:700}}>-{stopLoss}%</span></div><input type="range" min={50} max={100} value={stopLoss} onChange={function(e){setSL(Number(e.target.value));setSimRan(false);}} style={{width:"100%",accentColor:"#2563EB"}}/></div>
      <div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:LT}}>{t("Drift threshold")}</span><span style={{fontSize:11,fontFamily:M,fontWeight:700}}>{driftThresh}%</span></div><input type="range" min={1} max={15} value={driftThresh} onChange={function(e){setDT(Number(e.target.value));setSimRan(false);}} style={{width:"100%",accentColor:"#2563EB"}}/></div>
      <Btn black full small onClick={function(){setSimRan(true);}}>{t("Run Simulation")}</Btn>
      {simRan&&<Card hl style={{marginTop:10}}>
        <Label mb={4}>{t("SIMULATION RESULTS")}</Label>
        <Row l={t("Max growth possible")} v={growthCap+"%"}/>
        <Row l={t("Stop-loss saves (2yr)")} v={stopLoss<80?"3 "+t("triggers"):"1 "+t("trigger")}/>
        <Row l={t("Rebalances (2yr)")} v={driftThresh<5?"48":"24"}/>
        <Row l={t("Impact on Sharpe")} v={growthCap>30?"-0.15 ("+t("worse")+")":growthCap<15?"-0.08 ("+t("worse")+")":"0 ("+t("optimal")+")"} vc={growthCap===25?GN:AM}/>
        <Row l={t("Impact on max DD")} v={growthCap>30?"-8.2% ("+t("worse")+")":"-4.9% ("+t("same")+")"} vc={growthCap>30?RD:GN} last/>
        {growthCap!==25&&<p style={{fontSize:11,color:AM,marginTop:6}}>{t("Current settings (25% cap) are optimal. Changing to")+" "+growthCap+"% "+(growthCap>25?t("increases risk without proportional return"):t("reduces upside unnecessarily"))+"."}</p>}
      </Card>}
    </Card>
  </div>;}

export function Settings(p){var s=useState(5),risk=s[0],setRisk=s[1];var s2=useState(true),notif=s2[0],setNotif=s2[1];var s3=useState(true),auto=s3[0],setAuto=s3[1];var tt=useToast();var rc=useRole();var role=rc.role;var s4=useState(""),code=s4[0],setCode=s4[1];var lc=useLang();var lang=lc.lang;var setLang=lc.setLang;var t=lc.t;
  useEffect(function(){if(typeof window==="undefined")return;try{var raw=localStorage.getItem("norvex_settings");if(raw){var v=JSON.parse(raw);if(typeof v.risk==="number")setRisk(v.risk);if(typeof v.notif==="boolean")setNotif(v.notif);if(typeof v.auto==="boolean")setAuto(v.auto);}}catch(e){}},[]);
  function save(){localStorage.setItem("norvex_settings",JSON.stringify({risk:risk,notif:notif,auto:auto}));tt.showToast(t("Settings saved"));}
  function unlock(){rc.unlock(code).then(function(ok){if(ok){tt.showToast(t("Access unlocked"));setCode("");}else{tt.showToast(t("Invalid code"));}});}
  function lock(){rc.lock().then(function(){tt.showToast(t("Reverted to user"));});}
  return <div style={{padding:"40px 20px",maxWidth:960,margin:"0 auto"}}><Label>{t("SETTINGS")}</Label><H2 mb={24}>{t("Account")}</H2>
    <Row l={t("Wallet")} v="8xKf...3mR2"/>
    <Row l={t("Network")} v="Solana Devnet" last/>
    <div style={{marginTop:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:LT}}>{t("Risk limit (max drawdown)")}</span><span style={{fontSize:13,fontFamily:M,fontWeight:700,color:BK}}>{risk}%</span></div><input type="range" min={1} max={25} value={risk} onChange={function(e){setRisk(Number(e.target.value));}} style={{width:"100%",accentColor:"#2563EB"}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid "+GY,marginTop:8}}><span style={{fontSize:13,color:LT}}>{t("Notifications")}</span><Toggle on={notif} onClick={function(){setNotif(!notif);}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid "+GY}}><span style={{fontSize:13,color:LT}}>{t("Auto-compound")}</span><Toggle on={auto} onClick={function(){setAuto(!auto);}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid "+GY}}><span style={{fontSize:13,color:LT}}>{t("Language")}</span><div style={{display:"flex",alignItems:"center",gap:2,background:GY,border:"1px solid "+BD,borderRadius:R_PILL,padding:2}}>{[["en","EN"],["ru","RU"]].map(function(o){var on=lang===o[0];return <span key={o[0]} onClick={function(){setLang(o[0]);}} style={{fontSize:11,fontFamily:M,fontWeight:600,letterSpacing:"0.02em",color:on?WH:LT,background:on?BK:"transparent",borderRadius:R_PILL,padding:"5px 12px",cursor:"pointer",transition:"background .15s, color .15s"}}>{o[1]}</span>;})}</div></div>
    <Card hl style={{marginTop:20}}><Label mb={6}>{t("TEAM ACCESS")}</Label><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:LT}}>{t("Current role")}</span><span style={{fontSize:12,fontFamily:M,fontWeight:700,color:role==="user"?BK:GN}}>{role}</span></div>{role==="user"?<div style={{display:"flex",gap:6}}><input value={code} onChange={function(e){setCode(e.target.value);}} type="password" placeholder={t("Access code")} style={{flex:1,padding:8,fontSize:13,fontFamily:M,border:"1px solid "+BD,borderRadius:6,boxSizing:"border-box",outline:"none"}}/><Btn small black onClick={unlock}>{t("Unlock")}</Btn></div>:<Btn small outline full onClick={lock}>{t("Sign out of")+" "+role}</Btn>}<p style={{fontSize:10,color:MT,fontFamily:M,margin:"8px 0 0"}}>{t("Admin/B2B teammates: enter your code to unlock the relevant tools.")}</p></Card>
    <div style={{marginTop:20,display:"flex",gap:8}}><Btn outline style={{flex:1}} onClick={function(){p.setScreen(S.DASH);}}>{"< "+t("Back")}</Btn><Btn black style={{flex:1}} onClick={save}>{t("Save")}</Btn></div>
  </div>;}

export function History(p){var tt=useToast();var t=useLang().t;var txs=[{d:"May 15",t:"Compound",a:"+$18.40"},{d:"May 14",t:"Rebalance",a:"-"},{d:"Apr 4",t:"Deploy",a:"$10,000"}];
  function exportCSV(){var rows=[["Date","Type","Amount"]].concat(txs.map(function(x){return [x.d,x.t,x.a];}));var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(",");}).join("\n");var blob=new Blob([csv],{type:"text/csv"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="norvex-history.csv";a.click();URL.revokeObjectURL(url);tt.showToast(t("History exported"));}
  return <div style={{padding:"40px 20px",maxWidth:960,margin:"0 auto"}}><Label>{t("HISTORY")}</Label><H2 mb={24}>{t("Transactions")}</H2>{txs.map(function(tx,i){return <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid "+GY}}><span style={{fontSize:11,fontFamily:M,color:MT,minWidth:52}}>{tx.d}</span><span style={{flex:1,fontSize:13,fontWeight:500}}>{t(tx.t)}</span><span style={{fontSize:13,fontFamily:M,fontWeight:600,color:tx.a.startsWith("+")?GN:BK}}>{tx.a}</span></div>;})}<div style={{marginTop:16,display:"flex",gap:8}}><Btn outline style={{flex:1}} onClick={function(){p.setScreen(S.DASH);}}>{t("< Back")}</Btn><Btn outline style={{flex:1}} onClick={exportCSV}>{t("Export CSV")}</Btn></div></div>;}

export function Education(p){var s=useState(-1),open=s[0],setOpen=s[1];var t=useLang().t;var articles=[{t:"What is a structured product?",b:"Combines safe investment with small risky bet. Safe earns steady returns. Risky captures upside. If risky fails, safe covers loss."},{t:"How does principal protection work?",b:"92% to Kamino lending (~6% APY). 8% to SOL futures. Safe leg yield covers growth leg even if it goes to zero."},{t:"What are the risks?",b:"Smart contract risk, oracle risk, market risk. Mitigated by audits, multiple oracles, circuit breakers, 5-layer guardrails."},{t:"How does the AI decide?",b:"7 agents: NLP parses goal, analyst reads markets, risk engine runs 10K sims, Bull argues growth, Bear argues safety, PM decides, guardrails validate."},{t:"What if crypto crashes?",b:"In -40% crash: growth ($800) might zero. Safe ($9,200) earned ~$570 yield. Net loss: $230 (2.3%), within 5% limit. Without Norvex: $4,000 loss."}];return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
  <div style={{padding:"0 0 20px"}}>
    <Label>{t("LEARN")}</Label>
    <H2>{t("Risk Education.")}</H2>
    <Sub>{t("Understand how Norvex protects principal, builds portfolios, and survives crashes.")}</Sub>
  </div>{articles.map(function(a,i){return <div key={i}><div onClick={function(){setOpen(open===i?-1:i);}} style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid "+GY,cursor:"pointer"}}><span style={{fontSize:14,fontWeight:600}}>{t(a.t)}</span><span style={{color:MT}}>{open===i?"-":"+"}</span></div>{open===i&&<Card hl style={{marginBottom:4}}><p style={{fontSize:13,color:LT,lineHeight:1.6,margin:0}}>{t(a.b)}</p></Card>}</div>;})}<div style={{marginTop:16}}><Btn outline full onClick={function(){p.setScreen(S.DASH);}}>{t("< Back")}</Btn></div></div>;}

// ━━━ SYSTEM DOCS ━━━
export function SystemDocs(p){var s=useState(0),tab=s[0],setTab=s[1];var tr=useLang().t;var tabs=["Guardrails","Backend","AI Brain","USP","Algorithms"];return <div style={{padding:"24px 20px 40px",maxWidth:960,margin:"0 auto"}}>
  <div style={{padding:"0 0 20px"}}>
    <Label>{tr("SYSTEM DOCS")}</Label>
    <H2>{tr("Technical Architecture.")}</H2>
    <Sub>{tr("Complete system specification: guardrails, backend services, AI pipeline and algorithms.")}</Sub>
  </div>
  <div style={{display:"flex",gap:3,marginBottom:14,flexWrap:"wrap"}}>{tabs.map(function(t,i){return <Tab key={i} active={tab===i} onClick={function(){setTab(i);}}>{tr(t)}</Tab>;})}</div>
{tab===0&&<SysGuardrails/>}{tab===1&&<SysBackend/>}{tab===2&&<SysBrain/>}{tab===3&&<SysUSP/>}{tab===4&&<SysAlgo/>}
<div style={{marginTop:16}}><Btn outline full onClick={function(){p.setScreen(S.DASH);}}>{tr("< Dashboard")}</Btn></div></div>;}

function SysGuardrails(){var s=useState(0),open=s[0],setOpen=s[1];var layers=[
{n:"L1",name:"Mathematical Guarantee",rules:["Iron Rule: growth_allocation <= max_loss_budget. Enforced on-chain.","Yield Coverage Ratio >= 1.0. Safe leg yield must cover growth leg loss.","Isolated margin only. Growth liquidation cannot touch safe leg.","Safe and growth in physically separate vault accounts."],code:"// ON-CHAIN\nassert!(growth_amount <= user.max_loss_budget);\nassert!(growth_amount + safe_amount == total_deposit);\nassert!(safe_vault.address != growth_vault.address);"},
{n:"L2",name:"AI Decision Limits",rules:["Growth hard cap: 25%. No AI can override.","PM must pass risk validation. VaR95 > max_dd = REJECTED.","3 stress tests: -50%, -80%, exploit. All must pass.","No single protocol > 60% of any leg."],code:"// AI GUARDRAIL\nif allocation.growth_pct > 0.25:\n    REJECT(\"Growth exceeds 25% cap\")\nif risk_validator.var_95 > user.max_drawdown:\n    REJECT(\"VaR exceeds max loss\")"},
{n:"L3",name:"Circuit Breakers",rules:["Stop-loss at 80% growth drawdown. Auto-close.","Protocol TVL drops >30% = emergency withdraw.","Oracle deviation >20% = pause deposits.","Withdrawal ALWAYS available. No lockups."],code:"// RUNS EVERY 5 MIN\nif growth_position.pnl_pct < -0.80:\n    EMERGENCY_CLOSE(growth)\nif protocol.tvl_24h_change < -0.30:\n    EMERGENCY_WITHDRAW(protocol)"},
{n:"L4",name:"Smart Contract Safety",rules:["Audit before mainnet (OtterSec/Halborn). $30-50K.","2-of-3 multisig governance.","48h timelock on upgrades.","Open-source vault. Proprietary AI brain."],code:"upgrade_authority: Multisig(2_of_3)\ntimelock: 48_hours\nvault_code: open_source\nai_brain: proprietary"},
{n:"L5",name:"User Protection UX",rules:["Max loss shown BEFORE deploy.","Plain English risk explanation.","Cool-down for deposits over $10K.","AI reasoning visible on tap."],code:"show_max_loss(user, worst_case)\nrequire_confirmation(\"I understand\")\nif deposit > 10000: cooldown(1_hour)"}];
var t=useLang().t;var l=layers[open];return <div><p style={{fontSize:13,color:LT,lineHeight:1.6,marginBottom:16}}>{t("5 independent layers. If one fails, the others still protect the user.")}</p><div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>{layers.map(function(la,i){return <Tab key={i} active={open===i} onClick={function(){setOpen(i);}}>{la.n}</Tab>;})}</div><Card><p style={{fontSize:14,fontWeight:700,margin:"0 0 4px"}}>{l.n}: {t(l.name)}</p>{l.rules.map(function(r,i){return <div key={i} style={{background:GY,borderRadius:6,padding:10,marginTop:8,borderLeft:"3px solid "+BK}}><p style={{fontSize:12,color:LT,lineHeight:1.5,margin:0}}>{t(r)}</p></div>;})}</Card><div style={{marginTop:10}}><SysCode>{l.code}</SysCode></div></div>;}

function SysBackend(){var t=useLang().t;var services=[{t:"API Gateway",s:"TypeScript / Hono / Bun",d:"JWT auth. 60 req/min rate limit. Zod validation. CORS. Logging."},{t:"AI Orchestrator",s:"TypeScript / Sequential",d:"NLP > Analyst > Risk > PM. 15s timeout. Conservative fallback. Logs all I/O."},{t:"Risk Engine",s:"Python / NumPy / SciPy",d:"10K Monte Carlo paths in <2s. GBM + jump diffusion. VaR, CVaR at 95%."},{t:"Rebalance Bot",s:"Rust / Helius RPC",d:"Every 5 min. >5% drift = rebalance. -80% = close. Compounds yield hourly."},{t:"Vault Program",s:"Rust / Anchor / Solana",d:"Deposit, withdraw, rebalance. PDAs for accounts. CPI to Kamino + Jupiter."},{t:"Data Layer",s:"PostgreSQL + Redis",d:"Users, positions, agent logs, outcomes. Redis: cache (30s), rate limits."}];return <div><p style={{fontSize:13,color:LT,lineHeight:1.6,marginBottom:16}}>{t("6 services. Intelligence layer decides WHAT. Execution layer DOES IT. Guardrails sit between.")}</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{services.map(function(sv,i){return <Card key={i}><p style={{fontSize:13,fontWeight:700,margin:"0 0 2px"}}>{t(sv.t)}</p><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 8px"}}>{sv.s}</p><p style={{fontSize:11,color:LT,lineHeight:1.5,margin:0}}>{t(sv.d)}</p></Card>;})}</div><Card hl style={{marginTop:10}}><Label mb={4}>{t("INFRASTRUCTURE")}</Label><p style={{fontSize:11,color:LT,margin:0}}>Helius (RPC) / Vercel (frontend) / Railway (backend) / Supabase (auth+DB) / Sentry (monitoring)</p></Card></div>;}

function SysBrain(){var steps=[{n:"1",name:"INTENT PARSING",agent:"Claude Haiku",time:"300ms",cost:"$0.003",guard:"amount > wallet = reject. max_dd = 0 becomes 0.01."},{n:"2",name:"MARKET ANALYSIS",agent:"APIs (no LLM)",time:"500ms",cost:"$0",guard:"Stale >5min = backup. All fail = block."},{n:"3",name:"MONTE CARLO",agent:"Python/NumPy",time:"1.5s",cost:"$0",guard:"Min 10K paths. VaR > max_dd at all ratios = 100% safe."},{n:"4",name:"BULL/BEAR",agent:"Claude Sonnet",time:"2s",cost:"$0.02",guard:"Agent growth > Monte Carlo optimal = use MC. LLM cannot override math."},{n:"5",name:"PROTOCOL SELECT",agent:"Deterministic",time:"200ms",cost:"$0",guard:"Score <60 = blocked. Unaudited = blocked."},{n:"6",name:"GUARDRAIL CHECK",agent:"Rust",time:"50ms",cost:"$0",guard:"6 checks. ALL must pass. No exceptions."},{n:"7",name:"USER DISPLAY",agent:"Claude Sonnet",time:"1s",cost:"$0.01",guard:"Must state max loss in $. Must not promise returns."},{n:"8",name:"ON-CHAIN EXEC",agent:"Rust bot",time:"400ms",cost:"$0.001",guard:"Re-validates growth <= max_loss_budget. Atomic txn."}];var t=useLang().t;return <div><p style={{fontSize:13,color:LT,lineHeight:1.6,marginBottom:16}}>{t("8 steps. ~6 seconds. ~$0.034 per portfolio. Only 3 of 8 use LLMs.")}</p>{steps.map(function(st,i){return <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<7?"1px solid "+GY:"none"}}><span style={{fontSize:14,fontWeight:800,fontFamily:M,minWidth:18}}>{st.n}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:700}}>{t(st.name)}</span><span style={{fontSize:10,fontFamily:M,color:MT}}>{st.time} / {st.cost}</span></div><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 4px"}}>{st.agent}</p><p style={{fontSize:11,color:LT,margin:0}}>{t("Guardrail:")+" "+t(st.guard)}</p></div></div>;})}<Card hl style={{marginTop:12}}><p style={{fontSize:12,fontFamily:M,fontWeight:600,margin:0}}>{t("Total: ~6s / ~$0.034 / $34/month at 1,000 users")}</p></Card></div>;}

function SysUSP(){var t=useLang().t;return <div><Card hl style={{marginBottom:12}}><Label mb={6}>{t("THE SEATBELT METAPHOR")}</Label><p style={{fontSize:16,fontWeight:800,margin:"0 0 6px"}}>{t("Investing in crypto without Norvex is like driving without a seatbelt.")}</p><p style={{fontSize:12,color:LT,lineHeight:1.6,margin:0}}>{t("Safe part = frame. Growth part = engine. If engine fails, frame protects you.")}</p></Card><Label mb={10}>{t("3 PITCH FRAMINGS")}</Label>{[{w:"Consumers",p:"A savings account that buys a lottery ticket with the interest."},{w:"Crypto natives",p:"AI-built principal-protected structured products on Solana. $100 min."},{w:"Investors",p:"Wealthfront for DeFi. Democratizing $7T structured products via AI agents."}].map(function(u,i){return <Card key={i} style={{marginBottom:8}}><p style={{fontSize:10,fontFamily:M,color:MT,margin:"0 0 4px"}}>{t(u.w).toUpperCase()}</p><p style={{fontSize:14,fontWeight:600,margin:0}}>{t(u.p)}</p></Card>;})}<Label mb={10} style={{marginTop:16}}>{t("5-LAYER MOAT")}</Label>{["NLP Data Moat: every parsed goal = training example no competitor has.","Multi-Agent Prompts: Bull/Bear debate protocols are trade secrets.","Outcome Learning: allocation + result = better future decisions. Flywheel.","Protocol Intelligence: proprietary risk database of Solana DeFi.","Brand Trust: $100 min, retail-friendly. Trust compounds."].map(function(m,i){return <p key={i} style={{fontSize:12,color:LT,lineHeight:1.5,margin:"0 0 6px",paddingLeft:16,borderLeft:"2px solid "+BD}}>{(i+1)+". "+t(m)}</p>;})}</div>;}

function SysAlgo(){var t=useLang().t;return <div><p style={{fontSize:13,color:LT,lineHeight:1.6,marginBottom:16}}>{t("4 core algorithms. Only Bull/Bear uses an LLM. The 3 safety systems are deterministic.")}</p>{[
{t:"Safe/Growth Allocation",code:"fn compute_allocation(params, market):\n  growth = params.amount * params.max_dd\n  safe = params.amount - growth\n  // Yield buffer (iterative)\n  for i in 0..10:\n    buffer = safe * market.apy * (horizon/365)\n    growth = amount * max_dd + buffer\n    safe = amount - growth\n  // HARD CAP\n  if growth/amount > 0.25: growth = amount * 0.25\n  return { safe, growth }"},
{t:"Monte Carlo + Jump Diffusion",code:"fn monte_carlo(alloc, market, n=10000):\n  for path in 0..n:\n    price = current_price\n    for day in 0..365:\n      drift = (mu - 0.5*vol^2) * dt\n      shock = vol * sqrt(dt) * normal()\n      jump = if rand() < lambda*dt: N(-0.4,0.2) else: 0\n      price *= exp(drift + shock + jump)\n    results.push(portfolio_return)\n  return { var_95, cvar_95, sharpe, max_dd }"},
{t:"Guardrail Validator (6 Checks)",code:"fn validate(alloc, params, risk, protocols):\n  check(growth_pct <= 0.25)         // Cap\n  check(var_95 <= max_dd)            // VaR\n  check(stress(-50%) <= max_dd)      // Crash\n  check(stress(-80%) <= max_dd)      // Severe\n  check(stress_exploit() <= max_dd)  // Exploit\n  check(protocols.all(score >= 60))  // Safety\n  if any_failed: REJECT\n  return APPROVED"},
{t:"Rebalance + Circuit Breaker",code:"fn monitor(): // every 5 min\n  if growth.pnl < -80%: emergency_close()\n  if protocol_tvl_drop > 30%: emergency_withdraw()\n  if drift > 5%: rebalance()\n  if pending_yield > threshold: compound()"}
].map(function(a,i){return <Card key={i} style={{marginBottom:10}}><p style={{fontSize:13,fontWeight:700,margin:"0 0 8px"}}>{t(a.t)}</p><SysCode>{a.code}</SysCode></Card>;})}<Card hl><Label mb={4}>{t("KEY INSIGHT")}</Label><p style={{fontSize:11,color:LT,margin:0}}>{t("Only 3 of 7 algorithms use LLMs. The 4 safety-critical systems are deterministic. Trust math for safety. Use AI for judgment.")}</p></Card></div>;}
