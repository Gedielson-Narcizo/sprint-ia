import { Ic, Pill, ProgressRing } from "./ui.jsx";

export default function WeekCard({ week, phaseColor, onUpdate }) {
  const pct = week.totalLessons > 0 ? Math.round((week.completedLessons / week.totalLessons) * 100) : 0;
  const isDone = pct === 100 && week.deliveryDone;
  const isLocked = week.status === "locked";

  return (
    <article
      className={`sia-week-card ${isDone ? "sia-week-card--done" : ""} ${isLocked ? "sia-week-card--locked" : ""}`.trim()}
      style={{ "--phase-color": phaseColor }}
    >
      <div className="sia-week-card__header">
        <div>
          <div className="sia-week-card__badges">
            <Pill bg={`${phaseColor}18`} fg={phaseColor}>
              S{week.week}
            </Pill>
            {isDone ? (
              <span className="sia-status-icon sia-status-icon--done">
                <Ic.Check s={14} />
              </span>
            ) : null}
            {isLocked ? (
              <span className="sia-status-icon">
                <Ic.Lock />
              </span>
            ) : null}
          </div>
          <h3 className="sia-week-card__title">{week.formation}</h3>
        </div>

        <div className="sia-progress-ring-wrap">
          <ProgressRing pct={pct} size={48} sw={3.2} color={phaseColor} />
          <span className="sia-progress-ring__label">{pct}%</span>
        </div>
      </div>

      {!isLocked ? (
        <div className="sia-week-card__progress">
          <div className="sia-week-card__meta">
            <span className="sia-inline-meta">
              <Ic.Book /> {week.completedLessons}/{week.totalLessons}
            </span>
            <span className="sia-muted-text">~{week.dailyTarget}/dia</span>
          </div>

          <div className="sia-stepper">
            <button
              type="button"
              className="sia-icon-button"
              onClick={() => onUpdate("lessons", Math.max(0, week.completedLessons - 1))}
            >
              -
            </button>
            <div className="sia-stepper__track">
              <div
                className="sia-stepper__fill"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${phaseColor}44, ${phaseColor})` }}
              />
            </div>
            <button
              type="button"
              className="sia-icon-button"
              onClick={() => onUpdate("lessons", Math.min(week.totalLessons, week.completedLessons + 1))}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`sia-delivery-toggle ${week.deliveryDone ? "sia-delivery-toggle--done" : ""}`.trim()}
        onClick={() => !isLocked && onUpdate("delivery", !week.deliveryDone)}
        disabled={isLocked}
      >
        <span
          className="sia-delivery-toggle__checkbox"
          style={{ borderColor: week.deliveryDone ? phaseColor : "#334155", background: week.deliveryDone ? phaseColor : "transparent" }}
        >
          {week.deliveryDone ? <Ic.Check s={9} /> : null}
        </span>
        <span>
          <span className="sia-input-label">Entrega</span>
          <span className="sia-delivery-toggle__text">{week.delivery}</span>
        </span>
      </button>

      {week.notes ? <div className="sia-week-card__notes">{week.notes}</div> : null}
    </article>
  );
}
