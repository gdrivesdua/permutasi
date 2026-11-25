export const SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];
export const ARTICLE_SECTIONS = ['guides', 'research', 'tools'];
export const ARTICLE_TYPES = ['TechArticle', 'Article', 'WebApplication'];
export const CHANGEFREQ_VALUES = ['daily', 'weekly', 'monthly', 'yearly'];
export const ARTICLE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function stripUnsafeControlChars(str) {
  return String(str ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function cleanPlainText(value, maxLen = 20000) {
  return stripUnsafeControlChars(value).trim().slice(0, maxLen);
}

export function slugifyText(value, maxLen = 96) {
  const normalized = stripUnsafeControlChars(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return normalized.slice(0, maxLen).replace(/-+$/g, '');
}

export function sanitizeAuthorUrl(rawUrl) {
  const val = cleanPlainText(rawUrl, 300) || '/about.html';
  if (val.startsWith('/') && !val.startsWith('//')) {
    return val;
  }
  try {
    const parsed = new URL(val);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return '/about.html';
  }
  return '/about.html';
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function countArticleWords(content, localeMeta) {
  const parts = [];
  if (localeMeta) {
    parts.push(localeMeta.title, localeMeta.h1, localeMeta.excerpt);
  }
  if (content) {
    if (Array.isArray(content.keyTakeaways)) parts.push(...content.keyTakeaways);
    if (content.interactiveWidgetNotice) parts.push(content.interactiveWidgetNotice);
    if (content.methodologyNote) parts.push(content.methodologyNote);
    if (Array.isArray(content.sections)) {
      for (const sec of content.sections) {
        parts.push(sec?.heading);
        if (Array.isArray(sec?.paragraphs)) parts.push(...sec.paragraphs);
        if (Array.isArray(sec?.bullets)) {
          for (const b of sec.bullets) {
            if (b && typeof b === 'object') parts.push(b.label, b.text);
            else parts.push(b);
          }
        }
        if (sec?.callout) parts.push(sec.callout.title, sec.callout.body);
        if (sec?.table) {
          parts.push(sec.table.caption);
          if (Array.isArray(sec.table.headers)) parts.push(...sec.table.headers);
          if (Array.isArray(sec.table.rows)) {
            for (const row of sec.table.rows) {
              if (Array.isArray(row)) parts.push(...row);
            }
          }
        }
        if (Array.isArray(sec?.subsections)) {
          for (const sub of sec.subsections) {
            parts.push(sub?.heading);
            if (Array.isArray(sub?.paragraphs)) parts.push(...sub.paragraphs);
            if (Array.isArray(sub?.bullets)) parts.push(...sub.bullets);
          }
        }
      }
    }
    if (Array.isArray(content.faqs)) {
      for (const faq of content.faqs) {
        parts.push(faq?.q, faq?.a);
      }
    }
  }
  const joined = parts.filter(Boolean).join(' ').trim();
  if (!joined) return 0;
  return joined.split(/\s+/).filter(Boolean).length;
}

function normalizeSectionBlock(rawSec, idx) {
  const heading = cleanPlainText(rawSec?.heading, 300);
  const rawAnchor = cleanPlainText(rawSec?.anchor, 120);
  const anchor = slugifyText(rawAnchor || heading || `section-${idx + 1}`, 96) || `section-${idx + 1}`;

  const paragraphs = Array.isArray(rawSec?.paragraphs)
    ? rawSec.paragraphs.map((p) => cleanPlainText(p, 12000)).filter(Boolean)
    : [];

  const bullets = Array.isArray(rawSec?.bullets)
    ? rawSec.bullets
      .map((item) => {
        if (item && typeof item === 'object') {
          const label = cleanPlainText(item.label, 200);
          const text = cleanPlainText(item.text, 2000);
          if (!label && !text) return null;
          return label ? { label, text } : text;
        }
        const txt = cleanPlainText(item, 2000);
        return txt || null;
      })
      .filter(Boolean)
    : [];

  let callout;
  if (rawSec?.callout && typeof rawSec.callout === 'object') {
    const body = cleanPlainText(rawSec.callout.body, 4000);
    if (body) {
      callout = {
        tone: rawSec.callout.tone === 'warning' ? 'warning' : 'info',
        title: cleanPlainText(rawSec.callout.title, 250),
        body
      };
    }
  }

  let table;
  if (rawSec?.table && typeof rawSec.table === 'object') {
    const headers = Array.isArray(rawSec.table.headers)
      ? rawSec.table.headers.map((h) => cleanPlainText(h, 200)).filter(Boolean)
      : [];
    const rows = Array.isArray(rawSec.table.rows)
      ? rawSec.table.rows
        .filter((r) => Array.isArray(r))
        .map((r) => r.slice(0, Math.max(headers.length, 1)).map((cell) => cleanPlainText(cell, 1000)))
        .filter((r) => r.some(Boolean))
      : [];
    if (headers.length > 0 && rows.length > 0) {
      table = {
        caption: cleanPlainText(rawSec.table.caption, 300),
        headers,
        rows: rows.map((r) => {
          const padded = [...r];
          while (padded.length < headers.length) padded.push('');
          return padded;
        })
      };
    }
  }

  let codeBlock;
  if (rawSec?.codeBlock && typeof rawSec.codeBlock === 'object') {
    const code = stripUnsafeControlChars(rawSec.codeBlock.code).replace(/\r\n/g, '\n').trimEnd().slice(0, 12000);
    if (code) {
      codeBlock = {
        caption: cleanPlainText(rawSec.codeBlock.caption, 300),
        code
      };
    }
  }

  const subsections = Array.isArray(rawSec?.subsections)
    ? rawSec.subsections
      .map((sub) => {
        const subHeading = cleanPlainText(sub?.heading, 300);
        const subParagraphs = Array.isArray(sub?.paragraphs)
          ? sub.paragraphs.map((p) => cleanPlainText(p, 10000)).filter(Boolean)
          : [];
        const subBullets = Array.isArray(sub?.bullets)
          ? sub.bullets.map((b) => cleanPlainText(b, 2000)).filter(Boolean)
          : [];
        if (!subHeading && subParagraphs.length === 0 && subBullets.length === 0) {
          return null;
        }
        const out = {};
        if (subHeading) out.heading = subHeading;
        if (subParagraphs.length > 0) out.paragraphs = subParagraphs;
        if (subBullets.length > 0) out.bullets = subBullets;
        return out;
      })
      .filter(Boolean)
    : [];

  const normalized = {
    anchor,
    heading,
    paragraphs
  };
  if (bullets.length > 0) normalized.bullets = bullets;
  if (callout) normalized.callout = callout;
  if (table) normalized.table = table;
  if (codeBlock) normalized.codeBlock = codeBlock;
  if (subsections.length > 0) normalized.subsections = subsections;
  return normalized;
}

export function validateAndNormalizeArticleSave(rawPayload) {
  const errors = [];
  if (!rawPayload || typeof rawPayload !== 'object') {
    return { ok: false, errors: ['Request payload must be a JSON object.'] };
  }

  const lang = String(rawPayload.lang || '').trim().toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    errors.push(`Unsupported language "${lang}".`);
  }

  const section = String(rawPayload.section || '').trim().toLowerCase();
  if (!ARTICLE_SECTIONS.includes(section)) {
    errors.push(`Invalid section "${section}". Must be one of: ${ARTICLE_SECTIONS.join(', ')}.`);
  }

  const id = slugifyText(rawPayload.id || '', 96);
  if (!id || !ARTICLE_SLUG_REGEX.test(id)) {
    errors.push('Article ID / slug must contain only lowercase ASCII letters, digits, and single hyphens (a-z0-9-).');
  }

  const defaultSlug = slugifyText(rawPayload.defaultSlug || id, 96) || id;
  if (!ARTICLE_SLUG_REGEX.test(defaultSlug)) {
    errors.push('Default slug must match ^[a-z0-9]+(?:-[a-z0-9]+)*$.');
  }

  const langSlugRaw = cleanPlainText(rawPayload.langSlug, 96);
  const langSlug = langSlugRaw ? slugifyText(langSlugRaw, 96) : '';
  if (langSlugRaw && (!langSlug || !ARTICLE_SLUG_REGEX.test(langSlug))) {
    errors.push('Language-specific slug override must contain only lowercase letters, digits, and hyphens.');
  }

  const articleType = ARTICLE_TYPES.includes(rawPayload.articleType)
    ? rawPayload.articleType
    : (section === 'tools' ? 'WebApplication' : section === 'guides' ? 'TechArticle' : 'Article');

  const changefreq = CHANGEFREQ_VALUES.includes(rawPayload.changefreq) ? rawPayload.changefreq : 'monthly';
  const isPillar = section === 'guides' ? true : Boolean(rawPayload.isPillar);

  const today = getTodayIsoDate();
  const datePublished = cleanPlainText(rawPayload.datePublished, 10) || today;
  const dateModified = cleanPlainText(rawPayload.dateModified, 10) || today;

  if (!DATE_ISO_REGEX.test(datePublished)) {
    errors.push('datePublished must use YYYY-MM-DD format.');
  }
  if (!DATE_ISO_REGEX.test(dateModified)) {
    errors.push('dateModified must use YYYY-MM-DD format.');
  }
  if (DATE_ISO_REGEX.test(datePublished) && DATE_ISO_REGEX.test(dateModified) && dateModified < datePublished) {
    errors.push(`dateModified (${dateModified}) cannot be earlier than datePublished (${datePublished}).`);
  }

  const publish = Boolean(rawPayload.published);

  const localeInput = rawPayload.localeMeta || {};
  const title = cleanPlainText(localeInput.title, 220);
  const metaDesc = cleanPlainText(localeInput.metaDesc, 360);
  const keywords = cleanPlainText(localeInput.keywords, 360);
  const h1 = cleanPlainText(localeInput.h1, 240);
  const excerpt = cleanPlainText(localeInput.excerpt, 600);

  if (publish) {
    if (!title) errors.push('SEO Title (title) is required before publishing.');
    if (!metaDesc) errors.push('Meta Description (metaDesc) is required before publishing.');
    if (!h1) errors.push('Article Heading (h1) is required before publishing.');
  }

  const authorInput = rawPayload.author || {};
  const author = {
    name: cleanPlainText(authorInput.name, 120) || 'Domain Name Editorial',
    role: cleanPlainText(authorInput.role, 120) || 'Domain Research & DNS Strategy',
    url: sanitizeAuthorUrl(authorInput.url)
  };

  let dataSnapshot = null;
  if (rawPayload.dataSnapshot && typeof rawPayload.dataSnapshot === 'object') {
    const sampleNum = Number(rawPayload.dataSnapshot.sampleSize);
    const dateRange = cleanPlainText(rawPayload.dataSnapshot.dateRange, 120);
    const file = cleanPlainText(rawPayload.dataSnapshot.file, 160);
    const table = cleanPlainText(rawPayload.dataSnapshot.table, 80) || 'available_domains';
    if ((Number.isFinite(sampleNum) && sampleNum > 0) || dateRange || file) {
      dataSnapshot = {
        table,
        ...(file ? { file } : {}),
        ...(Number.isFinite(sampleNum) && sampleNum > 0 ? { sampleSize: Math.round(sampleNum) } : {}),
        ...(dateRange ? { dateRange } : {})
      };
    }
  }

  const relatedIds = Array.isArray(rawPayload.relatedIds)
    ? Array.from(new Set(
      rawPayload.relatedIds
        .map((r) => slugifyText(r, 96))
        .filter((r) => r && r !== id && ARTICLE_SLUG_REGEX.test(r))
    )).slice(0, 8)
    : [];

  const contentInput = rawPayload.content || {};
  const breadcrumbLabel = cleanPlainText(contentInput.breadcrumbLabel, 80) || (h1 || title || id).slice(0, 45);
  const keyTakeaways = Array.isArray(contentInput.keyTakeaways)
    ? contentInput.keyTakeaways.map((k) => cleanPlainText(k, 500)).filter(Boolean).slice(0, 10)
    : [];
  const interactiveWidgetNotice = cleanPlainText(contentInput.interactiveWidgetNotice, 1000);
  const methodologyNote = cleanPlainText(contentInput.methodologyNote, 2000);

  const rawSections = Array.isArray(contentInput.sections) ? contentInput.sections : [];
  const sections = rawSections
    .map((sec, idx) => normalizeSectionBlock(sec, idx))
    .filter((sec) => sec.heading || sec.paragraphs.length > 0 || (sec.bullets && sec.bullets.length > 0) || sec.table || sec.codeBlock);

  if (sections.length === 0) {
    if (publish) {
      errors.push('At least one content section with a heading or body text is required before publishing.');
    } else {
      sections.push({
        anchor: 'overview',
        heading: h1 || 'Draft Section',
        paragraphs: [excerpt || 'Draft content in progress.']
      });
    }
  }

  const faqs = Array.isArray(contentInput.faqs)
    ? contentInput.faqs
      .map((f) => ({
        q: cleanPlainText(f?.q, 320),
        a: cleanPlainText(f?.a, 3000)
      }))
      .filter((f) => f.q && f.a)
      .slice(0, 20)
    : [];

  const localeMeta = {
    published: publish,
    title: title || h1 || id,
    metaDesc: metaDesc || excerpt || title || h1 || id,
    keywords,
    h1: h1 || title || id,
    excerpt: excerpt || metaDesc || ''
  };

  const contentDraft = {
    id,
    lang,
    readingTimeMinutes: 1,
    breadcrumbLabel,
    keyTakeaways,
    ...(interactiveWidgetNotice ? { interactiveWidgetNotice } : {}),
    sections,
    ...(methodologyNote ? { methodologyNote } : {}),
    faqs
  };

  const explicitMinutes = Number(contentInput.readingTimeMinutes);
  const computedMinutes = Math.max(1, Math.ceil(countArticleWords(contentDraft, localeMeta) / 200));
  contentDraft.readingTimeMinutes = Number.isFinite(explicitMinutes) && explicitMinutes >= 1 && explicitMinutes <= 120
    ? Math.round(explicitMinutes)
    : computedMinutes;

  const previousId = slugifyText(rawPayload.previousId || '', 96);
  const previousSection = ARTICLE_SECTIONS.includes(rawPayload.previousSection)
    ? rawPayload.previousSection
    : section;

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      id,
      previousId,
      previousSection,
      section,
      defaultSlug,
      langSlug,
      lang,
      articleType,
      isPillar,
      changefreq,
      datePublished,
      dateModified,
      author,
      dataSnapshot,
      relatedIds,
      localeMeta,
      contentJson: contentDraft
    }
  };
}

export function resolveManifestSlug(article, lang) {
  return String(article?.slugByLang?.[lang] || article?.defaultSlug || article?.id || '')
    .trim()
    .toLowerCase();
}

export function applyArticleSaveToManifest(existingManifest, normalized) {
  const manifest = {
    schemaVersion: 1,
    sections: Array.isArray(existingManifest?.sections) && existingManifest.sections.length > 0
      ? [...existingManifest.sections]
      : [...ARTICLE_SECTIONS],
    articles: Array.isArray(existingManifest?.articles)
      ? existingManifest.articles.map((a) => ({
        ...a,
        slugByLang: { ...(a?.slugByLang || {}) },
        locales: { ...(a?.locales || {}) }
      }))
      : []
  };

  const lookupId = normalized.previousId || normalized.id;
  const existingIdx = manifest.articles.findIndex((a) => a.id === lookupId);

  if (normalized.previousId && normalized.previousId !== normalized.id) {
    const conflictIdx = manifest.articles.findIndex((a) => a.id === normalized.id);
    if (conflictIdx !== -1) {
      return {
        ok: false,
        errors: [`Another article already uses ID "${normalized.id}".`]
      };
    }
  }

  const prevArticle = existingIdx >= 0 ? manifest.articles[existingIdx] : null;
  const nextSlugByLang = { ...(prevArticle?.slugByLang || {}) };
  if (normalized.langSlug && normalized.langSlug !== normalized.defaultSlug) {
    nextSlugByLang[normalized.lang] = normalized.langSlug;
  } else {
    delete nextSlugByLang[normalized.lang];
  }

  const nextLocales = { ...(prevArticle?.locales || {}) };
  nextLocales[normalized.lang] = normalized.localeMeta;

  const updatedArticle = {
    id: normalized.id,
    section: normalized.section,
    defaultSlug: normalized.defaultSlug,
    slugByLang: nextSlugByLang,
    articleType: normalized.articleType,
    isPillar: normalized.isPillar,
    changefreq: normalized.changefreq,
    datePublished: normalized.datePublished,
    dateModified: normalized.dateModified,
    author: normalized.author,
    ...(normalized.dataSnapshot ? { dataSnapshot: normalized.dataSnapshot } : {}),
    relatedIds: normalized.relatedIds,
    locales: nextLocales
  };

  if (existingIdx >= 0) {
    manifest.articles[existingIdx] = updatedArticle;
  } else {
    manifest.articles.unshift(updatedArticle);
  }

  // Enforce unique published routes across manifest (mirrors validateArticleManifest)
  const routeErrors = [];
  const seenRoutes = new Set();
  for (const article of manifest.articles) {
    for (const lang of SUPPORTED_LANGUAGES) {
      const loc = article?.locales?.[lang];
      if (!loc || loc.published !== true) continue;
      const slug = resolveManifestSlug(article, lang);
      const routeKey = lang === 'en' ? `/${article.section}/${slug}/` : `/${lang}/${article.section}/${slug}/`;
      if (seenRoutes.has(routeKey)) {
        routeErrors.push(`Route collision detected at "${routeKey}". Choose a unique slug.`);
      }
      seenRoutes.add(routeKey);
    }
  }

  if (routeErrors.length > 0) {
    return { ok: false, errors: routeErrors };
  }

  const contentRepoPath = `content/articles/${normalized.section}/${normalized.id}/${normalized.lang}.json`;
  return {
    ok: true,
    manifest,
    article: updatedArticle,
    contentRepoPath,
    contentJson: normalized.contentJson
  };
}
