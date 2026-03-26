import WeekCard from "./WeekCard.jsx";

export default function RoadmapView({ phases, updateWeek }) {
  return (
    <section className="sia-view">
      {phases.map((phase) => (
        <div key={phase.id} className="sia-phase-block">
          <div className="sia-phase-block__heading">
            <span className="sia-phase-block__accent" style={{ background: phase.color }} />
            <h2 className="sia-phase-block__title" style={{ color: phase.color }}>
              {phase.name}
            </h2>
            <span className="sia-muted-text">{phase.weeks.length} sem.</span>
          </div>
          <div className="sia-roadmap-grid">
            {phase.weeks.map((week, weekIndex) => (
              <WeekCard key={week.week} week={week} phaseColor={phase.color} onUpdate={(field, value) => updateWeek(phase.id, weekIndex, field, value)} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
