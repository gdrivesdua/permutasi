import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  STATIC_HTML_PAGES,
  ARTICLE_SECTIONS,
  loadSiteConfig,
  loadArticleManifest,
  validateArticleManifest,
  resolveArticleSlug,
  renderLocalizedPage,
  renderGuidePage,
  renderFaqPage,
  renderArticleHubPage,
  renderArticlePage,
  buildCloudflareRedirects,
  buildCloudflareHeaders,
  buildAdsTxt,
  buildRobotsTxt,
  buildSitemapXml
} from './site-builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const config = loadSiteConfig(rootDir);
const articleManifest = loadArticleManifest(rootDir);
const manifestValidation = validateArticleManifest(rootDir, articleManifest, config);
if (!manifestValidation.ok) {
  console.error('Article manifest validation failed:');
  for (const err of manifestValidation.errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const pageFile of STATIC_HTML_PAGES) {
  const srcPath = path.join(rootDir, pageFile);
  if (!fs.existsSync(srcPath)) continue;
  const rawHtml = fs.readFileSync(srcPath, 'utf8');

  for (const lang of config.languages) {
    const builtHtml = renderLocalizedPage(rawHtml, pageFile, lang, config);
    const outPath = lang === 'en'
      ? path.join(distDir, pageFile)
      : path.join(distDir, lang, pageFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, builtHtml, 'utf8');
    console.log(`Generated ${lang === 'en' ? `dist/${pageFile}` : `dist/${lang}/${pageFile}`}`);
  }
}

for (const lang of config.languages) {
  const guideHtml = renderGuidePage(rootDir, lang, config);
  const guideOut = lang === 'en'
    ? path.join(distDir, 'guide.html')
    : path.join(distDir, lang, 'guide.html');
  fs.mkdirSync(path.dirname(guideOut), { recursive: true });
  fs.writeFileSync(guideOut, guideHtml, 'utf8');
  console.log(`Generated ${lang === 'en' ? 'dist/guide.html' : `dist/${lang}/guide.html`}`);

  const faqHtml = renderFaqPage(rootDir, lang, config);
  const faqOut = lang === 'en'
    ? path.join(distDir, 'faq.html')
    : path.join(distDir, lang, 'faq.html');
  fs.mkdirSync(path.dirname(faqOut), { recursive: true });
  fs.writeFileSync(faqOut, faqHtml, 'utf8');
  console.log(`Generated ${lang === 'en' ? 'dist/faq.html' : `dist/${lang}/faq.html`}`);
}

for (const section of ARTICLE_SECTIONS) {
  for (const lang of config.languages) {
    const hubHtml = renderArticleHubPage(rootDir, section, lang, config, articleManifest);
    const outPath = lang === 'en'
      ? path.join(distDir, section, 'index.html')
      : path.join(distDir, lang, section, 'index.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, hubHtml, 'utf8');
    console.log(`Generated ${lang === 'en' ? `dist/${section}/index.html` : `dist/${lang}/${section}/index.html`}`);
  }
}

for (const article of articleManifest.articles) {
  for (const lang of config.languages) {
    if (article?.locales?.[lang]?.published !== true) continue;
    const slug = resolveArticleSlug(article, lang);
    const articleHtml = renderArticlePage(rootDir, article, lang, config, articleManifest);
    const outPath = lang === 'en'
      ? path.join(distDir, article.section, slug, 'index.html')
      : path.join(distDir, lang, article.section, slug, 'index.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, articleHtml, 'utf8');
    console.log(`Generated ${lang === 'en' ? `dist/${article.section}/${slug}/index.html` : `dist/${lang}/${article.section}/${slug}/index.html`}`);
  }
}

if (config.seo.generateRobotsTxt) {
  fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(config), 'utf8');
  console.log('Generated dist/robots.txt');
}

if (config.seo.generateSitemapXml) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(config, rootDir), 'utf8');
  console.log('Generated dist/sitemap.xml');
}

const adsTxt = buildAdsTxt(config);
if (adsTxt) {
  fs.writeFileSync(path.join(distDir, 'ads.txt'), adsTxt, 'utf8');
  console.log('Generated dist/ads.txt');
}

fs.writeFileSync(path.join(distDir, '_redirects'), buildCloudflareRedirects(), 'utf8');
console.log('Generated dist/_redirects');

fs.writeFileSync(path.join(distDir, '_headers'), buildCloudflareHeaders(), 'utf8');
console.log('Generated dist/_headers');

const assetsSrcDir = path.join(rootDir, 'assets');
if (fs.existsSync(assetsSrcDir)) {
  const assetsDestDir = path.join(distDir, 'assets');
  fs.cpSync(assetsSrcDir, assetsDestDir, { recursive: true });
  console.log('Copied dist/assets');
}

const publicSrcDir = path.join(rootDir, 'public');
if (fs.existsSync(publicSrcDir)) {
  const publicMdFiles = fs.readdirSync(publicSrcDir).filter((name) => name.endsWith('.md'));
  if (publicMdFiles.length > 0) {
    const publicDestDir = path.join(distDir, 'public');
    fs.mkdirSync(publicDestDir, { recursive: true });
    for (const fileName of publicMdFiles) {
      fs.copyFileSync(path.join(publicSrcDir, fileName), path.join(publicDestDir, fileName));
    }
    console.log(`Copied dist/public markdown docs (${publicMdFiles.join(', ')})`);
  }
}

console.log(`Static build complete for ${config.siteUrl}`);
