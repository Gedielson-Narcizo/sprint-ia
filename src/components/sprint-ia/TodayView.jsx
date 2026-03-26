import { Btn, Ic, MiniBar, Pill } from "./ui.jsx";

export default function TodayView({ activeWeek, allChecked, checkItems, todayChecks, undoLessons, setConfirmLesson, confirmLesson, lessonsToday, setLessonsToday, doRegisterLessons, lessonsAddedToday, toggleCheck, manualCards, noteTargetType, setNoteTargetType, noteFormation, setNoteFormation, allFormations, noteText, setNoteText, noteSaved, saveAnnotation, annotationsTodayCount }) {
  if (!activeWeek) {
    return (
      <section className="sia-view">
        <div className="sia-empty-state-panel">
          <div className="sia-empty-state-panel__emoji">🎉</div>
          <div className="sia-empty-state-panel__title">Todas as formações concluídas!</div>
        </div>
      </section>
    );
  }

  return (
    <section className="sia-view">
      <div className="sia-panel surface-card">
        <div className="sia-panel-header"><Ic.Calendar /><span>Semana {activeWeek.week} · Formação ativa</span></div>
        <div className="sia-panel-title">{activeWeek.formation}</div>
        <div className="sia-panel-subtitle">{activeWeek.completedLessons}/{activeWeek.totalLessons} aulas · {activeWeek.totalLessons - activeWeek.completedLessons} restantes</div>
        <MiniBar pct={Math.round((activeWeek.completedLessons / activeWeek.totalLessons) * 100)} color="#7fe6c6" h={5} />
      </div>

      <div className="sia-panel surface-card" style={{ marginTop: 16 }}>
        <div className="sia-checklist__header">
          <span className="sia-panel-title" style={{ marginBottom: 0 }}>Checklist do dia</span>
          {allChecked ? <Pill bg="rgba(127, 230, 198, 0.14)" fg="#7fe6c6">Completo ✓</Pill> : null}
        </div>
        <div className="sia-checklist">
          {checkItems.map((item) => {
            const checked = !!todayChecks[item.id];
            if (item.hasLessons) {
              const maxRemaining = activeWeek.totalLessons - activeWeek.completedLessons;
              return (
                <div key={item.id} className="sia-checklist__item">
                  <div className="sia-checklist__row">
                    <div className={`sia-checklist__toggle ${checked ? "is-checked" : ""}`.trim()} onClick={() => { if (checked) undoLessons(); else setConfirmLesson(true); }}>{checked ? <Ic.Check s={11} /> : null}</div>
                    <div style={{ flex: 1 }}>
                      <div className={`sia-checklist__label ${checked ? "is-checked" : ""}`.trim()}>{item.label}</div>
                      {!checked && !confirmLesson ? (
                        <div className="sia-checklist__lesson-row">
                          <span className="sia-muted-text">Quantas aulas?</span>
                          <button type="button" className="sia-icon-button" onClick={(event) => { event.stopPropagation(); setLessonsToday(Math.max(1, lessonsToday - 1)); }}>-</button>
                          <span className="sia-checklist__lesson-count">{lessonsToday}</span>
                          <button type="button" className="sia-icon-button" onClick={(event) => { event.stopPropagation(); setLessonsToday(Math.min(maxRemaining, lessonsToday + 1)); }}>+</button>
                          <span className="sia-muted-text">de {maxRemaining} restantes</span>
                        </div>
                      ) : null}
                      {checked ? <div className="sia-saved-label">{lessonsAddedToday} aula{lessonsAddedToday > 1 ? "s" : ""} registrada{lessonsAddedToday > 1 ? "s" : ""} · clique para desfazer</div> : null}
                    </div>
                    <span className="sia-time-pill">{item.time}</span>
                  </div>
                  {confirmLesson ? (
                    <div className="sia-checklist__confirm">
                      <span>Registrar <strong>{lessonsToday} aula{lessonsToday > 1 ? "s" : ""}</strong> em <strong>{activeWeek.formation}</strong>?</span>
                      <div className="sia-actions-row">
                        <Btn v="primary" onClick={doRegisterLessons} sx={{ fontSize: 10, padding: "4px 10px" }}>Confirmar</Btn>
                        <Btn v="ghost" onClick={() => setConfirmLesson(false)} sx={{ fontSize: 10, padding: "4px 10px" }}>Cancelar</Btn>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={item.id} className="sia-checklist__item" onClick={() => toggleCheck(item.id)}>
                <div className="sia-checklist__row">
                  <div className={`sia-checklist__toggle ${checked ? "is-checked" : ""}`.trim()}>{checked ? <Ic.Check s={11} /> : null}</div>
                  <div className={`sia-checklist__label ${checked ? "is-checked" : ""}`.trim()}>{item.label}</div>
                  <span className="sia-time-pill">{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>
        {allChecked ? <div className="sia-checklist__success">Estudo registrado automaticamente — streak atualizado!</div> : null}
      </div>

      <div className="sia-annotation-panel">
        <div className="sia-panel-header"><Ic.Note /><span>Anotação</span></div>
        <div className="sia-field-stack">
          <div className="sia-input-label">Vincular a</div>
          <div className="sia-chip-row" style={{ marginBottom: 8 }}>
            <button type="button" className={`sia-choice-chip ${noteTargetType === "formation" ? "is-active" : ""}`.trim()} onClick={() => { setNoteTargetType("formation"); setNoteFormation(activeWeek.formation); }}>Formação</button>
            {manualCards.length > 0 ? <button type="button" className={`sia-choice-chip ${noteTargetType === "card" ? "is-active" : ""}`.trim()} onClick={() => { setNoteTargetType("card"); setNoteFormation(manualCards[0]?.id || ""); }}>Card Manual</button> : null}
          </div>
          <select className="sia-input sia-select" value={noteFormation} onChange={(event) => setNoteFormation(event.target.value)}>
            {noteTargetType === "formation" ? allFormations.map((formation) => <option key={formation} value={formation}>{formation}</option>) : manualCards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}
          </select>
        </div>
        <textarea className="sia-input sia-input--textarea" value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Insight, dúvida, ou aprendizado..." />
        <div className="sia-board-header" style={{ marginTop: 12, marginBottom: 0 }}>
          <span className="sia-annotation-count">{annotationsTodayCount} anotação(ões) hoje</span>
          <div className="sia-actions-row">
            {noteSaved ? <span className="sia-saved-label">Salvo ✓</span> : null}
            <Btn v="primary" disabled={!noteText.trim()} onClick={saveAnnotation} sx={{ fontSize: 11 }}><Ic.Save /> Salvar anotação</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
