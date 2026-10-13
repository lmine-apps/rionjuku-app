/* =========================================================
   凛穏塾 動画視聴アプリ ── 季節とサプライズの演出
   ---------------------------------------------------------
   月に2〜3回、アプリを開いたときだけ出会える演出を出す。
   「私が最初に見つけた！」という楽しさを作るのがねらい。

   演出は2つの型。
     🔵 謎かけ型 … 絵文字だけ出す。ことばもお題も出さない。
                   「なんで猫？」と思ってもらうのがねらいなので、答えは置かない。
     🟡 ことば型 … ご先祖・ご家族に関わる日など、学びと直結する日だけ
                   ことばとお題を添える。

   ★ことば・絵文字・お題を直したいときは、下の SEASONS / DAYS を書き換えるだけ。
     text を空にすれば謎かけ型、task を空にすればお題なし。HTMLもCSSも触りません。

   ★日が年によって動くもの（立春・春分・夏至・お彼岸など）は、表を持たずに
     **太陽の位置から計算**しています。毎年の更新は要りません。

   季節（春夏秋冬）の判定だけは index.html の先頭にあります。
   起動画面の光の色と舞うものに、間に合わせる必要があるためです。
========================================================= */
(function () {
  'use strict';

  // ---- 季節のことば（3〜5月＝春／6〜8月＝夏／9〜11月＝秋／12〜2月＝冬）----
  var SEASONS = {
    haru:  '芽吹きの季節。すこしずつ、はじめていきましょう。',
    natsu: '陽の長い季節。涼しい時間に、ひとつ学びを。',
    aki:   '実りの季節。学びを深めるのに、よい頃です。',
    fuyu:  '静かな季節。内側をあたためる時間に。'
  };

  /* ---- 特別な日 ----------------------------------------------------------
     mark  … ミニキャラ（絵文字）
     label … 読み上げ用の名前
     text  … その日のことば。空にすると季節のことばのまま＝🔵謎かけ型
     task  … 「今日のアウトプット」のお題。空にすると出さない
     ★ことば型の文面は、みこさんの教えに関わるところです。確認を取ってから。
  ------------------------------------------------------------------------- */
  var DAYS = {
    /* ===== 🟡 ことば型 ===== */
    newyear: {
      mark: '🎍', label: '門松',
      text: 'あけましておめでとうございます。本年もよろしくお願いいたします。',
      task: '今年ひとつだけ、続けたい習慣を決めてアウトプットしてみませんか。'
    },
    setsubun: {
      mark: '👹', label: '鬼',
      text: '節分。心のうちの鬼も、そっと外へ。',
      task: '手放したい思い込みをひとつ、アウトプットしてみませんか。'
    },
    hinamatsuri: {
      mark: '🎎', label: 'ひな人形',
      text: 'ひな祭り。やわらかな気持ちで過ごせますように。',
      task: 'お母さまから受け取ったものを、ひとつアウトプットしてみませんか。'
    },
    shunbun: {
      mark: '🌸', label: '桜',
      text: '春のお彼岸。ご先祖に心を向ける日です。',
      task: 'ご先祖から受け継いだと感じるものを、ひとつアウトプットしてみませんか。'
    },
    hanamatsuri: {
      mark: '🪷', label: '蓮',
      text: '花まつり。お釈迦さまがお生まれになった日です。',
      task: '講義で心に残っている教えを、ひとつアウトプットしてみませんか。'
    },
    kodomo: {
      mark: '🎏', label: 'こいのぼり',
      text: 'こどもの日。のびやかな一日になりますように。',
      task: '子どもの頃に好きだったことを、ひとつアウトプットしてみませんか。'
    },
    hahanohi: {
      mark: '💐', label: '花束',
      text: '母の日。いまのご自分につながる、はじまりの方へ。',
      task: 'お母さまに伝えたいことを、ひとつアウトプットしてみませんか。'
    },
    chichinohi: {
      mark: '🌻', label: 'ひまわり',
      text: '父の日。受け継いだものに、そっと目を向けて。',
      task: 'お父さまから受け取ったものを、ひとつアウトプットしてみませんか。'
    },
    tanabata: {
      mark: '🎋', label: '笹',
      text: '七夕。願いをひとつ、思い浮かべてみてください。',
      task: 'その願いを「誰かのために」の形に言いかえて、アウトプットしてみませんか。'
    },
    obon: {
      mark: '🏮', label: '提灯',
      text: 'お盆。ご先祖をお迎えする日です。',
      task: '手を合わせて思い浮かんだことを、ひとつアウトプットしてみませんか。'
    },
    shubun: {
      mark: '🍂', label: '落ち葉',
      text: '秋のお彼岸。ご先祖に心を向ける日です。',
      task: '家族の中で受け継ぎたいことを、ひとつアウトプットしてみませんか。'
    },
    shichigosan: {
      mark: '⛩️', label: '鳥居',
      text: '七五三。健やかな成長を願う日です。',
      task: '誰かの成長で嬉しかったことを、ひとつアウトプットしてみませんか。'
    },
    xmas: {
      mark: '🎅', label: 'サンタ',
      text: 'メリークリスマス。あたたかい夜になりますように。',
      task: '身近な方に伝えた「ありがとう」を、アウトプットしてみませんか。'
    },
    omisoka: {
      mark: '🔔', label: '鐘',
      text: '大晦日。一年、おつかれさまでした。',
      task: '今年いちばん心に残った講義を、ひとつ選んでアウトプットしてみませんか。'
    },

    /* ===== 🔵 謎かけ型（絵文字だけ。説明しない） ===== */
    nanakusa:     { mark: '🌿', label: '七草',           text: '', task: '' },
    kagamibiraki: { mark: '🍡', label: '鏡餅',           text: '', task: '' },
    risshun:      { mark: '🌱', label: '芽',             text: '', task: '' },
    neko:         { mark: '🐈', label: '猫',             text: '', task: '' },
    shinnendo:    { mark: '🌷', label: 'チューリップ',   text: '', task: '' },
    hachijuhachiya: { mark: '🍵', label: 'お茶',         text: '', task: '' },
    koromogae6:   { mark: '👘', label: '着物',           text: '', task: '' },
    geshi:        { mark: '☀️', label: '太陽',           text: '', task: '' },
    risshu:       { mark: '🌾', label: '稲穂',           text: '', task: '' },
    choyo:        { mark: '🌼', label: '菊',             text: '', task: '' },
    koromogae10:  { mark: '🧥', label: '上着',           text: '', task: '' },
    halloween:    { mark: '🎃', label: 'かぼちゃ',       text: '', task: '' },
    ritto:        { mark: '❄️', label: '雪',             text: '', task: '' },
    kinro:        { mark: '🙏', label: '合掌',           text: '', task: '' },
    toji:         { mark: '🍊', label: 'ゆず',           text: '', task: '' }
  };

  /* ===== 暦の計算 ==========================================================
     二十四節気（立春・春分・夏至・立秋・秋分・立冬・冬至）は年によって日が動く。
     年ごとの表を持つと毎年の更新が必要になるので、太陽の位置から計算して求める。
     誤差は数分なので、日付としては常に正しい。
  ========================================================================= */

  /** その日の0時（世界時）のユリウス日 */
  function toJd(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  }

  /** ユリウス日 → 日本時間の年月日 */
  function fromJd(j) {
    var ms = (j - 2440587.5) * 86400000 + 9 * 3600000;   // +9時間＝日本時間
    var dt = new Date(ms);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  /** 太陽の黄経（度）。j は世界時のユリウス日 */
  function sunLongitude(j) {
    var t = (j - 2451545.0) / 36525;
    var rad = Math.PI / 180;
    var l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    var m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    var c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * rad)
          + (0.019993 - 0.000101 * t) * Math.sin(2 * m * rad)
          + 0.000289 * Math.sin(3 * m * rad);
    var v = (l0 + c) % 360;
    return v < 0 ? v + 360 : v;
  }

  /** 太陽の黄経が target 度になる瞬間を探して、日本時間の月日で返す */
  function solarTerm(year, target) {
    function diff(j) {
      var v = sunLongitude(j) - target;
      while (v > 180) v -= 360;
      while (v < -180) v += 360;
      return v;
    }
    // 春分(0度)を起点に、おおよその日を見積もってから二分法で詰める
    var approx = toJd(year, 1, 1) + ((target + 79) % 360) * 1.0146;
    var lo = approx - 20, hi = approx + 20;
    var n = 0;
    while (diff(lo) > 0 && n++ < 5) lo -= 20;
    n = 0;
    while (diff(hi) < 0 && n++ < 5) hi += 20;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (diff(mid) < 0) lo = mid; else hi = mid;
    }
    var r = fromJd(lo);
    r.jd = lo;
    return r;
  }

  /** 第n週の指定曜日の日にち（0=日曜）。母の日・父の日用 */
  function nthWeekday(year, month, weekday, nth) {
    var first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return 1 + ((weekday - first + 7) % 7) + (nth - 1) * 7;
  }

  /** 立春を1日目として n 日目（八十八夜＝88日目） */
  function fromRisshun(year, n) {
    return fromJd(solarTerm(year, 315).jd + (n - 1));
  }

  /** きょうが何の日か。何でもなければ空文字 */
  function findDay(now) {
    var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    function is(t) { return m === t.m && d === t.d; }

    var risshun = solarTerm(y, 315);              // 立春
    var setsubun = fromJd(risshun.jd - 1);        // 節分＝立春の前日

    if (m === 1 && d <= 3) return 'newyear';
    if (m === 1 && d === 7) return 'nanakusa';
    if (m === 1 && d === 11) return 'kagamibiraki';
    if (is(setsubun)) return 'setsubun';
    if (is(risshun)) return 'risshun';
    if (m === 2 && d === 22) return 'neko';
    if (m === 3 && d === 3) return 'hinamatsuri';
    if (is(solarTerm(y, 0))) return 'shunbun';            // 春分・お彼岸
    if (m === 4 && d === 1) return 'shinnendo';
    if (m === 4 && d === 8) return 'hanamatsuri';
    if (is(fromRisshun(y, 88))) return 'hachijuhachiya';  // 八十八夜
    if (m === 5 && d === 5) return 'kodomo';
    if (m === 5 && d === nthWeekday(y, 5, 0, 2)) return 'hahanohi';
    if (m === 6 && d === 1) return 'koromogae6';
    if (m === 6 && d === nthWeekday(y, 6, 0, 3)) return 'chichinohi';
    if (is(solarTerm(y, 90))) return 'geshi';             // 夏至
    if (m === 7 && d === 7) return 'tanabata';
    if (is(solarTerm(y, 135))) return 'risshu';           // 立秋
    if (m === 8 && d >= 13 && d <= 16) return 'obon';
    if (m === 9 && d === 9) return 'choyo';
    if (is(solarTerm(y, 180))) return 'shubun';           // 秋分・お彼岸
    if (m === 10 && d === 1) return 'koromogae10';
    if (m === 10 && d === 31) return 'halloween';
    if (is(solarTerm(y, 225))) return 'ritto';            // 立冬
    if (m === 11 && d === 15) return 'shichigosan';
    if (m === 11 && d === 23) return 'kinro';
    if (is(solarTerm(y, 270))) return 'toji';             // 冬至
    if (m === 12 && (d === 24 || d === 25)) return 'xmas';
    if (m === 12 && d === 31) return 'omisoka';
    return '';
  }

  // ===== ここから表示 =====
  var el = document.documentElement;

  function current() {
    var s = (window.RJ_SEASON && window.RJ_SEASON.key) || 'haru';
    var f = '';
    try { f = findDay(new Date()); } catch (e) { f = ''; }
    // 確認用の裏口。?mock=1 のときだけ ?season=aki&fes=neko で切り替えられる
    if (window.RJ && window.RJ.MOCK) {
      var ms = location.search.match(/[?&]season=(haru|natsu|aki|fuyu)/);
      var mf = location.search.match(/[?&]fes=([a-zA-Z0-9]+)/);
      if (ms) s = ms[1];
      if (mf) f = (mf[1] === 'none' || !DAYS[mf[1]]) ? '' : mf[1];
    }
    el.setAttribute('data-season', s);
    if (f) el.setAttribute('data-fes', f); else el.removeAttribute('data-fes');
    return { key: s, fes: f };
  }

  var now = current();
  var fest = now.fes ? DAYS[now.fes] : null;

  /** 押すとぴょこんと跳ねる */
  function hop(m) {
    m.addEventListener('click', function (ev) {
      ev.stopPropagation();           // ヘッダーのボタンなどを巻き込まない
      m.classList.remove('hop');
      void m.offsetWidth;             // いったん止めてから、もう一度跳ねさせる
      m.classList.add('hop');
    });
  }

  function paint() {
    // ヘッダーのロゴの横（コースが1つだけの方もここで目にする）
    var head = document.getElementById('fesMark');
    if (head) {
      if (fest) {
        head.textContent = fest.mark;
        head.setAttribute('aria-label', fest.label);
        head.classList.remove('hidden');
        hop(head);
      } else {
        head.classList.add('hidden');
      }
    }

    // 「コースを選んでください」の語尾にも
    var h = document.querySelector('#scPicker h1');
    if (h && fest && !h.querySelector('.fes-mark')) {
      var mk = document.createElement('span');
      mk.className = 'fes-mark fes-mark--title';
      mk.setAttribute('role', 'img');
      mk.setAttribute('aria-label', fest.label);
      mk.textContent = fest.mark;
      hop(mk);
      h.appendChild(mk);
    }

    // その日のお題（ことば型の日だけ）
    var task = document.getElementById('seasonTask');
    if (task) {
      if (fest && fest.task) {
        task.innerHTML = '<span class="season-task__t"></span><span class="season-task__b"></span>';
        task.querySelector('.season-task__t').textContent = '今日のアウトプット';
        task.querySelector('.season-task__b').textContent = fest.task;
        task.classList.remove('hidden');
      } else {
        task.classList.add('hidden');
      }
    }

    // コース選択の上のひとこと（ことばが空の日は季節のことばのまま）
    var box = document.getElementById('seasonGreet');
    if (!box) return;
    var text = (fest && fest.text) ? fest.text : (SEASONS[now.key] || '');
    if (!text) { box.classList.add('hidden'); return; }
    box.textContent = text;
    box.classList.remove('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }

  window.RJ_SEASON = { key: now.key, fes: now.fes };
  window.RJ_FINDDAY = findDay;   // 確認用
})();
