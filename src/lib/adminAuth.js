import { supabase } from './supabaseClient';

export async function signInAdmin(email, password) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase is not configured yet.' },
    };
  }

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function getCurrentSession() {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  return supabase.auth.getSession();
}

export async function isCurrentUserAdmin() {
  if (!supabase) {
    return { isAdmin: false, error: null };
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { isAdmin: false, error: sessionError };
  }

  const userId = sessionData.session?.user?.id;

  if (!userId) {
    return { isAdmin: false, error: null };
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return { isAdmin: Boolean(data), error };
}

export async function signOutAdmin() {
  if (!supabase) {
    return { error: null };
  }

  return supabase.auth.signOut();
}
