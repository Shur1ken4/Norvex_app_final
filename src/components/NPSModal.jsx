"use client";
import { useEffect, useState } from "react";
import { M, BK, WH, BD, MT, LT } from "../lib/constants";
import { useToast } from "../lib/toast";

// Shows once per session after a deploy. Deployed screen sets the trigger flag.
export default function NPSModal() {
  const [show, setShow] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (
      sessionStorage.getItem("norvex_deployed") === "1" &&
      sessionStorage.getItem("norvex_nps_done") !== "1"
    ) {
      setShow(true);
    }
  }, []);

  const done = () => {
    sessionStorage.setItem("norvex_nps_done", "1");
    setShow(false);
  };
  const submit = (n) => {
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nps_score: n, screen: "/dashboard", message: "NPS" }),
    }).catch(() => {});
    showToast("Thanks for the feedback!");
    done();
  };

  if (!show) return null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:90,padding:20}}>
      <div style={{background:WH,borderRadius:12,padding:24,maxWidth:380,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <p style={{fontSize:16,fontWeight:800,color:BK,margin:0,letterSpacing:"-0.02em"}}>How likely are you to recommend Norvex to a friend?</p>
          <span onClick={done} style={{cursor:"pointer",color:MT,fontSize:18,marginLeft:8}}>×</span>
        </div>
        <p style={{fontSize:12,color:LT,margin:"0 0 16px"}}>0 = not likely, 10 = extremely likely</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
          {Array.from({length:11}).map((_,n)=>(
            <button key={n} onClick={()=>submit(n)} style={{background:WH,color:BK,border:"1px solid "+BD,borderRadius:6,padding:"10px 0",fontSize:13,fontWeight:700,fontFamily:M,cursor:"pointer"}}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
