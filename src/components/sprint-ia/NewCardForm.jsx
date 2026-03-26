import { useState } from "react";
import { Btn } from "./ui.jsx";

export default function NewCardForm({ onAdd, onClose, allFormations, cardTypes, priorities }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("livre");
  const [priority, setPriority] = useState("media");
  const [formation, setFormation] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div className="sia-form-panel surface-card">
      <div className="sia-panel-title">Novo Card</div>
      <input className="sia-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título..." />
      <textarea
        className="sia-input sia-input--textarea"
        value={desc}
        onChange={(event) => setDesc(event.target.value)}
        placeholder="Descrição (opcional)..."
      />

      <div className="sia-field-stack">
        <div className="sia-input-label">Vincular à Formação</div>
        <select className="sia-input sia-select" value={formation} onChange={(event) => setFormation(event.target.value)}>
          <option value="">Nenhuma</option>
          {(allFormations || []).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="sia-field-stack">
        <div className="sia-input-label">Tipo</div>
        <div className="sia-chip-row">
          {Object.entries(cardTypes).map(([key, meta]) => (
            <button
              type="button"
              key={key}
              className={`sia-choice-chip ${type === key ? "is-active" : ""}`.trim()}
              onClick={() => setType(key)}
            >
              {meta.l}
            </button>
          ))}
        </div>
      </div>

      <div className="sia-field-stack">
        <div className="sia-input-label">Prioridade</div>
        <div className="sia-chip-row">
          {Object.entries(priorities).map(([key, meta]) => (
            <button
              type="button"
              key={key}
              className={`sia-choice-chip ${priority === key ? "is-active" : ""}`.trim()}
              onClick={() => setPriority(key)}
            >
              {meta.l}
            </button>
          ))}
        </div>
      </div>

      <div className="sia-actions-row sia-actions-row--end">
        <Btn v="ghost" onClick={onClose} sx={{ fontSize: 11 }}>
          Cancelar
        </Btn>
        <Btn
          v="primary"
          disabled={!title.trim()}
          onClick={() => {
            if (title.trim()) {
              onAdd({
                title: title.trim(),
                type,
                priority,
                formation: formation || undefined,
                description: desc,
              });
              onClose();
            }
          }}
          sx={{ fontSize: 11 }}
        >
          Adicionar
        </Btn>
      </div>
    </div>
  );
}
