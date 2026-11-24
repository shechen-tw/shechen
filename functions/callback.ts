/**
 * Decap CMS GitHub OAuth proxy — 第二步：用 code 換 access token，
 * 再透過 postMessage 把 token 交回 CMS 視窗。
 */
interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

const STATE_COOKIE = 'decap_oauth_state';

type CmsPayload = { token: string; provider: 'github' } | { error: string };

function renderBody(status: 'success' | 'error', content: CmsPayload): string {
  const payload = JSON.stringify(content).replace(/'/g, "\\'");
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>登入中…</title></head>
<body>
<script>
  (function () {
    function receiveMessage(message) {
      window.opener.postMessage('authorization:github:${status}:${payload}', message.origin);
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body></html>`;
}

function html(body: string, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = readCookie(request.headers.get('Cookie'), STATE_COOKIE);
  const clearCookie = `${STATE_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;

  if (url.searchParams.get('error')) {
    return html(
      renderBody('error', { error: url.searchParams.get('error_description') ?? '授權失敗' }),
      400,
      { 'Set-Cookie': clearCookie },
    );
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return html(renderBody('error', { error: '無效的 OAuth state 或缺少授權碼' }), 400, {
      'Set-Cookie': clearCookie,
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return html(renderBody('error', { error: '伺服器缺少 OAuth 環境變數' }), 500);
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    return html(
      renderBody('error', {
        error: tokenData.error_description ?? tokenData.error ?? '無法取得 access token',
      }),
      400,
      { 'Set-Cookie': clearCookie },
    );
  }

  return html(renderBody('success', { token: tokenData.access_token, provider: 'github' }), 200, {
    'Set-Cookie': clearCookie,
  });
};
