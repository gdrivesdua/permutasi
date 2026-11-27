/**
 * Shared AdSense Multi-Page Placement & Safe Snippet Parser for Domain Name Articles, Front Page, Guide, FAQ & Studio.
 * Dual-runtime UMD module:
 *  - Node / Cloudflare Workers (ESM side-effect import): populates globalThis.__ADSENSE_SLOTS__
 *  - Browser (<script src="/assets/adsense-slots.js">): populates window.__ADSENSE_SLOTS__
 */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'dn_adsense_studio_config_v1';
  var SUPPORTED_LANGS = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];

  var PAGE_GROUPS = [
    { id: 'article', label: 'Artikel', desc: '5 slot artikel tunggal' },
    { id: 'home', label: 'Front Page', desc: 'Halaman utama (8 bahasa)' },
    { id: 'guide', label: 'Guide', desc: 'Halaman /guide.html (8 bahasa)' },
    { id: 'faq', label: 'FAQ', desc: 'Halaman /faq.html (8 bahasa)' }
  ];

  var DESKTOP_SIZE_PRESETS = {
    slot1: [
      { id: '728x90', label: 'Leaderboard 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: '750x200', label: 'Billboard Ringkas 750 × 200 px', width: 750, height: 200, align: 'center' },
      { id: 'responsive', label: 'Responsif Horizontal (maks. 728 × 100 px)', width: 728, height: 100, align: 'center', fluid: true }
    ],
    slot2: [
      { id: 'fluid-728x260', label: 'In-article Fluid (maks. 728 × ~260 px)', width: 728, height: 260, align: 'center', fluid: true },
      { id: '728x250', label: 'Billboard Artikel 728 × 250 px', width: 728, height: 250, align: 'center' },
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' }
    ],
    slot3: [
      { id: '336x280', label: 'Large Rectangle Rata Tengah 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: '728x90', label: 'Leaderboard Rata Tengah 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: 'fluid-center', label: 'In-article Fluid Rata Tengah (580 × 250 px)', width: 580, height: 250, align: 'center', fluid: true }
    ],
    slot4: [
      { id: 'multiplex-2x3', label: 'Multiplex Grid 2 × 3 (728 × 320 px)', width: 728, height: 320, align: 'center', multiplexCols: 3, multiplexRows: 2 },
      { id: 'multiplex-1x3', label: 'Multiplex Grid 1 × 3 (728 × 210 px)', width: 728, height: 210, align: 'center', multiplexCols: 3, multiplexRows: 1 },
      { id: '336x280', label: 'Display Persegi Panjang Besar 336 × 280 px', width: 336, height: 280, align: 'center' }
    ],
    slot5: [
      { id: '728x90', label: 'Anchor Bottom 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: '970x90', label: 'Large Anchor 970 × 90 px', width: 970, height: 90, align: 'center' }
    ],
    'home-slot1': [
      { id: '970x90', label: 'Large Leaderboard 970 × 90 px', width: 970, height: 90, align: 'center' },
      { id: '728x90', label: 'Leaderboard 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: 'responsive', label: 'Responsif Horizontal (maks. 970 × 100 px)', width: 970, height: 100, align: 'center', fluid: true }
    ],
    'home-slot2': [
      { id: '728x250', label: 'Billboard Horizontal 728 × 250 px', width: 728, height: 250, align: 'center' },
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: '728x90', label: 'Leaderboard 728 × 90 px', width: 728, height: 90, align: 'center' }
    ],
    'guide-slot1': [
      { id: '728x90', label: 'Leaderboard 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: '750x200', label: 'Billboard Ringkas 750 × 200 px', width: 750, height: 200, align: 'center' },
      { id: 'responsive', label: 'Responsif Horizontal (maks. 728 × 100 px)', width: 728, height: 100, align: 'center', fluid: true }
    ],
    'guide-slot2': [
      { id: '728x250', label: 'Billboard Panduan 728 × 250 px', width: 728, height: 250, align: 'center' },
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: 'multiplex-1x3', label: 'Multiplex Grid 1 × 3 (728 × 210 px)', width: 728, height: 210, align: 'center', multiplexCols: 3, multiplexRows: 1 }
    ],
    'faq-slot1': [
      { id: '728x90', label: 'Leaderboard 728 × 90 px', width: 728, height: 90, align: 'center' },
      { id: '728x250', label: 'Billboard Horizontal 728 × 250 px', width: 728, height: 250, align: 'center' },
      { id: 'responsive', label: 'Responsif Horizontal (maks. 728 × 100 px)', width: 728, height: 100, align: 'center', fluid: true }
    ]
  };

  var MOBILE_SIZE_PRESETS = {
    slot1: [
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' },
      { id: 'responsive', label: 'Responsif Mobile (320 × 100 px)', width: 320, height: 100, align: 'center', fluid: true }
    ],
    slot2: [
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' },
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: 'fluid-mobile', label: 'In-article Fluid Mobile (320 × 260 px)', width: 320, height: 260, align: 'center', fluid: true }
    ],
    slot3: [
      { id: '300x250', label: 'Medium Rectangle Rata Tengah 300 × 250 px', width: 300, height: 250, align: 'center' },
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' }
    ],
    slot4: [
      { id: 'multiplex-vertical', label: 'Multiplex Vertikal (320 × 360 px)', width: 320, height: 360, align: 'center', multiplexCols: 1, multiplexRows: 3 },
      { id: '300x250', label: 'Display Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' }
    ],
    slot5: [
      { id: '320x50', label: 'Sticky Mobile Anchor 320 × 50 px', width: 320, height: 50, align: 'center' },
      { id: '320x100', label: 'Large Sticky Anchor 320 × 100 px', width: 320, height: 100, align: 'center' }
    ],
    'home-slot1': [
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' },
      { id: 'responsive', label: 'Responsif Mobile (320 × 100 px)', width: 320, height: 100, align: 'center', fluid: true }
    ],
    'home-slot2': [
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' },
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' }
    ],
    'guide-slot1': [
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' }
    ],
    'guide-slot2': [
      { id: '336x280', label: 'Large Rectangle 336 × 280 px', width: 336, height: 280, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' }
    ],
    'faq-slot1': [
      { id: '320x100', label: 'Large Mobile Banner 320 × 100 px', width: 320, height: 100, align: 'center' },
      { id: '300x250', label: 'Medium Rectangle 300 × 250 px', width: 300, height: 250, align: 'center' }
    ]
  };

  var UNIT_TYPE_OPTIONS = [
    'Display Ad (Horizontal / Responsif)',
    'In-article Ad',
    'In-article Ad / Display Ad (Rata Tengah)',
    'Multiplex Ad / Display Persegi Panjang Besar',
    'Anchor Ad (Overlay Bawah, Dapat Ditutup)'
  ];

  var DEFAULT_SLOTS = [
    {
      id: 'slot1',
      pageGroup: 'article',
      positionKey: 'article-below-takeaways',
      name: 'Slot 1 — Di Bawah Kotak Ringkasan Utama (Sebelum Daftar Isi)',
      placementHint: 'Tepat setelah Ringkasan Utama (Key Takeaways) dan sebelum Daftar Isi.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x90',
      mobileSize: '320x100',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'slot2',
      pageGroup: 'article',
      positionKey: 'article-after-metrics',
      name: 'Slot 2 — Setelah Tabel Ringkasan Metrik per Ekstensi (Bagian 2)',
      placementHint: 'Sesudah Bagian 2 dan Tabel Ringkasan Metrik per Ekstensi (N = 41).',
      unitType: 'In-article Ad',
      enabled: true,
      mode: 'simulation',
      desktopSize: 'fluid-728x260',
      mobileSize: '300x250',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'slot3',
      pageGroup: 'article',
      positionKey: 'article-between-tables',
      name: 'Slot 3 — Di Antara Tabel Kurasi Domain (Kelompok A & Kelompok B)',
      placementHint: 'Rata tengah di antara Tabel Kelompok A (.id) dan Tabel Kelompok B (.net).',
      unitType: 'In-article Ad / Display Ad (Rata Tengah)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '336x280',
      mobileSize: '300x250',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'slot4',
      pageGroup: 'article',
      positionKey: 'article-before-faq',
      name: 'Slot 4 — Setelah Bagian 4 (Checklist 4 Langkah) / Sebelum FAQ',
      placementHint: 'Sesudah Checklist 4 Langkah & catatan data, tepat sebelum Metodologi / FAQ.',
      unitType: 'Multiplex Ad / Display Persegi Panjang Besar',
      enabled: true,
      mode: 'simulation',
      desktopSize: 'multiplex-2x3',
      mobileSize: 'multiplex-vertical',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'slot5',
      pageGroup: 'article',
      positionKey: 'article-bottom-anchor',
      name: 'Slot 5 — Bagian Bawah Layar (Overlay / Anchor Ad)',
      placementHint: 'Menempel di bawah layar (sticky overlay) dengan tombol tutup (×) untuk pengunjung.',
      unitType: 'Anchor Ad (Overlay Bawah, Dapat Ditutup)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x90',
      mobileSize: '320x50',
      marginTop: 20,
      marginBottom: 20,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'home-slot1',
      pageGroup: 'home',
      positionKey: 'index-below-workspace',
      name: 'Front Page Slot 1 — Di Bawah Hasil Generator (Sebelum Share)',
      placementHint: 'Tepat di bawah panel Hasil Domain / Pronounceable Styles sebelum kotak Bagikan Tautan di semua 8 bahasa.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '970x90',
      mobileSize: '320x100',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'home-slot2',
      pageGroup: 'home',
      positionKey: 'index-between-guide-and-faq',
      name: 'Front Page Slot 2 — Di Bawah Cara Pakai 3 Langkah (Sebelum Footer)',
      placementHint: 'Di bawah kartu Cara Pakai 3 Langkah & CTA Panduan/FAQ di semua 8 edisi bahasa Front Page.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x250',
      mobileSize: '336x280',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'guide-slot1',
      pageGroup: 'guide',
      positionKey: 'guide-mid-content',
      name: 'Guide Slot 1 — Setelah Strategi Kata Kunci (Sebelum Strategi Ekstensi)',
      placementHint: 'Di pertengahan halaman /guide.html (dan /<lang>/guide.html) sesudah Strategi Kata Kunci.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x90',
      mobileSize: '320x100',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'guide-slot2',
      pageGroup: 'guide',
      positionKey: 'guide-post-content',
      name: 'Guide Slot 2 — Setelah Contoh Domain (Sebelum CTA Generator)',
      placementHint: 'Di bawah perbandingan contoh domain buruk vs baik sebelum kotak CTA akhir pada /guide.html.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x250',
      mobileSize: '336x280',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    },
    {
      id: 'faq-slot1',
      pageGroup: 'faq',
      positionKey: 'faq-post-list',
      name: 'FAQ Slot 1 — Setelah Daftar Pertanyaan FAQ (Sebelum CTA)',
      placementHint: 'Tepat setelah daftar akordeon pertanyaan pada halaman /faq.html dan /<lang>/faq.html.',
      unitType: 'Display Ad (Horizontal / Responsif)',
      enabled: true,
      mode: 'simulation',
      desktopSize: '728x90',
      mobileSize: '320x100',
      marginTop: 24,
      marginBottom: 24,
      adCode: '',
      langOverrides: {}
    }
  ];

  function escapeHtmlAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeHtmlText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function clampMargin(val, fallback) {
    var num = Number(val);
    if (!Number.isFinite(num)) return fallback || 24;
    return Math.max(20, Math.min(64, Math.round(num)));
  }

  function parseCustomDimension(sizeStr) {
    var match = String(sizeStr || '').trim().match(/^(\d{2,4})x(\d{2,4})$/i);
    if (!match) return null;
    var w = Math.max(120, Math.min(1200, Number(match[1])));
    var h = Math.max(40, Math.min(800, Number(match[2])));
    return { id: w + 'x' + h, label: w + ' × ' + h + ' px', width: w, height: h, align: 'center' };
  }

  function resolveSizeSpec(slotId, sizeKey, viewport) {
    var presets = viewport === 'mobile' ? (MOBILE_SIZE_PRESETS[slotId] || []) : (DESKTOP_SIZE_PRESETS[slotId] || []);
    for (var i = 0; i < presets.length; i++) {
      if (presets[i].id === sizeKey) return presets[i];
    }
    var custom = parseCustomDimension(sizeKey);
    if (custom) return custom;
    return presets[0] || { id: '300x250', label: '300 × 250 px', width: 300, height: 250, align: 'center' };
  }

  function normalizeClientId(raw) {
    var m = String(raw || '').match(/(?:ca-)?(pub-\d{10,24})/i);
    return m ? ('ca-' + m[1].toLowerCase()) : '';
  }

  function normalizeLangCode(rawLang) {
    var clean = String(rawLang || '').trim().toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGS.indexOf(clean) !== -1 ? clean : '';
  }

  /**
   * Safely parses pasted Google AdSense HTML (<script> + <ins class="adsbygoogle" ...>).
   * Never executes or passes through raw HTML/script text. Only allowlisted <ins> attributes are kept.
   */
  function parseAdSenseSnippet(rawCode) {
    var raw = String(rawCode || '').trim();
    if (!raw) {
      return {
        hasCode: false,
        valid: false,
        clientId: '',
        adSlot: '',
        adFormat: '',
        adLayout: '',
        adLayoutKey: '',
        fullWidthResponsive: '',
        warning: ''
      };
    }

    var clientMatch = raw.match(/data-ad-client\s*=\s*["']([^"']+)["']/i)
      || raw.match(/client=(ca-pub-\d{10,24})/i)
      || raw.match(/(ca-pub-\d{10,24})/i);
    var clientId = clientMatch ? normalizeClientId(clientMatch[1]) : '';

    var slotMatch = raw.match(/data-ad-slot\s*=\s*["'](\d{4,20})["']/i);
    var adSlot = slotMatch ? slotMatch[1] : '';

    var formatMatch = raw.match(/data-ad-format\s*=\s*["']([a-z-]+)["']/i);
    var allowedFormats = ['auto', 'fluid', 'autorelaxed', 'rectangle', 'horizontal', 'vertical'];
    var adFormat = formatMatch && allowedFormats.indexOf(formatMatch[1].toLowerCase()) !== -1
      ? formatMatch[1].toLowerCase()
      : '';

    var layoutMatch = raw.match(/data-ad-layout\s*=\s*["']([a-z-]+)["']/i);
    var adLayout = layoutMatch && layoutMatch[1].toLowerCase() === 'in-article' ? 'in-article' : '';

    var layoutKeyMatch = raw.match(/data-ad-layout-key\s*=\s*["']([a-zA-Z0-9_+-]{1,40})["']/i);
    var adLayoutKey = layoutKeyMatch ? layoutKeyMatch[1] : '';

    var fwrMatch = raw.match(/data-full-width-responsive\s*=\s*["'](true|false)["']/i);
    var fullWidthResponsive = fwrMatch ? fwrMatch[1].toLowerCase() : '';

    var hasInsTag = /<ins\b/i.test(raw);
    var valid = Boolean(clientId && adSlot);
    var warning = '';
    if (!valid) {
      if (!hasInsTag && !clientId) {
        warning = 'Cuplikan belum memuat tag <ins class="adsbygoogle"> atau data-ad-client (ca-pub-...).';
      } else if (!clientId) {
        warning = 'data-ad-client (ca-pub-...) tidak terdeteksi.';
      } else if (!adSlot) {
        warning = 'data-ad-slot (angka ID unit iklan) tidak terdeteksi.';
      }
    }

    return {
      hasCode: true,
      valid: valid,
      clientId: clientId,
      adSlot: adSlot,
      adFormat: adFormat,
      adLayout: adLayout,
      adLayoutKey: adLayoutKey,
      fullWidthResponsive: fullWidthResponsive,
      warning: warning
    };
  }

  function normalizeLangOverrideEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var adCode = typeof raw.adCode === 'string' ? raw.adCode.slice(0, 4000) : '';
    var parsed = parseAdSenseSnippet(adCode);
    var clientId = parsed.clientId || normalizeClientId(raw.clientId || '');
    var adSlot = parsed.adSlot || (/^\d{4,20}$/.test(String(raw.adSlot || '').trim()) ? String(raw.adSlot).trim() : '');
    var hasExplicitEnabled = typeof raw.enabled === 'boolean';
    var hasExplicitMode = raw.mode === 'live' || raw.mode === 'simulation';
    if (!adCode.trim() && !adSlot && !hasExplicitEnabled && !hasExplicitMode) {
      return null;
    }
    return {
      enabled: hasExplicitEnabled ? raw.enabled : undefined,
      mode: hasExplicitMode ? raw.mode : undefined,
      adCode: adCode,
      clientId: clientId,
      adSlot: adSlot,
      adFormat: parsed.adFormat || (typeof raw.adFormat === 'string' ? raw.adFormat : ''),
      adLayout: parsed.adLayout || (typeof raw.adLayout === 'string' ? raw.adLayout : ''),
      adLayoutKey: parsed.adLayoutKey || (typeof raw.adLayoutKey === 'string' ? raw.adLayoutKey : ''),
      fullWidthResponsive: parsed.fullWidthResponsive || (typeof raw.fullWidthResponsive === 'string' ? raw.fullWidthResponsive : ''),
      parsed: {
        valid: Boolean(clientId && adSlot),
        clientId: clientId,
        adSlot: adSlot,
        adFormat: parsed.adFormat || (typeof raw.adFormat === 'string' ? raw.adFormat : ''),
        adLayout: parsed.adLayout || (typeof raw.adLayout === 'string' ? raw.adLayout : ''),
        adLayoutKey: parsed.adLayoutKey || (typeof raw.adLayoutKey === 'string' ? raw.adLayoutKey : ''),
        fullWidthResponsive: parsed.fullWidthResponsive || (typeof raw.fullWidthResponsive === 'string' ? raw.fullWidthResponsive : '')
      }
    };
  }

  function cloneDefaultSlots() {
    return DEFAULT_SLOTS.map(function (s) {
      return {
        id: s.id,
        pageGroup: s.pageGroup,
        positionKey: s.positionKey,
        name: s.name,
        placementHint: s.placementHint,
        unitType: s.unitType,
        enabled: s.enabled,
        mode: s.mode,
        desktopSize: s.desktopSize,
        mobileSize: s.mobileSize,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        adCode: s.adCode,
        langOverrides: {}
      };
    });
  }

  function normalizeSlotsConfig(rawInput) {
    var defaults = cloneDefaultSlots();
    var byId = {};
    if (Array.isArray(rawInput)) {
      for (var i = 0; i < rawInput.length; i++) {
        if (rawInput[i] && rawInput[i].id) byId[rawInput[i].id] = rawInput[i];
      }
    } else if (rawInput && typeof rawInput === 'object') {
      for (var k in rawInput) {
        if (Object.prototype.hasOwnProperty.call(rawInput, k)) {
          byId[k] = rawInput[k];
        }
      }
    }

    return defaults.map(function (def) {
      var raw = byId[def.id];
      if (!raw || typeof raw !== 'object') return def;
      var unitType = typeof raw.unitType === 'string' && raw.unitType.trim() ? raw.unitType.trim().slice(0, 120) : def.unitType;
      var name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 140) : def.name;
      var mode = raw.mode === 'live' ? 'live' : 'simulation';
      var desktopSize = typeof raw.desktopSize === 'string' && raw.desktopSize.trim() ? raw.desktopSize.trim().slice(0, 40) : def.desktopSize;
      var mobileSize = typeof raw.mobileSize === 'string' && raw.mobileSize.trim() ? raw.mobileSize.trim().slice(0, 40) : def.mobileSize;
      var marginTop = clampMargin(raw.marginTop !== undefined ? raw.marginTop : raw.marginY, def.marginTop);
      var marginBottom = clampMargin(raw.marginBottom !== undefined ? raw.marginBottom : raw.marginY, def.marginBottom);
      var adCode = typeof raw.adCode === 'string' ? raw.adCode.slice(0, 4000) : '';
      var parsed = parseAdSenseSnippet(adCode);
      var clientId = parsed.clientId || normalizeClientId(raw.clientId || '');
      var adSlot = parsed.adSlot || (/^\d{4,20}$/.test(String(raw.adSlot || '').trim()) ? String(raw.adSlot).trim() : '');

      var langOverrides = {};
      if (raw.langOverrides && typeof raw.langOverrides === 'object') {
        for (var l = 0; l < SUPPORTED_LANGS.length; l++) {
          var langCode = SUPPORTED_LANGS[l];
          if (Object.prototype.hasOwnProperty.call(raw.langOverrides, langCode)) {
            var normEntry = normalizeLangOverrideEntry(raw.langOverrides[langCode]);
            if (normEntry) {
              langOverrides[langCode] = normEntry;
            }
          }
        }
      }

      return {
        id: def.id,
        pageGroup: def.pageGroup,
        positionKey: def.positionKey,
        name: name,
        placementHint: def.placementHint,
        unitType: unitType,
        enabled: raw.enabled !== false,
        mode: mode,
        desktopSize: desktopSize,
        mobileSize: mobileSize,
        marginTop: marginTop,
        marginBottom: marginBottom,
        adCode: adCode,
        langOverrides: langOverrides,
        parsed: {
          valid: Boolean(clientId && adSlot),
          clientId: clientId,
          adSlot: adSlot,
          adFormat: parsed.adFormat || (typeof raw.adFormat === 'string' ? raw.adFormat : ''),
          adLayout: parsed.adLayout || (typeof raw.adLayout === 'string' ? raw.adLayout : ''),
          adLayoutKey: parsed.adLayoutKey || (typeof raw.adLayoutKey === 'string' ? raw.adLayoutKey : ''),
          fullWidthResponsive: parsed.fullWidthResponsive || (typeof raw.fullWidthResponsive === 'string' ? raw.fullWidthResponsive : '')
        }
      };
    });
  }

  function resolveSlotForLang(slot, lang) {
    if (!slot) return slot;
    var langCode = normalizeLangCode(lang);
    var ov = langCode && slot.langOverrides ? slot.langOverrides[langCode] : null;
    if (!ov) return slot;
    var adCode = typeof ov.adCode === 'string' && ov.adCode.trim() ? ov.adCode : slot.adCode;
    var parsedSnippet = parseAdSenseSnippet(adCode);
    var clientId = parsedSnippet.clientId || normalizeClientId(ov.clientId || '') || (slot.parsed && slot.parsed.clientId) || '';
    var adSlot = parsedSnippet.adSlot || ov.adSlot || (slot.parsed && slot.parsed.adSlot) || '';
    return {
      id: slot.id,
      pageGroup: slot.pageGroup,
      positionKey: slot.positionKey,
      name: slot.name,
      placementHint: slot.placementHint,
      unitType: slot.unitType,
      enabled: typeof ov.enabled === 'boolean' ? ov.enabled : slot.enabled,
      mode: (ov.mode === 'live' || ov.mode === 'simulation') ? ov.mode : slot.mode,
      desktopSize: slot.desktopSize,
      mobileSize: slot.mobileSize,
      marginTop: slot.marginTop,
      marginBottom: slot.marginBottom,
      adCode: adCode,
      activeLangOverride: langCode,
      langOverrides: slot.langOverrides,
      parsed: {
        valid: Boolean(clientId && adSlot),
        clientId: clientId,
        adSlot: adSlot,
        adFormat: parsedSnippet.adFormat || ov.adFormat || (slot.parsed && slot.parsed.adFormat) || '',
        adLayout: parsedSnippet.adLayout || ov.adLayout || (slot.parsed && slot.parsed.adLayout) || '',
        adLayoutKey: parsedSnippet.adLayoutKey || ov.adLayoutKey || (slot.parsed && slot.parsed.adLayoutKey) || '',
        fullWidthResponsive: parsedSnippet.fullWidthResponsive || ov.fullWidthResponsive || (slot.parsed && slot.parsed.fullWidthResponsive) || ''
      }
    };
  }

  function buildSafeInsAttributes(slot, globalClientId) {
    var parsed = slot.parsed && slot.parsed.clientId ? slot.parsed : parseAdSenseSnippet(slot.adCode);
    var client = parsed.clientId || normalizeClientId(globalClientId);
    var adSlot = parsed.adSlot || (slot.parsed && slot.parsed.adSlot) || '';
    var attrs = [];
    if (client) attrs.push('data-ad-client="' + escapeHtmlAttr(client) + '"');
    if (adSlot) attrs.push('data-ad-slot="' + escapeHtmlAttr(adSlot) + '"');
    var adFormat = parsed.adFormat || (slot.id === 'slot2' ? 'fluid' : slot.id === 'slot4' ? 'autorelaxed' : 'auto');
    attrs.push('data-ad-format="' + escapeHtmlAttr(adFormat) + '"');
    if (parsed.adLayout) {
      attrs.push('data-ad-layout="' + escapeHtmlAttr(parsed.adLayout) + '"');
    } else if (slot.id === 'slot2') {
      attrs.push('data-ad-layout="in-article"');
    }
    if (parsed.adLayoutKey) {
      attrs.push('data-ad-layout-key="' + escapeHtmlAttr(parsed.adLayoutKey) + '"');
    }
    if (parsed.fullWidthResponsive !== 'false') {
      attrs.push('data-full-width-responsive="true"');
    }
    return {
      clientId: client,
      adSlot: adSlot,
      adFormat: adFormat,
      adLayout: parsed.adLayout || (slot.id === 'slot2' ? 'in-article' : ''),
      adLayoutKey: parsed.adLayoutKey || '',
      fullWidthResponsive: parsed.fullWidthResponsive || 'true',
      valid: Boolean(client && adSlot),
      attrString: attrs.join(' ')
    };
  }

  function buildSlotSsrHtml(slot, globalClientId, opts) {
    if (!slot) return '';
    var options = opts || {};
    var effectiveSlot = options.lang ? resolveSlotForLang(slot, options.lang) : slot;
    var desktopSpec = resolveSizeSpec(effectiveSlot.id, effectiveSlot.desktopSize, 'desktop');
    var mobileSpec = resolveSizeSpec(effectiveSlot.id, effectiveSlot.mobileSize, 'mobile');
    var marginTop = clampMargin(effectiveSlot.marginTop, 24);
    var marginBottom = clampMargin(effectiveSlot.marginBottom, 24);
    var insInfo = buildSafeInsAttributes(effectiveSlot, globalClientId);
    var isLive = effectiveSlot.enabled !== false && effectiveSlot.mode === 'live' && insInfo.valid;
    var posAttr = effectiveSlot.positionKey ? ' data-ad-slot-position="' + escapeHtmlAttr(effectiveSlot.positionKey) + '"' : '';

    if (effectiveSlot.id === 'slot5') {
      if (!isLive && !options.renderSimulationPlaceholder) {
        return '<div id="articleAnchorAdBar" role="region" aria-label="' + escapeHtmlAttr(effectiveSlot.name) + '" data-ad-slot-id="slot5"' + posAttr + ' data-ad-mode="mount" data-desktop-size="' + escapeHtmlAttr(desktopSpec.id) + '" data-mobile-size="' + escapeHtmlAttr(mobileSpec.id) + '" class="dn-ad-mount hidden"></div>';
      }
      var barMaxW = Math.max(desktopSpec.width, 728);
      return '<div id="articleAnchorAdBar" role="region" aria-label="' + escapeHtmlAttr(effectiveSlot.name) + '" data-ad-slot-id="slot5"' + posAttr + ' data-ad-mode="' + escapeHtmlAttr(isLive ? 'live' : 'simulation') + '" data-desktop-size="' + escapeHtmlAttr(desktopSpec.id) + '" data-mobile-size="' + escapeHtmlAttr(mobileSpec.id) + '" class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-lg">'
        + '<div class="max-w-5xl mx-auto px-3 py-1.5 sm:py-2 flex items-center justify-between gap-3">'
        + '<div class="flex-1 flex justify-center min-w-0">'
        + (isLive
          ? '<ins class="adsbygoogle block w-full text-center" style="display:block;max-width:' + barMaxW + 'px;min-height:' + mobileSpec.height + 'px;" ' + insInfo.attrString + '></ins>'
          : '<div class="w-full max-w-[' + desktopSpec.width + 'px] h-[' + mobileSpec.height + 'px] sm:h-[' + desktopSpec.height + 'px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-3 text-center"><span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Anchor Ad · Desktop ' + escapeHtmlText(desktopSpec.id) + ' / Mobile ' + escapeHtmlText(mobileSpec.id) + '</span></div>')
        + '</div>'
        + '<button id="adSlot5CloseBtn" type="button" aria-label="Tutup iklan bawah" title="Tutup iklan bawah" class="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold shrink-0 transition-colors">&times;</button>'
        + '</div></div>';
    }

    var alignCls = effectiveSlot.id === 'slot3' ? 'mx-auto text-center' : 'mx-auto';
    var styleMargin = 'margin-top:' + marginTop + 'px;margin-bottom:' + marginBottom + 'px;';
    var containerStyle = styleMargin + 'max-width:' + desktopSpec.width + 'px;';
    var minHMobile = mobileSpec.height;
    var minHDesktop = desktopSpec.height;

    if (isLive) {
      return '<div role="region" aria-label="' + escapeHtmlAttr(effectiveSlot.name) + '" data-ad-slot-id="' + escapeHtmlAttr(effectiveSlot.id) + '"' + posAttr + ' data-ad-mode="live" data-desktop-size="' + escapeHtmlAttr(desktopSpec.id) + '" data-mobile-size="' + escapeHtmlAttr(mobileSpec.id) + '" style="' + containerStyle + '" class="w-full ' + alignCls + ' min-h-[' + minHMobile + 'px] sm:min-h-[' + minHDesktop + 'px] flex flex-col items-center justify-center">'
        + '<span class="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 select-none">Iklan</span>'
        + '<ins class="adsbygoogle block w-full" style="display:block;text-align:center;" ' + insInfo.attrString + '></ins>'
        + '</div>';
    }

    if (options.renderSimulationPlaceholder && effectiveSlot.enabled !== false) {
      return '<div role="region" aria-label="' + escapeHtmlAttr(effectiveSlot.name) + '" data-ad-slot-id="' + escapeHtmlAttr(effectiveSlot.id) + '"' + posAttr + ' data-ad-mode="simulation" data-desktop-size="' + escapeHtmlAttr(desktopSpec.id) + '" data-mobile-size="' + escapeHtmlAttr(mobileSpec.id) + '" style="' + containerStyle + '" class="w-full ' + alignCls + ' rounded-xl border border-dashed border-blue-200 dark:border-blue-900/60 bg-slate-50/70 dark:bg-slate-900/50 p-3 flex flex-col items-center justify-center text-center min-h-[' + minHMobile + 'px] sm:min-h-[' + minHDesktop + 'px]">'
        + '<p class="text-[11px] font-semibold text-blue-700 dark:text-blue-400">' + escapeHtmlText(effectiveSlot.name) + '</p>'
        + '<p class="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">' + escapeHtmlText(effectiveSlot.unitType) + ' · Desktop ' + escapeHtmlText(desktopSpec.id) + ' · Mobile ' + escapeHtmlText(mobileSpec.id) + '</p>'
        + '</div>';
    }

    // Silent hidden mount container when slot has no filled AdSense code (prevents unprofessional empty boxes on live pages)
    return '<div role="region" aria-label="' + escapeHtmlAttr(effectiveSlot.name) + '" data-ad-slot-id="' + escapeHtmlAttr(effectiveSlot.id) + '"' + posAttr + ' data-ad-mode="mount" data-desktop-size="' + escapeHtmlAttr(desktopSpec.id) + '" data-mobile-size="' + escapeHtmlAttr(mobileSpec.id) + '" data-margin-top="' + marginTop + '" data-margin-bottom="' + marginBottom + '" class="dn-ad-mount hidden"></div>';
  }

  function buildExportSnippetForSlot(slot, globalClientId, langOverride) {
    var effectiveSlot = langOverride ? resolveSlotForLang(slot, langOverride) : slot;
    var ins = buildSafeInsAttributes(effectiveSlot, globalClientId);
    var client = ins.clientId || 'ca-pub-XXXXXXXXXXXXXXXX';
    var slotCode = ins.adSlot || '1234567890';
    var desktopSpec = resolveSizeSpec(effectiveSlot.id, effectiveSlot.desktopSize, 'desktop');
    var mobileSpec = resolveSizeSpec(effectiveSlot.id, effectiveSlot.mobileSize, 'mobile');
    var marginTop = clampMargin(effectiveSlot.marginTop, 24);
    var marginBottom = clampMargin(effectiveSlot.marginBottom, 24);
    var langLabel = langOverride ? ' [' + String(langOverride).toUpperCase() + ']' : '';

    var insLines = [
      '<!-- ' + effectiveSlot.name + langLabel + ' (' + effectiveSlot.unitType + ' | Desktop: ' + desktopSpec.id + ' | Mobile: ' + mobileSpec.id + ') -->',
      '<div class="dn-adsense-slot" style="margin: ' + marginTop + 'px auto ' + marginBottom + 'px auto; max-width: ' + desktopSpec.width + 'px; text-align: center;">',
      '  <ins class="adsbygoogle"',
      '       style="display:block; text-align:center;"',
      '       data-ad-client="' + client + '"',
      '       data-ad-slot="' + slotCode + '"',
      '       data-ad-format="' + ins.adFormat + '"' + (ins.adLayout ? '\n       data-ad-layout="' + ins.adLayout + '"' : '') + '\n       data-full-width-responsive="true"></ins>',
      '  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
      '</div>'
    ];
    return insLines.join('\n');
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    PAGE_GROUPS: PAGE_GROUPS,
    DESKTOP_SIZE_PRESETS: DESKTOP_SIZE_PRESETS,
    MOBILE_SIZE_PRESETS: MOBILE_SIZE_PRESETS,
    UNIT_TYPE_OPTIONS: UNIT_TYPE_OPTIONS,
    DEFAULT_SLOTS: DEFAULT_SLOTS,
    cloneDefaultSlots: cloneDefaultSlots,
    clampMargin: clampMargin,
    resolveSizeSpec: resolveSizeSpec,
    normalizeClientId: normalizeClientId,
    normalizeLangCode: normalizeLangCode,
    parseAdSenseSnippet: parseAdSenseSnippet,
    normalizeSlotsConfig: normalizeSlotsConfig,
    resolveSlotForLang: resolveSlotForLang,
    buildSafeInsAttributes: buildSafeInsAttributes,
    buildSlotSsrHtml: buildSlotSsrHtml,
    buildExportSnippetForSlot: buildExportSnippetForSlot
  };

  root.__ADSENSE_SLOTS__ = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
