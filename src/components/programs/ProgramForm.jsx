import { useState } from "react";
import { Btn, Modal } from "../sprint-ia/ui.jsx";

export const PROGRAM_FORM_DEFAULTS = {
  title: "", description: "", category: "",
  level: "", status: "active", priority: "media",
  target_date: "", weekly_hours: "",
};

/**
 * @param {{
 *   initialData: import('../../types/programs.js').StudyProgram | null,
 *   onSave: (fields: object) => void,
 *   onCancel: () => void,
 *   saving: boolean,
 *   error: string,
 * }} props
 */
export default function ProgramForm({ initialData, onSave, onCancel, saving, error }) {
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
    } : { ...PROGRAM_FORM_DEFAULTS }
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
