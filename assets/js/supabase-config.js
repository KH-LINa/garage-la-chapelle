/**
 * Configuration Supabase — Garage de la Chapelle
 * La clé "publishable" est prévue pour être exposée côté client :
 * la sécurité est assurée par les policies RLS côté base.
 */
window.GLC_SUPABASE = {
  url: 'https://xpcawlwgbsirfgbfpflo.supabase.co',
  key: 'sb_publishable_1YpC1uVQk5d7GXStdXlJLg_NcfwApMX',
};

/** Retourne un client Supabase, ou null si la librairie n'a pas pu se charger. */
window.getSupabaseClient = function () {
  if (!window.supabase || !window.supabase.createClient) return null;
  if (!window.__glcSupabaseClient) {
    window.__glcSupabaseClient = window.supabase.createClient(
      window.GLC_SUPABASE.url,
      window.GLC_SUPABASE.key
    );
  }
  return window.__glcSupabaseClient;
};
