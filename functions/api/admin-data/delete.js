import { deleteAdminDomainRows } from '../../../lib/d1-admin-domains.js';
import {
  jsonResponse,
  verifySameOriginRequest,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

async function handleDelete(context) {
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

  let domainsInput = null;
  try {
    const rawText = await request.text();
    if (rawText.length > 32768) {
      return jsonResponse({ ok: false, error: 'Payload terlalu besar.' }, 413);
    }
    if (rawText) {
      const body = JSON.parse(rawText);
      domainsInput = body?.domains ?? body?.domain ?? null;
    } else {
      const url = new URL(request.url);
      domainsInput = url.searchParams.get('domain');
    }
  } catch {
    return jsonResponse({ ok: false, error: 'Payload JSON tidak valid.' }, 400);
  }

  try {
    const result = await deleteAdminDomainRows(env.DB, domainsInput);
    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.error }, result.status || 400);
    }
    return jsonResponse({ ok: true, storageMode: 'd1', ...result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err?.message || 'Gagal menghapus row D1.' }, 500);
  }
}

export async function onRequestPost(context) {
  return handleDelete(context);
}

export async function onRequestDelete(context) {
  return handleDelete(context);
}
