import { updateAdminDomainRow } from '../../../lib/d1-admin-domains.js';
import {
  jsonResponse,
  verifySameOriginRequest,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

async function handleUpdate(context) {
  const { request, env } = context;

  if (!verifySameOriginRequest(request)) {
    return jsonResponse({ ok: false, error: 'Invalid request origin.' }, 403);
  }

  const session = await verifyWorkerArticleSession(request, env);
  if (!session) {
    return jsonResponse({ ok: false, error: 'Unauthorized. Silakan login terlebih dahulu melalui /admin-articles/.' }, 401);
  }

  if (!env?.DB) {
    return jsonResponse({ ok: false, error: 'Binding database D1 (DB) belum dikonfigurasi di Cloudflare Pages.' }, 503);
  }

  let body;
  try {
    const rawText = await request.text();
    if (rawText.length > 16384) {
      return jsonResponse({ ok: false, error: 'Payload terlalu besar.' }, 413);
    }
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    return jsonResponse({ ok: false, error: 'Payload JSON tidak valid.' }, 400);
  }

  try {
    const result = await updateAdminDomainRow(env.DB, body);
    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.error }, result.status || 400);
    }
    return jsonResponse({ ok: true, storageMode: 'd1', row: result.row });
  } catch (err) {
    return jsonResponse({ ok: false, error: err?.message || 'Gagal memperbarui row D1.' }, 500);
  }
}

export async function onRequestPost(context) {
  return handleUpdate(context);
}

export async function onRequestPatch(context) {
  return handleUpdate(context);
}
