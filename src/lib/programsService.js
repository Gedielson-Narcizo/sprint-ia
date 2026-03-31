import { supabase } from "./supabase.js";

/** @returns {Promise<{data: import('../types/programs.js').StudyProgram[]|null, error: any}>} */
export async function listPrograms(userId) {
  return supabase
    .from("study_programs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

/** @returns {Promise<{data: import('../types/programs.js').StudyProgram|null, error: any}>} */
export async function createProgram(userId, fields) {
  const { data, error } = await supabase
    .from("study_programs")
    .insert({ ...fields, user_id: userId })
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{data: import('../types/programs.js').StudyProgram|null, error: any}>} */
export async function updateProgram(id, fields) {
  const { data, error } = await supabase
    .from("study_programs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{data: import('../types/programs.js').StudyProgram|null, error: any}>} */
export async function getProgram(id) {
  const { data, error } = await supabase
    .from("study_programs")
    .select("*, program_modules(*)")
    .eq("id", id)
    .single();
  return { data, error };
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramModule[]|null, error: any}>} */
export async function listModules(programId) {
  return supabase
    .from("program_modules")
    .select("*")
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramModule|null, error: any}>} */
export async function createModule(programId, fields) {
  const { data, error } = await supabase
    .from("program_modules")
    .insert({ ...fields, program_id: programId })
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramItem[]|null, error: any}>} */
export async function listItems(moduleId) {
  return supabase
    .from("program_items")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramItem|null, error: any}>} */
export async function createItem(moduleId, fields) {
  const { data, error } = await supabase
    .from("program_items")
    .insert({ ...fields, module_id: moduleId })
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramModule|null, error: any}>} */
export async function updateModule(id, fields) {
  const { data, error } = await supabase
    .from("program_modules")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{error: any}>} */
export async function deleteModule(id) {
  const { error } = await supabase.from("program_modules").delete().eq("id", id);
  return { error };
}

/** @returns {Promise<{data: import('../types/programs.js').ProgramItem|null, error: any}>} */
export async function updateItem(id, fields) {
  const { data, error } = await supabase
    .from("program_items")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/** @returns {Promise<{error: any}>} */
export async function deleteItem(id) {
  const { error } = await supabase.from("program_items").delete().eq("id", id);
  return { error };
}

/**
 * Loads all modules with their items for a program, sorted by sort_order.
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export async function getProgramRoadmap(programId) {
  const { data, error } = await supabase
    .from("program_modules")
    .select("*, program_items(*)")
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });
  if (data) {
    data.forEach((m) => {
      m.program_items = (m.program_items || []).sort((a, b) => a.sort_order - b.sort_order);
    });
  }
  return { data, error };
}
