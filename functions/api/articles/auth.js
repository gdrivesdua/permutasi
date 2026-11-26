import { getGitHubConfig } from '../../../lib/github-articles.js';
import {
  buildSessionCookieHeader,
  checkArticleLoginRateLimit,
  clearArticleLoginFailures,
  createWorkerArticleSession,
  getClientIp,
  getConfiguredArticlePassword,
  isHttpsRequest,
  jsonResponse,
  recordArticleLoginFailure,
  revokeWorkerArticleSession,
  verifyArticlePassword,
  verifySameOriginRequest,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const configured = Boolean(getConfiguredArticlePassword(env));
  const githubCfg = getGitHubConfig(env);
  const session = configured ? await verifyWorkerArticleSession(request, env) : null;

  return jsonResponse({
    ok: true,
    configured,
    authenticated: Boolean(session),
    expiresAt: session?.exp || null,
    storageMode: githubCfg.configured ? 'github' : 'unconfigured',
    githubConfigured: githubCfg.configured,
    branch: githubCfg.branch
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifySameOriginRequest(request)) {
    return jsonResponse({ ok: false, error: 'Invalid request origin.' }, 403);
  }

  let body = {};
  try {
    const rawText = await request.text();
    if (rawText.length > 4096) {
      return jsonResponse({ ok: false, error: 'Payload too large.' }, 413);
    }
    body = rawText ? JSON.parse(rawText) : {};
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  if (body && body.action === 'logout') {
    await revokeWorkerArticleSession(request, env);
    return jsonResponse(
      { ok: true, authenticated: false },
      200,
      { 'Set-Cookie': buildSessionCookieHeader('', isHttpsRequest(request), 0) }
    );
  }

  if (!getConfiguredArticlePassword(env)) {
    return jsonResponse(
      { ok: false, error: 'Server password secret (ARTICLE_ADMIN_PASSWORD or ADMIN_PASSWORD) is not configured.' },
      503
    );
  }

  const clientIp = getClientIp(request);
  const rate = checkArticleLoginRateLimit(clientIp);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: `Too many failed attempts. Try again in ${rate.retryAfterSec}s.` },
      429
    );
  }

  const valid = await verifyArticlePassword(body?.password, env);
  if (!valid) {
    recordArticleLoginFailure(clientIp);
    return jsonResponse({ ok: false, error: 'Invalid password.' }, 401);
  }

  clearArticleLoginFailures(clientIp);
  const session = await createWorkerArticleSession(env);
  const githubCfg = getGitHubConfig(env);

  return jsonResponse(
    {
      ok: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      storageMode: githubCfg.configured ? 'github' : 'unconfigured',
      githubConfigured: githubCfg.configured,
      branch: githubCfg.branch
    },
    200,
    { 'Set-Cookie': buildSessionCookieHeader(session.token, isHttpsRequest(request), session.maxAgeSec) }
  );
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!verifySameOriginRequest(request)) {
    return jsonResponse({ ok: false, error: 'Invalid request origin.' }, 403);
  }
  await revokeWorkerArticleSession(request, env);
  return jsonResponse(
    { ok: true, authenticated: false },
    200,
    { 'Set-Cookie': buildSessionCookieHeader('', isHttpsRequest(request), 0) }
  );
}
