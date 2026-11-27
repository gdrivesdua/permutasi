import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { generateDomainTags } from './domain-tagger.js';

let cachedDbWrapper = null;

const LOCAL_SEED_DOMAINS = [
  { domain: 'shopal.id', sld: 'shopal', extension: '.id', lang: 'id', check_method: 'RDAP', check_source: 'auto', scores: [100, 100, 90, 98, 100, 90, 94, 95] },
  { domain: 'shopel.id', sld: 'shopel', extension: '.id', lang: 'id', check_method: 'RDAP', check_source: 'manual', scores: [100, 100, 90, 98, 100, 90, 94, 95] },
  { domain: 'shopem.net', sld: 'shopem', extension: '.net', lang: 'en', check_method: 'RDAP', check_source: 'auto', scores: [100, 100, 90, 91, 100, 90, 94, 94] },
  { domain: 'shopal.my.id', sld: 'shopal', extension: '.my.id', lang: 'id', check_method: 'NS', check_source: 'manual', scores: [100, 100, 90, 81, 100, 90, 92, 93] },
  { domain: 'shopal.web.id', sld: 'shopal', extension: '.web.id', lang: 'id', check_method: 'RDAP', check_source: 'manual', scores: [100, 100, 90, 83, 100, 90, 92, 93] },
  { domain: 'tokokopi.id', sld: 'tokokopi', extension: '.id', lang: 'id', check_method: 'RDAP', check_source: 'auto', scores: [96, 94, 86, 98, 100, 94, 91, 94] },
  { domain: 'kopinusa.id', sld: 'kopinusa', extension: '.id', lang: 'id', check_method: 'RDAP', check_source: 'manual', scores: [94, 92, 86, 98, 100, 90, 89, 92] },
  { domain: 'devflow.io', sld: 'devflow', extension: '.io', lang: 'en', check_method: 'RDAP', check_source: 'auto', scores: [95, 96, 90, 76, 100, 92, 90, 91] },
  { domain: 'maildesk.com', sld: 'maildesk', extension: '.com', lang: 'en', check_method: 'NS', check_source: 'manual', scores: [92, 94, 86, 98, 100, 94, 88, 93] },
  { domain: 'tiendacloud.es', sld: 'tiendacloud', extension: '.es', lang: 'es', check_method: 'RDAP', check_source: 'auto', scores: [88, 86, 72, 95, 100, 85, 86, 87] },
  { domain: 'lojaapp.com.br', sld: 'lojaapp', extension: '.com.br', lang: 'pt', check_method: 'RDAP', check_source: 'manual', scores: [86, 88, 90, 95, 100, 88, 88, 90] },
  { domain: 'marktpro.de', sld: 'marktpro', extension: '.de', lang: 'de', check_method: 'RDAP', check_source: 'auto', scores: [90, 90, 86, 98, 100, 86, 88, 91] }
];

function wrapPreparedStatement(sqliteDb, sql) {
  const buildRunner = (params) => ({
    bind(...nextParams) {
      return buildRunner(nextParams);
    },
    async first() {
      const stmt = sqliteDb.prepare(sql);
      const row = stmt.get(...params);
      return row ?? null;
    },
    async all() {
      const stmt = sqliteDb.prepare(sql);
      const results = stmt.all(...params);
      return { results: results || [], success: true };
    },
    async run() {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        success: true,
        changes: Number(info?.changes || 0),
        meta: { changes: Number(info?.changes || 0) }
      };
    }
  });
  return buildRunner([]);
}

export function getLocalD1Database(rootDir) {
  if (cachedDbWrapper) return cachedDbWrapper;

  const dbPath = path.join(rootDir, '.local-d1.sqlite');
  const sqlite = new DatabaseSync(dbPath);
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec(`
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
  `);

  const countRow = sqlite.prepare('SELECT COUNT(*) AS cnt FROM available_domains').get();
  if (Number(countRow?.cnt || 0) === 0) {
    const insertStmt = sqlite.prepare(`
      INSERT OR IGNORE INTO available_domains (
        domain, sld, extension, char_length, lang, check_method, check_source, checked_at,
        pronunciation_comfort_score, brandability_score, structure_length_score,
        extension_lang_fit_score, character_cleanliness_score, niche_clarity_score,
        emd_pmd_score, emd_pmd_match_type, overall_heuristic_score, scored_at, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const baseTime = Date.now() - 3600 * 1000;
    LOCAL_SEED_DOMAINS.forEach((item, idx) => {
      const tagRes = generateDomainTags({
        domain: item.domain,
        sld: item.sld,
        extension: item.extension,
        uiLang: item.lang
      });
      const ts = baseTime + idx * 60000;
      insertStmt.run(
        item.domain,
        item.sld,
        item.extension,
        item.domain.length,
        item.lang,
        item.check_method,
        item.check_source,
        ts,
        item.scores[0],
        item.scores[1],
        item.scores[2],
        item.scores[3],
        item.scores[4],
        item.scores[5],
        item.scores[6],
        'np',
        item.scores[7],
        ts,
        tagRes.tagsJson
      );
    });
  }

  cachedDbWrapper = {
    prepare(sql) {
      return wrapPreparedStatement(sqlite, sql);
    },
    async batch(statements) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    }
  };
  return cachedDbWrapper;
}
