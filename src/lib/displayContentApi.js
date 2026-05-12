import { supabase } from './supabaseClient';

export async function fetchSiteSettings() {
  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select(
      'id, site_title, logo_url, empty_state_text, default_slots, last_updated_at',
    )
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export async function fetchPublishedSlotContent(startDate, endDate) {
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('calendar_slot_content')
    .select('content_date, slot_time, display_value')
    .eq('status', 'published')
    .gte('content_date', startDate)
    .lte('content_date', endDate)
    .order('content_date', { ascending: true });

  return { data: data ?? [], error };
}

export function mapSlotContentByDate(rows) {
  return rows.reduce((contentMap, row) => {
    const dateContent = contentMap[row.content_date] ?? {};

    return {
      ...contentMap,
      [row.content_date]: {
        ...dateContent,
        [row.slot_time]: row.display_value,
      },
    };
  }, {});
}
