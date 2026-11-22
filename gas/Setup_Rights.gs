/**
 * 凛穏塾 常時販売 ── 「視聴権」「商品マスター」シートを作る
 *
 * エディタから setupRights() を1回実行するだけ。何度実行しても安全（既にあれば触らない）。
 * ★この時点ではアプリの動きは一切変わらない。シートを用意するだけ。
 *
 * 視聴権     … プロラインの決済から自動で1行ずつ増える。人ごとの視聴期限はここだけで決まる
 * 商品マスター … 商品コード→タグ・視聴日数の対応表。値段や期間を変えたいときはここを直す
 */

const SH_RIGHT   = '視聴権';
const SH_PRODUCT = '商品マスター';

// 視聴権シートの列（1始まり）
const R_TIME  = 1;  // A 発行日時
const R_UID   = 2;  // B LINE UID
const R_MAIL  = 3;  // C メールアドレス
const R_NAME  = 4;  // D 氏名
const R_CODE  = 5;  // E 商品コード
const R_TAGS  = 6;  // F タグ
const R_START = 7;  // G 視聴開始
const R_END   = 8;  // H 視聴終了
const R_FROM  = 9;  // I 発行元
const R_ORDER = 10; // J 注文キー
const R_MEMO  = 11; // K メモ
const R_COLS  = 11;

// 商品マスターシートの列（1始まり）
const P_CODE = 1; // A 商品コード
const P_NAME = 2; // B 商品名
const P_TAGS = 3; // C 付けるタグ
const P_DAYS = 4; // D 視聴日数
const P_MEMO = 5; // E 備考
const P_COLS = 5;

function setupRights() {
  const log = [];
  log.push(setupRightSheet_());
  log.push(setupProductSheet_());
  Logger.log(log.join('\n'));
  return log.join('\n');
}

// ===== 視聴権 =====
function rightSheet_() {
  return sheetOrCreate_(SH_RIGHT, [
    '発行日時', 'LINE UID', 'メールアドレス', '氏名', '商品コード',
    'タグ', '視聴開始', '視聴終了', '発行元', '注文キー', 'メモ',
  ]);
}

function setupRightSheet_() {
  const existed = !!ss_().getSheetByName(SH_RIGHT);
  const sh = rightSheet_();
  if (existed) return SH_RIGHT + '：すでにあったので触っていません';

  // 文字として入れたい列は先に書式を固定しておく（UIDや注文キーが数字に化けるのを防ぐ）
  const n = Math.max(sh.getMaxRows() - 1, 1);
  [R_UID, R_MAIL, R_CODE, R_TAGS, R_ORDER].forEach(function (col) {
    sh.getRange(2, col, n, 1).setNumberFormat('@');
  });
  sh.getRange(2, R_TIME, n, 1).setNumberFormat('yyyy/MM/dd HH:mm');
  sh.getRange(2, R_START, n, 1).setNumberFormat('yyyy/MM/dd');
  sh.getRange(2, R_END,   n, 1).setNumberFormat('yyyy/MM/dd');

  const widths = {};
  widths[R_TIME] = 130; widths[R_UID] = 240; widths[R_MAIL] = 200; widths[R_NAME] = 110;
  widths[R_CODE] = 100; widths[R_TAGS] = 160; widths[R_START] = 95; widths[R_END] = 95;
  widths[R_FROM] = 90;  widths[R_ORDER] = 200; widths[R_MEMO] = 220;
  Object.keys(widths).forEach(function (col) {
    sh.setColumnWidth(Number(col), widths[col]);
  });

  note_(sh, R_UID,   'LINEの友だち識別子。プロラインの [[uid]] がそのまま入る');
  note_(sh, R_MAIL,  '空のことがある。LINEだけで買った人はメールが取れない場合がある');
  note_(sh, R_CODE,  '商品マスターのA列と一致させる。ここからタグと日数が決まる');
  note_(sh, R_TAGS,  '商品マスターから自動で入る。複数あるときはカンマ区切り');
  note_(sh, R_END,   'この日の23:59まで観られる。空欄＝無期限');
  note_(sh, R_FROM,  'プロライン／手動／CSV のどれか。あとで「誰が出した権利か」を追えるようにする');
  note_(sh, R_ORDER, '二重発行を止めるための印。同じ値の行があれば足さない');

  return SH_RIGHT + '：作りました';
}

// ===== 商品マスター =====
function productSheet_() {
  return sheetOrCreate_(SH_PRODUCT, ['商品コード', '商品名', '付けるタグ', '視聴日数', '備考']);
}

function setupProductSheet_() {
  const existed = !!ss_().getSheetByName(SH_PRODUCT);
  const sh = productSheet_();
  if (existed) return SH_PRODUCT + '：すでにあったので触っていません';

  const n = Math.max(sh.getMaxRows() - 1, 1);
  [P_CODE, P_TAGS].forEach(function (col) {
    sh.getRange(2, col, n, 1).setNumberFormat('@');
  });

  sh.setColumnWidth(P_CODE, 110);
  sh.setColumnWidth(P_NAME, 220);
  sh.setColumnWidth(P_TAGS, 180);
  sh.setColumnWidth(P_DAYS, 90);
  sh.setColumnWidth(P_MEMO, 320);

  note_(sh, P_CODE, 'プロラインの外部プログラムURLに product= で書く値。半角英数で');
  note_(sh, P_TAGS, 'この商品を買った人に付くタグ。動画一覧H列／コース設定のタグと一致させる。複数はカンマ区切り');
  note_(sh, P_DAYS, '買った日から何日観られるか。空欄＝無期限');

  // たたき台。中身はあとから自由に書き換えてよい
  sh.getRange(2, 1, 4, P_COLS).setValues([
    ['L1-TRIAL', '基礎講義 お試し90日', '基礎講義',          90,  'LEVEL1／伝説の500人講義・90分'],
    ['L1',       '基礎講義 1年',        '基礎講義',          365, 'LEVEL1'],
    ['L2',       '実践講義 1年',        '実践講義',          365, 'LEVEL2／2Days＋質問回答会＋補足ボイス'],
    ['SET',      '完全セット 1年',      '基礎講義,実践講義', 365, 'LEVEL1＋LEVEL2'],
  ]);

  return SH_PRODUCT + '：作って、たたき台を4行入れました';
}

function note_(sh, col, text) {
  sh.getRange(1, col).setNote(text);
}

/* =====================================================================
 * ここから下：動かす側（v1.12.0・2026-11-20）
 *
 *   ① 決済の受け口   apiPurchase_      … プロラインの外部プログラムから叩かれる
 *   ② 期限の判定     rightsFor_        … apiData_ が「この人はいつまで観られるか」を聞く
 *   ③ ご登録         apiAccountSetup_  … LINEだけでご購入の方が、メールとパスワードを登録する
 *
 * ★合言葉はコードに書きません（このリポジトリは公開のため）。
 *   スクリプトプロパティ PURCHASE_SECRET に入れます。空のあいだ、受け口はすべて断ります。
 * ===================================================================== */

/**
 * 合言葉を、このプログラム自身に作らせる（エディタから1回だけ実行）
 *
 * すでに入っていれば何もしません。作った合言葉は実行ログに出しません。
 * 値は「プロジェクトの設定 → スクリプト プロパティ → PURCHASE_SECRET」でご覧いただけます。
 * それをプロラインの外部プログラムURLの secret= に貼ってください（4商品とも同じ値）。
 */
function setupPurchaseSecret() {
  const props = PropertiesService.getScriptProperties();
  if (String(props.getProperty('PURCHASE_SECRET') || '').trim()) {
    Logger.log('PURCHASE_SECRET：すでに入っているので触っていません');
    return 'exists';
  }
  // 英数字だけ（URLの中で化けないように）。UUIDを2つつないで40文字に
  const made = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 40);
  props.setProperty('PURCHASE_SECRET', made);
  Logger.log('PURCHASE_SECRET：作って入れました（値はスクリプト プロパティでご確認ください）');
  return 'created';
}

/** 同じ決済の知らせが続けて届いたとき、この分数のあいだは1回ぶんとして扱う */
const PURCHASE_DEDUPE_MIN = 10;

// ----- メールアドレスが空の方の「仮のアドレス」 -----
const VMAIL_TAIL = '@line.uid';
function vmail_(uid) { return 'line.' + s_(uid).toLowerCase() + VMAIL_TAIL; }
function isVmail_(m) { return s_(m).slice(-VMAIL_TAIL.length) === VMAIL_TAIL; }
function okMail_(m) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) && m.indexOf('[[') < 0 && !isVmail_(m);
}
/** プロラインの [[uid]] などが置き換わらずに届いたら、空として扱う */
function clean_(v) {
  const t = s_(v);
  return (t.indexOf('[[') >= 0 || t.indexOf(']]') >= 0) ? '' : t;
}
function dayEnd_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59); }
function dayOnly_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function ymd_(d) { return Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); }

// ----- 読む -----
/** 商品マスター → { 商品コード(小文字): {code, name, tags[], days} }。days=0 は無期限 */
function products_() {
  const map = {};
  const sh = ss_().getSheetByName(SH_PRODUCT);
  if (!sh || sh.getLastRow() < 2) return map;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, P_COLS).getValues();
  vals.forEach(function (r) {
    const code = s_(r[P_CODE - 1]);
    if (!code) return;
    const days = Number(r[P_DAYS - 1]);
    map[code.toLowerCase()] = {
      code: code,
      name: s_(r[P_NAME - 1]) || code,
      tags: tags_(r[P_TAGS - 1]),
      days: days > 0 ? Math.floor(days) : 0
    };
  });
  return map;
}

/** 視聴権シートを全部読む。シートが無ければ空（ここでは作らない＝ふだんの表示を遅くしない） */
function rightsAll_() {
  const sh = ss_().getSheetByName(SH_RIGHT);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, R_COLS).getValues();
  const out = [];
  for (let i = 0; i < vals.length; i++) {
    const r = vals[i];
    const uid = s_(r[R_UID - 1]), mail = email_(r[R_MAIL - 1]);
    if (!uid && !mail) continue;
    const endRaw = s_(r[R_END - 1]);
    const en = parseDateParts_(r[R_END - 1]);
    if (endRaw && !en) continue;                 // 読めない日付の行は、権利なしとして扱う
    const st = parseDateParts_(r[R_START - 1]);
    out.push({
      row: i + 2,
      time: (r[R_TIME - 1] instanceof Date) ? r[R_TIME - 1] : null,
      uid: uid,
      mail: mail,
      code: s_(r[R_CODE - 1]),
      tags: tags_(r[R_TAGS - 1]),
      start: st ? st.date : null,
      end: en ? (en.hasTime ? en.date : dayEnd_(en.date)) : null,
      unlimited: !endRaw,
      order: s_(r[R_ORDER - 1])
    });
  }
  return out;
}

/** その人の行だけ取り出す（UIDかメールアドレスのどちらかが合えば本人） */
function rightsOf_(all, uid, mail) {
  return all.filter(function (r) {
    return (uid && r.uid && r.uid === uid) || (mail && r.mail && r.mail === mail);
  });
}

/**
 * その人の視聴権を「タグごと」にまとめる → { タグ(小文字): {tag, active, endAt, daysLeft} }
 * 同じタグの行がいくつもあるときは、いちばん長いものを残します。
 */
function rightsFor_(u) {
  const now = new Date();
  const rows = rightsOf_(rightsAll_(), u.uid, u.noMail ? '' : u.email);
  const best = {};
  rows.forEach(function (r) {
    if (r.start && now < r.start) return;        // まだ始まっていない
    r.tags.forEach(function (t) {
      const k = t.toLowerCase();
      const cur = best[k];
      if (!cur) { best[k] = { tag: t, unlimited: r.unlimited, end: r.end }; return; }
      if (cur.unlimited) return;
      if (r.unlimited || r.end > cur.end) best[k] = { tag: t, unlimited: r.unlimited, end: r.end };
    });
  });
  const out = {};
  Object.keys(best).forEach(function (k) {
    const b = best[k];
    const active = b.unlimited || now <= b.end;
    out[k] = {
      tag: b.tag,
      active: active,
      end: b.end,
      endAt: b.end ? fmt_(b.end) : '',
      daysLeft: (active && b.end) ? Math.ceil((b.end.getTime() - now.getTime()) / 86400000) : null
    };
  });
  return out;
}

/** 必要なタグのうち、いちばん良い視聴権を返す（有効なもの優先・無ければ切れたもの・それも無ければnull） */
function bestRight_(rights, needs) {
  let pick = null;
  needs.forEach(function (n) {
    const r = rights[String(n).toLowerCase()];
    if (!r) return;
    if (!pick) { pick = r; return; }
    if (r.active !== pick.active) { if (r.active) pick = r; return; }
    if (!pick.end) return;                       // すでに無期限
    if (!r.end || r.end > pick.end) pick = r;
  });
  return pick;
}

/** お知らせの宛先判定用：いま有効な視聴権のタグを足した写しを返す（元の u は変えない） */
function withRightTags_(u, rights) {
  const extra = Object.keys(rights).filter(function (k) { return rights[k].active; })
    .map(function (k) { return rights[k].tag; });
  if (!extra.length) return u;
  const c = {};
  Object.keys(u).forEach(function (k) { c[k] = u[k]; });
  c.tags = u.tags.concat(extra);
  return c;
}

// ----- ① 決済の受け口 -----
/**
 * プロラインの「カスタマイズしたシナリオ移動 → 外部プログラム」から叩かれます。
 *   …/exec?action=purchase&secret=（合言葉）&product=L1&uid=[[uid]]&name=[[snsname]]
 *   任意：&email=…（取れるときだけ）／&order=…（決済ごとの番号が取れるときだけ）
 *
 * ・同じ知らせが続けて届いても、視聴権は1回ぶんしか出しません
 * ・同じ商品をもう一度お求めのときは、いまの期限の続きから延ばします
 * ・名簿に居ない方は、閲覧者一覧に1行足します（タグは付けません。期限は視聴権シートだけで決まります）
 * ・LINEへのお知らせは送りません（プロラインのシナリオが送ります。両方から送ると2通届くため）
 */
function apiPurchase_(p) {
  const secret = s_(PropertiesService.getScriptProperties().getProperty('PURCHASE_SECRET'));
  if (!secret || s_(p.secret) !== secret) return { ok: false, error: 'bad_secret' };

  const uid = clean_(p.uid);
  let mail = email_(clean_(p.email));
  if (mail && !okMail_(mail)) mail = '';
  const name = clean_(p.name) || clean_(p.snsname);
  const code = s_(p.product);
  const order = clean_(p.order);
  const from = s_(p.from) || 'プロライン';
  if (!uid && !mail) return { ok: false, error: 'no_identity' };

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const now = new Date();
    const sh = rightSheet_();
    const prod = products_()[code.toLowerCase()];
    if (!prod || !prod.tags.length) {
      // 知らない商品コード。視聴権は出さず、赤い行で残して運営が気づけるようにします
      const bad = writeRight_(sh, [now, uid, mail, name, code, '', '', '', from, order,
        '⚠ 商品マスターに無い商品コードです。視聴権は出ていません']);
      sh.getRange(bad, 1, 1, R_COLS).setBackground('#fde2e2');
      return { ok: false, error: 'unknown_product', product: code };
    }

    const had = rightsOf_(rightsAll_(), uid, mail);          // この方がこれまでにお持ちだった権利（商品を問わず）
    const mine = had
      .filter(function (r) { return r.code.toLowerCase() === prod.code.toLowerCase(); });
    // お試しは初回だけの商品。2回目以降の入口には出さない決まりだが、古いリンクから買えてしまうことがある。
    // お支払いは済んでいるので視聴権は出し、運営が気づけるよう行に色と印を付ける。
    const trialAgain = /TRIAL/i.test(prod.code) && had.length > 0;

    // 二重発行の防止
    const dup = mine.filter(function (r) {
      if (order) return r.order === order;
      return r.time && (now.getTime() - r.time.getTime()) < PURCHASE_DEDUPE_MIN * 60000;
    })[0];
    if (dup) return { ok: true, dup: true, product: prod.code, end: dup.end ? ymd_(dup.end) : '' };

    // 名簿（閲覧者一覧）と結びつける
    const who = ensureBuyer_(uid, mail, name, prod);

    // 期限：同じ商品をまだお持ちなら、その続きから。無ければ今日から
    let end = null, extended = false;
    if (prod.days) {
      let base = dayOnly_(now);
      const still = mine.filter(function (r) { return r.unlimited || r.end > now; });
      if (still.some(function (r) { return r.unlimited; })) {
        end = null;                              // すでに無期限をお持ち
      } else {
        still.forEach(function (r) { if (r.end > base) { base = dayOnly_(r.end); extended = true; } });
        end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + prod.days);
      }
    }

    const memo = [extended ? '延長（前の期限の続きから）' : '',
                  trialAgain ? '★お試しの再購入（要確認）' : ''].filter(String).join('／');
    const wrote = writeRight_(sh, [now, uid, mail || who.mail, name || who.name, prod.code, prod.tags.join(','),
      dayOnly_(now), end || '', from, order, memo]);
    if (trialAgain) sh.getRange(wrote, 1, 1, R_COLS).setBackground('#fff2cc');

    return { ok: true, product: prod.code, tags: prod.tags, end: end ? ymd_(end) : '',
             extended: extended, newcomer: who.created, trialAgain: trialAgain };
  } finally { lock.releaseLock(); }
}

/** 視聴権シートの末尾に1行書く。UIDや注文キーが数字に化けないよう、先に書式を決めます */
function writeRight_(sh, vals) {
  const row = sh.getLastRow() + 1;
  [R_UID, R_MAIL, R_CODE, R_TAGS, R_ORDER].forEach(function (col) {
    sh.getRange(row, col).setNumberFormat('@');
  });
  sh.getRange(row, R_TIME).setNumberFormat('yyyy/MM/dd HH:mm');
  sh.getRange(row, R_START).setNumberFormat('yyyy/MM/dd');
  sh.getRange(row, R_END).setNumberFormat('yyyy/MM/dd');
  sh.getRange(row, 1, 1, R_COLS).setValues([vals]);
  return row;
}

/**
 * お求めの方が名簿に居るようにする。
 *   居る → 足りないほう（UID／メールアドレス）だけ埋める
 *   居ない → 1行足す（タグは空。パスワードも空＝あとでご本人が決める）
 */
function ensureBuyer_(uid, mail, name, prod) {
  const sh = studentSheet_();
  const list = students_();
  const byUid = uid ? list.filter(function (s) { return s.uid === uid; }) : [];
  let st = byUid.filter(function (s) { return !s.noMail; })[0] || byUid[0] || null;
  if (!st && mail) st = list.filter(function (s) { return !s.noMail && s.email === mail; })[0] || null;

  if (st) {
    if (uid && !st.uid) sh.getRange(st.row, S_UID).setNumberFormat('@').setValue(uid);
    if (mail && st.noMail && !list.some(function (s) { return !s.noMail && s.email === mail; })) {
      sh.getRange(st.row, S_MAIL).setValue(mail);
      moveWatch_(st.email, mail);
    }
    return { created: false, mail: st.noMail ? '' : st.email, name: st.name };
  }

  const row = sh.getLastRow() + 1;
  sh.getRange(row, S_UID).setNumberFormat('@');
  sh.getRange(row, 1, 1, S_COLS).setValues([[
    name, mail, '', '', '有効', '常時販売でご購入（' + prod.name + '）', nowStr_(), uid, ''
  ]]);
  return { created: true, mail: mail, name: name };
}

// ----- ③ メールアドレスとパスワードのご登録 -----
/**
 * LINEからお入りになった方が、あとからメールアドレスとパスワードを登録します。
 *   ・メールアドレスを入れられるのは、まだ空の方だけ
 *   ・パスワードを「今のパスワードなし」で決められるのは、まだ決めていない方だけ
 *   ・すでに名簿にあるアドレスは受けません（そちらのアカウントでログインしていただくと、
 *     LINEが結びついて視聴権もそちらへまとまります）
 */
function apiAccountSetup_(p) {
  const g = me_(p);
  if (!g.ok) return g;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const u = findStudent_(g.user.email);
    if (!u) return { ok: false, error: 'unauthorized' };
    const np = String(p.password == null ? '' : p.password).trim();
    let mail = '';
    if (u.noMail) {
      mail = email_(p.email);
      if (!mail || !okMail_(mail)) return { ok: false, error: 'bad_email' };
      if (findStudent_(mail)) return { ok: false, error: 'email_exists' };
    }
    if (np) {
      if (u.pass !== '') return { ok: false, error: 'already_set' };
      if (np.length < 4) return { ok: false, error: 'password_too_short' };
    }
    if (!mail && !np) return { ok: false, error: 'empty' };

    const sh = studentSheet_();
    if (mail) {
      sh.getRange(u.row, S_MAIL).setValue(mail);
      moveWatch_(u.email, mail);
      // 視聴権シートのメール欄も埋めておく（運営があとで見たときに誰か分かるように）
      const rsh = ss_().getSheetByName(SH_RIGHT);
      if (rsh && u.uid) {
        rightsAll_().forEach(function (r) {
          if (r.uid === u.uid && !r.mail) rsh.getRange(r.row, R_MAIL).setNumberFormat('@').setValue(mail);
        });
      }
    }
    if (np) {
      writePass_(sh, u.row, np);
      if (!u.firstSet) sh.getRange(u.row, S_FIRST).setValue(nowStr_());
    }
    const fresh = findStudent_(mail || u.email) || u;
    logLogin_(fresh, 'ご登録（メール・パスワード）');
    return { ok: true, token: makeToken_(fresh), user: userPayload_(fresh) };
  } finally { lock.releaseLock(); }
}

// ----- 片づけ -----
/**
 * 「LINEだけでご購入 → あとから本来のアカウントでログイン」という方の、仮の行を片づける。
 * 行は消しません（行番号がずれると、同じ処理の中の書き込み先が狂うため）。
 * UIDを空にしてメモを残すと、メールもUIDも空の行になり、以後は無視されます。
 */
function absorbPlaceholder_(uid, realMail) {
  try {
    if (!uid || !realMail || isVmail_(realMail)) return;
    const sh = studentSheet_();
    students_().forEach(function (s) {
      if (!s.noMail || s.uid !== uid) return;
      sh.getRange(s.row, S_UID).setValue('');
      sh.getRange(s.row, S_STATUS).setValue('停止');
      sh.getRange(s.row, S_MEMO).setValue((s.memo ? s.memo + '／' : '') + realMail + ' に統合ずみ（' + nowStr_() + '）');
      moveWatch_(s.email, realMail);
    });
  } catch (err) { /* 片づけの失敗でログインを止めない */ }
}

/** 視聴済みの記録を、古い見出し（仮のアドレス）から新しいアドレスへ移す */
function moveWatch_(from, to) {
  try {
    from = email_(from); to = email_(to);
    if (!from || !to || from === to) return;
    const sh = ss_().getSheetByName(SH_WATCH);
    if (!sh || sh.getLastRow() < 2) return;
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
    let fromRow = 0, toRow = 0;
    for (let i = 0; i < rows.length; i++) {
      const m = email_(rows[i][0]);
      if (m === from && !fromRow) fromRow = i + 2;
      if (m === to && !toRow) toRow = i + 2;
    }
    if (!fromRow) return;
    if (!toRow) { sh.getRange(fromRow, 1).setValue(to); return; }
    const ids = {};
    [rows[fromRow - 2][1], rows[toRow - 2][1]].forEach(function (cell) {
      s_(cell).split(',').forEach(function (x) { if (Number(x) > 0) ids[Number(x)] = true; });
    });
    const list = Object.keys(ids).map(Number).sort(function (a, b) { return a - b; });
    sh.getRange(toRow, 1, 1, 4).setValues([[to, list.join(','), list.length, nowStr_()]]);
    sh.getRange(fromRow, 1, 1, 4).setValues([['', '', '', '']]);
  } catch (err) { /* 記録の引っ越しに失敗しても、本処理は続ける */ }
}
