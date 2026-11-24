import { defineConfig } from 'astro/config';

// 靜態輸出：Cloudflare Pages 直接託管 dist/，動態需求（例如 CMS OAuth）走 functions/。
// 之後若要改成 SSR，再安裝 @astrojs/cloudflare 並把 output 改成 'server'。
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  build: {
    format: 'directory',
  },
  server: {
    port: 4321,
    host: true,
  },
});
