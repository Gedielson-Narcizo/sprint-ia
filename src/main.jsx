import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import SprintIA from "../sprint_ia_v13_final.jsx";
import Login from "./components/Login.jsx";
import { supabase } from "./lib/supabase.js";
import "./styles/sprint-ia.css";

function Root() {
  const [session, setSession] = useState(undefined); // undefined = carregando

  useEffect(() => {
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

  return <SprintIA onLogout={() => supabase.auth.signOut()} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
