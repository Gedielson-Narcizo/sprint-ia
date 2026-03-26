import { Ic, MiniBar, Pill } from "./ui.jsx";

export default function KanbanCard({ card, weekData, annotations, onDelete, onDragStart, onClick, cardTypes, priorities }) {
  const typeMeta = cardTypes[card.type] || cardTypes.livre;
  const priorityMeta = priorities[card.priority] || priorities.media;
  const pct = weekData ? Math.round((weekData.completedLessons / weekData.totalLessons) * 100) : null;
  const noteCount = annotations.filter((annotation) => annotation.formation === card.formation || annotation.linkedCardId === card.id).length;

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("cardId", card.id);
        onDragStart?.(card.id);
      }}
      onClick={() => onClick(card)}
      className="sia-kanban-card surface-card"
      style={{ "--card-accent": typeMeta.c }}
    >
      <div className="sia-kanban-card__top">
        <div className="sia-kanban-card__content">
          <div className="sia-kanban-card__title">{card.title}</div>
          <div className="sia-kanban-card__badges">
            <Pill bg={`${typeMeta.c}18`} fg={typeMeta.c}>
              {typeMeta.l}
            </Pill>
            <Pill bg={`${priorityMeta.c}16`} fg={priorityMeta.c}>
              {priorityMeta.l}
            </Pill>
            {card.week ? <Pill>S{card.week}</Pill> : null}
            {card.formation && !card.auto ? <Pill>{card.formation.slice(0, 14)}</Pill> : null}
            {noteCount > 0 ? (
              <Pill bg="rgba(80, 146, 255, 0.16)" fg="#89b5ff">
                {noteCount} nota{noteCount > 1 ? "s" : ""}
              </Pill>
            ) : null}
          </div>
        </div>

        <div className="sia-kanban-card__actions">
          <span className="sia-kanban-card__grip">
            <Ic.Grip />
          </span>
          {!card.auto ? (
            <button
              type="button"
              className="sia-icon-ghost"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(card.id);
              }}
            >
              <Ic.Trash />
            </button>
          ) : null}
        </div>
      </div>

      {pct !== null && card.type === "estudo" ? (
        <div className="sia-kanban-card__progress">
          <div className="sia-kanban-card__meta">
            <span>
              {weekData.completedLessons}/{weekData.totalLessons} aulas
            </span>
            <strong style={{ color: typeMeta.c }}>{pct}%</strong>
          </div>
          <MiniBar pct={pct} color={typeMeta.c} h={4} />
        </div>
      ) : null}

      {card.type === "entrega" && weekData ? (
        <div className={`sia-kanban-card__delivery ${weekData.deliveryDone ? "is-done" : ""}`.trim()}>
          {weekData.deliveryDone ? "✓ Entrega concluída" : "Pendente"}
        </div>
      ) : null}
    </button>
  );
}
