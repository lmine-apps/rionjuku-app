/**
 * 凛穏塾 動画視聴アプリ ── プッシュ通知の受け取り役（Service Worker）
 *
 * アプリを閉じている間に届いた通知は、ここで受け取って表示します。
 * Firebaseの設定は、登録時のURL（?apiKey=…&projectId=…）から受け取るので、
 * このファイルを書き替える必要はありません（設定は js/config.js の1か所だけ）。
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

var q = new URLSearchParams(self.location.search);
var cfg = {
  apiKey: q.get('apiKey') || '',
  authDomain: q.get('authDomain') || '',
  projectId: q.get('projectId') || '',
  messagingSenderId: q.get('messagingSenderId') || '',
  appId: q.get('appId') || ''
};

if (cfg.projectId) {
  firebase.initializeApp(cfg);
  var messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    var d = payload.data || {};
    var n = payload.notification || {};
    self.registration.showNotification(d.title || n.title || '凛穏塾', {
      body: d.body || n.body || '',
      icon: d.icon || 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || 'rionjuku',
      data: { url: d.url || './' }
    });
  });
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('rionjuku-app') >= 0 && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
