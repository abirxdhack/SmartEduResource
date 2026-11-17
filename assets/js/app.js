//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(async function () {
  'use strict';
  const A = window.A360, $ = A.$, PER = 12;
  $('#si').innerHTML = $('#si2').innerHTML = A.ico.search;
  $('#grid').innerHTML = '<div class="skel"></div>'.repeat(4);
  let d; try { d = await A.data(); if (!d.resources.length) fetch(A.root + 'api.php?action=ping').then(r => r.json()).then(j => j && j.ok && fetch(A.root + 'data/resources.json', { cache: 'reload' })).catch(() => {}); } catch (e) { $('#grid').innerHTML = A.empty('Could not load the library', 'Please refresh the page.'); return; }
  const all = d.resources.filter(r => r.status === 'published'), T = d.taxonomy;
  const byNew = (a, b) => new Date(b.added) - new Date(a.added);

  const latest = [...all].sort(byNew).slice(0, 3), ph = [['Question Bank', 'Model tests & practice'], ['Academic Notes', 'Chapter-wise study notes'], ['Study Guide', 'Revision made simple']];
  $('#stack').innerHTML = [0, 1, 2].map(i => { const r = latest[i]; return `<div class="doc d${i + 1}"${r ? ` style="--h:${A.hue(r)}"` : ''}>${r ? A.img(r) : ''}<span class="pdf">PDF</span><div><small>${A.esc(r ? (r.type || r.subject || 'Document') : ph[i][0])}</small><br><b>${A.esc(r ? r.title.slice(0, 48) : ph[i][1])}</b></div></div>`; }).join('');
  $('#strip').innerHTML = [[A.ico.bolt, 'Free to read & download'], [A.ico.cloud, 'Fast reading, powered by Google Drive'], [A.ico.share, 'Share any resource with one link']].map(x => `<span>${x[0]}${x[1]}</span>`).join('');
  const usedSubj = new Set(all.map(r => r.subject).filter(Boolean)), dl = all.reduce((s, r) => s + (r.downloads || 0), 0);
  $('#counters').innerHTML = [[all.length, 'Resources'], [T.categories.length, 'Categories'], [usedSubj.size, 'Subjects covered'], [dl, 'Total downloads']].map(x => `<div class="counter rv"><b data-to="${x[0]}">0</b><span>${x[1]}</span></div>`).join('');
  A.reveal($('#counters'));
  const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { A.$$('b[data-to]', e.target).forEach(A.count); co.disconnect(); } }), { threshold: .3 }); co.observe($('#counters'));

  A.showcase(all);

  const qs = new URLSearchParams(location.search), V = k => qs.get(k) || '';
  const opt = (list, label, sel) => `<option value="">${label}</option>` + list.map(v => `<option${v === sel ? ' selected' : ''}>${A.esc(v)}</option>`).join('');
  const years = [...new Set(all.map(r => r.year).filter(Boolean))].sort().reverse();
  $('#fSubject').innerHTML = opt(T.subjects, 'All subjects', V('subject')); $('#fClass').innerHTML = opt(T.classes, 'All classes', V('class')); $('#fBoard').innerHTML = opt(T.boards, 'All boards', V('board'));
  $('#fYear').innerHTML = opt(years, 'All years', V('year')); $('#fType').innerHTML = opt(T.types, 'All types', V('type'));
  $('#q').value = V('q'); $('#fSort').value = ['newest', 'popular', 'downloads', 'oldest', 'title'].includes(V('sort')) ? V('sort') : 'newest';
  let cat = V('category'), page = Math.max(1, parseInt(V('page'), 10) || 1);
  const drawChips = () => { $('#chips').innerHTML = ['', ...T.categories.map(c => c.name)].map(c => `<button class="chip${c === cat ? ' on' : ''}" data-c="${A.esc(c)}">${c ? A.esc(c) : 'All'}</button>`).join(''); };
  drawChips();
  const F = { subject: '#fSubject', class: '#fClass', board: '#fBoard', year: '#fYear', type: '#fType' };

  function render(push) {
    const v = { q: $('#q').value.trim(), category: cat }; Object.keys(F).forEach(k => v[k] = $(F[k]).value);
    const q = v.q.toLowerCase(), s = $('#fSort').value;
    const rows = all.filter(r => (!v.category || r.category === v.category) && Object.keys(F).every(k => !v[k] || r[k] === v[k]) && (!q || [r.title, r.short, r.author, r.topic, r.keywords, r.subject, (r.tags || []).join(' ')].join(' ').toLowerCase().includes(q)));
    rows.sort((a, b) => s === 'title' ? a.title.localeCompare(b.title) : s === 'oldest' ? -byNew(a, b) : s === 'downloads' ? (b.downloads - a.downloads) || byNew(a, b) : s === 'popular' ? (b.views - a.views) || byNew(a, b) : byNew(a, b));
    const pages = Math.max(1, Math.ceil(rows.length / PER)); page = Math.min(page, pages);
    $('#grid').innerHTML = rows.length ? rows.slice((page - 1) * PER, page * PER).map(A.card).join('') : A.empty(all.length ? 'No resources found' : 'The library is being prepared', all.length ? 'Try a different keyword or clear some filters.' : 'New resources will appear here as soon as they are published.');
    A.reveal($('#grid'));
    const active = !!(v.q || v.category || Object.keys(F).some(k => v[k]));
    $('#count').textContent = rows.length + (rows.length === 1 ? ' resource' : ' resources') + (active ? ' match' : ' in the library'); $('#reset').hidden = !active;
    let pg = ''; if (pages > 1) { pg = '<nav class="pager" aria-label="Pagination">'; if (page > 1) pg += `<a class="pg" href="#library" data-p="${page - 1}">‹</a>`; for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) pg += `<a class="pg${i === page ? ' on' : ''}" href="#library" data-p="${i}">${i}</a>`; if (page < pages) pg += `<a class="pg" href="#library" data-p="${page + 1}">›</a>`; $('#pager').innerHTML = pg + '</nav>'; } else $('#pager').innerHTML = '';
    drawChips();
    if (push) { const p = new URLSearchParams(); if (v.q) p.set('q', v.q); if (cat) p.set('category', cat); Object.keys(F).forEach(k => v[k] && p.set(k, v[k])); if (s !== 'newest') p.set('sort', s); if (page > 1) p.set('page', page); history.replaceState(null, '', (p.toString() ? '?' + p : location.pathname) + '#library'); }
    return active;
  }
  const active = render(false);
  let tm; $('#q').addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { page = 1; render(true); }, 220); });
  [...Object.values(F), '#fSort'].forEach(s => $(s).addEventListener('change', () => { page = 1; render(true); }));
  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; page = 1; render(true); });
  $('#pager').addEventListener('click', e => { const a = e.target.closest('a[data-p]'); if (!a) return; e.preventDefault(); page = +a.dataset.p; render(true); $('#library').scrollIntoView({ behavior: 'smooth' }); });
  $('#reset').onclick = () => { $('#q').value = ''; cat = ''; Object.values(F).forEach(s => $(s).value = ''); page = 1; render(true); };
  document.addEventListener('a360:search', e => { $('#q').value = e.detail || ''; page = 1; render(true); $('#library').scrollIntoView({ behavior: 'smooth' }); });
  $('#heroSearch').addEventListener('submit', e => { e.preventDefault(); $('#q').value = $('#heroSearch input').value; page = 1; render(true); $('#library').scrollIntoView({ behavior: 'smooth' }); });
  if (active || qs.get('page')) setTimeout(() => $('#library').scrollIntoView(), 60);

  const show = (sec, html, target) => { if (html) { $(target).innerHTML = html; $(sec).hidden = false; A.reveal($(sec)); } };
  show('#secFeatured', all.filter(r => r.featured).slice(0, 8).map(A.card).join(''), '#shelf');
  show('#secRecent', [...all].sort(byNew).slice(0, 4).map(A.card).join(''), '#gRecent');
  show('#secPopular', all.filter(r => r.downloads > 0).sort((a, b) => b.downloads - a.downloads).slice(0, 4).map(A.card).join(''), '#gPopular');
  $('#tiles').innerHTML = T.categories.map((c, i) => `<a class="tile rv" href="?category=${encodeURIComponent(c.name)}#library"><span class="no">${String(i + 1).padStart(2, '0')}</span><span class="ar">${A.ico.arrow}</span><b>${A.esc(c.name)}</b><span class="d">${all.filter(r => r.category === c.name).length} PDFs${c.subs.length ? ' · ' + A.esc(c.subs.slice(0, 3).join(', ')) : ''}</span></a>`).join('');
  A.reveal($('#tiles'));
  show('#subjects', [...usedSubj].map(s => `<a class="pill" href="?subject=${encodeURIComponent(s)}#library">${A.esc(s)}<small>${all.filter(r => r.subject === s).length}</small></a>`).join(''), '#subjPills');
  try { const l = JSON.parse(localStorage.getItem('a360-rv') || '[]').filter(x => all.some(r => r.slug === x.s)); show('#recentlyViewed', l.map(x => `<a class="pill" href="read.html?r=${encodeURIComponent(x.s)}">${A.esc(x.t)}</a>`).join(''), '#rvp'); } catch (e) {}
})();
