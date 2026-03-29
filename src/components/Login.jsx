import { useState } from "react";
import { supabase } from "../lib/supabase.js";

function translateError(msg) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered")) return "Este e-mail já possui uma conta.";
  if (msg.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  return msg;
}

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Informe como deseja ser chamado.");
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirm) {
        setError("As senhas não coincidem.");
        return;
      }
      setLoading(true);
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      });
      setLoading(false);
      if (err) { setError(translateError(err.message)); return; }
      // Se confirmação de e-mail estiver ativa → mensagem de sucesso
      // Se não estiver → onAuthStateChange em main.jsx faz o redirecionamento automaticamente
      setSuccess("Conta criada! Verifique sua caixa de entrada para confirmar o e-mail.");
    } else {
      setLoading(true);
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) setError(translateError(err.message));
      // login bem-sucedido: onAuthStateChange em main.jsx cuida do redirecionamento
    }
  };

  const isSignup = mode === "signup";

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandTitle}><strong style={styles.brandAccent}>Cognia</strong></div>
        </div>

        <h2 style={styles.heading}>{isSignup ? "Criar conta" : "Acesso ao painel"}</h2>
        <p style={styles.sub}>
          {isSignup
            ? "Preencha os dados abaixo para criar sua conta."
            : "Entre com seu e-mail e senha para continuar."}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignup && (
            <div style={styles.field}>
              <label style={styles.label}>Como deseja ser chamado?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="given-name"
                style={styles.input}
                placeholder="Ex: Gedielson"
              />
            </div>
          )}

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
              autoComplete={isSignup ? "new-password" : "current-password"}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {isSignup && (
            <div style={styles.field}>
              <label style={styles.label}>Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
          )}

          {error ? <div style={styles.error}>{error}</div> : null}
          {success ? <div style={styles.successBox}>{success}</div> : null}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading
              ? isSignup ? "Criando conta..." : "Entrando..."
              : isSignup ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div style={styles.switchRow}>
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <button style={styles.switchBtn} onClick={() => switchMode("login")}>
                Entrar
              </button>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <button style={styles.switchBtn} onClick={() => switchMode("signup")}>
                Criar conta
              </button>
            </>
          )}
        </div>
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
  successBox: {
    padding: "10px 14px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#6ee7b7",
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
  switchRow: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#0ea5e9",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "'Inter', system-ui, sans-serif",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};
