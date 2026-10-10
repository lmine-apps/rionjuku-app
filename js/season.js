/* =========================================================
   凛穏塾 動画視聴アプリ ── 季節の演出
   ---------------------------------------------------------
   ・いまの月日から「季節」と「特別な日」を決める。
     判定そのものは index.html の先頭でやっている（起動画面に間に合わせるため）。
     このファイルは、そこで決まったものに「ことば」と「ミニキャラ」を添える役。
   ・★ことばを直したいときは、下の SEASONS / FESTIVALS を書き換えるだけ。
     HTMLもCSSも触らなくて大丈夫です。
   ・特別な日は、季節より優先して出ます。
   ・ミニキャラは、その日だけ現れる小さなお楽しみ。
     ヘッダーのロゴの横と、コース選択のひとことの語尾に出ます。
     押すとぴょこんと跳ねます（気づいた方だけの隠し要素）。
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

  // ---- 特別な日（text＝ことば／mark＝ミニキャラ／label＝読み上げ用の名前）----
  var FESTIVALS = {
    newyear:     { text: 'あけましておめでとうございます。本年もよろしくお願いいたします。', mark: '🎍', label: '門松' },
    setsubun:    { text: '節分。心のうちの鬼も、そっと外へ。',                                 mark: '👹', label: '鬼' },
    hinamatsuri: { text: 'ひな祭り。やわらかな気持ちで過ごせますように。',                     mark: '🎎', label: 'ひな人形' },
    kodomo:      { text: 'こどもの日。のびやかな一日になりますように。',                       mark: '🎏', label: 'こいのぼり' },
    tanabata:    { text: '七夕。願いをひとつ、思い浮かべてみてください。',                     mark: '🎋', label: '笹' },
    halloween:   { text: '今日はハロウィン。すこし遊び心を。',                                 mark: '🎃', label: 'かぼちゃ' },
    xmas:        { text: 'メリークリスマス。あたたかい夜になりますように。',                   mark: '🎅', label: 'サンタ' },
    omisoka:     { text: '大晦日。一年、おつかれさまでした。',                                 mark: '🔔', label: '鐘' }
  };

  var el = document.documentElement;

  /** いまの季節と特別な日を返す。デモのときだけURLで差し替えられる */
  function current() {
    var s = (window.RJ_SEASON && window.RJ_SEASON.key) || 'haru';
    var f = (window.RJ_SEASON && window.RJ_SEASON.fes) || '';
    // 確認用の裏口。?mock=1 のときだけ ?season=aki&fes=xmas で切り替えられる
    if (window.RJ && window.RJ.MOCK) {
      var ms = location.search.match(/[?&]season=(haru|natsu|aki|fuyu)/);
      var mf = location.search.match(/[?&]fes=([a-z]+)/);
      if (ms) s = ms[1];
      if (mf) f = (mf[1] === 'none' || !FESTIVALS[mf[1]]) ? '' : mf[1];
      el.setAttribute('data-season', s);
      if (f) el.setAttribute('data-fes', f); else el.removeAttribute('data-fes');
    }
    return { key: s, fes: f };
  }

  var now = current();
  var fest = now.fes ? FESTIVALS[now.fes] : null;

  /** 押すとぴょこんと跳ねる。何度でも遊べる */
  function makeMark(where) {
    if (!fest) return null;
    var m = document.createElement('span');
    m.className = 'fes-mark';
    m.setAttribute('role', 'img');
    m.setAttribute('aria-label', fest.label);
    m.textContent = fest.mark;
    m.addEventListener('click', function (ev) {
      ev.stopPropagation();           // ヘッダーのボタンなどを巻き込まない
      m.classList.remove('hop');
      void m.offsetWidth;             // いったん止めてから、もう一度跳ねさせる
      m.classList.add('hop');
    });
    if (where === 'head') m.classList.add('fes-mark--head');
    return m;
  }

  function paint() {
    // ヘッダーのロゴの横（単一コースの方もここで目にする）
    var head = document.getElementById('fesMark');
    if (head) {
      if (fest) {
        head.textContent = fest.mark;
        head.setAttribute('aria-label', fest.label);
        head.classList.remove('hidden');
        head.addEventListener('click', function (ev) {
          ev.stopPropagation();
          head.classList.remove('hop');
          void head.offsetWidth;
          head.classList.add('hop');
        });
      } else {
        head.classList.add('hidden');
      }
    }

    // コース選択の上の、季節のひとこと
    var box = document.getElementById('seasonGreet');
    if (!box) return;
    var text = fest ? fest.text : (SEASONS[now.key] || '');
    if (!text) { box.classList.add('hidden'); return; }
    box.textContent = text;
    var mk = makeMark('greet');
    if (mk) box.appendChild(mk);
    box.classList.remove('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }

  // 他から参照したいとき用
  window.RJ_SEASON = { key: now.key, fes: now.fes };
})();
