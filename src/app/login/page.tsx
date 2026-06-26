const BK = "#0F172A";
const BD = "#E2E8F0";
const MT = "#94A3B8";
const LT = "#64748B";
const RD = "#dc2626";
const F = "Inter,system-ui,sans-serif";
const M = "JetBrains Mono,SF Mono,monospace";
const NX_GRAD = "linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        fontFamily: F,
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo mark */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:32}}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:"#0a0a0c",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 14 18" width="16" height="20" fill="none">
              <defs>
                <linearGradient id="nx-n-chrome-login" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="30%" stopColor="#e8e8e8"/>
                  <stop offset="60%" stopColor="#b8b8b8"/>
                  <stop offset="100%" stopColor="#f0f0f0"/>
                </linearGradient>
              </defs>
              <path fill="url(#nx-n-chrome-login)" d="M 0,0 L 4,0 L 4,6.5 L 10,15.5 L 10,0 L 14,0 L 14,18 L 10,18 L 10,11.5 L 4,2.5 L 4,18 L 0,18 Z"/>
            </svg>
          </div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:BK,fontFamily:F}}>NORVEX</span>
        </div>
        <p
          style={{
            fontSize: 12,
            fontFamily: M,
            color: MT,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Закрытый предпросмотр
        </p>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: BK,
            margin: "0 0 8px",
            lineHeight: 1.2,
          }}
        >
          Доступ для команды
        </h1>
        <p style={{ fontSize: 14, color: LT, margin: "0 0 28px", lineHeight: 1.6 }}>
          Введите командный пароль для доступа к MVP.
        </p>
        <form method="POST" action="/api/login">
          <input type="hidden" name="from" value={from ?? "/"} />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            autoFocus
            style={{
              width: "100%",
              padding: "13px 14px",
              fontSize: 15,
              fontFamily: F,
              border: "1px solid " + (error ? "#fecaca" : BD),
              borderRadius: 10,
              boxSizing: "border-box",
              outline: "none",
              marginBottom: 12,
              color: BK,
              background: "#fff",
              transition: "border-color .15s, box-shadow .15s",
            }}
          />
          {error ? (
            <p style={{ fontSize: 13, color: RD, margin: "0 0 12px" }}>
              Неверный пароль. Попробуйте снова.
            </p>
          ) : null}
          <button
            type="submit"
            style={{
              width: "100%",
              background: NX_GRAD,
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "13px 24px",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: F,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              boxShadow: "0 2px 12px rgba(37,99,235,0.30)",
              transition: "box-shadow .15s, transform .12s",
            }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
