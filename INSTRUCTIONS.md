# INSTRUCTIONS.md - Sprint IA Dashboard
## Documento de referencia para desenvolvimento

> Este arquivo e o briefing vivo do projeto.
> Consulte-o antes de qualquer alteracao relevante.
> Toda decisao de arquitetura, design e regras de negocio deve ser refletida aqui.

---

## 1. Visao geral

**Produto:** Dashboard de governanca de capacitacao em IA
**Usuario:** Gedielson - Head de Dados & IA na Solaris Energia
**Contexto:** Aluno da plataforma Viver de IA, precisa concluir formacoes com entregas visiveis ao CEO
**Stack:** React + Vite + JavaScript + Vercel

O dashboard controla:
- Progresso em formacoes organizadas por fases
- Checklist diario conectado ao progresso real
- Kanban de governanca com cards automaticos e manuais
- Anotacoes vinculadas a formacoes e cards
- Metricas de velocidade, streak e projecao

---

## 2. Estado e persistencia

### State principal

```js
{
  phases: [
    {
      id: "fundacao",
      name: "Fundacao",
      color: "#10B981",
      weeks: [
        {
          week: 1,
          formation: "Engenharia de Prompt",
          totalLessons: 11,
          completedLessons: 0,
          delivery: "Biblioteca...",
          deliveryDone: false,
          status: "active",
          dailyTarget: 2,
          notes: ""
        }
      ]
    }
  ],
  dailyLog: { "2026-03-30": true },
  dailyChecklist: { "2026-03-30": { aulas: true, caderno: true } },
  lessonsAddedPerDay: { "2026-03-30": 2 },
  annotations: [
    {
      id: "abc123",
      text: "Insight...",
      formation: "Engenharia de Prompt",
      linkedCardId: "m-101",
      timestamp: "2026-03-30T14:30:00.000Z",
      date: "2026-03-30",
      editedAt: null
    }
  ],
  kanbanCards: [
    {
      id: "a-100",
      title: "Formacao: ...",
      type: "estudo",
      priority: "alta",
      column: "esta_semana",
      week: 1,
      auto: true,
      formation: "Engenharia de Prompt",
      description: ""
    }
  ],
  kanbanIdCounter: 120
}
```

### Relacoes entre entidades

- `Phase -> Week (1:N)`: uma fase contem multiplas formacoes
- `Week -> KanbanCard (1:2)`: cada formacao gera 2 cards automaticos
- `Annotation -> Formation (N:1)`: vinculacao por nome da formacao
- `Annotation -> KanbanCard (N:1)`: vinculacao por `linkedCardId`

### Storage

- **Chave localStorage atual:** `sprint-ia-v13`
- **Nao alterar a chave** em mudancas visuais ou refatoracoes sem quebra
- **So incrementar a chave** quando houver mudanca breaking no shape do estado salvo
- **Migracoes** devem continuar sendo tratadas em `load()`

---

## 3. Arquitetura atual

### Runtime real do app

Hoje o app roda assim:

```txt
src/main.jsx -> ../sprint_ia_v13_final.jsx
```

Observacoes importantes:
- `src/App.jsx` existe, mas e apenas o template padrao do Vite e **nao** e a tela principal em uso
- o container principal do dashboard esta em `sprint_ia_v13_final.jsx`
- a UI foi refatorada para componentes em `src/components/sprint-ia`
- os estilos principais vivem em `src/styles/sprint-ia.css`

### Estrutura atual relevante

```txt
sprint-ia/
|-- src/
|   |-- main.jsx
|   |-- App.jsx                  <- template Vite, nao usado no runtime atual
|   |-- index.css
|   |-- styles/
|   |   `-- sprint-ia.css
|   `-- components/
|       `-- sprint-ia/
|           |-- HeaderBar.jsx
|           |-- Sidebar.jsx
|           |-- RoadmapView.jsx
|           |-- TodayView.jsx
|           |-- KanbanView.jsx
|           |-- StatsView.jsx
|           |-- WeekCard.jsx
|           |-- KanbanCard.jsx
|           |-- CardDetail.jsx
|           |-- NewCardForm.jsx
|           |-- ui.jsx
|           `-- syncProgress.js
|-- sprint_ia_v13_final.jsx      <- container principal real
|-- INSTRUCTIONS.md
|-- package.json
`-- vite.config.js
```

### Responsabilidades

- `sprint_ia_v13_final.jsx`
  - state principal
  - persistencia
  - callbacks de negocio
  - composicao das views
- `syncProgress.js`
  - sincronizacao de desbloqueio sequencial
  - auto-move de cards do kanban
- `ui.jsx`
  - icones inline
  - primitives visuais compartilhadas
- `HeaderBar.jsx`
  - topo principal
  - hero superior
  - foco do dia
  - confirmacao visual de reset
- `Sidebar.jsx`
  - navegacao lateral
  - acesso ao reset pelo rodape

---

## 4. Design system

### Direcao visual

- Tema escuro
- Linguagem SaaS premium / deep tech
- Mais hierarquia visual do que decoracao
- Superficies elegantes, contraste limpo e densidade controlada

### Paleta base

| Elemento | Valor |
|---|---|
| Fundo principal | `#0F172A` |
| Sidebar / navegacao | `#0B1120` |
| Acao primaria | gradiente azul/ciano |
| Sucesso | `#10B981` |
| Aviso | `#F59E0B` |
| Erro | `#EF4444` |
| Texto principal | `#F8FAFC` |
| Texto secundario | `#94A3B8` |
| Texto terciario | `#64748B` |
| Borda padrao | `#334155` |
| Borda sutil | `#1E293B` |

### Tipografia

- Titulos: `Outfit`
- Corpo e UI tecnica: `IBM Plex Mono`

### Estado visual atual do shell

Implementacoes recentes ja incorporadas:
- sidebar fixa desktop com secoes `Uso diario`, `Configuracoes` e `Futuro`
- tabs do header ocultas em desktop quando sidebar esta ativa
- hero superior com saudacao, contexto do sprint e bloco `Foco de hoje`
- a acao de reset saiu do topo e foi movida para o rodape da sidebar

### Regras visuais

- Cards com gradiente escuro, borda suave e sombra discreta
- Evitar excesso de altura vertical no topo
- Reaproveitar componentes visuais antes de criar novos
- Melhorar hierarquia sem aumentar ruído

---

## 5. Regras de negocio

### Desbloqueio sequencial

- Formaçoes desbloqueiam em cascata
- Condicao:
  - `completedLessons === totalLessons`
  - `deliveryDone === true`
- Ao desbloquear:
  - a proxima formacao passa a `active`
  - cards automaticos saem de `backlog` para `esta_semana`

### Registro de aulas

- O item `Assistir aulas` no checklist usa stepper
- Ha confirmacao antes de registrar
- Ao confirmar:
  - incrementa `completedLessons`
  - registra `dailyLog`
  - salva `lessonsAddedPerDay`
- Ao desfazer:
  - subtrai o valor salvo no dia
- Os demais itens do checklist nao alteram roadmap

### Sincronizacao Kanban <-> Roadmap

- `makeInit()` gera 2 cards automaticos por formacao
- Formacao desbloqueada move cards para `esta_semana`
- Formacao concluida move cards para `concluido`
- Cards automaticos nao podem ser excluidos
- Cards manuais podem ser criados, editados e removidos

### Anotacoes

- Cada anotacao usa `uid()`
- Pode vincular a formacao ou card manual
- Pode ser editada e excluida no detalhe do card
- `editedAt` deve ser preenchido em edicoes

### Streak

- Usa `dailyLog`
- Conta dias consecutivos para tras
- Se o unico registro do dia for removido, a streak quebra

---

## 6. Convencoes de desenvolvimento

### Codigo

- Fazer mudancas cirurgicas
- Nao reescrever modulos inteiros sem necessidade real
- Preservar a logica de negocio existente
- Sempre preferir componentes e estilos reutilizaveis quando o ganho for claro

### State

- Alteracoes complexas continuam usando `setData(prev => ...)`
- Onde houver mutacao estrutural, manter deep clone com `JSON.parse(JSON.stringify(prev))`
- Depois de alterar `phases`, reaplicar sincronizacao via `syncProgressState(next)`

### CSS

- O projeto agora usa uma camada central em `src/styles/sprint-ia.css`
- Evitar voltar a espalhar estilos inline desnecessariamente
- Inline style deve ficar restrito ao que for dinamico:
  - cores por fase/status
  - larguras de progresso
  - estados pontuais

### Edicoes de produto

- Nao alterar:
  - regras de desbloqueio
  - shape do state
  - chave do localStorage
- Mudancas de UI devem ser isoladas da logica

---

## 7. Backlog vivo

### Alta prioridade

| Feature | Status |
|---|---|
| Sidebar fixa | Implementado |
| Hero superior com foco do dia | Implementado |
| Header mais compacto e orientado | Parcialmente implementado |
| Editar roadmap | Planejado |
| Gerenciar fases | Planejado |

### Media prioridade

| Feature | Status |
|---|---|
| Trilha com IA | Placeholder |
| Solucoes | Placeholder |
| Builder | Placeholder |
| Export/backup | Planejado |
| Data de inicio configuravel | Planejado |
| Ritual semanal | Planejado |

### Baixa prioridade

| Feature | Status |
|---|---|
| Filtro de anotacoes | Planejado |
| Notificacoes | Planejado |
| Tema claro | Planejado |

---

## 8. Versionamento

### Convencao adotada

- **Git tags:** SemVer
  - formato: `vMAJOR.MINOR.PATCH`
  - exemplo: `v1.4.0`
- **Versao visual do produto:** pode acompanhar a `MINOR`
  - exemplo: release visual/funcional atual = `v1.4`
- **Versao do localStorage:** independente da tag Git
  - so muda em quebra de compatibilidade do estado salvo

### Regra pratica

- `PATCH`: correcao pequena sem impacto estrutural
- `MINOR`: melhoria visual/funcional compatível
- `MAJOR`: alteracao com quebra significativa ou migracao forte

### Estado atual

- Ultima release organizada para remoto: `v1.4.0`
- A chave de storage continua `sprint-ia-v13`

---

## 9. Observacoes operacionais

- Antes de mudar o app, verificar se a alteracao deve ocorrer em:
  - `sprint_ia_v13_final.jsx`
  - componentes em `src/components/sprint-ia`
  - estilos em `src/styles/sprint-ia.css`
- Se houver divergencia entre `src/App.jsx` e o runtime real, considerar `src/main.jsx` como fonte de verdade
- Atualize este documento sempre que a arquitetura ou o fluxo principal mudarem

---

*INSTRUCTIONS.md v1.1 - Sprint IA - Solaris Energia*
