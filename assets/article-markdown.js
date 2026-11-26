/**
 * Shared Zero-Dependency Safe Markdown Engine for Domain Name Editorial CMS & Static Builder.
 * Dual-runtime UMD module:
 *  - Node / Cloudflare Workers (ESM side-effect import): populates globalThis.__ARTICLE_MARKDOWN__
 *  - Browser (<script src="/assets/article-markdown.js">): populates window.__ARTICLE_MARKDOWN__
 */
(function (root) {
  'use strict';

  var ESCAPABLE_CHARS = '\\`*_{}[]()#+-.!|>';

  function escapeHtmlText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeHtmlAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sanitizeMarkdownHref(rawUrl) {
    var raw = String(rawUrl == null ? '' : rawUrl).trim();
    if (!raw) return null;

    // Strip optional enclosing <...>
    if (raw.charAt(0) === '<' && raw.charAt(raw.length - 1) === '>') {
      raw = raw.slice(1, -1).trim();
    } else {
      // Strip optional Markdown link title: https://example.com "Title"
      var titleMatch = raw.match(/^(\S+)\s+(?:"[^"]*"|'[^']*'|\([^)]*\))\s*$/);
      if (titleMatch) {
        raw = titleMatch[1];
      }
    }

    if (!raw) return null;
    // Reject control characters or internal whitespace
    if (/[\u0000-\u0020\u007F]/.test(raw)) return null;

    // Allow clean in-page anchor links
    if (/^#[A-Za-z0-9][A-Za-z0-9_-]*$/.test(raw)) {
      return { href: raw, external: false };
    }

    // Allow single-slash site-relative paths (reject protocol-relative //evil.com or /\)
    if (raw.charAt(0) === '/' && raw.charAt(1) !== '/' && raw.charAt(1) !== '\\') {
      if (/^\/[^\s<>"]*$/.test(raw)) {
        return { href: raw, external: false };
      }
      return null;
    }

    // Allow http:// and https:// only
    try {
      var parsed = new URL(raw);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return { href: parsed.href, external: true };
      }
    } catch (_e) {
      return null;
    }
    return null;
  }

  function pushText(tokens, text) {
    if (!text) return;
    if (tokens.length > 0 && tokens[tokens.length - 1].type === 'text') {
      tokens[tokens.length - 1].value += text;
    } else {
      tokens.push({ type: 'text', value: text });
    }
  }

  function findClosingBackticks(str, startIdx, tickLen) {
    var i = startIdx;
    var len = str.length;
    while (i < len) {
      if (str.charAt(i) === '`') {
        var run = 0;
        while (i + run < len && str.charAt(i + run) === '`') run++;
        if (run === tickLen) {
          return i;
        }
        i += run;
        continue;
      }
      i += 1;
    }
    return -1;
  }

  function findClosingBracket(str, openIdx) {
    var depth = 1;
    var i = openIdx + 1;
    var len = str.length;
    while (i < len) {
      var ch = str.charAt(i);
      if (ch === '\\' && i + 1 < len) {
        i += 2;
        continue;
      }
      if (ch === '`') {
        var tLen = 0;
        while (i + tLen < len && str.charAt(i + tLen) === '`') tLen++;
        var closeTick = findClosingBackticks(str, i + tLen, tLen);
        if (closeTick !== -1) {
          i = closeTick + tLen;
          continue;
        }
        i += tLen;
        continue;
      }
      if (ch === '[') {
        depth += 1;
      } else if (ch === ']') {
        depth -= 1;
        if (depth === 0) return i;
      }
      i += 1;
    }
    return -1;
  }

  function findClosingParen(str, openIdx) {
    var depth = 1;
    var i = openIdx + 1;
    var len = str.length;
    while (i < len) {
      var ch = str.charAt(i);
      if (ch === '\\' && i + 1 < len) {
        i += 2;
        continue;
      }
      if (ch === '\n' || ch === '\r') {
        return -1;
      }
      if (ch === '(') {
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
        if (depth === 0) return i;
      }
      i += 1;
    }
    return -1;
  }

  function findClosingEmphasis(str, startIdx, markerChar, runLen) {
    var i = startIdx;
    var len = str.length;
    while (i < len) {
      var ch = str.charAt(i);
      if (ch === '\\' && i + 1 < len) {
        i += 2;
        continue;
      }
      if (ch === '`') {
        var tLen = 0;
        while (i + tLen < len && str.charAt(i + tLen) === '`') tLen++;
        var closeTick = findClosingBackticks(str, i + tLen, tLen);
        if (closeTick !== -1) {
          i = closeTick + tLen;
          continue;
        }
        i += tLen;
        continue;
      }
      if (ch === markerChar) {
        var run = 0;
        while (i + run < len && str.charAt(i + run) === markerChar) run++;
        if (run === runLen && i > startIdx) {
          var prevCh = str.charAt(i - 1);
          var afterCh = i + run < len ? str.charAt(i + run) : '';
          var notPrecededBySpace = !/\s/.test(prevCh);
          var wordBoundaryOk = markerChar !== '_' || !/[A-Za-z0-9_]/.test(afterCh);
          if (notPrecededBySpace && wordBoundaryOk) {
            return i;
          }
        }
        i += run;
        continue;
      }
      i += 1;
    }
    return -1;
  }

  function parseInlineTokens(input, options) {
    var opts = options || {};
    var allowLinks = opts.allowLinks !== false;
    var depth = opts._depth || 0;
    var str = String(input == null ? '' : input);
    var tokens = [];
    if (!str) return tokens;

    if (depth > 4) {
      return [{ type: 'text', value: str }];
    }

    var i = 0;
    var len = str.length;

    while (i < len) {
      var ch = str.charAt(i);

      // 1. Backslash escape
      if (ch === '\\' && i + 1 < len && ESCAPABLE_CHARS.indexOf(str.charAt(i + 1)) !== -1) {
        pushText(tokens, str.charAt(i + 1));
        i += 2;
        continue;
      }

      // 2. Inline code span (`...` or ``...``)
      if (ch === '`') {
        var tickLen = 0;
        while (i + tickLen < len && str.charAt(i + tickLen) === '`') tickLen++;
        if (tickLen <= 2) {
          var closeTick = findClosingBackticks(str, i + tickLen, tickLen);
          if (closeTick !== -1) {
            var rawCode = str.slice(i + tickLen, closeTick);
            if (rawCode.length >= 2 && rawCode.charAt(0) === ' ' && rawCode.charAt(rawCode.length - 1) === ' ' && rawCode.trim().length > 0) {
              rawCode = rawCode.slice(1, -1);
            }
            if (rawCode.length > 0) {
              tokens.push({ type: 'code', value: rawCode });
              i = closeTick + tickLen;
              continue;
            }
          }
        }
        pushText(tokens, str.slice(i, i + tickLen));
        i += tickLen;
        continue;
      }

      // 3. Markdown link [label](url)
      if (allowLinks && ch === '[') {
        var closeBracket = findClosingBracket(str, i);
        if (closeBracket !== -1 && str.charAt(closeBracket + 1) === '(') {
          var closeParen = findClosingParen(str, closeBracket + 1);
          if (closeParen !== -1) {
            var rawLabel = str.slice(i + 1, closeBracket);
            var rawDest = str.slice(closeBracket + 2, closeParen);
            var safeLink = sanitizeMarkdownHref(rawDest);
            var labelChildren = parseInlineTokens(rawLabel || rawDest, { allowLinks: false, _depth: depth + 1 });
            if (safeLink && rawLabel.trim().length > 0) {
              tokens.push({
                type: 'link',
                href: safeLink.href,
                external: safeLink.external,
                children: labelChildren
              });
            } else {
              // Unsafe or invalid URL: render label harmlessly as inline tokens without an anchor
              var fallbackChildren = parseInlineTokens(rawLabel, { allowLinks: false, _depth: depth + 1 });
              for (var fc = 0; fc < fallbackChildren.length; fc++) {
                tokens.push(fallbackChildren[fc]);
              }
            }
            i = closeParen + 1;
            continue;
          }
        }
      }

      // 4. Emphasis markers (*, **, ***, _, __, ___)
      if (ch === '*' || ch === '_') {
        var runLen = 0;
        while (i + runLen < len && str.charAt(i + runLen) === ch) runLen++;
        if (runLen >= 1 && runLen <= 3 && i + runLen < len) {
          var nextCh = str.charAt(i + runLen);
          var prevCh = i > 0 ? str.charAt(i - 1) : '';
          var nextOk = !/\s/.test(nextCh) && nextCh !== ch;
          var prevWordOk = ch !== '_' || !/[A-Za-z0-9_]/.test(prevCh);
          if (nextOk && prevWordOk) {
            var closeIdx = findClosingEmphasis(str, i + runLen, ch, runLen);
            if (closeIdx !== -1) {
              var innerText = str.slice(i + runLen, closeIdx);
              var nodeType = runLen === 3 ? 'boldItalic' : (runLen === 2 ? 'bold' : 'italic');
              tokens.push({
                type: nodeType,
                children: parseInlineTokens(innerText, { allowLinks: allowLinks, _depth: depth + 1 })
              });
              i = closeIdx + runLen;
              continue;
            }
          }
        }
        pushText(tokens, str.slice(i, i + runLen));
        i += runLen;
        continue;
      }

      // 5. Regular character
      pushText(tokens, ch);
      i += 1;
    }

    return tokens;
  }

  function parseTableCells(line) {
    var trimmed = String(line || '').trim();
    if (trimmed.indexOf('|') === -1) return [];
    var cells = [];
    var current = '';
    for (var i = 0; i < trimmed.length; i++) {
      var ch = trimmed.charAt(i);
      if (ch === '\\' && i + 1 < trimmed.length && trimmed.charAt(i + 1) === '|') {
        current += '|';
        i += 1;
        continue;
      }
      if (ch === '|') {
        cells.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());

    if (trimmed.charAt(0) === '|' && cells.length > 0 && cells[0] === '') {
      cells.shift();
    }
    if (trimmed.charAt(trimmed.length - 1) === '|' && cells.length > 0 && cells[cells.length - 1] === '') {
      cells.pop();
    }
    return cells;
  }

  function parseTableSeparatorRow(line, expectedCount) {
    var trimmed = String(line || '').trim();
    if (trimmed.indexOf('|') === -1) return null;
    var cells = parseTableCells(trimmed);
    if (cells.length === 0) return null;
    if (trimmed.charAt(0) !== '|' && trimmed.charAt(trimmed.length - 1) !== '|' && cells.length < 2) {
      return null;
    }
    if (expectedCount > 0 && cells.length !== expectedCount) {
      return null;
    }
    var alignments = [];
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (!/^:?-{2,}:?$/.test(cell)) {
        return null;
      }
      var leftColon = cell.charAt(0) === ':';
      var rightColon = cell.charAt(cell.length - 1) === ':';
      if (leftColon && rightColon) alignments.push('center');
      else if (rightColon) alignments.push('right');
      else alignments.push('left');
    }
    return alignments;
  }

  function isBlankLine(line) {
    return /^\s*$/.test(line);
  }

  function matchUlLine(line) {
    return line.match(/^\s*[-*+]\s+(.*)$/);
  }

  function matchOlLine(line) {
    return line.match(/^\s*(\d+)[.)]\s+(.*)$/);
  }

  function matchQuoteLine(line) {
    return line.match(/^\s*>\s?(.*)$/);
  }

  function isTableStartAt(lines, idx) {
    if (idx + 1 >= lines.length) return false;
    var headLine = lines[idx];
    if (headLine.indexOf('|') === -1) return false;
    var headers = parseTableCells(headLine);
    if (headers.length === 0) return false;
    return parseTableSeparatorRow(lines[idx + 1], headers.length) !== null;
  }

  function parseMarkdownBlocks(input, depth) {
    var currentDepth = depth || 0;
    var raw = String(input == null ? '' : input).replace(/\r\n?/g, '\n');
    if (!raw.trim()) return [];

    var lines = raw.split('\n');
    var blocks = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (isBlankLine(line)) {
        i += 1;
        continue;
      }

      // 1. Markdown Pipe Table
      if (isTableStartAt(lines, i)) {
        var headers = parseTableCells(lines[i]);
        var alignments = parseTableSeparatorRow(lines[i + 1], headers.length) || headers.map(function () { return 'left'; });
        i += 2;
        var rows = [];
        while (i < lines.length && !isBlankLine(lines[i]) && lines[i].indexOf('|') !== -1) {
          var rowCells = parseTableCells(lines[i]);
          if (rowCells.length > 0) {
            var normalizedRow = [];
            for (var c = 0; c < headers.length; c++) {
              normalizedRow.push(c < rowCells.length ? rowCells[c] : '');
            }
            rows.push(normalizedRow);
          }
          i += 1;
        }
        blocks.push({
          type: 'table',
          headers: headers,
          alignments: alignments,
          rows: rows
        });
        continue;
      }

      // 2. Blockquote (> ...)
      if (matchQuoteLine(line)) {
        var quoteLines = [];
        while (i < lines.length) {
          var qm = matchQuoteLine(lines[i]);
          if (!qm) break;
          quoteLines.push(qm[1]);
          i += 1;
        }
        var innerBlocks = currentDepth < 2
          ? parseMarkdownBlocks(quoteLines.join('\n'), currentDepth + 1)
          : [{ type: 'paragraph', text: quoteLines.join(' ').trim() }];
        blocks.push({
          type: 'blockquote',
          blocks: innerBlocks
        });
        continue;
      }

      // 3. Unordered List (- , * , + )
      var ulMatch = matchUlLine(line);
      if (ulMatch) {
        var ulItems = [];
        while (i < lines.length) {
          var curUl = matchUlLine(lines[i]);
          if (curUl) {
            ulItems.push(curUl[1].trim());
            i += 1;
            continue;
          }
          // Soft continuation line indented under previous item
          if (/^\s{2,}\S/.test(lines[i]) && !matchOlLine(lines[i]) && !matchQuoteLine(lines[i]) && !isTableStartAt(lines, i) && ulItems.length > 0) {
            ulItems[ulItems.length - 1] += ' ' + lines[i].trim();
            i += 1;
            continue;
          }
          break;
        }
        blocks.push({
          type: 'ul',
          items: ulItems
        });
        continue;
      }

      // 4. Ordered List (1. , 2. )
      var olMatch = matchOlLine(line);
      if (olMatch) {
        var startNum = parseInt(olMatch[1], 10);
        if (!Number.isFinite(startNum) || startNum < 0) startNum = 1;
        var olItems = [];
        while (i < lines.length) {
          var curOl = matchOlLine(lines[i]);
          if (curOl) {
            olItems.push(curOl[2].trim());
            i += 1;
            continue;
          }
          if (/^\s{2,}\S/.test(lines[i]) && !matchUlLine(lines[i]) && !matchQuoteLine(lines[i]) && !isTableStartAt(lines, i) && olItems.length > 0) {
            olItems[olItems.length - 1] += ' ' + lines[i].trim();
            i += 1;
            continue;
          }
          break;
        }
        blocks.push({
          type: 'ol',
          start: startNum,
          items: olItems
        });
        continue;
      }

      // 5. Paragraph
      var paraLines = [];
      while (
        i < lines.length &&
        !isBlankLine(lines[i]) &&
        !matchQuoteLine(lines[i]) &&
        !matchUlLine(lines[i]) &&
        !matchOlLine(lines[i]) &&
        !isTableStartAt(lines, i)
      ) {
        paraLines.push(lines[i].trim());
        i += 1;
      }
      if (paraLines.length > 0) {
        blocks.push({
          type: 'paragraph',
          text: paraLines.join(' ')
        });
      }
    }

    return blocks;
  }

  function renderTokensToHtml(tokens) {
    var out = '';
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (tok.type === 'text') {
        out += escapeHtmlText(tok.value);
      } else if (tok.type === 'code') {
        out += '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[0.875em] text-slate-900 dark:text-slate-100">' + escapeHtmlText(tok.value) + '</code>';
      } else if (tok.type === 'bold') {
        out += '<strong class="font-semibold text-slate-900 dark:text-white">' + renderTokensToHtml(tok.children) + '</strong>';
      } else if (tok.type === 'italic') {
        out += '<em class="italic">' + renderTokensToHtml(tok.children) + '</em>';
      } else if (tok.type === 'boldItalic') {
        out += '<strong class="font-semibold text-slate-900 dark:text-white"><em class="italic">' + renderTokensToHtml(tok.children) + '</em></strong>';
      } else if (tok.type === 'link') {
        var relAttr = tok.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        out += '<a href="' + escapeHtmlAttr(tok.href) + '"' + relAttr + ' class="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 break-words">' + renderTokensToHtml(tok.children) + '</a>';
      }
    }
    return out;
  }

  function renderInlineMarkdownHtml(input, options) {
    return renderTokensToHtml(parseInlineTokens(input, options));
  }

  function renderBlocksToHtml(blocks, options) {
    var opts = options || {};
    var pClass = opts.pClass || '';
    var parts = [];

    for (var i = 0; i < blocks.length; i++) {
      var blk = blocks[i];
      if (blk.type === 'paragraph') {
        var clsAttr = pClass ? ' class="' + escapeHtmlAttr(pClass) + '"' : '';
        parts.push('<p' + clsAttr + '>' + renderInlineMarkdownHtml(blk.text) + '</p>');
      } else if (blk.type === 'ul') {
        var ulLis = blk.items.map(function (it) {
          return '<li>' + renderInlineMarkdownHtml(it) + '</li>';
        }).join('');
        parts.push('<ul class="list-disc pl-5 space-y-1.5">' + ulLis + '</ul>');
      } else if (blk.type === 'ol') {
        var startAttr = blk.start !== 1 ? ' start="' + String(blk.start) + '"' : '';
        var olLis = blk.items.map(function (it) {
          return '<li>' + renderInlineMarkdownHtml(it) + '</li>';
        }).join('');
        parts.push('<ol' + startAttr + ' class="list-decimal pl-5 space-y-1.5">' + olLis + '</ol>');
      } else if (blk.type === 'blockquote') {
        var inner = renderBlocksToHtml(blk.blocks, opts);
        parts.push('<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-1 my-2 text-slate-600 dark:text-slate-300 italic bg-slate-50/70 dark:bg-slate-800/40 rounded-r-lg space-y-2">' + inner + '</blockquote>');
      } else if (blk.type === 'table') {
        var thHtml = blk.headers.map(function (h, idx) {
          var align = (blk.alignments && blk.alignments[idx]) || 'left';
          var alignCls = align === 'center' ? 'text-center' : (align === 'right' ? 'text-right' : 'text-left');
          return '<th scope="col" class="px-3.5 py-2.5 ' + alignCls + ' text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">' + renderInlineMarkdownHtml(h) + '</th>';
        }).join('');
        var trHtml = blk.rows.map(function (row) {
          var tds = row.map(function (cell, idx) {
            var align = (blk.alignments && blk.alignments[idx]) || 'left';
            var alignCls = align === 'center' ? 'text-center' : (align === 'right' ? 'text-right' : 'text-left');
            return '<td class="px-3.5 py-2.5 ' + alignCls + ' text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">' + renderInlineMarkdownHtml(cell) + '</td>';
          }).join('');
          return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">' + tds + '</tr>';
        }).join('');
        parts.push('<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table class="min-w-full border-collapse"><thead><tr>' + thHtml + '</tr></thead><tbody>' + trHtml + '</tbody></table></div>');
      }
    }

    return parts.join('\n');
  }

  function renderMarkdownBlocksHtml(input, options) {
    var blocks = parseMarkdownBlocks(input);
    return renderBlocksToHtml(blocks, options);
  }

  function tokensToPlainText(tokens) {
    var out = '';
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (tok.type === 'text' || tok.type === 'code') {
        out += tok.value;
      } else if (tok.children) {
        out += tokensToPlainText(tok.children);
      }
    }
    return out;
  }

  function blocksToPlainText(blocks) {
    var parts = [];
    for (var i = 0; i < blocks.length; i++) {
      var blk = blocks[i];
      if (blk.type === 'paragraph') {
        parts.push(tokensToPlainText(parseInlineTokens(blk.text)));
      } else if (blk.type === 'ul' || blk.type === 'ol') {
        for (var j = 0; j < blk.items.length; j++) {
          parts.push(tokensToPlainText(parseInlineTokens(blk.items[j])));
        }
      } else if (blk.type === 'blockquote') {
        parts.push(blocksToPlainText(blk.blocks));
      } else if (blk.type === 'table') {
        parts.push(blk.headers.map(function (h) {
          return tokensToPlainText(parseInlineTokens(h));
        }).join(' '));
        for (var r = 0; r < blk.rows.length; r++) {
          parts.push(blk.rows[r].map(function (cell) {
            return tokensToPlainText(parseInlineTokens(cell));
          }).join(' '));
        }
      }
    }
    return parts.filter(Boolean).join(' ');
  }

  function stripMarkdownToPlainText(input) {
    var raw = String(input == null ? '' : input);
    if (!raw.trim()) return '';
    var blocks = parseMarkdownBlocks(raw);
    return blocksToPlainText(blocks).replace(/\s+/g, ' ').trim();
  }

  function countReadableWords(input) {
    var plain = stripMarkdownToPlainText(input);
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
  }

  var api = {
    escapeHtmlText: escapeHtmlText,
    escapeHtmlAttr: escapeHtmlAttr,
    sanitizeMarkdownHref: sanitizeMarkdownHref,
    parseInlineTokens: parseInlineTokens,
    parseMarkdownBlocks: parseMarkdownBlocks,
    renderInlineMarkdownHtml: renderInlineMarkdownHtml,
    renderMarkdownBlocksHtml: renderMarkdownBlocksHtml,
    stripMarkdownToPlainText: stripMarkdownToPlainText,
    countReadableWords: countReadableWords
  };

  if (root) {
    root.__ARTICLE_MARKDOWN__ = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.__ARTICLE_MARKDOWN__ = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
