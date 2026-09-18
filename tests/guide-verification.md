# ページ式使い方ガイド（v37）

## 変更と動作
- js/app.js：既存ガイドを5ページに更新。動画視聴、続き・目次・視聴済み、ホーム画面追加、通知設定、困ったとき。ログイン後の起動時に一度表示。
- スキップ／Escape／読み終わり：今回だけ閉じる。次回起動も表示する。
- 今後表示しない：同じ利用者・ブラウザの自動表示を抑止。デモと本番は分離。
- 旧ガイドの記録は閉じただけでも保存されていたため流用しない。既存利用者にも新ガイドを表示する。
- 保存拒否時は成功扱いにせず、メッセージを表示。右上メニューからいつでも読み直せる。
- 通知の許可はガイドから自動要求しない。既存「通知の設定」で本人が操作する。
- css/style.css：既存トークンによる濃紺・水色。15px本文、14px補助文。本文スクロールと固定フッター。動きを減らす設定に対応。
- index.html / admin.html：v36→v37のみ。静的HTML構造は変更なし。
- tests/guide.test.cjs：非表示保存・利用者分離・起動の重複抑止など8項目。

## 確認
- node --test tests/guide.test.cjs tests/resume.test.cjs：26件成功。
- Codex内蔵ブラウザ、mock=1のみ。375×812、390×844、1366×900。
- 全5ページ、前後移動、端末タブ、スキップ後の再起動、非表示後の再起動、メニューから再表示、完了、Escape、Tab循環、フォーカス復帰を確認。
- 新たな通知送信や権限の変更は実施しない。実機iPhone/Androidでの通知受信とPWA起動、OSのダークモード切替は未検証。
- ガイド閉じた後は、従来の未読お知らせがあれば続けて表示される。
- GAS、config.js、common.js、運営機能、生成マニュアルは変更なし。pushは別途承認後。

## 通知案内の参照元
- https://support.apple.com/en-by/guide/iphone/iphea86e5236/ios
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- https://support.google.com/chrome/answer/3220216?co=GENIE.Platform%3DAndroid