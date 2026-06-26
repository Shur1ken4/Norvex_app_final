"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { M, MT } from "../lib/constants";
import { useNav } from "../lib/nav";
import { useToast } from "../lib/toast";

export default function DemoStart() {
  const router = useRouter();
  const { createDemoWallet } = useNav();
  const { showToast } = useToast();

  useEffect(() => {
    sessionStorage.setItem("norvex_demo", "1");
    createDemoWallet();
    showToast("Demo account ready — no wallet needed");
    const t = setTimeout(() => router.push("/goal"), 700);
    return () => clearTimeout(t);
  }, [router, createDemoWallet, showToast]);

  return (
    <div style={{ padding: "120px 20px", textAlign: "center" }}>
      <div style={{width:40,height:40,border:"2px solid #E2E8F0",borderTopColor:"#2563EB",borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
      <p style={{ fontSize: 13, fontFamily: M, color: MT }}>Starting demo…</p>
    </div>
  );
}
