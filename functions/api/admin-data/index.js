import {
  getAdminDomainFacets,
  queryAdminDomains
} from '../../../lib/d1-admin-domains.js';
import {
  jsonResponse,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

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
    const includeFacets = url.searchParams.get('includeFacets') === '1';

    const result = await queryAdminDomains(env.DB, url.searchParams);
    const facets = includeFacets ? await getAdminDomainFacets(env.DB) : undefined;

    return jsonResponse({
      ok: true,
      storageMode: 'd1',
      ...result,
      ...(facets ? { facets } : {})
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err?.message || 'Gagal membaca data D1.' }, 500);
  }
}
