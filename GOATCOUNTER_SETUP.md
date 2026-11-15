# TORAMI GoatCounter セットアップ

1. https://www.goatcounter.com/ から既存アカウントにログインし、Settings → Sites で TORAMI 用の新しいサイトを作成（またはサイト追加）。
2. 発行されたサイトコード（例: torami-travel）を控える。HORAMI のコードは使わない。
3. `index.html`, `destination.html`, `gacha.html`, `journeys.html` の各ファイルにある `YOUR_TORAMI_CODE` を新コードに一括置換する。
4. GitHub Pages にアップロードして公開ページを開き、TORAMI の GoatCounter ダッシュボードで計測を確認。

ページビューは各HTMLの `<script data-goatcounter=...>` が自動計測します。

`assets/js/app.js` には以下のイベントを追加済みです。
- `torami-map-country-*` 世界地図の国クリック
- `torami-map-filter-*` 地図テーマ変更
- `torami-search-country`, `torami-search-city` 検索結果の選択
- `torami-gacha-country`, `torami-gacha-city` ガチャ抽選
- `torami-language-ja`, `torami-language-en` 言語変更

注意: コードを置き換える前は計測できません。プレビューやローカルファイルでは計測されないことがあります。個人情報や検索語の全文はイベントとして送信しません。

公式: https://www.goatcounter.com/help/start と https://www.goatcounter.com/help/events
