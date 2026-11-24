/**
 * Decap CMS GitHub OAuth proxy — 第一步：導向 GitHub 授權頁。
 * 部署後網址為 https://<site>/auth，需在 GitHub OAuth App 的
 * Authorization callback URL 設定為 https://<site>/callback。
 */
interface Env {
  GITHUB_CLIENT_ID: string;
}

const STATE_COOKIE = 'decap_oauth_state';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);

  if (!env.GITHUB_CLIENT_ID) {
    return new Response('缺少環境變數 GITHUB_CLIENT_ID', { status: 500 });
  }

  const state = crypto.randomUUID();
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authorizeUrl.searchParams.set('scope', 'repo');
  authorizeUrl.searchParams.set('state', state);

  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${secure}`,
      'Cache-Control': 'no-store',
    },
  });
};
