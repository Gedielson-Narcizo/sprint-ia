// fix-notion.js
// Usa fetch nativo (Node 18+) para contornar bug do SDK que ignora 'properties'
// Executar: $env:NOTION_TOKEN="ntn_xxx"; node fix-notion.js

const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!NOTION_TOKEN) {
  console.error("\n❌ Variável de ambiente necessária:");
  console.error('   $env:NOTION_TOKEN="ntn_xxx"; node fix-notion.js\n');
  process.exit(1);
}

// IDs das databases já criadas (arquivadas — serão restauradas)
const DB1_ID = "28b9a1c9-f673-4c5f-907b-8d09d8261bc6"; // Formações
const DB2_ID = "3fe2dc5d-c548-4d35-8a82-38aed66c6853"; // Aulas
const DB3_ID = "8f204411-d95f-4a9d-b2fd-a8ee89543ed1"; // Prompts & Comandos
const DB4_ID = "0ff099ef-1674-4ed2-bb43-7040528284bd"; // Ideias para Solaris

const HEADERS = {
  "Authorization": `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

function sel(names, colors) {
  return names.map((name, i) => ({ name, color: colors[i] || "default" }));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function notionPatch(path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

async function notionPost(path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

async function main() {
  console.log("\n🔧 Restaurando e configurando databases...\n");

  // ─── DB1: Formações ───────────────────────────
  console.log("📘 Configurando DB1 — Formações...");
  await notionPatch(`/databases/${DB1_ID}`, {
    in_trash: false,
    properties: {
      "Name": { name: "Nome", title: {} },
      "Fase": {
        select: {
          options: sel(
            ["Fundação", "Construção", "Complementar"],
            ["green", "blue", "yellow"]
          ),
        },
      },
      "Status": {
        select: {
          options: sel(
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
  console.log("   ✅ Formações configurada");
  await sleep(500);

  // ─── DB2: Aulas ───────────────────────────────
  console.log("📗 Configurando DB2 — Aulas...");
  await notionPatch(`/databases/${DB2_ID}`, {
    in_trash: false,
    properties: {
      "Name": { name: "Título da Aula", title: {} },
      "Formação": {
        relation: {
          database_id: DB1_ID,
          single_property: {},
        },
      },
      "Número": { number: { format: "number" } },
      "Data Assistida": { date: {} },
      "Insight Principal": { rich_text: {} },
      "Dúvidas": { rich_text: {} },
    },
  });
  console.log("   ✅ Aulas configurada");
  await sleep(500);

  // ─── DB3: Prompts & Comandos ──────────────────
  console.log("📙 Configurando DB3 — Prompts & Comandos...");
  await notionPatch(`/databases/${DB3_ID}`, {
    in_trash: false,
    properties: {
      "Name": { name: "Título", title: {} },
      "Tipo": {
        select: {
          options: sel(
            ["Prompt", "Comando", "Configuração", "Template", "Snippet"],
            ["purple", "blue", "green", "yellow", "orange"]
          ),
        },
      },
      "Ferramenta": {
        select: {
          options: sel(
            ["ChatGPT", "Claude", "n8n", "SQL", "Typebot", "Lovable", "Perplexity", "Manychat", "ElevenLabs", "Freepik", "Veo 3", "Outro"],
            ["green", "purple", "red", "blue", "yellow", "pink", "orange", "blue", "purple", "green", "red", "default"]
          ),
        },
      },
      "Conteúdo": { rich_text: {} },
      "Quando Usar": { rich_text: {} },
      "Exemplo de Resultado": { rich_text: {} },
      "Aula de Origem": {
        relation: {
          database_id: DB2_ID,
          single_property: {},
        },
      },
      "Tags": {
        multi_select: {
          options: sel(
            ["dados", "automação", "comercial", "operações", "marketing", "engenharia", "api", "json", "extração", "análise", "prompt"],
            ["blue", "red", "green", "yellow", "pink", "orange", "purple", "blue", "green", "yellow", "purple"]
          ),
        },
      },
      "Favorito": { checkbox: {} },
    },
  });
  console.log("   ✅ Prompts & Comandos configurada");
  await sleep(500);

  // ─── DB4: Ideias para Solaris ─────────────────
  console.log("📕 Configurando DB4 — Ideias para Solaris...");
  await notionPatch(`/databases/${DB4_ID}`, {
    in_trash: false,
    properties: {
      "Name": { name: "Ideia", title: {} },
      "Área": {
        select: {
          options: sel(
            ["Comercial", "Operações", "Marketing", "Engenharia", "Dados & BI", "Atendimento", "RH"],
            ["green", "yellow", "pink", "orange", "blue", "purple", "red"]
          ),
        },
      },
      "Ferramenta Base": {
        select: {
          options: sel(
            ["ChatGPT", "Claude", "n8n", "SQL", "Typebot", "Lovable", "Perplexity", "Manychat", "ElevenLabs", "Freepik", "Veo 3", "Outro"],
            ["green", "purple", "red", "blue", "yellow", "pink", "orange", "blue", "purple", "green", "red", "default"]
          ),
        },
      },
      "Complexidade": {
        select: {
          options: sel(["MVP (rápido)", "Escala (robusto)"], ["green", "blue"]),
        },
      },
      "Status": {
        select: {
          options: sel(
            ["Ideia", "Validando", "Em construção", "Implantado", "Descartada"],
            ["default", "yellow", "blue", "green", "red"]
          ),
        },
      },
      "Impacto Esperado": {
        select: {
          options: sel(
            ["Reduz custo", "Aumenta receita", "Economiza tempo", "Melhora qualidade", "Melhora experiência"],
            ["red", "green", "yellow", "blue", "purple"]
          ),
        },
      },
      "Descrição": { rich_text: {} },
      "Próximo Passo": { rich_text: {} },
      "Aula de Origem": {
        relation: {
          database_id: DB2_ID,
          single_property: {},
        },
      },
      "Prioridade": {
        select: {
          options: sel(["Alta", "Média", "Baixa"], ["red", "yellow", "default"]),
        },
      },
    },
  });
  console.log("   ✅ Ideias para Solaris configurada");
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
    await notionPost("/pages", {
      parent: { database_id: DB1_ID },
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

  console.log("\n══════════════════════════════════════════");
  console.log("✅ SETUP COMPLETO!");
  console.log("══════════════════════════════════════════");
  console.log(`\n  📘 Formações:          ${DB1_ID}`);
  console.log(`  📗 Aulas:              ${DB2_ID}`);
  console.log(`  📙 Prompts & Comandos: ${DB3_ID}`);
  console.log(`  📕 Ideias p/ Solaris:  ${DB4_ID}`);
  console.log("\n9 formações inseridas. Relações configuradas.");
  console.log("📌 Próximo passo: organize as views no Notion (Board, Table, Calendar).\n");
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message);
  process.exit(1);
});
