import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isConfiguredValue(value, placeholder) {
  return Boolean(value && value.trim() && value !== placeholder);
}

export const hasSupabaseConfig =
  isConfiguredValue(supabaseUrl, 'your_project_url') &&
  isConfiguredValue(supabaseAnonKey, 'your_anon_key');

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
