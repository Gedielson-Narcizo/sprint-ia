import { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function NamePrompt() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Informe como deseja ser chamado."); return; }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    setLoading(false);
    if (err) setError("Não foi possível salvar. Tente novamente.");
    // Sucesso: onAuthStateChange em main.jsx detecta o user_metadata atualizado
    // e re-renderiza automaticamente sem o prompt
  };

  return (
    <div style={s.backdrop}>
      <div style={s.card}>
        <div style={s.icon}>👋</div>
        <h2 style={s.heading}>Como deseja ser chamado?</h2>
        <p style={s.sub}>Esse nome será exibido na saudação do painel.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            autoComplete="given-name"
            style={s.input}
            placeholder="Ex: Gedielson"
          />

          {error ? <div style={s.error}>{error}</div> : null}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Salvando..." : "Salvar e continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 15, 30, 0.85)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "40px 36px",
    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.7)",
    textAlign: "center",
  },
  icon: {
    fontSize: "2rem",
    marginBottom: "16px",
  },
  heading: {
    margin: "0 0 8px",
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
    gap: "14px",
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
    textAlign: "center",
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
    padding: "11px 20px",
    background: "#0ea5e9",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "'Inter', system-ui, sans-serif",
    cursor: "pointer",
  },
};
