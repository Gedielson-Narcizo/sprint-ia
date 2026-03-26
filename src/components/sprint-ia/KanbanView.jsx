import { useState } from "react";
import KanbanCard from "./KanbanCard.jsx";
import NewCardForm from "./NewCardForm.jsx";
import { Btn, Ic } from "./ui.jsx";

function KCol({ colId, cards, allWeeks, annotations, onDrop, onDelete, onCardClick, labels, colors, cardTypes, priorities }) {
  const [over, setOver] = useState(false);
  return (
    <div className={`sia-kcol ${over ? "is-over" : ""}`.trim()} style={{ "--kcol-color": colors[colId] }} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); const cardId = e.dataTransfer.getData("cardId"); if (cardId) onDrop(cardId, colId); }}>
      <div className="sia-kcol__head"><div className="sia-kcol__label"><span className="sia-kcol__dot" /><span>{labels[colId]}</span></div><span className="sia-kcol__count">{cards.length}</span></div>
      <div className="sia-kcol__body">{cards.map((card) => <KanbanCard key={card.id} card={card} weekData={allWeeks.find((week) => week.formation === card.formation)} annotations={annotations} onDelete={onDelete} onClick={onCardClick} cardTypes={cardTypes} priorities={priorities} />)}</div>
    </div>
  );
}

export default function KanbanView({ showNewCard, setShowNewCard, addCard, allFormations, cardTypes, priorities, columns, labels, colors, cards, allWeeks, annotations, moveCard, deleteCard, setSelectedCard }) {
  return (
    <section className="sia-view">
      <div className="sia-board-header">
        <div>
          <div className="sia-board-header__title">Kanban</div>
          <div className="sia-muted-text">Arraste entre colunas · Clique para detalhes</div>
        </div>
        <Btn v={showNewCard ? "ghost" : "primary"} onClick={() => setShowNewCard(!showNewCard)} sx={{ fontSize: 11 }}>
          <Ic.Plus /> {showNewCard ? "Cancelar" : "Novo Card"}
        </Btn>
      </div>
      {showNewCard ? <NewCardForm onAdd={addCard} onClose={() => setShowNewCard(false)} allFormations={allFormations} cardTypes={cardTypes} priorities={priorities} /> : null}
      <div className="sia-board-columns">
        {columns.map((colId) => (
          <KCol key={colId} colId={colId} cards={cards.filter((card) => card.column === colId)} allWeeks={allWeeks} annotations={annotations} onDrop={moveCard} onDelete={deleteCard} onCardClick={setSelectedCard} labels={labels} colors={colors} cardTypes={cardTypes} priorities={priorities} />
        ))}
      </div>
    </section>
  );
}
