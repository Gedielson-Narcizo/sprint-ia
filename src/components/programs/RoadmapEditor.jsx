import { useState, useEffect, useCallback } from "react";
import { Btn, Ic, Modal } from "../sprint-ia/ui.jsx";
import {
  getProgramRoadmap,
  createModule, updateModule, deleteModule,
  createItem, updateItem, deleteItem,
  updateProgram,
} from "../../lib/programsService.js";
import ProgramForm from "./ProgramForm.jsx";

// ─── Constants ──────────────────────────────────────────────────────────────────

const ITEM_TYPE_OPTIONS = [
  { value: "lesson",     label: "Aula"       },
  { value: "practice",   label: "Prática"    },
  { value: "reading",    label: "Leitura"    },
  { value: "delivery",   label: "Entrega"    },
  { value: "review",     label: "Revisão"    },
  { value: "project",    label: "Projeto"    },
  { value: "assessment", label: "Avaliação"  },
];
const ITEM_TYPE_COLORS = {
  lesson: "#0ea5e9", practice: "#10b981", reading: "#8b5cf6",
  delivery: "#f59e0b", review: "#64748b", project: "#ec4899", assessment: "#ef4444",
};
const SOURCE_KIND_OPTIONS = [
  { value: "",         label: "Nenhum"    },
  { value: "youtube",  label: "YouTube"   },
  { value: "link",     label: "Link"      },
  { value: "text",     label: "Texto"     },
  { value: "document", label: "Documento" },
  { value: "note",     label: "Nota"      },
  { value: "course",   label: "Curso"     },
];
const MODULE_STATUS_OPTIONS = [
  { value: "pending",   label: "Pendente"   },
  { value: "active",    label: "Em andamento" },
  { value: "completed", label: "Concluído"  },
];
const ITEM_STATUS_OPTIONS = [
  { value: "pending",     label: "Pendente"      },
  { value: "in_progress", label: "Em andamento"  },
  { value: "completed",   label: "Concluído"     },
];

const STATUS_MAP = { active: "#10b981", paused: "#f59e0b", completed: "#0ea5e9", archived: "#64748b", pending: "#64748b", in_progress: "#f59e0b" };
const STATUS_LABELS = { active: "Ativo", paused: "Pausado", completed: "Concluído", archived: "Arquivado", pending: "Pendente", in_progress: "Em andamento" };
const PRIORITY_LABELS = { alta: "Alta", media: "Média", baixa: "Baixa" };
const PRIORITY_COLORS = { alta: "#ef4444", media: "#f59e0b", baixa: "#94a3b8" };

// ─── Shared helpers ──────────────────────────────────────────────────────────────

function Badge({ label, color }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

function ConfirmModal({ message, confirmLabel = "Confirmar", onConfirm, onCancel, danger }) {
  return (
    <Modal onClose={onCancel}>
      <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#e2e8f0", lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <Btn v="ghost" type="button" onClick={onCancel}>Cancelar</Btn>
        <Btn v={danger ? "danger" : "primary"} type="button" onClick={onConfirm}>{confirmLabel}</Btn>
      </div>
    </Modal>
  );
}

// ─── ModuleForm ──────────────────────────────────────────────────────────────────

const MODULE_DEFAULTS = { title: "", description: "", estimated_hours: "", status: "pending" };

function ModuleForm({ initialData, onSave, onCancel, saving, error }) {
  const [fields, setFields] = useState(() =>
    initialData ? {
      title:           initialData.title           || "",
      description:     initialData.description     || "",
      estimated_hours: initialData.estimated_hours != null ? String(initialData.estimated_hours) : "",
      status:          initialData.status          || "pending",
    } : { ...MODULE_DEFAULTS }
  );
  const [localError, setLocalError] = useState("");
  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fields.title.trim()) { setLocalError("Título é obrigatório."); return; }
    setLocalError("");
    onSave({
      title:           fields.title.trim(),
      description:     fields.description.trim() || null,
      estimated_hours: fields.estimated_hours ? parseFloat(fields.estimated_hours) : null,
      status:          fields.status,
    });
  };

  return (
    <Modal onClose={onCancel}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
        {initialData ? "Editar módulo" : "Novo módulo"}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label className="sia-input-label">Título *</label>
          <input className="sia-input" value={fields.title} onChange={set("title")} placeholder="Ex: Fundamentos de Prompt" autoFocus />
        </div>
        <div>
          <label className="sia-input-label">Descrição</label>
          <textarea className="sia-input sia-input--textarea" value={fields.description} onChange={set("description")} placeholder="Objetivo deste módulo..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label className="sia-input-label">Horas estimadas</label>
            <input type="number" min="0" step="0.5" className="sia-input" value={fields.estimated_hours} onChange={set("estimated_hours")} placeholder="Ex: 10" />
          </div>
          <div>
            <label className="sia-input-label">Status</label>
            <select className="sia-input sia-select" value={fields.status} onChange={set("status")}>
              {MODULE_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        {(localError || error) ? <div style={errStyle}>{localError || error}</div> : null}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn v="ghost" type="button" onClick={onCancel}>Cancelar</Btn>
          <Btn v="primary" type="submit" disabled={saving}>{saving ? "Salvando..." : initialData ? "Salvar" : "Criar módulo"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── ItemForm ────────────────────────────────────────────────────────────────────

const ITEM_DEFAULTS = {
  title: "", description: "", item_type: "lesson", source_kind: "", source_url: "",
  source_text: "", estimated_minutes: "", due_date: "", status: "pending", is_delivery: false,
};

function ItemForm({ initialData, moduleTitle, onSave, onCancel, saving, error }) {
  const [fields, setFields] = useState(() =>
    initialData ? {
      title:             initialData.title             || "",
      description:       initialData.description       || "",
      item_type:         initialData.item_type         || "lesson",
      source_kind:       initialData.source_kind       || "",
      source_url:        initialData.source_url        || "",
      source_text:       initialData.source_text       || "",
      estimated_minutes: initialData.estimated_minutes != null ? String(initialData.estimated_minutes) : "",
      due_date:          initialData.due_date          || "",
      status:            initialData.status            || "pending",
      is_delivery:       !!initialData.is_delivery,
    } : { ...ITEM_DEFAULTS }
  );
  const [localError, setLocalError] = useState("");
  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));
  const setCheck = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fields.title.trim()) { setLocalError("Título é obrigatório."); return; }
    setLocalError("");
    onSave({
      title:             fields.title.trim(),
      description:       fields.description.trim()  || null,
      item_type:         fields.item_type,
      source_kind:       fields.source_kind          || null,
      source_url:        fields.source_url.trim()    || null,
      source_text:       fields.source_text.trim()   || null,
      estimated_minutes: fields.estimated_minutes ? parseInt(fields.estimated_minutes, 10) : null,
      due_date:          fields.due_date             || null,
      status:            fields.status,
      is_delivery:       fields.is_delivery,
    });
  };

  return (
    <Modal onClose={onCancel}>
      <h2 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700, color: "#f8fafc" }}>
        {initialData ? "Editar item" : "Novo item"}
      </h2>
      {moduleTitle ? <p style={{ margin: "0 0 18px", fontSize: "12px", color: "#64748b" }}>em {moduleTitle}</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label className="sia-input-label">Título *</label>
          <input className="sia-input" value={fields.title} onChange={set("title")} placeholder="Ex: Introdução a Engenharia de Prompt" autoFocus />
        </div>
        <div>
          <label className="sia-input-label">Descrição</label>
          <textarea className="sia-input sia-input--textarea" style={{ minHeight: "72px" }} value={fields.description} onChange={set("description")} placeholder="Resumo do conteúdo ou objetivo..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label className="sia-input-label">Tipo</label>
            <select className="sia-input sia-select" value={fields.item_type} onChange={set("item_type")}>
              {ITEM_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="sia-input-label">Status</label>
            <select className="sia-input sia-select" value={fields.status} onChange={set("status")}>
              {ITEM_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="sia-input-label">Duração (min)</label>
            <input type="number" min="0" className="sia-input" value={fields.estimated_minutes} onChange={set("estimated_minutes")} placeholder="Ex: 30" />
          </div>
          <div>
            <label className="sia-input-label">Prazo</label>
            <input type="date" className="sia-input" style={{ colorScheme: "dark" }} value={fields.due_date} onChange={set("due_date")} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="sia-input-label">Tipo de fonte</label>
              <select className="sia-input sia-select" value={fields.source_kind} onChange={set("source_kind")}>
                {SOURCE_KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="sia-input-label">URL / Link</label>
              <input className="sia-input" value={fields.source_url} onChange={set("source_url")} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="sia-input-label">Texto de apoio / Notas</label>
            <textarea className="sia-input sia-input--textarea" style={{ minHeight: "72px" }} value={fields.source_text} onChange={set("source_text")} placeholder="Anotações, resumo ou material de referência..." />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#cbd5e1" }}>
          <input type="checkbox" checked={fields.is_delivery} onChange={setCheck("is_delivery")} style={{ accentColor: "#f59e0b", width: 15, height: 15 }} />
          Marcar como entrega
        </label>

        {(localError || error) ? <div style={errStyle}>{localError || error}</div> : null}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn v="ghost" type="button" onClick={onCancel}>Cancelar</Btn>
          <Btn v="primary" type="submit" disabled={saving}>{saving ? "Salvando..." : initialData ? "Salvar" : "Criar item"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── RoadmapEditor ───────────────────────────────────────────────────────────────

/**
 * @param {{
 *   program: import('../../types/programs.js').StudyProgram,
 *   onBack: () => void,
 *   onProgramUpdated: (p: import('../../types/programs.js').StudyProgram) => void,
 * }} props
 */
export default function RoadmapEditor({ program: initialProgram, onBack, onProgramUpdated }) {
  const [program, setProgram]             = useState(initialProgram);
  const [modules, setModules]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState("");
  const [moduleForm, setModuleForm]       = useState(null); // null | { mode:'create'|'edit', data }
  const [itemForm, setItemForm]           = useState(null); // null | { mode, moduleId, moduleTitle, data }
  const [confirmDelModule, setConfirmDelModule] = useState(null); // null | { id, title }
  const [confirmDelItem, setConfirmDelItem]     = useState(null); // null | { id, title }
  const [showProgramForm, setShowProgramForm]   = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await getProgramRoadmap(program.id);
    setLoading(false);
    if (error) { setLoadError("Não foi possível carregar o roadmap."); return; }
    setModules(data || []);
  }, [program.id]);

  useEffect(() => { load(); }, [load]);

  // ── Module handlers ─────────────────────────────────────────────────────────

  const handleSaveModule = async (fields) => {
    setSaving(true); setSaveError("");
    if (moduleForm.mode === "create") {
      const sort_order = modules.length * 10;
      const { data, error } = await createModule(program.id, { ...fields, sort_order });
      setSaving(false);
      if (error) { setSaveError("Erro ao salvar módulo."); return; }
      setModules((prev) => [...prev, { ...data, program_items: [] }]);
    } else {
      const { data, error } = await updateModule(moduleForm.data.id, fields);
      setSaving(false);
      if (error) { setSaveError("Erro ao salvar módulo."); return; }
      setModules((prev) => prev.map((m) => m.id === data.id ? { ...m, ...data } : m));
    }
    setModuleForm(null);
  };

  const handleDeleteModule = async () => {
    const { error } = await deleteModule(confirmDelModule.id);
    if (!error) setModules((prev) => prev.filter((m) => m.id !== confirmDelModule.id));
    setConfirmDelModule(null);
  };

  const moveModule = async (idx, dir) => {
    const nIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nIdx < 0 || nIdx >= modules.length) return;
    const updated = [...modules];
    const [a, b] = [updated[idx], updated[nIdx]];
    updated[idx] = b; updated[nIdx] = a;
    setModules(updated);
    await updateModule(a.id, { sort_order: b.sort_order });
    await updateModule(b.id, { sort_order: a.sort_order });
  };

  // ── Item handlers ────────────────────────────────────────────────────────────

  const handleSaveItem = async (fields) => {
    setSaving(true); setSaveError("");
    if (itemForm.mode === "create") {
      const moduleIdx = modules.findIndex((m) => m.id === itemForm.moduleId);
      const sort_order = modules[moduleIdx].program_items.length * 10;
      const { data, error } = await createItem(itemForm.moduleId, { ...fields, sort_order });
      setSaving(false);
      if (error) { setSaveError("Erro ao salvar item."); return; }
      setModules((prev) => prev.map((m) =>
        m.id === itemForm.moduleId ? { ...m, program_items: [...m.program_items, data] } : m
      ));
    } else {
      const { data, error } = await updateItem(itemForm.data.id, fields);
      setSaving(false);
      if (error) { setSaveError("Erro ao salvar item."); return; }
      setModules((prev) => prev.map((m) => ({
        ...m,
        program_items: m.program_items.map((it) => it.id === data.id ? { ...it, ...data } : it),
      })));
    }
    setItemForm(null);
  };

  const handleDeleteItem = async () => {
    const { error } = await deleteItem(confirmDelItem.id);
    if (!error) {
      setModules((prev) => prev.map((m) => ({
        ...m,
        program_items: m.program_items.filter((it) => it.id !== confirmDelItem.id),
      })));
    }
    setConfirmDelItem(null);
  };

  const moveItem = async (moduleId, itemIdx, dir) => {
    const mIdx = modules.findIndex((m) => m.id === moduleId);
    const items = [...modules[mIdx].program_items];
    const nIdx = dir === "up" ? itemIdx - 1 : itemIdx + 1;
    if (nIdx < 0 || nIdx >= items.length) return;
    const [a, b] = [items[itemIdx], items[nIdx]];
    items[itemIdx] = b; items[nIdx] = a;
    const newModules = modules.map((m, i) => i === mIdx ? { ...m, program_items: items } : m);
    setModules(newModules);
    await updateItem(a.id, { sort_order: b.sort_order });
    await updateItem(b.id, { sort_order: a.sort_order });
  };

  // ── Program edit ─────────────────────────────────────────────────────────────

  const handleSaveProgram = async (fields) => {
    setSaving(true); setSaveError("");
    const { data, error } = await updateProgram(program.id, fields);
    setSaving(false);
    if (error) { setSaveError("Erro ao salvar programa."); return; }
    setProgram(data);
    onProgramUpdated(data);
    setShowProgramForm(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <Btn v="ghost" sx={{ fontSize: "12px", padding: "4px 10px", minHeight: "28px" }} onClick={onBack}>
          ← Programas
        </Btn>
        <Btn v="ghost" sx={{ fontSize: "12px", padding: "4px 10px", minHeight: "28px" }} onClick={() => { setSaveError(""); setShowProgramForm(true); }}>
          <Ic.Edit /> Editar programa
        </Btn>
      </div>

      <div>
        <h2 style={s.programTitle}>{program.title}</h2>
        {program.description ? <p style={s.programDesc}>{program.description}</p> : null}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
          {program.status   ? <Badge label={STATUS_LABELS[program.status]   || program.status}   color={STATUS_MAP[program.status]   || "#64748b"} /> : null}
          {program.priority ? <Badge label={PRIORITY_LABELS[program.priority] || program.priority} color={PRIORITY_COLORS[program.priority] || "#64748b"} /> : null}
          {program.target_date ? (
            <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <Ic.Calendar /> {new Date(program.target_date + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          ) : null}
          {program.weekly_hours ? (
            <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
              <Ic.Clock /> {program.weekly_hours}h/sem
            </span>
          ) : null}
        </div>
      </div>

      {/* Modules section */}
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>Módulos do roadmap</span>
        <Btn v="primary" sx={{ fontSize: "12px", padding: "5px 12px", minHeight: "30px" }} onClick={() => { setSaveError(""); setModuleForm({ mode: "create", data: null }); }}>
          <Ic.Plus /> Novo módulo
        </Btn>
      </div>

      {saveError ? <div style={errStyle}>{saveError}</div> : null}

      {loading ? (
        <div style={s.center}><span style={{ color: "#64748b", fontSize: "13px" }}>Carregando...</span></div>
      ) : loadError ? (
        <div style={{ ...errStyle, textAlign: "center" }}>{loadError} <Btn v="ghost" sx={{ fontSize: "12px" }} onClick={load}>Tentar novamente</Btn></div>
      ) : modules.length === 0 ? (
        <div className="surface-card" style={s.empty}>
          <div style={{ fontSize: "2rem" }}>📋</div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>Nenhum módulo ainda</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", maxWidth: "280px", textAlign: "center", lineHeight: 1.6 }}>
            Adicione módulos para estruturar o conteúdo do programa.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {modules.map((mod, mIdx) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              index={mIdx}
              total={modules.length}
              onMoveUp={() => moveModule(mIdx, "up")}
              onMoveDown={() => moveModule(mIdx, "down")}
              onEdit={() => { setSaveError(""); setModuleForm({ mode: "edit", data: mod }); }}
              onDelete={() => {
                if (mod.program_items.length > 0) {
                  setConfirmDelModule({ id: mod.id, title: mod.title, hasItems: true });
                } else {
                  setConfirmDelModule({ id: mod.id, title: mod.title, hasItems: false });
                }
              }}
              onAddItem={() => { setSaveError(""); setItemForm({ mode: "create", moduleId: mod.id, moduleTitle: mod.title, data: null }); }}
              onEditItem={(item) => { setSaveError(""); setItemForm({ mode: "edit", moduleId: mod.id, moduleTitle: mod.title, data: item }); }}
              onDeleteItem={(item) => setConfirmDelItem({ id: item.id, title: item.title })}
              onMoveItemUp={(iIdx) => moveItem(mod.id, iIdx, "up")}
              onMoveItemDown={(iIdx) => moveItem(mod.id, iIdx, "down")}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {moduleForm ? (
        <ModuleForm
          initialData={moduleForm.mode === "edit" ? moduleForm.data : null}
          onSave={handleSaveModule}
          onCancel={() => setModuleForm(null)}
          saving={saving}
          error={saveError}
        />
      ) : null}

      {itemForm ? (
        <ItemForm
          initialData={itemForm.mode === "edit" ? itemForm.data : null}
          moduleTitle={itemForm.moduleTitle}
          onSave={handleSaveItem}
          onCancel={() => setItemForm(null)}
          saving={saving}
          error={saveError}
        />
      ) : null}

      {confirmDelModule ? (
        confirmDelModule.hasItems ? (
          <Modal onClose={() => setConfirmDelModule(null)}>
            <p style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>Não é possível excluir</p>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
              O módulo <strong style={{ color: "#f8fafc" }}>{confirmDelModule.title}</strong> possui itens. Remova ou mova todos os itens antes de excluir o módulo.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn v="ghost" onClick={() => setConfirmDelModule(null)}>Entendido</Btn>
            </div>
          </Modal>
        ) : (
          <ConfirmModal
            message={`Remover o módulo "${confirmDelModule.title}"? Esta ação não pode ser desfeita.`}
            confirmLabel="Remover"
            danger
            onConfirm={handleDeleteModule}
            onCancel={() => setConfirmDelModule(null)}
          />
        )
      ) : null}

      {confirmDelItem ? (
        <ConfirmModal
          message={`Remover o item "${confirmDelItem.title}"?`}
          confirmLabel="Remover"
          danger
          onConfirm={handleDeleteItem}
          onCancel={() => setConfirmDelItem(null)}
        />
      ) : null}

      {showProgramForm ? (
        <ProgramForm
          initialData={program}
          onSave={handleSaveProgram}
          onCancel={() => setShowProgramForm(false)}
          saving={saving}
          error={saveError}
        />
      ) : null}
    </div>
  );
}

// ─── ModuleCard ──────────────────────────────────────────────────────────────────

function ModuleCard({ module, index, total, onMoveUp, onMoveDown, onEdit, onDelete, onAddItem, onEditItem, onDeleteItem, onMoveItemUp, onMoveItemDown }) {
  const itemCount = module.program_items.length;
  return (
    <div className="surface-card" style={{ padding: "0", overflow: "hidden" }}>
      {/* Module header */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "8px", borderBottom: itemCount > 0 ? "1px solid #1e293b" : undefined }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
          <button type="button" onClick={onMoveUp}  disabled={index === 0}            style={orderBtn}>▲</button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}   style={orderBtn}>▼</button>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>{module.title}</span>
            <Badge label={STATUS_LABELS[module.status] || module.status} color={STATUS_MAP[module.status] || "#64748b"} />
            {module.estimated_hours ? <span style={{ fontSize: "11px", color: "#64748b" }}>{module.estimated_hours}h estimadas</span> : null}
            <span style={{ fontSize: "11px", color: "#475569" }}>{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
          </div>
          {module.description ? <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>{module.description}</p> : null}
        </div>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <Btn v="ghost" sx={iconBtn} onClick={onEdit}><Ic.Edit /></Btn>
          <Btn v="danger" sx={iconBtn} onClick={onDelete}><Ic.Trash /></Btn>
        </div>
      </div>

      {/* Items */}
      {module.program_items.map((item, iIdx) => (
        <div key={item.id} style={{ padding: "10px 16px 10px 40px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <button type="button" onClick={() => onMoveItemUp(iIdx)}   disabled={iIdx === 0}                         style={orderBtn}>▲</button>
            <button type="button" onClick={() => onMoveItemDown(iIdx)} disabled={iIdx === module.program_items.length - 1} style={orderBtn}>▼</button>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: `${ITEM_TYPE_COLORS[item.item_type] || "#64748b"}22`, color: ITEM_TYPE_COLORS[item.item_type] || "#64748b" }}>
              {ITEM_TYPE_OPTIONS.find((o) => o.value === item.item_type)?.label || item.item_type}
            </span>
            <span style={{ fontSize: "13px", color: "#e2e8f0", flex: 1 }}>{item.title}</span>
            {item.is_delivery ? <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 600 }}>ENTREGA</span> : null}
            {item.estimated_minutes ? <span style={{ fontSize: "11px", color: "#475569" }}>{item.estimated_minutes}min</span> : null}
            {item.source_url ? (
              <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#0ea5e9", textDecoration: "none" }} title={item.source_url}>
                🔗
              </a>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            <Btn v="ghost" sx={iconBtn} onClick={() => onEditItem(item)}><Ic.Edit /></Btn>
            <Btn v="danger" sx={iconBtn} onClick={() => onDeleteItem(item)}><Ic.Trash /></Btn>
          </div>
        </div>
      ))}

      {/* Add item */}
      <div style={{ padding: "10px 16px 10px 40px" }}>
        <Btn v="ghost" sx={{ fontSize: "11px", padding: "3px 10px", minHeight: "26px", color: "#475569" }} onClick={onAddItem}>
          <Ic.Plus /> Novo item
        </Btn>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const errStyle = { padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "13px", color: "#fca5a5" };
const orderBtn = { background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "9px", padding: "1px 3px", lineHeight: 1 };
const iconBtn  = { padding: "4px 6px", minHeight: "26px", minWidth: "28px" };

const s = {
  page: { padding: "24px", maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'Inter', system-ui, sans-serif" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  programTitle: { margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 700, color: "#f8fafc" },
  programDesc:  { margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.5 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "20px" },
  sectionTitle: { fontSize: "13px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" },
  center: { display: "flex", justifyContent: "center", padding: "40px 0" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "48px 32px", textAlign: "center" },
};
