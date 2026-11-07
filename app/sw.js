/* ZKJ SYSTEM dashboard · phone alerts (KJ 6 Nov 2026). Push only: no caching, no offline, nothing stored. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'ZKJ SYSTEM', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'ZKJ SYSTEM', {
    body: d.body || '', tag: d.tag || 'zkj', renotify: !!d.emergency, requireInteraction: !!d.emergency,
    icon: '/assets/brand/apple-touch-icon-180.png', badge: '/assets/brand/favicon-32.png', data: { url: d.url || '/app/' }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/app/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].url.indexOf('/app/') > -1 && 'focus' in list[i]) { list[i].navigate(url); return list[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
