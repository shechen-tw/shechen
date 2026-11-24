/**
 * Cloudflare Workers 入口：只負責 Decap CMS 的 GitHub OAuth proxy，
 * 其餘請求全部交給靜態資源 binding（ASSETS）。
 * wrangler 設定中的 run_worker_first 只會把 /auth 與 /callback 導進來。
 */
interface Env {
  ASSETS: Fetcher;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

const STATE_COOKIE = 'decap_oauth_state';

type CmsPayload = { token: string; provider: 'github' } | { error: string };

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

/** 第一步：導向 GitHub 授權頁，並以 state cookie 防 CSRF。 */
async function handleAuth(url: URL, env: Env): Promise<Response> {
  if (!env.GITHUB_CLIENT_ID) {
    return html('缺少環境變數 GITHUB_CLIENT_ID', 500);
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
}

/** 第二步：驗證 state，用 code 換 access token，再以 postMessage 交回 CMS。 */
async function handleCallback(request: Request, url: URL, env: Env): Promise<Response> {
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
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(url, env);
    }

    if (url.pathname === '/callback') {
      return handleCallback(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
