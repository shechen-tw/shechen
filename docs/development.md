# 本機開發

## 前置

```bash
pnpm install
cp .env.example .dev.vars   # 填入本機用的值，wrangler dev 會讀取
```

## 啟動

```bash
pnpm dev   # http://localhost:4321
```

## 指令

| 指令                | 說明                                       |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | 啟動 Astro 開發伺服器                      |
| `pnpm cms`          | 啟動 decap-server（http://localhost:8081） |
| `pnpm check`        | `astro check` + Worker 型別檢查            |
| `pnpm build`        | 產出 `dist/`                               |
| `pnpm preview`      | 建置後以 `wrangler dev` 本機預覽           |
| `pnpm deploy`       | 建置並部署到 Cloudflare Workers            |
| `pnpm format`       | Prettier 格式化                            |
| `pnpm format:check` | 檢查格式                                   |

## 在本機使用 CMS

`public/admin/config.yml` 的 `local_backend: true` 會讓 CMS 直接寫入本機檔案，不需要 GitHub 登入。

1. 終端機一開 `pnpm cms`。
2. 另一開 `pnpm dev`。
3. 開 <http://localhost:4321/admin/>。

## 預覽 Worker 行為

`pnpm dev` 只跑 Astro，不含 `/auth` 與 `/callback`。要驗證 Worker 路由與 OAuth 轉址：

```bash
pnpm preview
```

`wrangler dev` 會讀 `.dev.vars`，可用假值觀察 `/auth` 的 302 與 cookie。
