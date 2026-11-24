# 內容管理

內容由 Decap CMS 管理，入口為 `/admin/`，設定檔為 `public/admin/config.yml`。

## 登入

1. 前往 `<站台網址>/admin/`。
2. 以具有儲存庫權限的 GitHub 帳號登入。

登入走 GitHub OAuth，由 `src/worker.ts` 的 `/auth` 與 `/callback` 處理。

## 編輯

集合分為兩類：

- **頁面**：`src/content/pages`，Markdown 檔，欄位為標題、描述、草稿、內容。
- **網站設定**：`src/content/settings/general.yml`，全站名稱、描述、聯絡信箱、社群連結。

## 發布流程

`publish_mode: editorial_workflow` 已啟用：

1. 存檔後進入 Draft。
2. 送審後進入 In review。
3. 在 CMS 介面按 Publish 才會合併並觸發部署。

`main` 的必要檢查 `build` 必須先通過才能合併。若剛存檔就馬上按 Publish，CI 還沒跑完會被挡下（訊息：`Required status check "build" is expected`），等綠燈後再按一次 Publish 即可。

## 圖片

上傳到 `public/uploads`，前台路徑為 `/uploads/...`。CMS 會自動處理路徑，不需手動改。

## 注意

- `main` 受分支保護，CMS 發布同樣走 PR／合併流程，與一般開發一致（見 `contributing.md`）。
- 欄位異動需同時改 `public/admin/config.yml` 與 `src/content.config.ts` 的 schema，否則建置會失敗。
- CMS 需要 OAuth 環境變數齊全才能登入，本機請改用 `local_backend`（見 `development.md`）。
