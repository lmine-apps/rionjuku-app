/**
 * 凛穏塾 動画視聴アプリ ── 共通処理（受講生画面・運営画面の両方で使う）
 */
(function (w) {
  'use strict';

  var CFG = w.RJ_CONFIG || {};
  var TOKEN_KEY = 'rj_token';
  var USER_KEY = 'rj_user';

  // URLに ?mock=1 が付いていたらデモモード（GASに繋がずダミーデータで動く）
  var MOCK = /[?&]mock=1/.test(location.search);

  /**
   * 通信中のオーバーレイ（背景を薄暗くして、進み具合のバーを出す）
   * 待たせている間に「固まった？」と思わせないためのもの。
   */
  var busy = { n: 0, el: null, timer: null, t0: 0 };
  function busyShow(text) {
    busy.n++;
    if (busy.el) { busyText(text); return; }
    var el = document.createElement('div');
    el.className = 'loading';
    el.innerHTML =
      '<div class="loading-card">'
      + '<div class="loading-mark"><span></span><span></span><span></span></div>'
      + '<div class="loading-text">' + esc(text || '読み込んでいます…') + '</div>'
      + '<div class="loading-bar"><i></i></div>'
      + '<div class="loading-sub"></div>'
      + '</div>';
    document.body.appendChild(el);
    busy.el = el;
    busy.t0 = Date.now();
    // 5秒を超えたら「もう少しお待ちください」を添える（不安の芽を摘む）
    busy.timer = setInterval(function () {
      var s = Math.floor((Date.now() - busy.t0) / 1000);
      var sub = el.querySelector('.loading-sub');
      if (!sub) return;
      if (s >= 12) sub.textContent = '通信が混み合っているようです。もう少しだけお待ちください…';
      else if (s >= 5) sub.textContent = 'もう少しお待ちください…';
    }, 1000);
  }
  function busyText(text) {
    if (busy.el && text) busy.el.querySelector('.loading-text').textContent = text;
  }
  function busyHide() {
    busy.n = Math.max(0, busy.n - 1);
    if (busy.n > 0 || !busy.el) return;
    clearInterval(busy.timer);
    var el = busy.el;
    busy.el = null;
    el.classList.add('done');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  }

  // 画面を止めて待たせる操作（画面の描き替えを伴うもの）だけオーバーレイを出す
  var BUSY_LABEL = {
    login: 'ログインしています…',
    uid_login: 'ログインしています…',
    data: '動画の一覧を読み込んでいます…',
    admin_data: '管理データを読み込んでいます…',
    first_check: 'ご登録を確認しています…',
    first_password: 'パスワードを設定しています…',
    profile_save: '保存しています…',
    video_add: '動画を追加しています…',
    video_update: '保存しています…',
    video_delete: '削除しています…',
    student_save: '保存しています…',
    student_delete: '削除しています…',
    course_save: '保存しています…',
    news_save: '保存しています…',
    news_delete: '削除しています…'
  };

  /** GAS門番へのPOST（URLSearchParamsなのでプリフライトが飛ばない） */
  function api(action, params) {
    if (MOCK && w.RJ_MOCK) {
      var ml = BUSY_LABEL[action];
      if (ml) busyShow(ml);
      return w.RJ_MOCK(action, params).then(function (r) { if (ml) busyHide(); return r; },
                                            function (e) { if (ml) busyHide(); throw e; });
    }
    if (!CFG.GAS_URL) {
      return Promise.reject(new Error('セットアップ未完了：js/config.js の GAS_URL が空です。'));
    }
    var body = new URLSearchParams();
    body.set('action', action);
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null) return;
      body.set(k, String(v));
    });
    var label = BUSY_LABEL[action];
    if (label) busyShow(label);
    return fetch(CFG.GAS_URL, { method: 'POST', body: body })
      .then(function (res) { return res.text(); })
      .then(function (text) {
        try { return JSON.parse(text); }
        catch (e) { throw new Error('サーバーの応答が読めませんでした（デプロイ設定をご確認ください）'); }
      })
      .then(function (res) { if (label) busyHide(); return res; },
            function (err) { if (label) busyHide(); throw err; });
  }

  var store = {
    token: function () { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } },
    user: function () {
      try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
    },
    save: function (token, user) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
      } catch (e) { /* プライベートモード等 */ }
    },
    clear: function () {
      try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
    }
  };

  var ERRORS = {
    empty: 'メールアドレスとパスワードを入力してください。',
    bad_credentials: 'メールアドレスかパスワードが違います。',
    stopped: 'このアカウントは現在ご利用いただけません。運営までお問い合わせください。',
    locked: '入力を続けて間違えたため、一時的にロックしました。10分ほどおいてからお試しください。',
    unauthorized: 'ログインの有効期限が切れました。もう一度ログインしてください。',
    forbidden: 'この操作の権限がありません。',
    row_moved: 'スプレッドシート側が更新されています。画面を再読み込みしてやり直してください。',
    duplicate_email: 'そのメールアドレスは既に登録されています。',
    bad_email: 'メールアドレスの形式をご確認ください。',
    cannot_delete_self: 'ご自身のアカウントは削除できません。',
    no_course: 'コースを選んでください。',
    no_content: 'タイトルか動画URLを入力してください。',
    no_title: '見出しを入力してください。',
    no_name: 'コース名を入力してください。',
    current_wrong: '今のパスワードが違います。',
    not_registered: 'そのメールアドレスは登録されていません。凛穏塾にご登録のアドレスをご確認のうえ、分からない場合は運営スタッフへご連絡ください。',
    already_set: 'このアカウントはパスワード設定済みです。ログイン画面からお入りください（お忘れの場合は運営スタッフへご連絡ください）。',
    setup_closed: '初回パスワード設定の受付は終了しました。運営スタッフへご連絡ください。',
    need_line: 'LINEからお送りしたリンクを開いて、こちらの設定を行ってください。',
    bad_word: '合言葉が違います。ご案内の文面をご確認ください。',
    password_too_short: '新しいパスワードは4文字以上にしてください。',
    not_found: '対象が見つかりませんでした。画面を再読み込みしてください。',
    uid_not_found: 'このLINEアカウントはまだ登録されていません。運営までお問い合わせください。',
    quick_login_off: 'LINEからの簡単ログインは現在ご利用いただけません。',
    server_error: 'サーバー側でエラーが発生しました。'
  };
  function errMsg(res) {
    if (!res) return '通信に失敗しました。';
    return ERRORS[res.error] || ('エラー：' + (res.error || '不明') + (res.detail ? '（' + res.detail + '）' : ''));
  }

  /** VimeoのURLを埋め込み用に変換（限定公開リンクのハッシュにも対応） */
  function parseVimeo(url) {
    if (!url) return null;
    var u = String(url).trim();
    var m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-zA-Z]+))?/);
    if (!m) return null;
    var id = m[1];
    var h = m[2] || '';
    var hm = u.match(/[?&]h=([0-9a-zA-Z]+)/);
    if (hm) h = hm[1];
    var q = ['dnt=1', 'title=0', 'byline=0', 'portrait=0'];
    if (h) q.unshift('h=' + h);
    return { id: id, hash: h, embed: 'https://player.vimeo.com/video/' + id + '?' + q.join('&'), page: u };
  }

  /** 「0:13:44　オリエンテーション」の行を目次として切り出す */
  function parseMarks(note) {
    var marks = [], rest = [];
    String(note || '').split(/\r\n|\r|\n/).forEach(function (line) {
      var m = line.match(/^\s*(\d{1,2}):([0-5]\d)(?::([0-5]\d))?[\s　\t]+(.+?)\s*$/);
      if (m) {
        var sec = m[3] != null
          ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
          : Number(m[1]) * 60 + Number(m[2]);
        marks.push({ sec: sec, label: m[4], time: m[3] != null ? (m[1] + ':' + m[2] + ':' + m[3]) : (m[1] + ':' + m[2]) });
      } else if (line.trim()) {
        rest.push(line);
      }
    });
    return { marks: marks, rest: rest.join('\n') };
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /** テキスト内のURLをリンクにする（エスケープ後に適用） */
  function linkify(text) {
    return esc(text).replace(/(https?:\/\/[^\s<]+)/g, function (m) {
      return '<a href="' + m + '" target="_blank" rel="noopener">' + m + '</a>';
    });
  }

  /** '2026-08-17 23:59' → '8月17日' ／ 年が違えば '2025年8月17日' */
  function jpDate(s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(s || '');
    var y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    var thisYear = new Date().getFullYear();
    return (y === thisYear ? '' : y + '年') + mo + '月' + d + '日';
  }

  /** LINEからの流入で付いてくるUIDを拾って覚える（?uid= / ?lineuid=） */
  function pickUid() {
    var m = location.search.match(/[?&](?:uid|lineuid)=([^&]+)/);
    var uid = m ? decodeURIComponent(m[1]) : '';
    if (uid && !/^\[\[/.test(uid)) {           // [[uid]] が未置換のまま来た場合は無視
      try { localStorage.setItem('rj_uid', uid); } catch (e) {}
      return uid;
    }
    try { return localStorage.getItem('rj_uid') || ''; } catch (e) { return ''; }
  }

  /** 共通モーダル（受講生画面・運営画面の両方で使う） */
  function modal(title, bodyHtml, onSave, opts) {
    opts = opts || {};
    var host = document.createElement('div');
    host.innerHTML =
      '<div class="modal-bg"><div class="modal">'
      + '<h2>' + esc(title) + '</h2>'
      + '<div class="modal-body">' + bodyHtml + '</div>'
      + '<div class="msg err modal-msg"></div>'
      + '<div class="actions">'
      + (opts.cancelText === null ? '' : '<button class="btn ghost" data-cancel type="button">' + esc(opts.cancelText || 'キャンセル') + '</button>')
      + (onSave ? '<button class="btn" data-save type="button">' + esc(opts.saveText || '保存') + '</button>' : '')
      + '</div></div></div>';
    document.body.appendChild(host);
    var msgEl = host.querySelector('.modal-msg');
    var saveEl = host.querySelector('[data-save]');
    function close() { if (host.parentNode) host.parentNode.removeChild(host); }
    function setMsg(m) { msgEl.textContent = m || ''; }
    var cancelEl = host.querySelector('[data-cancel]');
    if (cancelEl) cancelEl.addEventListener('click', close);
    host.querySelector('.modal-bg').addEventListener('click', function (ev) {
      if (ev.target === ev.currentTarget) close();
    });
    if (saveEl) {
      saveEl.addEventListener('click', function () {
        setMsg('');
        saveEl.disabled = true;
        var label = saveEl.textContent;
        saveEl.innerHTML = '<span class="spinner"></span> 保存中…';
        Promise.resolve(onSave(close, setMsg, host))
          .catch(function (e) { setMsg(e.message); })
          .then(function () {
            if (host.parentNode) { saveEl.disabled = false; saveEl.textContent = label; }
          });
      });
    }
    return { host: host, close: close, setMsg: setMsg };
  }

  w.RJ = {
    api: api, store: store, errMsg: errMsg, parseVimeo: parseVimeo, parseMarks: parseMarks,
    esc: esc, linkify: linkify, jpDate: jpDate, pickUid: pickUid, modal: modal,
    CFG: CFG, MOCK: MOCK
  };

  // デモモードのときは、画面上部に必ず帯を出す（本番と取り違えないように）
  if (MOCK) {
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.createElement('div');
      bar.className = 'demo-bar';
      bar.innerHTML = '🧪 <b>デモモード</b>：ダミーデータです（本番の名簿は見ていません）'
        + '<a href="' + location.pathname + '">本番に切り替える</a>';
      document.body.insertBefore(bar, document.body.firstChild);
      document.body.classList.add('has-demo-bar');
    });
  }
})(window);
