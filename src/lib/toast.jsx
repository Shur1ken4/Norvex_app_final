"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { M, BK, WH, GN } from "./constants";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div style={{position:"fixed",bottom:24,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",gap:8,zIndex:100,pointerEvents:"none"}}>
        {toasts.map((t) => (
          <div key={t.id} style={{background:BK,color:WH,borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:600,fontFamily:M,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:8,maxWidth:440}}>
            <span style={{color:t.type==="success"?GN:WH}}>{t.type==="success"?"✓":"•"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  // Tolerate usage outside provider (returns a no-op) to avoid hard crashes.
  return ctx || { showToast: () => {} };
}
