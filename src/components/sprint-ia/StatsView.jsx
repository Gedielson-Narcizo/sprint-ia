import { Ic, MiniBar, Pill } from "./ui.jsx";

export default function StatsView({ phases, annotations, dailyLog, avgPD, allWeeks }) {
  return (
    <section className="sia-view">
      <div className="sia-stats-panel-grid">
        {phases.map((phase) => {
          const phaseLessons = phase.weeks.reduce((sum, week) => sum + week.totalLessons, 0);
          const phaseDone = phase.weeks.reduce((sum, week) => sum + week.completedLessons, 0);
          const phasePct = phaseLessons > 0 ? Math.round((phaseDone / phaseLessons) * 100) : 0;
          const phaseDeliveries = phase.weeks.filter((week) => week.deliveryDone).length;
          return (
            <div key={phase.id} className="sia-stats-phase-card surface-card">
              <div className="sia-stats-phase-card__header"><span className="sia-stats-phase-card__accent" style={{ background: phase.color }} /><span className="sia-stats-phase-card__name" style={{ color: phase.color }}>{phase.name}</span></div>
              <div className="sia-stats-phase-card__meta">
                <div><div className="sia-stats-phase-card__value">{phasePct}%</div><div className="sia-stats-phase-card__caption">{phaseDone}/{phaseLessons} aulas</div></div>
                <div><div className="sia-stats-phase-card__value">{phaseDeliveries}/{phase.weeks.length}</div><div className="sia-stats-phase-card__caption">entregas</div></div>
              </div>
              <MiniBar pct={phasePct} color={phase.color} h={5} />
            </div>
          );
        })}

        <div className="sia-stats-panel">
          <div className="sia-stats-panel__title">Últimos 30 dias</div>
          <div className="sia-heatmap">{Array.from({ length: 30 }, (_, index) => { const day = new Date(); day.setDate(day.getDate() - (29 - index)); const key = day.toISOString().slice(0, 10); const active = !!dailyLog[key]; return <div key={key} className={`sia-heatmap__cell ${active ? "is-active" : ""}`.trim()} title={`${day.toLocaleDateString("pt-BR")}${active ? " ✓" : ""}`} />; })}</div>
          <div className="sia-panel-subtitle">{Object.keys(dailyLog).length} dias</div>
        </div>

        <div className="sia-stats-panel">
          <div className="sia-stats-panel__title">Velocidade</div>
          <div className="sia-stats-phase-card__meta">
            <div><div className="sia-stats-phase-card__value" style={{ color: "#8bb6ff" }}>{avgPD.toFixed(1)}</div><div className="sia-stats-phase-card__caption">aulas/dia</div></div>
            <div><div className="sia-stats-phase-card__value" style={{ color: "#f5c56e" }}>{allWeeks.filter((week) => week.completedLessons === week.totalLessons && week.deliveryDone).length}</div><div className="sia-stats-phase-card__caption">formações</div></div>
          </div>
        </div>
      </div>

      <div className="sia-timeline-panel">
        <div className="sia-panel-header"><Ic.Note /><span>Histórico de Anotações</span><span className="sia-annotation-count">({annotations.length})</span></div>
        {annotations.length === 0 ? (
          <div className="sia-empty-state">Nenhuma anotação. Use a aba "Hoje" para registrar.</div>
        ) : (
          <div className="sia-timeline">
            {[...annotations].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((annotation, index) => {
              const phaseColor = phases.find((phase) => phase.weeks.some((week) => week.formation === annotation.formation))?.color || "#6B7280";
              return (
                <div key={index} className="sia-timeline__item">
                  <div className="sia-timeline__dot" style={{ background: phaseColor }} />
                  <div className="sia-timeline__header">
                    <span className="sia-inline-meta"><Ic.Clock />{new Date(annotation.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {new Date(annotation.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <Pill bg={`${phaseColor}18`} fg={phaseColor}>{annotation.formation}</Pill>
                  </div>
                  <div className="sia-timeline__text">{annotation.text}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
