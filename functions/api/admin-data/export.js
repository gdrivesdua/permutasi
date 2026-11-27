import { exportAdminDomains } from '../../../lib/d1-admin-domains.js';
import {
  jsonResponse,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

const VALID_EXPORT_FORMATS = new Set(['csv', 'xls', 'json']);

export async function onRequestGet(context) {
  const { request, env } = context;

  const session = await verifyWorkerArticleSession(request, env);
  if (!session) {
    return jsonResponse({ ok: false, error: 'Unauthorized. Silakan login terlebih dahulu melalui /admin-articles/.' }, 401);
  }

  if (!env?.DB) {
    return jsonResponse({ ok: false, error: 'Binding database D1 (DB) belum dikonfigurasi di Cloudflare Pages.' }, 503);
  }

  try {
    const url = new URL(request.url);
    const rawFormat = String(url.searchParams.get('format') || 'csv').trim().toLowerCase();
    if (!VALID_EXPORT_FORMATS.has(rawFormat)) {
      return jsonResponse({ ok: false, error: 'Format export harus csv, xls, atau json.' }, 400);
    }

    const exp = await exportAdminDomains(env.DB, url.searchParams, rawFormat);
    return new Response(exp.body, {
      status: 200,
      headers: {
        'Content-Type': exp.contentType,
        'Content-Disposition': `attachment; filename="${exp.filename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err?.message || 'Gagal mengekspor data D1.' }, 500);
  }
}
