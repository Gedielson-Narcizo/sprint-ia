import { useMemo, useRef } from "react";
import { Btn, Ic, MiniBar, Pill } from "./ui.jsx";

function formatEstimate(minutes) {
  if (minutes <= 0) return "Fluxo leve";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) return `${hours}h${String(mins).padStart(2, "0")}`;
  if (hours) return `${hours}h`;
  return `${mins} min`;
}

export default function TodayView({
  activeWeek,
  allChecked,
  checkItems,
  todayChecks,
  undoLessons,
  setConfirmLesson,
  confirmLesson,
  lessonsToday,
  setLessonsToday,
  doRegisterLessons,
  lessonsAddedToday,
  currentCycleLessonsToday,
  toggleCheck,
  manualCards,
  noteTargetType,
  setNoteTargetType,
  noteFormation,
  setNoteFormation,
  allFormations,
  noteText,
  setNoteText,
  noteSaved,
  saveAnnotation,
  annotationsTodayCount,
  streak,
  overallPct,
  doneL,
  totalL,
  onContinueNextDelivery,
}) {
  const noteEditorRef = useRef(null);

  const estimatedMinutes = useMemo(
    () =>
      checkItems.reduce((sum, item) => {
        if (item.hasLessons) return sum + 75;
        if (item.id === "pratica") return sum + 45;
        if (item.id === "notion") return sum + 10;
        return sum;
      }, 0),
    [checkItems]
  );

  const completionStats = useMemo(
    () => [
      {
        label: "Aulas do dia",
        value: `${lessonsAddedToday || 0}`,
        helper: lessonsAddedToday > 0 ? "registradas" : "sem registro",
      },
      {
        label: "Streak",
        value: `${streak}d`,
        helper: streak >= 7 ? "ritmo forte" : "consistência em construção",
      },
      {
        label: "Progresso",
        value: `${overallPct}%`,
        helper: `${doneL}/${totalL} aulas`,
      },
      {
        label: "Tempo",
        value: formatEstimate(estimatedMinutes),
        helper: "esforço estimado",
      },
    ],
    [doneL, estimatedMinutes, lessonsAddedToday, overallPct, streak, totalL]
  );

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

  const handleFocusNote = () => {
    noteEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    noteEditorRef.current?.focus();
  };

  return (
    <section className="sia-view">
      <div className="sia-panel surface-card">
        <div className="sia-panel-header">
          <Ic.Calendar />
          <span>Semana {activeWeek.week} · Formação ativa</span>
        </div>
        <div className="sia-panel-title">{activeWeek.formation}</div>
        <div className="sia-panel-subtitle">
          {activeWeek.completedLessons}/{activeWeek.totalLessons} aulas · {activeWeek.totalLessons - activeWeek.completedLessons} restantes
        </div>
        <MiniBar
          pct={Math.round((activeWeek.completedLessons / activeWeek.totalLessons) * 100)}
          color="#7fe6c6"
          h={5}
        />
      </div>

      <div className={`sia-panel surface-card sia-checklist-panel ${allChecked ? "is-complete" : ""}`.trim()} style={{ marginTop: 16 }}>
        <div className="sia-checklist__header">
          <span className="sia-panel-title" style={{ marginBottom: 0 }}>Checklist do dia</span>
          {allChecked ? (
            <Pill bg="rgba(127, 230, 198, 0.14)" fg="#7fe6c6">
              Completo ✓
            </Pill>
          ) : null}
        </div>

        <div className="sia-checklist">
          {checkItems.map((item) => {
            const checked = !!todayChecks[item.id];

            if (item.hasLessons) {
              const maxRemaining = activeWeek.totalLessons - activeWeek.completedLessons;

              return (
                <div key={item.id} className="sia-checklist__item sia-checklist__item--rich">
                  <div className="sia-checklist__row">
                    <div
                      className={`sia-checklist__toggle ${checked ? "is-checked" : ""}`.trim()}
                      onClick={() => {
                        if (checked) undoLessons();
                        else setConfirmLesson(true);
                      }}
                    >
                      {checked ? <Ic.Check s={11} /> : null}
                    </div>

                    <div className="sia-checklist__content">
                      <div className="sia-checklist__title-row">
                        <div className={`sia-checklist__label ${checked ? "is-checked" : ""}`.trim()}>
                          {item.label}
                        </div>
                        <span className="sia-time-pill">{item.time}</span>
                      </div>

                      {!checked && !confirmLesson ? (
                        <div className="sia-checklist__lesson-row">
                          <span className="sia-muted-text">Quantas aulas?</span>
                          <button
                            type="button"
                            className="sia-icon-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setLessonsToday(Math.max(1, lessonsToday - 1));
                            }}
                          >
                            -
                          </button>
                          <span className="sia-checklist__lesson-count">{lessonsToday}</span>
                          <button
                            type="button"
                            className="sia-icon-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setLessonsToday(Math.min(maxRemaining, lessonsToday + 1));
                            }}
                          >
                            +
                          </button>
                          <span className="sia-muted-text">de {maxRemaining} restantes</span>
                        </div>
                      ) : null}

                      {checked ? (
                        <div className="sia-saved-label">
                          {currentCycleLessonsToday} aula{currentCycleLessonsToday > 1 ? "s" : ""} registrada
                          {currentCycleLessonsToday > 1 ? "s" : ""} · clique para desfazer
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {confirmLesson ? (
                    <div className="sia-checklist__confirm">
                      <span>
                        Registrar <strong>{lessonsToday} aula{lessonsToday > 1 ? "s" : ""}</strong> em <strong>{activeWeek.formation}</strong>?
                      </span>
                      <div className="sia-actions-row">
                        <Btn v="primary" onClick={doRegisterLessons} sx={{ fontSize: 10, padding: "4px 10px" }}>
                          Confirmar
                        </Btn>
                        <Btn v="ghost" onClick={() => setConfirmLesson(false)} sx={{ fontSize: 10, padding: "4px 10px" }}>
                          Cancelar
                        </Btn>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={item.id} className="sia-checklist__item" onClick={() => toggleCheck(item.id)}>
                <div className="sia-checklist__row">
                  <div className={`sia-checklist__toggle ${checked ? "is-checked" : ""}`.trim()}>
                    {checked ? <Ic.Check s={11} /> : null}
                  </div>
                  <div className={`sia-checklist__label ${checked ? "is-checked" : ""}`.trim()}>
                    {item.label}
                  </div>
                  <span className="sia-time-pill">{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {allChecked ? (
          <div className="sia-checklist__completion">
            <div className="sia-checklist__completion-head">
              <div className="sia-checklist__completion-icon">
                <Ic.Trophy />
              </div>

              <div>
                <div className="sia-checklist__completion-kicker">Dia concluído</div>
                <div className="sia-checklist__completion-title">Checklist encerrado com consistência.</div>
                <p className="sia-checklist__completion-text">
                  Seu bloco principal de estudo foi concluído com sucesso. Registre o principal aprendizado ou siga para a próxima entrega com clareza.
                </p>
              </div>
            </div>

            <div className="sia-checklist__summary-grid">
              {completionStats.map((stat) => (
                <div key={stat.label} className="sia-checklist__summary-card">
                  <span className="sia-checklist__summary-label">{stat.label}</span>
                  <strong className="sia-checklist__summary-value">{stat.value}</strong>
                  <span className="sia-checklist__summary-helper">{stat.helper}</span>
                </div>
              ))}
            </div>

            <div className="sia-checklist__success">
              Novo ciclo pronto. O registro das aulas e o progresso do dia foram preservados.
            </div>

            <div className="sia-checklist__completion-actions">
              <Btn v="primary" onClick={() => onContinueNextDelivery("today")}>
                <Ic.Target /> Continuar para a próxima entrega
              </Btn>
              <Btn v="ghost" onClick={handleFocusNote}>
                Registrar aprendizado
              </Btn>
              <Btn v="ghost" onClick={() => onContinueNextDelivery("kanban")}>
                Planejar amanhã
              </Btn>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sia-annotation-panel">
        <div className="sia-panel-header">
          <Ic.Note />
          <span>Anotação</span>
        </div>
        <div className="sia-field-stack">
          <div className="sia-input-label">Vincular a</div>
          <div className="sia-chip-row" style={{ marginBottom: 8 }}>
            <button
              type="button"
              className={`sia-choice-chip ${noteTargetType === "formation" ? "is-active" : ""}`.trim()}
              onClick={() => {
                setNoteTargetType("formation");
                setNoteFormation(activeWeek.formation);
              }}
            >
              Formação
            </button>
            {manualCards.length > 0 ? (
              <button
                type="button"
                className={`sia-choice-chip ${noteTargetType === "card" ? "is-active" : ""}`.trim()}
                onClick={() => {
                  setNoteTargetType("card");
                  setNoteFormation(manualCards[0]?.id || "");
                }}
              >
                Card manual
              </button>
            ) : null}
          </div>
          <select className="sia-input sia-select" value={noteFormation} onChange={(event) => setNoteFormation(event.target.value)}>
            {noteTargetType === "formation"
              ? allFormations.map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))
              : manualCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.title}
                  </option>
                ))}
          </select>
        </div>
        <textarea
          ref={noteEditorRef}
          className="sia-input sia-input--textarea"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder="Insight, dúvida ou aprendizado..."
        />
        <div className="sia-board-header" style={{ marginTop: 12, marginBottom: 0 }}>
          <span className="sia-annotation-count">{annotationsTodayCount} anotação(ões) hoje</span>
          <div className="sia-actions-row">
            {noteSaved ? <span className="sia-saved-label">Salvo ✓</span> : null}
            <Btn v="primary" disabled={!noteText.trim()} onClick={saveAnnotation} sx={{ fontSize: 11 }}>
              <Ic.Save /> Salvar anotação
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
