import {
  ARTICLE_SECTIONS,
  applyArticleDeleteToManifest
} from '../../../lib/article-schema.js';
import {
  commitRepoFilesAtomic,
  getGitHubConfig,
  getRepoFileText,
  listRepoDirectoryFiles
} from '../../../lib/github-articles.js';
import {
  jsonResponse,
  verifySameOriginRequest,
  verifyWorkerArticleSession
} from '../../../lib/worker-article-auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifySameOriginRequest(request)) {
    return jsonResponse({ ok: false, error: 'Invalid request origin.' }, 403);
  }

  const session = await verifyWorkerArticleSession(request, env);
  if (!session) {
    return jsonResponse({ ok: false, error: 'Unauthorized. Please sign in again.' }, 401);
  }

  const githubCfg = getGitHubConfig(env);
  if (!githubCfg.configured) {
    return jsonResponse(
      { ok: false, error: 'GitHub environment variables (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO) are not configured.' },
      503
    );
  }

  let rawBody;
  try {
    const rawText = await request.text();
    if (rawText.length > 4096) {
      return jsonResponse({ ok: false, error: 'Payload too large.' }, 413);
    }
    rawBody = rawText ? JSON.parse(rawText) : null;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400);
  }

  try {
    const manifestFile = await getRepoFileText(githubCfg, 'content/articles/manifest.json');
    const existingManifest = manifestFile
      ? JSON.parse(manifestFile.text)
      : { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };

    const deleted = applyArticleDeleteToManifest(existingManifest, rawBody?.id);
    if (!deleted.ok) {
      return jsonResponse({ ok: false, error: deleted.errors[0], errors: deleted.errors }, deleted.status || 400);
    }

    const articleDir = `content/articles/${deleted.deletedArticle.section}/${deleted.deletedArticle.id}`;
    const filesToDelete = await listRepoDirectoryFiles(githubCfg, articleDir);
    const changes = [
      {
        path: 'content/articles/manifest.json',
        content: JSON.stringify(deleted.manifest, null, 2) + '\n'
      },
      ...filesToDelete.map((filePath) => ({ path: filePath, delete: true }))
    ];

    const commitMsg = `docs(articles): delete ${deleted.deletedArticle.section}/${deleted.deletedArticle.id}`;
    const commitResult = await commitRepoFilesAtomic(githubCfg, changes, commitMsg);

    return jsonResponse({
      ok: true,
      storageMode: 'github',
      deletedId: deleted.deletedArticle.id,
      section: deleted.deletedArticle.section,
      commit: commitResult
    });
  } catch (err) {
    const status = err?.status === 422 || err?.status === 409 ? 409 : 502;
    return jsonResponse(
      { ok: false, error: err?.message || 'Failed to delete article from GitHub.' },
      status
    );
  }
}
