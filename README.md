# TORAMI TRAVEL ✧ GitHub Pages v1

HORAMI CINEMA と世界観をそろえた、静的な旅のWebサイト。**GitHub Pagesにそのまま配置でき、ビルド・インストール不要**です。

## 1. 最初にすること

1. `TORAMI_TRAVEL_GitHub_Pages_v1.zip` をPC上で解凍してください。
2. **ZIPファイルそのものではなく、解凍後のファイル・フォルダを全て** GitHubのリポジトリの一番上の階層へアップロードしてください。`index.html` がルートにある必要があります。
3. GitHubの `Settings → Pages` で `Deploy from a branch` → `main` → `/(root)` を選んで保存します（既に設定済みなら確認だけでOK）。
4. 公開されたサイトで地図・検索・旅ガチャ・言語切替を確認してください。

アップロードするもの：`index.html`、`destination.html`、`gacha.html`、`journeys.html`、`favicon.svg`、`data/`、`assets/`、`.nojekyll`、`robots.txt`、`content/` など。フォルダ構造は維持してください。

### 注意：35ヶ国のデータを必ず確認

頂いたスクリーンショットには**35ヶ国＋2地域**と表示されています。そこは正確に記載しています。しかし、小さな国や隣接国について画像のみから全35件を特定するのは難しいため、色を塗るリストは**暫定**です。

**`data/destinations.js` の `visitedCountryNames` を実際に行った35ヶ国へ修正してください。** 国名は `data/world.geojson` の `properties.name` と一致させる必要があります。ここで使っているのはNatural Earth由来の国名です（例：アメリカ = `United States of America`、チェコ = `Czechia`）。

`visitedListVerified:false` を確認後に `true` に変更できます。現在のサイトには仮データであることを明示する注記があります。自動的な訪問履歴収集や位置情報追跡は一切しません。

## 2. ブランドとフォント

- 大きなロゴ：本プロジェクトで作成した `assets/images/torami-pearl-wordmark.webp`（HORAMI参考ロゴと同系統の真珠・虹色ガラス文字）
- 見出し：**Cormorant Garamond**
- 日本語本文：**Noto Serif JP**
- ボタン・メタ文字：**DM Sans**
- ブランド色：`#81d8d0` Tiffany mint / `#1d4e4d` deep jade / champagne accents
- パーツ：半透明パールガラス、白い細いボーダー、控えめな光彩

Google Fontsを使用しています。通信環境により日本語・英字の代替フォントになります。フォントファイルは同梱していません。

## 3. 機能

- `index.html`：ファーストビュー、タップ可能な世界地図、5つのテーマ表示、国・都市検索（候補表示）、国のハイライト、特集カード、ガチャ・旅日記導線
- `destination.html?country=greece`：国ガイド（URLに `&city=Santorini` があると都市表示）、都市一覧、旅行メモ枠、公式安全情報へのリンク
- `gacha.html`：条件別の国抽選 → 都市抽選（2段階） → 目的地ガイドへのリンク
- `journeys.html`：訪問国一覧の下書き・本人の写真とレビューを掲載するための土台
- 全ページ：日本語／英語の切替、スマホ対応、キーボード操作への配慮、縮小アニメーション設定への対応
- 世界地図はローカルデータ（`data/world.js`）。外部APIキーは不要です。

**安全・予算・流行のリアルタイム評価は未実装**です。今の段階で架空の安全スコアを付けることは避け、外務省の公式海外安全情報へリンクしています。将来追加する場合は更新日と情報源を明示してください。

## 4. 旅行先・都市の編集

`data/destinations.js` の `guides` 配列に国を追加できます。1件の例：

```js
{
  key:'iceland', name:'Iceland', ja:'アイスランド', continent:'Europe',
  type:['nature'], budget:'high', photo:'iceland.webp',
  city:'Reykjavík', cityJa:'レイキャビク',
  cities:[['Reykjavík','レイキャビク'],['Akureyri','アークレイリ']],
  tag:'THE NORTHERN LIGHT', tagJa:'光の国',
  desc:'Sample travel inspiration.', descJa:'旅先紹介の仮テキスト。'
}
```

写真を追加するときは `assets/images/iceland.webp` を置き、`photo:'iceland.webp'` と設定してください。ユーザー提供写真への差し替えを想定しています。

*現在の特集国・都市は**デザイン確認用のエディトリアルサンプル**です。本人が訪れた・利用した・評価したということを意味しません。* 個人レビューや費用を掲載する場合、実際の経験をもとに更新してください。

## 5. Instagram のリンク

TORAMIのInstagramユーザー名は未確定なので、別ブランド HORAMI の `dontlookback25` を誤って表示していません。

アカウント作成後、`data/destinations.js` の `instagramUrl: ''` を、例えば `https://www.instagram.com/確定したユーザー名/` に変更してください。リンクが設定されるとヘッダーと末尾のInstagramボタンが外部リンクになります。

Instagramの4週間の運用案は `content/INSTAGRAM_PLAYBOOK.md` にあります。

## 6. 自分のWebサイトに入れておくべき情報

公開前の優先チェック：

- [ ] 実際の渡航国35件を照合（地図の色を確認）
- [ ] 「＋2地域」の対象を特定（必要ならタグ付きマーカーを追加）
- [ ] TORAMI Instagram URLを入力
- [ ] 写真・文章を自分のものに差し替える
- [ ] デモの旅先紹介を事実確認してから公開する
- [ ] 運用するGitHub Pages URLが決まったらOGの絶対URL・`sitemap.xml`を設定
- [ ] 運用に必要なプライバシー・広告／アフィリエイト表示などを検討

## 7. ファイル構成

```
index.html                     # ホーム
index.html#world-map           # 地図
index.html#destinations        # 特集
 destination.html              # 国・都市の案内
 gacha.html                    # 二段階旅ガチャ
 journeys.html                 # 旅行記
 assets/css/style.css          # 共通デザイン
 assets/js/app.js              # マップ / 検索 / 言語 / ガチャ
 assets/images/                # ロゴ・装飾・特集写真
 data/destinations.js          # 訪問国、国・都市データ、IG URL
 data/world.js                 # 読み込み用の世界地図
 data/world.geojson            # 編集・拡張用の原データ
 content/INSTAGRAM_PLAYBOOK.md # 運用企画
 favicon.svg
 .nojekyll
 robots.txt
```

## 8. クレジット

世界地図の形状：Natural Earth 1:110m （public domain）。特集のギリシャ・チェコ・モルディブのイメージはユーザーに以前提供したサイト構想画像の一部をトリミングしたものです。実際の取材写真と混同されないよう、公開前の差し替えをおすすめします。

このv1は、サイトの雰囲気と機能を検証するための公開可能な**プロトタイプ**です。予約システム、外部データ更新、ログイン管理、Instagramの自動投稿は含まれません。
