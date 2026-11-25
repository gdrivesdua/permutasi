import {
  ARTICLE_SECTIONS,
  applyArticleSaveToManifest,
  validateAndNormalizeArticleSave
} from '../../../lib/article-schema.js';
import {
  commitRepoFilesAtomic,
  getGitHubConfig,
  getRepoFileText
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
    if (rawText.length > 262144) {
      return jsonResponse({ ok: false, error: 'Article payload exceeds 256 KB limit.' }, 413);
    }
    rawBody = rawText ? JSON.parse(rawText) : null;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400);
  }

  const validation = validateAndNormalizeArticleSave(rawBody);
  if (!validation.ok) {
    return jsonResponse({ ok: false, error: validation.errors[0], errors: validation.errors }, 400);
  }

  try {
    const manifestFile = await getRepoFileText(githubCfg, 'content/articles/manifest.json');
    const existingManifest = manifestFile
      ? JSON.parse(manifestFile.text)
      : { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };

    const merged = applyArticleSaveToManifest(existingManifest, validation.normalized);
    if (!merged.ok) {
      return jsonResponse({ ok: false, error: merged.errors[0], errors: merged.errors }, 409);
    }

    const actionVerb = validation.normalized.localeMeta.published ? 'publish' : 'save draft';
    const commitMsg = `docs(articles): ${actionVerb} ${merged.article.section}/${merged.article.id} (${validation.normalized.lang})`;

    const commitResult = await commitRepoFilesAtomic(
      githubCfg,
      [
        {
          path: 'content/articles/manifest.json',
          content: JSON.stringify(merged.manifest, null, 2) + '\n'
        },
        {
          path: merged.contentRepoPath,
          content: JSON.stringify(merged.contentJson, null, 2) + '\n'
        }
      ],
      commitMsg
    );

    return jsonResponse({
      ok: true,
      storageMode: 'github',
      article: merged.article,
      lang: validation.normalized.lang,
      contentPath: merged.contentRepoPath,
      content: merged.contentJson,
      commit: commitResult
    });
  } catch (err) {
    const status = err?.status === 422 || err?.status === 409 ? 409 : 502;
    return jsonResponse(
      { ok: false, error: err?.message || 'Failed to commit article changes to GitHub.' },
      status
    );
  }
}
