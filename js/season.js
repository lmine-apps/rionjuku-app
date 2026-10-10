/* =========================================================
   凛穏塾 動画視聴アプリ ── 季節の演出
   ---------------------------------------------------------
   ・いまの月日から「季節」と「特別な日」を決める。
     判定そのものは index.html の先頭でやっている（起動画面に間に合わせるため）。
     このファイルは、そこで決まったものに「ことば」を添える役。
   ・★ことばを直したいときは、下の SEASONS / FESTIVALS を書き換えるだけ。
     HTMLもCSSも触らなくて大丈夫です。
   ・特別な日は、季節より優先して出ます。
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

  // ---- 特別な日のことば（その日だけ、季節のことばに代わって出ます）----
  var FESTIVALS = {
    newyear:  'あけましておめでとうございます。本年もよろしくお願いいたします。',
    setsubun: '節分。心のうちの鬼も、そっと外へ。',
    tanabata: '七夕。願いをひとつ、思い浮かべてみてください。',
    omisoka:  '大晦日。一年、おつかれさまでした。'
  };

  var el = document.documentElement;

  /** いまの季節と特別な日を返す。デモのときだけURLで差し替えられる */
  function current() {
    var s = (window.RJ_SEASON && window.RJ_SEASON.key) || 'haru';
    var f = (window.RJ_SEASON && window.RJ_SEASON.fes) || '';
    // 確認用の裏口。?mock=1 のときだけ ?season=aki&fes=tanabata で切り替えられる
    if (window.RJ && window.RJ.MOCK) {
      var ms = location.search.match(/[?&]season=(haru|natsu|aki|fuyu)/);
      var mf = location.search.match(/[?&]fes=(newyear|setsubun|tanabata|omisoka|none)/);
      if (ms) s = ms[1];
      if (mf) f = (mf[1] === 'none') ? '' : mf[1];
      el.setAttribute('data-season', s);
      if (f) el.setAttribute('data-fes', f); else el.removeAttribute('data-fes');
    }
    return { key: s, fes: f };
  }

  var now = current();

  /** コース選択の上に、そっと一行だけ添える */
  function paint() {
    var box = document.getElementById('seasonGreet');
    if (!box) return;
    var text = (now.fes && FESTIVALS[now.fes]) || SEASONS[now.key] || '';
    if (!text) { box.classList.add('hidden'); return; }
    box.textContent = text;
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
