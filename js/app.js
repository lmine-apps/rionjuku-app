/**
 * 凛穏塾 動画視聴アプリ ── 受講生画面
 *
 * 画面の流れ：
 *   ログイン → （コースが1つならそのまま視聴画面／複数ならコース選択）→ 視聴
 *   左サイドバー＝選択中コースの「章＋レッスン」（章タップで開閉）
 */
(function () {
  'use strict';
  var api = RJ.api, store = RJ.store, esc = RJ.esc;

  var state = {
    user: null, courses: [], news: [], myReplies: {},
    ci: -1,          // 選択中のコース
    flat: [],        // 表示順に並べたレッスン
    vi: -1,          // 視聴中のレッスン
    player: null,
    openChaps: {},   // 章の開閉状態
    watched: {}      // 観た動画のID（サーバーの「視聴状況」と同じ中身）
  };
  var WATCH_KEY = 'rj_watched', READ_KEY = 'rj_news_read', LIKE_KEY = 'rj_news_liked', ORDER_KEY = 'rj_order';
  var RATE_KEY = 'rj_rate';        // 再生速度（この端末だけが覚える）
  var uid = RJ.pickUid();

  var $ = function (id) { return document.getElementById(id); };
  function ls(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
  function lsSave(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {} }
  function order() { try { return localStorage.getItem(ORDER_KEY) || 'new'; } catch (e) { return 'new'; } }
  function setOrder(v) { try { localStorage.setItem(ORDER_KEY, v); } catch (e) {} }

  // ---------- この端末で続きから見る ----------
  // メール・デモ/本番ごとに分離。動画URL・トークンは記録しない。
  var RESUME_PREFIX = 'rj_resume:v1:', resumeSession = null, resumeView = 0;
  function resumeStorageKey() {
    var mail = state.user && state.user.email;
    return mail ? RESUME_PREFIX + (RJ.MOCK ? 'demo:' : 'live:') + String(mail).trim().toLowerCase() : '';
  }
  function validResume(r) {
    return r && typeof r.course === 'string' && typeof r.id === 'string' && typeof r.media === 'string'
      && typeof r.seconds === 'number' && isFinite(r.seconds) && r.seconds >= 5
      && typeof r.duration === 'number' && isFinite(r.duration) && r.duration > r.seconds + 3
      && typeof r.at === 'number' && isFinite(r.at) && r.at > Date.now() - 180 * 86400000;
  }
  function sameResume(a, b) { return a.course === b.course && a.id === b.id && a.media === b.media; }
  function readResume(key) {
    if (!key) return [];
    try {
      var data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data.filter(validResume).sort(function (a, b) { return b.at - a.at; }).slice(0, 30) : [];
    } catch (e) { return []; }
  }
  function writeResume(key, record, remove) {
    if (!key) return;
    var list = readResume(key).filter(function (r) { return !sameResume(r, record); });
    if (!remove && validResume(record)) list.unshift(record);
    try { localStorage.setItem(key, JSON.stringify(list.slice(0, 30))); } catch (e) {}
  }
  function resumeIdentity(v, course) {
    var vm = v && RJ.parseVimeo(v.url);
    return vm ? { course: course, id: String(v.id), media: vm.id } : null;
  }
  function findResumeVideo(record) {
    var found = null;
    state.courses.some(function (c, ci) {
      if (c.name !== record.course) return false;
      return c.chapters.some(function (ch) {
        return ch.videos.some(function (v) {
          var identity = resumeIdentity(v, c.name);
          if (v.state !== 'open' || !identity || !sameResume(identity, record)) return false;
          found = { ci: ci, v: v };
          return true;
        });
      });
    });
    return found;
  }
  function resumeTime(seconds) {
    var n = Math.floor(seconds), h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60;
    return (h ? h + '時間' : '') + (m ? m + '分' : '') + (s || (!h && !m) ? s + '秒' : '');
  }
  function resumePanel(id, before) {
    var panel = $(id);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = id; panel.className = 'resume-card hidden';
      panel.setAttribute('aria-label', '前回の続き');
      before.parentNode.insertBefore(panel, before);
    }
    return panel;
  }
  function paintResume(panel, record, video) {
    if (!record || !video) { panel.classList.add('hidden'); panel.innerHTML = ''; return; }
    panel.classList.remove('hidden');
    panel.innerHTML = '<h2 class="resume-heading">前回の続き</h2>'
      + '<p class="resume-course">' + esc(record.course) + '</p>'
      + '<p class="resume-title">' + esc(video.title || '（無題）') + '</p>'
      + '<div class="resume-actions"><button class="btn" type="button" data-resume>'
      + esc(resumeTime(record.seconds)) + 'から再開</button>'
      + '<button class="btn ghost" type="button" data-restart>はじめから見る</button></div>'
      + '<p class="resume-note">この端末での再生位置です。</p>'
      + '<p class="resume-msg" role="status" aria-live="polite"></p>';
    panel.querySelector('[data-resume]').onclick = function () { resumeFrom(record, false, panel); };
    panel.querySelector('[data-restart]').onclick = function () { resumeFrom(record, true, panel); };
  }
  function renderResumePicker() {
    var panel = resumePanel('resumePicker', $('pickerList')), records = readResume(resumeStorageKey()), match = null, record = null;
    records.some(function (r) { match = findResumeVideo(r); if (match) { record = r; return true; } return false; });
    paintResume(panel, record, match && match.v);
  }
  function renderResumeWatch() {
    var panel = resumePanel('resumeWatch', $('player').parentNode), item = state.flat[state.vi];
    var c = state.courses[state.ci], record = null;
    if (item && c && !(resumeSession && resumeSession.played)) {
      var identity = resumeIdentity(item.v, c.name);
      if (identity) record = readResume(resumeStorageKey()).filter(function (r) { return sameResume(r, identity); })[0];
      if (record && !findResumeVideo(record)) record = null;
    }
    paintResume(panel, record, item && item.v);
  }
  function resumeFrom(record, fromStart, panel) {
    var key = resumeStorageKey(), view = resumeView, msg = panel.querySelector('.resume-msg');
    var buttons = panel.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (b) { b.disabled = true; });
    msg.textContent = '視聴できるか確認しています…';
    // 控えの一覧だけでは再開しない。最新の権限・期限・動画の同一性を確認する。
    api('data', { token: store.token(), uid: uid }).then(function (res) {
      if (view !== resumeView || key !== resumeStorageKey()) return;
      if (!res || !res.ok) {
        if (res && (res.error === 'unauthorized' || res.error === 'stopped')) {
          store.clear(); showLogin(RJ.errMsg(res)); return;
        }
        throw new Error('確認できませんでした。通信状態をご確認のうえ、もう一度お試しください。');
      }
      applyData(res); saveDataCache(res);
      var found = findResumeVideo(record);
      if (!found) { msg.textContent = 'この動画は現在視聴できません。別の動画をお選びください。'; return; }
      endResumeSession();
      if (fromStart) writeResume(key, record, true);
      openCourse(found.ci, { id: record.id, media: record.media, seconds: fromStart ? 0 : record.seconds });
      closeDrawer();
      $('vTitle').setAttribute('tabindex', '-1');
      $('vTitle').focus({ preventScroll: true });
    }).catch(function (e) {
      if (view === resumeView && key === resumeStorageKey()) msg.textContent = e.message;
    }).then(function () {
      Array.prototype.forEach.call(buttons, function (b) { b.disabled = false; });
    });
  }
  function flushResume() {
    if (resumeSession && resumeSession.pending) {
      writeResume(resumeSession.key, resumeSession.pending, false);
      resumeSession.pending = null; resumeSession.savedAt = Date.now();
    }
  }
  function endResumeSession() {
    if (!resumeSession) return;
    flushResume();
    var session = resumeSession;
    resumeSession = null;
    Object.keys(session.handlers).forEach(function (name) {
      try { session.player.off(name, session.handlers[name]); } catch (e) {}
    });
  }
  function trackResume(v) {
    var player = state.player, c = state.courses[state.ci], identity = c && resumeIdentity(v, c.name);
    if (!player || !player.on || !identity || v.state !== 'open') return;
    var session = {
      player: player, key: resumeStorageKey(), played: false, finished: false,
      pending: null, savedAt: 0, handlers: {}
    };
    resumeSession = session;
    function active() { return resumeSession === session; }
    function position(d, force) {
      if (!active() || !session.played || session.finished || !d
        || typeof d.seconds !== 'number' || typeof d.duration !== 'number'
        || !isFinite(d.seconds) || !isFinite(d.duration) || d.seconds < 0 || d.duration <= 0) return;
      var record = {
        course: identity.course, id: identity.id, media: identity.media,
        seconds: Math.floor(d.seconds), duration: d.duration, at: Date.now()
      };
      // 終端付近を再開候補に残さない（「視聴済み」の90%判定とは別）。
      if (d.duration - d.seconds <= 3) { session.pending = null; writeResume(session.key, record, true); return; }
      if (!validResume(record)) return;
      session.pending = record;
      if (force || Date.now() - session.savedAt >= 5000) flushResume();
    }
    session.handlers.play = function () {
      if (!active()) return;
      session.played = true; session.finished = false;
      if ($('resumeWatch')) $('resumeWatch').classList.add('hidden');
    };
    session.handlers.timeupdate = function (d) { position(d, false); };
    session.handlers.pause = function (d) { position(d, true); flushResume(); };
    session.handlers.seeked = function (d) { position(d, true); };
    session.handlers.ended = function () {
      if (!active()) return;
      session.finished = true; session.pending = null;
      writeResume(session.key, identity, true);
    };
    try {
      Object.keys(session.handlers).forEach(function (name) { player.on(name, session.handlers[name]); });
    } catch (e) { endResumeSession(); }
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) flushResume(); });
  window.addEventListener('pagehide', flushResume);
  // ---------- 視聴済み ----------
  // 記録はスプレッドシート（「視聴状況」タブ）が正。端末には画面をすぐ描くための控えを置く。
  // state.watched は「観た動画のID」の集合。
  function watchKey(v) { return v.id + '|' + v.title; }
  function isWatched(v) { return !!(v && state.watched[v.id]); }

  /** 印を付ける／外す。画面はすぐ変えて、サーバーへは裏で送る */
  function setWatched(v, on) {
    if (!v) return;
    if (on) state.watched[v.id] = 1; else delete state.watched[v.id];
    saveWatchCache();
    api('watch_save', { token: store.token(), id: v.id, done: on ? 1 : 0 })
      .catch(function () {});          // 通信が切れていても画面は進める
  }
  function toggleWatched(v) { setWatched(v, !isWatched(v)); return isWatched(v); }

  /** 端末の控え（ログインした人ごとに分ける） */
  function watchCacheKey() {
    return WATCH_KEY + ':' + ((state.user && state.user.email) || '');
  }
  function saveWatchCache() {
    try { localStorage.setItem(watchCacheKey(), Object.keys(state.watched).join(',')); } catch (e) {}
  }
  function loadWatchCache() {
    try {
      var raw = localStorage.getItem(watchCacheKey()) || '';
      raw.split(',').forEach(function (x) { if (x) state.watched[Number(x)] = 1; });
    } catch (e) {}
  }

  /**
   * 旧version（端末だけに持っていた頃）の記録をサーバーへ引き継ぐ。
   * 1回だけ実行し、済んだら印を付けて二度と走らせない。
   */
  function migrateOldWatched() {
    var done = 'rj_watch_moved:' + ((state.user && state.user.email) || '');
    try { if (localStorage.getItem(done)) return; } catch (e) { return; }
    var old = ls(WATCH_KEY);                 // { "12|タイトル": 1, ... }
    var ids = Object.keys(old).map(function (k) { return Number(String(k).split('|')[0]); })
      .filter(function (n) { return n > 0 && !state.watched[n]; });
    try { localStorage.setItem(done, '1'); } catch (e) {}
    if (!ids.length) return;
    ids.forEach(function (id) { state.watched[id] = 1; });
    saveWatchCache();
    ids.forEach(function (id) {
      api('watch_save', { token: store.token(), id: id, done: 1 }).catch(function () {});
    });
  }

  /** 進捗（観た本数／観られる本数） */
  function progress() {
    var total = 0, done = 0;
    state.courses.forEach(function (c) {
      c.chapters.forEach(function (ch) {
        ch.videos.forEach(function (v) { total++; if (isWatched(v)) done++; });
      });
    });
    return { done: done, total: total, rate: total ? Math.round(done * 100 / total) : 0 };
  }
  function courseProgress(c) {
    var total = 0, done = 0;
    c.chapters.forEach(function (ch) {
      ch.videos.forEach(function (v) { total++; if (isWatched(v)) done++; });
    });
    return { done: done, total: total, rate: total ? Math.round(done * 100 / total) : 0 };
  }
  function bar(pr) {
    return '<span class="pg"><span class="pg-bar"><i style="width:' + pr.rate + '%"></i></span>'
      + '<span class="pg-txt">' + pr.done + ' / ' + pr.total + '本</span></span>';
  }

  // ---------- ログイン ----------
  $('loginForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('loginBtn'), msg = $('loginMsg');
    msg.className = 'msg'; msg.textContent = '';
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> 確認中…';
    api('login', { email: $('email').value, password: $('pass').value, uid: uid })
      .then(function (res) {
        if (!res || !res.ok) { msg.className = 'msg err'; msg.textContent = RJ.errMsg(res); return; }
        store.save(res.token, res.user);
        $('pass').value = '';
        start();
      })
      .catch(function (e) { msg.className = 'msg err'; msg.textContent = e.message; })
      .then(function () { btn.disabled = false; btn.textContent = 'ログイン'; });
  });

  // ---------- 初回パスワード設定 ----------
  $('firstLink').addEventListener('click', function () {
    RJ.modal('はじめての方（パスワードの設定）',
      '<p style="margin-top:0;font-size:14px">凛穏塾にご登録のメールアドレスを入力してください。<br>'
      + 'ご本人の確認ができたら、その場でパスワードをお決めいただけます。</p>'
      + '<div class="field"><label>メールアドレス</label>'
      + '<input id="fsEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"></div>',
      function (close, setMsg) {
        var mail = $('fsEmail').value.trim();
        if (!mail) { setMsg('メールアドレスを入力してください。'); return; }
        return api('first_check', { email: mail, uid: uid }).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          close();
          firstStep2(mail, res);
        });
      }, { saveText: '次へ' });
  });

  function firstStep2(mail, info) {
    RJ.modal((info.name || '') + ' さん、ようこそ',
      '<p style="margin-top:0;font-size:14px">これからお使いいただくパスワードを決めてください。</p>'
      + (info.needWord
        ? '<div class="field"><label>合言葉（ご案内に記載しています）</label><input id="fsWord" type="text"></div>' : '')
      + '<div class="field"><label>新しいパスワード（4文字以上）</label>'
      + '<input id="fsPass" type="password" autocomplete="new-password"></div>'
      + '<div class="field"><label>もう一度入力してください</label>'
      + '<input id="fsPass2" type="password" autocomplete="new-password"></div>'
      + '<div class="hint">次回からは、このメールアドレスとパスワードでログインします。</div>',
      function (close, setMsg) {
        var w = $('fsWord') ? $('fsWord').value.trim() : '';
        var p1 = $('fsPass').value.trim(), p2 = $('fsPass2').value.trim();
        if (info.needWord && !w) { setMsg('合言葉を入力してください。'); return; }
        if (p1.length < 4) { setMsg('パスワードは4文字以上にしてください。'); return; }
        if (p1 !== p2) { setMsg('パスワードが一致していません。'); return; }
        return api('first_password', { email: mail, password: p1, word: w, uid: uid }).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          store.save(res.token, res.user);
          close();
          start();
        });
      }, { saveText: '設定して入る' });
  }

  // ---------- アカウントメニュー ----------
  $('acctBtn').addEventListener('click', function (ev) {
    ev.stopPropagation();
    $('acctMenu').classList.toggle('hidden');
  });
  document.addEventListener('click', function () { $('acctMenu').classList.add('hidden'); });
  $('acctMenu').addEventListener('click', function (ev) {
    var act = ev.target && ev.target.dataset ? ev.target.dataset.act : '';
    if (!act) return;
    $('acctMenu').classList.add('hidden');
    if (act === 'logout') { endResumeSession(); store.clear(); location.reload(); return; }
    if (act === 'admin') { location.href = 'admin.html' + (RJ.MOCK ? '?mock=1' : ''); return; }
    if (act === 'newnews') { location.href = 'admin.html?open=news' + (RJ.MOCK ? '&mock=1' : ''); return; }
    if (act === 'newvideo') { location.href = 'admin.html?open=video' + (RJ.MOCK ? '&mock=1' : ''); return; }
    if (act === 'name') editName();
    if (act === 'pass') editPassword();
    if (act === 'guide') showGuide();
    if (act === 'push') showPush();
    if (act === 'copy') copyUrl();
    if (act === 'terms') window.open(RJ.CFG.TERMS_URL, '_blank', 'noopener');
    if (act === 'privacy') window.open(RJ.CFG.PRIVACY_URL, '_blank', 'noopener');
  });

  // ---------- パソコンで見る（URLをコピー） ----------
  function copyUrl() {
    var url = RJ.CFG.PUBLIC_URL || (location.origin + location.pathname);
    function body(state) {
      return '<p style="margin-top:0;font-size:14px">パソコンでご覧になる場合は、'
        + 'このアドレスをパソコンのブラウザに貼り付けてください。</p>'
        + '<div class="url-box">' + esc(url) + '</div>'
        + '<div class="hint">' + state + '</div>'
        + '<p style="font-size:13px;margin-bottom:0">メールやLINEでご自身宛に送っておくと、あとから開きやすくなります。</p>';
    }
    var m = RJ.modal('パソコンで見る', body('コピーの準備をしています…'), null, { cancelText: '閉じる' });
    var hintEl = m.host.querySelector('.hint');
    function done(msg) { if (hintEl) hintEl.textContent = msg; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function () { done('✓ コピーしました'); })
        .catch(function () { done('上のアドレスを長押し（PCは選択）してコピーしてください。'); });
    } else {
      done('上のアドレスを長押し（PCは選択）してコピーしてください。');
    }
  }

  // ---------- 通知の設定（Webプッシュ） ----------
  var PUSH_KEY = 'rj_push';        // '1'=オン '0'=本人が明示オフ
  function pushPref() { try { return localStorage.getItem(PUSH_KEY) || ''; } catch (e) { return ''; } }
  function setPushPref(v) { try { localStorage.setItem(PUSH_KEY, v); } catch (e) {} }

  function pushSupported() {
    return !!(RJ.CFG.PUSH_READY && RJ.CFG.FIREBASE && RJ.CFG.FIREBASE.projectId
      && 'Notification' in window && 'serviceWorker' in navigator);
  }
  /** iPhoneはホーム画面に追加していないと通知を受け取れない（判定は参考情報として使う） */
  function isIos() { return /iPad|iPhone|iPod/.test(navigator.userAgent); }
  function isStandalone() {
    return window.navigator.standalone === true
      || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }
  /** この端末で通知そのものが使えるか（推測ではなく実際の機能で判断する） */
  function canNotify() { return ('Notification' in window) && ('serviceWorker' in navigator); }

  var fbLoading = null;
  function loadFirebase() {
    if (window.firebase && window.firebase.messaging) return Promise.resolve();
    if (fbLoading) return fbLoading;
    function one(src) {
      return new Promise(function (ok, ng) {
        var s = document.createElement('script');
        s.src = src; s.onload = ok; s.onerror = function () { ng(new Error('読み込みに失敗しました')); };
        document.head.appendChild(s);
      });
    }
    fbLoading = one('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
      .then(function () { return one('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'); })
      .then(function () { firebase.initializeApp(RJ.CFG.FIREBASE); });
    return fbLoading;
  }

  /** 通知を有効にして、端末のトークンをスプシへ登録する */
  function pushEnable() {
    if (!pushSupported()) return Promise.reject(new Error('この端末では通知を利用できません。'));
    return loadFirebase()
      .then(function () { return Notification.requestPermission(); })
      .then(function (perm) {
        if (perm !== 'granted') throw new Error('通知が許可されませんでした。端末の設定からも変更できます。');
        var q = new URLSearchParams(RJ.CFG.FIREBASE).toString();
        return navigator.serviceWorker.register('firebase-messaging-sw.js?' + q);
      })
      .then(function (reg) {
        return firebase.messaging().getToken({ vapidKey: RJ.CFG.VAPID_KEY, serviceWorkerRegistration: reg });
      })
      .then(function (token) {
        if (!token) throw new Error('通知の登録に失敗しました。時間をおいてお試しください。');
        return api('push_reg', { token: store.token(), fcm: token });
      })
      .then(function (res) {
        if (!res || !res.ok) throw new Error(RJ.errMsg(res));
        setPushPref('1');
        return true;
      });
  }
  function pushDisable() {
    setPushPref('0');
    if (!window.firebase || !firebase.messaging) return Promise.resolve();
    return firebase.messaging().getToken({ vapidKey: RJ.CFG.VAPID_KEY })
      .then(function (t) { return api('push_unreg', { token: store.token(), fcm: t }); })
      .catch(function () { });
  }
  /** 一度オンにした人は、起動のたびに黙ってトークンを更新しておく */
  function pushRefresh() {
    if (pushPref() !== '1' || !pushSupported() || Notification.permission !== 'granted') return;
    pushEnable().catch(function () { });
  }

  function showPush() {
    if (!RJ.CFG.PUSH_READY) {
      RJ.modal('通知の設定',
        '<p style="margin-top:0;font-size:14px">新しい講義動画やお知らせが追加されたときに、'
        + 'スマホへお知らせが届く機能を準備しています。</p>'
        + '<div class="notice-box">🔔 <b>ただいま準備中です</b><br>'
        + '使えるようになりましたら、このページでご案内します。</div>'
        + '<p style="font-size:13px">それまでは、アプリを開いたときに'
        + '<b>「お知らせ」ボタンの赤いバッジ</b>で新着が分かります。</p>',
        null, { cancelText: '閉じる' });
      return;
    }

    var on = (pushPref() === '1' && 'Notification' in window && Notification.permission === 'granted');
    var body =
      '<p style="margin-top:0;font-size:14px">新しいお知らせが届いたときに、'
      + 'スマホの通知でお知らせします。</p>'
      + '<div class="notice-box"><b>いまの状態：</b>'
      + (on ? '<span style="color:#1f7a5c">🔔 オン</span>' : '<span style="color:#61768a">🔕 オフ</span>')
      + '<br><span class="hint">通知の機能：' + (canNotify() ? '使えます' : '見つかりません')
      + '／ホーム画面から起動：' + (isStandalone() ? 'はい' : 'いいえ')
      + (('Notification' in window) ? '／許可の状態：' + Notification.permission : '')
      + '</span></div>'
      + (!canNotify() && isIos()
        ? '<div class="notice-box"><b>iPhoneをお使いの方へ</b><br>'
          + 'この開き方では通知を受け取れません。<b>Safari</b>で開いて「共有」→<b>ホーム画面に追加</b>し、'
          + '追加されたアイコンから開いてからお試しください。<br>'
          + '<span class="hint">※iOS 16.4より前のiPhoneは通知に対応していません。</span></div>'
        : '')
      + '<div class="hint" id="pushMsg">'
      + (canNotify() ? '' : 'この端末では通知の機能が見つかりませんでした。')
      + '</div>';

    var m = RJ.modal('通知の設定', body,
      function (close, setMsg) {
        if (on) {
          return pushDisable().then(function () { close(); showPush(); });
        }
        if (!canNotify()) {
          setMsg(isIos()
            ? 'この開き方では通知を使えません。Safariで「ホーム画面に追加」し、そのアイコンから開いてお試しください。'
            : 'お使いのブラウザが通知に対応していないようです。');
          return;
        }
        return pushEnable().then(function () {
          close();
          RJ.modal('通知をオンにしました', '<p style="margin:0">新しいお知らせが届いたときにお知らせします。</p>',
            null, { cancelText: '閉じる' });
        }, function (e) { setMsg(e.message); });
      },
      { saveText: on ? '通知をオフにする' : '通知をオンにする', cancelText: '閉じる' });
    return m;
  }

  // ---------- 使い方ガイド ----------
  var GUIDE = [
    { t: '動画を見てみましょう', label: '視聴の仕方', icon: '▶', b:
      '<p class="guide-lead">見たい講義を選び、ご自分のペースで学べます。</p>'
      + '<ol class="guide-ol"><li><b>受講コースを選びます</b><br>コースが1つの方は、動画の画面から始まります。</li>'
      + '<li><b>「目次」から動画を選びます</b><br>スマホは画面左の「目次」、パソコンは左側の一覧を開きます。</li>'
      + '<li><b>動画の ▶ を押して再生します</b><br>止めたいときは、動画内の一時停止ボタンを押します。</li></ol>' },
    { t: '続きから、好きな場面から', label: '便利な見方', icon: '↻', b:
      '<div class="guide-tip"><b>前回の続き</b><p>「○分から再開」で、前回止めたところから。「はじめから見る」も選べます。</p></div>'
      + '<p>再生位置は<b>同じ端末・同じブラウザ</b>に保存されます。</p>'
      + '<p>動画の下にある<b>目次の時刻</b>を押すと、その場面へ移動できます。</p>'
      + '<p>約9割まで見ると<b>視聴済みの ✓</b>が付きます。「視聴済みにする」ボタンでも切り替えられます。</p>' },
    { t: 'ホーム画面からすぐ開けます', label: 'アプリの開き方', icon: '⌂', b:
      '<p class="guide-lead">スマホのホーム画面に、凛穏塾のアイコンを置きましょう。</p>'
      + '<div class="guide-tab" aria-label="端末を選択"><button class="gt on" data-os="ios" aria-pressed="true" type="button">iPhone</button><button class="gt" data-os="and" aria-pressed="false" type="button">Android</button></div>'
      + '<div id="guideOsIos"><ol class="guide-ol"><li><b>Safari</b>でこのページを開きます。</li><li><b>共有（□に↑）→「ホーム画面に追加」</b>を選びます。</li><li>「Webアプリとして開く」がある場合はオンにして<b>「追加」</b>。追加したアイコンから開きます。</li></ol></div>'
      + '<div id="guideOsAnd" class="hidden"><ol class="guide-ol"><li><b>Chrome</b>でこのページを開きます。</li><li><b>右上の︙ →「ホーム画面に追加」</b>を選びます。</li><li>「インストール」または「追加」の案内に沿って進み、アイコンから開きます。</li></ol></div>'
      + '<p class="guide-caption">表示名やボタンの位置は、端末によって異なります。</p>' },
    { t: '通知を受け取るには', label: '通知設定', icon: '🔔', b:
      '<p class="guide-lead">新しいお知らせに気づけるよう、通知を設定できます。</p>'
      + '<div class="guide-tab" aria-label="端末を選択"><button class="gt on" data-os="ios" aria-pressed="true" type="button">iPhone</button><button class="gt" data-os="and" aria-pressed="false" type="button">Android</button></div>'
      + '<div id="guideOsIos"><p class="guide-tip"><b>先にホーム画面へ追加</b><br>追加した凛穏塾のアイコンから開いてください。iOS 16.4以降に対応しています。</p></div>'
      + '<div id="guideOsAnd" class="hidden"><p class="guide-tip"><b>Chromeで開いて設定</b><br>端末側でChromeの通知がオフになっていないかも確認してください。</p></div>'
      + '<ol class="guide-ol"><li>右上の<b>メニュー（☰／お名前）</b>を開きます。</li><li><b>「通知の設定」→「通知をオンにする」</b>を押します。</li><li>許可を求められたら<b>「許可」</b>を選びます。</li></ol>'
      + '<p class="guide-caption">以前「許可しない」を選んだ場合は、端末やブラウザの通知設定を確認してください。通知を使わなくても、画面上の「お知らせ」から読めます。</p>' },
    { t: '困ったときも、このガイドへ', label: 'いつでも読み直せます', icon: '?', b:
      '<div class="guide-tip"><b>右上のメニュー →「使い方ガイド」</b><p>「今後表示しない」を選んだ後も、ここから読み直せます。</p></div>'
      + '<p><b>動画が見られないとき</b><br>通信状態と、動画の公開日・視聴期限をご確認ください。</p>'
      + '<p><b>ログインできないとき</b><br>運営スタッフへお問い合わせください。</p>'
      + '<p class="guide-caption">「スキップ」は今回だけ閉じます。「今後表示しない」は、この端末・ブラウザでの自動表示を止めます。</p>' }
  ];
  var SHOOTING = RJ.MOCK && /[?&]shot=/.test(location.search);
  var guideTimer = null, guideStartupShown = false, guideClose = null;
  // 旧rj_guideは「閉じた」だけでも保存されていたため、明示的な非表示設定と区別する。
  function guideKey() {
    return 'rj_guide_hide:v2:' + (RJ.MOCK ? 'demo:' : 'live:')
      + String(state.user && state.user.email || '').trim().toLowerCase();
  }
  function guideSeen() { try { return localStorage.getItem(guideKey()) === '1'; } catch (e) { return false; } }
  function markGuideSeen() {
    try { localStorage.setItem(guideKey(), '1'); return true; } catch (e) { return false; }
  }
  function scheduleGuide() {
    if (SHOOTING || guideStartupShown) return;
    guideStartupShown = true;
    if (guideSeen()) { popupNews(); return; }
    guideTimer = setTimeout(function () {
      guideTimer = null;
      if (!$('scApp').classList.contains('hidden') && !document.querySelector('.modal')) showGuide(0, true);
    }, 1900);
  }
  function showGuide(page, auto) {
    clearTimeout(guideTimer);
    guideStartupShown = true;
    if (guideClose) guideClose(false);
    var i = Math.max(0, Math.min(GUIDE.length - 1, Number(page) || 0));
    var previousFocus = document.activeElement, previousOverflow = document.body.style.overflow;
    var backgrounds = [$('scApp'), $('scLogin')].filter(Boolean).map(function (el) {
      var inert = el.inert; el.inert = true; return { el: el, inert: inert };
    });
    var host = document.createElement('div'); host.className = 'guide-host';
    host.innerHTML = '<div class="modal-bg"><section class="modal guide-book" role="dialog" aria-modal="true" aria-labelledby="guideTitle">'
      + '<header class="guide-top"><span>凛穏塾の使い方</span><span id="guideCount"></span></header>'
      + '<div class="guide-scroll"><div class="guide-emblem" aria-hidden="true"></div><p class="guide-section"></p>'
      + '<h2 id="guideTitle" tabindex="-1"></h2><div class="guide-body"></div></div>'
      + '<footer class="guide-footer"><div class="guide-dots" aria-hidden="true"></div>'
      + '<div class="guide-nav"><button class="btn ghost" data-guide-back type="button">戻る</button><button class="btn" data-guide-next type="button">次へ</button></div>'
      + '<div class="guide-dismiss"><button type="button" data-guide-skip>スキップ</button><button type="button" data-guide-hide>今後表示しない</button></div>'
      + '<p class="guide-error" role="status" aria-live="polite"></p></footer></section></div>';
    document.body.appendChild(host); document.body.style.overflow = 'hidden';
    function q(selector) { return host.querySelector(selector); }
    function close(notify) {
      if (!host.parentNode) return;
      host.parentNode.removeChild(host); document.body.style.overflow = previousOverflow;
      backgrounds.forEach(function (b) { b.el.inert = b.inert; });
      guideClose = null;
      var focusTarget = previousFocus && previousFocus.isConnected && previousFocus.getClientRects().length ? previousFocus : acctBtn;
      if (focusTarget) focusTarget.focus({ preventScroll: true });
      if (auto && notify !== false && !$('scApp').classList.contains('hidden')) popupNews();
    }
    guideClose = close;
    function paint() {
      var g = GUIDE[i];
      q('#guideCount').textContent = (i + 1) + ' / ' + GUIDE.length;
      q('.guide-section').textContent = g.label;
      q('.guide-emblem').textContent = g.icon;
      if (i === 3) q('.guide-emblem').innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Z"/><path d="M9 20a3 3 0 0 0 6 0"/></svg>';
      q('#guideTitle').textContent = g.t;
      q('.guide-body').innerHTML = g.b;
      if (i === 3 && !RJ.CFG.PUSH_READY) {
        q('.guide-body').innerHTML = '<p class="guide-tip"><b>通知機能はただいま準備中です。</b><br>利用できるようになりましたら、右上のメニュー「通知の設定」でご案内します。</p><p>現在は、画面上の「お知らせ」から新着をご確認ください。</p>';
      }
      q('[data-guide-back]').disabled = i === 0;
      q('[data-guide-next]').textContent = i === GUIDE.length - 1 ? '動画ページへ' : '次へ';
      q('.guide-dots').innerHTML = GUIDE.map(function (_, k) { return '<span class="' + (k === i ? 'on' : '') + '"></span>'; }).join('');
      q('.guide-scroll').scrollTop = 0;
      q('.guide-error').textContent = '';
      q('#guideTitle').focus({ preventScroll: true });
      var tabs = host.querySelectorAll('.gt');
      function selectOs(os) {
        Array.prototype.forEach.call(tabs, function (b) {
          var selected = b.dataset.os === os;
          b.classList.toggle('on', selected); b.setAttribute('aria-pressed', String(selected));
        });
        q('#guideOsIos').classList.toggle('hidden', os !== 'ios');
        q('#guideOsAnd').classList.toggle('hidden', os !== 'and');
      }
      Array.prototype.forEach.call(tabs, function (b) { b.onclick = function () { selectOs(b.dataset.os); }; });
      if (tabs.length) selectOs(/Android/i.test(navigator.userAgent) ? 'and' : 'ios');
    }
    q('[data-guide-back]').onclick = function () { if (i > 0) { i--; paint(); } };
    q('[data-guide-next]').onclick = function () { if (i < GUIDE.length - 1) { i++; paint(); } else close(); };
    q('[data-guide-skip]').onclick = function () { close(); };
    q('[data-guide-hide]').onclick = function () {
      if (markGuideSeen()) close();
      else q('.guide-error').textContent = 'このブラウザでは設定を保存できませんでした。「スキップ」で閉じられます。';
    };
    host.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      if (ev.key !== 'Tab') return;
      var buttons = Array.prototype.filter.call(host.querySelectorAll('button:not([disabled])'), function (b) { return b.getClientRects().length; });
      var first = buttons[0], last = buttons[buttons.length - 1];
      if (ev.shiftKey && (document.activeElement === first || document.activeElement === q('#guideTitle'))) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    });
    paint();
  }
  function editName() {
    RJ.modal('お名前を変更',
      '<div class="field"><label>アプリ内で表示されるお名前</label>'
      + '<input id="pfName" type="text" value="' + esc(state.user.name) + '" maxlength="30"></div>',
      function (close, setMsg) {
        var name = $('pfName').value.trim();
        if (!name) { setMsg('お名前を入力してください。'); return; }
        return api('profile_save', { token: store.token(), name: name }).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          state.user = res.user;
          store.save(store.token(), res.user);
          $('who').textContent = state.user.name + ' さん';
          close();
        });
      });
  }

  function editPassword() {
    RJ.modal('パスワードを変更',
      '<div class="field"><label>今のパスワード</label><input id="pfCur" type="password" autocomplete="current-password"></div>'
      + '<div class="field"><label>新しいパスワード（4文字以上）</label><input id="pfNew" type="password" autocomplete="new-password"></div>'
      + '<div class="field"><label>新しいパスワード（確認）</label><input id="pfNew2" type="password" autocomplete="new-password"></div>'
      + '<div class="hint">お忘れになった場合は運営スタッフが再発行できます。</div>',
      function (close, setMsg) {
        var cur = $('pfCur').value.trim(), np = $('pfNew').value.trim(), np2 = $('pfNew2').value.trim();
        if (!cur || !np) { setMsg('すべて入力してください。'); return; }
        if (np.length < 4) { setMsg('新しいパスワードは4文字以上にしてください。'); return; }
        if (np !== np2) { setMsg('新しいパスワードが一致していません。'); return; }
        return api('profile_save', { token: store.token(), current: cur, password: np }).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          close();
          RJ.modal('パスワードを変更しました', '<p>次回のログインから新しいパスワードをお使いください。</p>', null, { cancelText: '閉じる' });
        });
      });
  }

  // ---------- 起動 ----------
  /**
   * 前回の一覧を端末に控えておき、次からは「まず控えを出す → 裏で最新に差し替える」。
   * 待ち時間のほとんどはGASの起動と通信なので、これだけで体感がかなり変わる。
   */
  var DATA_KEY = 'rj_data';
  function dataCacheKey() { return DATA_KEY + ':' + (store.user() ? store.user().email : ''); }
  function saveDataCache(res) {
    try {
      localStorage.setItem(dataCacheKey(), JSON.stringify({
        at: Date.now(), user: res.user, courses: res.courses, news: res.news, myReplies: res.myReplies
      }));
    } catch (e) {}                      // 容量オーバーなどは黙って諦める（次回は普通に読む）
  }
  function loadDataCache() {
    try {
      var raw = localStorage.getItem(dataCacheKey());
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.courses) return null;
      if (Date.now() - (d.at || 0) > 7 * 86400000) return null;   // 1週間より古ければ使わない
      return d;
    } catch (e) { return null; }
  }
  function applyData(res) {
    state.user = res.user;
    state.courses = res.courses || [];
    state.news = res.news || [];
    state.myReplies = res.myReplies || {};
    if (res.watched) {
      state.watched = {};
      res.watched.forEach(function (id) { state.watched[id] = 1; });
      saveWatchCache();
    }
  }

  function start() {
    if (!store.token()) { showLogin(); return; }

    // ① 控えがあれば、待たずに描く
    var cached = loadDataCache();
    var shown = false;
    if (cached) {
      applyData(cached);
      loadWatchCache();
      renderApp();
      shown = true;
    }

    // ② 裏で最新を取りにいく
    api('data', { token: store.token(), uid: uid }, { quiet: shown })
      .then(function (res) {
        if (!res || !res.ok) {
          if (res && (res.error === 'unauthorized' || res.error === 'stopped')) {
            store.clear();
            try { localStorage.removeItem(dataCacheKey()); } catch (e) {}
            showLogin(RJ.errMsg(res));
            return;
          }
          if (!shown) showLogin(RJ.errMsg(res));   // 控えを出せているなら黙って諦める
          return;
        }
        applyData(res);
        saveDataCache(res);
        migrateOldWatched();
        if (shown) reRender(); else renderApp();
      })
      .catch(function (e) { if (!shown) showLogin(e.message); });
  }

  /** 最新データで今の画面を描き直す（見ている場所は保つ） */
  function reRender() {
    if (!$('scWatch').classList.contains('hidden') && state.vi >= 0) {
      var cur = state.flat[state.vi];
      renderSideChapters();
      if (cur) renderChapList(cur.chapter);
      paintProgress();
      renderResumeWatch();
    } else if (!$('scPicker').classList.contains('hidden')) {
      showPicker();
    } else {
      renderApp();
    }
    renderNewsBadge();
  }

  function showLogin(message) {
    endResumeSession(); resumeView++;
    clearTimeout(guideTimer);
    if (guideClose) guideClose(false);
    $('scApp').classList.add('hidden');
    $('scLogin').classList.remove('hidden');
    if (message) { $('loginMsg').className = 'msg err'; $('loginMsg').textContent = message; }
  }

  function renderApp() {
    $('scLogin').classList.add('hidden');
    $('scApp').classList.remove('hidden');
    $('who').textContent = state.user.name + ' さん';
    if (state.user.admin) {
      Array.prototype.forEach.call($('acctMenu').querySelectorAll('.adminonly'), function (el) {
        el.classList.remove('hidden');
      });
    }
    renderNewsBadge();
    playGate();
    pushRefresh();

    if (!state.courses.length) {
      show('scEmpty');
      $('side').classList.add('empty-side');
      $('sideHead').innerHTML = '';
      $('sideBody').innerHTML = '';
    } else if (state.courses.length === 1) {
      openCourse(0);                 // コースが1つなら、そのまま視聴画面へ
    } else {
      showPicker();                  // 複数ならコース選択
    }
    // 起動ごとに一度だけ。スキップは次回も表示、非表示は本人が選んだときだけ。
    scheduleGuide();
  }

  /** 画面の切り替え */
  function show(id) {
    resumeView++;
    if (id !== 'scWatch') endResumeSession();
    ['scPicker', 'scWatch', 'scNews', 'scEmpty'].forEach(function (s) {
      $(s).classList.toggle('hidden', s !== id);
    });
    if (id !== 'scWatch') {
      if (state.player) { try { state.player.pause(); } catch (e) {} }
      $('player').src = 'about:blank';
    }
    window.scrollTo(0, 0);
    setTimeout(function () { reveal($(id)); }, 10);
  }

  // ---------- コース選択 ----------
  function showPicker() {
    state.ci = -1;
    show('scPicker');
    $('pickerList').innerHTML = state.courses.map(function (c, i) {
      var pr = courseProgress(c);
      return '<button class="pick" data-i="' + i + '" type="button">'
        + '<span class="pick-name">' + esc(c.name) + (c.mark ? '<span class="mk">' + esc(c.mark) + '</span>' : '') + '</span>'
        + (c.desc ? '<span class="pick-desc">' + esc(c.desc) + '</span>' : '')
        + '<span class="pick-meta">全' + pr.total + '本'
        + (pr.done ? '　視聴済み ' + pr.done + '本' : '') + '</span>'
        + bar(pr)
        + '</button>';
    }).join('');
    Array.prototype.forEach.call($('pickerList').querySelectorAll('.pick'), function (b) {
      b.addEventListener('click', function () { openCourse(Number(b.dataset.i)); });
    });
    renderSideCourses();
    renderResumePicker();
  }

  /** 左：コース一覧（選択前） */
  function renderSideCourses() {
    $('sideHead').innerHTML = '<h2>あなたのコース</h2>';
    $('sideBody').innerHTML = state.courses.map(function (c, i) {
      var n = c.chapters.reduce(function (a, ch) { return a + ch.videos.length; }, 0);
      return '<button class="course-btn" data-i="' + i + '" type="button">'
        + esc(c.name) + '<small>全' + n + '本</small></button>';
    }).join('');
    Array.prototype.forEach.call($('sideBody').querySelectorAll('.course-btn'), function (b) {
      b.addEventListener('click', function () { openCourse(Number(b.dataset.i)); closeDrawer(); });
    });
  }

  // ---------- コースを開く ----------
  function openCourse(i, resume) {
    state.ci = i;
    var c = state.courses[i];
    if (!c) return;

    // 表示順（新しい順＝スプシと逆）にレッスンを並べる。章の並びはシートのまま。
    state.flat = [];
    c.chapters.forEach(function (ch) {
      var vids = ch.videos.slice();
      if (order() === 'new') vids.reverse();
      vids.forEach(function (v) { state.flat.push({ v: v, chapter: ch.name }); });
    });
    // 章はすべて開いた状態から始める／章ごとの色を並び順で決める
    state.openChaps = {};
    state.chapColors = {};
    c.chapters.forEach(function (ch, k) {
      state.openChaps[ch.name] = true;
      state.chapColors[ch.name] = 'cc' + (k % 8);
    });

    renderSideChapters();
    if (resume) {
      var target = state.flat.findIndex(function (item) {
        var vm = RJ.parseVimeo(item.v.url);
        return item.v.state === 'open' && String(item.v.id) === resume.id && vm && vm.id === resume.media;
      });
      if (target >= 0) { openVideo(target, resume.seconds); return; }
    }
    // 前回の動画を開くだけにとどめ、再生位置の復元は本人の操作を待つ。
    var previous = readResume(resumeStorageKey()).filter(function (r) {
      return r.course === c.name && findResumeVideo(r);
    })[0];
    if (previous) {
      var previousIndex = state.flat.findIndex(function (item) {
        var vm = RJ.parseVimeo(item.v.url);
        return String(item.v.id) === previous.id && vm && vm.id === previous.media;
      });
      if (previousIndex >= 0) { openVideo(previousIndex); return; }
    }
    // 記録がなければ従来どおり、最初の視聴可能な動画を開く。
    var first = state.flat.filter(function (f) { return f.v.url; })[0];
    if (first) openVideo(state.flat.indexOf(first));
    else openVideo(0);
  }

  /** 左：章＋レッスン（章タップで開閉） */
  /** 進捗の表示だけ更新する（一覧を作り直さずに済ませる） */
  function paintProgress() {
    var el = $('sideProgress');
    if (el && state.ci >= 0 && state.courses[state.ci]) {
      el.innerHTML = bar(courseProgress(state.courses[state.ci]));
    }
  }

  function renderSideChapters() {
    var c = state.courses[state.ci];
    $('sideHead').innerHTML =
      (state.courses.length > 1
        ? '<button class="side-back" id="toPicker" type="button">← コースを変更</button>' : '')
      + '<h2 class="side-course">' + esc(c.name) + '</h2>'
      + '<div class="side-progress" id="sideProgress">' + bar(courseProgress(c)) + '</div>'
      + '<div class="side-order">'
      + '<button class="ord' + (order() === 'new' ? ' on' : '') + '" data-ord="new" type="button">新しい順</button>'
      + '<button class="ord' + (order() === 'old' ? ' on' : '') + '" data-ord="old" type="button">古い順</button>'
      + '</div>';

    var chapters = c.chapters.slice();
    $('sideBody').innerHTML = chapters.map(function (ch) {
      var vids = ch.videos.slice();
      if (order() === 'new') vids.reverse();
      var open = state.openChaps[ch.name] !== false;
      return '<div class="chap-block ' + chapColor(ch.name) + '">'
        + '<button class="chap-h' + (open ? ' open' : '') + '" data-ch="' + esc(ch.name) + '" type="button">'
        + '<span class="tw">' + (open ? '▾' : '▸') + '</span>'
        + '<span class="chap-name">' + esc(ch.name) + '</span>'
        + chapLimitBadge(ch)
        + '<span class="cnt">' + vids.length + '</span></button>'
        + '<div class="chap-items"' + (open ? '' : ' style="display:none"') + '>'
        + vids.map(function (v) {
          var idx = state.flat.findIndex(function (f) { return f.v.id === v.id; });
          var locked = (v.state !== 'open');
          return '<button class="side-lesson' + (idx === state.vi ? ' on' : '') + (locked ? ' locked' : '') + '"'
            + ' data-i="' + idx + '" type="button"' + (locked || !v.url ? ' disabled' : '') + '>'
            + (isWatched(v) ? '<span class="chk">✓</span>' : (locked ? '<span class="chk">🔒</span>' : '<span class="chk"></span>'))
            + '<span class="ln">' + esc(v.title || '（無題）') + markBadge(v) + lessonLimitBadge(v) + '</span></button>';
        }).join('')
        + '</div></div>';
    }).join('');

    var back = $('toPicker');
    if (back) back.addEventListener('click', function () { showPicker(); closeDrawer(); });

    Array.prototype.forEach.call($('sideHead').querySelectorAll('.ord'), function (b) {
      b.addEventListener('click', function () {
        setOrder(b.dataset.ord);
        var cur = state.flat[state.vi];
        openCourse(state.ci);
        if (cur) {
          var again = state.flat.findIndex(function (f) { return f.v.id === cur.v.id; });
          if (again >= 0) openVideo(again);
        }
      });
    });
    Array.prototype.forEach.call($('sideBody').querySelectorAll('.chap-h'), function (b) {
      b.addEventListener('click', function () {
        var name = b.dataset.ch;
        state.openChaps[name] = (state.openChaps[name] === false);
        renderSideChapters();
      });
    });
    Array.prototype.forEach.call($('sideBody').querySelectorAll('.side-lesson:not([disabled])'), function (b) {
      b.addEventListener('click', function () { openVideo(Number(b.dataset.i)); closeDrawer(); });
    });
  }

  /** 章ごとに色を割り当てる（コース内で並び順に配色。隣り合う章が同じ色にならない） */
  function chapColor(name) {
    return (state.chapColors && state.chapColors[name]) || 'cc0';
  }

  /** 章の中の視聴期限をまとめて1つのバッジにする */
  function chapLimit(ch) {
    var soonest = null, before = 0, expired = 0, open = 0;
    ch.videos.forEach(function (v) {
      if (v.state === 'before') { before++; return; }
      if (v.state === 'expired') { expired++; return; }
      open++;
      if (v.daysLeft != null && (soonest === null || v.daysLeft < soonest)) soonest = v.daysLeft;
    });
    if (soonest !== null && soonest <= 30) return { cls: (soonest <= 3 ? 'urgent' : 'soon'), text: '残り' + soonest + '日' };
    if (before && !open) return { cls: 'wait', text: '公開前' };
    if (before) return { cls: 'wait', text: '一部公開前' };
    if (expired && !open) return { cls: 'gone', text: '終了' };
    if (expired) return { cls: 'gone', text: '一部終了' };
    return null;
  }
  function chapLimitBadge(ch) {
    var l = chapLimit(ch);
    return l ? '<span class="lim ' + l.cls + '">' + esc(l.text) + '</span>' : '';
  }
  /** レッスン1本ぶんの期限バッジ */
  /** スプシ K列「目印」に書いた文字を、そのままバッジにする（例：更新!!） */
  function markBadge(v) {
    return v && v.mark ? '<span class="mk">' + esc(v.mark) + '</span>' : '';
  }

  function lessonLimitBadge(v) {
    if (v.state === 'before') return '<em class="lim wait">' + esc(RJ.jpDate(v.startAt)) + ' 公開</em>';
    if (v.state === 'expired') return '<em class="lim gone">視聴期間 終了</em>';
    if (v.daysLeft != null && v.daysLeft <= 30) {
      return '<em class="lim ' + (v.daysLeft <= 3 ? 'urgent' : 'soon') + '">⏳ '
        + esc(RJ.jpDate(v.endAt)) + 'まで（残り' + v.daysLeft + '日）</em>';
    }
    return '';
  }

  // ---------- 視聴 ----------
  function lockLabel(v) {
    if (v.state === 'before') return '🔒 ' + RJ.jpDate(v.startAt) + ' 公開';
    if (v.state === 'expired') return '🔒 視聴期間が終了しました';
    return '';
  }

  function openVideo(i, resumeSeconds) {
    var item = state.flat[i];
    if (!item) return;
    endResumeSession();
    state.vi = i;
    var v = item.v;
    var vm = RJ.parseVimeo(v.url);

    show('scWatch');
    $('vTitle').innerHTML = esc(v.title || '（無題）') + markBadge(v);
    var hint = $('vHint');
    if (v.hint) { hint.textContent = v.hint; hint.classList.remove('hidden'); }
    else { hint.classList.add('hidden'); }
    $('vCrumb').textContent = state.courses[state.ci].name + '　＞　' + item.chapter;

    var limit = $('vLimit');
    if (v.state !== 'open') {
      limit.className = 'limit-bar soon';
      limit.textContent = lockLabel(v);
      limit.classList.remove('hidden');
    } else if (v.daysLeft != null) {
      limit.className = 'limit-bar' + (v.daysLeft <= 1 ? ' soon' : '');
      limit.textContent = '⏳ この動画は ' + RJ.jpDate(v.endAt) + ' まで視聴できます（残り' + v.daysLeft + '日）';
      limit.classList.remove('hidden');
    } else {
      limit.classList.add('hidden');
    }

    var frame = $('player');
    // ユーザーが再開を選んだ場合だけ、Vimeo公式の開始位置パラメーターを付ける。
    // ブラウザが自動再生を制限しても、再生ボタンからこの位置で始められる。
    var resumeAt = typeof resumeSeconds === 'number' && isFinite(resumeSeconds) && resumeSeconds >= 5
      ? Math.floor(resumeSeconds) : 0;
    frame.src = vm ? vm.embed + (resumeAt ? '&autoplay=1#t=' + resumeAt + 's' : '') : 'about:blank';
    state.player = null;
    if (vm && window.Vimeo && window.Vimeo.Player) {
      try { state.player = new Vimeo.Player(frame); } catch (e) { state.player = null; }
    }
    paintSeekTools(!!state.player);
    paintRateTools(!!state.player);
    applyRate();
    // ※Vimeo側が「埋め込み限定」設定のため、vimeo.comで開くリンクは置いていない

    // 目次・補足
    var parsed = RJ.parseMarks(v.note);
    if (parsed.marks.length) {
      $('markCard').classList.remove('hidden');
      $('marks').innerHTML = parsed.marks.map(function (m, k) {
        return '<button class="mark" data-k="' + k + '" type="button"><time>' + esc(m.time) + '</time>'
          + '<span>' + esc(m.label) + '</span></button>';
      }).join('');
      Array.prototype.forEach.call($('marks').querySelectorAll('.mark'), function (b) {
        b.addEventListener('click', function () { seek(parsed.marks[Number(b.dataset.k)].sec, vm); });
      });
    } else {
      $('markCard').classList.add('hidden'); $('marks').innerHTML = '';
    }
    if (parsed.rest) {
      $('noteCard').classList.remove('hidden');
      $('noteText').innerHTML = RJ.linkify(parsed.rest);
    } else {
      $('noteCard').classList.add('hidden'); $('noteText').innerHTML = '';
    }

    // 追加コンテンツ（文章・画像・音声）
    renderBlocks(v.blocks);

    // 動画の下：同じ章の一覧
    renderChapList(item.chapter);

    var done = $('doneBtn');
    function paintDone() {
      var on = isWatched(v);
      done.textContent = on ? '✓ 視聴済み' : '□ 視聴済みにする';
      done.className = on ? 'on' : '';
    }
    paintDone();
    done.onclick = function () {
      toggleWatched(v);
      paintDone();
      renderSideChapters();
      renderChapList(item.chapter);
    };

    // 9割まで観たら自動で「視聴済み」にする（本人が外すこともできる）
    watchAuto(v);
    trackResume(v);
    renderResumeWatch();

    $('prevBtn').disabled = (i <= 0);
    $('nextBtn').disabled = (i >= state.flat.length - 1);
    renderSideChapters();
    window.scrollTo(0, 0);
  }

  /**
   * 10秒もどす／10秒すすむ
   * ・Vimeoの再生位置を読み書きする。プレイヤーが無いときはボタンを押せなくする
   * ・動画の長さを超えないように丸める
   */
  function seekBy(sec) {
    var p = state.player;
    if (!p || !p.getCurrentTime) return;
    var btn = sec < 0 ? $('back10') : $('fwd10');
    if (btn) { btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 220); }
    Promise.all([p.getCurrentTime(), p.getDuration()])
      .then(function (r) {
        var now = r[0] || 0, dur = r[1] || 0;
        var to = now + sec;
        if (to < 0) to = 0;
        if (dur && to > dur - 0.5) to = Math.max(0, dur - 0.5);
        return p.setCurrentTime(to);
      })
      .catch(function () {});          // 操作できない環境でも黙って何もしない
  }

  /** 再生できる動画のときだけ、10秒ボタンを押せるようにする */
  function paintSeekTools(canPlay) {
    var box = $('seekTools');
    if (!box) return;
    box.classList.toggle('hidden', !canPlay);
    ['back10', 'fwd10'].forEach(function (id) {
      var b = $(id); if (b) b.disabled = !canPlay;
    });
  }

  if ($('back10')) $('back10').addEventListener('click', function () { seekBy(-10); });
  if ($('fwd10')) $('fwd10').addEventListener('click', function () { seekBy(10); });

  /* ---------- 再生速度 ----------
   * ・0.75 / 1 / 1.25 / 1.5 の4段階。選んだ速度はこの端末が覚えて、次の動画にも引き継ぐ
   * ・Vimeoは端末や動画の設定によって速度変更を断ることがある。
   *   そのときは黙って失敗させず、「変えられません」と出して表示を実際の速度に戻す
   */
  var RATES = [0.75, 1, 1.25, 1.5];
  function rate() {
    var v;
    try { v = Number(localStorage.getItem(RATE_KEY)); } catch (e) { v = 0; }
    return RATES.indexOf(v) >= 0 ? v : 1;
  }
  function setRate(v) { try { localStorage.setItem(RATE_KEY, String(v)); } catch (e) {} }

  function paintRateTools(canPlay) {
    var box = $('rateTools');
    if (!box) return;
    box.classList.toggle('hidden', !canPlay);
    var now = rate();
    Array.prototype.forEach.call(box.querySelectorAll('.rate'), function (b) {
      b.classList.toggle('on', Number(b.dataset.rate) === now);
      b.disabled = !canPlay;
    });
    if (canPlay) rateMsg(false);
  }
  function rateMsg(show) {
    var m = $('rateMsg'); if (m) m.classList.toggle('hidden', !show);
  }

  /** いまのプレーヤーに、覚えている速度をあてる（動画を開くたびに呼ぶ） */
  function applyRate() {
    var p = state.player;
    if (!p || !p.setPlaybackRate) return;
    var want = rate();
    p.ready()
      .then(function () { return p.setPlaybackRate(want); })
      .then(function () { rateMsg(false); })
      .catch(function () {
        // 変えられない端末。表示を実際の速度に戻して、理由を出す
        rateMsg(true);
        if (p.getPlaybackRate) {
          p.getPlaybackRate().then(function (r) {
            var box = $('rateTools'); if (!box) return;
            Array.prototype.forEach.call(box.querySelectorAll('.rate'), function (b) {
              b.classList.toggle('on', Number(b.dataset.rate) === Number(r));
            });
          }).catch(function () {});
        }
      });
  }

  if ($('rateTools')) {
    $('rateTools').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.rate') : null;
      if (!b || b.disabled) return;
      setRate(Number(b.dataset.rate));
      paintRateTools(true);
      applyRate();
    });
  }

  /**
   * 9割まで再生されたら、自動で「視聴済み」にする。
   * ・Vimeoの再生位置を purcent で受け取る（player.js が読み込めていないときは何もしない）
   * ・一度付けたら、その動画では二度と送らない
   * ・本人が手で外した場合は、同じ再生中はもう付け直さない（お節介にしない）
   */
  function watchAuto(v) {
    var p = state.player;
    if (!p || !p.on) return;
    var fired = false;
    try {
      p.off('timeupdate');                 // 前の動画の監視が残らないように
      p.on('timeupdate', function (d) {
        if (fired || !d || !d.percent) return;
        if (d.percent < 0.9) return;
        fired = true;
        if (isWatched(v)) return;
        setWatched(v, true);
        var btn = $('doneBtn');
        if (btn) { btn.textContent = '✓ 視聴済み'; btn.className = 'on'; }
        renderSideChapters();
        var item = state.flat[state.vi];
        if (item) renderChapList(item.chapter);
      });
    } catch (e) {}                          // 監視できない環境でも視聴そのものは妨げない
  }

  /** 運営が並べた「文章・画像・音声」をそのまま順番に出す */
  function renderBlocks(raw) {
    var list = RJ.parseBlocks(raw);
    if (!list.length) { $('blockCard').classList.add('hidden'); $('blockBody').innerHTML = ''; return; }
    $('blockCard').classList.remove('hidden');
    $('blockBody').innerHTML = list.map(function (b) {
      if (b.type === 'image') {
        return '<figure class="bk-img"><img src="' + esc(RJ.fixDriveUrl(b.value, 'image')) + '" alt="" loading="lazy"></figure>';
      }
      if (b.type === 'audio') {
        return '<div class="bk-audio"><audio controls preload="none" src="'
          + esc(RJ.fixDriveUrl(b.value, 'audio')) + '"></audio></div>';
      }
      return '<div class="bk-text">' + RJ.linkify(b.value) + '</div>';
    }).join('');
  }

  function renderChapList(chapter) {
    var items = state.flat
      .map(function (f, i) { return { f: f, i: i }; })
      .filter(function (x) { return x.f.chapter === chapter; });
    var chObj = (state.courses[state.ci].chapters || []).filter(function (x) { return x.name === chapter; })[0];
    $('chapListTitle').innerHTML = esc(chapter)
      + '<span class="sub">（' + (order() === 'new' ? '新しい順' : '古い順') + '・全' + items.length + '本）</span>'
      + (chObj ? chapLimitBadge(chObj) : '');
    var card = $('chapListTitle').parentNode;
    card.className = 'card ' + chapColor(chapter) + (card.classList.contains('is-visible') ? ' is-visible' : '');
    $('chapList').innerHTML = items.map(function (x) {
      var v = x.f.v;
      var locked = (v.state !== 'open');
      return '<button class="lesson' + (x.i === state.vi ? ' on' : '') + (locked || !v.url ? ' nolink' : '') + '"'
        + ' data-i="' + x.i + '" type="button"' + (locked || !v.url ? ' disabled' : '') + '>'
        + '<span class="num">' + (locked ? '🔒' : (items.indexOf(x) + 1)) + '</span>'
        + '<span class="ttl">' + esc(v.title || '（無題）')
        + (locked ? '<em>' + esc(lockLabel(v)) + '</em>'
          : (v.daysLeft != null && v.daysLeft <= 14 ? '<em>⏳ ' + esc(RJ.jpDate(v.endAt)) + 'まで（残り' + v.daysLeft + '日）</em>' : ''))
        + '</span>'
        + '<span class="done">' + (isWatched(v) ? '✓' : '') + '</span></button>';
    }).join('');
    Array.prototype.forEach.call($('chapList').querySelectorAll('.lesson:not([disabled])'), function (b) {
      b.addEventListener('click', function () { openVideo(Number(b.dataset.i)); });
    });
  }

  function seek(sec, vm) {
    if (state.player) {
      state.player.setCurrentTime(sec)
        .then(function () { return state.player.play(); })
        .catch(function () { hardSeek(sec, vm); });
    } else { hardSeek(sec, vm); }
  }
  function hardSeek(sec, vm) {
    if (!vm) return;
    $('player').src = vm.embed + '&autoplay=1#t=' + sec + 's';
  }

  $('prevBtn').addEventListener('click', function () { if (state.vi > 0) openVideo(state.vi - 1); });
  $('nextBtn').addEventListener('click', function () { if (state.vi < state.flat.length - 1) openVideo(state.vi + 1); });

  // ---------- お知らせ ----------
  function unreadCount() {
    var read = ls(READ_KEY);
    return state.news.filter(function (n) { return !read[n.id]; }).length;
  }
  function renderNewsBadge() {
    var n = unreadCount(), b = $('newsBadge');
    if (n > 0) { b.textContent = n; b.classList.remove('hidden'); } else { b.classList.add('hidden'); }
  }
  function markRead(id) { var r = ls(READ_KEY); r[id] = 1; lsSave(READ_KEY, r); renderNewsBadge(); }

  $('newsBtn').addEventListener('click', function () { showNews(); });

  function showNews(focusId) {
    show('scNews');
    $('newsLead').textContent = state.news.length ? '運営からのご連絡です。' : '';
    if (!state.news.length) {
      $('newsList').innerHTML = '<div class="empty">お知らせはまだありません。</div>';
      return;
    }
    var read = ls(READ_KEY), liked = ls(LIKE_KEY);
    $('newsList').innerHTML = state.news.map(function (n) {
      var mine = state.myReplies[n.id] || '';
      return '<article class="news' + (read[n.id] ? '' : ' unread') + '" id="news-' + esc(n.id) + '">'
        + '<div class="news-head"><time>' + esc(RJ.jpDate(n.date) || n.date) + '</time>'
        + (read[n.id] ? '' : '<span class="new">NEW</span>')
        + (n.published === false ? '<span class="draft">非公開（運営のみ）</span>' : '') + '</div>'
        + '<h3>' + esc(n.title) + '</h3>'
        + (n.image ? '<img class="news-img" src="' + esc(n.image) + '" alt="">' : '')
        + '<div class="news-body">' + RJ.linkify(n.body) + '</div>'
        + (n.choices && n.choices.length
          ? '<div class="poll"><div class="poll-q">ご回答をお願いします</div>'
            + n.choices.map(function (c) {
              return '<button class="poll-btn' + (mine === c ? ' on' : '') + '" data-poll="' + esc(n.id) + '" data-choice="' + esc(c) + '" type="button">' + esc(c) + '</button>';
            }).join('')
            + '<div class="poll-msg" data-pollmsg="' + esc(n.id) + '">' + (mine ? '「' + esc(mine) + '」で受け付けています（変更できます）' : '') + '</div></div>'
          : '')
        + '<div class="news-foot"><button class="like' + (liked[n.id] ? ' on' : '') + '" data-like="' + esc(n.id) + '" type="button">'
        + (liked[n.id] ? '♥' : '♡') + ' <span>' + n.likes + '</span></button></div></article>';
    }).join('');

    Array.prototype.forEach.call($('newsList').querySelectorAll('[data-like]'), function (b) {
      b.addEventListener('click', function () { like(b); });
    });
    Array.prototype.forEach.call($('newsList').querySelectorAll('[data-poll]'), function (b) {
      b.addEventListener('click', function () { reply(b); });
    });

    state.news.forEach(function (n) { markRead(n.id); });
    if (focusId) {
      var el = $('news-' + focusId);
      if (el) el.scrollIntoView({ block: 'start' });
    }
  }

  function like(btn) {
    var id = btn.dataset.like, liked = ls(LIKE_KEY), off = !!liked[id];
    btn.disabled = true;
    api('news_like', { token: store.token(), id: id, off: off ? '1' : '' })
      .then(function (res) {
        if (!res || !res.ok) return;
        if (off) delete liked[id]; else liked[id] = 1;
        lsSave(LIKE_KEY, liked);
        btn.className = 'like' + (liked[id] ? ' on' : '');
        btn.innerHTML = (liked[id] ? '♥' : '♡') + ' <span>' + res.likes + '</span>';
        var n = state.news.filter(function (x) { return x.id === id; })[0];
        if (n) n.likes = res.likes;
      })
      .catch(function () {})
      .then(function () { btn.disabled = false; });
  }

  function reply(btn) {
    var id = btn.dataset.poll, choice = btn.dataset.choice;
    var msg = $('newsList').querySelector('[data-pollmsg="' + id + '"]');
    if (msg) msg.textContent = '送信中…';
    api('news_reply', { token: store.token(), id: id, choice: choice })
      .then(function (res) {
        if (!res || !res.ok) { if (msg) msg.textContent = RJ.errMsg(res); return; }
        state.myReplies[id] = choice;
        Array.prototype.forEach.call($('newsList').querySelectorAll('[data-poll="' + id + '"]'), function (b) {
          b.className = 'poll-btn' + (b.dataset.choice === choice ? ' on' : '');
        });
        if (msg) msg.textContent = '「' + choice + '」で受け付けました（変更できます）';
      })
      .catch(function (e) { if (msg) msg.textContent = e.message; });
  }

  function popupNews() {
    var read = ls(READ_KEY);
    var target = state.news.filter(function (n) { return n.pop && n.published !== false && !read[n.id]; })[0];
    if (!target) return;
    var body = String(target.body || '');
    var short = body.length > 160 ? body.slice(0, 160) + '…' : body;
    RJ.modal(target.title,
      '<div class="hint" style="margin-bottom:8px">' + esc(RJ.jpDate(target.date) || target.date) + '</div>'
      + (target.image ? '<img class="news-img" src="' + esc(target.image) + '" alt="">' : '')
      + '<div class="news-body">' + RJ.linkify(short) + '</div>',
      function (close) { close(); showNews(target.id); },
      { saveText: 'お知らせを見る', cancelText: 'あとで' });
  }

  // ---------- 演出 ----------
  /** ログイン直後に一度だけ、扉が開く演出 */
  function playGate() {
    try { if (sessionStorage.getItem('rj_gate') === '1') return; sessionStorage.setItem('rj_gate', '1'); } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var g = document.createElement('div');
    g.className = 'gate';
    g.innerHTML = '<div class="gate-panel gate-l"></div><div class="gate-panel gate-r"></div>'
      + '<div class="gate-light"></div>'
      + '<div class="gate-copy"><span>RINONJUKU</span><strong>凛穏塾</strong></div>';
    document.body.appendChild(g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 1900);
  }

  /** カードがスクロールで入ってきたら、ふわっと出す */
  var revealObserver = null;
  function reveal(scope) {
    var targets = (scope || document).querySelectorAll('.card, .pick, .news, .frame');
    if (!targets.length) return;
    function showAll() {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
    }
    // 検知が使えない／画面が非表示のときは、演出なしで確実に表示する
    if (!('IntersectionObserver' in window) || document.hidden) { showAll(); return; }
    // 保険：1.5秒経っても出ていない要素は強制的に表示する（透明のまま残さない）
    setTimeout(showAll, 1500);
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    }
    Array.prototype.forEach.call(targets, function (el) {
      if (el.classList.contains('is-visible')) return;
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  // ---------- スマホのドロワー ----------
  function openDrawer() { $('side').classList.add('open'); $('backdrop').classList.remove('hidden'); }
  function closeDrawer() { $('side').classList.remove('open'); $('backdrop').classList.add('hidden'); }
  $('drawerTab').addEventListener('click', function () {
    if ($('side').classList.contains('open')) closeDrawer(); else openDrawer();
  });
  $('backdrop').addEventListener('click', closeDrawer);

  // ---------- 開始 ----------
  if (!RJ.CFG.GAS_URL && !RJ.MOCK) {
    $('loginMsg').className = 'msg err';
    $('loginMsg').textContent = 'セットアップ未完了：js/config.js の GAS_URL を設定してください。';
  } else {
    if (RJ.MOCK) {
      $('loginMsg').className = 'msg ok';
      $('loginMsg').textContent = 'デモモード：demo@example.com / demo でお試しいただけます。';
    }
    if (uid && !store.token() && RJ.CFG.LINE_QUICK_LOGIN) {
      api('uid_login', { uid: uid })
        .then(function (res) {
          if (res && res.ok) { store.save(res.token, res.user); start(); } else start();
        })
        .catch(function () { start(); });
    } else {
      start();
    }
  }

  // ---------- マニュアル用の画面キャプチャ（デモモードのときだけ動く） ----------
  // 例）index.html?mock=1&shot=first
  //   login / first / firstpass / picker / menu の5種類。
  //   本番（?mock=1が無いとき）は、この中に一切入らない。
  (function () {
    if (!RJ.MOCK) return;
    var m = location.search.match(/[?&]shot=([a-z]+)/);
    if (!m) return;
    var what = m[1];
    document.documentElement.classList.add('shooting');   // デモの帯などを隠す
    function wait(fn, ms) { setTimeout(fn, ms || 500); }
    function save() { return document.querySelector('.modal [data-save]'); }

    if (what === 'first' || what === 'firstpass') {
      wait(function () {
        $('firstLink').click();
        if (what === 'first') {
          wait(function () { $('fsEmail').value = 'hanako@example.com'; }, 200);
          return;
        }
        wait(function () {
          $('fsEmail').value = 'hanako@example.com';
          save().click();
          wait(function () {
            if ($('fsPass')) { $('fsPass').value = 'sakura2026'; $('fsPass2').value = 'sakura2026'; }
          }, 500);
        }, 200);
      });
      return;
    }

    if (what === 'picker' || what === 'menu' || what === 'watch') {
      wait(function () {
        api('login', { email: 'demo@example.com', password: 'demo' }).then(function (res) {
          if (!res || !res.ok) return;
          store.save(res.token, res.user);
          // 撮影中の自動ガイド抑止はSHOOTINGで行う（非表示設定は変更しない）。
          start();
          if (what === 'menu') wait(function () { $('acctBtn').click(); }, 900);
          if (what === 'watch') wait(function () {
            openCourse(0);
            wait(function () { openVideo(2); }, 400);
          }, 700);
        });
      });
    }
  })();
})();
