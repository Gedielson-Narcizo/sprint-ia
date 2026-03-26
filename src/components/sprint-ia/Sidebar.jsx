import { Btn, Ic } from "./ui.jsx";

const SECTIONS = [
  {
    label: "Uso diário",
    items: [
      { id: "roadmap", label: "Roadmap", icon: <Ic.Chart /> },
      { id: "today", label: "Hoje", icon: <Ic.Calendar /> },
      { id: "kanban", label: "Kanban", icon: <Ic.Kanban /> },
      { id: "stats", label: "Métricas", icon: <Ic.Target /> },
    ],
  },
  {
    label: "Configurações",
    items: [
      { id: "edit_roadmap", label: "Editar Roadmap", icon: <Ic.Edit />, disabled: true },
      { id: "manage_phases", label: "Fases", icon: <Ic.Palette />, disabled: true },
    ],
  },
  {
    label: "Futuro",
    items: [
      { id: "trilha_ia", label: "Trilha IA", icon: <Ic.Brain />, disabled: true },
      { id: "solucoes", label: "Soluções", icon: <Ic.Bulb />, disabled: true },
      { id: "builder", label: "Builder", icon: <Ic.Build />, disabled: true },
    ],
  },
];

export default function Sidebar({ tab, setTab, streak, todayLogged, showReset, setShowReset }) {
  return (
    <aside className="sia-sidebar">
      <div className="sia-sidebar__brand">
        <h1 className="sia-sidebar__title">
          Solaris <strong>Sprint IA</strong>
        </h1>
        <div className="sia-sidebar__subtitle">GEDIELSON · SOLARIS · v1.3</div>
      </div>

      {streak > 0 || todayLogged ? (
        <div className="sia-sidebar__status">
          {streak > 0 ? (
            <div className="sia-sidebar__badge sia-sidebar__badge--streak">
              <Ic.Fire /> <strong>{streak}</strong> dias
            </div>
          ) : null}
          {todayLogged ? (
            <div className="sia-sidebar__badge sia-sidebar__badge--done">
              <Ic.Check s={12} /> Hoje
            </div>
          ) : null}
        </div>
      ) : null}

      <nav className="sia-sidebar__nav">
        {SECTIONS.map((section) => (
          <div key={section.label} className="sia-sidebar__section">
            <div className="sia-sidebar__section-label">{section.label}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sia-sidebar__item ${tab === item.id ? "is-active" : ""} ${item.disabled ? "is-disabled" : ""}`.trim()}
                onClick={() => !item.disabled && setTab(item.id)}
                disabled={item.disabled}
              >
                <span className="sia-sidebar__item-icon">{item.icon}</span>
                <span className="sia-sidebar__item-label">{item.label}</span>
                {item.disabled ? <span className="sia-sidebar__soon">Em breve</span> : null}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sia-sidebar__footer">
        <Btn
          v={showReset ? "danger" : "ghost"}
          onClick={() => setShowReset(!showReset)}
          className="sia-sidebar__reset"
        >
          <Ic.Reset /> Resetar progresso
        </Btn>
        <span>Sprint IA · Solaris Energia</span>
      </div>
    </aside>
  );
}
