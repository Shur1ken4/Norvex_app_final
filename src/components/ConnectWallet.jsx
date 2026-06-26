"use client";
import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { F, M, BK, WH, GY, BD, MT, LT, GN, S } from "../lib/constants";
import { useNav, DEMO_BALANCE } from "../lib/nav";
import { useToast } from "../lib/toast";
import { Label, H2, Sub, Card, Row, Btn } from "./ui";

export default function ConnectWallet(p) {
  const { connected, publicKey, disconnect, connecting } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { simulated, address, createDemoWallet, disconnectDemo } = useNav();
  const { showToast } = useToast();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    let active = true;
    if (!simulated && connected && publicKey) {
      connection
        .getBalance(publicKey)
        .then((lamports) => { if (active) setBalance(lamports / 1e9); })
        .catch(() => { if (active) setBalance(null); });
    } else {
      setBalance(null);
    }
    return () => { active = false; };
  }, [simulated, connected, publicKey, connection]);

  const isConnected = simulated || (connected && publicKey);

  if (isConnected) {
    const addr = simulated ? address : publicKey.toBase58();
    return <div style={{padding:"60px 20px",maxWidth:380,margin:"0 auto"}}>
      <Label>{simulated ? "DEMO ACCOUNT" : "WALLET CONNECTED"}</Label><H2>You're connected</H2>
      <Sub>{simulated ? "Simulated wallet — no real funds, full app access." : "Devnet — no real funds at risk."}</Sub>
      <Card hl style={{marginBottom:16}}>
        <Row l="Address" v={(addr||"").slice(0,4)+".."+(addr||"").slice(-4)}/>
        <Row l="Network" v={simulated ? "Simulated (devnet)" : "Solana Devnet"}/>
        <Row l="Balance" v={simulated ? (DEMO_BALANCE.sol+" SOL · $"+DEMO_BALANCE.usdc.toLocaleString()+" USDC") : (balance===null?"…":balance.toFixed(3)+" SOL")} last vc={GN}/>
      </Card>
      <Btn black full onClick={function(){p.setScreen(S.GOAL);}}>{"Continue →"}</Btn>
      <p style={{fontSize:12,color:MT,textAlign:"center",marginTop:16,cursor:"pointer"}} onClick={function(){ if(simulated){disconnectDemo();} else {disconnect();} }}>Disconnect</p>
    </div>;
  }

  return <div style={{padding:"60px 20px",maxWidth:380,margin:"0 auto"}}>
    <Label>STEP 1</Label><H2>Connect your wallet</H2><Sub>No signup. No email. Just your Solana wallet.</Sub>
    {["Phantom","Solflare","Backpack"].map(function(w,i){return <button key={i} onClick={function(){setVisible(true);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",background:WH,border:"1px solid "+BD,borderRadius:8,marginBottom:8,cursor:"pointer",fontFamily:F,fontSize:15,fontWeight:500,color:BK}}><span>{w}</span>{connecting?<span style={{fontSize:12,color:MT,fontFamily:M}}>connecting...</span>:<span style={{color:MT}}>{">"}</span>}</button>;})}
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0"}}><div style={{flex:1,height:1,background:BD}}/><span style={{fontSize:11,fontFamily:M,color:MT}}>OR</span><div style={{flex:1,height:1,background:BD}}/></div>
    <button onClick={function(){createDemoWallet();showToast("Demo account created");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",background:WH,border:"1px dashed "+BD,borderRadius:8,cursor:"pointer",fontFamily:F,fontSize:15,fontWeight:600,color:BK}}><span>Create a demo account</span><span style={{fontSize:11,fontFamily:M,color:MT}}>no wallet needed</span></button>
    <p style={{fontSize:11,color:MT,textAlign:"center",marginTop:12}}>{"Don't have a wallet? The demo account simulates one so you can try the full app."}</p>
  </div>;
}
