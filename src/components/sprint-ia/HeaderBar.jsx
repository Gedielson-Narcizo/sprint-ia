import { Btn, Ic, Pill } from "./ui.jsx";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HeaderBar({
  streak,
  todayLogged,
  nextDelivery,
  activeWeek,
  overallPct,
  showReset,
  setShowReset,
  resetAll,
  tabs,
  tab,
  setTab,
  userName,
}) {
  const sprintMoment = activeWeek
    ? `Semana ${activeWeek.week} em andamento · ${activeWeek.formation}`
    : nextDelivery
      ? `Sprint em andamento · foco na semana ${nextDelivery.week}`
      : "Sprint concluído · entregas principais finalizadas";

  const focusTitle = nextDelivery ? `S${nextDelivery.week} — ${nextDelivery.delivery}` : "Tudo em dia para o próximo passo";
  const focusSupport = nextDelivery
    ? "Mantenha o ritmo de estudo e avance na entrega visível para a liderança."
    : "Revise o roadmap, consolide aprendizados e prepare o próximo ciclo com calma.";
  const primaryTab = activeWeek ? "today" : "roadmap";

  return (
    <header className="sia-header">
      <div className="sia-header__inner">
        <div className="sia-header__top">
          <div className="sia-brand">
            <h1 className="sia-brand__title">
              <strong>Cognia</strong>
            </h1>
          </div>

          <div className="sia-header__actions">
            {streak > 0 ? (
              <div className="sia-badge-box">
                <Ic.Fire />
                <strong>{streak}</strong>
                <span>dias</span>
              </div>
            ) : null}
            {todayLogged ? (
              <div className="sia-header__notice">
                <Ic.Check s={12} /> Hoje ✓
              </div>
            ) : null}
          </div>
        </div>

        <section className="sia-top-hero surface-card">
          <div className="sia-top-hero__context">
            <div className="sia-top-hero__eyebrow">Painel de comando</div>
            <h2 className="sia-top-hero__title">{getGreeting()}, {userName}.</h2>
            <p className="sia-top-hero__subtitle">
              Acompanhe o sprint com clareza, mantenha o foco do dia visível e avance com consistência.
            </p>
            <div className="sia-top-hero__meta">
              <Pill bg="rgba(139, 182, 255, 0.14)" fg="#8bb6ff">
                {overallPct}% concluído
              </Pill>
              <span className="sia-top-hero__moment">{sprintMoment}</span>
            </div>
          </div>

          <div className="sia-focus-card">
            <div className="sia-focus-card__kicker">
              <Ic.Target />
              <span>Foco de hoje</span>
            </div>
            <div className="sia-focus-card__title">{focusTitle}</div>
            <p className="sia-focus-card__text">{focusSupport}</p>

            <div className="sia-focus-card__actions">
              <Btn v="primary" onClick={() => setTab(primaryTab)} sx={{ minWidth: 150 }}>
                Continuar agora
              </Btn>
              <Btn v="ghost" onClick={() => setTab("roadmap")}>
                Ver roadmap
              </Btn>
              <Btn v="ghost" onClick={() => setTab("kanban")}>
                Abrir kanban
              </Btn>
            </div>
          </div>
        </section>

        {showReset ? (
          <div className="sia-reset-banner">
            <span>Resetar todo o progresso?</span>
            <div className="sia-actions-row">
              <Btn v="ghost" onClick={() => setShowReset(false)} sx={{ padding: "4px 10px", fontSize: 11 }}>
                Não
              </Btn>
              <Btn v="danger" onClick={resetAll} sx={{ padding: "4px 10px", fontSize: 11 }}>
                Resetar
              </Btn>
            </div>
          </div>
        ) : null}

        <div className="sia-tabs">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sia-tab ${tab === item.id ? "is-active" : ""}`.trim()}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
