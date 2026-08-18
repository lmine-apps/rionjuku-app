/**
 * 凛穏塾 受講生用 動画視聴アプリ ── GAS門番（バックエンド）
 * VERSION: v1.5.0
 * DATE   : 2026-08-17
 *
 * 役割：スプレッドシート（動画一覧／受講生／コース設定／お知らせ）への唯一の窓口。
 *       ブラウザはスプシを直接読まない。ログイン照合もここで行い、
 *       その受講生のタグ・視聴期限で観られる動画だけを返す。
 *
 * ★スプシは「リンクを知っている全員」共有をOFFにすること（パスワードが平文で入るため）。
 *
 * v1.5.0 追加：視聴開始日／視聴期限（動画ごと）・お知らせ（宛先タグ・いいね・アンケート）
 *              アカウント設定（表示名・パスワード変更）・LINE UIDの回収・uidログイン（既定OFF）
 */

// ===== 設定 =====
const SHEET_ID   = '1HGULFOFI5MkefWsSD3S7XBOiYZQ2mQDKxJDIKjOeZxI'; // 凛穏塾動画一覧
const SH_VIDEO   = '動画一覧';     // 見つからなければ先頭タブを使う
const SH_STUDENT = '閲覧者一覧';   // 旧名「受講生」でも動くようにしてある
const SH_COURSE  = 'コース設定';
const SH_NEWS    = 'お知らせ';
const SH_REPLY   = 'お知らせ回答';
const SH_LOG     = 'ログイン履歴';
const SH_PUSH    = 'プッシュ';      // 通知の宛先（端末トークン）
const TOKEN_DAYS = 30;             // ログイン保持日数
const MAX_FAIL   = 10;             // 同一メールの連続失敗許容数（10分間）
const TZ         = 'Asia/Tokyo';

// 動画一覧シートの列（1始まり）
const V_COURSE = 1; // A コース名
const V_CHAP   = 2; // B チャプター名
const V_TITLE  = 3; // C レッスンタイトル
const V_URL    = 4; // D 動画ＵＲＬ
const V_NOTE   = 5; // E 補足＆タイム
const V_TAG    = 6; // F タグ（空欄ならコース設定のタグを継承）
const V_START  = 7; // G 視聴開始（空欄＝すぐ観られる）
const V_END    = 8; // H 視聴終了（空欄＝無期限。その日の23:59まで）
const V_HIDE   = 9; // I 非公開（"非公開" と書くと受講生には出ない）
const V_BLOCK  = 10; // J 追加コンテンツ（[文章]/[画像]/[音声] を並べたもの）
const V_COLS   = 10;

// 受講生シートの列
const S_NAME = 1, S_MAIL = 2, S_PASS = 3, S_TAGS = 4, S_STATUS = 5, S_MEMO = 6, S_JOINED = 7,
      S_UID = 8, S_FIRST = 9;   // I列＝初回パスワード設定の日時（空欄＝まだ設定していない）
const S_COLS = 9;

// お知らせシートの列
const N_ID = 1, N_DATE = 2, N_TITLE = 3, N_BODY = 4, N_IMAGE = 5, N_TARGET = 6,
      N_CHOICES = 7, N_PUB = 8, N_POP = 9, N_LIKES = 10;
const N_COLS = 10;

// ===== ルーター =====
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ping') return out_({ ok: true, msg: 'pong', version: 'v1.5.0' });
  return out_({ ok: false, error: 'post_only' });
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'ping':          return out_({ ok: true, msg: 'pong', version: 'v1.5.0' });
      case 'login':         return out_(apiLogin_(p));
      case 'uid_login':     return out_(apiUidLogin_(p));
      case 'first_check':   return out_(apiFirstCheck_(p));
      case 'first_password':return out_(apiFirstPassword_(p));
      case 'data':          return out_(apiData_(p));
      case 'profile_save':  return out_(apiProfileSave_(p));
      case 'line_link':     return out_(apiLineLink_(p));
      case 'news_like':     return out_(apiNewsLike_(p));
      case 'news_reply':    return out_(apiNewsReply_(p));
      case 'push_reg':      return out_(apiPushReg_(p));
      case 'push_unreg':    return out_(apiPushUnreg_(p));
      case 'news_push':     return out_(apiNewsPush_(p));
      case 'admin_data':    return out_(apiAdminData_(p));
      case 'video_add':     return out_(apiVideoAdd_(p));
      case 'video_update':  return out_(apiVideoUpdate_(p));
      case 'video_delete':  return out_(apiVideoDelete_(p));
      case 'student_save':  return out_(apiStudentSave_(p));
      case 'student_delete':return out_(apiStudentDelete_(p));
      case 'course_save':   return out_(apiCourseSave_(p));
      case 'news_save':     return out_(apiNewsSave_(p));
      case 'news_delete':   return out_(apiNewsDelete_(p));
      case 'setup':         return out_(apiSetup_(p));
      default:              return out_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return out_({ ok: false, error: 'server_error', detail: String(err && err.message || err) });
  }
}

// ===== 共通ヘルパー =====
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function ss_() { return SpreadsheetApp.openById(SHEET_ID); }
function videoSheet_() {
  const ss = ss_();
  return ss.getSheetByName(SH_VIDEO) || ss.getSheets()[0];
}
function sheetOrCreate_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function s_(v) { return String(v == null ? '' : v).trim(); }
function email_(v) { return s_(v).toLowerCase(); }
function tags_(v) {
  return s_(v).split(/[,、\s\/]+/).map(function (t) { return t.trim(); }).filter(String);
}
function hasTag_(list, t) {
  const low = String(t).toLowerCase();
  return list.some(function (x) { return String(x).toLowerCase() === low; });
}
function anyTag_(list, needles) {
  return needles.some(function (n) { return hasTag_(list, n); });
}
function nowStr_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function fmt_(d) { return Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm'); }
function isOn_(v) { return /^(1|on|yes|公開|表示|する|true|✓|◯|○)$/i.test(s_(v)); }
function isOff_(v) { return /^(0|off|no|非公開|停止|しない|false|×)$/i.test(s_(v)); }

/** 「2026-08-17」「2026/8/17」「2026年8月17日」「8月17日」「2026-08-17 10:00」などを日付にする */
function parseDateParts_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    const hasTime = !(v.getHours() === 0 && v.getMinutes() === 0);
    return { date: v, hasTime: hasTime };
  }
  let s = s_(v);
  if (!s) return null;
  s = s.replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
       .replace(/[年月]/g, '-').replace(/日/g, ' ')
       .replace(/[／\/\.]/g, '-')
       .replace(/\s+/g, ' ').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) {
    return {
      date: new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0, 0),
      hasTime: !!m[4]
    };
  }
  m = s.match(/^(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) {
    return {
      date: new Date(new Date().getFullYear(), +m[1] - 1, +m[2], m[3] ? +m[3] : 0, m[4] ? +m[4] : 0, 0),
      hasTime: !!m[3]
    };
  }
  return null;
}

/** 視聴開始／視聴期限から現在の状態を出す */
function windowState_(startVal, endVal) {
  const now = new Date();
  const st = parseDateParts_(startVal);
  const en = parseDateParts_(endVal);
  let startAt = st ? st.date : null;
  let endAt = null;
  if (en) {
    endAt = en.hasTime ? en.date
      : new Date(en.date.getFullYear(), en.date.getMonth(), en.date.getDate(), 23, 59, 59);
  }
  const res = {
    state: 'open',
    startAt: startAt ? fmt_(startAt) : '',
    endAt: endAt ? fmt_(endAt) : '',
    daysLeft: null
  };
  if (startAt && now < startAt) { res.state = 'before'; return res; }
  if (endAt && now > endAt) { res.state = 'expired'; return res; }
  if (endAt) res.daysLeft = Math.ceil((endAt.getTime() - now.getTime()) / 86400000);
  return res;
}

// ===== トークン（ステートレス・HMAC署名） =====
function secret_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('AUTH_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('AUTH_SECRET', s); }
  return s;
}
function b64_(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function sign_(payloadB64) { return b64_(Utilities.computeHmacSha256Signature(payloadB64, secret_())); }
function makeToken_(user) {
  const payload = { e: user.email, a: user.admin ? 1 : 0, x: Date.now() + TOKEN_DAYS * 86400000 };
  const p = b64_(Utilities.newBlob(JSON.stringify(payload)).getBytes());
  return p + '.' + sign_(p);
}
function auth_(token) {
  const t = s_(token);
  if (!t || t.indexOf('.') < 0) return null;
  const parts = t.split('.');
  if (parts.length !== 2 || sign_(parts[0]) !== parts[1]) return null;
  let payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (err) { return null; }
  if (!payload || !payload.x || Date.now() > payload.x) return null;
  return { email: payload.e, admin: payload.a === 1 };
}
/** ログイン済みの受講生を取り出す（毎回シートで実在確認する） */
function me_(p) {
  const t = auth_(p.token);
  if (!t) return { ok: false, error: 'unauthorized' };
  const u = findStudent_(t.email);
  if (!u) return { ok: false, error: 'unauthorized' };
  if (u.stopped) return { ok: false, error: 'stopped' };
  return { ok: true, user: u };
}
function requireAdmin_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  if (!g.user.admin) return { ok: false, error: 'forbidden' };
  return g;
}

// ===== 受講生シート =====
function studentSheet_() {
  const ss = ss_();
  const found = ss.getSheetByName(SH_STUDENT) || ss.getSheetByName('受講生');
  if (found) return found;
  return sheetOrCreate_(SH_STUDENT,
    ['名前', 'メールアドレス', 'パスワード', 'タグ', '状態', 'メモ', '登録日', 'LINE UID', '初回設定']);
}
function students_() {
  const sh = studentSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const width = Math.max(sh.getLastColumn(), S_COLS);
  const vals = sh.getRange(2, 1, last - 1, width).getValues();
  const out = [];
  for (let i = 0; i < vals.length; i++) {
    const r = vals[i];
    const mail = email_(r[S_MAIL - 1]);
    if (!mail) continue;
    const tg = tags_(r[S_TAGS - 1]);
    out.push({
      row: i + 2,
      name: s_(r[S_NAME - 1]) || mail.split('@')[0],
      email: mail,
      pass: String(r[S_PASS - 1] == null ? '' : r[S_PASS - 1]).trim(),
      tags: tg,
      admin: hasTag_(tg, 'admin'),
      status: s_(r[S_STATUS - 1]),
      stopped: /^(停止|無効|退会|off)$/i.test(s_(r[S_STATUS - 1])),
      memo: s_(r[S_MEMO - 1]),
      joined: s_(r[S_JOINED - 1]),
      uid: s_(r[S_UID - 1]),
      firstSet: s_(r[S_FIRST - 1])
    });
  }
  return out;
}
function findStudent_(mail) {
  const m = email_(mail);
  const list = students_();
  for (let i = 0; i < list.length; i++) if (list[i].email === m) return list[i];
  return null;
}

// ===== コース設定シート =====
function courseSheet_() {
  return sheetOrCreate_(SH_COURSE, ['コース名', 'タグ', '並び順', '公開', '説明']);
}
function courses_() {
  const sh = courseSheet_();
  const last = sh.getLastRow();
  const map = {}, list = [];
  if (last >= 2) {
    const vals = sh.getRange(2, 1, last - 1, 5).getValues();
    for (let i = 0; i < vals.length; i++) {
      const name = s_(vals[i][0]);
      if (!name) continue;
      const c = {
        row: i + 2,
        name: name,
        tag: s_(vals[i][1]) || name,
        // 並び順は「コース設定シートの行の並び」がそのまま反映される。
        // C列に数字を入れた場合だけ、その数字が優先される（小さい数が上）。
        order: (s_(vals[i][2]) !== '' && !isNaN(Number(vals[i][2]))) ? Number(vals[i][2]) : (i + 1),
        published: !isOff_(vals[i][3]),
        desc: s_(vals[i][4])
      };
      map[name] = c; list.push(c);
    }
  }
  return { map: map, list: list };
}

// ===== 動画一覧シート（結合セルは上から引き継ぐ） =====
function videos_() {
  const sh = videoSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const width = Math.max(sh.getLastColumn(), V_COLS);
  const vals = sh.getRange(2, 1, last - 1, width).getValues();
  const out = [];
  let course = '', chap = '';
  for (let i = 0; i < vals.length; i++) {
    const r = vals[i];
    const c = s_(r[V_COURSE - 1]); if (c) { course = c; chap = ''; }
    const ch = s_(r[V_CHAP - 1]);  if (ch) chap = ch;
    const title = s_(r[V_TITLE - 1]);
    const url   = s_(r[V_URL - 1]);
    const note  = String(r[V_NOTE - 1] == null ? '' : r[V_NOTE - 1]);
    if (!title && !url && !s_(note)) continue;
    if (!course) continue;
    const win = windowState_(r[V_START - 1], r[V_END - 1]);
    out.push({
      row: i + 2,
      course: course,
      chapter: chap || 'その他',
      title: title || (url ? '（無題）' : ''),
      url: url,
      note: note,
      tag: s_(r[V_TAG - 1]),
      blocks: String(r[V_BLOCK - 1] == null ? '' : r[V_BLOCK - 1]),
      hidden: isOff_(r[V_HIDE - 1]) || /^(非公開|hidden)$/i.test(s_(r[V_HIDE - 1])),
      start: s_(r[V_START - 1]) ? fmtCell_(r[V_START - 1]) : '',
      end: s_(r[V_END - 1]) ? fmtCell_(r[V_END - 1]) : '',
      state: win.state,
      startAt: win.startAt,
      endAt: win.endAt,
      daysLeft: win.daysLeft
    });
  }
  return out;
}
/** シートの生の値を運営画面の入力欄向けに整える（Dateなら yyyy-MM-dd） */
function fmtCell_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, TZ, (v.getHours() || v.getMinutes()) ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd');
  }
  return s_(v);
}

// ===== お知らせシート =====
function newsSheet_() {
  return sheetOrCreate_(SH_NEWS,
    ['id', '日付', '見出し', '本文', '画像URL', '宛先タグ', '選択肢', '公開', 'ポップ', 'いいね']);
}
function replySheet_() {
  return sheetOrCreate_(SH_REPLY, ['日時', 'お知らせid', '名前', 'メールアドレス', '回答']);
}
function news_() {
  const sh = newsSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const width = Math.max(sh.getLastColumn(), N_COLS);
  const vals = sh.getRange(2, 1, last - 1, width).getValues();
  const out = [];
  for (let i = 0; i < vals.length; i++) {
    const r = vals[i];
    const id = s_(r[N_ID - 1]);
    const title = s_(r[N_TITLE - 1]);
    if (!id && !title) continue;
    out.push({
      row: i + 2,
      id: id || String(i + 2),
      date: fmtDateOnly_(r[N_DATE - 1]),
      title: title,
      body: String(r[N_BODY - 1] == null ? '' : r[N_BODY - 1]),
      image: s_(r[N_IMAGE - 1]),
      targets: tags_(r[N_TARGET - 1]),
      choices: s_(r[N_CHOICES - 1]) ? s_(r[N_CHOICES - 1]).split(/[,、]/).map(function (x) { return x.trim(); }).filter(String) : [],
      published: !isOff_(r[N_PUB - 1]),
      pop: isOn_(r[N_POP - 1]),
      likes: Number(r[N_LIKES - 1]) || 0
    });
  }
  // 日付の新しい順
  out.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  return out;
}
function fmtDateOnly_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  const p = parseDateParts_(v);
  return p ? Utilities.formatDate(p.date, TZ, 'yyyy-MM-dd') : s_(v);
}
function newsForUser_(u) {
  return news_().filter(function (n) {
    if (!n.published) return u.admin;
    if (!n.targets.length) return true;
    return u.admin || anyTag_(u.tags, n.targets);
  }).map(function (n) {
    return {
      id: n.id, date: n.date, title: n.title, body: n.body, image: n.image,
      choices: n.choices, likes: n.likes, pop: n.pop, published: n.published, targets: n.targets
    };
  });
}

// ===== ログイン =====
function apiLogin_(p) {
  const mail = email_(p.email);
  const pass = String(p.password == null ? '' : p.password).trim();
  if (!mail || !pass) return { ok: false, error: 'empty' };

  const cache = CacheService.getScriptCache();
  const key = 'fail_' + mail;
  const fails = Number(cache.get(key) || 0);
  if (fails >= MAX_FAIL) return { ok: false, error: 'locked' };

  const u = findStudent_(mail);
  if (!u || u.pass === '' || u.pass !== pass) {
    cache.put(key, String(fails + 1), 600);
    return { ok: false, error: 'bad_credentials' };
  }
  if (u.stopped) return { ok: false, error: 'stopped' };
  cache.remove(key);
  if (s_(p.uid)) saveUid_(u, s_(p.uid));   // LINEから来ていたらUIDも記録
  logLogin_(u, 'メール');
  return { ok: true, token: makeToken_(u), user: userPayload_(u) };
}

/**
 * LINEのUIDだけでログイン（＝LINE簡単ログイン）
 * 既定はOFF。使うときはスクリプトプロパティ LINE_QUICK_LOGIN に on を入れる（再デプロイ不要）。
 */
function apiUidLogin_(p) {
  const on = s_(PropertiesService.getScriptProperties().getProperty('LINE_QUICK_LOGIN'));
  if (!isOn_(on)) return { ok: false, error: 'quick_login_off' };
  const uid = s_(p.uid);
  if (!uid) return { ok: false, error: 'empty' };
  const hit = students_().filter(function (s) { return s.uid && s.uid === uid; })[0];
  if (!hit) return { ok: false, error: 'uid_not_found' };
  if (hit.stopped) return { ok: false, error: 'stopped' };
  logLogin_(hit, 'LINE');
  return { ok: true, token: makeToken_(hit), user: userPayload_(hit) };
}

// ===== 初回パスワード設定（レクティからの移行者向け） =====
/**
 * 「登録済みのメールアドレスを入れると、その場で自分のパスワードを決められる」入口。
 * 一度設定した人は二度目は使えない（＝運営が閲覧者一覧のI列を空にすれば再設定できる）。
 *
 * スクリプトプロパティ（すべて任意）：
 *   FIRST_SETUP_UNTIL      … 受付の最終日（例 2026-09-30）。空欄＝無期限
 *   FIRST_SETUP_WORD       … 合言葉。設定すると入力必須になる（案内に書いた人だけ通れる）
 *   FIRST_SETUP_REQUIRE_UID… on にすると、LINE経由（?uid=付き）で来た人だけ設定できる
 */
function firstSetupWord_() {
  return s_(PropertiesService.getScriptProperties().getProperty('FIRST_SETUP_WORD'));
}
function firstSetupRequireUid_() {
  return isOn_(PropertiesService.getScriptProperties().getProperty('FIRST_SETUP_REQUIRE_UID'));
}
function firstSetupOpen_() {
  const until = s_(PropertiesService.getScriptProperties().getProperty('FIRST_SETUP_UNTIL'));
  if (!until) return true;
  const p = parseDateParts_(until);
  if (!p) return true;
  const end = new Date(p.date.getFullYear(), p.date.getMonth(), p.date.getDate(), 23, 59, 59);
  return new Date() <= end;
}

/** ①メールアドレスの確認だけ行う */
function apiFirstCheck_(p) {
  const mail = email_(p.email);
  if (!mail) return { ok: false, error: 'empty' };

  const cache = CacheService.getScriptCache();
  const key = 'first_' + mail;
  const n = Number(cache.get(key) || 0);
  if (n >= 10) return { ok: false, error: 'locked' };
  cache.put(key, String(n + 1), 600);

  if (!firstSetupOpen_()) return { ok: false, error: 'setup_closed' };
  if (firstSetupRequireUid_() && !s_(p.uid)) return { ok: false, error: 'need_line' };

  const u = findStudent_(mail);
  if (!u) return { ok: false, error: 'not_registered' };
  if (u.stopped) return { ok: false, error: 'stopped' };
  if (u.firstSet) return { ok: false, error: 'already_set' };
  return { ok: true, name: u.name, needWord: !!firstSetupWord_() };
}

/** ②新しいパスワードを保存し、そのままログインさせる */
function apiFirstPassword_(p) {
  const mail = email_(p.email);
  const np = String(p.password == null ? '' : p.password).trim();
  if (!mail || !np) return { ok: false, error: 'empty' };
  if (np.length < 4) return { ok: false, error: 'password_too_short' };
  if (!firstSetupOpen_()) return { ok: false, error: 'setup_closed' };
  if (firstSetupRequireUid_() && !s_(p.uid)) return { ok: false, error: 'need_line' };
  const word = firstSetupWord_();
  if (word && s_(p.word) !== word) return { ok: false, error: 'bad_word' };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const u = findStudent_(mail);
    if (!u) return { ok: false, error: 'not_registered' };
    if (u.stopped) return { ok: false, error: 'stopped' };
    if (u.firstSet) return { ok: false, error: 'already_set' };

    const sh = studentSheet_();
    sh.getRange(u.row, S_PASS).setValue(np);
    sh.getRange(u.row, S_FIRST).setValue(nowStr_());
    if (s_(p.uid)) sh.getRange(u.row, S_UID).setValue(s_(p.uid));

    const fresh = findStudent_(mail) || u;
    logLogin_(fresh, '初回設定');
    return { ok: true, token: makeToken_(fresh), user: userPayload_(fresh) };
  } finally { lock.releaseLock(); }
}

function userPayload_(u) {
  return { name: u.name, email: u.email, tags: u.tags, admin: u.admin, uid: u.uid };
}
function saveUid_(u, uid) {
  try {
    if (!uid || u.uid === uid) return;
    studentSheet_().getRange(u.row, S_UID).setValue(uid);
  } catch (err) { /* 失敗しても本処理は続ける */ }
}
function logLogin_(u, how) {
  try {
    const sh = sheetOrCreate_(SH_LOG, ['日時', '名前', 'メールアドレス', '方法']);
    sh.appendRow([nowStr_(), u.name, u.email, how || '']);
    const last = sh.getLastRow();
    if (last > 1001) sh.deleteRows(2, last - 1001);
  } catch (err) { /* ログ失敗は無視 */ }
}

// ===== 受講生向けデータ =====
function apiData_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const u = g.user;
  if (s_(p.uid)) saveUid_(u, s_(p.uid));

  const cs = courses_();
  const vids = videos_();
  const buckets = {};
  for (let i = 0; i < vids.length; i++) {
    const v = vids[i];
    if (v.hidden && !u.admin) continue;
    const conf = cs.map[v.course] || { name: v.course, tag: v.course, order: 9999, published: true, desc: '' };
    if (!conf.published && !u.admin) continue;
    // 動画のF列にタグがあればそれで判定（カンマ区切りで複数可＝どれか1つ持っていれば視聴可）。
    // 空欄ならコース設定のタグを継承する。
    const needs = v.tag ? tags_(v.tag) : [conf.tag];
    if (!u.admin && !anyTag_(u.tags, needs)) continue;

    if (!buckets[v.course]) {
      buckets[v.course] = { name: v.course, desc: conf.desc, order: conf.order, chapters: {}, chapOrder: [] };
    }
    const b = buckets[v.course];
    if (!b.chapters[v.chapter]) { b.chapters[v.chapter] = []; b.chapOrder.push(v.chapter); }
    b.chapters[v.chapter].push({
      id: v.row,
      title: v.title,
      // 公開前・期限切れの動画URLはブラウザへ渡さない
      url: (v.state === 'open') ? v.url : '',
      note: v.note,
      blocks: v.blocks,
      state: v.state,
      startAt: v.startAt,
      endAt: v.endAt,
      daysLeft: v.daysLeft,
      hidden: v.hidden
    });
  }

  const courseList = Object.keys(buckets).map(function (k) { return buckets[k]; })
    .sort(function (a, b) { return a.order - b.order; })
    .map(function (b) {
      return {
        name: b.name, desc: b.desc,
        chapters: b.chapOrder.map(function (cn) { return { name: cn, videos: b.chapters[cn] }; })
      };
    });

  return {
    ok: true,
    user: userPayload_(u),
    courses: courseList,
    news: newsForUser_(u),
    myReplies: myReplies_(u)
  };
}

function myReplies_(u) {
  try {
    const sh = replySheet_();
    const last = sh.getLastRow();
    if (last < 2) return {};
    const vals = sh.getRange(2, 1, last - 1, 5).getValues();
    const out = {};
    vals.forEach(function (r) {
      if (email_(r[3]) === u.email) out[s_(r[1])] = s_(r[4]);
    });
    return out;
  } catch (err) { return {}; }
}

// ===== アカウント設定（表示名・パスワード） =====
function apiProfileSave_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const u = g.user;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = studentSheet_();
    if (p.name != null && s_(p.name)) sh.getRange(u.row, S_NAME).setValue(s_(p.name));
    if (p.password != null && s_(p.password)) {
      const np = String(p.password).trim();
      if (np.length < 4) return { ok: false, error: 'password_too_short' };
      if (s_(p.current) !== u.pass) return { ok: false, error: 'current_wrong' };
      sh.getRange(u.row, S_PASS).setValue(np);
    }
    const fresh = findStudent_(u.email);
    return { ok: true, user: userPayload_(fresh || u) };
  } finally { lock.releaseLock(); }
}

// ===== LINE UIDの紐付け =====
function apiLineLink_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const uid = s_(p.uid);
  if (!uid) return { ok: false, error: 'empty' };
  saveUid_(g.user, uid);
  return { ok: true };
}

// ===== お知らせ（受講生の操作） =====
function apiNewsLike_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const id = s_(p.id);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const hit = news_().filter(function (n) { return n.id === id; })[0];
    if (!hit) return { ok: false, error: 'not_found' };
    const delta = s_(p.off) ? -1 : 1;
    const next = Math.max(0, hit.likes + delta);
    newsSheet_().getRange(hit.row, N_LIKES).setValue(next);
    return { ok: true, likes: next };
  } finally { lock.releaseLock(); }
}

function apiNewsReply_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const u = g.user;
  const id = s_(p.id), choice = s_(p.choice);
  if (!id || !choice) return { ok: false, error: 'empty' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = replySheet_();
    const last = sh.getLastRow();
    if (last >= 2) {
      const vals = sh.getRange(2, 1, last - 1, 5).getValues();
      for (let i = 0; i < vals.length; i++) {
        if (s_(vals[i][1]) === id && email_(vals[i][3]) === u.email) {
          sh.getRange(i + 2, 1).setValue(nowStr_());
          sh.getRange(i + 2, 5).setValue(choice);
          return { ok: true, updated: true };
        }
      }
    }
    sh.appendRow([nowStr_(), id, u.name, u.email, choice]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ===== 運営：全データ =====
function apiAdminData_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const cs = courses_();
  const vids = videos_();
  const known = {};
  cs.list.forEach(function (c) { known[c.name] = true; });
  const orphans = [];
  vids.forEach(function (v) { if (!known[v.course] && orphans.indexOf(v.course) < 0) orphans.push(v.course); });

  return {
    ok: true,
    user: userPayload_(g.user),
    videos: vids,
    courses: cs.list,
    orphanCourses: orphans,
    students: students_().map(function (s) {
      return {
        row: s.row, name: s.name, email: s.email, pass: s.pass, tags: s.tags.join(','),
        status: s.status, memo: s.memo, joined: s.joined, uid: s.uid, firstSet: s.firstSet
      };
    }),
    news: news_(),
    replies: replySummary_(),
    push: pushSummary_(),
    quickLogin: isOn_(PropertiesService.getScriptProperties().getProperty('LINE_QUICK_LOGIN'))
  };
}

/** 通知をオンにしている端末を「メールアドレス→台数」でまとめる */
function pushSummary_() {
  const out = {};
  try {
    const sh = pushSheet_();
    const last = sh.getLastRow();
    if (last < 2) return out;
    const vals = sh.getRange(2, 1, last - 1, 4).getValues();
    vals.forEach(function (r) {
      const t = s_(r[0]); if (!t) return;
      const mail = email_(r[1]);
      if (!out[mail]) out[mail] = { count: 0, last: '' };
      out[mail].count++;
      const at = s_(r[3]);
      if (at > out[mail].last) out[mail].last = at;
    });
  } catch (err) { /* シートが無ければ空 */ }
  return out;
}

function replySummary_() {
  const sh = replySheet_();
  const last = sh.getLastRow();
  const out = {};
  if (last < 2) return out;
  const vals = sh.getRange(2, 1, last - 1, 5).getValues();
  vals.forEach(function (r) {
    const id = s_(r[1]); if (!id) return;
    if (!out[id]) out[id] = { total: 0, counts: {}, list: [] };
    const c = s_(r[4]);
    out[id].total++;
    out[id].counts[c] = (out[id].counts[c] || 0) + 1;
    if (out[id].list.length < 200) out[id].list.push({ at: s_(r[0]), name: s_(r[2]), email: email_(r[3]), choice: c });
  });
  return out;
}

// ===== 運営：動画の追加／更新／削除 =====
function apiVideoAdd_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const course = s_(p.course), chapter = s_(p.chapter) || 'その他';
  if (!course) return { ok: false, error: 'no_course' };
  if (!s_(p.title) && !s_(p.url)) return { ok: false, error: 'no_content' };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = videoSheet_();
    const vids = videos_();
    let lastOfCourse = 0, lastOfChapter = 0;
    for (let i = 0; i < vids.length; i++) {
      if (vids[i].course !== course) continue;
      lastOfCourse = vids[i].row;
      if (vids[i].chapter === chapter) lastOfChapter = vids[i].row;
    }
    const after = lastOfChapter || lastOfCourse || sh.getLastRow();
    sh.insertRowAfter(after);
    const row = after + 1;
    sh.getRange(row, 1, 1, V_COLS).setValues([[
      course, chapter, s_(p.title), s_(p.url), String(p.note == null ? '' : p.note),
      s_(p.tag), s_(p.start), s_(p.end), s_(p.hidden) ? '非公開' : '',
      String(p.blocks == null ? '' : p.blocks)
    ]]);
    return { ok: true, row: row };
  } finally { lock.releaseLock(); }
}

function apiVideoUpdate_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const row = Number(p.row);
  if (!row || row < 2) return { ok: false, error: 'bad_row' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = videoSheet_();
    if (row > sh.getLastRow()) return { ok: false, error: 'bad_row' };
    if (p.expectTitle != null && s_(sh.getRange(row, V_TITLE).getValue()) !== s_(p.expectTitle)) {
      return { ok: false, error: 'row_moved' };
    }
    if (p.course  != null) sh.getRange(row, V_COURSE).setValue(s_(p.course));
    if (p.chapter != null) sh.getRange(row, V_CHAP).setValue(s_(p.chapter));
    if (p.title   != null) sh.getRange(row, V_TITLE).setValue(s_(p.title));
    if (p.url     != null) sh.getRange(row, V_URL).setValue(s_(p.url));
    if (p.note    != null) sh.getRange(row, V_NOTE).setValue(String(p.note));
    if (p.tag     != null) sh.getRange(row, V_TAG).setValue(s_(p.tag));
    if (p.hidden  != null) sh.getRange(row, V_HIDE).setValue(s_(p.hidden) ? '非公開' : '');
    if (p.start   != null) sh.getRange(row, V_START).setValue(s_(p.start));
    if (p.end     != null) sh.getRange(row, V_END).setValue(s_(p.end));
    if (p.blocks  != null) sh.getRange(row, V_BLOCK).setValue(String(p.blocks));
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function apiVideoDelete_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const row = Number(p.row);
  if (!row || row < 2) return { ok: false, error: 'bad_row' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = videoSheet_();
    if (row > sh.getLastRow()) return { ok: false, error: 'bad_row' };
    if (p.expectTitle != null && s_(sh.getRange(row, V_TITLE).getValue()) !== s_(p.expectTitle)) {
      return { ok: false, error: 'row_moved' };
    }
    // コース名／章名が入っている行を消すと下の行が迷子になるので、先に引き継がせる
    const course = s_(sh.getRange(row, V_COURSE).getValue());
    const chap   = s_(sh.getRange(row, V_CHAP).getValue());
    const next = row + 1;
    if (next <= sh.getLastRow()) {
      if (course && !s_(sh.getRange(next, V_COURSE).getValue())) sh.getRange(next, V_COURSE).setValue(course);
      if (chap   && !s_(sh.getRange(next, V_CHAP).getValue()))   sh.getRange(next, V_CHAP).setValue(chap);
    }
    sh.deleteRow(row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ===== 運営：受講生 =====
function apiStudentSave_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const mail = email_(p.email);
  if (!mail || mail.indexOf('@') < 0) return { ok: false, error: 'bad_email' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = studentSheet_();
    const list = students_();
    let row = Number(p.row) || 0;
    if (!row) {
      const dup = list.filter(function (s) { return s.email === mail; })[0];
      if (dup) return { ok: false, error: 'duplicate_email', row: dup.row };
      row = sh.getLastRow() + 1;
      sh.getRange(row, S_JOINED).setValue(nowStr_());
    } else {
      const dup = list.filter(function (s) { return s.email === mail && s.row !== row; })[0];
      if (dup) return { ok: false, error: 'duplicate_email', row: dup.row };
    }
    sh.getRange(row, S_NAME).setValue(s_(p.name));
    sh.getRange(row, S_MAIL).setValue(mail);
    if (s_(p.password)) sh.getRange(row, S_PASS).setValue(String(p.password).trim());
    sh.getRange(row, S_TAGS).setValue(s_(p.tags));
    sh.getRange(row, S_STATUS).setValue(s_(p.status) || '有効');
    if (p.memo != null) sh.getRange(row, S_MEMO).setValue(s_(p.memo));
    if (p.uid  != null) sh.getRange(row, S_UID).setValue(s_(p.uid));
    return { ok: true, row: row };
  } finally { lock.releaseLock(); }
}

function apiStudentDelete_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const row = Number(p.row);
  if (!row || row < 2) return { ok: false, error: 'bad_row' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = studentSheet_();
    if (row > sh.getLastRow()) return { ok: false, error: 'bad_row' };
    const mail = email_(sh.getRange(row, S_MAIL).getValue());
    if (p.expectEmail != null && mail !== email_(p.expectEmail)) return { ok: false, error: 'row_moved' };
    if (mail === g.user.email) return { ok: false, error: 'cannot_delete_self' };
    sh.deleteRow(row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ===== 運営：コース設定 =====
function apiCourseSave_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const name = s_(p.name);
  if (!name) return { ok: false, error: 'no_name' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = courseSheet_();
    const cs = courses_();
    const row = (cs.map[name] && cs.map[name].row) || (sh.getLastRow() + 1);
    sh.getRange(row, 1, 1, 5).setValues([[
      name, s_(p.tag) || name, Number(p.order) || (row - 1) * 10,
      s_(p.published) === '0' ? '非公開' : '公開', s_(p.desc)
    ]]);
    return { ok: true, row: row };
  } finally { lock.releaseLock(); }
}

// ===== 運営：お知らせ =====
function apiNewsSave_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  if (!s_(p.title)) return { ok: false, error: 'no_title' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = newsSheet_();
    const list = news_();
    let row, id = s_(p.id);
    if (id) {
      const hit = list.filter(function (n) { return n.id === id; })[0];
      if (!hit) return { ok: false, error: 'not_found' };
      row = hit.row;
    } else {
      let maxId = 0;
      list.forEach(function (n) { const v = Number(n.id); if (v > maxId) maxId = v; });
      id = String(maxId + 1);
      row = sh.getLastRow() + 1;
    }
    sh.getRange(row, 1, 1, N_COLS - 1).setValues([[
      id,
      s_(p.date) || Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'),
      s_(p.title),
      String(p.body == null ? '' : p.body),
      s_(p.image),
      s_(p.targets),
      s_(p.choices),
      s_(p.published) === '0' ? '非公開' : '公開',
      s_(p.pop) === '1' ? 'ON' : ''
    ]]);
    if (!s_(sh.getRange(row, N_LIKES).getValue())) sh.getRange(row, N_LIKES).setValue(0);
    return { ok: true, id: id, row: row };
  } finally { lock.releaseLock(); }
}

function apiNewsDelete_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const id = s_(p.id);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const hit = news_().filter(function (n) { return n.id === id; })[0];
    if (!hit) return { ok: false, error: 'not_found' };
    newsSheet_().deleteRow(hit.row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ===== Webプッシュ通知（Firebase Cloud Messaging v1） =====
/**
 * 通知の宛先は「プッシュ」タブに貯める（token／メール／名前／日時）。
 * 送信にはFirebaseのサービスアカウントが要る。スクリプトプロパティに
 *   FCM_PRIVATE_KEY … サービスアカウントの秘密鍵JSONを「丸ごと」貼る
 * を入れておけば、project_id と client_email もそこから読み取る。
 */
function pushSheet_() {
  return sheetOrCreate_(SH_PUSH, ['token', 'メールアドレス', '名前', '日時']);
}

/** 端末のトークンを登録（同じトークンは上書き） */
function apiPushReg_(p) {
  const g = me_(p); if (!g.ok) return g;
  const fcm = s_(p.fcm);
  if (!fcm) return { ok: false, error: 'empty' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = pushSheet_();
    const last = sh.getLastRow();
    if (last >= 2) {
      const vals = sh.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < vals.length; i++) {
        if (s_(vals[i][0]) === fcm) {
          sh.getRange(i + 2, 2, 1, 3).setValues([[g.user.email, g.user.name, nowStr_()]]);
          return { ok: true, updated: true };
        }
      }
    }
    sh.appendRow([fcm, g.user.email, g.user.name, nowStr_()]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/** 通知をオフにした端末を消す */
function apiPushUnreg_(p) {
  const g = me_(p); if (!g.ok) return g;
  const fcm = s_(p.fcm);
  if (!fcm) return { ok: true };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = pushSheet_();
    const last = sh.getLastRow();
    if (last < 2) return { ok: true };
    const vals = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = vals.length - 1; i >= 0; i--) {
      if (s_(vals[i][0]) === fcm) sh.deleteRow(i + 2);
    }
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/** サービスアカウントの鍵（JSON丸ごと）から必要な3点を取り出す */
function fcmCreds_() {
  const raw = s_(PropertiesService.getScriptProperties().getProperty('FCM_PRIVATE_KEY'));
  if (!raw) return null;
  let key = raw, mail = s_(PropertiesService.getScriptProperties().getProperty('FCM_CLIENT_EMAIL'));
  let project = s_(PropertiesService.getScriptProperties().getProperty('FCM_PROJECT_ID'));
  if (raw.charAt(0) === '{') {
    try {
      const j = JSON.parse(raw);
      key = j.private_key || '';
      mail = j.client_email || mail;
      project = j.project_id || project;
    } catch (err) { return null; }
  }
  key = String(key).replace(/\n/g, '\n').replace(/\r/g, '').replace(/^["']|["']$/g, '');
  if (!key || !mail || !project) return null;
  return { key: key, mail: mail, project: project };
}

/** サービスアカウントでアクセストークンを取る（FCM v1用） */
function fcmAccessToken_() {
  const c = fcmCreds_();
  if (!c) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=+$/, '');
  const claim = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: c.mail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).replace(/=+$/, '');
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeRsaSha256Signature(header + '.' + claim, c.key)).replace(/=+$/, '');
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: header + '.' + claim + '.' + sig },
    muteHttpExceptions: true
  });
  const j = JSON.parse(res.getContentText() || '{}');
  return j.access_token ? { token: j.access_token, project: c.project } : null;
}

/**
 * お知らせを通知として送る（admin専用）
 *   id   … お知らせのid
 *   test … 1 なら自分の端末にだけ送る
 * 宛先はお知らせの「宛先タグ」に合う人の端末だけ（空欄なら全員）。
 */
function apiNewsPush_(p) {
  const g = requireAdmin_(p); if (!g.ok) return g;
  const hit = news_().filter(function (n) { return n.id === s_(p.id); })[0];
  if (!hit) return { ok: false, error: 'not_found' };

  const auth = fcmAccessToken_();
  if (!auth) return { ok: false, error: 'no_fcm_credentials' };

  // 宛先の絞り込み
  const students = students_();
  const targetMails = {};
  students.forEach(function (u) {
    if (u.stopped) return;
    if (!hit.targets.length || anyTag_(u.tags, hit.targets) || u.admin) targetMails[u.email] = true;
  });

  const sh = pushSheet_();
  const last = sh.getLastRow();
  if (last < 2) return { ok: false, error: 'no_tokens' };
  const rows = sh.getRange(2, 1, last - 1, 4).getValues();
  const tokens = [];
  rows.forEach(function (r) {
    const t = s_(r[0]), mail = email_(r[1]);
    if (!t) return;
    if (s_(p.test)) { if (mail === g.user.email) tokens.push(t); return; }
    if (targetMails[mail]) tokens.push(t);
  });
  if (!tokens.length) {
    return { ok: false, error: 'no_tokens', forEmail: s_(p.test) ? g.user.email : '' };
  }

  const body = String(hit.body || '').replace(/\s+/g, ' ').slice(0, 90);
  const url = s_(PropertiesService.getScriptProperties().getProperty('APP_URL'))
    || 'https://apps.l-mine.com/rionjuku-app/';
  let sent = 0, failed = 0;
  const dead = [];
  tokens.forEach(function (t) {
    const res = UrlFetchApp.fetch(
      'https://fcm.googleapis.com/v1/projects/' + auth.project + '/messages:send',
      {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + auth.token },
        payload: JSON.stringify({
          message: {
            token: t,
            data: { title: hit.title, body: body, url: url, tag: 'news-' + hit.id },
            webpush: { headers: { Urgency: 'high' }, fcmOptions: { link: url } }
          }
        }),
        muteHttpExceptions: true
      });
    const code = res.getResponseCode();
    if (code === 200) sent++;
    else { failed++; if (code === 404 || code === 400) dead.push(t); }
  });

  // 無効になった端末は掃除する
  if (dead.length) {
    const all = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    for (let i = all.length - 1; i >= 0; i--) {
      if (dead.indexOf(s_(all[i][0])) >= 0) sh.deleteRow(i + 2);
    }
  }
  return { ok: true, sent: sent, failed: failed, total: tokens.length, removed: dead.length };
}

/**
 * 【通知を使う前に1回だけ実行する】
 * GASが外部（Firebase）へ通信する許可を取り、鍵の設定も点検する。
 * エディタで関数「checkPush」を選んで▶実行 → 承認画面が出たら許可。
 * 実行ログに「準備OK」と出れば、あとはアプリから通知を送れる。
 */
function checkPush() {
  const out = { 手順: [] };

  // ① 外部通信の承認をここで取る（この1行のために実行する）
  try {
    UrlFetchApp.fetch('https://oauth2.googleapis.com/token', { method: 'get', muteHttpExceptions: true });
    out.手順.push('① 外部通信：OK');
  } catch (err) {
    out.手順.push('① 外部通信：NG → ' + err.message);
    Logger.log(JSON.stringify(out, null, 2));
    return out;
  }

  // ② 鍵が読めるか
  const c = fcmCreds_();
  if (!c) {
    out.手順.push('② 鍵：NG → スクリプトプロパティ FCM_PRIVATE_KEY にサービスアカウントのJSONを丸ごと貼ってください');
    Logger.log(JSON.stringify(out, null, 2));
    return out;
  }
  out.手順.push('② 鍵：OK（project=' + c.project + ' / ' + c.mail + '）');

  // ③ アクセストークンが取れるか
  const auth = fcmAccessToken_();
  out.手順.push(auth ? '③ Firebaseへの接続：OK' : '③ Firebaseへの接続：NG（鍵の形式をご確認ください）');

  // ④ 通知先の端末数
  const sh = pushSheet_();
  const n = Math.max(0, sh.getLastRow() - 1);
  out.手順.push('④ 通知をオンにしている端末：' + n + '台');

  out.結果 = (auth ? '準備OK' : '未完了');
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

// ===== 名簿の補正 =====
// ※ レクティのプラン区分（凛コース／穏コース／VIP／Standard）をタグへ反映する
//    一度きりの関数 fixRoster は 2026-08-18 に実行済みのため削除しました。
//    （受講生のメールアドレスを含むコードを公開リポジトリに置かないため）
//    再実行が必要になった場合は、閲覧者一覧のタグを直接編集するか、再生成してください。
// ===== 初期セットアップ =====
/**
 * エディタから1回実行するだけでOK（後から実行しても安全）。
 * ・受講生／コース設定／お知らせ／お知らせ回答／ログイン履歴タブを作る
 * ・動画一覧の見出し（F タグ／G 非公開／H 視聴開始／I 視聴期限）を追加
 * ・動画一覧に出てくるコース名をコース設定へ自動登録（タグ＝コース名を初期値に）
 * ・とーるさん自身をadminとして登録（パスワードは戻り値に表示）
 */
function setupSheets() {
  const info = apiSetup_({ _direct: true });
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

function apiSetup_(p) {
  if (!p._direct) {
    const g = requireAdmin_(p); if (!g.ok) return g;
  }
  const warn = [];
  const sh = videoSheet_();

  const heads = {};
  heads[V_TAG] = 'タグ'; heads[V_START] = '視聴開始'; heads[V_END] = '視聴終了'; heads[V_HIDE] = '非公開';
  heads[V_BLOCK] = '追加コンテンツ';
  Object.keys(heads).forEach(function (col) {
    if (!s_(sh.getRange(1, Number(col)).getValue())) sh.getRange(1, Number(col)).setValue(heads[col]);
  });

  const ssh = studentSheet_();
  if (!s_(ssh.getRange(1, S_UID).getValue()))   ssh.getRange(1, S_UID).setValue('LINE UID');
  if (!s_(ssh.getRange(1, S_FIRST).getValue())) ssh.getRange(1, S_FIRST).setValue('初回設定');
  courseSheet_();
  newsSheet_();
  replySheet_();
  sheetOrCreate_(SH_LOG, ['日時', '名前', 'メールアドレス', '方法']);

  // コース設定の自動登録
  const cs = courses_();
  const vids = videos_();
  const added = [];
  const csh = courseSheet_();
  let order = cs.list.length ? Math.max.apply(null, cs.list.map(function (c) { return c.order; })) : 0;
  vids.forEach(function (v) {
    if (cs.map[v.course] || added.indexOf(v.course) >= 0) return;
    order += 10;
    csh.appendRow([v.course, v.course, order, '公開', '']);
    added.push(v.course);
  });

  vids.forEach(function (v) {
    if (v.tag) warn.push('動画一覧 ' + v.row + '行目 F列に「' + v.tag + '」＝この動画専用のタグとして扱われます。不要なら削除してください。');
  });

  // 管理者アカウント
  let adminPass = null;
  // 管理者にするメールアドレスは、スクリプトプロパティ ADMIN_EMAIL に入れる（コードに書かない）
  const adminMail = s_(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL'));
  if (!adminMail) {
    warn.push('スクリプトプロパティ ADMIN_EMAIL が未設定のため、管理者行の作成はスキップしました。');
  }
  if (adminMail && !findStudent_(adminMail)) {
    adminPass = 'rj-' + Utilities.getUuid().slice(0, 8);
    studentSheet_().appendRow(['とーる', adminMail, adminPass, 'admin', '有効', '運営（システム管理）', nowStr_(), '']);
  }

  secret_();

  return {
    ok: true,
    addedCourses: added,
    adminEmail: adminMail,
    adminPassword: adminPass || '（既に登録済み。パスワードは受講生シートを参照）',
    students: students_().length,
    videos: vids.length,
    news: news_().length,
    warnings: warn
  };
}
