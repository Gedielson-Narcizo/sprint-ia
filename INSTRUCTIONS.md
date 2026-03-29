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
**Stack:** React + Vite + JavaScript + Supabase + Vercel

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
  dayCompleted: { "2026-03-30": false },
  lessonsAddedPerDay: { "2026-03-30": 2 },
  cycleLessonsAddedPerDay: { "2026-03-30": 2 },
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

- **Persistencia principal:** Supabase (tabela `sprint_ia_state`, campo `data` JSONB por `user_id`)
- **Cache local:** localStorage com chave `sprint-ia-v13` — mantido como fallback offline
- **Migracao automatica:** no primeiro login, se Supabase nao tiver dados mas localStorage tiver, os dados sao migrados automaticamente para o banco
- **Nao alterar a chave do localStorage** sem necessidade — ela e usada apenas como cache e migracao
- **Migracoes de shape** devem ser tratadas na funcao `applyMigrations()` em `src/lib/db.js`

### Campos de ciclo diario

- `lessonsAddedPerDay`
  - acumulado total de aulas registradas no dia
  - alimenta progresso agregado e resumo do dia
- `cycleLessonsAddedPerDay`
  - registra apenas as aulas do ciclo atual do checklist
  - permite desfazer somente a rodada mais recente sem apagar o acumulado anterior do dia
- `dayCompleted`
  - mantido por compatibilidade de estado salvo
  - nao e mais o gatilho principal do fluxo de ciclos

---

## 3. Arquitetura atual

### Runtime real do app

```txt
src/main.jsx -> Root (auth) -> Login | sprint_ia_v13_final.jsx
```

- `src/App.jsx` existe mas e apenas o template padrao do Vite — nao e usado
- O fluxo de autenticacao vive em `src/main.jsx` (componente `Root`)
- O container principal do dashboard esta em `sprint_ia_v13_final.jsx`
- Estilos principais em `src/styles/sprint-ia.css`

### Estrutura atual relevante

```txt
sprint-ia/
|-- src/
|   |-- main.jsx                 <- entry point + auth wrapper (Root)
|   |-- App.jsx                  <- template Vite, nao usado
|   |-- index.css
|   |-- styles/
|   |   `-- sprint-ia.css        <- estilos principais
|   |-- lib/
|   |   |-- supabase.js          <- client Supabase (usa VITE_SUPABASE_URL/ANON_KEY)
|   |   `-- db.js                <- loadState / saveState / applyMigrations
|   `-- components/
|       |-- Login.jsx            <- tela de login (e-mail + senha)
|       `-- sprint-ia/
|           |-- HeaderBar.jsx
|           |-- Sidebar.jsx      <- navegacao lateral + logout
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
|-- sprint_ia_v13_final.jsx      <- container principal (recebe userId, onLogout)
|-- vercel.json                  <- build config + cache headers + SPA rewrites
|-- .env.local                   <- vars locais (nao commitado)
|-- INSTRUCTIONS.md
|-- package.json
`-- vite.config.js
```

### Responsabilidades

- `src/main.jsx`
  - verifica sessao Supabase ao carregar
  - renderiza `Login` se nao autenticado
  - renderiza `SprintIA` com `userId` e `onLogout` se autenticado
- `src/lib/supabase.js`
  - inicializa o client Supabase a partir das env vars
  - exporta `supabase` (ou `null` se vars ausentes)
- `src/lib/db.js`
  - `loadState(userId)`: busca no Supabase → fallback localStorage → retorna null
  - `saveState(userId, data)`: upsert no Supabase + cache localStorage
  - `applyMigrations(d)`: garante campos novos em dados antigos
- `src/components/Login.jsx`
  - formulario de login com e-mail e senha
  - chama `supabase.auth.signInWithPassword`
- `sprint_ia_v13_final.jsx`
  - recebe `userId` e `onLogout` como props
  - inicia com `makeInit()` e substitui pelos dados do Supabase via `useRef` (sem bloquear render)
  - salva no Supabase com debounce de 1.5s apos inicializacao
- `syncProgress.js`
  - sincronizacao de desbloqueio sequencial
  - auto-move de cards do kanban
- `ui.jsx`
  - icones inline (incluindo `Ic.Logout`)
  - primitives visuais compartilhadas
- `HeaderBar.jsx`
  - topo principal, hero superior, foco do dia
- `Sidebar.jsx`
  - navegacao lateral, reset no rodape, botao de logout

---

## 4. Design system

### Direcao visual

- Tema escuro
- Linguagem SaaS premium / executiva
- Mais hierarquia visual, clareza operacional e foco do que decoracao
- Superficies consistentes, contraste limpo e densidade controlada
- Visual mais corporativo, com menos ornamento e mais comando

### Paleta base

| Elemento | Valor |
|---|---|
| Fundo principal | `#0A0F1E` |
| Fundo superior | `#111827` |
| Sidebar / navegacao | `#0A0F1E` |
| Superficie principal | `#1E293B` |
| Acao primaria | `#0EA5E9` |
| Acao secundaria / sucesso | `#10B981` |
| Sucesso | `#10B981` |
| Aviso | `#F59E0B` |
| Erro | `#EF4444` |
| Texto principal | `#F8FAFC` |
| Texto secundario | `#CBD5E1` |
| Texto terciario | `#94A3B8` |
| Borda padrao | `#334155` |
| Radius padrao | `12px` |

### Tipografia

- Shell atual: `Inter`
- O shell principal nao usa mais `Outfit` / `IBM Plex Mono` como base visual

### Tokens visuais recorrentes

- Sombras sutis centralizadas em `--sia-shadow` e `--sia-shadow-soft`
- Botoes com variantes reutilizaveis `primary`, `ghost` e `danger`
- Hover e feedbacks visuais curtos, sem microanimacoes excessivas
- Cards de conclusao do checklist com acento esmeralda e resumo do ciclo

### Layout responsivo atual

- `1100px`: grids e hero compactam em duas faixas mais densas
- `800px`: hero e grupos de acoes passam a empilhar
- `768px`: sidebar desktop e ocultada e a navegacao vira experiencia mobile
- `640px`: cards, stats, checklist e modais passam a priorizar leitura vertical

### Estado visual atual do shell

Implementacoes recentes ja incorporadas:
- sidebar fixa desktop com secoes `Uso diario`, `Configuracoes` e `Futuro`
- tabs do header ocultas em desktop quando sidebar esta ativa
- hero superior com saudacao, contexto do sprint e bloco `Foco de hoje`
- a acao de reset saiu do topo e foi movida para o rodape da sidebar
- checklist do dia com estado de conclusao premium e CTA de continuidade
- fluxo de ciclos no checklist para repetir rodadas ate concluir as aulas da formacao
- cards de KPI maiores, com hover discreto e leitura mais clara
- superficies mais planas e consistentes em roadmap, kanban, modais e checklist

### Regras visuais

- Cards com base slate escura, borda `#334155` e sombra curta
- Evitar excesso de altura vertical no topo
- O hero superior deve permanecer compacto e orientado a foco
- Reaproveitar componentes visuais antes de criar novos
- Evitar tomar `src/App.css` e `src/index.css` como referencia do produto
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
  - incrementa `lessonsAddedPerDay`
  - atualiza `cycleLessonsAddedPerDay` com a rodada atual
- Ao desfazer:
  - subtrai apenas o valor da rodada atual
  - preserva o acumulado previamente consolidado no mesmo dia
- Os demais itens do checklist nao alteram roadmap

### Ciclos do checklist diario

- O checklist pode ser concluido mais de uma vez no mesmo dia enquanto houver aulas restantes na formacao ativa
- Ao concluir um ciclo e clicar em `Continuar para a proxima entrega`:
  - o checklist visual e limpo
  - o acumulado do dia e preservado em `lessonsAddedPerDay`
  - o valor desfazivel da rodada e zerado em `cycleLessonsAddedPerDay`
  - o primeiro item volta exatamente ao layout rico original
- No novo ciclo:
  - a pergunta `Quantas aulas?` reaparece
  - o stepper `- / quantidade / +` reaparece
  - a confirmacao de registro volta a funcionar normalmente
- O bloco de conclusao reaparece ao final de cada novo ciclo
- O fluxo se repete ate a formacao ativa atingir `totalLessons`

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

### Autenticacao e variaveis de ambiente

- Autenticacao via Supabase Auth (e-mail + senha)
- Variaveis necessarias (locais em `.env.local`, producao na Vercel):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Variaveis sao embutidas no bundle pelo Vite em tempo de build
- Se ausentes: app exibe mensagem de erro (nao trava com tela branca)
- Supabase RLS ativo: cada usuario acessa apenas seus proprios dados

### Supabase — estrutura do banco

```sql
CREATE TABLE sprint_ia_state (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sprint_ia_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_state" ON sprint_ia_state
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Deploy

- Plataforma: Vercel (Hobby)
- URL producao: `https://sprint-ia-omega.vercel.app`
- Deploy via CLI: `npx vercel --prod`
- Auto-deploy via GitHub: webhook ativo (push para `main` dispara deploy)
- `vercel.json` configura: build com `npx vite build`, cache headers, SPA rewrites

### Edicoes de produto

- Nao alterar:
  - regras de desbloqueio
  - shape do state
  - chave do localStorage (usada como cache)
- Mudancas de UI devem ser isoladas da logica
- Ao mudar o shape do estado, atualizar `applyMigrations()` em `src/lib/db.js`

---

## 7. Backlog vivo

### Alta prioridade

| Feature | Status |
|---|---|
| Sidebar fixa | Implementado |
| Hero superior com foco do dia | Implementado |
| Header mais compacto e orientado | Implementado |
| Checklist com ciclos e estado premium de conclusao | Implementado |
| Autenticacao Supabase (login/logout/sessao) | Implementado |
| Persistencia Supabase por usuario | Implementado |
| Deploy na Vercel com CI via GitHub | Implementado |
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

- Ultima release: `v1.6.0` (auth + persistencia Supabase)
- A chave de storage local continua `sprint-ia-v13` (cache/migracao)

---

## 9. Observacoes operacionais

- Antes de mudar o app, verificar se a alteracao deve ocorrer em:
  - `sprint_ia_v13_final.jsx`
  - componentes em `src/components/sprint-ia`
  - estilos em `src/styles/sprint-ia.css`
- Se houver divergencia entre `src/App.jsx` e o runtime real, considerar `src/main.jsx` como fonte de verdade
- `src/App.jsx`, `src/App.css` e `src/index.css` nao devem orientar decisoes de produto sem confirmar o runtime real
- utilitarios e documentos do Notion nao devem orientar decisoes do frontend principal
- Atualize este documento sempre que a arquitetura ou o fluxo principal mudarem

---

*INSTRUCTIONS.md v1.4 - Sprint IA - Solaris Energia*
