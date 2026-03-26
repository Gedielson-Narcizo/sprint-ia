import { useState } from "react";
import { Btn, Ic, MiniBar, Modal, Pill, ProgressRing } from "./ui.jsx";

export default function CardDetail({
  card,
  weekData,
  annotations,
  allFormations,
  onClose,
  onUpdateCard,
  onEditAnnotation,
  onDeleteAnnotation,
  cardTypes,
  priorities,
}) {
  const typeMeta = cardTypes[card.type] || cardTypes.livre;
  const priorityMeta = priorities[card.priority] || priorities.media;

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editType, setEditType] = useState(card.type);
  const [editPrio, setEditPrio] = useState(card.priority);
  const [editForm, setEditForm] = useState(card.formation || "");
  const [editDesc, setEditDesc] = useState(card.description || "");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [confirmDelNote, setConfirmDelNote] = useState(null);

  const cardAnnotations = annotations
    .filter((annotation) => {
      if (card.auto) {
        return annotation.formation === card.formation;
      }
      return (
        annotation.linkedCardId === card.id ||
        (card.formation && annotation.formation === card.formation && !annotation.linkedCardId)
      );
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  if (editing) {
    return (
      <Modal onClose={onClose}>
        <div className="sia-modal-title">Editar Card</div>

        <div className="sia-field-stack">
          <div className="sia-input-label">Título</div>
          <input className="sia-input" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
        </div>

        <div className="sia-field-stack">
          <div className="sia-input-label">Descrição</div>
          <textarea
            className="sia-input sia-input--textarea"
            value={editDesc}
            onChange={(event) => setEditDesc(event.target.value)}
            placeholder="Opcional..."
          />
        </div>

        <div className="sia-field-stack">
          <div className="sia-input-label">Formação</div>
          <select className="sia-input sia-select" value={editForm} onChange={(event) => setEditForm(event.target.value)}>
            <option value="">Nenhuma</option>
            {allFormations.map((item) => (
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
                className={`sia-choice-chip ${editType === key ? "is-active" : ""}`.trim()}
                onClick={() => setEditType(key)}
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
                className={`sia-choice-chip ${editPrio === key ? "is-active" : ""}`.trim()}
                onClick={() => setEditPrio(key)}
              >
                {meta.l}
              </button>
            ))}
          </div>
        </div>

        <div className="sia-actions-row sia-actions-row--end">
          <Btn v="ghost" onClick={() => setEditing(false)} sx={{ fontSize: 11 }}>
            Cancelar
          </Btn>
          <Btn
            v="primary"
            onClick={() => {
              onUpdateCard(card.id, {
                title: editTitle.trim() || card.title,
                type: editType,
                priority: editPrio,
                formation: editForm || undefined,
                description: editDesc,
              });
              setEditing(false);
            }}
            sx={{ fontSize: 11 }}
          >
            <Ic.Save /> Salvar
          </Btn>
        </div>
      </Modal>
    );
  }

  const progressPct =
    weekData && weekData.totalLessons > 0 ? Math.round((weekData.completedLessons / weekData.totalLessons) * 100) : 0;

  return (
    <Modal onClose={onClose}>
      <div className="sia-card-detail__header">
        <div className="sia-card-detail__accent" style={{ background: typeMeta.c }} />
        <div className="sia-card-detail__title-wrap">
          <h3 className="sia-card-detail__title">{card.title}</h3>
          <div className="sia-kanban-card__badges">
            <Pill bg={`${typeMeta.c}18`} fg={typeMeta.c}>
              {typeMeta.l}
            </Pill>
            <Pill bg={`${priorityMeta.c}16`} fg={priorityMeta.c}>
              {priorityMeta.l}
            </Pill>
            {card.week ? <Pill>S{card.week}</Pill> : null}
            {card.formation ? <Pill>{card.formation}</Pill> : null}
            <Pill>{card.auto ? "Auto" : "Manual"}</Pill>
          </div>
        </div>
      </div>

      {card.description ? <div className="sia-detail-description">{card.description}</div> : null}
      {!card.auto ? (
        <div className="sia-detail-edit-row">
          <Btn v="ghost" onClick={() => setEditing(true)} sx={{ fontSize: 11 }}>
            <Ic.Edit /> Editar card
          </Btn>
        </div>
      ) : null}

      {weekData && card.type === "estudo" ? (
        <section className="sia-detail-section">
          <div className="sia-detail-section__title">Progresso</div>
          <div className="sia-progress-summary">
            <div className="sia-progress-ring-wrap">
              <ProgressRing pct={progressPct} size={60} sw={4} color={typeMeta.c} />
              <span className="sia-progress-ring__label sia-progress-ring__label--large">{progressPct}%</span>
            </div>
            <div>
              <div className="sia-progress-summary__value">
                {weekData.completedLessons}/{weekData.totalLessons} aulas
              </div>
              <div className="sia-progress-summary__meta">{weekData.totalLessons - weekData.completedLessons} restantes</div>
            </div>
          </div>
          <MiniBar pct={progressPct} color={typeMeta.c} h={5} />
          <div className={`sia-detail-status ${weekData.deliveryDone ? "is-done" : ""}`.trim()}>
            Entrega: {weekData.deliveryDone ? "✓ Concluída" : weekData.delivery}
          </div>
        </section>
      ) : null}

      {weekData && card.type === "entrega" ? (
        <section className="sia-detail-section">
          <div className="sia-detail-section__title">Status da Entrega</div>
          <div className={`sia-detail-status ${weekData.deliveryDone ? "is-done" : ""}`.trim()}>
            {weekData.deliveryDone ? "✓ Concluída" : "Pendente"}
          </div>
        </section>
      ) : null}

      <section>
        <div className="sia-detail-section__title sia-detail-section__title--with-icon">
          <Ic.Note /> Anotações ({cardAnnotations.length})
        </div>

        {cardAnnotations.length === 0 ? (
          <div className="sia-empty-state sia-empty-state--compact">Nenhuma anotação vinculada.</div>
        ) : (
          <div className="sia-timeline">
            {cardAnnotations.map((annotation) => (
              <div key={annotation.id || annotation.timestamp} className="sia-timeline__item">
                <div className="sia-timeline__dot" style={{ background: typeMeta.c }} />
                <div className="sia-timeline__header">
                  <span className="sia-inline-meta">
                    <Ic.Clock />
                    {new Date(annotation.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
                    {new Date(annotation.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {annotation.editedAt ? <Pill>editado</Pill> : null}
                  <div className="sia-inline-actions">
                    <button
                      type="button"
                      className="sia-icon-ghost"
                      onClick={() => {
                        setEditNoteId(annotation.id);
                        setEditNoteText(annotation.text);
                      }}
                    >
                      <Ic.Edit />
                    </button>
                    <button type="button" className="sia-icon-ghost" onClick={() => setConfirmDelNote(annotation.id)}>
                      <Ic.Trash />
                    </button>
                  </div>
                </div>

                {editNoteId === annotation.id ? (
                  <div className="sia-note-editor">
                    <textarea
                      className="sia-input sia-input--textarea"
                      value={editNoteText}
                      onChange={(event) => setEditNoteText(event.target.value)}
                    />
                    <div className="sia-actions-row">
                      <Btn
                        v="primary"
                        onClick={() => {
                          onEditAnnotation(annotation.id, editNoteText);
                          setEditNoteId(null);
                        }}
                        sx={{ fontSize: 10, padding: "4px 10px" }}
                      >
                        <Ic.Save /> Salvar
                      </Btn>
                      <Btn v="ghost" onClick={() => setEditNoteId(null)} sx={{ fontSize: 10, padding: "4px 10px" }}>
                        Cancelar
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div className="sia-timeline__text">{annotation.text}</div>
                )}

                {confirmDelNote === annotation.id ? (
                  <div className="sia-alert-row">
                    <span>Excluir anotação?</span>
                    <Btn
                      v="danger"
                      onClick={() => {
                        onDeleteAnnotation(annotation.id);
                        setConfirmDelNote(null);
                      }}
                      sx={{ fontSize: 10, padding: "3px 8px" }}
                    >
                      Sim
                    </Btn>
                    <Btn v="ghost" onClick={() => setConfirmDelNote(null)} sx={{ fontSize: 10, padding: "3px 8px" }}>
                      Não
                    </Btn>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </Modal>
  );
}
