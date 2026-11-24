# 網域與專案命名規則

這份文件說明本專案在網域與 Pages 專案命名上的規則，避免部署後才發現網址對不上。

## 先釐清：哪個檔案是給誰的

| 檔案                      | 屬於       | 作用                                     |
| ------------------------- | ---------- | ---------------------------------------- |
| `wrangler.toml`           | Cloudflare | Pages 專案名稱、建置輸出目錄、非機密變數 |
| `functions/`              | Cloudflare | Pages Functions（OAuth proxy）           |
| `public/admin/config.yml` | Decap CMS  | CMS 介面設定，**不是** Cloudflare 設定   |

`config.yml` 雖然不是 Cloudflare 設定，但其中的 `base_url`、`site_url`、`display_url` 必須與實際網域一致，否則 GitHub OAuth 的 `redirect_uri` 對不上，CMS 會無法登入。

## 沒有自有網域時

Cloudflare Pages 會自動配發 `<專案名稱>.pages.dev`。

- 後綴 `.pages.dev` 固定，不可更改、不可替換成其他後綴。
- 前綴（專案名稱）可自訂，但受以下限制：
  - 只能使用小寫英文字母、數字與連字號 `-`
  - 開頭與結尾不能是連字號
  - 長度上限約 58 字元（預覽網址會再加上一層子網域）
  - 全球唯一，被占用就得換
- 專案名稱同時來自 `wrangler.toml` 的 `name` 與 Pages 後台的專案名，兩者必須相同。
- 專案建立後改名等於換網域，舊的 `*.pages.dev` 會失效。

結論：**前綴可自訂，後綴不可自訂。**

## 要完全自訂網域時

必須先擁有該網域，再於 Pages 專案 → Custom domains 綁定。免費方案即支援，綁定後 `*.pages.dev` 仍會保留。

- 網域在 Cloudflare 代管（zone）：apex 網域需把 nameserver 指向 Cloudflare，由 Cloudflare 自動建立 CNAME。
- 網域在其他 DNS 供應商：只能使用子網域，自行建立 CNAME 指向 `<專案名稱>.pages.dev`，且必須先在 Pages 後台完成綁定，否則會出現 522。
- 若網域有 CAA 記錄，需允許 Cloudflare 指定的 CA 簽發憑證。

## 本專案目前的命名

| 位置                               | 值                          |
| ---------------------------------- | --------------------------- |
| `wrangler.toml` `name`             | `shechen`                   |
| `public/admin/config.yml` 三處 URL | `https://shechen.pages.dev` |
| GitHub 儲存庫                      | `shechen-tw/shechen`        |

`shechen.pages.dev` 若已被占用，改為 `shechen-tw` 等名稱時，`wrangler.toml` 與 `config.yml` 三處必須同步修改。

## 改名檢查清單

1. 修改 `wrangler.toml` 的 `name`。
2. 修改 `public/admin/config.yml` 的 `base_url`、`site_url`、`display_url`。
3. GitHub OAuth App 的 Authorization callback URL 改為 `<新網域>/callback`。
4. 更新 `GITHUB_CLIENT_ID`、`SITE_URL` 等環境變數。
5. 執行 `pnpm build` 確認可建置，再重新部署。

## 在 Cloudflare 後台的操作（人工）

1. Workers & Pages → 建立 Pages 專案，專案名稱即最終網域前綴。
2. 建置設定：Framework preset `Astro`、Build command `pnpm build`、Output directory `dist`。
3. 設定環境變數 `GITHUB_CLIENT_ID`、`SITE_URL`；secret 用
   `wrangler pages secret put GITHUB_CLIENT_SECRET --project-name <專案名稱>`。
4. 需要自有網域時，於 Custom domains 綁定完成後才更新 `config.yml`。
