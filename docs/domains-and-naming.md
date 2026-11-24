# 網域與 Worker 命名規則

這份文件說明本專案在網域與 Worker 命名上的規則，避免部署後才發現網址對不上。

## 先釐清：哪個檔案是給誰的

| 檔案                      | 屬於       | 作用                                        |
| ------------------------- | ---------- | ------------------------------------------- |
| `wrangler.toml`           | Cloudflare | Worker 名稱、靜態資源目錄、非機密變數       |
| `src/worker.ts`           | Cloudflare | Worker 入口（OAuth proxy，其餘轉給 ASSETS） |
| `public/admin/config.yml` | Decap CMS  | CMS 介面設定，**不是** Cloudflare 設定      |

`config.yml` 雖然不是 Cloudflare 設定，但其中的 `base_url`、`site_url`、`display_url` 必須與實際網域一致，否則 GitHub OAuth 的 `redirect_uri` 對不上，CMS 會無法登入。

## 沒有自有網域時

Cloudflare Workers 會給每個 Worker `https://<worker 名稱>.<帳號子網域>.workers.dev`。

- `<帳號子網域>` 是 Cloudflare 帳號層級設定，全帳號共用，可改但只能取一次。
- `<worker 名稱>` 可自訂，但受以下限制：
  - 只能使用小寫英文字母、數字與連字號 `-`
  - 開頭與結尾不能是連字號
  - 長度上限 63 字元
  - 同一帳號內唯一
- Worker 名稱同時來自 `wrangler.toml` 的 `name` 與 Cloudflare 後台，兩者必須相同。
- 改名等於換網址，舊網址失效。

結論：**Worker 名稱可自訂，`workers.dev` 後綴不可自訂。**

## 要完全自訂網域時

必須先擁有該網域，再於 Worker → Settings → Domains & Routes 綁定。

- 網域在 Cloudflare 代管（zone）：apex 與子網域皆可，DNS 記錄由 Cloudflare 自動建立。
- 網域在其他 DNS 供應商：只能使用子網域，自行建立 CNAME 指向 Worker，且必須先在後台完成綁定，否則會無法解析。
- 若網域有 CAA 記錄，需允許 Cloudflare 指定的 CA 簽發憑證。

## 本專案目前的命名

| 位置                               | 值                                                  |
| ---------------------------------- | --------------------------------------------------- |
| `wrangler.toml` `name`             | `shechen`                                           |
| `public/admin/config.yml` 三處 URL | `https://shechen.example.workers.dev`（待填實際值） |
| GitHub 儲存庫                      | `shechen-tw/shechen`                                |

## 改名檢查清單

1. 修改 `wrangler.toml` 的 `name`。
2. 修改 `public/admin/config.yml` 的 `base_url`、`site_url`、`display_url`。
3. GitHub OAuth App 的 Authorization callback URL 改為 `<新網域>/callback`。
4. 更新 `GITHUB_CLIENT_ID`、`SITE_URL` 等環境變數。
5. 執行 `pnpm build` 與 `npx wrangler deploy --dry-run` 確認可部署，再正式部署。

## 在 Cloudflare 後台的操作（人工）

1. `npx wrangler login` 後執行 `pnpm deploy`；首次會建立名為 `shechen` 的 Worker。
2. 用 `npx wrangler secret put GITHUB_CLIENT_SECRET` 設定機密。
3. 需要自有網域時，於 Domains & Routes 綁定完成後才更新 `config.yml`。
