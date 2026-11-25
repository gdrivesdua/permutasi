const SESSION_COOKIE_NAME = 'dn_article_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 10;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder('utf-8');
const failedAttemptsByIp = new Map();

let d1SessionTableReady = false;

function toBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str) {
  const padded = String(str || '').replace(/-/g, '+').replace(/_/g, '/')
    + '==='.slice((String(str || '').length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqualBytes(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function sha256Bytes(value) {
  const buf = await crypto.subtle.digest('SHA-256', TEXT_ENCODER.encode(String(value ?? '')));
  return new Uint8Array(buf);
}

function randomHex(byteCount = 16) {
  const arr = new Uint8Array(byteCount);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getConfiguredArticlePassword(env = {}) {
  const dedicated = String(env.ARTICLE_ADMIN_PASSWORD || '').trim();
  if (dedicated) return dedicated;
  return String(env.ADMIN_PASSWORD || '').trim();
}

async function getSessionSigningKey(env = {}) {
  const explicitSecret = String(env.ARTICLE_SESSION_SECRET || env.ADMIN_SESSION_SECRET || '').trim();
  const password = getConfiguredArticlePassword(env);
  const rawMaterial = explicitSecret || (password ? `article-session-derived:${password}` : '');
  if (!rawMaterial) {
    throw new Error('Server authentication secret is not configured.');
  }
  const keyBytes = await sha256Bytes(rawMaterial);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function verifyArticlePassword(candidate, env = {}) {
  const expected = getConfiguredArticlePassword(env);
  const supplied = String(candidate || '');
  if (!expected || !supplied) return false;
  const [a, b] = await Promise.all([sha256Bytes(supplied), sha256Bytes(expected)]);
  return timingSafeEqualBytes(a, b);
}

export function parseCookieValue(cookieHeader, name = SESSION_COOKIE_NAME) {
  const raw = String(cookieHeader || '');
  if (!raw) return '';
  const parts = raw.split(';');
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx <= 0) continue;
    const k = part.slice(0, eqIdx).trim();
    if (k === name) {
      return decodeURIComponent(part.slice(eqIdx + 1).trim());
    }
  }
  return '';
}

export function buildSessionCookieHeader(token, isHttps, maxAgeSec = SESSION_TTL_SECONDS) {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.max(0, Math.floor(maxAgeSec))}`
  ];
  if (isHttps) {
    attrs.push('SameSite=None', 'Secure', 'Partitioned');
  } else {
    attrs.push('SameSite=Lax');
  }
  return attrs.join('; ');
}

export function isHttpsRequest(request) {
  try {
    const xfProto = String(request.headers.get('x-forwarded-proto') || '').split(',')[0].trim().toLowerCase();
    if (xfProto === 'https') return true;
    const url = new URL(request.url);
    return url.protocol === 'https:';
  } catch {
    return true;
  }
}

export function verifySameOriginRequest(request) {
  const expectedHost = String(
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  ).split(',')[0].trim().toLowerCase();
  const origin = String(request.headers.get('origin') || '').trim();
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      if (expectedHost && parsedOrigin.host.toLowerCase() !== expectedHost) {
        return false;
      }
    } catch {
      return false;
    }
  }
  const xrw = String(request.headers.get('x-requested-with') || '').trim();
  if (!origin && !xrw) {
    return false;
  }
  return true;
}

export function getClientIp(request) {
  const cfIp = String(request.headers.get('cf-connecting-ip') || '').trim();
  if (cfIp) return cfIp;
  const xff = String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return xff || 'unknown';
}

export function checkArticleLoginRateLimit(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const entry = failedAttemptsByIp.get(key);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    return { allowed: true };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((RATE_WINDOW_MS - (now - entry.windowStart)) / 1000)
    };
  }
  return { allowed: true };
}

export function recordArticleLoginFailure(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const entry = failedAttemptsByIp.get(key);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    failedAttemptsByIp.set(key, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function clearArticleLoginFailures(ip) {
  failedAttemptsByIp.delete(String(ip || 'unknown'));
}

async function ensureD1SessionTable(db) {
  if (!db || d1SessionTableReady) return;
  await db.prepare(
    'CREATE TABLE IF NOT EXISTS article_editor_sessions (jti TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)'
  ).run();
  d1SessionTableReady = true;
}

export async function createWorkerArticleSession(env = {}) {
  const jti = randomHex(16);
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const payload = {
    sub: 'article-writer',
    jti,
    iat: now,
    exp: expiresAt
  };
  const encoded = toBase64Url(TEXT_ENCODER.encode(JSON.stringify(payload)));
  const key = await getSessionSigningKey(env);
  const sigBuf = await crypto.subtle.sign('HMAC', key, TEXT_ENCODER.encode(encoded));
  const sig = toBase64Url(new Uint8Array(sigBuf));
  const token = `${encoded}.${sig}`;

  if (env.DB) {
    try {
      await ensureD1SessionTable(env.DB);
      await env.DB.prepare(
        'DELETE FROM article_editor_sessions WHERE expires_at <= ?'
      ).bind(now).run();
      await env.DB.prepare(
        'INSERT INTO article_editor_sessions (jti, expires_at, created_at) VALUES (?, ?, ?)'
      ).bind(jti, expiresAt, now).run();
    } catch {
      // Allow stateless HMAC fallback if D1 write fails transiently
    }
  }

  return { token, jti, expiresAt, maxAgeSec: SESSION_TTL_SECONDS };
}

export async function verifyWorkerArticleSession(request, env = {}) {
  if (!getConfiguredArticlePassword(env)) {
    return null;
  }
  const token = parseCookieValue(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token) return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;

  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  try {
    const key = await getSessionSigningKey(env);
    const sigBytes = fromBase64Url(sig);
    const validSig = await crypto.subtle.verify('HMAC', key, sigBytes, TEXT_ENCODER.encode(encoded));
    if (!validSig) return null;

    const payload = JSON.parse(TEXT_DECODER.decode(fromBase64Url(encoded)));
    if (!payload || payload.sub !== 'article-writer' || typeof payload.exp !== 'number' || !payload.jti) {
      return null;
    }
    if (Date.now() >= payload.exp) return null;

    if (env.DB) {
      try {
        await ensureD1SessionTable(env.DB);
        const row = await env.DB.prepare(
          'SELECT jti, expires_at FROM article_editor_sessions WHERE jti = ?'
        ).bind(payload.jti).first();
        if (!row || Number(row.expires_at) <= Date.now()) {
          return null;
        }
      } catch {
        // Fallback to verified HMAC if D1 is momentarily unavailable
      }
    }

    return payload;
  } catch {
    return null;
  }
}

export async function revokeWorkerArticleSession(request, env = {}) {
  const token = parseCookieValue(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token || !env.DB) return;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return;
  try {
    const payload = JSON.parse(TEXT_DECODER.decode(fromBase64Url(token.slice(0, dotIdx))));
    if (payload && payload.jti) {
      await ensureD1SessionTable(env.DB);
      await env.DB.prepare('DELETE FROM article_editor_sessions WHERE jti = ?').bind(payload.jti).run();
    }
  } catch {
    // Ignore malformed token on logout
  }
}

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extraHeaders
    }
  });
}
