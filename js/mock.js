/**
 * 凛穏塾 動画視聴アプリ ── デモ用のダミーデータ
 *
 * URLの末尾に ?mock=1 を付けたときだけ使われます（GASに繋がず画面だけ確認できる）。
 * 例：index.html?mock=1 ／ admin.html?mock=1
 * ログイン：demo@example.com / demo（運営は admin@example.com / demo）
 */
(function (w) {
  'use strict';

  function d(offsetDays) {
    var t = new Date();
    t.setDate(t.getDate() + offsetDays);
    return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  }

  var VIDEOS = [
    { row: 2,  course: '凛穏塾2.5期生', chapter: '入学式', title: '入学式', url: 'https://vimeo.com/1134091134', note: '0:00:01　入学式の流れ、運営メンバー紹介\n0:13:44　オリエンテーション\n0:44:15　凛穏塾の心得、学び方', tag: '', hidden: false, start: '', end: '' },
    { row: 3,  course: '凛穏塾2.5期生', chapter: 'オンライン講義動画', title: '第1回講義', url: 'https://vimeo.com/1132735832', note: '', tag: '', hidden: false, start: '', end: '' },
    { row: 4,  course: '凛穏塾2.5期生', chapter: 'オンライン講義動画', title: '第2回講義', url: 'https://vimeo.com/1136817063', note: '0:00:01　人生に起こるすべてのお悩み解決方法\n0:02:44　お釈迦様の教え／一切皆苦\n0:14:38　苦しみの乗り越え方', tag: '', hidden: false, start: '', end: d(5) },
    { row: 5,  course: '凛穏塾2.5期生', chapter: 'オンライン講義動画', title: '第3回講義（公開前の見え方）', url: 'https://vimeo.com/1142023382', note: '', tag: '', hidden: false, start: d(7), end: '' },
    { row: 6,  course: '凛穏塾2.5期生', chapter: 'ゆるカフェ質問会', title: '第１回(2025年12月4日)（期限切れの見え方）', url: 'https://vimeo.com/1143697859', note: '', tag: '', hidden: false, start: '', end: d(-3) },
    { row: 7,  course: '卒業生サロン', chapter: 'サロン限定特別講義', title: '家系学【お盆と供養】2026.8.12', url: 'https://vimeo.com/1217790887', note: '0:07:50　先祖供養\n0:10:31　供養\n0:19:00　三具足', tag: '', hidden: false, start: '', end: '' },
    { row: 8,  course: '卒業生サロン', chapter: '質問交流会', title: '第８回（2026年8月1日）', url: 'https://vimeo.com/1215034887', note: '0:01:33　本物の見抜き方\n0:11:16　とあるエピソード', tag: '', hidden: false, start: '', end: '' },
    { row: 9,  course: '凛穏塾2期生', chapter: '講義動画', title: '入学式＆第１回講義', url: 'https://vimeo.com/1129083086', note: '', tag: '', hidden: false, start: '', end: '' }
  ];
  var COURSES = [
    { row: 2, name: '凛穏塾2.5期生', tag: '凛穏塾2.5期生', order: 10, published: true, desc: '2.5期生の講義アーカイブです。' },
    { row: 3, name: '凛穏塾2期生',   tag: '凛穏塾2期生',   order: 20, published: true, desc: '' },
    { row: 4, name: '卒業生サロン',   tag: '卒業生サロン',   order: 30, published: true, desc: '卒業生サロン限定の講義です。' }
  ];
  var STUDENTS = [
    { row: 2, name: 'デモ 受講生', email: 'demo@example.com',  pass: 'demo', tags: '凛穏塾2.5期生,卒業生サロン', status: '有効', memo: 'デモ用', joined: '2026-08-17', uid: '' },
    { row: 3, name: 'デモ 運営',   email: 'admin@example.com', pass: 'demo', tags: 'admin',                     status: '有効', memo: 'デモ用', joined: '2026-08-17', uid: 'U0123456789abcdef' }
  ];
  var NEWS = [
    {
      row: 2, id: '2', date: d(0), title: '9月の勉強会（ゆるカフェ質問会）のご案内',
      body: '9月14日(日) 10:00〜、オンラインでゆるカフェ質問会を開催します。\nご参加の可否を下のボタンからお知らせください。\n\n当日のURLは前日にこちらのお知らせに追記します。',
      image: '', targets: ['凛穏塾2.5期生'], choices: ['参加します', '欠席します', 'あとで決めます'],
      published: true, pop: true, likes: 12
    },
    {
      row: 3, id: '1', date: d(-6), title: '動画の視聴期限についてのお願い',
      body: '一部の動画には視聴期限を設けています。⏳マークが出ているものはお早めにご視聴ください。\n詳しくは運営スタッフまで。',
      image: '', targets: [], choices: [], published: true, pop: false, likes: 34
    }
  ];
  var REPLIES = {
    '2': {
      total: 3,
      counts: { '参加します': 2, '欠席します': 1 },
      list: [
        { at: d(0) + ' 10:12:00', name: '受講生A', email: 'a@example.com', choice: '参加します' },
        { at: d(0) + ' 11:30:00', name: '受講生B', email: 'b@example.com', choice: '参加します' },
        { at: d(0) + ' 12:02:00', name: '受講生C', email: 'c@example.com', choice: '欠席します' }
      ]
    }
  };

  function todayStr() { return d(0); }

  /** 視聴開始／期限から状態を出す（GAS側と同じ考え方） */
  function windowState(start, end) {
    var res = { state: 'open', startAt: '', endAt: '', daysLeft: null };
    var now = new Date();
    if (start) {
      var st = new Date(start + 'T00:00:00');
      res.startAt = start + ' 00:00';
      if (now < st) { res.state = 'before'; return res; }
    }
    if (end) {
      var en = new Date(end + 'T23:59:59');
      res.endAt = end + ' 23:59';
      if (now > en) { res.state = 'expired'; return res; }
      res.daysLeft = Math.ceil((en.getTime() - now.getTime()) / 86400000);
    }
    return res;
  }

  function user(mail) {
    var s = STUDENTS.filter(function (x) { return x.email === mail; })[0];
    if (!s) return null;
    var tags = s.tags.split(',').map(function (t) { return t.trim(); }).filter(String);
    return { name: s.name, email: s.email, tags: tags, admin: tags.indexOf('admin') >= 0, uid: s.uid };
  }

  function buildCourses(u) {
    var out = [];
    COURSES.forEach(function (c) {
      if (!u.admin && u.tags.indexOf(c.tag) < 0) return;
      var chaps = [];
      VIDEOS.filter(function (v) { return v.course === c.name; }).forEach(function (v) {
        var win = windowState(v.start, v.end);
        var ch = chaps.filter(function (x) { return x.name === v.chapter; })[0];
        if (!ch) { ch = { name: v.chapter, videos: [] }; chaps.push(ch); }
        ch.videos.push({
          id: v.row, title: v.title, url: (win.state === 'open') ? v.url : '',
          note: v.note, state: win.state, startAt: win.startAt, endAt: win.endAt,
          daysLeft: win.daysLeft, hidden: v.hidden
        });
      });
      if (chaps.length) out.push({ name: c.name, desc: c.desc, chapters: chaps });
    });
    return out;
  }

  function newsFor(u) {
    return NEWS.filter(function (n) {
      if (!n.published) return u.admin;
      if (!n.targets.length) return true;
      return u.admin || n.targets.some(function (t) { return u.tags.indexOf(t) >= 0; });
    });
  }

  function adminVideos() {
    return VIDEOS.map(function (v) {
      var win = windowState(v.start, v.end);
      return {
        row: v.row, course: v.course, chapter: v.chapter, title: v.title, url: v.url, note: v.note,
        tag: v.tag, hidden: v.hidden, start: v.start, end: v.end,
        state: win.state, startAt: win.startAt, endAt: win.endAt, daysLeft: win.daysLeft
      };
    });
  }

  w.RJ_MOCK = function (action, p) {
    p = p || {};
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (action === 'ping') { resolve({ ok: true, msg: 'pong', version: 'mock' }); return; }
        if (action === 'login') {
          var u = user(String(p.email || '').trim().toLowerCase());
          var s = STUDENTS.filter(function (x) { return u && x.email === u.email; })[0];
          if (!u || !s || s.pass !== String(p.password || '').trim()) { resolve({ ok: false, error: 'bad_credentials' }); return; }
          resolve({ ok: true, token: 'mock:' + u.email, user: u });
          return;
        }
        if (action === 'uid_login') { resolve({ ok: false, error: 'quick_login_off' }); return; }
        if (action === 'first_check') {
          var fm = String(p.email || '').trim().toLowerCase();
          var fs = STUDENTS.filter(function (x) { return x.email === fm; })[0];
          if (!fs) { resolve({ ok: false, error: 'not_registered' }); return; }
          if (fs.firstSet) { resolve({ ok: false, error: 'already_set' }); return; }
          resolve({ ok: true, name: fs.name, needWord: false });
          return;
        }
        if (action === 'first_password') {
          var pm = String(p.email || '').trim().toLowerCase();
          var ps = STUDENTS.filter(function (x) { return x.email === pm; })[0];
          if (!ps) { resolve({ ok: false, error: 'not_registered' }); return; }
          if (ps.firstSet) { resolve({ ok: false, error: 'already_set' }); return; }
          ps.pass = String(p.password);
          ps.firstSet = '設定済み';
          resolve({ ok: true, token: 'mock:' + ps.email, user: user(ps.email) });
          return;
        }

        var mail = String(p.token || '').replace(/^mock:/, '');
        var me = user(mail);
        if (!me) { resolve({ ok: false, error: 'unauthorized' }); return; }

        if (action === 'data') {
          resolve({
            ok: true, user: me, courses: buildCourses(me), news: newsFor(me),
            myReplies: me.email === 'demo@example.com' ? {} : {}
          });
          return;
        }
        if (action === 'profile_save') {
          var row = STUDENTS.filter(function (x) { return x.email === me.email; })[0];
          if (p.password) {
            if (String(p.current || '') !== row.pass) { resolve({ ok: false, error: 'current_wrong' }); return; }
            row.pass = String(p.password);
          }
          if (p.name) row.name = String(p.name);
          resolve({ ok: true, user: user(me.email) });
          return;
        }
        if (action === 'news_like') {
          var n = NEWS.filter(function (x) { return x.id === String(p.id); })[0];
          if (!n) { resolve({ ok: false, error: 'not_found' }); return; }
          n.likes = Math.max(0, n.likes + (p.off ? -1 : 1));
          resolve({ ok: true, likes: n.likes });
          return;
        }
        if (action === 'news_reply') { resolve({ ok: true }); return; }
        if (action === 'line_link') { resolve({ ok: true }); return; }

        if (!me.admin) { resolve({ ok: false, error: 'forbidden' }); return; }
        if (action === 'admin_data') {
          resolve({
            ok: true, user: me, videos: adminVideos(), courses: COURSES,
            orphanCourses: [], students: STUDENTS, news: NEWS, replies: REPLIES, quickLogin: false
          });
          return;
        }
        resolve({ ok: false, error: 'server_error', detail: 'デモモードでは保存できません（' + action + '）' });
      }, 220);
    });
  };
  w.RJ_MOCK.today = todayStr;
})(window);
