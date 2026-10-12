/* ZKJ SYSTEM — client portal sign-in (app/login.html). No public sign-up: KJ invites clients. */
(function () {
  'use strict';
  var Z = window.ZKJ, t = Z.t;
  var SB = window.ZKJ_SB || {};
  var sb = SB.client;
  function $(id) { return document.getElementById(id); }

  var loginForm = $('login-form'), resetForm = $('reset-form');

  function status(el, kind, key) {
    el.className = 'form-status' + (key ? ' show ' + kind : '');
    el.setAttribute('data-msg', key || '');
    el.setAttribute('data-kind', kind || '');
    el.textContent = key ? t(key) : '';
  }
  Z.onLang(function () {
    [$('login-status'), $('reset-status')].forEach(function (el) {
      var k = el.getAttribute('data-msg'); if (k) el.textContent = t(k);
    });
  });

  function authErrorKey(err) {
    if (!err) return 'p.e.generic';
    var code = (err.code || '') + ' ' + (err.message || '');
    if (/invalid_credentials|invalid login credentials|invalid_grant/i.test(code)) return 'p.e.creds';
    if (/email_not_confirmed|not confirmed/i.test(code)) return 'p.e.confirm';
    if (err.status === 429 || /rate|too many/i.test(code)) return 'p.e.rate';
    if (err.name === 'AuthRetryableFetchError' || /fetch|network|failed to/i.test(code) || err.status === 0) return 'p.e.network';
    return 'p.e.generic';
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showMode(mode) {
    loginForm.hidden = mode !== 'login';
    resetForm.hidden = mode !== 'reset';
    var focus = mode === 'login' ? $('login-email') : $('reset-email');
    if (mode === 'reset' && !$('reset-email').value) $('reset-email').value = $('login-email').value;
    focus.focus();
  }
  $('to-reset').addEventListener('click', function () { showMode('reset'); });
  $('to-login').addEventListener('click', function () { showMode('login'); });

  if (!sb) {
    status($('login-status'), 'error', 'p.e.config');
    $('login-submit').disabled = true;
    return;
  }

  // Already signed in? Go straight to the dashboard.
  sb.auth.getSession().then(function (r) {
    if (r && r.data && r.data.session) window.location.replace('./');
  });

  try {
    var q = new URLSearchParams(window.location.search);
    if (q.get('e') === 'link' || SB.linkError) status($('login-status'), 'error', 'p.e.link');
    else if (q.get('out') === '1') status($('login-status'), 'ok', 'p.signedout');
  } catch (e) { /* ignore */ }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('login-email').value.trim(), pw = $('login-password').value;
    var st = $('login-status');
    $('login-email').setAttribute('aria-invalid', 'false');
    $('login-password').setAttribute('aria-invalid', 'false');
    if (!email || !pw) {
      status(st, 'error', 'p.e.fields');
      (email ? $('login-password') : $('login-email')).setAttribute('aria-invalid', 'true');
      (email ? $('login-password') : $('login-email')).focus();
      return;
    }
    if (!EMAIL_RE.test(email)) { status(st, 'error', 'p.e.email'); $('login-email').setAttribute('aria-invalid', 'true'); $('login-email').focus(); return; }
    var btn = $('login-submit'), label = btn.querySelector('span');
    btn.disabled = true; label.textContent = t('p.signing');
    status(st, '', null);
    sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
      if (r.error) throw r.error;
      window.location.replace('./');
    }).catch(function (err) {
      var key = authErrorKey(err);
      status(st, 'error', key);
      if (key === 'p.e.creds') { $('login-password').setAttribute('aria-invalid', 'true'); $('login-password').select(); }
      btn.disabled = false; label.textContent = t('p.signin');
    });
  });

  resetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('reset-email').value.trim(), st = $('reset-status');
    if (!EMAIL_RE.test(email)) { status(st, 'error', 'p.e.email'); $('reset-email').setAttribute('aria-invalid', 'true'); $('reset-email').focus(); return; }
    $('reset-email').setAttribute('aria-invalid', 'false');
    var btn = $('reset-submit'), label = btn.querySelector('span');
    btn.disabled = true; label.textContent = t('p.reset.sending');
    sb.auth.resetPasswordForEmail(email, { redirectTo: SB.resetRedirect }).then(function (r) {
      if (r.error) throw r.error;
      status(st, 'ok', 'p.reset.ok');
    }).catch(function (err) {
      status(st, 'error', authErrorKey(err) === 'p.e.creds' ? 'p.e.generic' : authErrorKey(err));
    }).then(function () { btn.disabled = false; label.textContent = t('p.reset.send'); });
  });
})();
