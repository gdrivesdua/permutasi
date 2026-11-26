import { ARTICLE_SECTIONS, ARTICLE_SLUG_REGEX, SUPPORTED_LANGUAGES } from '../../../lib/article-schema.js';
import { getGitHubConfig, getRepoFileText } from '../../../lib/github-articles.js';
import { jsonResponse, verifyWorkerArticleSession } from '../../../lib/worker-article-auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await verifyWorkerArticleSession(request, env);
  if (!session) {
    return jsonResponse({ ok: false, error: 'Unauthorized.' }, 401);
  }

  const githubCfg = getGitHubConfig(env);
  if (!githubCfg.configured) {
    return jsonResponse(
      { ok: false, error: 'GitHub environment variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO) are not configured.' },
      503
    );
  }

  try {
    const manifestFile = await getRepoFileText(githubCfg, 'content/articles/manifest.json');
    const manifest = manifestFile
      ? JSON.parse(manifestFile.text)
      : { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };

    const url = new URL(request.url);
    const articleId = String(url.searchParams.get('id') || '').trim().toLowerCase();
    const lang = String(url.searchParams.get('lang') || '').trim().toLowerCase();

    if (!articleId) {
      const hubsFile = await getRepoFileText(githubCfg, 'content/articles/hubs.json');
      const hubs = hubsFile ? JSON.parse(hubsFile.text) : { sections: {} };
      return jsonResponse({
        ok: true,
        storageMode: 'github',
        branch: githubCfg.branch,
        manifest,
        hubs
      });
    }

    if (!ARTICLE_SLUG_REGEX.test(articleId)) {
      return jsonResponse({ ok: false, error: 'Invalid article id.' }, 400);
    }

    const article = Array.isArray(manifest.articles)
      ? manifest.articles.find((a) => a.id === articleId)
      : null;

    if (!article) {
      return jsonResponse({ ok: false, error: `Article "${articleId}" not found in manifest.` }, 404);
    }

    const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
    const contentPath = `content/articles/${article.section}/${article.id}/${targetLang}.json`;
    const contentFile = await getRepoFileText(githubCfg, contentPath);
    const content = contentFile ? JSON.parse(contentFile.text) : null;

    return jsonResponse({
      ok: true,
      storageMode: 'github',
      article,
      lang: targetLang,
      contentPath,
      content
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err?.message || 'Failed to load articles from GitHub.' },
      err?.status && err.status >= 400 && err.status < 500 ? err.status : 502
    );
  }
}
