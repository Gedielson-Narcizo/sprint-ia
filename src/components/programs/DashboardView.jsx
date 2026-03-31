import { useState, useEffect, useCallback } from "react";
import { Btn, Ic, StatCard } from "../sprint-ia/ui.jsx";
import { getProgramsDashboardSummary } from "../../lib/programsService.js";
import { getActiveProgramId } from "../../lib/activeProgram.js";

// ─── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABELS = { active: "Ativo", paused: "Pausado", completed: "Concluído", archived: "Arquivado" };
const STATUS_COLORS = { active: "#10b981", paused: "#f59e0b", completed: "#0ea5e9", archived: "#64748b" };
const PRIORITY_LABELS = { alta: "Alta", media: "Média", baixa: "Baixa" };
const PRIORITY_COLORS = { alta: "#ef4444", media: "#f59e0b", baixa: "#94a3b8" };

const STATUS_SORT = { active: 0, paused: 1, completed: 2, archived: 3 };

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr + "T00:00:00") - today) / 86400000);
}

function deadlineLabel(days) {
  if (days < 0)  return { text: "Vencido",      color: "#ef4444" };
  if (days === 0) return { text: "Hoje",         color: "#ef4444" };
  if (days <= 7)  return { text: `${days}d`,     color: "#f97316" };
  if (days <= 30) return { text: `${days}d`,     color: "#f59e0b" };
  return               { text: `${days}d`,     color: "#10b981" };
}

function isAtRisk(p) {
  if (p.status !== "active" || p.priority !== "alta" || !p.target_date) return false;
  return daysUntil(p.target_date) <= 14;
}

function Badge({ label, color }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

// ─── Sub-sections ────────────────────────────────────────────────────────────────

function ActiveProgramCard({ program, onNavigate }) {
  if (!program) {
    return (
      <div className="surface-card" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
        <div style={{ fontSize: "1.8rem" }}>🎯</div>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>Nenhum programa ativo selecionado</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5, maxWidth: "280px" }}>
          Vá em <strong style={{ color: "#0ea5e9" }}>Programas</strong> e clique em "Definir ativo" para começar.
        </p>
        <Btn v="ghost" sx={{ fontSize: "12px", marginTop: "4px" }} onClick={() => onNavigate("programs")}>
          <Ic.Book /> Ir para Programas
        </Btn>
      </div>
    );
  }

  const days = program.target_date ? daysUntil(program.target_date) : null;
  const dl = days != null ? deadlineLabel(days) : null;

  return (
    <div className="surface-card" style={{ padding: "20px 24px", borderColor: "#0ea5e9", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.1em", marginBottom: "4px" }}>PROGRAMA ATIVO</div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>{program.title}</h3>
          {program.description ? (
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>{program.description}</p>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Badge label={STATUS_LABELS[program.status] || program.status} color={STATUS_COLORS[program.status] || "#64748b"} />
          {program.priority ? <Badge label={PRIORITY_LABELS[program.priority]} color={PRIORITY_COLORS[program.priority]} /> : null}
          {isAtRisk(program) ? <Badge label="⚠ Atenção" color="#ef4444" /> : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", color: "#64748b" }}>
        {program.weekly_hours ? (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Ic.Clock /> {program.weekly_hours}h/sem
          </span>
        ) : null}
        {program.module_count > 0 ? (
          <span><strong style={{ color: "#94a3b8" }}>{program.module_count}</strong> módulos</span>
        ) : null}
        {program.item_count > 0 ? (
          <span><strong style={{ color: "#94a3b8" }}>{program.item_count}</strong> itens</span>
        ) : null}
        {program.category ? <span>{program.category}</span> : null}
        {dl ? (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Ic.Calendar />
            <span style={{ color: dl.color, fontWeight: 600 }}>{dl.text}</span>
            {" "}até o prazo
          </span>
        ) : null}
      </div>
    </div>
  );
}

function UpcomingDeadlines({ programs }) {
  const list = programs
    .filter((p) => p.target_date && (p.status === "active" || p.status === "paused"))
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
    .slice(0, 6);

  if (list.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#475569", fontSize: "13px" }}>
        Nenhum programa com prazo definido.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "8px", overflow: "hidden", border: "1px solid #1e293b" }}>
      {list.map((p) => {
        const days = daysUntil(p.target_date);
        const dl = deadlineLabel(days);
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#1e293b" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{p.title}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              <Badge label={STATUS_LABELS[p.status] || p.status} color={STATUS_COLORS[p.status] || "#64748b"} />
              {isAtRisk(p) ? <Badge label="⚠" color="#ef4444" /> : null}
              <span style={{ fontSize: "11px", color: "#475569" }}>
                {new Date(p.target_date + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: dl.color, minWidth: "40px", textAlign: "right" }}>
                {dl.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgramsSummary({ programs, onNavigate }) {
  const sorted = [...programs].sort((a, b) => (STATUS_SORT[a.status] ?? 9) - (STATUS_SORT[b.status] ?? 9));

  if (sorted.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#475569", fontSize: "13px" }}>
        <p style={{ margin: "0 0 12px" }}>Nenhum programa cadastrado ainda.</p>
        <Btn v="ghost" sx={{ fontSize: "12px" }} onClick={() => onNavigate("programs")}>
          <Ic.Plus /> Criar programa
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {sorted.map((p) => {
        const dl = p.target_date ? deadlineLabel(daysUntil(p.target_date)) : null;
        return (
          <div key={p.id} className="surface-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{p.title}</span>
                {isAtRisk(p) ? <span style={{ fontSize: "10px", color: "#ef4444", fontWeight: 700 }}>⚠</span> : null}
              </div>
              {p.category ? <span style={{ fontSize: "11px", color: "#475569" }}>{p.category}</span> : null}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <Badge label={STATUS_LABELS[p.status] || p.status} color={STATUS_COLORS[p.status] || "#64748b"} />
              {p.priority ? <Badge label={PRIORITY_LABELS[p.priority]} color={PRIORITY_COLORS[p.priority]} /> : null}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#475569", flexWrap: "wrap" }}>
              {p.weekly_hours ? <span><Ic.Clock /> {p.weekly_hours}h/sem</span> : null}
              <span>{p.module_count} mód.</span>
              <span>{p.item_count} itens</span>
              {dl ? (
                <span style={{ color: dl.color, fontWeight: 600 }}>
                  <Ic.Calendar /> {dl.text}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DashboardView ───────────────────────────────────────────────────────────────

/**
 * @param {{ userId: string, userName: string, onNavigate: (tab: string) => void }} props
 */
export default function DashboardView({ userId, userName, onNavigate }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const activeProgramId         = getActiveProgramId();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await getProgramsDashboardSummary(userId);
    setLoading(false);
    if (err) { setError("Não foi possível carregar os dados."); return; }
    setPrograms(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Derived metrics ────────────────────────────────────────────────────────

  const metrics = {
    total:       programs.length,
    active:      programs.filter((p) => p.status === "active").length,
    paused:      programs.filter((p) => p.status === "paused").length,
    completed:   programs.filter((p) => p.status === "completed").length,
    archived:    programs.filter((p) => p.status === "archived").length,
    weeklyHours: programs.filter((p) => p.status === "active").reduce((s, p) => s + (p.weekly_hours || 0), 0),
    withDeadline: programs.filter((p) => p.target_date && p.status !== "archived").length,
  };

  const activeProgram = programs.find((p) => p.id === activeProgramId) || null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Governança de Estudos</h2>
          <p style={s.sub}>
            {userName ? `Olá, ${userName}. ` : ""}
            Visão consolidada do seu portfólio de programas.
          </p>
        </div>
        <Btn v="ghost" sx={{ fontSize: "12px" }} onClick={load}>↺ Atualizar</Btn>
      </div>

      {loading ? (
        <div style={s.center}><span style={{ color: "#64748b", fontSize: "13px" }}>Carregando...</span></div>
      ) : error ? (
        <div style={s.errorBox}>
          {error}
          <Btn v="ghost" sx={{ fontSize: "12px" }} onClick={load}>Tentar novamente</Btn>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div style={s.metricsGrid}>
            <StatCard icon={<Ic.Book />}     label="Programas"   value={metrics.total}       accent="#94a3b8" />
            <StatCard icon={<Ic.Target />}   label="Ativos"      value={metrics.active}      accent="#10b981" />
            <StatCard icon={<Ic.Clock />}    label="Pausados"    value={metrics.paused}      accent="#f59e0b" />
            <StatCard icon={<Ic.Trophy />}   label="Concluídos"  value={metrics.completed}   accent="#8b5cf6" />
            <StatCard icon={<Ic.Clock />}    label="Horas/sem"   value={`${metrics.weeklyHours}h`} accent="#0ea5e9" sub="programas ativos" />
            <StatCard icon={<Ic.Calendar />} label="Com prazo"   value={metrics.withDeadline} accent="#f59e0b" />
          </div>

          {/* Active program */}
          <section>
            <div style={s.sectionLabel}>Programa ativo</div>
            <ActiveProgramCard program={activeProgram} onNavigate={onNavigate} />
          </section>

          {/* Upcoming deadlines + Summary — two columns on wide screens */}
          <div style={s.twoCol}>
            <section style={{ minWidth: 0 }}>
              <div style={s.sectionLabel}>Próximos vencimentos</div>
              <UpcomingDeadlines programs={programs} />
            </section>

            <section style={{ minWidth: 0 }}>
              <div style={{ ...s.sectionLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Todos os programas</span>
                <Btn v="ghost" sx={{ fontSize: "11px", padding: "2px 8px", minHeight: "22px" }} onClick={() => onNavigate("programs")}>
                  Ver todos →
                </Btn>
              </div>
              <ProgramsSummary programs={programs} onNavigate={onNavigate} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  page: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" },
  sub:   { margin: 0, fontSize: "13px", color: "#64748b" },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)",
    gap: "24px",
    alignItems: "start",
  },
  center: { display: "flex", justifyContent: "center", padding: "48px 0" },
  errorBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#fca5a5",
    textAlign: "center",
  },
};
