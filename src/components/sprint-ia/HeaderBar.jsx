import { Btn, Ic } from "./ui.jsx";

export default function HeaderBar({ streak, todayLogged, nextDelivery, showReset, setShowReset, resetAll, tabs, tab, setTab }) {
  return (
    <header className="sia-header">
      <div className="sia-header__inner">
        <div className="sia-header__top">
          <div className="sia-brand">
            <h1 className="sia-brand__title">
              Solaris <strong>Sprint IA</strong>
            </h1>
            <div className="sia-brand__subtitle">GEDIELSON · SOLARIS · VIVER DE IA · v1.3</div>
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
            <button type="button" className="sia-icon-button" onClick={() => setShowReset(!showReset)}>
              <Ic.Reset />
            </button>
          </div>
        </div>

        {nextDelivery ? (
          <div className="sia-header__target">
            <Ic.Target />
            <span>Próxima entrega:</span>
            <strong>
              S{nextDelivery.week} — {nextDelivery.delivery}
            </strong>
          </div>
        ) : null}

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
            <button key={item.id} type="button" className={`sia-tab ${tab === item.id ? "is-active" : ""}`.trim()} onClick={() => setTab(item.id)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
