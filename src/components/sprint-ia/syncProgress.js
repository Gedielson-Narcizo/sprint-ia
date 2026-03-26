export function syncProgressState(data) {
  const next = JSON.parse(JSON.stringify(data));
  const flat = next.phases.flatMap((phase) => phase.weeks);

  for (let i = 1; i < flat.length; i += 1) {
    const previousWeek = flat[i - 1];
    if (
      previousWeek.completedLessons === previousWeek.totalLessons &&
      previousWeek.deliveryDone &&
      flat[i].status === "locked"
    ) {
      flat[i].status = "active";
      next.kanbanCards = next.kanbanCards.map((card) =>
        card.auto && card.week === flat[i].week && card.column === "backlog"
          ? { ...card, column: "esta_semana" }
          : card
      );
    }
  }

  const doneFormations = flat
    .filter((week) => week.completedLessons === week.totalLessons && week.deliveryDone)
    .map((week) => week.formation);

  next.kanbanCards = next.kanbanCards.map((card) =>
    card.auto && doneFormations.includes(card.formation) && card.column !== "concluido"
      ? { ...card, column: "concluido" }
      : card
  );

  return next;
}
