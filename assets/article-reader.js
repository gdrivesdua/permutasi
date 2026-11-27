/**
 * Visitor-facing Article Reading Typography (+/- per content part) & Safe 5-Slot AdSense Hydrator.
 */
(function () {
  'use strict';

  var FONT_PREFS_KEY = 'dn_article_font_prefs_v1';
  var STUDIO_CONFIG_KEY = 'dn_adsense_studio_config_v1';
  var ANCHOR_DISMISSED_KEY = 'dn_adsense_anchor_dismissed_v1';

  var PART_KEYS = ['prose', 'bullets', 'callout', 'table', 'methodology', 'faq'];
  var PART_VAR_MAP = {
    prose: '--art-scale-prose',
    bullets: '--art-scale-bullets',
    callout: '--art-scale-callout',
    table: '--art-scale-table',
    methodology: '--art-scale-methodology',
    faq: '--art-scale-faq'
  };

  var DEFAULT_SCALES = {
    prose: 1,
    bullets: 1,
    callout: 1,
    table: 1,
    methodology: 1,
    faq: 1
  };

  function clampScale(val) {
    var num = Number(val);
    if (!Number.isFinite(num)) return 1;
    return Math.round(Math.max(0.82, Math.min(1.36, num)) * 100) / 100;
  }

  function loadFontScales() {
    var scales = Object.assign({}, DEFAULT_SCALES);
    try {
      var raw = localStorage.getItem(FONT_PREFS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (var i = 0; i < PART_KEYS.length; i++) {
            var k = PART_KEYS[i];
            if (parsed[k] !== undefined) scales[k] = clampScale(parsed[k]);
          }
        }
      }
    } catch (_e) {}
    return scales;
  }

  function saveFontScales(scales) {
    try {
      localStorage.setItem(FONT_PREFS_KEY, JSON.stringify(scales));
    } catch (_e) {}
  }

  function applyFontScalesToRoot(articleEl, scales) {
    if (!articleEl) return;
    for (var i = 0; i < PART_KEYS.length; i++) {
      var k = PART_KEYS[i];
      articleEl.style.setProperty(PART_VAR_MAP[k], String(scales[k]));
    }
  }

  function formatPercent(scale) {
    return Math.round(clampScale(scale) * 100) + '%';
  }

  function initFontSizeControls() {
    var articleEl = document.getElementById('articleRoot');
    var toolbar = document.getElementById('articleFontToolbar');
    if (!articleEl || !toolbar) return;

    var scopeSelect = document.getElementById('articleFontScopeSelect');
    var decBtn = document.getElementById('articleFontDecreaseBtn');
    var incBtn = document.getElementById('articleFontIncreaseBtn');
    var resetBtn = document.getElementById('articleFontResetBtn');
    var valueLabel = document.getElementById('articleFontValueLabel');

    var scales = loadFontScales();
    applyFontScalesToRoot(articleEl, scales);

    function currentDisplayScale() {
      var scope = scopeSelect ? scopeSelect.value : 'all';
      if (scope === 'all') {
        return scales.prose;
      }
      return scales[scope] || 1;
    }

    function isAnyCustomized() {
      for (var i = 0; i < PART_KEYS.length; i++) {
        if (Math.abs((scales[PART_KEYS[i]] || 1) - 1) > 0.01) return true;
      }
      return false;
    }

    function syncUi() {
      var val = currentDisplayScale();
      if (valueLabel) {
        valueLabel.textContent = formatPercent(val);
      }
      if (decBtn) decBtn.disabled = val <= 0.83;
      if (incBtn) incBtn.disabled = val >= 1.35;
      if (resetBtn) {
        resetBtn.classList.toggle('hidden', !isAnyCustomized());
      }
    }

    function adjustScale(delta) {
      var scope = scopeSelect ? scopeSelect.value : 'all';
      if (scope === 'all') {
        var nextAll = clampScale((scales.prose || 1) + delta);
        for (var i = 0; i < PART_KEYS.length; i++) {
          scales[PART_KEYS[i]] = nextAll;
        }
      } else if (PART_VAR_MAP[scope]) {
        scales[scope] = clampScale((scales[scope] || 1) + delta);
      }
      applyFontScalesToRoot(articleEl, scales);
      saveFontScales(scales);
      syncUi();
    }

    if (decBtn) decBtn.addEventListener('click', function () { adjustScale(-0.06); });
    if (incBtn) incBtn.addEventListener('click', function () { adjustScale(0.06); });
    if (scopeSelect) scopeSelect.addEventListener('change', syncUi);
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        scales = Object.assign({}, DEFAULT_SCALES);
        applyFontScalesToRoot(articleEl, scales);
        saveFontScales(scales);
        syncUi();
      });
    }

    syncUi();
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

  function createSimulationCardDom(slot, desktopSpec, mobileSpec, isAnchor) {
    var box = document.createElement('div');
    if (isAnchor) {
      box.className = 'w-full max-w-[' + desktopSpec.width + 'px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 flex items-center justify-center text-center';
      box.style.minHeight = mobileSpec.height + 'px';
      var txt = document.createElement('span');
      txt.className = 'text-[11px] font-mono text-slate-500 dark:text-slate-400';
      txt.textContent = slot.name + ' · Desktop ' + desktopSpec.id + ' / Mobile ' + mobileSpec.id;
      box.appendChild(txt);
      return box;
    }

    box.className = 'w-full rounded-xl border border-dashed border-blue-200 dark:border-blue-900/60 bg-slate-50/80 dark:bg-slate-900/50 p-4 flex flex-col items-center justify-center text-center';
    var isMobileViewport = window.innerWidth < 640;
    var activeSpec = isMobileViewport ? mobileSpec : desktopSpec;
    box.style.minHeight = activeSpec.height + 'px';

    var title = document.createElement('p');
    title.className = 'text-xs font-semibold text-blue-700 dark:text-blue-400';
    title.textContent = slot.name;

    var meta = document.createElement('p');
    meta.className = 'text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 tabular-nums';
    meta.textContent = slot.unitType + ' · Desktop ' + desktopSpec.id + ' · Mobile ' + mobileSpec.id;

    box.appendChild(title);
    box.appendChild(meta);

    if (activeSpec.multiplexCols && activeSpec.multiplexRows) {
      var grid = document.createElement('div');
      grid.className = 'mt-3 w-full grid gap-2';
      grid.style.gridTemplateColumns = 'repeat(' + activeSpec.multiplexCols + ', minmax(0, 1fr))';
      var count = activeSpec.multiplexCols * activeSpec.multiplexRows;
      for (var c = 0; c < count; c++) {
        var cell = document.createElement('div');
        cell.className = 'h-14 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] font-mono text-slate-400';
        cell.textContent = 'Unit #' + (c + 1);
        grid.appendChild(cell);
      }
      box.appendChild(grid);
    }

    return box;
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

  function initAdSenseHydration() {
    var anchorBar = document.getElementById('articleAnchorAdBar');
    wireAnchorCloseButton(anchorBar);

    var helper = window.__ADSENSE_SLOTS__;
    if (!helper) return;

    // 1. Apply any locally saved Studio configuration if present and marked applyToArticleView
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
        var slot = normalized[i];
        var mount = document.querySelector('[data-ad-slot-id="' + slot.id + '"]');
        if (!mount) continue;

        if (!slot.enabled) {
          mount.classList.add('hidden');
          mount.textContent = '';
          continue;
        }

        var desktopSpec = helper.resolveSizeSpec(slot.id, slot.desktopSize, 'desktop');
        var mobileSpec = helper.resolveSizeSpec(slot.id, slot.mobileSize, 'mobile');
        var insInfo = helper.buildSafeInsAttributes(slot, globalClient);
        var isLive = slot.mode === 'live' && insInfo.valid;

        if (slot.id === 'slot5') {
          var dismissed = false;
          try { dismissed = sessionStorage.getItem(ANCHOR_DISMISSED_KEY) === '1'; } catch (_e) {}
          if (dismissed) continue;

          mount.className = 'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-lg';
          mount.textContent = '';

          var inner = document.createElement('div');
          inner.className = 'max-w-5xl mx-auto px-3 py-1.5 sm:py-2 flex items-center justify-between gap-3';

          var adHolder = document.createElement('div');
          adHolder.className = 'flex-1 flex justify-center min-w-0';
          if (isLive) {
            ensureAdSenseScriptLoaded(insInfo.clientId);
            adHolder.appendChild(createSafeInsDom(insInfo));
          } else {
            adHolder.appendChild(createSimulationCardDom(slot, desktopSpec, mobileSpec, true));
          }

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
          if (isLive) {
            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_e) {}
          }
          continue;
        }

        mount.className = 'w-full mx-auto flex flex-col items-center justify-center';
        mount.style.marginTop = helper.clampMargin(slot.marginTop, 24) + 'px';
        mount.style.marginBottom = helper.clampMargin(slot.marginBottom, 24) + 'px';
        mount.style.maxWidth = desktopSpec.width + 'px';
        mount.textContent = '';

        if (isLive) {
          ensureAdSenseScriptLoaded(insInfo.clientId);
          var adLabel = document.createElement('span');
          adLabel.className = 'text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 select-none';
          adLabel.textContent = 'Iklan';
          mount.appendChild(adLabel);
          mount.appendChild(createSafeInsDom(insInfo));
          try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_e) {}
        } else {
          mount.appendChild(createSimulationCardDom(slot, desktopSpec, mobileSpec, false));
        }
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
