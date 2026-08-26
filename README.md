# 台北分頭行 — 9/12

2026 年 9 月 12 日（六）一家四口從台中上台北的一日行程。上午在南港，下午拆成兩路：
一路去南京東路聽講座，一路帶五歲的孩子逛袖珍博物館，五點在餐廳門口會合吃晚餐。
另含南港到松江南京的逐站捷運路線圖。

純靜態 HTML + CSS，無建置步驟。

## 設計

顏色沿用台北捷運的路線指引語彙——板南線的藍給講座那一路，暖琥珀給親子那一路，
松山新店線的綠給共同行程（會合、移動、用餐）。版面中段刻意「分岔」成兩欄再「合流」，
對應當天實際的動線，不是裝飾。

字體：Noto Serif TC（標題）／ Noto Sans TC（內文）／ IBM Plex Mono（時刻，時刻表語感）。

## 部署

- GitHub Pages：<https://rafaelhou.github.io/taipei-0912/>（main 分支根目錄）
- Cloudflare Pages：Git 連結，push 到 main 自動部署

## 收錄設定

`robots.txt` 對一般搜尋引擎 `Allow: /`，靠每頁的 `<meta name="robots" content="noindex, follow">`
把頁面移出索引；AI 訓練與 AI 搜尋爬蟲則直接 `Disallow: /`。`_headers` 另加
`X-Robots-Tag: noindex, noarchive`（Cloudflare Pages 生效，GitHub Pages 不支援但放著無害）。

## 資料來源

行程內容整理自各場館與餐廳的公開資訊，出發前請再確認一次營業時間與門牌。
