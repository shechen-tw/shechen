# 協作與分支保護

`main` 為預設分支且受 ruleset 保護，**任何人都必須開 PR 才能合併**。

## main 的規則

Ruleset 名稱 `protect-main`，內容：

- 禁止刪除分支
- 禁止強制推送（non-fast-forward）
- 必須透過 pull request 合併
- 必要狀態檢查 `build` 必須通過
- 僅允許 squash 合併
- `bypass_actors` 只有一個例外：CMS 登入使用的帳號（`bypass_mode: always`），原因見 `content-management.md`

## 日常工作流程

```bash
git switch main && git pull
git switch -c feat/<主題>
# 編輯、驗證
pnpm format && pnpm check && pnpm build
git commit
git push -u origin feat/<主題>
gh pr create --base main --fill
```

CI 通過後於 PR 頁面 **Squash and merge**，合併後刪除分支。

## CI

`.github/workflows/ci.yml` 在 PR 與 push 到 `main` 時執行：

1. `pnpm install --frozen-lockfile`
2. `pnpm check`
3. `pnpm build`
4. `npx wrangler deploy --dry-run`

`build` 是必要狀態檢查，未通過無法合併。

## 本機驗證（送 PR 前必做）

```bash
pnpm format:check
pnpm check
pnpm build
npx wrangler deploy --dry-run
```

四項都要通過，CI 會執行相同項目。

## 分支命名

| 前綴        | 用途               |
| ----------- | ------------------ |
| `feat/`     | 新功能、頁面       |
| `fix/`      | 修錯               |
| `chore/`    | 工具鏈、設定、依賴 |
| `docs/`     | 文件               |
| `refactor/` | 不改行為的重構     |

## 修改 ruleset

```bash
gh api repos/shechen-tw/shechen/rulesets   # 查 id
gh api -X PUT repos/shechen-tw/shechen/rulesets/<id> --input ruleset.json
```

## 注意

- 除了 CMS 帳號之外沒有任何 bypass，**打錯字也無法直接推 main**，一律走 PR。
- CMS 的 `publish_mode: editorial_workflow` 會把內容存成 PR 分支，與此規則相容。
