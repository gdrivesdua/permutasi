import { extractSldAndExt, generateDomainTags } from './domain-tagger.js';

const VALID_CHECK_METHODS = new Set(['RDAP', 'NS']);
const VALID_CHECK_SOURCES = new Set(['auto', 'manual']);
const VALID_MATCH_TYPES = new Set(['nk', 'np', 'up', 'be', 'nc', 'nn', 'os', 'of', 'ol']);

const SORT_COLUMN_MAP = {
  checked_at: 'checked_at',
  domain: 'domain',
  sld: "COALESCE(sld, '')",
  extension: 'extension',
  char_length: 'char_length',
  lang: 'lang',
  check_source: 'check_source',
  check_method: 'check_method',
  overall_heuristic_score: 'COALESCE(overall_heuristic_score, -1)',
  pronunciation_comfort_score: 'COALESCE(pronunciation_comfort_score, -1)',
  brandability_score: 'COALESCE(brandability_score, -1)',
  emd_pmd_score: 'COALESCE(emd_pmd_score, -1)'
};

const EXPORT_COLUMN_META = [
  { key: 'domain', label: 'Domain', align: 'left' },
  { key: 'sld', label: 'SLD', align: 'left' },
  { key: 'extension', label: 'Ext TLD', align: 'left' },
  { key: 'char_length', label: 'Len', align: 'right' },
  { key: 'lang', label: 'Lang', align: 'center' },
  { key: 'check_method', label: 'Method', align: 'center' },
  { key: 'check_source', label: 'Source', align: 'center' },
  { key: 'checked_at', label: 'Checked At (ms)', align: 'right' },
  { key: 'checked_at_iso', label: 'Checked At (ISO)', align: 'left' },
  { key: 'overall_heuristic_score', label: 'Overall Score', align: 'right' },
  { key: 'pronunciation_comfort_score', label: 'Pronunciation Score', align: 'right' },
  { key: 'brandability_score', label: 'Brandability Score', align: 'right' },
  { key: 'structure_length_score', label: 'Structure Length Score', align: 'right' },
  { key: 'extension_lang_fit_score', label: 'Ext/Lang Fit Score', align: 'right' },
  { key: 'character_cleanliness_score', label: 'Cleanliness Score', align: 'right' },
  { key: 'niche_clarity_score', label: 'Niche Clarity Score', align: 'right' },
  { key: 'emd_pmd_score', label: 'EMD/PMD Score', align: 'right' },
  { key: 'emd_pmd_match_type', label: 'Match Type', align: 'center' },
  { key: 'scored_at', label: 'Scored At (ms)', align: 'right' },
  { key: 'tags', label: 'Tags', align: 'left' }
];

const EXPORT_COLUMN_MAP = new Map(EXPORT_COLUMN_META.map((col) => [col.key, col]));
const CSV_COLUMNS = EXPORT_COLUMN_META.map((col) => col.key);

export function escapeSqlLike(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

export function normalizeDomainKey(rawDomain) {
  const clean = String(rawDomain || '').trim().toLowerCase();
  if (!clean || clean.length > 253) return '';
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(clean)) {
    return '';
  }
  return clean;
}

export function parseTagsJson(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags
      .map((t) => String(t || '').trim().toLowerCase())
      .filter(Boolean);
  }
  const str = String(rawTags || '').trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .map((t) => String(t || '').trim().toLowerCase())
          .filter(Boolean);
      }
    } catch {
      // Fallback to comma split
    }
  }
  return str
    .split(/[\s,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeEditableTags(rawTags) {
  const seen = new Set();
  const list = [];
  const rawList = Array.isArray(rawTags)
    ? rawTags
    : (typeof rawTags === 'string' && rawTags.trim().startsWith('['))
      ? parseTagsJson(rawTags)
      : String(rawTags == null ? '' : rawTags).split(/[,;\n]+/);

  for (const item of rawList) {
    const clean = String(item || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    if (!clean || clean.length > 40 || seen.has(clean)) continue;
    seen.add(clean);
    list.push(clean);
    if (list.length >= 12) break;
  }
  return list;
}

function clampNullableScore(val) {
  if (val === '' || val === null || val === undefined) return null;
  const num = Number(val);
  if (!Number.isFinite(num)) return undefined;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export async function ensureAdminDomainsSchema(db) {
  if (!db) throw new Error('Database D1 belum terhubung.');
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS available_domains (
      domain TEXT PRIMARY KEY,
      sld TEXT,
      extension TEXT NOT NULL,
      char_length INTEGER NOT NULL,
      lang TEXT NOT NULL DEFAULT 'en',
      check_method TEXT NOT NULL,
      check_source TEXT NOT NULL,
      checked_at INTEGER NOT NULL,
      pronunciation_comfort_score INTEGER,
      brandability_score INTEGER,
      structure_length_score INTEGER,
      extension_lang_fit_score INTEGER,
      character_cleanliness_score INTEGER,
      niche_clarity_score INTEGER,
      emd_pmd_score INTEGER,
      emd_pmd_match_type TEXT,
      overall_heuristic_score INTEGER,
      scored_at INTEGER,
      tags TEXT
    )
  `).run();
}

export function parseAdminDomainFilters(rawParams = {}) {
  const getParam = (key) => {
    if (typeof rawParams.get === 'function') return rawParams.get(key);
    return rawParams[key];
  };

  const q = String(getParam('q') || '').trim().toLowerCase().slice(0, 120);
  const sld = String(getParam('sld') || '').trim().toLowerCase().slice(0, 80);
  const keyword = String(getParam('keyword') || '').trim().toLowerCase().slice(0, 120);
  const tagsRaw = String(getParam('tags') || '').trim().toLowerCase().slice(0, 160);
  const extRaw = String(getParam('extension') || '').trim().toLowerCase().slice(0, 120);
  const checkSourceRaw = String(getParam('checkSource') ?? getParam('check_source') ?? '').trim().toLowerCase();
  const langRaw = String(getParam('lang') || '').trim().toLowerCase().slice(0, 16);

  const rawCharLen = getParam('charLen') ?? getParam('char_length');
  const rawCharLenMin = getParam('charLenMin') ?? getParam('char_length_min');
  const rawCharLenMax = getParam('charLenMax') ?? getParam('char_length_max');

  const parseBoundedInt = (val, minVal, maxVal) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = Number(val);
    if (!Number.isFinite(n)) return null;
    return Math.max(minVal, Math.min(maxVal, Math.floor(n)));
  };

  const charLen = parseBoundedInt(rawCharLen, 1, 253);
  let charLenMin = parseBoundedInt(rawCharLenMin, 1, 253);
  let charLenMax = parseBoundedInt(rawCharLenMax, 1, 253);
  if (charLen !== null) {
    charLenMin = charLen;
    charLenMax = charLen;
  } else if (charLenMin !== null && charLenMax !== null && charLenMin > charLenMax) {
    const tmp = charLenMin;
    charLenMin = charLenMax;
    charLenMax = tmp;
  }

  const checkSource = VALID_CHECK_SOURCES.has(checkSourceRaw) ? checkSourceRaw : '';
  const lang = /^[a-z]{2,8}$/.test(langRaw) ? langRaw : '';

  const extensions = extRaw
    ? extRaw
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .map((e) => (e.startsWith('.') ? e : `.${e}`))
        .filter((e) => /^\.[a-z0-9.-]{1,30}$/.test(e))
        .slice(0, 10)
    : [];

  const tagTokens = tagsRaw
    ? tagsRaw
        .split(/[,;\s]+/)
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const keywordTokens = keyword
    ? keyword
        .split(/[,;\s]+/)
        .map((k) => k.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const sortKeyRaw = String(getParam('sortBy') || 'checked_at').trim();
  const sortBy = Object.prototype.hasOwnProperty.call(SORT_COLUMN_MAP, sortKeyRaw) ? sortKeyRaw : 'checked_at';
  const sortDirRaw = String(getParam('sortDir') || 'desc').trim().toUpperCase();
  const sortDir = sortDirRaw === 'ASC' ? 'ASC' : 'DESC';

  const page = Math.max(1, Math.floor(Number(getParam('page')) || 1));
  const pageSize = Math.max(10, Math.min(200, Math.floor(Number(getParam('pageSize')) || 50)));

  return {
    q,
    charLen,
    charLenMin,
    charLenMax,
    sld,
    keyword,
    keywordTokens,
    tagsRaw,
    tagTokens,
    extensions,
    checkSource,
    lang,
    sortBy,
    sortDir,
    page,
    pageSize
  };
}

function buildWhereClause(filters) {
  const clauses = [];
  const bindings = [];

  if (filters.q) {
    const pattern = `%${escapeSqlLike(filters.q)}%`;
    clauses.push("(LOWER(domain) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(sld, '')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(tags, '')) LIKE ? ESCAPE '\\' OR LOWER(extension) LIKE ? ESCAPE '\\')");
    bindings.push(pattern, pattern, pattern, pattern);
  }

  if (filters.charLenMin !== null && filters.charLenMax !== null && filters.charLenMin === filters.charLenMax) {
    clauses.push('char_length = ?');
    bindings.push(filters.charLenMin);
  } else {
    if (filters.charLenMin !== null) {
      clauses.push('char_length >= ?');
      bindings.push(filters.charLenMin);
    }
    if (filters.charLenMax !== null) {
      clauses.push('char_length <= ?');
      bindings.push(filters.charLenMax);
    }
  }

  if (filters.sld) {
    const sldPattern = `%${escapeSqlLike(filters.sld)}%`;
    clauses.push("LOWER(COALESCE(sld, '')) LIKE ? ESCAPE '\\'");
    bindings.push(sldPattern);
  }

  if (filters.keywordTokens.length > 0) {
    for (const kw of filters.keywordTokens) {
      const kwPattern = `%${escapeSqlLike(kw)}%`;
      clauses.push("(LOWER(COALESCE(sld, '')) LIKE ? ESCAPE '\\' OR LOWER(domain) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(tags, '')) LIKE ? ESCAPE '\\')");
      bindings.push(kwPattern, kwPattern, kwPattern);
    }
  }

  if (filters.tagTokens.length > 0) {
    for (const tg of filters.tagTokens) {
      const tgExactJson = `%"${escapeSqlLike(tg)}"%`;
      const tgSubstring = `%${escapeSqlLike(tg)}%`;
      clauses.push("(LOWER(COALESCE(tags, '')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(tags, '')) LIKE ? ESCAPE '\\')");
      bindings.push(tgExactJson, tgSubstring);
    }
  }

  if (filters.extensions.length === 1) {
    clauses.push('LOWER(extension) = ?');
    bindings.push(filters.extensions[0]);
  } else if (filters.extensions.length > 1) {
    const placeholders = filters.extensions.map(() => '?').join(', ');
    clauses.push(`LOWER(extension) IN (${placeholders})`);
    bindings.push(...filters.extensions);
  }

  if (filters.checkSource) {
    clauses.push('LOWER(check_source) = ?');
    bindings.push(filters.checkSource);
  }

  if (filters.lang) {
    clauses.push('LOWER(lang) = ?');
    bindings.push(filters.lang);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereSql, bindings };
}

function formatDbRow(row) {
  if (!row) return null;
  const checkedAtNum = Number(row.checked_at) || 0;
  const scoredAtNum = row.scored_at !== null && row.scored_at !== undefined ? Number(row.scored_at) : null;
  const tagsList = parseTagsJson(row.tags);
  return {
    domain: String(row.domain || ''),
    sld: row.sld != null ? String(row.sld) : '',
    extension: String(row.extension || ''),
    char_length: Number(row.char_length) || 0,
    lang: String(row.lang || 'en'),
    check_method: String(row.check_method || 'RDAP'),
    check_source: String(row.check_source || 'manual'),
    checked_at: checkedAtNum,
    checked_at_iso: checkedAtNum > 0 ? new Date(checkedAtNum).toISOString() : '',
    pronunciation_comfort_score: row.pronunciation_comfort_score ?? null,
    brandability_score: row.brandability_score ?? null,
    structure_length_score: row.structure_length_score ?? null,
    extension_lang_fit_score: row.extension_lang_fit_score ?? null,
    character_cleanliness_score: row.character_cleanliness_score ?? null,
    niche_clarity_score: row.niche_clarity_score ?? null,
    emd_pmd_score: row.emd_pmd_score ?? null,
    emd_pmd_match_type: row.emd_pmd_match_type ?? null,
    overall_heuristic_score: row.overall_heuristic_score ?? null,
    scored_at: scoredAtNum,
    tags: row.tags != null ? String(row.tags) : '',
    tagsList
  };
}

export function extractSldKeywords(sld, domain, extension, lang = 'en') {
  const parsed = domain ? extractSldAndExt(domain) : { sld: '', extension: '' };
  const cleanSld = String(sld || parsed.sld || '').trim().toLowerCase();
  if (!cleanSld) return [];
  const cleanExt = String(extension || parsed.extension || '').trim().toLowerCase();
  const tagged = generateDomainTags({
    domain,
    sld: cleanSld,
    extension: cleanExt,
    uiLang: String(lang || 'en').trim().toLowerCase()
  });
  const tokens = Array.isArray(tagged?.tokens)
    ? tagged.tokens.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean).slice(0, 3)
    : [];
  return tokens.length > 0 ? tokens : [cleanSld];
}

export async function queryAdminDomains(db, rawParams = {}) {
  await ensureAdminDomainsSchema(db);
  const filters = parseAdminDomainFilters(rawParams);
  const { whereSql, bindings } = buildWhereClause(filters);
  const orderCol = SORT_COLUMN_MAP[filters.sortBy] || 'checked_at';
  const orderSql = `${orderCol} ${filters.sortDir}, domain ASC`;

  const countStmt = db.prepare(`SELECT COUNT(*) AS total FROM available_domains ${whereSql}`);
  const countRow = bindings.length > 0
    ? await countStmt.bind(...bindings).first()
    : await countStmt.first();
  const total = Number(countRow?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const offset = (safePage - 1) * filters.pageSize;

  const dataSql = `
    SELECT
      domain, sld, extension, char_length, lang, check_method, check_source, checked_at,
      pronunciation_comfort_score, brandability_score, structure_length_score,
      extension_lang_fit_score, character_cleanliness_score, niche_clarity_score,
      emd_pmd_score, emd_pmd_match_type, overall_heuristic_score, scored_at, tags
    FROM available_domains
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `;
  const dataBindings = [...bindings, filters.pageSize, offset];
  const rowsResult = await db.prepare(dataSql).bind(...dataBindings).all();
  const rows = Array.isArray(rowsResult?.results)
    ? rowsResult.results.map((raw) => {
        const formatted = formatDbRow(raw);
        if (!formatted) return formatted;
        return {
          ...formatted,
          sld_keywords: extractSldKeywords(formatted.sld, formatted.domain, formatted.extension, formatted.lang)
        };
      })
    : [];

  return {
    rows,
    total,
    page: safePage,
    pageSize: filters.pageSize,
    totalPages,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir
  };
}

export async function getAdminDomainFacets(db) {
  await ensureAdminDomainsSchema(db);

  const [totalRow, extRes, langRes, srcRes, tagsSampleRes] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS totalCount, MIN(char_length) AS minLen, MAX(char_length) AS maxLen FROM available_domains').first(),
    db.prepare('SELECT LOWER(extension) AS val, COUNT(*) AS cnt FROM available_domains GROUP BY LOWER(extension) ORDER BY cnt DESC, val ASC LIMIT 50').all(),
    db.prepare('SELECT LOWER(lang) AS val, COUNT(*) AS cnt FROM available_domains GROUP BY LOWER(lang) ORDER BY cnt DESC, val ASC LIMIT 20').all(),
    db.prepare('SELECT LOWER(check_source) AS val, COUNT(*) AS cnt FROM available_domains GROUP BY LOWER(check_source) ORDER BY cnt DESC').all(),
    db.prepare("SELECT tags FROM available_domains WHERE tags IS NOT NULL AND trim(tags) != '' ORDER BY checked_at DESC LIMIT 300").all()
  ]);

  const tagCounts = new Map();
  for (const row of (tagsSampleRes?.results || [])) {
    for (const tg of parseTagsJson(row.tags)) {
      tagCounts.set(tg, (tagCounts.get(tg) || 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 40)
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalRows: Number(totalRow?.totalCount || 0),
    minCharLength: totalRow?.minLen ?? null,
    maxCharLength: totalRow?.maxLen ?? null,
    extensions: (extRes?.results || []).map((r) => ({ value: r.val, count: Number(r.cnt || 0) })),
    langs: (langRes?.results || []).map((r) => ({ value: r.val, count: Number(r.cnt || 0) })),
    checkSources: (srcRes?.results || []).map((r) => ({ value: r.val, count: Number(r.cnt || 0) })),
    topTags
  };
}

export async function updateAdminDomainRow(db, rawPayload) {
  await ensureAdminDomainsSchema(db);
  if (!rawPayload || typeof rawPayload !== 'object') {
    return { ok: false, status: 400, error: 'Payload JSON tidak valid.' };
  }

  const domain = normalizeDomainKey(rawPayload.domain);
  if (!domain) {
    return { ok: false, status: 400, error: 'Primary key domain tidak valid.' };
  }

  const existing = await db.prepare('SELECT * FROM available_domains WHERE domain = ?').bind(domain).first();
  if (!existing) {
    return { ok: false, status: 404, error: `Domain "${domain}" tidak ditemukan di database.` };
  }

  const sldRaw = rawPayload.sld !== undefined ? String(rawPayload.sld).trim().toLowerCase() : String(existing.sld || '');
  if (!sldRaw || sldRaw.length > 63 || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(sldRaw)) {
    return { ok: false, status: 400, error: 'SLD harus berupa label RFC 1035 valid (huruf kecil a-z, angka 0-9, atau tanda hubung di tengah).' };
  }

  let extensionRaw = rawPayload.extension !== undefined
    ? String(rawPayload.extension).trim().toLowerCase()
    : String(existing.extension || '');
  if (extensionRaw && !extensionRaw.startsWith('.')) {
    extensionRaw = `.${extensionRaw}`;
  }
  if (!extensionRaw || !/^\.[a-z0-9.-]{1,30}$/.test(extensionRaw)) {
    return { ok: false, status: 400, error: 'Extension tidak valid (contoh: .com, .id, .my.id).' };
  }

  const charLenNum = rawPayload.char_length !== undefined
    ? Number(rawPayload.char_length)
    : Number(existing.char_length);
  if (!Number.isFinite(charLenNum) || charLenNum < 1 || charLenNum > 253) {
    return { ok: false, status: 400, error: 'Char length harus angka antara 1 sampai 253.' };
  }
  const charLength = Math.round(charLenNum);

  const langRaw = rawPayload.lang !== undefined
    ? String(rawPayload.lang).trim().toLowerCase()
    : String(existing.lang || 'en');
  if (!/^[a-z]{2,8}$/.test(langRaw)) {
    return { ok: false, status: 400, error: 'Kode bahasa (lang) harus 2–8 huruf kecil (contoh: id, en).' };
  }

  const methodRaw = rawPayload.check_method !== undefined
    ? String(rawPayload.check_method).trim().toUpperCase()
    : String(existing.check_method || 'RDAP').toUpperCase();
  if (!VALID_CHECK_METHODS.has(methodRaw)) {
    return { ok: false, status: 400, error: 'Check method harus RDAP atau NS.' };
  }

  const sourceRaw = rawPayload.check_source !== undefined
    ? String(rawPayload.check_source).trim().toLowerCase()
    : String(existing.check_source || 'manual').toLowerCase();
  if (!VALID_CHECK_SOURCES.has(sourceRaw)) {
    return { ok: false, status: 400, error: 'Check source harus auto atau manual.' };
  }

  let matchTypeRaw = rawPayload.emd_pmd_match_type !== undefined
    ? String(rawPayload.emd_pmd_match_type || '').trim().toLowerCase()
    : (existing.emd_pmd_match_type || '');
  if (matchTypeRaw && !VALID_MATCH_TYPES.has(matchTypeRaw)) {
    return { ok: false, status: 400, error: 'Kode emd_pmd_match_type tidak dikenal.' };
  }
  const emdPmdMatchType = matchTypeRaw || null;

  const scoreFields = [
    'pronunciation_comfort_score',
    'brandability_score',
    'structure_length_score',
    'extension_lang_fit_score',
    'character_cleanliness_score',
    'niche_clarity_score',
    'emd_pmd_score',
    'overall_heuristic_score'
  ];
  const scoreValues = {};
  for (const field of scoreFields) {
    const rawVal = rawPayload[field] !== undefined ? rawPayload[field] : existing[field];
    const parsedVal = clampNullableScore(rawVal);
    if (parsedVal === undefined) {
      return { ok: false, status: 400, error: `Nilai ${field} harus angka 0–100 atau kosong.` };
    }
    scoreValues[field] = parsedVal;
  }

  const normalizedTags = rawPayload.tags !== undefined
    ? normalizeEditableTags(rawPayload.tags)
    : normalizeEditableTags(existing.tags);
  const tagsJson = normalizedTags.length > 0 ? JSON.stringify(normalizedTags) : null;
  const scoredAt = Date.now();

  await db.prepare(`
    UPDATE available_domains
    SET
      sld = ?1,
      extension = ?2,
      char_length = ?3,
      lang = ?4,
      check_method = ?5,
      check_source = ?6,
      pronunciation_comfort_score = ?7,
      brandability_score = ?8,
      structure_length_score = ?9,
      extension_lang_fit_score = ?10,
      character_cleanliness_score = ?11,
      niche_clarity_score = ?12,
      emd_pmd_score = ?13,
      emd_pmd_match_type = ?14,
      overall_heuristic_score = ?15,
      scored_at = ?16,
      tags = ?17
    WHERE domain = ?18
  `).bind(
    sldRaw,
    extensionRaw,
    charLength,
    langRaw,
    methodRaw,
    sourceRaw,
    scoreValues.pronunciation_comfort_score,
    scoreValues.brandability_score,
    scoreValues.structure_length_score,
    scoreValues.extension_lang_fit_score,
    scoreValues.character_cleanliness_score,
    scoreValues.niche_clarity_score,
    scoreValues.emd_pmd_score,
    emdPmdMatchType,
    scoreValues.overall_heuristic_score,
    scoredAt,
    tagsJson,
    domain
  ).run();

  const updated = await db.prepare('SELECT * FROM available_domains WHERE domain = ?').bind(domain).first();
  const formatted = formatDbRow(updated);
  return {
    ok: true,
    row: formatted
      ? {
          ...formatted,
          sld_keywords: extractSldKeywords(formatted.sld, formatted.domain, formatted.extension, formatted.lang)
        }
      : formatted
  };
}

export async function deleteAdminDomainRows(db, rawDomains) {
  await ensureAdminDomainsSchema(db);
  const rawList = Array.isArray(rawDomains) ? rawDomains : [rawDomains];
  const unique = [];
  const seen = new Set();

  for (const item of rawList) {
    const clean = normalizeDomainKey(item);
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      unique.push(clean);
    }
    if (unique.length >= 200) break;
  }

  if (unique.length === 0) {
    return { ok: false, status: 400, error: 'Pilih minimal 1 domain yang valid untuk dihapus.' };
  }

  const placeholders = unique.map(() => '?').join(', ');
  const res = await db.prepare(`DELETE FROM available_domains WHERE domain IN (${placeholders})`).bind(...unique).run();
  const changes = Number(res?.meta?.changes ?? res?.changes ?? 0);

  return {
    ok: true,
    requestedCount: unique.length,
    deletedCount: changes,
    deletedDomains: unique
  };
}

function neutralizeSpreadsheetCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

function escapeCsvField(value) {
  const safe = neutralizeSpreadsheetCell(value);
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeMarkdownCell(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

export function parseExportColumns(rawParams = {}) {
  const getParam = (key) => {
    if (typeof rawParams.get === 'function') return rawParams.get(key);
    return rawParams[key];
  };
  const rawCols = String(getParam('columns') ?? getParam('cols') ?? '').trim();
  if (!rawCols) {
    return { columns: [...CSV_COLUMNS], hasCustomSelection: false };
  }
  const requested = rawCols
    .split(/[,;\s]+/)
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set();
  const valid = [];
  for (const col of requested) {
    if (EXPORT_COLUMN_MAP.has(col) && !seen.has(col)) {
      seen.add(col);
      valid.push(col);
    }
  }
  if (valid.length === 0) {
    return { columns: [...CSV_COLUMNS], hasCustomSelection: false };
  }
  return { columns: valid, hasCustomSelection: true };
}

export async function exportAdminDomains(db, rawParams = {}, format = 'csv') {
  await ensureAdminDomainsSchema(db);
  const filters = parseAdminDomainFilters(rawParams);
  const { columns: selectedColumns, hasCustomSelection } = parseExportColumns(rawParams);
  const { whereSql, bindings } = buildWhereClause(filters);
  const orderCol = SORT_COLUMN_MAP[filters.sortBy] || 'checked_at';
  const orderSql = `${orderCol} ${filters.sortDir}, domain ASC`;

  const sql = `
    SELECT
      domain, sld, extension, char_length, lang, check_method, check_source, checked_at,
      pronunciation_comfort_score, brandability_score, structure_length_score,
      extension_lang_fit_score, character_cleanliness_score, niche_clarity_score,
      emd_pmd_score, emd_pmd_match_type, overall_heuristic_score, scored_at, tags
    FROM available_domains
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT 10000
  `;
  const stmt = db.prepare(sql);
  const rowsResult = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  const rows = Array.isArray(rowsResult?.results)
    ? rowsResult.results.map(formatDbRow)
    : [];

  const stamp = new Date().toISOString().slice(0, 10);
  const cleanFormat = String(format || 'csv').trim().toLowerCase();

  if (cleanFormat === 'json') {
    const jsonRows = hasCustomSelection
      ? rows.map((r) => {
          const obj = {};
          for (const col of selectedColumns) {
            obj[col] = r[col];
            if (col === 'tags') obj.tagsList = r.tagsList;
          }
          return obj;
        })
      : rows;
    return {
      contentType: 'application/json; charset=utf-8',
      filename: `d1-available-domains-${stamp}.json`,
      body: JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalExported: jsonRows.length,
        columns: selectedColumns,
        rows: jsonRows
      }, null, 2)
    };
  }

  if (cleanFormat === 'md' || cleanFormat === 'markdown') {
    const headers = selectedColumns.map((col) => {
      const meta = EXPORT_COLUMN_MAP.get(col);
      return escapeMarkdownCell(meta ? meta.label : col);
    });
    const separators = selectedColumns.map((col) => {
      const align = EXPORT_COLUMN_MAP.get(col)?.align || 'left';
      if (align === 'right') return '---:';
      if (align === 'center') return ':---:';
      return ':---';
    });
    const lines = [
      `| ${headers.join(' | ')} |`,
      `| ${separators.join(' | ')} |`
    ];
    for (const r of rows) {
      const cells = selectedColumns.map((col) => {
        let val = r[col];
        if (col === 'tags') {
          val = Array.isArray(r.tagsList) && r.tagsList.length > 0 ? r.tagsList.join(', ') : '';
        }
        if (val === null || val === undefined || val === '') return '-';
        const escaped = escapeMarkdownCell(val);
        return escaped === '' ? '-' : escaped;
      });
      lines.push(`| ${cells.join(' | ')} |`);
    }
    return {
      contentType: 'text/markdown; charset=utf-8',
      filename: `d1-available-domains-${stamp}.md`,
      body: lines.join('\n') + '\n'
    };
  }

  if (cleanFormat === 'xls') {
    const headerCells = selectedColumns
      .map((col) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${escapeXml(col)}</Data></Cell>`)
      .join('');
    const xmlRows = rows.map((r) => {
      const cells = selectedColumns.map((col) => {
        const val = r[col];
        if (typeof val === 'number' && Number.isFinite(val)) {
          return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
        }
        const safeStr = neutralizeSpreadsheetCell(val == null ? '' : String(val));
        return `<Cell><Data ss:Type="String">${escapeXml(safeStr)}</Data></Cell>`;
      }).join('');
      return `<Row>${cells}</Row>`;
    }).join('\n');

    const workbookXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?mso-application progid="Excel.Sheet"?>',
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
      ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
      '<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/></Style></Styles>',
      '<Worksheet ss:Name="available_domains">',
      '<Table>',
      `<Row>${headerCells}</Row>`,
      xmlRows,
      '</Table>',
      '</Worksheet>',
      '</Workbook>'
    ].join('\n');

    return {
      contentType: 'application/vnd.ms-excel; charset=utf-8',
      filename: `d1-available-domains-${stamp}.xls`,
      body: workbookXml
    };
  }

  // Default: CSV with UTF-8 BOM
  const lines = [
    selectedColumns.map(escapeCsvField).join(',')
  ];
  for (const r of rows) {
    lines.push(selectedColumns.map((col) => escapeCsvField(r[col] ?? '')).join(','));
  }
  return {
    contentType: 'text/csv; charset=utf-8',
    filename: `d1-available-domains-${stamp}.csv`,
    body: '\uFEFF' + lines.join('\r\n')
  };
}
