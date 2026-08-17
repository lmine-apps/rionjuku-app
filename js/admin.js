/**
 * 凛穏塾 動画視聴アプリ ── 運営画面
 * 動画／お知らせ／閲覧者／コース設定を、すべてスプシに直接反映する
 */
(function () {
  'use strict';
  var api = RJ.api, store = RJ.store, esc = RJ.esc;
  var $ = function (id) { return document.getElementById(id); };

  var D = { videos: [], courses: [], students: [], news: [], replies: {}, orphanCourses: [], quickLogin: false };

  // ---------- ログイン ----------
  $('loginForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('loginBtn'), msg = $('loginMsg');
    msg.className = 'msg'; msg.textContent = '';
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> 確認中…';
    api('login', { email: $('email').value, password: $('pass').value })
      .then(function (res) {
        if (!res || !res.ok) { msg.className = 'msg err'; msg.textContent = RJ.errMsg(res); return; }
        if (!res.user.admin) { msg.className = 'msg err'; msg.textContent = '運営権限がありません（タグに admin が必要です）。'; return; }
        store.save(res.token, res.user);
        $('pass').value = '';
        load();
      })
      .catch(function (e) { msg.className = 'msg err'; msg.textContent = e.message; })
      .then(function () { btn.disabled = false; btn.textContent = 'ログイン'; });
  });

  $('logoutBtn').addEventListener('click', function () { store.clear(); location.reload(); });
  $('viewBtn').addEventListener('click', function () {
    location.href = 'index.html' + (RJ.MOCK ? '?mock=1' : '');
  });
  $('reloadBtn').addEventListener('click', function () { load(); });

  function showLogin(message) {
    $('scApp').classList.add('hidden');
    $('scLogin').classList.remove('hidden');
    if (message) { $('loginMsg').className = 'msg err'; $('loginMsg').textContent = message; }
  }

  // ---------- データ読み込み ----------
  function load() {
    if (!store.token()) { showLogin(); return; }
    api('admin_data', { token: store.token() })
      .then(function (res) {
        if (!res || !res.ok) {
          if (res && (res.error === 'unauthorized' || res.error === 'forbidden')) store.clear();
          showLogin(RJ.errMsg(res));
          return;
        }
        D.videos = res.videos || [];
        D.courses = res.courses || [];
        D.students = res.students || [];
        D.news = res.news || [];
        D.replies = res.replies || {};
        D.orphanCourses = res.orphanCourses || [];
        D.quickLogin = !!res.quickLogin;
        $('scLogin').classList.add('hidden');
        $('scApp').classList.remove('hidden');
        $('who').textContent = res.user.name + ' さん（運営）';
        renderNotice();
        renderCourseFilter();
        renderVideos();
        renderNews();
        renderStudents();
        renderCourses();
        openFromQuery();
      })
      .catch(function (e) { showLogin(e.message); });
  }

  function renderNotice() {
    var msgs = [];
    if (D.orphanCourses.length) {
      msgs.push('コース設定に未登録のコースがあります：' + D.orphanCourses.map(esc).join('、')
        + '（「📚 コース設定」タブで登録すると、タグでの出し分けができます）');
    }
    var noTag = D.students.filter(function (s) { return !s.tags; }).length;
    if (noTag) msgs.push('タグが空の閲覧者が ' + noTag + ' 名います（このままだと何も視聴できません）。');
    var noPass = D.students.filter(function (s) { return !s.pass; }).length;
    if (noPass) msgs.push('パスワードが空の閲覧者が ' + noPass + ' 名います（ログインできません）。');
    if (D.quickLogin) msgs.push('LINE簡単ログインが<b>有効</b>です（UIDだけでログインできます）。');
    if (msgs.length) { $('notice').innerHTML = msgs.join('<br>'); $('notice').classList.remove('hidden'); }
    else $('notice').classList.add('hidden');
  }

  /** 受講生ページのメニューから ?open=news / ?open=video で来たとき、その入力画面を直接開く */
  var openedFromQuery = false;
  function openFromQuery() {
    if (openedFromQuery) return;
    var m = location.search.match(/[?&]open=(news|video)/);
    if (!m) return;
    openedFromQuery = true;
    showTab(m[1] === 'news' ? 'news' : 'video');
    setTimeout(function () { if (m[1] === 'news') newsModal(null); else videoModal(null); }, 60);
  }
  function showTab(name) {
    Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (b) {
      b.classList.toggle('on', b.dataset.tab === name);
    });
    TABS.forEach(function (t) {
      $('pane' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('hidden', t !== name);
    });
  }

  // ---------- タブ ----------
  var TABS = ['video', 'news', 'student', 'course'];
  Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      TABS.forEach(function (t) {
        $('pane' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('hidden', t !== b.dataset.tab);
      });
    });
  });

  // ---------- 動画 ----------
  function courseNames() {
    var names = D.courses.map(function (c) { return c.name; });
    D.videos.forEach(function (v) { if (names.indexOf(v.course) < 0) names.push(v.course); });
    return names;
  }
  function allTags() {
    var t = [];
    D.courses.forEach(function (c) { if (t.indexOf(c.tag) < 0) t.push(c.tag); });
    D.students.forEach(function (s) {
      s.tags.split(',').forEach(function (x) {
        x = x.trim();
        if (x && x !== 'admin' && t.indexOf(x) < 0) t.push(x);
      });
    });
    return t;
  }
  function renderCourseFilter() {
    var cur = $('fCourse').value;
    $('fCourse').innerHTML = '<option value="">すべてのコース</option>'
      + courseNames().map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + '</option>'; }).join('');
    if (cur) $('fCourse').value = cur;
  }
  $('fCourse').addEventListener('change', renderVideos);
  $('fWord').addEventListener('input', renderVideos);

  function stateLabel(v) {
    if (v.hidden) return '<span class="pill off">非公開</span>';
    if (v.state === 'before') return '<span class="pill wait">' + esc(RJ.jpDate(v.startAt)) + ' 公開</span>';
    if (v.state === 'expired') return '<span class="pill off">期限切れ</span>';
    if (v.daysLeft != null) return '<span class="pill soon">残り' + v.daysLeft + '日</span>';
    return '<span class="pill ok">公開中</span>';
  }

  function renderVideos() {
    var c = $('fCourse').value, w = $('fWord').value.trim();
    var rows = D.videos.filter(function (v) {
      if (c && v.course !== c) return false;
      if (w && (v.title || '').indexOf(w) < 0 && (v.chapter || '').indexOf(w) < 0) return false;
      return true;
    });
    $('vCount').textContent = '全' + D.videos.length + '本中 ' + rows.length + '本を表示';
    if (!rows.length) { $('videoTable').innerHTML = '<div class="empty">該当する動画がありません。</div>'; return; }

    $('videoTable').innerHTML = '<div class="scrollx"><table class="grid"><thead><tr>'
      + '<th>行</th><th>コース</th><th>チャプター</th><th>タイトル</th><th>動画URL</th>'
      + '<th>視聴開始</th><th>視聴期限</th><th>タグ</th><th>状態</th><th></th>'
      + '</tr></thead><tbody>'
      + rows.map(function (v) {
        var vm = RJ.parseVimeo(v.url);
        return '<tr>'
          + '<td class="narrow">' + v.row + '</td>'
          + '<td>' + esc(v.course) + '</td>'
          + '<td>' + esc(v.chapter) + '</td>'
          + '<td>' + esc(v.title || '（無題）') + (v.note ? '<div class="hint">補足あり</div>' : '') + '</td>'
          + '<td>' + (vm ? '<a href="' + esc(v.url) + '" target="_blank" rel="noopener">Vimeo ' + esc(vm.id) + '</a>'
                        : (v.url ? '<span class="hint">Vimeo以外：' + esc(v.url) + '</span>' : '<span class="hint">なし</span>')) + '</td>'
          + '<td class="narrow">' + (v.start ? esc(v.start) : '<span class="hint">—</span>') + '</td>'
          + '<td class="narrow">' + (v.end ? esc(v.end) : '<span class="hint">無期限</span>') + '</td>'
          + '<td>' + (v.tag ? '<span class="tag-chip">' + esc(v.tag) + '</span>' : '<span class="hint">コース設定に従う</span>') + '</td>'
          + '<td class="narrow">' + stateLabel(v) + '</td>'
          + '<td class="narrow">'
          + '<button class="mini" data-edit="' + v.row + '" type="button">編集</button>'
          + '<button class="mini danger" data-del="' + v.row + '" type="button">削除</button>'
          + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    Array.prototype.forEach.call($('videoTable').querySelectorAll('[data-edit]'), function (b) {
      b.addEventListener('click', function () { videoModal(findVideo(Number(b.dataset.edit))); });
    });
    Array.prototype.forEach.call($('videoTable').querySelectorAll('[data-del]'), function (b) {
      b.addEventListener('click', function () { deleteVideo(findVideo(Number(b.dataset.del))); });
    });
  }
  function findVideo(row) { return D.videos.filter(function (v) { return v.row === row; })[0]; }

  $('addVideoBtn').addEventListener('click', function () { videoModal(null); });

  function videoModal(v) {
    var isNew = !v;
    var chapters = [];
    D.videos.forEach(function (x) {
      if (v && x.course !== v.course) return;
      if (chapters.indexOf(x.chapter) < 0) chapters.push(x.chapter);
    });
    var m = RJ.modal(
      (isNew ? '動画を追加' : '動画を編集（' + v.row + '行目）'),
      '<div class="field"><label>コース</label>'
      + '<select id="mCourse">' + courseNames().map(function (n) {
          return '<option value="' + esc(n) + '"' + (v && v.course === n ? ' selected' : '') + '>' + esc(n) + '</option>';
        }).join('') + '<option value="__new">＋ 新しいコースを作る</option></select>'
      + '<input id="mCourseNew" class="hidden" type="text" placeholder="新しいコース名" style="margin-top:8px">'
      + '<div class="hint">新しいコースを作ったら「📚 コース設定」でタグを設定してください。</div></div>'
      + '<div class="field"><label>チャプター（章）</label>'
      + '<input id="mChapter" type="text" list="chapList" value="' + esc(v ? v.chapter : '') + '" placeholder="例：オンライン講義動画">'
      + '<datalist id="chapList">' + chapters.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist></div>'
      + '<div class="field"><label>レッスンタイトル</label>'
      + '<input id="mTitle" type="text" value="' + esc(v ? v.title : '') + '" placeholder="例：第7回講義"></div>'
      + '<div class="field"><label>動画URL（Vimeo）</label>'
      + '<input id="mUrl" type="url" value="' + esc(v ? v.url : '') + '" placeholder="https://vimeo.com/1234567890">'
      + '<div class="hint">限定公開リンク（https://vimeo.com/番号/ハッシュ）もそのまま貼ればOKです。</div></div>'
      + '<div class="row2">'
      + '<div class="field"><label>視聴開始（任意）</label>'
      + '<input id="mStart" type="text" value="' + esc(v ? v.start : '') + '" placeholder="2026-09-01">'
      + '<div class="hint">空欄＝すぐ観られる</div></div>'
      + '<div class="field"><label>視聴期限（任意）</label>'
      + '<input id="mEnd" type="text" value="' + esc(v ? v.end : '') + '" placeholder="2026-12-31">'
      + '<div class="hint">空欄＝無期限。その日の23:59まで</div></div>'
      + '</div>'
      + '<div class="field"><label>補足＆タイム</label>'
      + '<textarea id="mNote" rows="6" placeholder="0:00:01　オープニング&#10;0:12:30　本編">' + esc(v ? v.note : '') + '</textarea>'
      + '<div class="hint">「0:12:30　見出し」の形で書いた行は、視聴ページで目次ボタンになります。</div></div>'
      + '<div class="row2">'
      + '<div class="field"><label>この動画だけのタグ（任意）</label>'
      + '<input id="mTag" type="text" value="' + esc(v ? v.tag : '') + '" placeholder="空欄＝コース設定のタグ"></div>'
      + '<div class="field"><label>公開状態</label>'
      + '<select id="mHidden"><option value="">公開</option><option value="1"' + (v && v.hidden ? ' selected' : '') + '>非公開（運営のみ）</option></select></div>'
      + '</div>',
      function (close, setMsg) {
        var course = $('mCourse').value === '__new' ? $('mCourseNew').value.trim() : $('mCourse').value;
        if (!course) { setMsg('コース名を入力してください。'); return; }
        if (!$('mTitle').value.trim() && !$('mUrl').value.trim()) { setMsg('タイトルか動画URLを入力してください。'); return; }
        var p = {
          token: store.token(),
          course: course,
          chapter: $('mChapter').value.trim(),
          title: $('mTitle').value.trim(),
          url: $('mUrl').value.trim(),
          note: $('mNote').value,
          tag: $('mTag').value.trim(),
          hidden: $('mHidden').value,
          start: $('mStart').value.trim(),
          end: $('mEnd').value.trim()
        };
        if (!isNew) { p.row = v.row; p.expectTitle = v.title; }
        return api(isNew ? 'video_add' : 'video_update', p).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          close(); load();
        });
      }
    );
    $('mCourse').addEventListener('change', function () {
      $('mCourseNew').classList.toggle('hidden', $('mCourse').value !== '__new');
    });
    if (!v && D.courses.length) $('mCourse').value = D.courses[0].name;
    return m;
  }

  function deleteVideo(v) {
    if (!v) return;
    if (!confirm('この動画をスプレッドシートから削除します。よろしいですか？\n\n' + (v.title || '（無題）'))) return;
    api('video_delete', { token: store.token(), row: v.row, expectTitle: v.title })
      .then(function (res) {
        if (!res || !res.ok) { alert(RJ.errMsg(res)); return; }
        load();
      })
      .catch(function (e) { alert(e.message); });
  }

  // ---------- お知らせ ----------
  $('addNewsBtn').addEventListener('click', function () { newsModal(null); });

  function renderNews() {
    $('nCount').textContent = D.news.length ? '全' + D.news.length + '件' : '';
    if (!D.news.length) {
      $('newsTable').innerHTML = '<div class="empty">お知らせはまだありません。「＋ お知らせを作成」から投稿できます。</div>';
      return;
    }
    $('newsTable').innerHTML = '<div class="scrollx"><table class="grid"><thead><tr>'
      + '<th>id</th><th>日付</th><th>見出し</th><th>宛先タグ</th><th>アンケート</th><th>♥</th><th>状態</th><th></th>'
      + '</tr></thead><tbody>'
      + D.news.map(function (n) {
        var rep = D.replies[n.id];
        var repText = '<span class="hint">—</span>';
        if (n.choices.length) {
          repText = rep
            ? Object.keys(rep.counts).map(function (k) { return esc(k) + '：' + rep.counts[k] + '名'; }).join('<br>')
            : '<span class="hint">回答なし</span>';
        }
        return '<tr>'
          + '<td class="narrow">' + esc(n.id) + '</td>'
          + '<td class="narrow">' + esc(n.date) + '</td>'
          + '<td>' + esc(n.title) + (n.pop ? '<div class="hint">ログイン時ポップ表示</div>' : '') + '</td>'
          + '<td>' + (n.targets.length ? n.targets.map(function (t) { return '<span class="tag-chip">' + esc(t) + '</span>'; }).join('') : '<span class="hint">全員</span>') + '</td>'
          + '<td>' + repText + '</td>'
          + '<td class="narrow">' + n.likes + '</td>'
          + '<td class="narrow">' + (n.published ? '<span class="pill ok">公開</span>' : '<span class="pill off">非公開</span>') + '</td>'
          + '<td class="narrow">'
          + '<button class="mini" data-nedit="' + esc(n.id) + '" type="button">編集</button>'
          + (n.choices.length && rep ? '<button class="mini" data-nrep="' + esc(n.id) + '" type="button">回答一覧</button>' : '')
          + '<button class="mini danger" data-ndel="' + esc(n.id) + '" type="button">削除</button>'
          + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    Array.prototype.forEach.call($('newsTable').querySelectorAll('[data-nedit]'), function (b) {
      b.addEventListener('click', function () { newsModal(findNews(b.dataset.nedit)); });
    });
    Array.prototype.forEach.call($('newsTable').querySelectorAll('[data-ndel]'), function (b) {
      b.addEventListener('click', function () { deleteNews(findNews(b.dataset.ndel)); });
    });
    Array.prototype.forEach.call($('newsTable').querySelectorAll('[data-nrep]'), function (b) {
      b.addEventListener('click', function () { showReplies(findNews(b.dataset.nrep)); });
    });
  }
  function findNews(id) { return D.news.filter(function (n) { return n.id === String(id); })[0]; }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function newsModal(n) {
    var isNew = !n;
    var tags = allTags();
    RJ.modal(
      isNew ? 'お知らせを作成' : 'お知らせを編集（id ' + n.id + '）',
      '<div class="row2">'
      + '<div class="field"><label>日付</label><input id="nDate" type="text" value="' + esc(n ? n.date : today()) + '" placeholder="2026-08-17"></div>'
      + '<div class="field"><label>公開状態</label><select id="nPub">'
      + '<option value="1"' + (!n || n.published ? ' selected' : '') + '>公開</option>'
      + '<option value="0"' + (n && !n.published ? ' selected' : '') + '>非公開（下書き）</option></select></div>'
      + '</div>'
      + '<div class="field"><label>見出し</label><input id="nTitle" type="text" value="' + esc(n ? n.title : '') + '" placeholder="例：9月の勉強会のご案内"></div>'
      + '<div class="field"><label>本文</label>'
      + '<textarea id="nBody" rows="7" placeholder="改行はそのまま表示されます。URLは自動でリンクになります。">' + esc(n ? n.body : '') + '</textarea></div>'
      + '<div class="field"><label>画像URL（任意）</label><input id="nImage" type="url" value="' + esc(n ? n.image : '') + '" placeholder="https://…"></div>'
      + '<div class="field"><label>誰に見せるか（宛先タグ・カンマ区切り／空欄＝全員）</label>'
      + '<input id="nTarget" type="text" value="' + esc(n ? n.targets.join(',') : '') + '" placeholder="例：凛穏塾2.5期生,卒業生サロン">'
      + '<div class="hint">使えるタグ：' + (tags.length ? tags.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('、') : '（コース設定を先に登録してください）') + '</div></div>'
      + '<div class="field"><label>アンケートの選択肢（任意・カンマ区切り）</label>'
      + '<input id="nChoices" type="text" value="' + esc(n ? n.choices.join(',') : '') + '" placeholder="例：参加します,欠席します,あとで決めます">'
      + '<div class="hint">入れると、お知らせの下にボタンが出て回答が「お知らせ回答」タブに記録されます。</div></div>'
      + '<div class="field"><label><input id="nPop" type="checkbox"' + (n && n.pop ? ' checked' : '') + '> ログイン時にポップアップで見せる</label></div>',
      function (close, setMsg) {
        var title = $('nTitle').value.trim();
        if (!title) { setMsg('見出しを入力してください。'); return; }
        var p = {
          token: store.token(),
          date: $('nDate').value.trim(),
          title: title,
          body: $('nBody').value,
          image: $('nImage').value.trim(),
          targets: $('nTarget').value.trim(),
          choices: $('nChoices').value.trim(),
          published: $('nPub').value,
          pop: $('nPop').checked ? '1' : '0'
        };
        if (!isNew) p.id = n.id;
        return api('news_save', p).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          close(); load();
        });
      }
    );
  }

  function deleteNews(n) {
    if (!n) return;
    if (!confirm('このお知らせを削除します。よろしいですか？\n\n' + n.title)) return;
    api('news_delete', { token: store.token(), id: n.id })
      .then(function (res) {
        if (!res || !res.ok) { alert(RJ.errMsg(res)); return; }
        load();
      })
      .catch(function (e) { alert(e.message); });
  }

  function showReplies(n) {
    var rep = D.replies[n.id];
    if (!rep) return;
    RJ.modal('回答一覧：' + n.title,
      '<div class="hint" style="margin-bottom:10px">合計 ' + rep.total + '名</div>'
      + '<div class="scrollx"><table class="grid"><thead><tr><th>日時</th><th>名前</th><th>メール</th><th>回答</th></tr></thead><tbody>'
      + rep.list.map(function (r) {
        return '<tr><td class="narrow">' + esc(r.at) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.email) + '</td><td>' + esc(r.choice) + '</td></tr>';
      }).join('') + '</tbody></table></div>',
      null, { cancelText: '閉じる' });
  }

  // ---------- 閲覧者 ----------
  $('sWord').addEventListener('input', renderStudents);
  $('addStudentBtn').addEventListener('click', function () { studentModal(null); });

  function renderStudents() {
    var w = $('sWord').value.trim().toLowerCase();
    var rows = D.students.filter(function (s) {
      if (!w) return true;
      return (s.name + ' ' + s.email + ' ' + s.tags).toLowerCase().indexOf(w) >= 0;
    });
    $('sCount').textContent = '全' + D.students.length + '名中 ' + rows.length + '名を表示';
    if (!rows.length) { $('studentTable').innerHTML = '<div class="empty">閲覧者がまだ登録されていません。</div>'; return; }

    $('studentTable').innerHTML = '<div class="scrollx"><table class="grid"><thead><tr>'
      + '<th>行</th><th>名前</th><th>メールアドレス</th><th>パスワード</th><th>タグ（視聴できるコース）</th><th>状態</th><th>LINE</th><th></th>'
      + '</tr></thead><tbody>'
      + rows.map(function (s) {
        return '<tr>'
          + '<td class="narrow">' + s.row + '</td>'
          + '<td>' + esc(s.name) + '</td>'
          + '<td>' + esc(s.email) + '</td>'
          + '<td class="narrow"><code>' + esc(s.pass || '—') + '</code></td>'
          + '<td>' + (s.tags ? s.tags.split(',').map(function (t) { return '<span class="tag-chip">' + esc(t.trim()) + '</span>'; }).join('') : '<span class="hint">未設定</span>') + '</td>'
          + '<td class="narrow">' + (/停止|無効|退会/.test(s.status) ? '<span class="pill off">停止</span>' : '<span class="pill ok">有効</span>') + '</td>'
          + '<td class="narrow">' + (s.uid ? '<span class="pill ok">連携済</span>' : '<span class="hint">—</span>') + '</td>'
          + '<td class="narrow">'
          + '<button class="mini" data-sedit="' + s.row + '" type="button">編集</button>'
          + '<button class="mini danger" data-sdel="' + s.row + '" type="button">削除</button>'
          + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    Array.prototype.forEach.call($('studentTable').querySelectorAll('[data-sedit]'), function (b) {
      b.addEventListener('click', function () { studentModal(findStudent(Number(b.dataset.sedit))); });
    });
    Array.prototype.forEach.call($('studentTable').querySelectorAll('[data-sdel]'), function (b) {
      b.addEventListener('click', function () { deleteStudent(findStudent(Number(b.dataset.sdel))); });
    });
  }
  function findStudent(row) { return D.students.filter(function (s) { return s.row === row; })[0]; }

  function studentModal(s) {
    var isNew = !s;
    var tags = allTags();
    RJ.modal(
      isNew ? '閲覧者を追加' : '閲覧者を編集（' + s.row + '行目）',
      '<div class="row2">'
      + '<div class="field"><label>お名前</label><input id="mName" type="text" value="' + esc(s ? s.name : '') + '"></div>'
      + '<div class="field"><label>状態</label><select id="mStatus">'
      + '<option value="有効"' + (!s || !/停止|無効|退会/.test(s.status) ? ' selected' : '') + '>有効</option>'
      + '<option value="停止"' + (s && /停止|無効|退会/.test(s.status) ? ' selected' : '') + '>停止（ログイン不可）</option>'
      + '</select></div></div>'
      + '<div class="field"><label>メールアドレス</label><input id="mEmail" type="email" value="' + esc(s ? s.email : '') + '"></div>'
      + '<div class="field"><label>パスワード</label>'
      + '<input id="mPass" type="text" value="' + esc(s ? s.pass : '') + '" placeholder="' + (isNew ? '例：rinon2026' : '変更しない場合は空欄でもOK') + '">'
      + '<button class="mini" id="genPass" type="button" style="margin-top:6px">自動生成</button>'
      + '<div class="hint">閲覧者にお伝えするパスワードです（スプレッドシートにそのまま入ります）。</div></div>'
      + '<div class="field"><label>タグ（カンマ区切り）</label>'
      + '<input id="mTags" type="text" value="' + esc(s ? s.tags : '') + '" placeholder="例：凛穏塾2.5期生,卒業生サロン">'
      + '<div class="hint">使えるタグ：' + (tags.length ? tags.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('、') : '（コース設定を先に登録してください）')
      + '<br>運営権限を与える場合は <b>admin</b> を追加します。</div></div>'
      + '<div class="row2">'
      + '<div class="field"><label>メモ</label><input id="mMemo" type="text" value="' + esc(s ? s.memo : '') + '"></div>'
      + '<div class="field"><label>LINE UID</label><input id="mUid" type="text" value="' + esc(s ? s.uid : '') + '" placeholder="LINEから来ると自動で入ります"></div>'
      + '</div>',
      function (close, setMsg) {
        var p = {
          token: store.token(),
          name: $('mName').value.trim(),
          email: $('mEmail').value.trim(),
          password: $('mPass').value.trim(),
          tags: $('mTags').value.trim(),
          status: $('mStatus').value,
          memo: $('mMemo').value.trim(),
          uid: $('mUid').value.trim()
        };
        if (!p.email) { setMsg('メールアドレスを入力してください。'); return; }
        if (isNew && !p.password) { setMsg('パスワードを入力（または自動生成）してください。'); return; }
        if (!isNew) p.row = s.row;
        return api('student_save', p).then(function (res) {
          if (!res || !res.ok) { setMsg(RJ.errMsg(res)); return; }
          close(); load();
        });
      }
    );
    $('genPass').addEventListener('click', function () {
      var chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      var out = 'rj-';
      for (var i = 0; i < 6; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
      $('mPass').value = out;
    });
  }

  function deleteStudent(s) {
    if (!s) return;
    if (!confirm('この閲覧者を削除します。よろしいですか？\n\n' + s.name + '（' + s.email + '）')) return;
    api('student_delete', { token: store.token(), row: s.row, expectEmail: s.email })
      .then(function (res) {
        if (!res || !res.ok) { alert(RJ.errMsg(res)); return; }
        load();
      })
      .catch(function (e) { alert(e.message); });
  }

  // ---------- コース設定 ----------
  function renderCourses() {
    var list = D.courses.slice();
    D.orphanCourses.forEach(function (n) {
      list.push({ row: 0, name: n, tag: n, order: 9999, published: true, desc: '', isNew: true });
    });
    if (!list.length) { $('courseTable').innerHTML = '<div class="empty">コースがありません。</div>'; return; }

    $('courseTable').innerHTML = '<div class="scrollx"><table class="grid"><thead><tr>'
      + '<th>コース名</th><th>タグ</th><th>並び順</th><th>公開</th><th>説明</th><th></th>'
      + '</tr></thead><tbody>'
      + list.map(function (c, i) {
        var n = D.videos.filter(function (v) { return v.course === c.name; }).length;
        var people = D.students.filter(function (s) {
          return s.tags.split(',').some(function (t) { return t.trim() === c.tag; });
        }).length;
        return '<tr data-ci="' + i + '">'
          + '<td>' + esc(c.name) + '<div class="hint">動画' + n + '本／視聴できる人' + people + '名' + (c.isNew ? '・未登録' : '') + '</div></td>'
          + '<td><input class="cTag" type="text" value="' + esc(c.tag) + '" style="width:150px"></td>'
          + '<td><input class="cOrder" type="number" value="' + esc(c.order) + '" style="width:80px"></td>'
          + '<td><select class="cPub">'
          + '<option value="1"' + (c.published ? ' selected' : '') + '>公開</option>'
          + '<option value="0"' + (!c.published ? ' selected' : '') + '>非公開</option></select></td>'
          + '<td><input class="cDesc" type="text" value="' + esc(c.desc) + '" style="width:100%"></td>'
          + '<td class="narrow"><button class="mini" data-csave="' + i + '" type="button">保存</button></td>'
          + '</tr>';
      }).join('') + '</tbody></table></div>';

    Array.prototype.forEach.call($('courseTable').querySelectorAll('[data-csave]'), function (b) {
      b.addEventListener('click', function () {
        var tr = b.closest('tr');
        var c = list[Number(b.dataset.csave)];
        b.disabled = true; b.textContent = '保存中…';
        api('course_save', {
          token: store.token(),
          name: c.name,
          tag: tr.querySelector('.cTag').value.trim(),
          order: tr.querySelector('.cOrder').value,
          published: tr.querySelector('.cPub').value,
          desc: tr.querySelector('.cDesc').value.trim()
        }).then(function (res) {
          if (!res || !res.ok) { alert(RJ.errMsg(res)); b.disabled = false; b.textContent = '保存'; return; }
          load();
        }).catch(function (e) { alert(e.message); b.disabled = false; b.textContent = '保存'; });
      });
    });
  }

  // ---------- 開始 ----------
  if (!RJ.CFG.GAS_URL && !RJ.MOCK) {
    $('loginMsg').className = 'msg err';
    $('loginMsg').textContent = 'セットアップ未完了：js/config.js の GAS_URL を設定してください。';
  } else {
    if (RJ.MOCK) {
      $('loginMsg').className = 'msg ok';
      $('loginMsg').textContent = 'デモモード：admin@example.com / demo でお試しいただけます（保存はできません）。';
    }
    load();
  }
})();
