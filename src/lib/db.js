import { supabase } from "./supabase.js";

const SK = "sprint-ia-v13"; // chave localStorage (mantida para migração)

function applyMigrations(d) {
  if (!d.annotations) d.annotations = [];
  if (!d.lessonsAddedPerDay) d.lessonsAddedPerDay = {};
  if (!d.cycleLessonsAddedPerDay) d.cycleLessonsAddedPerDay = {};
  if (!d.dayCompleted) d.dayCompleted = {};
  return d;
}

/**
 * Carrega o estado do usuário.
 * Ordem: Supabase → localStorage (migração) → null (app usa makeInit)
 */
export async function loadState(userId) {
  try {
    const { data: row, error } = await supabase
      .from("sprint_ia_state")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (row?.data) {
      return applyMigrations(row.data);
    }
  } catch (e) {
    console.warn("Supabase: erro ao carregar estado", e);
  }

  // Nenhum dado no Supabase — tenta migrar do localStorage
  try {
    const raw = localStorage.getItem(SK);
    if (raw) {
      const d = applyMigrations(JSON.parse(raw));
      // Migra para o Supabase silenciosamente
      await saveState(userId, d);
      console.info("Dados migrados do localStorage para o Supabase.");
      return d;
    }
  } catch {}

  return null; // App usará makeInit()
}

/**
 * Salva o estado do usuário no Supabase (upsert).
 * Também mantém cópia local no localStorage como cache offline.
 */
export async function saveState(userId, data) {
  // Cache local sempre
  try {
    localStorage.setItem(SK, JSON.stringify(data));
  } catch {}

  // Persiste no Supabase
  try {
    const { error } = await supabase
      .from("sprint_ia_state")
      .upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase: erro ao salvar estado", e);
  }
}
