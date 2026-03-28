import { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandTitle}>Solaris <strong style={styles.brandAccent}>Sprint IA</strong></div>
          <div style={styles.brandSub}>GEDIELSON · SOLARIS · VIVER DE IA</div>
        </div>

        <h2 style={styles.heading}>Acesso ao painel</h2>
        <p style={styles.sub}>Entre com seu e-mail e senha para continuar.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              placeholder="seu@email.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0f1e 0%, #111827 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "40px 36px",
    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
  },
  brand: {
    marginBottom: "32px",
  },
  brandTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  brandAccent: {
    background: "linear-gradient(135deg, #0ea5e9, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandSub: {
    marginTop: "4px",
    fontSize: "9px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  heading: {
    margin: "0 0 6px",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#f8fafc",
  },
  sub: {
    margin: "0 0 28px",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#cbd5e1",
    letterSpacing: "0.02em",
  },
  input: {
    padding: "10px 14px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "14px",
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none",
    transition: "border-color 0.15s",
  },
  error: {
    padding: "10px 14px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#fca5a5",
  },
  btn: {
    marginTop: "4px",
    padding: "11px 20px",
    background: "#0ea5e9",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "'Inter', system-ui, sans-serif",
    cursor: "pointer",
    transition: "background 0.15s",
  },
};
