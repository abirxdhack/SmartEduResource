//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  'use strict';
  const root = document.getElementById('readerRoot'); if (!root) return;
  const A = window.A360, $ = id => document.getElementById(id), toast = (m, t) => A.toast(m, t);
  const gv = $('gv'), state = $('state'), scroller = $('scroller'), pagesEl = $('pages'), slow = $('slow');
  const side = $('side'), infoBtn = $('infoToggle'); let R = null, mode = '', slowT = 0, apiKey = '';
  infoBtn.addEventListener('click', () => { const o = side.classList.toggle('open'); infoBtn.setAttribute('aria-expanded', o); });
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  function busy(msg, pct) { state.hidden = false; state.className = 'rd-state'; state.innerHTML = '<div class="spinner"></div><p id="stateMsg"></p><div class="bar" id="bar" hidden><i></i></div>'; $('stateMsg').textContent = msg; if (pct != null) { $('bar').hidden = false; $('bar').firstChild.style.width = pct + '%'; } }
  function fail(msg, extra) { clearTimeout(slowT); slow.hidden = true; state.hidden = false; state.className = 'rd-state error'; state.innerHTML = '<p></p>' + (extra || ''); state.firstChild.textContent = msg; }
  const lines = () => R && R.driveId ? `<a class="btn btn-ghost" target="_blank" rel="noopener" href="${A.esc(A.driveOpen(R))}">Open in Google Drive</a>` : '';

  function showGoogle() {
    mode = 'google'; scroller.hidden = true; $('pdfCtl').hidden = true; mark('google');
    const src = R.driveId ? A.driveView(R) : (R.file ? A.root + R.file + '#view=FitH' : '');
    if (!src) return fail('This document has no file attached.');
    busy('Opening document…'); gv.hidden = false; slow.hidden = true; clearTimeout(slowT);
    gv.onload = () => { clearTimeout(slowT); state.hidden = true; slow.hidden = true; };
    slowT = setTimeout(() => { if (!state.hidden) { slow.hidden = false; } }, 9000);
    if (gv.getAttribute('src') !== src) gv.src = src; else { state.hidden = true; }
  }

  let pdf = null, n = 0, ratio = 1.414, smode = 'fit', userScale = 1, boxes = [], rendered = new Map(), io = null, cur = 1, baseW = 612, uiBound = false;
  const MIN = .4, MAX = 4;
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const cssW = () => smode === 'fit' ? scroller.clientWidth - (scroller.clientWidth < 600 ? 12 : 32) : baseW * userScale;
  async function showSmart() {
    if (!apiKey || !R.driveId) return showGoogle();
    mode = 'smart'; gv.hidden = true; mark('smart'); localStorage.setItem('a360-reader', 'smart'); busy('Loading reader…', 0);
    if (pdf) { scroller.hidden = false; $('pdfCtl').hidden = false; state.hidden = true; return; }
    try {
      if (!window.pdfjsLib) await loadScript(PDFJS);
      const lib = window.pdfjsLib;
      try { lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob(['importScripts("' + WORKER + '");'], { type: 'text/javascript' })); } catch (e) { lib.GlobalWorkerOptions.workerSrc = WORKER; }
      const url = 'https://www.googleapis.com/drive/v3/files/' + R.driveId + '?alt=media&supportsAllDrives=true&key=' + encodeURIComponent(apiKey);
      const task = lib.getDocument({ url, disableRange: true, disableStream: false, disableAutoFetch: false, isEvalSupported: false });
      task.onProgress = p => { if (p.total) busy('Downloading… ' + A.size(p.loaded) + ' of ' + A.size(p.total), Math.round(p.loaded / p.total * 100)); };
      const doc = await task.promise; pdf = doc; n = doc.numPages; $('pageCount').textContent = n; $('pageNum').max = n;
      const p1 = await pdf.getPage(1), vp = p1.getViewport({ scale: 1 }); baseW = vp.width; ratio = vp.height / vp.width;
      scroller.hidden = false; $('pdfCtl').hidden = false; state.hidden = true; build(); layout(); bindUi();
    } catch (e) { console.warn('Smart reader failed', e); toast('Smart reader could not load this file — using the Google viewer.', 'err'); localStorage.removeItem('a360-reader'); showGoogle(); }
  }
  function build() { pagesEl.innerHTML = ''; boxes = []; for (let i = 1; i <= n; i++) { const d = document.createElement('div'); d.className = 'pg-box'; d.dataset.n = i; pagesEl.appendChild(d); boxes.push(d); } io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) draw(+en.target.dataset.n); }), { root: scroller, rootMargin: '900px 0px' }); boxes.forEach(b => io.observe(b)); }
  function layout() { const w = Math.max(120, Math.round(cssW())), h = Math.round(w * ratio); boxes.forEach(b => { b.style.width = w + 'px'; b.style.height = h + 'px'; b.innerHTML = ''; }); rendered.clear(); $('zoomLabel').textContent = smode === 'fit' ? 'Fit' : Math.round(userScale * 100) + '%'; boxes.forEach(b => { io.unobserve(b); io.observe(b); }); }
  async function draw(i) {
    const box = boxes[i - 1], w = parseInt(box.style.width, 10); if (rendered.get(i) === w) return; rendered.set(i, w);
    try {
      const page = await pdf.getPage(i), v0 = page.getViewport({ scale: 1 }), dpr = Math.min(devicePixelRatio || 1, 2), vp = page.getViewport({ scale: (w / v0.width) * dpr });
      if (parseInt(box.style.width, 10) !== w) return; box.style.height = Math.round(w * v0.height / v0.width) + 'px';
      const c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; if (parseInt(box.style.width, 10) === w) { box.innerHTML = ''; box.appendChild(c); }
    } catch (e) { rendered.delete(i); }
  }
  const goto = i => { i = Math.min(n, Math.max(1, i | 0)); const b = boxes[i - 1]; if (b) scroller.scrollTo({ top: b.offsetTop - 8 }); };
  function updateCur() { const mid = scroller.scrollTop + scroller.clientHeight / 3; let lo = 0, hi = n - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (boxes[m].offsetTop <= mid) lo = m; else hi = m - 1; } cur = lo + 1; $('pageNum').value = cur; }
  function zoom(f) { const mid = scroller.scrollTop / Math.max(1, scroller.scrollHeight), base = smode === 'fit' ? cssW() / baseW : userScale; userScale = Math.min(MAX, Math.max(MIN, base * f)); smode = 'custom'; layout(); scroller.scrollTop = mid * scroller.scrollHeight; }
  function bindUi() {
    if (uiBound) return; uiBound = true; let tick = false;
    scroller.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { updateCur(); tick = false; }); } }, { passive: true });
    $('prevPage').onclick = () => goto(cur - 1); $('nextPage').onclick = () => goto(cur + 1); $('pageNum').addEventListener('change', e => goto(parseInt(e.target.value, 10) || 1));
    $('zoomIn').onclick = () => zoom(1.2); $('zoomOut').onclick = () => zoom(1 / 1.2);
    $('fitWidth').onclick = () => { const mid = scroller.scrollTop / Math.max(1, scroller.scrollHeight); smode = 'fit'; layout(); scroller.scrollTop = mid * scroller.scrollHeight; };
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (mode === 'smart' && smode === 'fit') layout(); }, 200); });
    scroller.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1); } }, { passive: false });
    document.addEventListener('keydown', e => { if (mode !== 'smart' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goto(cur + 1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goto(cur - 1); } else if (e.key === '+' || e.key === '=') zoom(1.2); else if (e.key === '-') zoom(1 / 1.2); else if (e.key === 'Home') goto(1); else if (e.key === 'End') goto(n); });
    updateCur();
  }
  function mark(m) { A.$$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); }

  async function start() {
    const slug = new URLSearchParams(location.search).get('r'); let d;
    try { d = await A.data(); } catch (e) { return fail('Could not load the library data. Please refresh.'); }
    R = d.resources.find(x => x.slug === slug && x.status === 'published');
    if (!R) { $('rdTitle').textContent = 'Not found'; return fail('This resource does not exist or is not published.', '<a class="btn btn-ghost" href="index.html#library">Back to the library</a>'); }
    apiKey = (d.site && d.site.driveApiKey) || '';
    document.title = (R.seoTitle || R.title) + ' · Smart Educational Resource'; $('rdTitle').textContent = R.title; $('rdTitle').title = R.title;
    $('rdSub').textContent = [R.subject, R.type, R.class].filter(Boolean).join(' · ');
    $('shareBtn').onclick = () => A.share(A.shareUrl(R), R.title);
    const dl = A.driveDl(R), open = A.driveOpen(R);
    if (R.allowDownload !== false && dl) { const b = $('dlBtn'); b.hidden = false; b.href = dl; b.addEventListener('click', () => { A.hit(R.id, 'd'); toast('Download started — it comes straight from Google Drive.', 'ok'); }); }
    if (open) { const o = $('openBtn'); o.hidden = false; o.href = open; $('slowOpen').href = open; }
    try { if (!sessionStorage.getItem('v' + R.id)) { sessionStorage.setItem('v' + R.id, 1); A.hit(R.id, 'v'); } } catch (e) {}
    const rows = [['Type', R.type], ['Subject', R.subject], ['Category', [R.category, R.subcategory].filter(Boolean).join(' › ')], ['Level', R.level], ['Class', R.class], ['Board', R.board], ['Academic year', R.year], ['Term', R.term], ['Chapter', [R.chapter, R.topic].filter(Boolean).join(' ')], ['Author', R.author], ['Publisher', R.publisher], ['Edition', R.edition], ['ISBN', R.isbn], ['Language', R.language], ['Difficulty', R.difficulty], ['Audience', R.audience], ['Pages', R.pages || ''], ['Published', A.date(R.pubDate)], ['Uploaded', A.date(R.added)], ['File size', A.size(R.size || 0)], ['Views', R.views], ['Downloads', R.downloads]].filter(x => x[1] !== '' && x[1] != null);
    const rel = d.resources.filter(x => x.slug !== R.slug && (x.subject === R.subject || x.category === R.category)).slice(0, 4);
    $('sideBody').innerHTML = `<span class="eyebrow">Document</span><h2>${A.esc(R.title)}</h2>${R.short ? `<p class="muted" style="margin-bottom:1rem">${A.esc(R.short)}</p>` : ''}<dl class="info">${rows.map(x => `<dt>${A.esc(x[0])}</dt><dd>${A.esc(x[1])}</dd>`).join('')}</dl>`
      + (R.desc ? `<h3>About this document</h3><p class="muted pre">${A.esc(R.desc)}</p>` : '') + ((R.tags || []).length ? `<div class="cmeta" style="margin-top:1rem">${R.tags.map(t => `<span>${A.esc(t)}</span>`).join('')}</div>` : '')
      + (rel.length ? `<h3>Related resources</h3><ul class="rel">${rel.map(x => `<li><a href="${A.esc(A.resUrl(x))}">${A.esc(x.title)}</a><small>${A.esc(x.subject || x.type || '')}</small></li>`).join('')}</ul>` : '');
    try { let l = JSON.parse(localStorage.getItem('a360-rv') || '[]').filter(x => x.s !== R.slug); l.unshift({ s: R.slug, t: R.title }); localStorage.setItem('a360-rv', JSON.stringify(l.slice(0, 6))); } catch (e) {}
    if (apiKey && R.driveId) { $('tools').hidden = false; $('smartTab').hidden = false; }
    else if (document.fullscreenEnabled || document.webkitFullscreenEnabled) { $('tools').hidden = false; }
    $('modeSeg').addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b || b.dataset.m === mode) return; if (b.dataset.m === 'smart') showSmart(); else { try { localStorage.setItem('a360-reader', 'google'); } catch (x) {} showGoogle(); } });
    $('fullscreen').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else (root.requestFullscreen || root.webkitRequestFullscreen || function () { toast('Fullscreen is not supported here', 'err'); }).call(root); };
    let pref = ''; try { pref = localStorage.getItem('a360-reader') || ''; } catch (e) {}
    if (pref === 'smart' && apiKey && R.driveId) showSmart(); else showGoogle();
  }
  start();
})();
