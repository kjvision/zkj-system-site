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
  var linkType = null, linkError = null, linkCode = null;
  try {
    var h = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    var q = new URLSearchParams(window.location.search || '');
    linkType = h.get('type') || q.get('type');
    linkError = h.get('error_description') || q.get('error_description') || h.get('error') || q.get('error') || null;
    linkCode = h.get('error_code') || q.get('error_code') || null;
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
    linkError: linkError,
    linkCode: linkCode,
    // remove auth error params (#error=…&error_code=…) from the address bar without reloading
    clearLinkError: function () {
      if (!linkError) return;
      try {
        var u = new URL(window.location.href);
        ['error', 'error_code', 'error_description'].forEach(function (k) { u.searchParams.delete(k); });
        var hp = new URLSearchParams((u.hash || '').replace(/^#/, ''));
        if (hp.has('error') || hp.has('error_code') || hp.has('error_description')) u.hash = '';
        window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
      } catch (e) { /* ignore */ }
    }
  };
})();
