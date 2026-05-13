import { supabase } from './supabaseClient';

const SITE_ASSETS_BUCKET = 'site-assets';

export async function saveSlotContent(contentDate, slotTime, displayValue) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase is not configured yet.' } };
  }

  const { data, error } = await supabase
    .from('calendar_slot_content')
    .upsert(
      {
        content_date: contentDate,
        slot_time: slotTime,
        display_value: displayValue,
        status: 'published',
      },
      {
        onConflict: 'content_date,slot_time',
      },
    )
    .select('content_date, slot_time, display_value')
    .single();

  return { data, error };
}

export async function clearSlotContent(contentDate, slotTime) {
  if (!supabase) {
    return { error: { message: 'Supabase is not configured yet.' } };
  }

  const { error } = await supabase
    .from('calendar_slot_content')
    .delete()
    .eq('content_date', contentDate)
    .eq('slot_time', slotTime);

  return { error };
}

export async function touchSiteLastUpdated() {
  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update({ last_updated_at: new Date().toISOString() })
    .not('id', 'is', null)
    .select('id, last_updated_at');

  return { data, error };
}

export async function saveSiteSettings(settings) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase is not configured yet.' } };
  }

  const payload = {
    site_title: settings.siteTitle,
    logo_url: settings.logoUrl || null,
    empty_state_text: settings.emptyStateText,
    default_slots: settings.defaultSlots,
    last_updated_at: new Date().toISOString(),
  };

  const query = supabase.from('site_settings');
  const request = settings.id
    ? query.update(payload).eq('id', settings.id)
    : query.insert(payload);

  const { data, error } = await request
    .select(
      'id, site_title, logo_url, empty_state_text, default_slots, last_updated_at',
    )
    .single();

  return { data, error };
}

export async function uploadLogoFile(file) {
  if (!supabase) {
    return { publicUrl: '', error: { message: 'Supabase is not configured yet.' } };
  }

  const extension = file.name.split('.').pop() || 'png';
  const filePath = `logos/logo-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { publicUrl: '', error };
  }

  const { data } = supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  return { publicUrl: data.publicUrl, error: null };
}
