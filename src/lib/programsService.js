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
