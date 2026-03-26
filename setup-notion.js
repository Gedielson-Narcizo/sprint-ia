// setup-notion.js
// Script para criar as 4 databases do Sprint IA no Notion
// Executar: NOTION_TOKEN=seu_token PAGE_ID=seu_page_id node setup-notion.js

const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PAGE_ID = process.env.PAGE_ID;

if (!NOTION_TOKEN || !PAGE_ID) {
  console.error("\n❌ Variáveis de ambiente necessárias:");
  console.error("   NOTION_TOKEN=ntn_xxx PAGE_ID=abc123 node setup-notion.js\n");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function selectOptions(names, colors) {
  return names.map((name, i) => ({ name, color: colors[i] || "default" }));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════
// CREATE DATABASES
// ═══════════════════════════════════════════════════
async function main() {
  console.log("\n🚀 Criando Base de Conhecimento Sprint IA no Notion...\n");

  // ─── DB1: Formações ───────────────────────────
  console.log("📘 Criando DB1 — Formações...");
  const db1 = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Formações" } }],
    icon: { type: "emoji", emoji: "📘" },
    properties: {
      "Nome": { title: {} },
      "Fase": {
        select: {
          options: selectOptions(
            ["Fundação", "Construção", "Complementar"],
            ["green", "blue", "yellow"]
          ),
        },
      },
      "Status": {
        select: {
          options: selectOptions(
            ["Não iniciada", "Em andamento", "Concluída"],
            ["red", "yellow", "green"]
          ),
        },
      },
      "Semana": { number: { format: "number" } },
      "Total de Aulas": { number: { format: "number" } },
      "Aulas Concluídas": { number: { format: "number" } },
      "Entrega": { rich_text: {} },
      "Entrega Feita": { checkbox: {} },
      "Notas Gerais": { rich_text: {} },
    },
  });
  console.log(`   ✅ Formações criada (ID: ${db1.id})`);
  await sleep(500);

  // ─── DB2: Aulas ───────────────────────────────
  console.log("📗 Criando DB2 — Aulas...");
  const db2 = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Aulas" } }],
    icon: { type: "emoji", emoji: "📗" },
    properties: {
      "Título da Aula": { title: {} },
      "Formação": {
        relation: {
          database_id: db1.id,
          single_property: {},
        },
      },
      "Número": { number: { format: "number" } },
      "Data Assistida": { date: {} },
      "Insight Principal": { rich_text: {} },
      "Dúvidas": { rich_text: {} },
    },
  });
  console.log(`   ✅ Aulas criada (ID: ${db2.id})`);
  await sleep(500);

  // ─── DB3: Prompts & Comandos ──────────────────
  console.log("📙 Criando DB3 — Prompts & Comandos...");
  const db3 = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Prompts & Comandos" } }],
    icon: { type: "emoji", emoji: "📙" },
    properties: {
      "Título": { title: {} },
      "Tipo": {
        select: {
          options: selectOptions(
            ["Prompt", "Comando", "Configuração", "Template", "Snippet"],
            ["purple", "blue", "green", "yellow", "orange"]
          ),
        },
      },
      "Ferramenta": {
        select: {
          options: selectOptions(
            [
              "ChatGPT", "Claude", "n8n", "SQL", "Typebot",
              "Lovable", "Perplexity", "Manychat", "ElevenLabs",
              "Freepik", "Veo 3", "Outro",
            ],
            [
              "green", "purple", "red", "blue", "yellow",
              "pink", "orange", "blue", "purple",
              "green", "red", "default",
            ]
          ),
        },
      },
      "Conteúdo": { rich_text: {} },
      "Quando Usar": { rich_text: {} },
      "Exemplo de Resultado": { rich_text: {} },
      "Aula de Origem": {
        relation: {
          database_id: db2.id,
          single_property: {},
        },
      },
      "Tags": {
        multi_select: {
          options: selectOptions(
            [
              "dados", "automação", "comercial", "operações",
              "marketing", "engenharia", "api", "json",
              "extração", "análise", "prompt",
            ],
            [
              "blue", "red", "green", "yellow",
              "pink", "orange", "purple", "blue",
              "green", "yellow", "purple",
            ]
          ),
        },
      },
      "Favorito": { checkbox: {} },
    },
  });
  console.log(`   ✅ Prompts & Comandos criada (ID: ${db3.id})`);
  await sleep(500);

  // ─── DB4: Ideias para Solaris ─────────────────
  console.log("📕 Criando DB4 — Ideias para Solaris...");
  const db4 = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Ideias para Solaris" } }],
    icon: { type: "emoji", emoji: "📕" },
    properties: {
      "Ideia": { title: {} },
      "Área": {
        select: {
          options: selectOptions(
            [
              "Comercial", "Operações", "Marketing",
              "Engenharia", "Dados & BI", "Atendimento", "RH",
            ],
            [
              "green", "yellow", "pink",
              "orange", "blue", "purple", "red",
            ]
          ),
        },
      },
      "Ferramenta Base": {
        select: {
          options: selectOptions(
            [
              "ChatGPT", "Claude", "n8n", "SQL", "Typebot",
              "Lovable", "Perplexity", "Manychat", "ElevenLabs",
              "Freepik", "Veo 3", "Outro",
            ],
            [
              "green", "purple", "red", "blue", "yellow",
              "pink", "orange", "blue", "purple",
              "green", "red", "default",
            ]
          ),
        },
      },
      "Complexidade": {
        select: {
          options: selectOptions(
            ["MVP (rápido)", "Escala (robusto)"],
            ["green", "blue"]
          ),
        },
      },
      "Status": {
        select: {
          options: selectOptions(
            ["Ideia", "Validando", "Em construção", "Implantado", "Descartada"],
            ["default", "yellow", "blue", "green", "red"]
          ),
        },
      },
      "Impacto Esperado": {
        select: {
          options: selectOptions(
            [
              "Reduz custo", "Aumenta receita", "Economiza tempo",
              "Melhora qualidade", "Melhora experiência",
            ],
            ["red", "green", "yellow", "blue", "purple"]
          ),
        },
      },
      "Descrição": { rich_text: {} },
      "Próximo Passo": { rich_text: {} },
      "Aula de Origem": {
        relation: {
          database_id: db2.id,
          single_property: {},
        },
      },
      "Prioridade": {
        select: {
          options: selectOptions(
            ["Alta", "Média", "Baixa"],
            ["red", "yellow", "default"]
          ),
        },
      },
    },
  });
  console.log(`   ✅ Ideias para Solaris criada (ID: ${db4.id})`);
  await sleep(500);

  // ─── POPULAR DB1 com as 9 formações ───────────
  console.log("\n📝 Populando DB1 com as 9 formações...");

  const formacoes = [
    { nome: "Engenharia de Prompt", fase: "Fundação", semana: 1, aulas: 11, entrega: "Biblioteca pessoal de prompts para Solaris (Notion)" },
    { nome: "ChatGPT", fase: "Fundação", semana: 2, aulas: 10, entrega: "1 caso de uso real aplicado na Solaris com ChatGPT" },
    { nome: "Lovable", fase: "Construção", semana: 3, aulas: 12, entrega: "Protótipo de app interno (MVP)" },
    { nome: "n8n", fase: "Construção", semana: 4, aulas: 15, entrega: "1 automação funcional rodando na Solaris" },
    { nome: "Typebot", fase: "Construção", semana: 5, aulas: 24, entrega: "Chatbot funcional (atendimento ou qualificação)" },
    { nome: "SQL com AI", fase: "Construção", semana: 6, aulas: 7, entrega: "Query aplicada a dados reais da Solaris" },
    { nome: "Perplexity + Manychat", fase: "Complementar", semana: 7, aulas: 23, entrega: "Pesquisa automatizada + fluxo de marketing" },
    { nome: "ElevenLabs + Freepik", fase: "Complementar", semana: 8, aulas: 20, entrega: "Assets de mídia para Solaris" },
    { nome: "Veo 3", fase: "Complementar", semana: 9, aulas: 11, entrega: "Vídeo promocional ou institucional" },
  ];

  for (const f of formacoes) {
    await notion.pages.create({
      parent: { database_id: db1.id },
      properties: {
        "Nome": { title: [{ text: { content: f.nome } }] },
        "Fase": { select: { name: f.fase } },
        "Status": { select: { name: "Não iniciada" } },
        "Semana": { number: f.semana },
        "Total de Aulas": { number: f.aulas },
        "Aulas Concluídas": { number: 0 },
        "Entrega": { rich_text: [{ text: { content: f.entrega } }] },
        "Entrega Feita": { checkbox: false },
      },
    });
    console.log(`   ✅ ${f.nome}`);
    await sleep(300);
  }

  // ─── RESULTADO ────────────────────────────────
  console.log("\n══════════════════════════════════════════");
  console.log("✅ SETUP COMPLETO!");
  console.log("══════════════════════════════════════════");
  console.log("\nDatabases criadas:");
  console.log(`  📘 Formações:         ${db1.id}`);
  console.log(`  📗 Aulas:             ${db2.id}`);
  console.log(`  📙 Prompts & Comandos: ${db3.id}`);
  console.log(`  📕 Ideias p/ Solaris: ${db4.id}`);
  console.log("\n9 formações pré-populadas na DB1.");
  console.log("Relações configuradas: Aulas→Formações, Prompts→Aulas, Ideias→Aulas");
  console.log("\n📌 Próximo passo: abra o Notion e organize as views (Board, Table, Calendar).");
  console.log("   Consulte o guia 'notion_template_sprint_ia.md' para detalhes.\n");
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message);
  if (err.code === "unauthorized") {
    console.error("   Verifique se o token está correto e se a página foi compartilhada com a Integration.");
  }
  if (err.code === "object_not_found") {
    console.error("   Verifique se o PAGE_ID está correto e se a página foi compartilhada com a Integration.");
  }
  process.exit(1);
});