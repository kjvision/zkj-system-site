/* ZKJ SYSTEM — Supabase connection for the client portal (/app/).
   The URL and the publishable key are PUBLIC by design: every visitor's browser
   receives them. Data is protected by row-level security in supabase/schema.sql.
   NEVER put the service_role key, the database password or any other secret here. */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://usucmdjupfjuchfxnxpz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_ke3Qtsb9ZREzQ8R2ydeSxw_ah_CrSx8';
  var RESET_REDIRECT = 'https://system.zkjverse.com/app/';

  // Remember what kind of email link brought the visitor here (invite / recovery / error)
  // before supabase-js reads and clears the address bar.
  var linkType = null, linkError = null;
  try {
    var h = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    var q = new URLSearchParams(window.location.search || '');
    linkType = h.get('type') || q.get('type');
    linkError = h.get('error_description') || q.get('error_description') || h.get('error') || null;
  } catch (e) { /* ignore */ }

  var client = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  window.ZKJ_SB = {
    url: SUPABASE_URL,
    client: client,
    resetRedirect: RESET_REDIRECT,
    linkType: linkType,
    linkError: linkError
  };
})();
