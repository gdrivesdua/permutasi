import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  STATIC_HTML_PAGES,
  SUPPORTED_LANGUAGES,
  ARTICLE_SECTIONS,
  ARTICLE_SLUG_REGEX,
  loadSiteConfig,
  loadArticleManifest,
  findPublishedArticleByRoute,
  getHubPath,
  renderLocalizedPage,
  renderGuidePage,
  renderFaqPage,
  renderArticleHubPage,
  renderArticlePage,
  buildAdsTxt,
  buildRobotsTxt,
  buildSitemapXml
} from './scripts/site-builder.mjs';
import {
  ALL_LEXICON_KEYS,
  LEXICON_LANGS,
  buildMergedLexicon,
  readAllLexicons,
  readLexiconFile,
  validateLexiconEntry,
  writeLexiconFile
} from './lib/lexicon-store.js';
import { generateDomainTags } from './lib/domain-tagger.js';
import {
  checkLoginRateLimit,
  claimInitialAdminPassword,
  clearFailedLogins,
  getAdminAuthState,
  issueSessionToken,
  recordFailedLogin,
  requireAdminAuth,
  revokeSessionToken,
  verifyAdminPassword
} from './lib/admin-auth.js';
import {
  applyArticleSaveToManifest,
  validateAndNormalizeArticleSave
} from './lib/article-schema.js';
import {
  commitRepoFilesAtomic,
  getGitHubConfig,
  getRepoFileText
} from './lib/github-articles.js';
import {
  buildSessionCookieHeader,
  parseCookieValue
} from './lib/worker-article-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

function sendRenderedPage(res, pageFile, lang = 'en') {
  const srcPath = path.join(__dirname, pageFile);
  if (!fs.existsSync(srcPath)) {
    return res.status(404).end();
  }
  const config = loadSiteConfig(__dirname);
  const rawHtml = fs.readFileSync(srcPath, 'utf8');
  const html = renderLocalizedPage(rawHtml, pageFile, lang, config);
  res.type('html').send(html);
}

app.get('/', (req, res) => {
  const queryLang = String(req.query?.lang || '').toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
  return sendRenderedPage(res, 'index.html', lang);
});

for (const pageFile of STATIC_HTML_PAGES) {
  const cleanSlug = pageFile.replace(/\.html$/i, '');
  app.get([`/${pageFile}`, `/${cleanSlug}`], (req, res) => {
    const queryLang = String(req.query?.lang || '').toLowerCase();
    const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
    return sendRenderedPage(res, pageFile, lang);
  });
}

app.get(['/guide', '/guide.html'], (req, res) => {
  const queryLang = String(req.query?.lang || '').toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
  const config = loadSiteConfig(__dirname);
  return res.type('html').send(renderGuidePage(__dirname, lang, config));
});

app.get(['/faq', '/faq.html'], (req, res) => {
  const queryLang = String(req.query?.lang || '').toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
  const config = loadSiteConfig(__dirname);
  return res.type('html').send(renderFaqPage(__dirname, lang, config));
});

app.get(['/en', '/en/'], (_req, res) => res.redirect(301, '/'));
app.get(['/en/guide', '/en/guide.html'], (_req, res) => res.redirect(301, '/guide.html'));
app.get(['/en/faq', '/en/faq.html'], (_req, res) => res.redirect(301, '/faq.html'));
for (const pageFile of STATIC_HTML_PAGES) {
  const cleanSlug = pageFile.replace(/\.html$/i, '');
  const dest = pageFile === 'index.html' ? '/' : `/${pageFile}`;
  app.get([`/en/${pageFile}`, `/en/${cleanSlug}`], (_req, res) => res.redirect(301, dest));
}

for (const lang of SUPPORTED_LANGUAGES) {
  if (lang === 'en') continue;
  app.get([`/${lang}`, `/${lang}/`], (_req, res) => sendRenderedPage(res, 'index.html', lang));
  app.get([`/${lang}/guide`, `/${lang}/guide.html`], (_req, res) => {
    const config = loadSiteConfig(__dirname);
    return res.type('html').send(renderGuidePage(__dirname, lang, config));
  });
  app.get([`/${lang}/faq`, `/${lang}/faq.html`], (_req, res) => {
    const config = loadSiteConfig(__dirname);
    return res.type('html').send(renderFaqPage(__dirname, lang, config));
  });
  for (const pageFile of STATIC_HTML_PAGES) {
    const cleanSlug = pageFile.replace(/\.html$/i, '');
    app.get([`/${lang}/${pageFile}`, `/${lang}/${cleanSlug}`], (_req, res) => {
      return sendRenderedPage(res, pageFile, lang);
    });
  }
}

for (const section of ARTICLE_SECTIONS) {
  app.get([`/en/${section}`, `/en/${section}/`, `/en/${section}/index.html`], (_req, res) => {
    return res.redirect(301, getHubPath(section, 'en'));
  });
  app.get([`/en/${section}/:slug`, `/en/${section}/:slug/`, `/en/${section}/:slug/index.html`], (req, res) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    return res.redirect(301, `/${section}/${encodeURIComponent(slug)}/`);
  });

  app.get([`/${section}`, `/${section}/`, `/${section}/index.html`], (req, res) => {
    const canonicalPath = getHubPath(section, 'en');
    if (req.path !== canonicalPath) {
      return res.redirect(301, canonicalPath);
    }
    const config = loadSiteConfig(__dirname);
    const manifest = loadArticleManifest(__dirname);
    return res.type('html').send(renderArticleHubPage(__dirname, section, 'en', config, manifest));
  });

  app.get([`/${section}/:slug`, `/${section}/:slug/`, `/${section}/:slug/index.html`], (req, res) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const match = findPublishedArticleByRoute(__dirname, section, slug, 'en');
    if (!match) {
      return res.status(404).end();
    }
    const canonicalPath = `/${section}/${slug}/`;
    if (req.path !== canonicalPath) {
      return res.redirect(301, canonicalPath);
    }
    const config = loadSiteConfig(__dirname);
    return res.type('html').send(renderArticlePage(__dirname, match.article, 'en', config, match.manifest));
  });
}

for (const lang of SUPPORTED_LANGUAGES) {
  if (lang === 'en') continue;
  for (const section of ARTICLE_SECTIONS) {
    app.get([`/${lang}/${section}`, `/${lang}/${section}/`, `/${lang}/${section}/index.html`], (req, res) => {
      const canonicalPath = getHubPath(section, lang);
      if (req.path !== canonicalPath) {
        return res.redirect(301, canonicalPath);
      }
      const config = loadSiteConfig(__dirname);
      const manifest = loadArticleManifest(__dirname);
      return res.type('html').send(renderArticleHubPage(__dirname, section, lang, config, manifest));
    });

    app.get([`/${lang}/${section}/:slug`, `/${lang}/${section}/:slug/`, `/${lang}/${section}/:slug/index.html`], (req, res) => {
      const slug = String(req.params.slug || '').trim().toLowerCase();
      const match = findPublishedArticleByRoute(__dirname, section, slug, lang);
      if (!match) {
        return res.status(404).end();
      }
      const canonicalPath = `/${lang}/${section}/${slug}/`;
      if (req.path !== canonicalPath) {
        return res.redirect(301, canonicalPath);
      }
      const config = loadSiteConfig(__dirname);
      return res.type('html').send(renderArticlePage(__dirname, match.article, lang, config, match.manifest));
    });
  }
}

app.get('/robots.txt', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  if (!config.seo.generateRobotsTxt) {
    return res.status(404).end();
  }
  res.type('text/plain').send(buildRobotsTxt(config));
});

app.get('/sitemap.xml', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  if (!config.seo.generateSitemapXml) {
    return res.status(404).end();
  }
  res.type('application/xml').send(buildSitemapXml(config, __dirname));
});

app.get('/ads.txt', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  const adsTxt = buildAdsTxt(config);
  if (!adsTxt) {
    return res.status(404).type('text/plain').send('AdSense publisherId is not configured in site.config.json\n');
  }
  res.type('text/plain').send(adsTxt);
});

app.post('/api/log-available-domain', express.json({ limit: '8kb' }), (req, res) => {
  const domain = String(req.body?.domain || '').trim().toLowerCase();
  const status = String(req.body?.status || '').trim().toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(String(req.body?.lang || '').trim().toLowerCase())
    ? String(req.body.lang).trim().toLowerCase()
    : 'en';
  if (status !== 'available' || !domain || domain.length > 25) {
    return res.status(400).json({ ok: false, logged: false, error: 'Only available domains <= 25 chars are accepted.' });
  }
  return res.status(202).json({
    ok: true,
    logged: false,
    skipped: true,
    domain,
    lang,
    reason: 'Local Express preview (persists to Cloudflare D1 via functions/api/log-available-domain.js in production)'
  });
});

app.get(['/admin-lexicon', '/admin-lexicon.html'], (_req, res) => {
  const adminPath = path.join(__dirname, 'admin-lexicon.html');
  if (!fs.existsSync(adminPath)) {
    return res.status(404).end();
  }
  res.setHeader('Cache-Control', 'no-store');
  res.type('html').send(fs.readFileSync(adminPath, 'utf8'));
});

app.get('/api/admin/auth/status', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const state = getAdminAuthState();
  res.json({ ok: true, ...state });
});

app.post('/api/admin/auth/setup', express.json({ limit: '4kb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const rate = checkLoginRateLimit(req.ip);
  if (!rate.allowed) {
    return res.status(429).json({ ok: false, error: `Too many attempts. Try again in ${rate.retryAfterSec}s.` });
  }
  const result = claimInitialAdminPassword(req.body?.password);
  if (!result.ok) {
    recordFailedLogin(req.ip);
    return res.status(result.status).json({ ok: false, error: result.error });
  }
  clearFailedLogins(req.ip);
  const session = issueSessionToken();
  return res.json({ ok: true, ...session, mode: getAdminAuthState().mode });
});

app.post('/api/admin/auth/login', express.json({ limit: '4kb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const rate = checkLoginRateLimit(req.ip);
  if (!rate.allowed) {
    return res.status(429).json({ ok: false, error: `Too many failed login attempts. Try again in ${rate.retryAfterSec}s.` });
  }
  const state = getAdminAuthState();
  if (state.needsSetup) {
    return res.status(409).json({ ok: false, needsSetup: true, error: 'Admin password must be initialized first.' });
  }
  if (!verifyAdminPassword(req.body?.password)) {
    recordFailedLogin(req.ip);
    return res.status(401).json({ ok: false, error: 'Invalid admin password.' });
  }
  clearFailedLogins(req.ip);
  const session = issueSessionToken();
  return res.json({ ok: true, ...session, mode: state.mode });
});

app.post('/api/admin/auth/logout', requireAdminAuth, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  revokeSessionToken(req.adminToken);
  return res.json({ ok: true });
});

app.get('/api/admin/lexicon', requireAdminAuth, (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const data = readAllLexicons();
  return res.json({
    ok: true,
    langs: LEXICON_LANGS,
    keys: ALL_LEXICON_KEYS,
    shortExact: data.shortExact,
    byLang: data.byLang
  });
});

app.put('/api/admin/lexicon/:lang', requireAdminAuth, express.json({ limit: '16kb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = String(req.params.lang || '').trim().toLowerCase();
  if (!ALL_LEXICON_KEYS.includes(key)) {
    return res.status(400).json({ ok: false, error: 'Invalid lexicon language key.' });
  }
  try {
    const { word, tuple } = validateLexiconEntry(key, req.body?.word, req.body);
    const current = readLexiconFile(key);
    const existed = Object.prototype.hasOwnProperty.call(current, word);
    current[word] = tuple;
    const saved = writeLexiconFile(key, current);
    return res.json({
      ok: true,
      key,
      word,
      entry: tuple,
      existed,
      count: Object.keys(saved).length
    });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err?.message || 'Failed to save lexicon entry.' });
  }
});

app.delete('/api/admin/lexicon/:lang/:word', requireAdminAuth, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = String(req.params.lang || '').trim().toLowerCase();
  const word = String(req.params.word || '').trim().toLowerCase();
  if (!ALL_LEXICON_KEYS.includes(key)) {
    return res.status(400).json({ ok: false, error: 'Invalid lexicon language key.' });
  }
  const current = readLexiconFile(key);
  if (!Object.prototype.hasOwnProperty.call(current, word)) {
    return res.status(404).json({ ok: false, error: `Word "${word}" not found in ${key}.` });
  }
  delete current[word];
  const saved = writeLexiconFile(key, current);
  return res.json({
    ok: true,
    key,
    word,
    count: Object.keys(saved).length
  });
});

app.post('/api/admin/lexicon/test', requireAdminAuth, express.json({ limit: '8kb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const domain = String(req.body?.domain || '').trim().toLowerCase();
  const uiLang = LEXICON_LANGS.includes(String(req.body?.uiLang || '').trim().toLowerCase())
    ? String(req.body.uiLang).trim().toLowerCase()
    : 'en';
  if (!domain || domain.length > 100) {
    return res.status(400).json({ ok: false, error: 'Provide a valid domain name (1-100 chars).' });
  }
  const { shortExact, byLang } = readAllLexicons();
  const merged = buildMergedLexicon(shortExact, byLang);
  const result = generateDomainTags({
    domain,
    uiLang,
    shortExactMap: merged.SHORT_EXACT,
    lexiconMap: merged.LEXICON_8LANG
  });
  return res.json({ ok: true, result });
});

const ARTICLES_ROOT_DIR = path.resolve(__dirname, 'content', 'articles');
const ARTICLE_COOKIE_NAME = 'dn_article_session';
const ARTICLE_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const EXPRESS_ARTICLE_SESSION_SECRET = process.env.ARTICLE_SESSION_SECRET
  ? Buffer.from(process.env.ARTICLE_SESSION_SECRET, 'utf8')
  : (process.env.ADMIN_SESSION_SECRET
    ? Buffer.from(process.env.ADMIN_SESSION_SECRET, 'utf8')
    : crypto.randomBytes(32));
const activeArticleSessions = new Map();

function isExpressHttps(req) {
  const xfProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return req.secure || xfProto === 'https';
}

function verifyExpressSameOrigin(req) {
  const expectedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0].trim().toLowerCase();
  const origin = String(req.headers.origin || '').trim();
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (expectedHost && parsed.host.toLowerCase() !== expectedHost) {
        return false;
      }
    } catch {
      return false;
    }
  }
  const xrw = String(req.headers['x-requested-with'] || '').trim();
  if (!origin && !xrw) {
    return false;
  }
  return true;
}

function getExpressArticleAuthState() {
  const dedicated = String(process.env.ARTICLE_ADMIN_PASSWORD || '').trim();
  if (dedicated) {
    return { mode: 'env', configured: true, needsSetup: false };
  }
  return getAdminAuthState();
}

function verifyExpressArticlePassword(candidate) {
  const dedicated = String(process.env.ARTICLE_ADMIN_PASSWORD || '').trim();
  if (dedicated) {
    const supplied = String(candidate || '');
    if (!supplied) return false;
    const a = crypto.createHash('sha256').update(supplied).digest();
    const b = crypto.createHash('sha256').update(dedicated).digest();
    return crypto.timingSafeEqual(a, b);
  }
  return verifyAdminPassword(candidate);
}

function issueExpressArticleSession() {
  const jti = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const exp = now + ARTICLE_SESSION_TTL_MS;
  const payload = { sub: 'article-writer', jti, iat: now, exp };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', EXPRESS_ARTICLE_SESSION_SECRET).update(encoded).digest('base64url');
  activeArticleSessions.set(jti, exp);
  return { token: `${encoded}.${sig}`, jti, expiresAt: exp, maxAgeSec: Math.floor(ARTICLE_SESSION_TTL_MS / 1000) };
}

function verifyExpressArticleSession(req) {
  const token = parseCookieValue(req.headers.cookie, ARTICLE_COOKIE_NAME);
  if (!token) return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', EXPRESS_ARTICLE_SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || payload.sub !== 'article-writer' || !payload.jti || typeof payload.exp !== 'number') {
      return null;
    }
    if (Date.now() >= payload.exp) {
      activeArticleSessions.delete(payload.jti);
      return null;
    }
    if (!activeArticleSessions.has(payload.jti)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function revokeExpressArticleSession(req) {
  const session = verifyExpressArticleSession(req);
  if (session?.jti) {
    activeArticleSessions.delete(session.jti);
  }
}

function resolveConfinedArticleFile(...segments) {
  const resolved = path.resolve(ARTICLES_ROOT_DIR, ...segments);
  if (!resolved.startsWith(ARTICLES_ROOT_DIR + path.sep)) {
    throw new Error('Invalid article file path.');
  }
  return resolved;
}

app.get(['/admin-articles', '/admin-articles/', '/admin-articles/index.html'], (req, res) => {
  if (req.path !== '/admin-articles/') {
    return res.redirect(301, '/admin-articles/');
  }
  const editorPath = path.join(__dirname, 'admin-articles.html');
  if (!fs.existsSync(editorPath)) {
    return res.status(404).end();
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.type('html').send(fs.readFileSync(editorPath, 'utf8'));
});

app.get('/api/articles/auth', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const authState = getExpressArticleAuthState();
  const githubCfg = getGitHubConfig(process.env);
  const session = verifyExpressArticleSession(req);
  return res.json({
    ok: true,
    configured: authState.configured,
    needsSetup: authState.needsSetup,
    authenticated: Boolean(session),
    expiresAt: session?.exp || null,
    storageMode: githubCfg.configured ? 'github' : 'local',
    githubConfigured: githubCfg.configured,
    branch: githubCfg.branch
  });
});

app.post('/api/articles/auth', express.json({ limit: '4kb' }), (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!verifyExpressSameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Invalid request origin.' });
  }

  if (req.body?.action === 'logout') {
    revokeExpressArticleSession(req);
    res.setHeader('Set-Cookie', buildSessionCookieHeader('', isExpressHttps(req), 0));
    return res.json({ ok: true, authenticated: false });
  }

  const rate = checkLoginRateLimit(req.ip);
  if (!rate.allowed) {
    return res.status(429).json({ ok: false, error: `Too many failed attempts. Try again in ${rate.retryAfterSec}s.` });
  }

  const authState = getExpressArticleAuthState();
  if (req.body?.action === 'setup') {
    if (!authState.needsSetup) {
      return res.status(409).json({ ok: false, error: 'Password is already configured.' });
    }
    const setupRes = claimInitialAdminPassword(req.body?.password);
    if (!setupRes.ok) {
      recordFailedLogin(req.ip);
      return res.status(setupRes.status).json({ ok: false, error: setupRes.error });
    }
    clearFailedLogins(req.ip);
    const session = issueExpressArticleSession();
    const githubCfg = getGitHubConfig(process.env);
    res.setHeader('Set-Cookie', buildSessionCookieHeader(session.token, isExpressHttps(req), session.maxAgeSec));
    return res.json({
      ok: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      storageMode: githubCfg.configured ? 'github' : 'local',
      githubConfigured: githubCfg.configured,
      branch: githubCfg.branch
    });
  }

  if (authState.needsSetup) {
    return res.status(409).json({ ok: false, needsSetup: true, error: 'Initial admin password must be set first.' });
  }

  if (!verifyExpressArticlePassword(req.body?.password)) {
    recordFailedLogin(req.ip);
    return res.status(401).json({ ok: false, error: 'Invalid password.' });
  }

  clearFailedLogins(req.ip);
  const session = issueExpressArticleSession();
  const githubCfg = getGitHubConfig(process.env);
  res.setHeader('Set-Cookie', buildSessionCookieHeader(session.token, isExpressHttps(req), session.maxAgeSec));
  return res.json({
    ok: true,
    authenticated: true,
    expiresAt: session.expiresAt,
    storageMode: githubCfg.configured ? 'github' : 'local',
    githubConfigured: githubCfg.configured,
    branch: githubCfg.branch
  });
});

app.delete('/api/articles/auth', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!verifyExpressSameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Invalid request origin.' });
  }
  revokeExpressArticleSession(req);
  res.setHeader('Set-Cookie', buildSessionCookieHeader('', isExpressHttps(req), 0));
  return res.json({ ok: true, authenticated: false });
});

app.get('/api/articles', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const session = verifyExpressArticleSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Unauthorized.' });
  }

  const githubCfg = getGitHubConfig(process.env);
  const articleId = String(req.query?.id || '').trim().toLowerCase();
  const lang = String(req.query?.lang || '').trim().toLowerCase();

  try {
    if (githubCfg.configured) {
      const manifestFile = await getRepoFileText(githubCfg, 'content/articles/manifest.json');
      const manifest = manifestFile
        ? JSON.parse(manifestFile.text)
        : { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };

      if (!articleId) {
        const hubsFile = await getRepoFileText(githubCfg, 'content/articles/hubs.json');
        const hubs = hubsFile ? JSON.parse(hubsFile.text) : { sections: {} };
        return res.json({ ok: true, storageMode: 'github', branch: githubCfg.branch, manifest, hubs });
      }
      if (!ARTICLE_SLUG_REGEX.test(articleId)) {
        return res.status(400).json({ ok: false, error: 'Invalid article id.' });
      }
      const article = manifest.articles?.find((a) => a.id === articleId);
      if (!article) {
        return res.status(404).json({ ok: false, error: `Article "${articleId}" not found.` });
      }
      const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
      const contentPath = `content/articles/${article.section}/${article.id}/${targetLang}.json`;
      const contentFile = await getRepoFileText(githubCfg, contentPath);
      return res.json({
        ok: true,
        storageMode: 'github',
        article,
        lang: targetLang,
        contentPath,
        content: contentFile ? JSON.parse(contentFile.text) : null
      });
    }

    const manifest = loadArticleManifest(__dirname);
    if (!articleId) {
      const hubsPath = resolveConfinedArticleFile('hubs.json');
      const hubs = fs.existsSync(hubsPath) ? JSON.parse(fs.readFileSync(hubsPath, 'utf8')) : { sections: {} };
      return res.json({ ok: true, storageMode: 'local', branch: 'local', manifest, hubs });
    }
    if (!ARTICLE_SLUG_REGEX.test(articleId)) {
      return res.status(400).json({ ok: false, error: 'Invalid article id.' });
    }
    const article = manifest.articles?.find((a) => a.id === articleId);
    if (!article || !ARTICLE_SECTIONS.includes(article.section)) {
      return res.status(404).json({ ok: false, error: `Article "${articleId}" not found.` });
    }
    const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
    const contentFilePath = resolveConfinedArticleFile(article.section, article.id, `${targetLang}.json`);
    const content = fs.existsSync(contentFilePath) ? JSON.parse(fs.readFileSync(contentFilePath, 'utf8')) : null;
    return res.json({
      ok: true,
      storageMode: 'local',
      article,
      lang: targetLang,
      contentPath: `content/articles/${article.section}/${article.id}/${targetLang}.json`,
      content
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to load articles.' });
  }
});

app.post('/api/articles/save', express.json({ limit: '256kb' }), async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!verifyExpressSameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Invalid request origin.' });
  }
  const session = verifyExpressArticleSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Please sign in again.' });
  }

  const validation = validateAndNormalizeArticleSave(req.body);
  if (!validation.ok) {
    return res.status(400).json({ ok: false, error: validation.errors[0], errors: validation.errors });
  }

  const githubCfg = getGitHubConfig(process.env);
  try {
    if (githubCfg.configured) {
      const manifestFile = await getRepoFileText(githubCfg, 'content/articles/manifest.json');
      const existingManifest = manifestFile
        ? JSON.parse(manifestFile.text)
        : { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };
      const merged = applyArticleSaveToManifest(existingManifest, validation.normalized);
      if (!merged.ok) {
        return res.status(409).json({ ok: false, error: merged.errors[0], errors: merged.errors });
      }
      const actionVerb = validation.normalized.localeMeta.published ? 'publish' : 'save draft';
      const commitMsg = `docs(articles): ${actionVerb} ${merged.article.section}/${merged.article.id} (${validation.normalized.lang})`;
      const commitResult = await commitRepoFilesAtomic(
        githubCfg,
        [
          { path: 'content/articles/manifest.json', content: JSON.stringify(merged.manifest, null, 2) + '\n' },
          { path: merged.contentRepoPath, content: JSON.stringify(merged.contentJson, null, 2) + '\n' }
        ],
        commitMsg
      );
      return res.json({
        ok: true,
        storageMode: 'github',
        article: merged.article,
        lang: validation.normalized.lang,
        contentPath: merged.contentRepoPath,
        content: merged.contentJson,
        commit: commitResult
      });
    }

    const existingManifest = loadArticleManifest(__dirname);
    const merged = applyArticleSaveToManifest(existingManifest, validation.normalized);
    if (!merged.ok) {
      return res.status(409).json({ ok: false, error: merged.errors[0], errors: merged.errors });
    }
    const manifestPath = resolveConfinedArticleFile('manifest.json');
    const contentPath = resolveConfinedArticleFile(
      merged.article.section,
      merged.article.id,
      `${validation.normalized.lang}.json`
    );
    fs.mkdirSync(path.dirname(contentPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(merged.manifest, null, 2) + '\n', 'utf8');
    fs.writeFileSync(contentPath, JSON.stringify(merged.contentJson, null, 2) + '\n', 'utf8');

    return res.json({
      ok: true,
      storageMode: 'local',
      article: merged.article,
      lang: validation.normalized.lang,
      contentPath: merged.contentRepoPath,
      content: merged.contentJson,
      commit: null
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to save article.' });
  }
});

app.get(['/public/doku.writing.md', '/public/doku.article.md'], (req, res) => {
  const filename = path.basename(req.path);
  const filePath = path.join(__dirname, 'public', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).type('text/plain; charset=utf-8').send('Not found');
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'no-store');
  return res.sendFile(filePath);
});

app.get('/public/doku.writer.html', (_req, res) => {
  const filePath = path.join(__dirname, 'public', 'doku.writer.html');
  if (!fs.existsSync(filePath)) {
    return res.status(404).type('text/plain; charset=utf-8').send('Not found');
  }
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  return res.type('html').sendFile(filePath);
});

app.get(['/doku.writing.md', '/doku.article.md'], (req, res) => {
  return res.redirect(301, `/public${req.path}`);
});

app.use(['/lib', '/functions', '/migrations', '/scripts', '/content', '/templates'], (_req, res) => res.status(404).end());
app.use(express.static(path.join(__dirname), { index: false, dotfiles: 'deny' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
