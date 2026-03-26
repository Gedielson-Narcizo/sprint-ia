# INSTRUCTIONS.md — Sprint IA Dashboard
## Documento de referência para desenvolvimento

> **Este arquivo é o briefing do projeto.** Consulte-o antes de qualquer alteração.
> Toda decisão de arquitetura, design e regras de negócio está documentada aqui.

---

## 1. Visão geral

**Produto:** Dashboard de governança de capacitação em IA
**Usuário:** Gedielson — Head de Dados & IA na Solaris Energia
**Contexto:** Aluno da plataforma Viver de IA, precisa concluir formações com entregas visíveis ao CEO
**Stack:** React (Vite) · JavaScript · Single-file app (src/App.jsx) · Deploy na Vercel

O dashboard controla:
- Progresso em 9+ formações organizadas em fases
- Checklist diário conectado ao progresso real
- Kanban de governança com cards automáticos e manuais
- Anotações vinculadas a formações e cards
- Métricas de velocidade, streak e projeção

---

## 2. Arquitetura de dados

### State principal (armazenado em localStorage)

```
{
  phases: [                          // Array de fases
    {
      id: "fundacao",                // Identificador único
      name: "Fundação",             // Nome exibido
      color: "#10B981",             // Cor da fase (hex)
      weeks: [                       // Formações dentro da fase
        {
          week: 1,                   // Número da semana no sprint
          formation: "Engenharia de Prompt",  // Nome da formação
          totalLessons: 11,          // Total de aulas
          completedLessons: 0,       // Aulas concluídas
          delivery: "Biblioteca...", // Entrega esperada
          deliveryDone: false,       // Entrega concluída?
          status: "active",          // "active" | "locked"
          dailyTarget: 2,            // Meta de aulas por dia
          notes: ""                  // Observações
        }
      ]
    }
  ],
  dailyLog: { "2026-03-30": true },           // Dias com estudo registrado
  dailyChecklist: { "2026-03-30": { aulas: true, caderno: true, ... } },
  lessonsAddedPerDay: { "2026-03-30": 2 },    // Quantas aulas registradas por dia (para undo)
  annotations: [
    {
      id: "abc123",                  // uid único
      text: "Insight...",            // Conteúdo
      formation: "Engenharia...",    // Formação vinculada (opcional)
      linkedCardId: "m-101",         // Card manual vinculado (opcional)
      timestamp: "2026-03-30T14:30:00.000Z",  // Data/hora de criação
      date: "2026-03-30",           // Data (para filtros rápidos)
      editedAt: null                 // Data de última edição (opcional)
    }
  ],
  kanbanCards: [
    {
      id: "a-100",                   // "a-" = automático, "m-" = manual
      title: "Formação: ...",
      type: "estudo",                // "estudo" | "pratica" | "entrega" | "livre"
      priority: "alta",              // "alta" | "media" | "baixa"
      column: "esta_semana",         // "backlog" | "esta_semana" | "em_progresso" | "concluido"
      week: 1,                       // Semana vinculada (automáticos)
      auto: true,                    // Automático = gerado pelo roadmap
      formation: "Engenharia...",    // Formação vinculada
      description: ""                // Descrição (cards manuais)
    }
  ],
  kanbanIdCounter: 120               // Próximo ID disponível para cards
}
```

### Relações entre entidades

```
Phase → Week (1:N) — uma fase contém múltiplas formações/weeks
Week → KanbanCard (1:2) — cada formação gera 2 cards automáticos (estudo + entrega)
Annotation → Formation (N:1) — anotação vinculada por nome da formação
Annotation → KanbanCard (N:1) — anotação vinculada por linkedCardId (cards manuais)
```

### Storage

- **Chave localStorage:** `sprint-ia-v13`
- **Ao mudar a versão:** incrementar a chave (ex: `sprint-ia-v14`) para evitar conflitos com dados antigos
- **Migração:** na função `load()`, verificar e adicionar campos novos que não existam em dados salvos anteriormente

---

## 3. Design system — Deep Tech & Focus

### Paleta de cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| Fundo principal | Azul marinho profundo | `#0F172A` |
| Sidebar / Navegação | Mais escuro que o fundo | `#0B1120` |
| Cor de ação primária | Gradiente roxo → ciano | `linear-gradient(135deg, #7C3AED, #38BDF8)` |
| Sucesso | Verde esmeralda | `#10B981` |
| Pendente / Aviso | Amarelo âmbar | `#F59E0B` |
| Erro / Alerta | Vermelho coral | `#EF4444` |
| Texto principal | Branco gelo | `#F8FAFC` |
| Texto secundário | Cinza azulado | `#94A3B8` |
| Texto terciário | Cinza escuro | `#64748B` |
| Borda padrão | Slate 700 | `#334155` |
| Borda sutil | Slate 800 | `#1E293B` |
| Superfície de card | Gradiente sutil | `linear-gradient(145deg, #1E293B, #0F172A)` |

### Cores das fases (mantidas distintas)

| Fase | Cor |
|------|-----|
| Fundação | `#10B981` (verde esmeralda) |
| Construção | `#00B4D8` (ciano) |
| Complementar | `#FFB703` (âmbar) |

### Tratamento de cards

- **Border radius:** `10px` (não 12px ou 16px)
- **Borda:** `1px solid #334155`
- **Background:** `linear-gradient(145deg, #1E293B 0%, #0F172A 100%)`
- **Shadow:** `box-shadow: 0 4px 12px -2px rgba(0,0,0,0.4)`
- **Efeito:** cards devem "flutuar" sobre o fundo

### Badges de status

- Background: cor de status com 15% opacidade
- Texto: cor de status full
- Border radius: `5px`
- Font: `9px`, `700 weight`, `uppercase`, `letter-spacing: 0.7`

### Tipografia

- **Display/headings:** `Outfit` (Google Fonts), weight 700-800
- **Corpo/código:** `IBM Plex Mono` (Google Fonts), weight 300-700
- **Tamanhos:** KPI values `22px`, card titles `14px`, labels `11-12px`, badges `9px`

### Botões

| Variante | Estilo |
|----------|--------|
| primary | Gradiente `#7C3AED → #38BDF8`, texto `#F8FAFC`, weight 700 |
| default | Background `rgba(148,163,184,0.08)`, borda `#1E293B` |
| ghost | Transparente, borda `#1E293B`, texto `#94A3B8` |
| danger | Background `rgba(239,68,68,0.15)`, texto `#EF4444` |

### Ícones

SVG inline, sem bibliotecas externas. Todos definidos no objeto `Ic` no topo do arquivo. Para adicionar novo ícone, seguir o padrão existente (16x16 viewBox, stroke only, currentColor).

---

## 4. Regras de negócio

### 4.1 Desbloqueio sequencial

- Formações desbloqueiam em cascata: S1 completa → S2 desbloqueia → S3...
- **Condição de desbloqueio:** `completedLessons === totalLessons AND deliveryDone === true`
- Ao desbloquear, os kanban cards automáticos movem de `backlog` para `esta_semana`
- Formações bloqueadas (`status: "locked"`) renderizam com `opacity: 0.4` e sem controles interativos

### 4.2 Registro de aulas (checklist → roadmap)

- O item "Assistir aulas" no checklist tem stepper (+/−) para definir quantidade
- Ao marcar, exibe diálogo de confirmação antes de registrar
- Ao confirmar: incrementa `completedLessons`, registra `dailyLog`, salva `lessonsAddedPerDay`
- **Reversível:** ao desmarcar, subtrai o valor de `lessonsAddedPerDay[hoje]` do `completedLessons`
- Demais itens do checklist (caderno, notion, prática) são livremente reversíveis sem impacto no roadmap

### 4.3 Sincronização Kanban ↔ Roadmap

- Cards automáticos são gerados pelo `makeInit()` — 2 por formação (estudo + entrega)
- Quando formação desbloqueia → cards movem para `esta_semana`
- Quando formação conclui (100% + entrega) → cards movem para `concluido`
- Cards automáticos NÃO podem ser excluídos (sem botão de delete)
- Cards manuais podem ser excluídos, editados, e vinculados a formações

### 4.4 Anotações

- Cada anotação tem `id` único (gerado por `uid()`)
- Pode vincular a uma formação (por nome) OU a um card manual (por `linkedCardId`)
- Editáveis e excluíveis via modal de detalhes do card
- Exclusão pede confirmação ("Excluir anotação? Sim / Não")
- Anotações editadas recebem campo `editedAt` com timestamp
- Histórico consultável na aba Métricas (timeline com dots coloridos por fase)

### 4.5 Streak

- Incrementa quando `dailyLog[hoje] = true`
- Conta dias consecutivos de trás para frente
- Se undo remove o único registro do dia, `dailyLog[hoje]` é deletado e streak quebra

---

## 5. Componentes atuais

| Componente | Função |
|------------|--------|
| `SprintIA` | App principal, gerencia state e renderiza abas |
| `WeekCard` | Card de formação no Roadmap (progresso, +/−, entrega) |
| `KanbanCard` | Card no Kanban (barra de progresso, pills, drag) |
| `CardDetail` | Modal ao clicar card no Kanban (progresso, timeline de anotações, edição de card manual, edit/delete anotações) |
| `KCol` | Coluna do Kanban (drag & drop zone) |
| `NewCardForm` | Formulário de criação de card manual |
| `Modal` | Overlay genérico reutilizável |
| `StatCard` | Card de KPI (progresso, entregas, streak, projeção) |
| `MiniBar` | Barra de progresso horizontal |
| `ProgressRing` | Anel de progresso circular (SVG) |
| `Pill` | Badge/tag pequena |
| `Btn` | Botão com variantes (primary, ghost, danger, default) |

---

## 6. Convenções de desenvolvimento

### Código

- **Edição cirúrgica:** nunca reescrever o arquivo inteiro. Fazer mudanças pontuais nos trechos necessários
- **Testar após cada mudança:** rodar `npm run dev` e verificar no navegador
- **Commits descritivos:** `feat:`, `fix:`, `design:`, `refactor:`

### State

- Toda mudança de state usa `setData(prev => ...)` com deep clone: `JSON.parse(JSON.stringify(prev))`
- Após alterar `phases`, sempre executar a lógica de sync (desbloqueio + kanban auto-move)
- Extrair essa lógica para uma função `syncUnlocks(data)` se ainda não estiver extraída

### Novos campos

- Ao adicionar campo novo ao state, garantir retrocompatibilidade na função `load()`:
  ```javascript
  if (!d.novoCampo) d.novoCampo = valorPadrao;
  ```
- Incrementar a chave do localStorage apenas em mudanças breaking

### CSS

- Inline styles (padrão atual do projeto — não usar CSS modules ou styled-components)
- Usar as cores do design system (seção 3), nunca `rgba(255,255,255,...)` genérico
- Cards sempre com gradient + border `#334155` + shadow

---

## 7. Backlog de funcionalidades

### Prioridade alta (próximos sprints)

| Feature | Descrição | Complexidade |
|---------|-----------|-------------|
| Sidebar de navegação | Substituir abas horizontais por sidebar fixa à esquerda com 3 seções: Uso diário / Configurações / Futuro | Média |
| Header compacto | KPIs em linha horizontal, liberar espaço vertical | Baixa |
| Editar roadmap | Aba para adicionar/remover/editar formações, ajustar metas, reordenar fases. Modal de edição com campos: nome, total aulas, meta diária, fase, semana, entrega. Botões: + nova formação, + nova fase. Drag & drop para reordenar | Alta |
| Gerenciar fases | Criar fases customizadas além das 3 iniciais (nome + cor) | Média |

### Prioridade média

| Feature | Descrição |
|---------|-----------|
| Trilha com IA | Seção placeholder para conteúdo da plataforma Viver de IA (a ser mapeado) |
| Soluções | Seção placeholder (a ser mapeado) |
| Builder | Seção placeholder (a ser mapeado) |
| Export/backup | Botão para download JSON do state completo |
| Data de início configurável | Campo editável para definir quando o sprint começou |
| Ritual semanal | Template com 3 perguntas de revisão (o que concluí, pendências, plano) salvo por semana |

### Prioridade baixa

| Feature | Descrição |
|---------|-----------|
| Filtro de anotações | Busca por texto e filtro por formação na aba Métricas |
| Notificações | Lembrete visual quando está perto de completar uma formação |
| Tema claro | Toggle light/dark mode (atualmente só dark) |

---

## 8. Regras para edição de roadmap (feature planejada)

Quando implementar a aba "Editar Roadmap", seguir estas regras:

### Editar formação existente

- Campos editáveis: nome, total de aulas, meta diária, fase, semana, entrega
- Se formação tem progresso > 0: não permitir reduzir `totalLessons` abaixo de `completedLessons`
- Se formação está concluída: exibir aviso visual "formação já concluída"
- Ao mudar de fase: recalcular semanas de todas as formações afetadas
- Ao salvar: atualizar state + regenerar kanban cards automáticos se nome mudou

### Adicionar formação

- Entra como `status: "locked"` se a anterior não estiver concluída
- Gera 2 kanban cards automáticos (estudo + entrega) no backlog
- Semana atribuída automaticamente com base na posição

### Excluir formação

- Cards manuais: exclusão direta com confirmação simples
- Formação com progresso = 0: confirmação simples
- Formação com progresso > 0: confirmação dupla ("Esta formação tem X aulas concluídas. Deseja realmente excluir?")
- Ao excluir: remover kanban cards automáticos correspondentes e anotações vinculadas (ou perguntar)

### Adicionar fase

- Campos: nome da fase e cor (color picker ou presets)
- Nova fase aparece abaixo das existentes
- Formações podem ser movidas para ela via modal de edição

### Reordenar

- Drag & drop dentro da lista de formações
- Ao reordenar: recalcular campo `week` de todas as formações automaticamente
- Respeitar desbloqueio sequencial (não permitir mover formação concluída para depois de uma não-concluída)

---

## 9. Estrutura de arquivos

```
sprint-ia/
├── src/
│   ├── App.jsx          ← Arquivo principal (todo o app)
│   ├── main.jsx         ← Entry point do Vite
│   └── index.css        ← Reset CSS mínimo (body margin: 0)
├── public/
├── INSTRUCTIONS.md      ← Este arquivo
├── setup-notion.js      ← Script de criação das databases no Notion
├── package.json
└── vite.config.js
```

### Sobre a estrutura single-file

Atualmente todo o app está em `App.jsx`. Quando o arquivo ultrapassar ~1000 linhas, considerar extrair componentes para arquivos separados:

```
src/
├── App.jsx              ← State principal + layout
├── components/
│   ├── WeekCard.jsx
│   ├── KanbanCard.jsx
│   ├── CardDetail.jsx
│   ├── Sidebar.jsx      ← Quando implementar
│   └── EditRoadmap.jsx  ← Quando implementar
├── constants.js         ← PHASES_INIT, CTYPES, PRIOS, KCOLS
├── icons.jsx            ← Objeto Ic com todos os ícones SVG
└── utils.js             ← uid(), td(), now(), syncUnlocks()
```

Essa refatoração NÃO é urgente. Só fazer quando a complexidade justificar.

---

*INSTRUCTIONS.md v1.0 — Sprint IA · Solaris Energia*
*Atualizar este arquivo sempre que novas decisões de arquitetura forem tomadas.*
