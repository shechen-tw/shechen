# 目錄結構

```
src/worker.ts         Worker 入口；只處理 /auth、/callback，其餘交 ASSETS
src/pages/            頁面
src/content/          內容集合（頁面 md、設定 yml）
src/content.config.ts 內容集合 schema 與 loader
public/admin/         Decap CMS 入口與設定
public/uploads/       CMS 上傳的媒體
docs/                 文件
wrangler.toml         Worker 名稱、靜態資源 binding、非機密變數
```

## 關鍵檔案

| 檔案                    | 說明                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| `wrangler.toml`         | `[assets]` 指向 `dist`，`run_worker_first` 僅放行 OAuth 兩條路由 |
| `src/worker.ts`         | OAuth proxy，含 state cookie 防 CSRF                             |
| `src/content.config.ts` | 集合 schema，需與 CMS 欄位一致                                   |
| `pnpm-workspace.yaml`   | pnpm 設定（提升規則、建置腳本允許清單）                          |

## 建置產物

`dist/` 由 `pnpm build` 產生，全部作為靜態資源上傳，不進版控。
