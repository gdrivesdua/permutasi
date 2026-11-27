/**
 * Visitor-facing Article Reading Typography (Per-Part A− / A+ Controls) & Safe AdSense Hydrator.
 */
(function () {
  'use strict';

  var PART_PREFS_KEY = 'dn_article_part_font_prefs_v1';
  var STUDIO_CONFIG_KEY = 'dn_adsense_studio_config_v1';
  var ANCHOR_DISMISSED_KEY = 'dn_adsense_anchor_dismissed_v1';

  var STUDIO_SCALE_KEYS = [
    'takeaways', 'toc', 'prose', 'bullets', 'callout', 'table', 'code', 'methodology', 'faq', 'related'
  ];

  function clampScale(val) {
    var num = Number(val);
    if (!Number.isFinite(num)) return 1;
    return Math.round(Math.max(0.82, Math.min(1.36, num)) * 100) / 100;
  }

  function formatPercent(scale) {
    return Math.round(clampScale(scale) * 100) + '%';
  }

  function getArticleStorageScopeKey() {
    var id = '';
    var lang = '';
    try {
      if (document.body) {
        id = document.body.getAttribute('data-article-id') || '';
        lang = document.body.getAttribute('data-page-lang') || '';
      }
    } catch (_e) {}
    if (id) {
      return lang ? (id + ':' + lang) : id;
    }
    return window.location.pathname || 'default';
  }

  function getPartSpotKey(partEl) {
    if (!partEl) return '';
    return partEl.getAttribute('data-part-key') || partEl.getAttribute('data-part-idx') || '';
  }

  function loadAllPartPrefs() {
    try {
      var raw = localStorage.getItem(PART_PREFS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_e) {}
    return {};
  }

  function loadPartScalesForArticle(scopeKey) {
    var all = loadAllPartPrefs();
    var entry = all[scopeKey];
    if (!entry || typeof entry !== 'object') {
      // Fallback check if earlier version stored bare articleId without :lang suffix
      var bareId = scopeKey.indexOf(':') !== -1 ? scopeKey.split(':')[0] : '';
      if (bareId && all[bareId] && typeof all[bareId] === 'object') {
        entry = all[bareId];
      }
    }
    if (!entry || typeof entry !== 'object') return {};
    var clean = {};
    Object.keys(entry).forEach(function (k) {
      var val = clampScale(entry[k]);
      if (Math.abs(val - 1) > 0.005) {
        clean[k] = val;
      }
    });
    return clean;
  }

  function savePartScalesForArticle(scopeKey, scalesByKey) {
    try {
      var all = loadAllPartPrefs();
      var hasCustom = Object.keys(scalesByKey).length > 0;
      if (hasCustom) {
        all[scopeKey] = scalesByKey;
      } else {
        delete all[scopeKey];
      }
      localStorage.setItem(PART_PREFS_KEY, JSON.stringify(all));
    } catch (_e) {}
  }

  function getStudioDefaultScales() {
    var defaults = {};
    try {
      var raw = localStorage.getItem(STUDIO_CONFIG_KEY);
      if (!raw) return defaults;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.applyPreviewToSite || !parsed.fontScales) return defaults;
      for (var i = 0; i < STUDIO_SCALE_KEYS.length; i++) {
        var key = STUDIO_SCALE_KEYS[i];
        if (parsed.fontScales[key] !== undefined) {
          defaults[key] = clampScale(parsed.fontScales[key]);
        }
      }
    } catch (_e) {}
    return defaults;
  }

  function applyStudioDefaultScales(articleEl, studioDefaults) {
    if (!articleEl || !studioDefaults) return;
    Object.keys(studioDefaults).forEach(function (key) {
      articleEl.style.setProperty('--art-scale-' + key, String(studioDefaults[key]));
    });
  }

  function syncPartUi(partEl, customScale, studioBaseScale) {
    if (!partEl) return;
    var hasCustom = typeof customScale === 'number' && Math.abs(customScale - 1) > 0.005;
    var effectiveScale = hasCustom ? clampScale(customScale) : clampScale(studioBaseScale || 1);

    if (hasCustom) {
      partEl.style.setProperty('--part-scale', String(effectiveScale));
    } else {
      partEl.style.removeProperty('--part-scale');
    }

    var decBtn = partEl.querySelector('[data-font-act="dec"]');
    var incBtn = partEl.querySelector('[data-font-act="inc"]');
    var pctBtn = partEl.querySelector('[data-font-pct]');
    if (decBtn) decBtn.disabled = effectiveScale <= 0.83;
    if (incBtn) incBtn.disabled = effectiveScale >= 1.35;
    if (pctBtn) {
      pctBtn.textContent = formatPercent(effectiveScale);
      pctBtn.classList.toggle('hidden', !hasCustom);
    }
  }

  function initFontSizeControls() {
    var articleEl = document.getElementById('articleRoot');
    if (!articleEl) return;

    var studioDefaults = getStudioDefaultScales();
    applyStudioDefaultScales(articleEl, studioDefaults);

    var scopeKey = getArticleStorageScopeKey();
    var savedByKey = loadPartScalesForArticle(scopeKey);
    var partEls = articleEl.querySelectorAll('.dn-font-part');
    if (!partEls || partEls.length === 0) return;

    function syncAllPartsFromState() {
      var list = articleEl.querySelectorAll('.dn-font-part');
      for (var i = 0; i < list.length; i++) {
        var partEl = list[i];
        var spotKey = getPartSpotKey(partEl);
        var legacyIdx = partEl.getAttribute('data-part-idx') || '';
        var partType = partEl.getAttribute('data-font-part') || 'prose';
        var baseScale = studioDefaults[partType] !== undefined ? studioDefaults[partType] : 1;

        var customVal;
        if (spotKey && savedByKey[spotKey] !== undefined) {
          customVal = clampScale(savedByKey[spotKey]);
        } else if (legacyIdx && savedByKey[legacyIdx] !== undefined) {
          customVal = clampScale(savedByKey[legacyIdx]);
          if (spotKey && spotKey !== legacyIdx) {
            savedByKey[spotKey] = customVal;
            delete savedByKey[legacyIdx];
            savePartScalesForArticle(scopeKey, savedByKey);
          }
        }
        syncPartUi(partEl, customVal, baseScale);
      }
    }

    syncAllPartsFromState();

    articleEl.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest('[data-font-act], [data-font-pct]') : null;
      if (!btn || !articleEl.contains(btn)) return;

      var partEl = btn.closest('.dn-font-part');
      if (!partEl) return;

      var spotKey = getPartSpotKey(partEl);
      var partType = partEl.getAttribute('data-font-part') || 'prose';
      var baseScale = studioDefaults[partType] !== undefined ? studioDefaults[partType] : 1;
      var currentScale = (spotKey && savedByKey[spotKey] !== undefined)
        ? clampScale(savedByKey[spotKey])
        : baseScale;
      var nextScale = 1;

      if (btn.hasAttribute('data-font-pct')) {
        nextScale = 1;
      } else {
        var act = btn.getAttribute('data-font-act');
        var delta = act === 'inc' ? 0.06 : (act === 'dec' ? -0.06 : 0);
        if (!delta) return;
        nextScale = clampScale(currentScale + delta);
      }

      var isDefault = Math.abs(nextScale - 1) <= 0.005;
      if (isDefault) {
        if (spotKey) delete savedByKey[spotKey];
      } else if (spotKey) {
        savedByKey[spotKey] = nextScale;
      }

      syncPartUi(partEl, isDefault ? undefined : nextScale, baseScale);
      savePartScalesForArticle(scopeKey, savedByKey);
    });

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', function (ev) {
        if (ev && ev.key === PART_PREFS_KEY) {
          savedByKey = loadPartScalesForArticle(scopeKey);
          syncAllPartsFromState();
        }
      });
    }
  }

  function ensureAdSenseScriptLoaded(clientId) {
    if (!clientId || !/^ca-pub-\d{10,24}$/.test(clientId)) return;
    var existing = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (existing) return;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(clientId);
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  function createSafeInsDom(insInfo) {
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle block w-full text-center';
    ins.style.display = 'block';
    ins.style.textAlign = 'center';
    ins.setAttribute('data-ad-client', insInfo.clientId);
    ins.setAttribute('data-ad-slot', insInfo.adSlot);
    if (insInfo.adFormat) ins.setAttribute('data-ad-format', insInfo.adFormat);
    if (insInfo.adLayout) ins.setAttribute('data-ad-layout', insInfo.adLayout);
    if (insInfo.adLayoutKey) ins.setAttribute('data-ad-layout-key', insInfo.adLayoutKey);
    ins.setAttribute('data-full-width-responsive', 'true');
    return ins;
  }

  function wireAnchorCloseButton(barEl) {
    if (!barEl) return;
    try {
      if (sessionStorage.getItem(ANCHOR_DISMISSED_KEY) === '1') {
        barEl.classList.add('hidden');
        return;
      }
    } catch (_e) {}

    var closeBtn = document.getElementById('adSlot5CloseBtn');
    if (closeBtn && !closeBtn.dataset.wired) {
      closeBtn.dataset.wired = '1';
      closeBtn.addEventListener('click', function () {
        barEl.classList.add('hidden');
        try {
          sessionStorage.setItem(ANCHOR_DISMISSED_KEY, '1');
        } catch (_e) {}
      });
    }
  }

  function detectActivePageLang(helper) {
    var raw = '';
    try {
      if (typeof window.__STATIC_PAGE_LANG__ === 'string' && window.__STATIC_PAGE_LANG__) {
        raw = window.__STATIC_PAGE_LANG__;
      } else if (document.body && document.body.getAttribute('data-page-lang')) {
        raw = document.body.getAttribute('data-page-lang');
      } else if (document.documentElement && document.documentElement.lang) {
        raw = document.documentElement.lang;
      }
    } catch (_e) {}
    return helper && helper.normalizeLangCode ? (helper.normalizeLangCode(raw) || 'en') : 'en';
  }

  function hideMount(mount) {
    if (!mount) return;
    mount.className = 'dn-ad-mount hidden';
    mount.removeAttribute('data-ad-mode');
    mount.style.marginTop = '';
    mount.style.marginBottom = '';
    mount.style.maxWidth = '';
    mount.textContent = '';
  }

  function initAdSenseHydration() {
    var anchorBar = document.getElementById('articleAnchorAdBar');
    wireAnchorCloseButton(anchorBar);

    var helper = window.__ADSENSE_SLOTS__;
    if (!helper) return;

    var pageLang = detectActivePageLang(helper);

    // 1. Apply locally saved Studio configuration ONLY for slots that have valid live AdSense credentials.
    // Unfilled slots never render wireframe/dashed indicators on public visitor pages.
    var studioConfig = null;
    try {
      var raw = localStorage.getItem(STUDIO_CONFIG_KEY);
      if (raw) {
        studioConfig = JSON.parse(raw);
      }
    } catch (_e) {}

    if (studioConfig && studioConfig.applyPreviewToSite && Array.isArray(studioConfig.slots)) {
      var normalized = helper.normalizeSlotsConfig(studioConfig.slots);
      var globalClient = helper.normalizeClientId(studioConfig.globalPublisherId || '');
      for (var i = 0; i < normalized.length; i++) {
        var baseSlot = normalized[i];
        var slot = helper.resolveSlotForLang ? helper.resolveSlotForLang(baseSlot, pageLang) : baseSlot;
        var mount = document.querySelector('[data-ad-slot-id="' + slot.id + '"]');
        if (!mount) continue;

        var insInfo = helper.buildSafeInsAttributes(slot, globalClient);
        var isLive = slot.enabled !== false && slot.mode === 'live' && insInfo.valid;

        if (!isLive) {
          hideMount(mount);
          continue;
        }

        var desktopSpec = helper.resolveSizeSpec(slot.id, slot.desktopSize, 'desktop');

        if (slot.id === 'slot5') {
          var dismissed = false;
          try { dismissed = sessionStorage.getItem(ANCHOR_DISMISSED_KEY) === '1'; } catch (_e) {}
          if (dismissed) {
            hideMount(mount);
            continue;
          }

          mount.className = 'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-lg';
          mount.setAttribute('data-ad-mode', 'live');
          mount.textContent = '';

          var inner = document.createElement('div');
          inner.className = 'max-w-5xl mx-auto px-3 py-1.5 sm:py-2 flex items-center justify-between gap-3';

          var adHolder = document.createElement('div');
          adHolder.className = 'flex-1 flex justify-center min-w-0';
          ensureAdSenseScriptLoaded(insInfo.clientId);
          adHolder.appendChild(createSafeInsDom(insInfo));

          var closeBtn = document.createElement('button');
          closeBtn.id = 'adSlot5CloseBtn';
          closeBtn.type = 'button';
          closeBtn.setAttribute('aria-label', 'Tutup iklan bawah');
          closeBtn.title = 'Tutup iklan bawah';
          closeBtn.className = 'min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold shrink-0 transition-colors';
          closeBtn.textContent = '×';

          inner.appendChild(adHolder);
          inner.appendChild(closeBtn);
          mount.appendChild(inner);
          wireAnchorCloseButton(mount);
          try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_e) {}
          continue;
        }

        mount.className = 'w-full mx-auto flex flex-col items-center justify-center';
        mount.setAttribute('data-ad-mode', 'live');
        mount.style.marginTop = helper.clampMargin(slot.marginTop, 24) + 'px';
        mount.style.marginBottom = helper.clampMargin(slot.marginBottom, 24) + 'px';
        mount.style.maxWidth = desktopSpec.width + 'px';
        mount.textContent = '';

        ensureAdSenseScriptLoaded(insInfo.clientId);
        var adLabel = document.createElement('span');
        adLabel.className = 'text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 select-none';
        adLabel.textContent = 'Iklan';
        mount.appendChild(adLabel);
        mount.appendChild(createSafeInsDom(insInfo));
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_e) {}
      }
      return;
    }

    // 2. Otherwise trigger adsbygoogle.push for any SSR-rendered <ins class="adsbygoogle"> slots
    var ssrInsNodes = document.querySelectorAll('[data-ad-mode="live"] ins.adsbygoogle');
    if (ssrInsNodes.length > 0) {
      for (var n = 0; n < ssrInsNodes.length; n++) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (_e) {}
      }
    }
  }

  window.__REFRESH_ADSENSE_SLOTS__ = initAdSenseHydration;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFontSizeControls();
      initAdSenseHydration();
    });
  } else {
    initFontSizeControls();
    initAdSenseHydration();
  }
})();
