import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "[Sprint IA] Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas.\n" +
    "Configure-as no .env.local (local) e nas variáveis de ambiente da Vercel (produção)."
  );
}

export const supabase = (url && key) ? createClient(url, key) : null;
