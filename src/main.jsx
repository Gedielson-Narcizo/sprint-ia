import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import SprintIA from "../sprint_ia_v13_final.jsx";
import Login from "./components/Login.jsx";
import NamePrompt from "./components/NamePrompt.jsx";
import { supabase } from "./lib/supabase.js";
import "./styles/sprint-ia.css";

const missingConfig = !supabase;

function Root() {
  const [session, setSession] = useState(undefined); // undefined = carregando

  useEffect(() => {
    if (missingConfig) return;

    // Sessão ativa ao carregar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    // Escuta mudanças de auth (login, logout, expiração)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Configuração ausente
  if (missingConfig) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#ef4444", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "13px", padding: "24px", textAlign: "center" }}>
        <strong>Configuração incompleta</strong>
        <span style={{ color: "#94a3b8" }}>As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas.<br />Adicione-as nas variáveis de ambiente da Vercel e faça um novo deploy.</span>
      </div>
    );
  }

  // Aguarda verificação inicial da sessão
  if (session === undefined) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "13px",
      }}>
        Carregando...
      </div>
    );
  }

  if (!session) return <Login />;

  const user = session.user;
  const userName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuário";

  // Usuário sem nome definido → exibe prompt antes de entrar no app
  const hasName = !!(user.user_metadata?.name || user.user_metadata?.full_name);
  if (!hasName) return <NamePrompt />;

  return <SprintIA userId={user.id} userName={userName} onLogout={() => supabase.auth.signOut()} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
