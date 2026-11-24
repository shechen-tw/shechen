# 環境變數

## 變數

| 變數                   | 用途                                   |
| ---------------------- | -------------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub App 的 Client ID                |
| `GITHUB_CLIENT_SECRET` | GitHub App 的 Client Secret（機密）    |
| `GITHUB_REPOSITORY_ID` | 限定 token 只能存取單一 repo（非機密） |
| `SITE_URL`             | 站台的 canonical URL                   |

## 本機

複製 `.env.example` 為 `.dev.vars`（已 gitignore），`wrangler dev` 會讀取。

`.dev.vars` 只供本機使用，部署時不會上傳。

## 正式環境

- 非機密（`GITHUB_CLIENT_ID`、`GITHUB_REPOSITORY_ID`、`SITE_URL`）：`wrangler.toml` 的 `[vars]` 或後台 Settings → Variables & Secrets。
- 機密（`GITHUB_CLIENT_SECRET`）：只能走 secret，不進版控。

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
```

## 注意

- `SITE_URL` 同時供 Astro 產生 canonical URL，正式環境必須是實際網域。
- 輪替 secret 後需重新部署才會生效。
