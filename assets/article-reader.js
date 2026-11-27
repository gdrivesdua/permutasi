/**
 * Visitor-facing Article Reading Typography (Unified Global fontScale A− / A+ Controls) & Safe AdSense Hydrator.
 */
(function () {
  'use strict';

  var FONT_SCALE_KEY = 'dn_article_font_scale_v1';
  var STUDIO_CONFIG_KEY = 'dn_adsense_studio_config_v1';
  var ANCHOR_DISMISSED_KEY = 'dn_adsense_anchor_dismissed_v1';

  var MIN_SCALE = 0.85;
  var MAX_SCALE = 1.3;
  var STEP_SCALE = 0.05;

  var STUDIO_SCALE_KEYS = [
    'takeaways', 'toc', 'prose', 'bullets', 'callout', 'table', 'code', 'methodology', 'faq', 'related'
  ];

  function normalizeFontScale(val) {
    var num = Number(val);
    if (!Number.isFinite(num)) return 1;
    var clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, num));
    return Number((Math.round(clamped * 20) / 20).toFixed(2));
  }

  function readSavedFontScale() {
    try {
      var raw = localStorage.getItem(FONT_SCALE_KEY);
      if (raw === null || raw === '') return 1;
      return normalizeFontScale(raw);
    } catch (_e) {
      return 1;
    }
  }

  function saveFontScale(scale) {
    try {
      if (scale === 1) {
        localStorage.removeItem(FONT_SCALE_KEY);
      } else {
        localStorage.setItem(FONT_SCALE_KEY, String(scale));
      }
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
          defaults[key] = normalizeFontScale(parsed.fontScales[key]);
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

  function initFontSizeControls() {
    var articleEl = document.getElementById('articleRoot');
    if (!articleEl) return;

    var studioDefaults = getStudioDefaultScales();
    applyStudioDefaultScales(articleEl, studioDefaults);

    // If inline template script already initialized unified controller, simply sync and reuse it.
    if (articleEl.dataset.fontScaleWired === '1' && window.__DN_ARTICLE_FONT_CTRL__) {
      window.__DN_ARTICLE_FONT_CTRL__.syncAllButtons();
      return;
    }

    var fontScale = readSavedFontScale();

    function syncAllButtons() {
      var isMin = fontScale <= MIN_SCALE + 0.001;
      var isMax = fontScale >= MAX_SCALE - 0.001;
      var isDefault = Math.abs(fontScale - 1) <= 0.001;
      var pctText = Math.round(fontScale * 100) + '%';

      var decBtns = articleEl.querySelectorAll('[data-font-act="dec"]');
      for (var i = 0; i < decBtns.length; i++) {
        decBtns[i].disabled = isMin;
        decBtns[i].setAttribute('aria-disabled', isMin ? 'true' : 'false');
      }
      var incBtns = articleEl.querySelectorAll('[data-font-act="inc"]');
      for (var j = 0; j < incBtns.length; j++) {
        incBtns[j].disabled = isMax;
        incBtns[j].setAttribute('aria-disabled', isMax ? 'true' : 'false');
      }
      var pctBtns = articleEl.querySelectorAll('[data-font-pct]');
      for (var k = 0; k < pctBtns.length; k++) {
        pctBtns[k].textContent = pctText;
        pctBtns[k].classList.toggle('hidden', isDefault);
      }
    }

    function updateFontScale(nextScale, persist) {
      fontScale = normalizeFontScale(nextScale);
      articleEl.style.setProperty('--article-font-scale', String(fontScale));
      syncAllButtons();
      if (persist !== false) {
        saveFontScale(fontScale);
      }
      return fontScale;
    }

    updateFontScale(fontScale, false);

    if (articleEl.dataset.fontScaleWired !== '1') {
      articleEl.dataset.fontScaleWired = '1';
      articleEl.addEventListener('click', function (ev) {
        var target = ev.target && ev.target.nodeType === 1
          ? ev.target
          : (ev.target && ev.target.parentElement ? ev.target.parentElement : null);
        var btn = target && target.closest ? target.closest('[data-font-act], [data-font-pct]') : null;
        if (!btn || !articleEl.contains(btn)) return;
        if (btn.disabled) return;

        if (btn.hasAttribute('data-font-pct')) {
          updateFontScale(1, true);
          return;
        }
        var act = btn.getAttribute('data-font-act');
        if (act === 'inc') {
          updateFontScale(fontScale + STEP_SCALE, true);
        } else if (act === 'dec') {
          updateFontScale(fontScale - STEP_SCALE, true);
        }
      });

      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', function (ev) {
          if (ev && ev.key === FONT_SCALE_KEY) {
            updateFontScale(readSavedFontScale(), false);
          }
        });
      }
    }

    window.__DN_ARTICLE_FONT_CTRL__ = {
      getScale: function () { return fontScale; },
      updateFontScale: updateFontScale,
      syncAllButtons: syncAllButtons
    };
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
