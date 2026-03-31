import { useState, useEffect, useCallback } from "react";
import { Btn, Ic, Modal } from "../sprint-ia/ui.jsx";
import { listPrograms, createProgram, updateProgram } from "../../lib/programsService.js";
import { getActiveProgramId, setActiveProgramId } from "../../lib/activeProgram.js";

// ─── Display maps ──────────────────────────────────────────────────────────────

const STATUS_MAP = {
  active:    { label: "Ativo",      color: "#10b981" },
  paused:    { label: "Pausado",    color: "#f59e0b" },
  completed: { label: "Concluído",  color: "#0ea5e9" },
  archived:  { label: "Arquivado",  color: "#64748b" },
};
const PRIORITY_MAP = {
  alta:  { label: "Alta",  color: "#ef4444" },
  media: { label: "Média", color: "#f59e0b" },
  baixa: { label: "Baixa", color: "#94a3b8" },
};
const LEVEL_MAP = {
  iniciante:     { label: "Iniciante",     color: "#10b981" },
  intermediario: { label: "Intermediário", color: "#0ea5e9" },
  avancado:      { label: "Avançado",      color: "#8b5cf6" },
};
const FILTERS = [
  { id: "all",       label: "Todos"      },
  { id: "active",    label: "Ativos"     },
  { id: "paused",    label: "Pausados"   },
  { id: "completed", label: "Concluídos" },
  { id: "archived",  label: "Arquivados" },
];

// ─── Badge ──────────────────────────────────────────────────────────────────────

function Badge({ label, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 600,
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  );
}

// ─── ProgramCard ────────────────────────────────────────────────────────────────

function ProgramCard({ program, isActive, onEdit, onSetActive, onStatusChange }) {
  const status   = STATUS_MAP[program.status]   || STATUS_MAP.active;
  const priority = PRIORITY_MAP[program.priority];
  const level    = LEVEL_MAP[program.level];

  return (
    <div
      className="surface-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        borderColor: isActive ? "#0ea5e9" : undefined,
      }}
    >
      {isActive && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "#0ea5e9",
          background: "rgba(14,165,233,0.12)",
          border: "1px solid rgba(14,165,233,0.3)",
          borderRadius: "999px", padding: "2px 8px",
        }}>
          Ativo
        </span>
      )}

      {/* Title + description */}
      <div>
        <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#f8fafc", paddingRight: isActive ? 56 : 0 }}>
          {program.title}
        </h3>
        {program.description ? (
          <p style={{
            margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {program.description}
          </p>
        ) : null}
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
        <Badge label={status.label} color={status.color} />
        {priority ? <Badge label={priority.label} color={priority.color} /> : null}
        {level    ? <Badge label={level.label}    color={level.color}    /> : null}
        {program.category ? (
          <span style={{ fontSize: "12px", color: "#64748b" }}>{program.category}</span>
        ) : null}
      </div>

      {/* Meta */}
      {(program.target_date || program.weekly_hours) ? (
        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b" }}>
          {program.target_date ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Ic.Calendar />
              {new Date(program.target_date + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          ) : null}
          {program.weekly_hours ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Ic.Clock /> {program.weekly_hours}h/sem
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <Btn v="ghost" sx={btnSm} onClick={() => onEdit(program)}>
          <Ic.Edit /> Editar
        </Btn>
        {!isActive ? (
          <Btn v="ghost" sx={btnSm} onClick={() => onSetActive(program.id)}>
            Definir ativo
          </Btn>
        ) : null}
        {program.status === "active" ? (
          <Btn v="ghost" sx={btnSm} onClick={() => onStatusChange(program.id, "paused")}>
            Pausar
          </Btn>
        ) : null}
        {(program.status === "paused" || program.status === "archived" || program.status === "completed") ? (
          <Btn v="ghost" sx={btnSm} onClick={() => onStatusChange(program.id, "active")}>
            Reativar
          </Btn>
        ) : null}
        {program.status !== "archived" ? (
          <Btn v="danger" sx={btnSm} onClick={() => onStatusChange(program.id, "archived")}>
            Arquivar
          </Btn>
        ) : null}
      </div>
    </div>
  );
}

const btnSm = { fontSize: "12px", padding: "4px 10px", minHeight: "28px" };

// ─── ProgramForm ────────────────────────────────────────────────────────────────

const FORM_DEFAULTS = {
  title: "", description: "", category: "",
  level: "", status: "active", priority: "media",
  target_date: "", weekly_hours: "",
};

function ProgramForm({ initialData, onSave, onCancel, saving, error }) {
  const [fields, setFields] = useState(() =>
    initialData ? {
      title:        initialData.title        || "",
      description:  initialData.description  || "",
      category:     initialData.category     || "",
      level:        initialData.level        || "",
      status:       initialData.status       || "active",
      priority:     initialData.priority     || "media",
      target_date:  initialData.target_date  || "",
      weekly_hours: initialData.weekly_hours != null ? String(initialData.weekly_hours) : "",
    } : { ...FORM_DEFAULTS }
  );
  const [localError, setLocalError] = useState("");

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fields.title.trim()) { setLocalError("Título é obrigatório."); return; }
    setLocalError("");
    onSave({
      title:        fields.title.trim(),
      description:  fields.description.trim() || null,
      category:     fields.category.trim()    || null,
      level:        fields.level              || null,
      status:       fields.status,
      priority:     fields.priority,
      target_date:  fields.target_date        || null,
      weekly_hours: fields.weekly_hours ? parseFloat(fields.weekly_hours) : null,
    });
  };

  return (
    <Modal onClose={onCancel}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
        {initialData ? "Editar programa" : "Novo programa"}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label className="sia-input-label">Título *</label>
          <input className="sia-input" value={fields.title} onChange={set("title")} placeholder="Ex: Fundamentos de IA" autoFocus />
        </div>
        <div>
          <label className="sia-input-label">Descrição</label>
          <textarea className="sia-input sia-input--textarea" value={fields.description} onChange={set("description")} placeholder="Objetivo e contexto do programa..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label className="sia-input-label">Categoria</label>
            <input className="sia-input" value={fields.category} onChange={set("category")} placeholder="Ex: Inteligência Artificial" />
          </div>
          <div>
            <label className="sia-input-label">Nível</label>
            <select className="sia-input sia-select" value={fields.level} onChange={set("level")}>
              <option value="">Selecionar</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
          <div>
            <label className="sia-input-label">Status</label>
            <select className="sia-input sia-select" value={fields.status} onChange={set("status")}>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
          <div>
            <label className="sia-input-label">Prioridade</label>
            <select className="sia-input sia-select" value={fields.priority} onChange={set("priority")}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className="sia-input-label">Prazo</label>
            <input type="date" className="sia-input" style={{ colorScheme: "dark" }} value={fields.target_date} onChange={set("target_date")} />
          </div>
          <div>
            <label className="sia-input-label">Carga semanal (h)</label>
            <input type="number" min="0" step="0.5" className="sia-input" value={fields.weekly_hours} onChange={set("weekly_hours")} placeholder="Ex: 5" />
          </div>
        </div>

        {(localError || error) ? (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "13px", color: "#fca5a5" }}>
            {localError || error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn v="ghost" type="button" onClick={onCancel}>Cancelar</Btn>
          <Btn v="primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : initialData ? "Salvar alterações" : "Criar programa"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── ProgramsView ───────────────────────────────────────────────────────────────

/**
 * @param {{ userId: string }} props
 */
export default function ProgramsView({ userId }) {
  const [programs, setPrograms]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [filter, setFilter]               = useState("all");
  const [formMode, setFormMode]           = useState(null); // null | 'create' | 'edit'
  const [editingProgram, setEditingProgram] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");
  const [activeProgramId, setActiveState] = useState(() => getActiveProgramId());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await listPrograms(userId);
    setLoading(false);
    if (err) { setError("Não foi possível carregar os programas. Tente novamente."); return; }
    setPrograms(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all"
    ? programs
    : programs.filter((p) => p.status === filter);

  const openCreate = () => { setEditingProgram(null); setSaveError(""); setFormMode("create"); };
  const openEdit   = (p)  => { setEditingProgram(p);  setSaveError(""); setFormMode("edit");   };

  const handleSave = async (fields) => {
    setSaving(true);
    setSaveError("");
    const result = formMode === "create"
      ? await createProgram(userId, fields)
      : await updateProgram(editingProgram.id, fields);
    setSaving(false);
    if (result.error) { setSaveError("Erro ao salvar. Tente novamente."); return; }
    setFormMode(null);
    setEditingProgram(null);
    await load();
  };

  const handleStatusChange = async (id, status) => {
    const patch = { status };
    if (status === "archived") patch.archived_at = new Date().toISOString();
    if (status === "active")   patch.archived_at = null;
    const { error: err } = await updateProgram(id, patch);
    if (!err) setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  };

  const handleSetActive = (id) => {
    setActiveProgramId(id);
    setActiveState(id);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Programas de Estudo</h2>
          <p style={s.sub}>Organize seus programas de capacitação</p>
        </div>
        <Btn v="primary" onClick={openCreate}><Ic.Plus /> Novo programa</Btn>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{ ...s.filterBtn, ...(filter === f.id ? s.filterActive : {}) }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={s.center}><span style={{ color: "#64748b", fontSize: "13px" }}>Carregando...</span></div>
      ) : error ? (
        <div style={s.errorBox}>
          <span>{error}</span>
          <Btn v="ghost" sx={{ fontSize: "12px" }} onClick={load}>Tentar novamente</Btn>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card" style={s.empty}>
          <div style={{ fontSize: "2rem" }}>📚</div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#94a3b8" }}>
            {filter === "all"
              ? "Nenhum programa ainda"
              : `Nenhum programa ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()}`}
          </p>
          {filter === "all" ? (
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", maxWidth: "300px", textAlign: "center", lineHeight: 1.6 }}>
              Crie seu primeiro programa de estudo para começar.
            </p>
          ) : null}
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isActive={program.id === activeProgramId}
              onEdit={openEdit}
              onSetActive={handleSetActive}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {formMode ? (
        <ProgramForm
          initialData={formMode === "edit" ? editingProgram : null}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
          saving={saving}
          error={saveError}
        />
      ) : null}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  page: {
    padding: "24px",
    maxWidth: "960px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: { margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" },
  sub:   { margin: 0, fontSize: "13px", color: "#64748b" },
  filters: { display: "flex", gap: "4px", flexWrap: "wrap" },
  filterBtn: {
    padding: "5px 12px",
    borderRadius: "999px",
    border: "1px solid #334155",
    background: "transparent",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: "all 0.15s",
  },
  filterActive: {
    background: "rgba(14,165,233,0.12)",
    borderColor: "rgba(14,165,233,0.3)",
    color: "#0ea5e9",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  center: { display: "flex", justifyContent: "center", padding: "48px 0" },
  errorBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "32px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#fca5a5",
    textAlign: "center",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "64px 32px",
    textAlign: "center",
  },
};
