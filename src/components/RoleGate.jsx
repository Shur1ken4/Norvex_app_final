"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { M, MT } from "../lib/constants";
import { useRole } from "../lib/role";
import { useToast } from "../lib/toast";

// Wraps a restricted page. `allow` is an array of roles permitted to view it.
// While role is resolving we render nothing; if denied we redirect to /dashboard.
export default function RoleGate({ allow, children }) {
  const { role } = useRole();
  const router = useRouter();
  const { showToast } = useToast();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Give the RoleProvider a tick to fetch the real role before deciding.
    const t = setTimeout(() => setChecked(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (checked && !allow.includes(role)) {
      showToast(allow.includes("admin") && !allow.includes("b2b") ? "Admins only" : "Restricted area");
      router.replace("/dashboard");
    }
  }, [checked, role, allow, router, showToast]);

  if (!allow.includes(role)) {
    return <div style={{ padding: "120px 20px", textAlign: "center" }}>
      <p style={{ fontSize: 13, fontFamily: M, color: MT }}>Checking access…</p>
    </div>;
  }
  return children;
}
