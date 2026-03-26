import { useCallback, useEffect, useMemo, useState } from "react";
import "./src/styles/sprint-ia.css";
import CardDetail from "./src/components/sprint-ia/CardDetail.jsx";
import HeaderBar from "./src/components/sprint-ia/HeaderBar.jsx";
import Sidebar from "./src/components/sprint-ia/Sidebar.jsx";
import KanbanView from "./src/components/sprint-ia/KanbanView.jsx";
import RoadmapView from "./src/components/sprint-ia/RoadmapView.jsx";
import StatsView from "./src/components/sprint-ia/StatsView.jsx";
import TodayView from "./src/components/sprint-ia/TodayView.jsx";
import { syncProgressState } from "./src/components/sprint-ia/syncProgress.js";
import { Ic, StatCard } from "./src/components/sprint-ia/ui.jsx";

const PHASES_INIT = [
  { id: "fundacao", name: "Fundação", color: "#10B981", weeks: [{ week: 1, formation: "Engenharia de Prompt", totalLessons: 11, completedLessons: 0, delivery: "Biblioteca pessoal de prompts para Solaris (Notion)", deliveryDone: false, status: "active", dailyTarget: 2, notes: "" }, { week: 2, formation: "ChatGPT", totalLessons: 10, completedLessons: 0, delivery: "1 caso de uso real aplicado na Solaris com ChatGPT", deliveryDone: false, status: "locked", dailyTarget: 2, notes: "" }] },
  { id: "construcao", name: "Construção", color: "#00B4D8", weeks: [{ week: 3, formation: "Lovable", totalLessons: 12, completedLessons: 0, delivery: "Protótipo de app interno (MVP)", deliveryDone: false, status: "locked", dailyTarget: 3, notes: "Continuar dos 45%" }, { week: 4, formation: "n8n", totalLessons: 15, completedLessons: 0, delivery: "1 automação funcional na Solaris", deliveryDone: false, status: "locked", dailyTarget: 3, notes: "" }, { week: 5, formation: "Typebot", totalLessons: 24, completedLessons: 0, delivery: "Chatbot funcional", deliveryDone: false, status: "locked", dailyTarget: 5, notes: "Continuar dos 4%" }, { week: 6, formation: "SQL com AI", totalLessons: 7, completedLessons: 0, delivery: "Query aplicada a dados reais da Solaris", deliveryDone: false, status: "locked", dailyTarget: 2, notes: "" }] },
  { id: "complementar", name: "Complementar", color: "#FFB703", weeks: [{ week: 7, formation: "Perplexity + Manychat", totalLessons: 23, completedLessons: 0, delivery: "Pesquisa automatizada + fluxo de marketing", deliveryDone: false, status: "locked", dailyTarget: 4, notes: "" }, { week: 8, formation: "ElevenLabs + Freepik", totalLessons: 20, completedLessons: 0, delivery: "Assets de mídia para Solaris", deliveryDone: false, status: "locked", dailyTarget: 4, notes: "" }, { week: 9, formation: "Veo 3", totalLessons: 11, completedLessons: 0, delivery: "Vídeo promocional ou institucional", deliveryDone: false, status: "locked", dailyTarget: 2, notes: "" }] },
];
const KCOLS = ["backlog", "esta_semana", "em_progresso", "concluido"];
const KCOL_LABELS = { backlog: "Backlog", esta_semana: "Esta Semana", em_progresso: "Em Progresso", concluido: "Concluído" };
const KCOL_COLORS = { backlog: "#6B7280", esta_semana: "#00B4D8", em_progresso: "#FFB703", concluido: "#10B981" };
const CTYPES = { estudo: { l: "Estudo", c: "#00B4D8" }, pratica: { l: "Prática", c: "#E040FB" }, entrega: { l: "Entrega", c: "#10B981" }, livre: { l: "Livre", c: "#6B7280" } };
const PRIOS = { alta: { l: "Alta", c: "#EF4444" }, media: { l: "Média", c: "#FFB703" }, baixa: { l: "Baixa", c: "#6B7280" } };

function makeInit() {
  const cards = [];
  let cid = 100;
  PHASES_INIT.forEach((phase) => phase.weeks.forEach((week) => {
    cards.push({ id: `a-${cid++}`, title: `Formação: ${week.formation}`, type: "estudo", priority: "alta", column: week.status === "active" ? "esta_semana" : "backlog", week: week.week, auto: true, formation: week.formation, description: "" });
    cards.push({ id: `a-${cid++}`, title: `Entrega S${week.week}: ${week.delivery}`, type: "entrega", priority: "alta", column: "backlog", week: week.week, auto: true, formation: week.formation, description: "" });
  }));
  return { phases: JSON.parse(JSON.stringify(PHASES_INIT)), startDate: "2026-03-30", dailyLog: {}, dailyChecklist: {}, lessonsAddedPerDay: {}, annotations: [], kanbanCards: cards, kanbanIdCounter: cid };
}

const SK = "sprint-ia-v13";
const load = () => { try { const raw = localStorage.getItem(SK); if (raw) { const data = JSON.parse(raw); if (!data.annotations) data.annotations = []; if (!data.lessonsAddedPerDay) data.lessonsAddedPerDay = {}; return data; } } catch {} return makeInit(); };
const save = (data) => { try { localStorage.setItem(SK, JSON.stringify(data)); } catch {} };
const td = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

export default function SprintIA() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState("roadmap");
  const [showNewCard, setShowNewCard] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [noteFormation, setNoteFormation] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [confirmLesson, setConfirmLesson] = useState(false);
  const [noteTargetType, setNoteTargetType] = useState("formation");

  useEffect(() => { save(data); }, [data]);

  const allWeeks = useMemo(() => data.phases.flatMap((phase) => phase.weeks), [data.phases]);
  const allFormations = useMemo(() => allWeeks.map((week) => week.formation), [allWeeks]);
  const totalL = useMemo(() => allWeeks.reduce((sum, week) => sum + week.totalLessons, 0), [allWeeks]);
  const doneL = useMemo(() => allWeeks.reduce((sum, week) => sum + week.completedLessons, 0), [allWeeks]);
  const overallPct = totalL > 0 ? Math.round((doneL / totalL) * 100) : 0;
  const doneDeliveries = useMemo(() => allWeeks.filter((week) => week.deliveryDone).length, [allWeeks]);
  const activeWeek = useMemo(() => allWeeks.find((week) => week.status === "active" && !(week.completedLessons === week.totalLessons && week.deliveryDone)), [allWeeks]);
  const nextDelivery = useMemo(() => allWeeks.find((week) => !week.deliveryDone && week.status !== "locked"), [allWeeks]);

  useEffect(() => { if (activeWeek) { setLessonsToday(Math.min(activeWeek.dailyTarget, activeWeek.totalLessons - activeWeek.completedLessons)); setNoteFormation(activeWeek.formation); } }, [activeWeek?.formation]);

  const streak = useMemo(() => {
    let count = 0;
    const date = new Date();
    for (let i = 0; i < 90; i += 1) {
      const current = new Date(date);
      current.setDate(current.getDate() - i);
      if (data.dailyLog[current.toISOString().slice(0, 10)]) count += 1;
      else if (i > 0) break;
    }
    return count;
  }, [data.dailyLog]);

  const todayChecks = data.dailyChecklist[td()] || {};
  const todayLogged = !!data.dailyLog[td()];
  const lessonsAddedToday = data.lessonsAddedPerDay?.[td()] || 0;

  const toggleCheck = (id) => setData((prev) => {
    const dailyChecklist = { ...prev.dailyChecklist };
    const day = { ...(dailyChecklist[td()] || {}) };
    day[id] = !day[id];
    dailyChecklist[td()] = day;
    return { ...prev, dailyChecklist };
  });

  const doRegisterLessons = useCallback(() => {
    if (!activeWeek || lessonsToday <= 0) return;
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      for (const phase of next.phases) for (const week of phase.weeks) if (week.formation === activeWeek.formation) { week.completedLessons = Math.min(week.totalLessons, week.completedLessons + lessonsToday); break; }
      next.dailyLog[td()] = true;
      if (!next.lessonsAddedPerDay) next.lessonsAddedPerDay = {};
      next.lessonsAddedPerDay[td()] = (next.lessonsAddedPerDay[td()] || 0) + lessonsToday;
      const dailyChecklist = { ...(next.dailyChecklist[td()] || {}) };
      dailyChecklist.aulas = true;
      next.dailyChecklist[td()] = dailyChecklist;
      return syncProgressState(next);
    });
    setConfirmLesson(false);
  }, [activeWeek, lessonsToday]);

  const undoLessons = useCallback(() => {
    if (!activeWeek || lessonsAddedToday <= 0) return;
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      for (const phase of next.phases) for (const week of phase.weeks) if (week.formation === activeWeek.formation) { week.completedLessons = Math.max(0, week.completedLessons - lessonsAddedToday); break; }
      if (!next.lessonsAddedPerDay) next.lessonsAddedPerDay = {};
      next.lessonsAddedPerDay[td()] = 0;
      const dailyChecklist = { ...(next.dailyChecklist[td()] || {}) };
      dailyChecklist.aulas = false;
      next.dailyChecklist[td()] = dailyChecklist;
      const otherChecks = Object.entries(dailyChecklist).filter(([key, value]) => key !== "aulas" && value);
      if (otherChecks.length === 0) delete next.dailyLog[td()];
      return syncProgressState(next);
    });
  }, [activeWeek, lessonsAddedToday]);

  const checkItems = useMemo(() => !activeWeek ? [] : [
    { id: "aulas", label: `Assistir aulas de ${activeWeek.formation}`, time: "1h15", hasLessons: true },
    { id: "caderno", label: "Anotar conceitos-chave no caderno", time: "durante" },
    { id: "notion", label: "Transferir referências para o Notion", time: "10 min" },
    { id: "pratica", label: "Prática aplicada — exercício ou micro-entrega", time: "45 min" },
  ], [activeWeek]);

  const allChecked = checkItems.length > 0 && checkItems.every((item) => todayChecks[item.id]);

  const saveAnnotation = useCallback(() => {
    if (!noteText.trim()) return;
    const annotation = { id: uid(), text: noteText.trim(), timestamp: now(), date: td() };
    if (noteTargetType === "formation") annotation.formation = noteFormation;
    else { annotation.linkedCardId = noteFormation; const card = data.kanbanCards.find((item) => item.id === noteFormation); if (card?.formation) annotation.formation = card.formation; }
    setData((prev) => ({ ...prev, annotations: [...prev.annotations, annotation] }));
    setNoteText("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }, [noteText, noteFormation, noteTargetType, data.kanbanCards]);

  const editAnnotation = useCallback((id, newText) => setData((prev) => ({ ...prev, annotations: prev.annotations.map((annotation) => annotation.id === id ? { ...annotation, text: newText, editedAt: now() } : annotation) })), []);
  const deleteAnnotation = useCallback((id) => setData((prev) => ({ ...prev, annotations: prev.annotations.filter((annotation) => annotation.id !== id) })), []);
  const manualCards = useMemo(() => data.kanbanCards.filter((card) => !card.auto), [data.kanbanCards]);
  const updateWeek = useCallback((phaseId, weekIndex, field, value) => setData((prev) => { const next = JSON.parse(JSON.stringify(prev)); const phase = next.phases.find((item) => item.id === phaseId); if (!phase) return prev; if (field === "lessons") phase.weeks[weekIndex].completedLessons = value; if (field === "delivery") phase.weeks[weekIndex].deliveryDone = value; return syncProgressState(next); }), []);
  const moveCard = useCallback((cardId, toCol) => setData((prev) => ({ ...prev, kanbanCards: prev.kanbanCards.map((card) => card.id === cardId ? { ...card, column: toCol } : card) })), []);
  const deleteCard = useCallback((cardId) => setData((prev) => ({ ...prev, kanbanCards: prev.kanbanCards.filter((card) => card.id !== cardId) })), []);
  const addCard = useCallback(({ title, type, priority, formation, description }) => setData((prev) => ({ ...prev, kanbanIdCounter: prev.kanbanIdCounter + 1, kanbanCards: [...prev.kanbanCards, { id: `m-${prev.kanbanIdCounter}`, title, type, priority, column: "backlog", auto: false, formation: formation || undefined, description: description || "" }] })), []);
  const updateCard = useCallback((id, updates) => { setData((prev) => ({ ...prev, kanbanCards: prev.kanbanCards.map((card) => card.id === id ? { ...card, ...updates } : card) })); setSelectedCard((prev) => prev?.id === id ? { ...prev, ...updates } : prev); }, []);
  const avgPD = useMemo(() => { const entries = Object.keys(data.dailyLog).length; return entries > 0 ? doneL / entries : 2; }, [data.dailyLog, doneL]);
  return (
    <div className="sia-app sia-app--with-sidebar">
      {selectedCard ? (
        <CardDetail
          card={selectedCard}
          weekData={allWeeks.find((week) => week.formation === selectedCard.formation)}
          annotations={data.annotations}
          allFormations={allFormations}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={updateCard}
          onEditAnnotation={editAnnotation}
          onDeleteAnnotation={deleteAnnotation}
          cardTypes={CTYPES}
          priorities={PRIOS}
        />
      ) : null}

      <Sidebar tab={tab} setTab={setTab} streak={streak} todayLogged={todayLogged} showReset={showReset} setShowReset={setShowReset} />

      <div className="sia-main">
      <HeaderBar
        streak={streak}
        todayLogged={todayLogged}
        nextDelivery={nextDelivery}
        activeWeek={activeWeek}
        overallPct={overallPct}
        showReset={showReset}
        setShowReset={setShowReset}
        resetAll={() => {
            setData(makeInit());
            setShowReset(false);
          }}
          tabs={[
            { id: "roadmap", label: "Roadmap", icon: <Ic.Chart /> },
            { id: "today", label: "Hoje", icon: <Ic.Calendar /> },
            { id: "kanban", label: "Kanban", icon: <Ic.Kanban /> },
            { id: "stats", label: "Métricas", icon: <Ic.Target /> },
          ]}
          tab={tab}
          setTab={setTab}
        />

        <main className="sia-shell">
        <section className="sia-stats-grid">
          <StatCard icon={<Ic.Chart />} label="Progresso" value={`${overallPct}%`} sub={`${doneL}/${totalL} aulas`} accent="#7fe6c6" />
          <StatCard icon={<Ic.Trophy />} label="Entregas" value={`${doneDeliveries}/${allWeeks.length}`} accent="#8bb6ff" />
          <StatCard icon={<Ic.Fire />} label="Streak" value={`${streak}d`} sub={streak >= 7 ? "Forte!" : "Construindo..."} accent="#f5c56e" />
          <StatCard icon={<Ic.Target />} label="Projeção" value={`${Math.ceil((totalL - doneL) / avgPD)}d`} sub={`~${avgPD.toFixed(1)} aulas/dia`} accent="#d795ff" />
        </section>

        {tab === "roadmap" ? <RoadmapView phases={data.phases} updateWeek={updateWeek} /> : null}
        {tab === "today" ? (
          <TodayView
            activeWeek={activeWeek}
            allChecked={allChecked}
            checkItems={checkItems}
            todayChecks={todayChecks}
            undoLessons={undoLessons}
            setConfirmLesson={setConfirmLesson}
            confirmLesson={confirmLesson}
            lessonsToday={lessonsToday}
            setLessonsToday={setLessonsToday}
            doRegisterLessons={doRegisterLessons}
            lessonsAddedToday={lessonsAddedToday}
            toggleCheck={toggleCheck}
            manualCards={manualCards}
            noteTargetType={noteTargetType}
            setNoteTargetType={setNoteTargetType}
            noteFormation={noteFormation}
            setNoteFormation={setNoteFormation}
            allFormations={allFormations}
            noteText={noteText}
            setNoteText={setNoteText}
            noteSaved={noteSaved}
            saveAnnotation={saveAnnotation}
            annotationsTodayCount={data.annotations.filter((annotation) => annotation.date === td()).length}
          />
        ) : null}
        {tab === "kanban" ? (
          <KanbanView
            showNewCard={showNewCard}
            setShowNewCard={setShowNewCard}
            addCard={addCard}
            allFormations={allFormations}
            cardTypes={CTYPES}
            priorities={PRIOS}
            columns={KCOLS}
            labels={KCOL_LABELS}
            colors={KCOL_COLORS}
            cards={data.kanbanCards}
            allWeeks={allWeeks}
            annotations={data.annotations}
            moveCard={moveCard}
            deleteCard={deleteCard}
            setSelectedCard={setSelectedCard}
          />
        ) : null}
        {tab === "stats" ? <StatsView phases={data.phases} annotations={data.annotations} dailyLog={data.dailyLog} avgPD={avgPD} allWeeks={allWeeks} /> : null}

        <footer className="sia-footnote">
          <span>
            <strong>Regra de ouro:</strong> Não avance sem concluir aulas + entrega. Desbloqueio automático.
          </span>
          <span>v1.3</span>
        </footer>
        </main>
      </div>
    </div>
  );
}
