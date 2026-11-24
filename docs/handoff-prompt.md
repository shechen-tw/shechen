# 交接用 Prompt（在 dev container 內貼給 AI 助手）

> 用途：骨架已建立、尚未安裝套件。開啟 dev container 後，把下面整段貼給助手繼續。

---

## 背景

- 專案：`shechen` 品牌網站（GitHub: `shechen-tw/shechen`，分支 `master`，尚無 commit）
- 技術：Astro（`output: 'static'`）+ Cloudflare Pages（`wrangler.toml` + `functions/`）+ Decap CMS + GitHub
- 語系：繁體中文（zh-TW）單一語系
- 目前階段：**只做工程骨架，不寫網站頁面／樣式**（首頁僅佔位）
- 骨架已完成：`package.json`、`astro.config.mjs`、`tsconfig.json`、`wrangler.toml`、`.devcontainer/`、`.github/workflows/ci.yml`、`.prettierrc.mjs`、`.gitignore`、`.env.example`、`public/admin/{index.html,config.yml}`、`functions/{auth.ts,callback.ts}`、`src/content/config.ts`、`src/pages/index.astro`

## 你要做的事

1. 安裝依賴（尚未安裝，先前被取消）：
   ```bash
   npm install astro
   npm install -D @astrojs/check typescript wrangler decap-server @cloudflare/workers-types prettier prettier-plugin-astro
   ```
2. 建立 `package-lock.json` 後確認 `npm ci` 可用。
3. 驗證骨架能跑：
   ```bash
   npm run check
   npm run build
   ```
   兩者都要通過（`astro check` 需 0 error；build 需產出 `dist/`）。
4. 修掉任何因版本差異造成的設定問題，但**不要**加入 UI 元件、CSS 框架或頁面內容。
5. 補一份 `README.md`：專案用途、本機啟動（`npm run dev` / `npm run cms` / `npm run preview`）、必要環境變數、Cloudflare Pages 部署步驟、GitHub OAuth App 設定（callback 為 `/callback`，secret 用 `wrangler pages secret put`）、`/admin/` 使用說明、**mermaid 部署流程圖**。
6. 本機驗證完成後，做第一次 commit（`chore: 建立專案骨架`），並列出需要在 GitHub／Cloudflare 後台手動完成的事項（不代為操作）。
7. `.devcontainer/devcontainer.json` 的 `postCreateCommand` 已是 `npm install`；確認容器內 `node -v` 為 20.x。

## 約束

- 不要引入 React/Vue/Tailwind 等框架，除非有明確理由並先說明。
- 不要改動 `public/admin/config.yml` 的 `repo`／`branch`／`backend` 結構。
- 機密只放 `.env`（已 gitignore）或 Cloudflare secret，不進版控。
- 完成後回報：執行過的指令與結果、仍待人工處理的清單。
