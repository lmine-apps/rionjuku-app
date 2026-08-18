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
    openChaps: {}    // 章の開閉状態
  };
  var WATCH_KEY = 'rj_watched', READ_KEY = 'rj_news_read', LIKE_KEY = 'rj_news_liked', ORDER_KEY = 'rj_order';
  var uid = RJ.pickUid();

  var $ = function (id) { return document.getElementById(id); };
  function ls(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
  function lsSave(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {} }
  function order() { try { return localStorage.getItem(ORDER_KEY) || 'new'; } catch (e) { return 'new'; } }
  function setOrder(v) { try { localStorage.setItem(ORDER_KEY, v); } catch (e) {} }

  // ---------- 視聴済み（この端末のみ） ----------
  function watchKey(v) { return v.id + '|' + v.title; }
  function isWatched(v) { return !!ls(WATCH_KEY)[watchKey(v)]; }
  function toggleWatched(v) {
    var w = ls(WATCH_KEY);
    if (w[watchKey(v)]) delete w[watchKey(v)]; else w[watchKey(v)] = 1;
    lsSave(WATCH_KEY, w);
    return !!w[watchKey(v)];
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
    if (act === 'logout') { store.clear(); location.reload(); return; }
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
    {
      t: 'ようこそ、凛穏塾の動画ページへ',
      b: '<p>これまでの講義動画を、いつでも何度でもご覧いただけます。</p>'
        + '<p>まずは簡単に、使い方をご案内します（1分ほどです）。</p>'
    },
    {
      t: '観たい動画の選び方',
      b: '<p>ご受講のコースが複数ある方は、最初に<b>コースを選ぶ画面</b>が出ます。</p>'
        + '<p>コースを選ぶと動画が再生され、<b>左側（スマホは「目次」ボタン）</b>から'
        + '章ごとのレッスン一覧を開けます。章名をタップすると折りたためます。</p>'
    },
    {
      t: '観たい場面へ飛べます',
      b: '<p>動画の下に<b>目次</b>がある回では、<b>時刻をタップするとその場面から</b>再生されます。</p>'
        + '<p>観終わった動画は「□ 視聴済みにする」を押しておくと、一覧に ✓ が付きます。</p>'
    },
    {
      t: 'ホーム画面に置くと便利です',
      b: '<div class="guide-tab"><button class="gt on" data-os="ios" type="button">iPhone</button>'
        + '<button class="gt" data-os="and" type="button">Android</button></div>'
        + '<div id="guideOsIos"><ol class="guide-ol">'
        + '<li>画面下の<b>共有ボタン</b>（□に↑）を押します</li>'
        + '<li>メニューを下にたどって<b>「ホーム画面に追加」</b>を選びます</li>'
        + '<li>右上の「追加」を押すと、アプリのように開けます</li></ol></div>'
        + '<div id="guideOsAnd" class="hidden"><ol class="guide-ol">'
        + '<li>右上の<b>「︙」</b>を押します</li>'
        + '<li><b>「ホーム画面に追加」</b>を選びます</li>'
        + '<li>「追加」を押すと、アプリのように開けます</li></ol></div>'
    },
    {
      t: '困ったときは',
      b: '<p><b>パスワードを忘れた</b>…運営スタッフへご連絡ください。再設定できます。</p>'
        + '<p><b>パソコンで観たい</b>…右上のメニューから「パソコンで見る」でアドレスをコピーできます。</p>'
        + '<p><b>動画が観られない</b>…Wi-Fi環境でお試しください。それでも出ない場合はご連絡ください。</p>'
        + '<p style="margin-bottom:0">このガイドは、右上のメニュー「📖 使い方ガイド」からいつでも見られます。</p>'
    }
  ];

  function showGuide(page) {
    var i = page || 0;
    var g = GUIDE[i];
    var m = RJ.modal(g.t,
      '<div class="guide-body">' + g.b + '</div>'
      + '<div class="guide-dots">' + GUIDE.map(function (_, k) {
        return '<span class="' + (k === i ? 'on' : '') + '"></span>';
      }).join('') + '</div>',
      (i < GUIDE.length - 1)
        ? function (close) { close(); showGuide(i + 1); }
        : function (close) { close(); markGuideSeen(); },
      { saveText: (i < GUIDE.length - 1) ? '次へ' : 'はじめる', cancelText: (i === 0 ? 'あとで' : '閉じる') });

    // ホーム画面追加のiPhone/Android切替
    var tabs = m.host.querySelectorAll('.gt');
    Array.prototype.forEach.call(tabs, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(tabs, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        m.host.querySelector('#guideOsIos').classList.toggle('hidden', b.dataset.os !== 'ios');
        m.host.querySelector('#guideOsAnd').classList.toggle('hidden', b.dataset.os !== 'and');
      });
    });
    if (i === GUIDE.length - 1) markGuideSeen();
  }
  function markGuideSeen() { try { localStorage.setItem('rj_guide', '1'); } catch (e) {} }
  function guideSeen() { try { return localStorage.getItem('rj_guide') === '1'; } catch (e) { return true; } }

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
  function start() {
    if (!store.token()) { showLogin(); return; }
    api('data', { token: store.token(), uid: uid })
      .then(function (res) {
        if (!res || !res.ok) {
          if (res && (res.error === 'unauthorized' || res.error === 'stopped')) store.clear();
          showLogin(RJ.errMsg(res));
          return;
        }
        state.user = res.user;
        state.courses = res.courses || [];
        state.news = res.news || [];
        state.myReplies = res.myReplies || {};
        renderApp();
      })
      .catch(function (e) { showLogin(e.message); });
  }

  function showLogin(message) {
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
    // 初回は使い方ガイド、2回目以降は未読のお知らせポップ
    if (!guideSeen()) setTimeout(function () { showGuide(0); }, 1900);
    else popupNews();
  }

  /** 画面の切り替え */
  function show(id) {
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
      var n = c.chapters.reduce(function (a, ch) { return a + ch.videos.length; }, 0);
      var done = 0;
      c.chapters.forEach(function (ch) { ch.videos.forEach(function (v) { if (isWatched(v)) done++; }); });
      return '<button class="pick" data-i="' + i + '" type="button">'
        + '<span class="pick-name">' + esc(c.name) + '</span>'
        + (c.desc ? '<span class="pick-desc">' + esc(c.desc) + '</span>' : '')
        + '<span class="pick-meta">全' + n + '本' + (done ? '　視聴済み ' + done + '本' : '') + '</span>'
        + '</button>';
    }).join('');
    Array.prototype.forEach.call($('pickerList').querySelectorAll('.pick'), function (b) {
      b.addEventListener('click', function () { openCourse(Number(b.dataset.i)); });
    });
    renderSideCourses();
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
  function openCourse(i) {
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
    // 最初の動画（観られるもの）を自動で開く
    var first = state.flat.filter(function (f) { return f.v.url; })[0];
    if (first) openVideo(state.flat.indexOf(first));
    else openVideo(0);
  }

  /** 左：章＋レッスン（章タップで開閉） */
  function renderSideChapters() {
    var c = state.courses[state.ci];
    $('sideHead').innerHTML =
      (state.courses.length > 1
        ? '<button class="side-back" id="toPicker" type="button">← コースを変更</button>' : '')
      + '<h2 class="side-course">' + esc(c.name) + '</h2>'
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
            + '<span class="ln">' + esc(v.title || '（無題）') + lessonLimitBadge(v) + '</span></button>';
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

  function openVideo(i) {
    var item = state.flat[i];
    if (!item) return;
    state.vi = i;
    var v = item.v;
    var vm = RJ.parseVimeo(v.url);

    show('scWatch');
    $('vTitle').textContent = v.title || '（無題）';
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
    frame.src = vm ? vm.embed : 'about:blank';
    state.player = null;
    if (vm && window.Vimeo && window.Vimeo.Player) {
      try { state.player = new Vimeo.Player(frame); } catch (e) { state.player = null; }
    }
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

    // 動画の下：同じ章の一覧
    renderChapList(item.chapter);

    var done = $('doneBtn');
    function paintDone() {
      var on = isWatched(v);
      done.textContent = on ? '✓ 視聴済み' : '□ 視聴済みにする';
      done.className = on ? 'on' : '';
    }
    paintDone();
    done.onclick = function () { toggleWatched(v); paintDone(); renderSideChapters(); renderChapList(item.chapter); };

    $('prevBtn').disabled = (i <= 0);
    $('nextBtn').disabled = (i >= state.flat.length - 1);
    renderSideChapters();
    window.scrollTo(0, 0);
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
})();
