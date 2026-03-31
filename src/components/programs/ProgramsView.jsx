/**
 * @param {{ userId: string }} props
 */
export default function ProgramsView({ userId: _userId }) {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Programas de Estudo</h2>
        <p style={s.sub}>Organize seus programas de capacitação</p>
      </div>

      <div className="surface-card" style={s.empty}>
        <div style={s.emptyIcon}>📚</div>
        <p style={s.emptyTitle}>Nenhum programa ainda</p>
        <p style={s.emptyText}>
          Em breve você poderá criar e gerenciar seus programas de estudo.
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: "24px",
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--sia-text-primary, #f8fafc)",
  },
  sub: {
    margin: 0,
    fontSize: "13px",
    color: "var(--sia-text-muted, #64748b)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "64px 32px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "2.5rem",
    lineHeight: 1,
  },
  emptyTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--sia-text-secondary, #94a3b8)",
  },
  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "var(--sia-text-muted, #64748b)",
    maxWidth: "320px",
    lineHeight: 1.6,
  },
};
