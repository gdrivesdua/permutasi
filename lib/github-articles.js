const GITHUB_API_BASE = 'https://api.github.com';
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder('utf-8');

function encodeBase64Utf8(str) {
  const bytes = TEXT_ENCODER.encode(String(str ?? ''));
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function decodeBase64Utf8(base64Str) {
  const clean = String(base64Str || '').replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return TEXT_DECODER.decode(bytes);
}

export function getGitHubConfig(env = {}) {
  const token = String(env.GITHUB_TOKEN || '').trim();
  const owner = String(env.GITHUB_OWNER || '').trim();
  const repo = String(env.GITHUB_REPO || '').trim();
  const branch = String(env.GITHUB_BRANCH || 'main').trim() || 'main';
  return {
    configured: Boolean(token && owner && repo),
    token,
    owner,
    repo,
    branch
  };
}

async function githubRequest(cfg, apiPath, options = {}) {
  const url = `${GITHUB_API_BASE}${apiPath}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'domainname-web-id-article-editor/1.0',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const err = new Error(data?.message || `GitHub API error (${res.status})`);
    err.status = res.status;
    err.githubBody = data;
    throw err;
  }

  return data;
}

export async function getRepoFileText(cfg, repoPath) {
  const encodedPath = repoPath.split('/').map((seg) => encodeURIComponent(seg)).join('/');
  const encodedBranch = encodeURIComponent(cfg.branch);
  try {
    const data = await githubRequest(
      cfg,
      `/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${encodedPath}?ref=${encodedBranch}`
    );
    if (!data || data.type !== 'file' || typeof data.content !== 'string') {
      return null;
    }
    return {
      sha: data.sha,
      path: data.path,
      text: decodeBase64Utf8(data.content)
    };
  } catch (err) {
    if (err && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function commitRepoFilesAtomic(cfg, files, commitMessage) {
  if (!cfg.configured) {
    throw new Error('GitHub integration is not configured.');
  }
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for GitHub commit.');
  }

  const owner = encodeURIComponent(cfg.owner);
  const repo = encodeURIComponent(cfg.repo);
  const refPath = cfg.branch.split('/').map((seg) => encodeURIComponent(seg)).join('/');

  // 1. Resolve current branch HEAD commit SHA
  const refData = await githubRequest(cfg, `/repos/${owner}/${repo}/git/ref/heads/${refPath}`);
  const headCommitSha = refData?.object?.sha;
  if (!headCommitSha) {
    throw new Error(`Unable to resolve HEAD commit for branch "${cfg.branch}".`);
  }

  // 2. Resolve base tree SHA from HEAD commit
  const headCommit = await githubRequest(cfg, `/repos/${owner}/${repo}/git/commits/${headCommitSha}`);
  const baseTreeSha = headCommit?.tree?.sha;
  if (!baseTreeSha) {
    throw new Error('Unable to resolve base tree SHA from HEAD commit.');
  }

  // 3. Create UTF-8 blobs for each file
  const treeEntries = [];
  for (const file of files) {
    const blob = await githubRequest(cfg, `/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      body: {
        content: encodeBase64Utf8(file.content),
        encoding: 'base64'
      }
    });
    treeEntries.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  // 4. Create new Git tree on top of baseTreeSha
  const newTree = await githubRequest(cfg, `/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    body: {
      base_tree: baseTreeSha,
      tree: treeEntries
    }
  });

  // 5. Create atomic commit
  const newCommit = await githubRequest(cfg, `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: {
      message: commitMessage,
      tree: newTree.sha,
      parents: [headCommitSha]
    }
  });

  // 6. Fast-forward branch ref
  await githubRequest(cfg, `/repos/${owner}/${repo}/git/refs/heads/${refPath}`, {
    method: 'PATCH',
    body: {
      sha: newCommit.sha,
      force: false
    }
  });

  return {
    commitSha: newCommit.sha,
    commitUrl: newCommit.html_url || `https://github.com/${cfg.owner}/${cfg.repo}/commit/${newCommit.sha}`,
    branch: cfg.branch,
    files: files.map((f) => f.path)
  };
}
