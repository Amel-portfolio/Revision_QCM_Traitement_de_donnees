(function () {
  'use strict';

  /* =========================================================
   * Utilitaires
   * ======================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const LETTERS = 'ABCDEFGHIJKL';
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function slug(s) {
    return 'h-' + String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  let toastTimer = null;
  function toast(msg) {
    let t = $('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* on tente la méthode de secours */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /* =========================================================
   * Stockage local (progression)
   * ======================================================= */
  const STORE_KEY = 'tad-revision-v1';
  const store = { flash: {}, q: {}, exams: {}, examDate: '', theme: 'auto' };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) Object.assign(store, JSON.parse(raw));
  } catch (e) { /* stockage indisponible : la progression ne sera pas conservée */ }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignoré */ }
  }

  function recordAnswer(q, exact) {
    const r = store.q[q.id] || { ok: 0, ko: 0 };
    if (exact) r.ok++; else r.ko++;
    r.last = exact;
    r.t = Date.now();
    store.q[q.id] = r;
    save();
  }

  /* =========================================================
   * Markdown minimal + coloration Python
   * ======================================================= */
  function inline(text) {
    // Les portions `code` sont mises de côté pour que le gras puisse les entourer (**`x`**).
    const codes = [];
    const s = String(text == null ? '' : text).replace(/`([^`\n]+)`/g, (m, c) => {
      codes.push('<code>' + esc(c) + '</code>');
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    return esc(s)
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(«])\*([^*\s][^*]*?)\*(?=[\s).,;:!?»]|$)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(((?:#|https?:)[^)\s]+)\)/g, (m, t, u) =>
        '<a href="' + u + '"' + (u[0] === '#' ? '' : ' target="_blank" rel="noopener"') + '>' + t + '</a>')
      .replace(/\u0000(\d+)\u0000/g, (m, i) => codes[+i]);
  }

  const PY_KW = new Set('False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const PY_BI = new Set('print len range list dict set tuple str int float bool type sorted sum min max abs round enumerate zip map filter open input format isinstance self'.split(' '));
  const PY_RE = /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?\b)|([\p{L}_][\p{L}\p{N}_]*)/gu;

  function hlPy(code) {
    let out = '';
    let last = 0;
    let m;
    PY_RE.lastIndex = 0;
    while ((m = PY_RE.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += '<span class="hl-com">' + esc(t) + '</span>';
      else if (m[2]) out += '<span class="hl-str">' + esc(t) + '</span>';
      else if (m[3]) out += '<span class="hl-num">' + esc(t) + '</span>';
      else if (PY_KW.has(t)) out += '<span class="hl-kw">' + t + '</span>';
      else if (PY_BI.has(t)) out += '<span class="hl-bi">' + t + '</span>';
      else if (/^\s*\(/.test(code.slice(PY_RE.lastIndex, PY_RE.lastIndex + 8))) out += '<span class="hl-fn">' + esc(t) + '</span>';
      else out += esc(t);
      last = PY_RE.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function codeBlock(code, lang) {
    lang = (lang || 'python').toLowerCase();
    const isPseudo = lang === 'pseudo';
    const isPy = lang === 'python' || lang === 'py' || isPseudo;
    const isOut = lang === 'out' || lang === 'sortie' || lang === 'text';
    const label = isPseudo ? 'Python · syntaxe / extrait' : isPy ? 'Python' : isOut ? 'Sortie' : lang;
    const body = isPy ? hlPy(code) : esc(code);
    return '<div class="code' + (isOut ? ' code-out' : '') + '"><div class="code-head"><span>' + esc(label) +
      '</span><span class="spacer"></span>' +
      (isPy && !isPseudo ? '<button type="button" class="code-btn" data-code="try" title="Exécuter dans le bac à sable">▶ Tester</button>' : '') +
      '<button type="button" class="code-btn" data-code="copy">Copier</button></div><pre><code>' + body + '</code></pre></div>';
  }

  const CALLOUTS = { info: 'À savoir', tip: 'Astuce', warn: 'Attention', trap: 'Piège classique', exam: "Tombé à l'examen" };

  function callout(lines) {
    let type = 'info';
    let title = '';
    const m = lines[0].match(/^\[!(\w+)\]\s*(.*)$/);
    if (m) {
      type = m[1].toLowerCase();
      title = m[2] || CALLOUTS[type] || '';
      lines = lines.slice(1);
    }
    return '<div class="callout ' + esc(type) + '">' + (title ? '<div class="callout-title">' + inline(title) + '</div>' : '') +
      '<div class="callout-body">' + md(lines.join('\n')) + '</div></div>';
  }

  function splitRow(row) {
    let s = row.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
    return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
  }

  function table(rows) {
    const head = splitRow(rows[0]);
    let body = rows.slice(1);
    if (body.length && /^\|?\s*:?-{2,}/.test(body[0])) body = body.slice(1);
    return '<div class="table-wrap"><table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') +
      '</tr></thead><tbody>' + body.map((r) => '<tr>' + splitRow(r).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
  }

  const LIST_RE = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

  function list(lines, start) {
    const items = [];
    let i = start;
    while (i < lines.length) {
      const l = lines[i];
      const m = l.match(LIST_RE);
      if (m) { items.push({ ind: m[1].length, ord: /\d/.test(m[2]), text: m[3] }); i++; continue; }
      if (!l.trim()) {
        if (i + 1 < lines.length && LIST_RE.test(lines[i + 1])) { i++; continue; }
        break;
      }
      if (/^\s+\S/.test(l) && items.length) { items[items.length - 1].text += ' ' + l.trim(); i++; continue; }
      break;
    }
    let p = 0;
    function build(ind) {
      const ord = items[p].ord;
      let html = ord ? '<ol>' : '<ul>';
      while (p < items.length && items[p].ind >= ind) {
        if (items[p].ind > ind) {
          html = html.replace(/<\/li>$/, '') + build(items[p].ind) + '</li>';
          continue;
        }
        html += '<li>' + inline(items[p].text) + '</li>';
        p++;
      }
      return html + (ord ? '</ol>' : '</ul>');
    }
    let html = '';
    while (p < items.length) html += build(items[p].ind);
    return { html, next: i };
  }

  const BLOCK_START = /^(```|:::|#{1,4}\s|\||>|---\s*$|\s*(?:[-*]|\d+\.)\s+)/;

  function md(src) {
    const lines = String(src || '').replace(/\r/g, '').split('\n');
    let out = '';
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      let m;
      if ((m = line.match(/^```\s*([\w-]*)\s*$/))) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out += codeBlock(buf.join('\n'), m[1] || 'python');
        continue;
      }
      if ((m = line.match(/^:::(\w+)\s*(.*)$/))) {
        const buf = [];
        let depth = 1;
        i++;
        while (i < lines.length) {
          if (/^:::\w/.test(lines[i])) depth++;
          else if (/^:::\s*$/.test(lines[i])) { depth--; if (!depth) break; }
          buf.push(lines[i++]);
        }
        i++;
        out += m[1] === 'solution'
          ? '<details class="solution"><summary>' + inline(m[2] || 'Voir la correction') + '</summary><div class="sol-body md">' + md(buf.join('\n')) + '</div></details>'
          : '<div class="' + esc(m[1]) + '">' + md(buf.join('\n')) + '</div>';
        continue;
      }
      if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
        const lvl = Math.min(m[1].length + 1, 5);
        out += '<h' + lvl + ' id="' + slug(m[2]) + '">' + inline(m[2]) + '</h' + lvl + '>';
        i++;
        continue;
      }
      if (/^---\s*$/.test(line)) { out += '<hr>'; i++; continue; }
      if (/^\|/.test(line)) {
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
        out += table(rows);
        continue;
      }
      if (/^>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        out += callout(buf);
        continue;
      }
      if (LIST_RE.test(line)) {
        const r = list(lines, i);
        out += r.html;
        i = r.next;
        continue;
      }
      const buf = [lines[i++].trim()];
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) buf.push(lines[i++].trim());
      out += '<p>' + inline(buf.join(' ')) + '</p>';
    }
    return out;
  }

  /* =========================================================
   * Lecture du contenu (blocs <script type="text/plain">)
   * ======================================================= */
  const raw = (id) => { const el = document.getElementById(id); return el ? el.textContent.replace(/\r/g, '') : ''; };

  function parseMeta(s) {
    const o = {};
    String(s).split('|').forEach((part) => {
      const k = part.indexOf('=');
      if (k > 0) o[part.slice(0, k).trim()] = part.slice(k + 1).trim();
    });
    return o;
  }

  function parseSections(text) {
    const out = [];
    let cur = null;
    text.split('\n').forEach((line) => {
      const m = line.match(/^===\s+(.*)$/);
      if (m) { cur = Object.assign(parseMeta(m[1]), { body: [] }); out.push(cur); } else if (cur) cur.body.push(line);
    });
    out.forEach((s) => { s.body = s.body.join('\n').trim(); });
    return out;
  }

  function finalizeQuestion(q) {
    const stem = [];
    const opts = [];
    const exp = [];
    let phase = 0;
    let fence = false;
    q.raw.forEach((line) => {
      if (phase === 0 && /^```/.test(line)) fence = !fence;
      if (!fence && phase < 2) {
        const m = line.match(/^\[( |x|X)\]\s+(.*)$/);
        if (m) { phase = 1; opts.push({ text: m[2].trim(), ok: m[1].toLowerCase() === 'x' }); return; }
        if (/^>>>/.test(line)) { phase = 2; const rest = line.replace(/^>>>\s?/, ''); if (rest) exp.push(rest); return; }
      }
      if (phase === 0) stem.push(line);
      else if (phase === 2) exp.push(line.replace(/^>>>\s?/, ''));
      else if (line.trim() && opts.length) opts[opts.length - 1].text += ' ' + line.trim();
    });
    q.stem = stem.join('\n').trim();
    q.opts = opts;
    q.exp = exp.join('\n').trim();
    q.multi = q.type === 'multi';
    q.correct = opts.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0);
    delete q.raw;
    if (!q.multi && q.correct.length !== 1) console.warn('Question à réponse unique mal formée :', q.id);
    return q;
  }

  function parseQuestions(text, extra) {
    const qs = [];
    let cur = null;
    let section = '';
    let fence = false;
    text.split('\n').forEach((line) => {
      if (/^```/.test(line)) fence = !fence;
      let m;
      if (!fence && (m = line.match(/^@@\s+(.*)$/))) {
        cur = Object.assign(parseMeta(m[1]), extra || {}, { section, raw: [] });
        qs.push(cur);
        return;
      }
      if (!fence && (m = line.match(/^##\s+(.*)$/))) { section = m[1].trim(); cur = null; return; }
      if (cur) cur.raw.push(line);
    });
    return qs.map(finalizeQuestion);
  }

  function parseExams(text, kind) {
    const exams = [];
    let cur = null;
    text.split('\n').forEach((line) => {
      const m = line.match(/^####\s+QCM\s+(.*)$/);
      if (m) { cur = Object.assign(parseMeta(m[1]), { lines: [] }); exams.push(cur); } else if (cur) cur.lines.push(line);
    });
    return exams.map((e) => {
      const lines = e.lines;
      let k = 0;
      while (k < lines.length && !/^(##\s|@@\s)/.test(lines[k])) k++;
      e.intro = lines.slice(0, k).join('\n').trim();
      e.qs = parseQuestions(lines.slice(k).join('\n'), { exam: e.id, kind });
      e.duree = parseInt(e.duree || '20', 10);
      delete e.lines;
      return e;
    });
  }

  function parseFlash(text) {
    const decks = [];
    let deck = null;
    let card = null;
    let side = 'f';
    let fence = false;
    text.split('\n').forEach((line) => {
      if (/^```/.test(line)) fence = !fence;
      let m;
      if (!fence && (m = line.match(/^##\s+(.*)$/))) {
        const parts = m[1].split('|');
        deck = Object.assign({ title: parts[0].trim(), cards: [] }, parseMeta(parts.slice(1).join('|')));
        decks.push(deck);
        card = null;
        return;
      }
      if (!deck) return;
      if (!fence && (m = line.match(/^Q:\s?(.*)$/))) { card = { f: [m[1]], b: [], deck: deck.id }; deck.cards.push(card); side = 'f'; return; }
      if (!fence && card && (m = line.match(/^R:\s?(.*)$/))) { side = 'b'; card.b.push(m[1]); return; }
      if (card) card[side].push(line);
    });
    decks.forEach((d) => d.cards.forEach((c) => {
      c.f = c.f.join('\n').trim();
      c.b = c.b.join('\n').trim();
      c.id = d.id + '-' + hash(c.f);
      c.deckTitle = d.title;
    }));
    return decks;
  }

  function parseCSV(text) {
    const rows = [];
    text.trim().split('\n').forEach((line) => {
      const cells = [];
      let cur = '';
      let q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (q) {
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch;
        } else if (ch === '"') q = true;
        else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
      }
      cells.push(cur);
      rows.push(cells);
    });
    return rows;
  }

  function parseDatasets(text) {
    const map = {};
    parseSections(text).forEach((s) => {
      const m = s.body.match(/```csv\n([\s\S]*?)\n```/);
      s.csv = m ? m[1] : '';
      s.desc = s.body.replace(/```csv\n[\s\S]*?\n```/, '').trim();
      const rows = parseCSV(s.csv);
      s.header = rows[0] || [];
      s.rows = rows.slice(1);
      map[s.id] = s;
    });
    return map;
  }

  const THEMES = [
    { id: 'stats', label: 'Statistiques descriptives', chap: 1 },
    { id: 'visu', label: 'Visualisation des données', chap: 1 },
    { id: 'bases', label: 'Variables, chaînes & print', chap: 1 },
    { id: 'listes', label: 'Listes', chap: 1 },
    { id: 'controle', label: 'Conditions & boucles', chap: 1 },
    { id: 'comprehension', label: 'List comprehensions', chap: 1 },
    { id: 'fonctions', label: 'Fonctions', chap: 1 },
    { id: 'structures', label: 'Tuples, dictionnaires, listes de listes', chap: 1 },
    { id: 'numpy', label: 'NumPy & NaN', chap: 1 },
    { id: 'csv', label: 'Fichiers CSV', chap: 1 },
    { id: 'regex', label: 'Expressions régulières', chap: 1 },
    { id: 'erreurs', label: 'Classes & gestion des erreurs', chap: 1 },
    { id: 'pd-base', label: 'DataFrame : création & infos', chap: 2 },
    { id: 'pd-acces', label: 'Accès : loc / iloc / colonnes', chap: 2 },
    { id: 'pd-filtre', label: 'Filtrer & sélectionner', chap: 2 },
    { id: 'pd-manip', label: 'Supprimer, index, tri, types', chap: 2 },
    { id: 'pd-ops', label: 'map / apply / opérations', chap: 2 },
    { id: 'pd-nan', label: 'NaN & nettoyage', chap: 2 },
    { id: 'pd-agg', label: 'Agrégations & groupby', chap: 2 },
    { id: 'pd-concat', label: 'concat / merge / join', chap: 2 },
  ];
  const THEME = Object.fromEntries(THEMES.map((t) => [t.id, t]));
  const themeLabel = (id) => (THEME[id] ? THEME[id].label : id || 'Divers');

  const COURS = parseSections(raw('c-cours1') + '\n' + raw('c-cours2'));
  const NOTIONS = raw('c-notions');
  const TD = parseSections(raw('c-td'));
  const DATASETS = parseDatasets(raw('c-datasets'));
  const BANK = parseQuestions(raw('c-quiz'), { kind: 'quiz' });
  const EXAMS = parseExams(raw('c-qcm'), 'qcm');
  const ANNALES = parseExams(raw('c-annales'), 'annales');
  const DECKS = parseFlash(raw('c-flash'));
  const CARDS = DECKS.flatMap((d) => d.cards);

  const ALLQ = BANK.concat(...EXAMS.map((e) => e.qs), ...ANNALES.map((e) => e.qs));
  const QINDEX = Object.fromEntries(ALLQ.map((q) => [q.id, q]));
  const EXAM_INDEX = Object.fromEntries(EXAMS.concat(ANNALES).map((e) => [e.id, e]));

  function sourceLabel(q) {
    if (q.kind === 'quiz') return 'Quiz — ' + themeLabel(q.theme);
    const e = EXAM_INDEX[q.exam];
    return e ? e.title : 'QCM';
  }
  function datasetFor(q) {
    const e = EXAM_INDEX[q.exam];
    if (q.dataset) return DATASETS[q.dataset];
    if (e && e.dataset && /pandas/i.test(q.section || '')) return DATASETS[e.dataset];
    return null;
  }

  /* =========================================================
   * Navigation
   * ======================================================= */
  const main = $('#main');
  let keyHandler = null;
  let leaveGuard = null;
  let cleanup = null;
  let currentHash = location.hash;
  let skipNext = false;

  function go(hash) { location.hash = hash; }

  const routes = {
    '': viewHome,
    cours: viewCours,
    notions: viewNotions,
    td: viewTD,
    flashcards: viewFlash,
    quiz: viewQuiz,
    erreurs: viewErrors,
    qcm: viewQcm,
    annales: viewAnnales,
    sandbox: viewSandbox,
  };

  function router() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').map((p) => decodeURIComponent(p));
    const name = routes[parts[0]] ? parts[0] : '';
    if (cleanup) { cleanup(); cleanup = null; }
    keyHandler = null;
    leaveGuard = null;
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === (name || 'home')));
    closeMenu();
    routes[name](parts.slice(1));
    window.scrollTo(0, 0);
    updateErrCount();
  }

  window.addEventListener('hashchange', () => {
    if (skipNext) { skipNext = false; return; }
    if (leaveGuard && !leaveGuard()) {
      skipNext = true;
      location.hash = currentHash;
      return;
    }
    currentHash = location.hash;
    router();
  });

  window.addEventListener('beforeunload', (e) => {
    if (leaveGuard) { e.preventDefault(); e.returnValue = ''; }
  });

  document.addEventListener('keydown', (e) => {
    if (!$('#ask-modal').hidden) {
      if (e.key === 'Escape') closeAsk();
      return;
    }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'select' || (tag === 'input' && !/checkbox|radio/.test(e.target.type))) return;
    if (keyHandler) keyHandler(e);
  });

  function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); }
  $('#menu-btn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); });
  $('#scrim').addEventListener('click', closeMenu);

  function applyTheme() {
    const t = store.theme || 'auto';
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    $('#theme-toggle').textContent = 'Thème : ' + ({ auto: 'auto', light: 'clair', dark: 'sombre' }[t]);
  }
  $('#theme-toggle').addEventListener('click', () => {
    store.theme = { auto: 'light', light: 'dark', dark: 'auto' }[store.theme || 'auto'];
    save();
    applyTheme();
  });
  applyTheme();

  function errorQuestions() { return ALLQ.filter((q) => store.q[q.id] && store.q[q.id].last === false); }
  function updateErrCount() {
    const n = errorQuestions().length;
    const el = $('#err-count');
    el.textContent = n;
    el.classList.toggle('hide', !n);
  }

  /* =========================================================
   * Boutons des blocs de code (copier / tester)
   * ======================================================= */
  let pendingCode = null;
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-code]');
    if (btn) {
      const code = btn.closest('.code').querySelector('pre code').textContent;
      if (btn.dataset.code === 'copy') {
        toast((await copyText(code)) ? 'Code copié ✓' : 'Copie impossible');
      } else {
        pendingCode = code;
        if (location.hash === '#/sandbox') router(); else go('#/sandbox');
      }
      return;
    }
    const sc = e.target.closest('[data-scroll]');
    if (sc) {
      e.preventDefault();
      const target = document.getElementById(sc.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* =========================================================
   * Tableau de bord
   * ======================================================= */
  function themeStats() {
    return THEMES.map((t) => {
      const qs = ALLQ.filter((q) => q.theme === t.id);
      const done = qs.filter((q) => store.q[q.id]);
      const ok = done.filter((q) => store.q[q.id].last).length;
      return { t, total: qs.length, done: done.length, ok };
    }).filter((s) => s.total);
  }

  function viewHome() {
    const done = ALLQ.filter((q) => store.q[q.id]);
    const ok = done.filter((q) => store.q[q.id].last).length;
    const mastered = CARDS.filter((c) => ((store.flash[c.id] || {}).box || 0) >= 2).length;
    const errs = errorQuestions().length;
    let best = null;
    Object.values(store.exams).forEach((list) => list.forEach((r) => { const p = pct(r.s, r.n); if (best === null || p > best) best = p; }));
    let countdown = '';
    if (store.examDate) {
      const d = new Date(store.examDate + 'T00:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((d - today) / 86400000);
      countdown = days > 0 ? 'J-' + days : days === 0 ? "C'est aujourd'hui !" : 'Examen passé';
    }
    const stats = themeStats();
    const weak = stats.filter((s) => s.done).sort((a, b) => a.ok / a.done - b.ok / b.done).slice(0, 3);

    main.innerHTML = `
      <div class="page-head">
        <h1>Révision du QCM « Traitement et analyse de données »</h1>
        <p>Chapitre I : Python pour l'analyse de données · Chapitre II : pandas. Tout est enregistré dans ce navigateur.</p>
      </div>
      <div class="grid cols-4">
        <div class="card stat"><div class="stat-value">${mastered}<span class="muted small"> / ${CARDS.length}</span></div><div class="stat-label">flashcards maîtrisées</div></div>
        <div class="card stat"><div class="stat-value">${ok}<span class="muted small"> / ${ALLQ.length}</span></div><div class="stat-label">questions réussies${done.length ? ' (' + pct(ok, done.length) + ' % de réussite)' : ''}</div></div>
        <div class="card stat"><div class="stat-value">${best === null ? '—' : best + ' %'}</div><div class="stat-label">meilleur QCM blanc</div></div>
        <a class="card stat tile" href="#/erreurs"><div class="stat-value" style="color:var(--ko)">${errs}</div><div class="stat-label">erreurs à retravailler →</div></a>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="row between">
          <div><strong>Date de l'examen</strong> <span class="muted small">(l'an dernier : 18/11/2025)</span></div>
          <div class="row"><input type="date" id="exam-date" value="${esc(store.examDate)}" aria-label="Date de l'examen"><span class="badge accent" style="font-size:.9rem">${esc(countdown || 'non renseignée')}</span></div>
        </div>
      </div>

      <h2>Méthode conseillée</h2>
      <div class="grid cols-3">
        <a class="card tile" href="#/cours"><div class="tile-title">1 · Lire les résumés</div><div class="tile-sub">${COURS.length} fiches, avec les pièges signalés en rouge.</div></a>
        <a class="card tile" href="#/flashcards"><div class="tile-title">2 · Flashcards</div><div class="tile-sub">${CARDS.length} cartes pour mémoriser la syntaxe exacte.</div></a>
        <a class="card tile" href="#/quiz"><div class="tile-title">3 · Quiz par thème</div><div class="tile-sub">${BANK.length} questions corrigées et expliquées.</div></a>
        <a class="card tile" href="#/annales"><div class="tile-title">4 · Annale 2025</div><div class="tile-sub">Le vrai sujet du 18/11/2025, corrigé en détail.</div></a>
        <a class="card tile" href="#/qcm"><div class="tile-title">5 · QCM blancs chronométrés</div><div class="tile-sub">${EXAMS.length} sujets au format de l'examen + tirage aléatoire.</div></a>
        <a class="card tile" href="#/notions"><div class="tile-title">6 · La veille : notions clés</div><div class="tile-sub">Tableaux récapitulatifs et pièges à connaître.</div></a>
      </div>

      ${weak.length ? `<div class="callout warn"><div class="callout-title">Tes thèmes les plus fragiles</div><div class="callout-body"><div class="row">${weak.map((s) => `<a class="btn small" href="#/quiz/${s.t.id}">${esc(s.t.label)} · ${pct(s.ok, s.done)} %</a>`).join('')}</div></div></div>` : ''}

      <h2>Progression par thème</h2>
      <div class="card" style="padding:8px 14px">
        <table class="theme-table">
          <thead><tr><th>Thème</th><th>Réussies</th><th style="width:30%">Maîtrise</th><th></th></tr></thead>
          <tbody>
          ${stats.map((s) => `<tr>
            <td>${esc(s.t.label)} <span class="muted small">· ch. ${s.t.chap}</span></td>
            <td class="num">${s.ok} / ${s.total}</td>
            <td><div class="progress ok"><span style="width:${pct(s.ok, s.total)}%"></span></div></td>
            <td style="text-align:right"><a class="btn small ghost" href="#/quiz/${s.t.id}">S'entraîner →</a></td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="row end" style="margin-top:20px"><button class="btn small ghost" id="reset-progress" type="button">Réinitialiser toute ma progression</button></p>
    `;
    $('#exam-date').addEventListener('change', (e) => { store.examDate = e.target.value; save(); viewHome(); });
    $('#reset-progress').addEventListener('click', () => {
      if (confirm('Effacer toute la progression (flashcards, quiz, QCM blancs) ?')) {
        store.flash = {}; store.q = {}; store.exams = {};
        save();
        viewHome();
        updateErrCount();
      }
    });
  }

  /* =========================================================
   * Cours
   * ======================================================= */
  const CHAPTERS = {
    1: "Chapitre I — Introduction à l'analyse de données avec Python",
    2: 'Chapitre II — Traitement de données avec pandas',
  };

  function viewCours(args) {
    if (args[0]) return viewCoursSection(args[0]);
    main.innerHTML = `
      <div class="page-head"><h1>Résumés de cours</h1><p>Chaque fiche reprend le cours de C. Berland, avec exemples exécutables et pièges signalés.</p></div>
      ${[1, 2].map((ch) => `
        <h2>${esc(CHAPTERS[ch])}</h2>
        <div class="grid cols-2">
          ${COURS.filter((s) => s.chap === String(ch)).map((s) => {
            const n = s.themes ? BANK.filter((q) => s.themes.split(',').includes(q.theme)).length : 0;
            return `<a class="card tile" href="#/cours/${s.id}"><div class="tile-title">${esc(s.title)}</div><div class="tile-sub">${esc(s.desc || '')}</div>${n ? `<div style="margin-top:8px"><span class="badge accent">${n} questions de quiz</span></div>` : ''}</a>`;
          }).join('')}
        </div>`).join('')}
    `;
  }

  function viewCoursSection(id) {
    const idx = COURS.findIndex((s) => s.id === id);
    if (idx < 0) return viewCours([]);
    const s = COURS[idx];
    const prev = COURS[idx - 1];
    const next = COURS[idx + 1];
    const themes = s.themes ? s.themes.split(',') : [];
    const deck = s.deck ? DECKS.find((d) => d.id === s.deck) : null;
    main.innerHTML = `
      <div class="crumbs"><a href="#/cours">Résumés de cours</a> › ${esc(CHAPTERS[s.chap] || '')}</div>
      <h1>${esc(s.title)}</h1>
      <div class="section-actions">
        <button class="btn claude small" type="button" id="ask-course">✦ Demander à Claude sur cette notion</button>
        ${themes.map((t) => `<a class="btn small" href="#/quiz/${t}">Quiz : ${esc(themeLabel(t))}</a>`).join('')}
        ${deck ? `<a class="btn small" href="#/flashcards/${deck.id}">Flashcards : ${esc(deck.title)}</a>` : ''}
      </div>
      <article class="md">${md(s.body)}</article>
      <nav class="pager">
        ${prev ? `<a class="card tile" href="#/cours/${prev.id}"><div class="dir">← Précédent</div><div class="tile-title">${esc(prev.title)}</div></a>` : '<span></span>'}
        ${next ? `<a class="card tile" href="#/cours/${next.id}" style="text-align:right"><div class="dir">Suivant →</div><div class="tile-title">${esc(next.title)}</div></a>` : '<span></span>'}
      </nav>
    `;
    $('#ask-course').addEventListener('click', () => openAsk({ kind: 'course', source: 'Résumé de cours', title: s.title, body: s.body }));
  }

  function tocFrom(text) {
    const heads = [];
    text.split('\n').forEach((l) => { const m = l.match(/^#\s+(.*)$/); if (m) heads.push(m[1]); });
    return heads;
  }

  function viewNotions() {
    const heads = tocFrom(NOTIONS);
    main.innerHTML = `
      <div class="page-head"><h1>Notions clés &amp; pièges</h1><p>L'essentiel à relire la veille : tableaux comparatifs et erreurs classiques des QCM.</p></div>
      <div class="card toc" style="margin-bottom:20px"><strong>Sommaire</strong><div class="chips" style="margin-top:8px">${heads.map((h) => `<a class="chip" href="#" data-scroll="${slug(h)}">${inline(h)}</a>`).join('')}</div></div>
      <article class="md">${md(NOTIONS)}</article>
      <p class="row" style="margin-top:24px"><button class="btn claude" type="button" id="ask-notions">✦ Demander à Claude</button></p>
    `;
    $('#ask-notions').addEventListener('click', () => openAsk({ kind: 'course', source: 'Notions clés', title: 'Notions clés et pièges du QCM', body: '' }));
  }

  function viewTD() {
    main.innerHTML = `
      <div class="page-head"><h1>TD corrigés</h1><p>Essaie d'abord, puis ouvre la correction. Le bouton « ▶ Tester » envoie le code dans le bac à sable.</p></div>
      <div class="card toc" style="margin-bottom:20px"><strong>Sommaire</strong><div class="chips" style="margin-top:8px">${TD.map((s) => `<a class="chip" href="#" data-scroll="td-${s.id}">${esc(s.title)}</a>`).join('')}</div></div>
      ${TD.map((s) => `<section id="td-${s.id}"><h1 style="margin-top:1.2em">${esc(s.title)}</h1><div class="md">${md(s.body)}</div></section>`).join('<hr>')}
    `;
  }

  /* =========================================================
   * Composant question (quiz, QCM blancs, annale)
   * ======================================================= */
  function questionHTML(q, o) {
    const type = q.multi ? 'checkbox' : 'radio';
    return `
      <article class="qcard" id="q-${esc(q.id)}" data-qid="${esc(q.id)}">
        <header class="qhead">
          <span class="qnum">Question ${o.num}${o.total ? ' / ' + o.total : ''}</span>
          ${q.multi ? '<span class="badge club" title="Zéro, une ou plusieurs bonnes réponses">♣ plusieurs réponses possibles</span>' : '<span class="badge">une seule réponse</span>'}
          ${o.showTheme && q.theme ? `<span class="tag">${esc(themeLabel(q.theme))}</span>` : ''}
        </header>
        <div class="qstem md">${md(q.stem)}</div>
        <ol class="opts">
          ${q.opts.map((opt, i) => `<li><label class="opt ${q.multi ? 'check' : 'radio'}"><input type="${type}" name="${esc(o.name || q.id)}" value="${i}"><span class="opt-box">${LETTERS[i]}</span><span class="opt-text">${inline(opt.text)}</span><span class="opt-mark"></span></label></li>`).join('')}
        </ol>
        <div class="qfeedback" hidden></div>
        <div class="qactions">
          ${o.actions || ''}
          <span class="spacer"></span>
          <button type="button" class="btn small claude" data-ask="${esc(q.id)}">✦ Demander à Claude</button>
        </div>
      </article>`;
  }

  function readSelection(card) {
    return new Set($$('input', card).filter((i) => i.checked).map((i) => +i.value));
  }
  function setSelection(card, sel) {
    $$('input', card).forEach((i) => { i.checked = sel.has(+i.value); });
  }
  function isExact(q, sel) {
    return q.correct.length === sel.size && q.correct.every((i) => sel.has(i));
  }
  function partialScore(q, sel) {
    let good = 0;
    q.opts.forEach((o, i) => { if (o.ok === sel.has(i)) good++; });
    return good / q.opts.length;
  }
  const lettersOf = (arr) => arr.map((i) => LETTERS[i]).join(', ');

  function markCard(card, q, sel) {
    const exact = isExact(q, sel);
    card.classList.add('corrected');
    $$('.opt', card).forEach((lab, i) => {
      const ok = q.opts[i].ok;
      const s = sel.has(i);
      lab.classList.remove('is-correct', 'is-wrong');
      if (ok) lab.classList.add('is-correct');
      else if (s) lab.classList.add('is-wrong');
      lab.querySelector('.opt-mark').textContent = ok ? (s ? '✓ juste' : '✓ à cocher') : (s ? '✗ fausse' : '');
      lab.querySelector('input').disabled = true;
    });
    const fb = $('.qfeedback', card);
    fb.hidden = false;
    const corr = q.correct.length ? lettersOf(q.correct) : 'aucune proposition n\'est correcte';
    fb.innerHTML = `<div class="verdict ${exact ? 'ok' : 'ko'}">${exact ? '✓ Bonne réponse' : '✗ Réponse incorrecte'} — correction : ${esc(corr)}</div>` +
      (q.exp ? `<div class="exp md">${md(q.exp)}</div>` : '');
    return exact;
  }

  // Bouton « Demander à Claude » des questions (délégation)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ask]');
    if (!b) return;
    const q = QINDEX[b.dataset.ask];
    if (!q) return;
    const card = b.closest('.qcard');
    openAsk({
      kind: 'question', q,
      source: sourceLabel(q),
      selected: readSelection(card),
      corrected: card.classList.contains('corrected'),
      dataset: datasetFor(q),
    });
  });

  /* =========================================================
   * Flashcards
   * ======================================================= */
  let fc = null;

  function viewFlash(args) {
    if (args[0]) {
      const todo = args[1] === 'a-revoir';
      let cards;
      let title;
      if (args[0] === 'tout') { cards = CARDS; title = 'Toutes les cartes'; } else {
        const d = DECKS.find((x) => x.id === args[0]);
        if (!d) return go('#/flashcards');
        cards = d.cards;
        title = d.title;
      }
      if (todo) cards = cards.filter((c) => ((store.flash[c.id] || {}).box || 0) < 2);
      if (!cards.length) { toast('Toutes les cartes de ce paquet sont maîtrisées 🎉'); return go('#/flashcards'); }
      fc = { title, deck: args[0], cards: args[0] === 'tout' || todo ? shuffle(cards) : cards.slice(), i: 0, flipped: false, known: 0, review: 0, missed: [] };
      return renderFlash();
    }
    const mastered = (cards) => cards.filter((c) => ((store.flash[c.id] || {}).box || 0) >= 2).length;
    main.innerHTML = `
      <div class="page-head"><h1>Flashcards</h1><p>Clique sur la carte (ou <kbd>Espace</kbd>) pour la retourner, puis <kbd>←</kbd> « À revoir » / <kbd>→</kbd> « Je sais ». Une carte est maîtrisée après 2 « Je sais » d'affilée.</p></div>
      <div class="card row between" style="margin-bottom:16px">
        <div><strong>Toutes les cartes</strong> <span class="muted">· ${mastered(CARDS)} / ${CARDS.length} maîtrisées</span></div>
        <div class="row"><a class="btn small" href="#/flashcards/tout/a-revoir">Non maîtrisées</a><a class="btn small primary" href="#/flashcards/tout">Tout réviser (mélangé)</a></div>
      </div>
      <div class="grid cols-2">
        ${DECKS.map((d) => {
          const m = mastered(d.cards);
          return `<div class="card">
            <div class="tile-title">${esc(d.title)}</div>
            <div class="tile-sub">${d.cards.length} cartes · ${m} maîtrisées</div>
            <div class="progress ok" style="margin:10px 0 12px"><span style="width:${pct(m, d.cards.length)}%"></span></div>
            <div class="row"><a class="btn small primary" href="#/flashcards/${d.id}">Réviser</a>${m < d.cards.length ? `<a class="btn small" href="#/flashcards/${d.id}/a-revoir">Non maîtrisées (${d.cards.length - m})</a>` : ''}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderFlash() {
    if (fc.i >= fc.cards.length) return renderFlashEnd();
    const c = fc.cards[fc.i];
    const box = (store.flash[c.id] || {}).box || 0;
    main.innerHTML = `
      <div class="crumbs"><a href="#/flashcards">Flashcards</a> › ${esc(fc.title)}</div>
      <div class="quizbar"><span class="small muted">Carte ${fc.i + 1} / ${fc.cards.length}</span><div class="progress"><span style="width:${pct(fc.i, fc.cards.length)}%"></span></div>
        <span class="dots" title="Niveau de maîtrise">${[0, 1, 2].map((k) => `<i class="${box > k ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="fc-stage">
        <div class="fc-card${fc.flipped ? ' flipped' : ''}" id="fc-card" role="button" tabindex="0" aria-label="Retourner la carte">
          <div class="fc-face front"><div class="fc-label">${esc(c.deckTitle)} · Question</div><div class="fc-content md">${md(c.f)}</div><div class="fc-hint">Clique ou appuie sur Espace pour voir la réponse</div></div>
          <div class="fc-face back"><div class="fc-label">Réponse</div><div class="fc-content md">${md(c.b)}</div></div>
        </div>
      </div>
      <div class="fc-controls">
        <button class="btn ko" type="button" id="fc-no">✗ À revoir</button>
        <button class="btn ok" type="button" id="fc-yes">✓ Je sais</button>
      </div>
      <div class="row" style="justify-content:center;margin-top:14px">
        <button class="btn small ghost" type="button" id="fc-prev" ${fc.i ? '' : 'disabled'}>← Carte précédente</button>
        <button class="btn small claude" type="button" id="fc-ask">✦ Demander à Claude</button>
        <button class="btn small ghost" type="button" id="fc-shuffle">Mélanger</button>
      </div>
    `;
    const card = $('#fc-card');
    const fitHeight = () => {
      const h = Math.max(...$$('.fc-face', card).map((f) => f.scrollHeight));
      card.style.minHeight = Math.max(window.innerWidth < 600 ? 340 : 300, h) + 'px';
    };
    fitHeight();
    const flip = () => { fc.flipped = !fc.flipped; card.classList.toggle('flipped', fc.flipped); };
    card.addEventListener('click', (e) => { if (!e.target.closest('button, a')) flip(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') flip(); });
    const answer = (knew) => {
      const st = store.flash[c.id] || { box: 0, seen: 0 };
      st.seen++;
      st.box = knew ? Math.min(3, st.box + 1) : 0;
      store.flash[c.id] = st;
      save();
      if (knew) fc.known++; else { fc.review++; fc.missed.push(c); }
      fc.i++;
      fc.flipped = false;
      renderFlash();
    };
    $('#fc-yes').addEventListener('click', () => answer(true));
    $('#fc-no').addEventListener('click', () => answer(false));
    $('#fc-prev').addEventListener('click', () => { fc.i = Math.max(0, fc.i - 1); fc.flipped = false; renderFlash(); });
    $('#fc-shuffle').addEventListener('click', () => { fc.cards = fc.cards.slice(0, fc.i).concat(shuffle(fc.cards.slice(fc.i))); fc.flipped = false; renderFlash(); });
    $('#fc-ask').addEventListener('click', () => openAsk({ kind: 'flash', source: 'Flashcard — ' + c.deckTitle, front: c.f, back: c.b }));
    keyHandler = (e) => {
      if (e.key === ' ') { e.preventDefault(); flip(); } else if (e.key === 'ArrowRight') answer(true);
      else if (e.key === 'ArrowLeft') answer(false);
    };
  }

  function renderFlashEnd() {
    main.innerHTML = `
      <div class="crumbs"><a href="#/flashcards">Flashcards</a> › ${esc(fc.title)}</div>
      <div class="card" style="text-align:center;padding:32px 20px">
        <div class="score-big">${fc.known} / ${fc.cards.length}</div>
        <p class="muted">cartes sues · ${fc.review} à revoir</p>
        <div class="row" style="justify-content:center">
          ${fc.missed.length ? '<button class="btn primary" type="button" id="fc-again">Revoir les ' + fc.missed.length + ' cartes ratées</button>' : ''}
          <a class="btn" href="#/flashcards">Retour aux paquets</a>
          <a class="btn" href="#/quiz">Passer au quiz</a>
        </div>
      </div>`;
    const again = $('#fc-again');
    if (again) again.addEventListener('click', () => { fc = Object.assign(fc, { cards: shuffle(fc.missed), i: 0, known: 0, review: 0, missed: [], flipped: false }); renderFlash(); });
  }

  /* =========================================================
   * Quiz
   * ======================================================= */
  let quiz = null;

  function startQuiz(qs, title, back) {
    quiz = { qs, title, back: back || '#/quiz', i: 0, sel: qs.map(() => new Set()), done: qs.map(() => false), exact: qs.map(() => false) };
  }

  function viewQuiz(args) {
    if (args[0] === 'session') {
      if (!quiz) return go('#/quiz');
      return renderQuizStep();
    }
    if (args[0] && THEME[args[0]]) {
      const qs = BANK.filter((q) => q.theme === args[0]);
      startQuiz(shuffle(qs).slice(0, 15), 'Quiz — ' + themeLabel(args[0]));
      return renderQuizStep();
    }
    const counts = Object.fromEntries(THEMES.map((t) => [t.id, BANK.filter((q) => q.theme === t.id).length]));
    main.innerHTML = `
      <div class="page-head"><h1>Quiz par thème</h1><p>Correction immédiate après chaque question, avec explication. ${BANK.length} questions au total.</p></div>
      <div class="card">
        ${[1, 2].map((ch) => `
          <div class="row between" style="margin:${ch === 1 ? 0 : 18}px 0 8px"><strong>${esc(CHAPTERS[ch])}</strong>
            <button class="btn small ghost" type="button" data-all="${ch}">Tout cocher</button></div>
          <div class="chips">${THEMES.filter((t) => t.chap === ch && counts[t.id]).map((t) => `<label class="chip"><input type="checkbox" name="theme" value="${t.id}">${esc(t.label)} <span class="muted small">${counts[t.id]}</span></label>`).join('')}</div>
        `).join('')}
        <hr>
        <div class="row">
          <label>Nombre de questions <select id="qz-n"><option>10</option><option selected>20</option><option>30</option><option value="999">Toutes</option></select></label>
          <label class="check-line"><input type="checkbox" id="qz-new" checked> Priorité aux questions pas encore réussies</label>
          <span class="spacer"></span>
          <button class="btn primary" type="button" id="qz-start">Commencer</button>
        </div>
      </div>
      <h2>Raccourcis</h2>
      <div class="grid cols-3">
        <button class="card tile" type="button" id="qz-ch1" style="text-align:left;cursor:pointer;font:inherit;color:inherit"><div class="tile-title">Mix chapitre I</div><div class="tile-sub">20 questions Python de base</div></button>
        <button class="card tile" type="button" id="qz-ch2" style="text-align:left;cursor:pointer;font:inherit;color:inherit"><div class="tile-title">Mix chapitre II</div><div class="tile-sub">20 questions pandas</div></button>
        <a class="card tile" href="#/erreurs"><div class="tile-title">Mes erreurs</div><div class="tile-sub">${errorQuestions().length} question(s) à retravailler</div></a>
      </div>
    `;
    $$('[data-all]').forEach((b) => b.addEventListener('click', () => {
      const ch = +b.dataset.all;
      const boxes = $$('input[name=theme]').filter((i) => THEME[i.value].chap === ch);
      const all = boxes.every((i) => i.checked);
      boxes.forEach((i) => { i.checked = !all; });
    }));
    const launch = (themes) => {
      const n = +$('#qz-n').value;
      const prio = $('#qz-new').checked;
      let qs = shuffle(BANK.filter((q) => themes.includes(q.theme)));
      if (prio) qs.sort((a, b) => ((store.q[a.id] || {}).last ? 1 : 0) - ((store.q[b.id] || {}).last ? 1 : 0));
      qs = qs.slice(0, n);
      if (!qs.length) { toast('Choisis au moins un thème'); return; }
      startQuiz(shuffle(qs), themes.length === 1 ? 'Quiz — ' + themeLabel(themes[0]) : 'Quiz — ' + themes.length + ' thèmes');
      go('#/quiz/session');
    };
    $('#qz-start').addEventListener('click', () => launch($$('input[name=theme]:checked').map((i) => i.value)));
    $('#qz-ch1').addEventListener('click', () => { $('#qz-n').value = '20'; launch(THEMES.filter((t) => t.chap === 1).map((t) => t.id)); });
    $('#qz-ch2').addEventListener('click', () => { $('#qz-n').value = '20'; launch(THEMES.filter((t) => t.chap === 2).map((t) => t.id)); });
  }

  function renderQuizStep() {
    if (quiz.i >= quiz.qs.length) return renderQuizEnd();
    const q = quiz.qs[quiz.i];
    const doneN = quiz.done.filter(Boolean).length;
    const okN = quiz.exact.filter(Boolean).length;
    const last = quiz.i === quiz.qs.length - 1;
    main.innerHTML = `
      <div class="crumbs"><a href="#/quiz">Quiz</a> › ${esc(quiz.title)}</div>
      <div class="quizbar"><div class="progress"><span style="width:${pct(doneN, quiz.qs.length)}%"></span></div><span class="small muted">${okN} / ${doneN} juste${okN > 1 ? 's' : ''}</span></div>
      ${questionHTML(q, { num: quiz.i + 1, total: quiz.qs.length, showTheme: true, name: 'quiz' })}
      <div class="quiz-nav">
        <button class="btn" type="button" id="qz-prev" ${quiz.i ? '' : 'disabled'}>← Précédente</button>
        <div class="row">
          <button class="btn primary${quiz.done[quiz.i] ? ' hide' : ''}" type="button" id="qz-check">Valider</button>
          <button class="btn${quiz.done[quiz.i] ? ' primary' : ''}" type="button" id="qz-next">${last ? 'Voir le résultat' : 'Suivante →'}</button>
        </div>
      </div>
      <p class="muted small kbd-hint" style="margin-top:12px">Raccourcis : <kbd>A</kbd>…<kbd>F</kbd> pour cocher, <kbd>Entrée</kbd> pour valider puis passer à la suivante.</p>
    `;
    const card = $('.qcard');
    setSelection(card, quiz.sel[quiz.i]);
    if (quiz.done[quiz.i]) markCard(card, q, quiz.sel[quiz.i]);
    card.addEventListener('change', () => { quiz.sel[quiz.i] = readSelection(card); });
    const check = () => {
      if (quiz.done[quiz.i]) return;
      const sel = readSelection(card);
      if (!q.multi && !sel.size) { toast('Choisis une réponse'); return; }
      quiz.sel[quiz.i] = sel;
      quiz.done[quiz.i] = true;
      quiz.exact[quiz.i] = markCard(card, q, sel);
      recordAnswer(q, quiz.exact[quiz.i]);
      $('#qz-check').classList.add('hide');
      $('#qz-next').classList.add('primary');
      updateErrCount();
      const d = quiz.done.filter(Boolean).length;
      $('.quizbar .progress span').style.width = pct(d, quiz.qs.length) + '%';
      $('.quizbar .small').textContent = quiz.exact.filter(Boolean).length + ' / ' + d + ' juste(s)';
    };
    const next = () => { quiz.i++; renderQuizStep(); window.scrollTo(0, 0); };
    $('#qz-check').addEventListener('click', check);
    $('#qz-next').addEventListener('click', next);
    $('#qz-prev').addEventListener('click', () => { quiz.i--; renderQuizStep(); });
    keyHandler = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (quiz.done[quiz.i]) next(); else check(); return; }
      const k = LETTERS.indexOf(e.key.toUpperCase());
      if (k >= 0 && k < q.opts.length && !quiz.done[quiz.i] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const inp = $$('input', card)[k];
        inp.checked = q.multi ? !inp.checked : true;
        quiz.sel[quiz.i] = readSelection(card);
      }
    };
  }

  function renderQuizEnd() {
    const n = quiz.qs.length;
    const ok = quiz.exact.filter(Boolean).length;
    const answered = quiz.done.filter(Boolean).length;
    const wrong = quiz.qs.filter((q, i) => quiz.done[i] && !quiz.exact[i]);
    main.innerHTML = `
      <div class="crumbs"><a href="#/quiz">Quiz</a> › ${esc(quiz.title)}</div>
      <div class="card" style="text-align:center;padding:30px 20px">
        <div class="score-big">${ok} / ${n}</div>
        <p class="muted">${answered < n ? (n - answered) + ' question(s) non validée(s) · ' : ''}${pct(ok, n)} % de bonnes réponses</p>
        <div class="result-list" style="justify-content:center">
          ${quiz.qs.map((q, i) => `<a href="#" data-goto="${i}" class="${quiz.done[i] ? (quiz.exact[i] ? 'r-ok' : 'r-ko') : ''}" title="${esc(themeLabel(q.theme))}">${i + 1}</a>`).join('')}
        </div>
        <div class="row" style="justify-content:center;margin-top:18px">
          ${wrong.length ? '<button class="btn primary" type="button" id="qz-redo">Refaire mes ' + wrong.length + ' erreur(s)</button>' : ''}
          <a class="btn" href="#/quiz">Nouveau quiz</a>
        </div>
      </div>`;
    $$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); quiz.i = +a.dataset.goto; renderQuizStep(); }));
    const redo = $('#qz-redo');
    if (redo) redo.addEventListener('click', () => { startQuiz(shuffle(wrong), 'Quiz — mes erreurs'); renderQuizStep(); });
  }

  function viewErrors() {
    const errs = errorQuestions().sort((a, b) => (store.q[b.id].t || 0) - (store.q[a.id].t || 0));
    const byTheme = {};
    errs.forEach((q) => { (byTheme[q.theme] = byTheme[q.theme] || []).push(q); });
    main.innerHTML = `
      <div class="page-head"><h1>Mes erreurs</h1><p>Les questions dont ta dernière réponse était fausse (quiz, QCM blancs et annale). Elles disparaissent dès que tu y réponds juste.</p></div>
      ${errs.length ? `
        <div class="card row between" style="margin-bottom:18px"><strong>${errs.length} question(s) à retravailler</strong><button class="btn primary" type="button" id="err-go">Les refaire en quiz</button></div>
        ${Object.keys(byTheme).map((t) => `
          <h3>${esc(themeLabel(t))} <span class="muted small">(${byTheme[t].length})</span></h3>
          <div class="card" style="padding:6px 16px">${byTheme[t].map((q) => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="small" style="flex:1;min-width:200px">${inline(firstLine(q.stem))}</span><span class="badge">${esc(sourceLabel(q))}</span></div>`).join('')}</div>
        `).join('')}
      ` : '<div class="card empty">Aucune erreur enregistrée pour l\'instant. Lance un <a href="#/quiz">quiz</a> ou un <a href="#/qcm">QCM blanc</a> !</div>'}
    `;
    const b = $('#err-go');
    if (b) b.addEventListener('click', () => { startQuiz(shuffle(errs), 'Quiz — mes erreurs', '#/erreurs'); go('#/quiz/session'); });
  }

  function firstLine(stem) {
    const l = stem.split('\n').find((x) => x.trim() && !/^```/.test(x)) || '';
    return l.length > 160 ? l.slice(0, 157) + '…' : l;
  }

  /* =========================================================
   * QCM blancs, annale, examen aléatoire
   * ======================================================= */
  function datasetHTML(ds, open) {
    if (!ds) return '';
    return `<details class="card dataset"${open ? ' open' : ''}>
      <summary>Fichier de données : <code>${esc(ds.var)}</code> — ${esc(ds.title)}</summary>
      ${ds.desc ? `<div class="md small" style="margin-top:8px">${md(ds.desc)}</div>` : ''}
      <div class="table-wrap md"><table><thead><tr><th class="idx"></th>${ds.header.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
        ${ds.rows.map((r, i) => `<tr><td class="idx">${i}</td>${r.map((c) => (c === '' ? '<td class="nan">NaN</td>' : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="margin-top:8px"><button class="btn small" type="button" data-ds-try="${esc(ds.id)}">▶ Charger ce DataFrame dans le bac à sable</button></div>
    </details>`;
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ds-try]');
    if (!b) return;
    const ds = DATASETS[b.dataset.dsTry];
    pendingCode = `# ${ds.var} est créé automatiquement (index 0..n-1, comme à l'examen)\nprint(${ds.var}.shape)\nprint(${ds.var}.head())`;
    if (leaveGuard && !confirm('Quitter le QCM en cours ?')) return;
    leaveGuard = null;
    go('#/sandbox');
  });

  function bestOf(id) {
    const list = store.exams[id] || [];
    return list.length ? Math.max(...list.map((r) => pct(r.s, r.n))) : null;
  }

  function viewQcm(args) {
    if (args[0] === 'aleatoire') return startExamIntro(randomExam());
    if (args[0]) {
      const e = EXAMS.find((x) => x.id === args[0]);
      if (!e) return go('#/qcm');
      return startExamIntro(e);
    }
    main.innerHTML = `
      <div class="page-head"><h1>QCM blancs</h1><p>Au format de l'examen : une partie « bases de Python », une partie « pandas » sur un fichier de données fourni.</p></div>
      <div class="callout exam"><div class="callout-title">Rappel des consignes de l'examen</div><div class="callout-body">
        <p>Les questions marquées <strong>♣</strong> peuvent présenter <strong>zéro, une ou plusieurs</strong> bonnes réponses. Les autres n'ont qu'une seule bonne réponse. Ici, une question rapporte 1 point si elle est <strong>entièrement</strong> juste ; le score « cases justes » est donné à titre indicatif.</p>
      </div></div>
      <div class="grid cols-2">
        ${EXAMS.map((e) => {
          const b = bestOf(e.id);
          const n = (store.exams[e.id] || []).length;
          return `<div class="card">
            <div class="tile-title">${esc(e.title)}</div>
            <div class="tile-sub">${e.qs.length} questions · ${e.duree} min · données : <code>${esc((DATASETS[e.dataset] || {}).var || '—')}</code></div>
            ${e.desc ? `<p class="small muted" style="margin:8px 0 0">${esc(e.desc)}</p>` : ''}
            <div class="row" style="margin-top:12px"><a class="btn primary small" href="#/qcm/${e.id}">Commencer</a>${b !== null ? `<span class="badge ${b >= 50 ? 'ok' : 'ko'}">meilleur : ${b} %</span><span class="muted small">${n} essai(s)</span>` : ''}</div>
          </div>`;
        }).join('')}
        <div class="card">
          <div class="tile-title">QCM aléatoire</div>
          <div class="tile-sub">10 questions tirées de la banque (4 Python + 6 pandas), 20 min.</div>
          <div class="row" style="margin-top:12px"><a class="btn small primary" href="#/qcm/aleatoire">Générer</a>${bestOf('aleatoire') !== null ? `<span class="badge">meilleur : ${bestOf('aleatoire')} %</span>` : ''}</div>
        </div>
      </div>
    `;
  }

  function randomExam() {
    const pick = (chap, n) => {
      const themes = shuffle(THEMES.filter((t) => t.chap === chap && !['stats', 'visu'].includes(t.id)).map((t) => t.id));
      const out = [];
      let k = 0;
      while (out.length < n && k < 200) {
        const t = themes[k % themes.length];
        const cand = shuffle(BANK.filter((q) => q.theme === t && !out.includes(q)));
        if (cand.length) out.push(cand[0]);
        k++;
      }
      return out;
    };
    const s1 = pick(1, 4).map((q) => Object.assign({}, q, { section: 'Questions sur les notions de bases de python' }));
    const s2 = pick(2, 6).map((q) => Object.assign({}, q, { section: 'Questions sur le traitement de données avec Pandas' }));
    return { id: 'aleatoire', title: 'QCM aléatoire', duree: 20, intro: 'Questions tirées au hasard dans la banque de quiz. Chaque question pandas définit son propre petit DataFrame.', qs: s1.concat(s2) };
  }

  function startExamIntro(e) {
    main.innerHTML = `
      <div class="crumbs"><a href="#/qcm">QCM blancs</a> › ${esc(e.title)}</div>
      <h1>${esc(e.title)}</h1>
      ${e.intro ? `<div class="md">${md(e.intro)}</div>` : ''}
      <div class="card" style="margin-top:14px">
        <p style="margin-top:0"><strong>${e.qs.length} questions.</strong> Les corrections s'affichent seulement à la fin, quand tu cliques sur « Terminer et corriger ».</p>
        <div class="row">
          <label>Durée <select id="ex-time">
            <option value="0">Sans chrono</option>
            ${[10, 15, 20, 25, 30, 45].map((m) => `<option value="${m}"${m === e.duree ? ' selected' : ''}>${m} min</option>`).join('')}
          </select></label>
          <span class="spacer"></span>
          <button class="btn primary" type="button" id="ex-start">Commencer le QCM</button>
        </div>
      </div>`;
    $('#ex-start').addEventListener('click', () => renderExam(e, +$('#ex-time').value));
  }

  function viewAnnales() {
    const e = ANNALES[0];
    if (!e) { main.innerHTML = '<div class="empty">Annale indisponible.</div>'; return; }
    main.innerHTML = '';
    renderExam(e, 0, { annales: true });
  }

  function renderExam(e, minutes, opt) {
    opt = opt || {};
    const sel = {};
    let submitted = false;
    let remaining = minutes * 60;
    let timer = null;
    const sections = [];
    e.qs.forEach((q) => {
      const last = sections[sections.length - 1];
      if (!last || last.title !== q.section) sections.push({ title: q.section, qs: [q] }); else last.qs.push(q);
    });
    const ds = DATASETS[e.dataset];
    let num = 0;
    main.innerHTML = `
      <div class="crumbs">${opt.annales ? 'Annale' : '<a href="#/qcm">QCM blancs</a>'} › ${esc(e.title)}</div>
      <h1>${esc(e.title)}</h1>
      ${opt.annales && e.intro ? `<div class="md">${md(e.intro)}</div>` : ''}
      <div id="ex-result"></div>
      <div class="exam-sticky">
        ${minutes ? `<span class="timer" id="ex-timer">${fmtTime(remaining)}</span>` : ''}
        <span class="small muted" id="ex-count">0 / ${e.qs.length} répondues</span>
        <span class="spacer"></span>
        <button class="btn primary" type="button" id="ex-submit">Terminer et corriger</button>
      </div>
      <p class="muted small" style="text-align:center">Les questions faisant apparaître le symbole ♣ peuvent présenter zéro, une ou plusieurs bonnes réponses.</p>
      ${sections.map((s) => `
        ${s.title ? `<div class="exam-section">${esc(s.title)}</div>` : ''}
        ${/pandas/i.test(s.title || '') ? datasetHTML(ds, true) : ''}
        ${s.qs.map((q) => questionHTML(q, { num: ++num, name: 'ex-' + q.id, showTheme: false })).join('')}
      `).join('')}
      <div class="row end"><button class="btn primary" type="button" id="ex-submit-2">Terminer et corriger</button></div>
    `;
    const touched = new Set();
    main.addEventListener('change', onChange);
    function onChange(ev) {
      const card = ev.target.closest('.qcard');
      if (!card || submitted) return;
      sel[card.dataset.qid] = readSelection(card);
      touched.add(card.dataset.qid);
      $('#ex-count').textContent = touched.size + ' / ' + e.qs.length + ' répondues';
    }
    const submit = (auto) => {
      if (submitted) return;
      if (!auto && touched.size < e.qs.length && !confirm(`Tu n'as touché que ${touched.size} question(s) sur ${e.qs.length}. Corriger quand même ?`)) return;
      submitted = true;
      clearInterval(timer);
      leaveGuard = null;
      let score = 0;
      let partial = 0;
      const res = e.qs.map((q) => {
        const card = document.getElementById('q-' + q.id);
        const s = readSelection(card);
        const ok = markCard(card, q, s);
        recordAnswer(q, ok);
        if (ok) score++;
        partial += partialScore(q, s);
        return ok;
      });
      const n = e.qs.length;
      (store.exams[e.id] = store.exams[e.id] || []).push({ s: score, n, p: Math.round((100 * partial) / n), d: Date.now() });
      save();
      updateErrCount();
      $$('#ex-submit, #ex-submit-2').forEach((b) => b.classList.add('hide'));
      $('#ex-result').innerHTML = `
        <div class="card" style="text-align:center;margin-bottom:16px">
          ${auto ? '<div class="verdict partial">Temps écoulé — copie ramassée automatiquement.</div>' : ''}
          <div class="score-big">${score} / ${n}</div>
          <p class="muted" style="margin:6px 0 0">soit ${(20 * score / n).toFixed(1).replace('.', ',')} / 20 · ${Math.round((100 * partial) / n)} % des cases correctement cochées ou laissées vides</p>
          <div class="result-list" style="justify-content:center">${e.qs.map((q, i) => `<a href="#" data-scroll="q-${esc(q.id)}" class="${res[i] ? 'r-ok' : 'r-ko'}">${i + 1}</a>`).join('')}</div>
          <div class="row" style="justify-content:center;margin-top:16px">
            <a class="btn" href="#/erreurs">Voir mes erreurs</a>
            ${opt.annales ? '<button class="btn" type="button" id="ex-again">Recommencer</button>' : `<a class="btn" href="#/qcm">Autres QCM blancs</a><button class="btn" type="button" id="ex-again">Recommencer</button>`}
          </div>
        </div>`;
      const again = $('#ex-again');
      if (again) again.addEventListener('click', () => (opt.annales ? viewAnnales() : startExamIntro(e)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    $('#ex-submit').addEventListener('click', () => submit(false));
    $('#ex-submit-2').addEventListener('click', () => submit(false));
    if (minutes) {
      timer = setInterval(() => {
        remaining--;
        const t = $('#ex-timer');
        if (t) { t.textContent = fmtTime(remaining); t.classList.toggle('low', remaining <= 120); }
        if (remaining <= 0) submit(true);
      }, 1000);
    }
    leaveGuard = () => submitted || !touched.size || confirm('Quitter le QCM ? Tes réponses seront perdues.');
    cleanup = () => { clearInterval(timer); main.removeEventListener('change', onChange); };
  }

  function fmtTime(s) {
    s = Math.max(0, s);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /* =========================================================
   * Bac à sable Python (Pyodide, chargé à la demande)
   * ======================================================= */
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
  let pyPromise = null;
  let pyNs = null;
  let sandboxCode = null;

  function loadPy() {
    if (pyPromise) return pyPromise;
    pyPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PYODIDE_URL;
      s.onload = () => { window.loadPyodide().then(resolve, reject); };
      s.onerror = () => reject(new Error('Impossible de charger Python dans le navigateur : une connexion internet est nécessaire pour le bac à sable.'));
      document.head.appendChild(s);
    });
    pyPromise.catch(() => { pyPromise = null; });
    return pyPromise;
  }

  const SANDBOX_DEFAULT = `import pandas as pd

# Exemple : à remplacer par ton propre code
notes = pd.DataFrame({
    "Nom": ["Paul", "Lola", "Emma", "Hugo"],
    "Groupe": [1, 2, 1, 2],
    "Note": [12.5, 8.0, 15.0, 9.5],
})
print(notes.loc[1:2, "Nom":"Note"])
print(notes.groupby("Groupe")["Note"].mean())
`;

  function viewSandbox() {
    if (pendingCode) { sandboxCode = pendingCode; pendingCode = null; }
    const code = sandboxCode != null ? sandboxCode : SANDBOX_DEFAULT;
    main.innerHTML = `
      <div class="page-head"><h1>Bac à sable Python</h1><p>Exécute du Python (et pandas) directement dans le navigateur pour vérifier une sortie. Le premier lancement télécharge Python (connexion internet requise, ~15 Mo).</p></div>
      <textarea class="editor" id="sb-code" spellcheck="false" aria-label="Code Python">${esc(code)}</textarea>
      <div class="row" style="margin:10px 0">
        <button class="btn primary" type="button" id="sb-run">▶ Exécuter <span class="muted small" style="color:inherit;opacity:.8">Ctrl+Entrée</span></button>
        <button class="btn" type="button" id="sb-reset">Réinitialiser les variables</button>
        <button class="btn" type="button" id="sb-clear">Effacer la console</button>
        <span class="spacer"></span>
        <button class="btn claude" type="button" id="sb-ask">✦ Demander à Claude sur ce code</button>
      </div>
      <div class="row small muted" style="margin-bottom:8px">Jeux de données disponibles (créés automatiquement si tu les utilises) : ${Object.values(DATASETS).map((d) => `<button class="btn small" type="button" data-ds-insert="${esc(d.id)}"><code>${esc(d.var)}</code></button>`).join('')}</div>
      <pre class="console" id="sb-out" aria-live="polite"><span class="sys">La sortie s'affichera ici.</span></pre>
      <div class="callout tip"><div class="callout-title">Astuces</div><div class="callout-body md">
        <ul><li>Les imports <code>pandas as pd</code>, <code>numpy as np</code>, <code>re</code> et <code>math</code> sont ajoutés automatiquement quand ton code contient <code>pd.</code>, <code>np.</code>, <code>re.</code> ou <code>math.</code></li>
        <li>Comme dans une console, la valeur de la dernière ligne est affichée si c'est une expression (ex. <code>df.shape</code>).</li>
        <li>Les variables sont conservées entre deux exécutions, jusqu'à « Réinitialiser les variables ».</li></ul>
      </div></div>
    `;
    const ta = $('#sb-code');
    const out = $('#sb-out');
    ta.addEventListener('input', () => { sandboxCode = ta.value; });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart;
        ta.setRangeText('    ', s, ta.selectionEnd, 'end');
        sandboxCode = ta.value;
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        run();
      }
    });
    const write = (text, cls) => {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = text.endsWith('\n') ? text : text + '\n';
      out.appendChild(span);
    };
    let running = false;
    async function run() {
      if (running) return;
      running = true;
      $('#sb-run').disabled = true;
      out.textContent = '';
      const code = ta.value;
      try {
        if (!pyPromise) write('Chargement de Python… (première fois uniquement)', 'sys');
        const py = await loadPy();
        if (!pyNs) pyNs = py.toPy({});
        const prelude = [];
        if (/\bpd\./.test(code) || Object.values(DATASETS).some((d) => new RegExp('\\b' + d.var + '\\b').test(code))) prelude.push('import pandas as pd');
        if (/\bnp\./.test(code)) prelude.push('import numpy as np');
        if (/\bre\./.test(code)) prelude.push('import re');
        if (/\bmath\./.test(code)) prelude.push('import math');
        await py.loadPackagesFromImports(prelude.join('\n') + '\n' + code, { messageCallback: (m) => { if (/Loading/.test(m)) write('Chargement des bibliothèques…', 'sys'); } });
        if (prelude.length) await py.runPythonAsync(prelude.join('\n'), { globals: pyNs });
        for (const d of Object.values(DATASETS)) {
          if (new RegExp('\\b' + d.var + '\\b').test(code) && !pyNs.has(d.var)) {
            pyNs.set('_csv_txt', d.csv);
            await py.runPythonAsync(`import io, pandas as _pd\n${d.var} = _pd.read_csv(io.StringIO(_csv_txt))`, { globals: pyNs });
          }
        }
        py.setStdout({ batched: (s) => write(s) });
        py.setStderr({ batched: (s) => write(s, 'err') });
        const result = await py.runPythonAsync(code, { globals: pyNs });
        if (result !== undefined && result !== null) {
          let txt;
          if (typeof result === 'object' && typeof result.toJs === 'function') {
            txt = py.pyimport('builtins').repr(result);
            result.destroy();
          } else if (typeof result === 'string') txt = "'" + result + "'";
          else if (typeof result === 'boolean') txt = result ? 'True' : 'False';
          else txt = String(result);
          write(txt, 'res');
        }
        if (!out.textContent.trim()) write('(aucune sortie)', 'sys');
      } catch (err) {
        const msg = String(err && err.message ? err.message : err);
        const lines = msg.split('\n');
        const k = lines.findIndex((l) => /File "<exec>"/.test(l));
        write(k >= 0 ? lines.slice(k).join('\n') : msg, 'err');
      } finally {
        running = false;
        const b = $('#sb-run');
        if (b) b.disabled = false;
      }
    }
    $('#sb-run').addEventListener('click', run);
    $('#sb-clear').addEventListener('click', () => { out.innerHTML = ''; });
    $('#sb-reset').addEventListener('click', () => { if (pyNs) { pyNs.destroy(); pyNs = null; } out.innerHTML = '<span class="sys">Variables réinitialisées.</span>'; });
    $('#sb-ask').addEventListener('click', () => openAsk({ kind: 'code', source: 'Bac à sable Python', code: ta.value, output: out.textContent }));
    $$('[data-ds-insert]').forEach((b) => b.addEventListener('click', () => {
      const d = DATASETS[b.dataset.dsInsert];
      ta.value = `print(${d.var})\n` + ta.value;
      sandboxCode = ta.value;
      ta.focus();
    }));
  }

  /* =========================================================
   * Demander à Claude
   * ======================================================= */
  const ASK_MODES = {
    explain: { label: 'Expliquer la correction', instr: 'Explique-moi la bonne réponse : pour chaque proposition, dis si elle est vraie ou fausse et pourquoi, en citant la règle de cours en jeu.' },
    hint: { label: 'Un indice, pas la réponse', instr: "Ne me donne PAS la réponse : donne-moi seulement un indice ou une piste de raisonnement pour que je trouve par moi-même." },
    check: { label: 'Vérifier mon raisonnement', instr: "Voici mon raisonnement (dans « Ma question ») : dis-moi s'il est juste et, sinon, où exactement je me trompe.", ph: 'Explique ton raisonnement : « Je pense que B est juste parce que… »' },
    similar: { label: 'Question similaire', instr: "Propose-moi une question du même type (format QCM, même notion) pour m'entraîner. Mets la correction tout à la fin, après une ligne « --- CORRECTION --- », pour que je puisse chercher avant de la lire." },
    concept: { label: 'Réexpliquer la notion', instr: "Réexplique-moi simplement la notion de cours en jeu, avec un petit exemple de code commenté et sa sortie." },
    deeper: { label: 'Expliquer plus en détail', instr: "Explique-moi cette carte plus en détail, avec un exemple de code et sa sortie, et le piège éventuel à connaître pour le QCM." },
    quizme: { label: 'Me poser 3 questions', instr: "Pose-moi 3 questions courtes de type QCM sur cette notion, une par une : attends ma réponse avant de corriger et de passer à la suivante." },
    code: { label: 'Expliquer ce code', instr: "Explique-moi ce que fait ce code ligne par ligne et pourquoi il produit cette sortie (ou cette erreur)." },
    free: { label: 'Question libre', instr: 'Réponds à ma question ci-dessous.' },
  };
  const ASK_SETS = {
    question: ['explain', 'hint', 'check', 'similar', 'concept'],
    flash: ['deeper', 'quizme', 'similar', 'free'],
    course: ['concept', 'quizme', 'similar', 'free'],
    code: ['code', 'similar', 'free'],
  };
  const ask = { ctx: null, mode: 'explain' };

  function openAsk(ctx) {
    ask.ctx = ctx;
    const set = ASK_SETS[ctx.kind];
    ask.mode = ctx.kind === 'question' ? (ctx.corrected ? 'explain' : 'hint') : set[0];
    $('#ask-modes').innerHTML = set.map((m) => `<label class="chip"><input type="radio" name="ask-mode" value="${m}"${m === ask.mode ? ' checked' : ''}>${esc(ASK_MODES[m].label)}</label>`).join('');
    const inc = $('#ask-include');
    const incWrap = $('#ask-include-wrap');
    if (ctx.kind === 'question') {
      incWrap.classList.remove('hide');
      incWrap.lastChild.textContent = ' Inclure la correction du site dans le prompt';
      inc.checked = !!ctx.corrected;
    } else if (ctx.kind === 'flash') {
      incWrap.classList.remove('hide');
      incWrap.lastChild.textContent = ' Inclure la réponse de la carte (verso)';
      inc.checked = true;
    } else incWrap.classList.add('hide');
    $('#ask-ctx').innerHTML = contextHTML(ctx);
    $('#ask-q').value = '';
    updateAskPlaceholder();
    refreshPrompt();
    $('#ask-modal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#ask-q').focus(), 30);
  }

  function closeAsk() {
    $('#ask-modal').hidden = true;
    document.body.style.overflow = '';
  }

  function contextHTML(c) {
    if (c.kind === 'question') {
      const sel = c.selected && c.selected.size ? lettersOf([...c.selected].sort()) : '—';
      return `<div class="ctx-src">${esc(c.source)}</div>${md(c.q.stem)}<ol type="A" style="margin:6px 0">${c.q.opts.map((o) => `<li>${inline(o.text)}</li>`).join('')}</ol><div class="small muted">Ta réponse actuelle : ${esc(sel)}${c.corrected ? ' · correction : ' + esc(lettersOf(c.q.correct) || 'aucune') : ''}</div>`;
    }
    if (c.kind === 'flash') return `<div class="ctx-src">${esc(c.source)}</div>${md(c.front)}<hr style="margin:8px 0">${md(c.back)}`;
    if (c.kind === 'course') return `<div class="ctx-src">${esc(c.source)}</div><strong>${esc(c.title)}</strong>`;
    return `<div class="ctx-src">${esc(c.source)}</div>${codeBlock(c.code.slice(0, 1500), 'python')}`;
  }

  function updateAskPlaceholder() {
    const m = ASK_MODES[ask.mode];
    $('#ask-q').placeholder = m.ph || (ask.ctx && ask.ctx.kind === 'question'
      ? 'Ex. : Je ne comprends pas pourquoi la proposition C est fausse…'
      : 'Ex. : Quelle est la différence avec… ?');
  }

  function buildPrompt() {
    const c = ask.ctx;
    const m = ASK_MODES[ask.mode];
    const userQ = $('#ask-q').value.trim();
    const include = $('#ask-include').checked;
    const L = [];
    L.push("Bonjour Claude ! Je révise un examen QCM de « Traitement et analyse de données » (ESIEE Paris, cours de C. Berland) : Python de base (listes, boucles, fonctions, dictionnaires, regex, NumPy) puis traitement de données avec pandas.");
    L.push('');
    if (c.kind === 'question') {
      L.push(`Je bloque sur cette question (${c.source}) :`);
      L.push('');
      L.push('<question>');
      L.push(c.q.stem);
      L.push('');
      L.push(c.q.multi ? 'Propositions (♣ : zéro, une ou plusieurs bonnes réponses) :' : 'Propositions (une seule bonne réponse) :');
      c.q.opts.forEach((o, i) => L.push(`${LETTERS[i]}. ${o.text}`));
      L.push('</question>');
      if (c.dataset) {
        L.push('');
        L.push(`Fichier de données de l'énoncé, lu avec pd.read_csv dans le DataFrame ${c.dataset.var} (index créé automatiquement : 0, 1, 2…) :`);
        L.push('```csv');
        L.push(c.dataset.csv.trim());
        L.push('```');
      }
      L.push('');
      const sel = c.selected && c.selected.size ? lettersOf([...c.selected].sort()) : null;
      L.push('Ma réponse : ' + (sel || (c.corrected ? 'aucune case cochée' : "je n'ai pas encore répondu")));
      if (include) {
        L.push('Correction donnée par mon site de révision : ' + (c.q.correct.length ? lettersOf(c.q.correct) : 'aucune proposition correcte'));
        if (c.q.exp) { L.push('Explication du site :'); L.push(c.q.exp); }
      }
    } else if (c.kind === 'flash') {
      L.push(`Je révise avec une flashcard (${c.source}) :`);
      L.push('');
      L.push('Recto : ' + c.front);
      if (include) L.push('Verso : ' + c.back);
    } else if (c.kind === 'course') {
      L.push(`Je travaille la notion de cours suivante : « ${c.title} ».`);
      if (c.body) {
        L.push('');
        L.push('Voici le résumé que j\'utilise :');
        L.push('<resume>');
        L.push(c.body.length > 5000 ? c.body.slice(0, 5000) + '\n[…]' : c.body);
        L.push('</resume>');
      }
    } else {
      L.push('Voici un code Python que je teste :');
      L.push('```python');
      L.push(c.code.trim());
      L.push('```');
      if (c.output && c.output.trim() && !/^La sortie s'affichera ici/.test(c.output.trim())) {
        L.push('Sortie obtenue :');
        L.push('```');
        L.push(c.output.trim().slice(0, 3000));
        L.push('```');
      }
    }
    L.push('');
    L.push('Ce que je te demande : ' + m.instr);
    if (userQ) {
      L.push('');
      L.push((ask.mode === 'check' ? 'Mon raisonnement : ' : 'Ma question : ') + userQ);
    }
    L.push('');
    L.push("Réponds en français, de façon claire et concise, en restant cohérent avec le cours (Python 3, pandas). Si la correction de mon site te semble fausse, dis-le franchement.");
    return L.join('\n');
  }

  function refreshPrompt() { $('#ask-prompt').value = buildPrompt(); }

  $('#ask-modes').addEventListener('change', (e) => {
    ask.mode = e.target.value;
    if (ask.mode === 'hint') $('#ask-include').checked = false;
    if (ask.mode === 'explain' && ask.ctx.kind === 'question' && ask.ctx.corrected) $('#ask-include').checked = true;
    updateAskPlaceholder();
    refreshPrompt();
  });
  $('#ask-include').addEventListener('change', refreshPrompt);
  $('#ask-q').addEventListener('input', refreshPrompt);
  $('#ask-modal').addEventListener('click', (e) => { if (e.target.id === 'ask-modal' || e.target.closest('[data-close]')) closeAsk(); });
  $('#ask-copy').addEventListener('click', async () => {
    const ok = await copyText(buildPrompt());
    if (ok) toast('Prompt copié ✓ — colle-le dans Claude');
    else { $('#ask-prompt').select(); toast('Copie bloquée : le prompt est sélectionné, fais Ctrl+C'); }
  });
  $('#ask-open').addEventListener('click', async () => {
    const p = buildPrompt();
    const copying = copyText(p);
    const url = p.length < 6000 ? 'https://claude.ai/new?q=' + encodeURIComponent(p) : 'https://claude.ai/new';
    window.open(url, '_blank', 'noopener');
    const ok = await copying;
    toast(ok ? 'Prompt copié ✓ — colle-le si le champ est vide' : 'Ouvre Claude et colle le prompt (Ctrl+V)');
  });

  /* =========================================================
   * Démarrage
   * ======================================================= */
  window.TAD = { BANK, EXAMS, ANNALES, DECKS, COURS, TD, DATASETS, ALLQ, md, inline };
  router();
})();
