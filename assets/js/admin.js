//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  'use strict';
  const A = window.A360, Au = window.A360Auth, $ = A.$, esc = A.esc, view = $('#view');
  if (!Au.guard('../login/')) return;
  $('#logout').onclick = () => { Au.logout(); location.replace('../login/'); };
  $('#adMenu').onclick = () => $('#adSide').classList.toggle('open');
  const api = (a, o) => Au.call(a, o), note = (m, t) => A.toast(m, t);
  let DB = null, STATS = {};
  const hex = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');
  const sel = (list, v, label) => `<option value="">${label || '— None —'}</option>` + list.map(x => `<option${x === v ? ' selected' : ''}>${esc(x)}</option>`).join('');
  async function load() { const d = await api('admin_data'); DB = d.db; STATS = d.stats || {}; $('#mb').textContent = DB.messages.filter(m => !m.read).length || ''; }
  const T = () => DB.taxonomy, byId = id => DB.resources.find(r => r.id === id);
  const titles = { dashboard: 'Dashboard', resources: 'Resources', edit: 'Add / edit resource', taxonomy: 'Categories & lists', messages: 'Messages' };

  async function route() {
    const [, k = 'dashboard', arg] = (location.hash || '#/dashboard').split('/');
    A.$$('#adNav a[data-k]').forEach(a => a.classList.toggle('on', a.dataset.k === k)); $('#pageTitle').textContent = titles[k] || 'Dashboard'; $('#adSide').classList.remove('open');
    view.onclick = view.onsubmit = null; view.innerHTML = '<div class="spinner" style="margin:4rem auto"></div>';
    try { await load(); } catch (e) { view.innerHTML = `<div class="status bad"><i></i><div><b>Could not load data</b><br>${esc(e.message)}</div></div>`; return; }
    ({ dashboard, resources, edit, taxonomy, messages }[k] || dashboard)(arg); scrollTo(0, 0);
  }
  addEventListener('hashchange', route);

  async function dashboard() {
    const rs = DB.resources, pub = rs.filter(r => r.status === 'published').length; let vw = 0, dl = 0; rs.forEach(r => { vw += (STATS[r.id] || {}).v || 0; dl += (STATS[r.id] || {}).d || 0; });
    const recent = [...rs].sort((a, b) => new Date(b.added) - new Date(a.added)).slice(0, 6);
    view.innerHTML = `<div id="srv"></div><div class="cards"><div class="sc"><b>${rs.length}</b><span>Total PDFs</span></div><div class="sc"><b>${pub}</b><span>Published</span></div><div class="sc"><b>${rs.length - pub}</b><span>Drafts</span></div><div class="sc"><b>${DB.taxonomy.categories.length}</b><span>Categories</span></div><div class="sc"><b>${dl}</b><span>Downloads</span></div><div class="sc"><b>${vw}</b><span>Views</span></div></div>
    <div class="panel"><h2>Quick actions</h2><div class="toolbar" style="margin:0"><a class="btn btn-solid" href="#/edit/new">Add new PDF</a><a class="btn btn-ghost" href="#/resources">Manage resources</a><a class="btn btn-ghost" href="#/taxonomy">Categories &amp; lists</a></div></div>
    <div class="panel"><h2>Recent uploads</h2>${recent.length ? `<div class="tbl-wrap"><table><thead><tr><th>Title</th><th>Status</th><th>Views</th><th>Added</th><th></th></tr></thead><tbody>${recent.map(r => `<tr><td><span class="t">${esc(r.title)}</span></td><td><span class="st ${r.status === 'published' ? 'pub' : 'dr'}">${r.status}</span></td><td>${(STATS[r.id] || {}).v || 0}</td><td>${esc(A.date(r.added))}</td><td><a class="btn btn-ghost btn-sm" href="#/edit/${r.id}">Edit</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No resources yet. <a href="#/edit/new" style="color:var(--accent)">Add your first PDF</a>.</p>'}</div>`;
    try { const p = await fetch('../api.php?action=ping', { cache: 'no-store' }).then(r => r.json()); const w = Object.entries(p.writable).filter(x => !x[1]).map(x => x[0]);
      $('#srv').innerHTML = `<div class="status ${w.length ? 'bad' : 'ok'}"><i></i><div><b>${w.length ? 'Server needs attention' : 'Server ready — PDFs are served by Google Drive'}</b><br><span class="dim">PHP ${esc(p.php)} · ${p.curl ? 'link checker ready' : 'cURL missing (link checker limited)'} · Smart reader: ${p.apiKey ? 'on (API key set)' : 'off (optional — add a Drive API key in Categories &amp; lists → Site settings)'}${w.length ? '<br>Not writable: ' + esc(w.join(', ')) + ' — set these folders to permission 755.' : ''}</span></div></div>`;
    } catch (e) { $('#srv').innerHTML = '<div class="status bad"><i></i><div><b>api.php is not responding</b><br><span class="dim">Upload api.php to the site root and make sure PHP is enabled for this domain.</span></div></div>'; }
  }

  function resources() {
    view.innerHTML = `<div class="toolbar"><input type="search" id="fq" placeholder="Search title, author, keywords…" aria-label="Search"><select class="sel" id="fs"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select><select class="sel" id="fc">${sel(T().categories.map(c => c.name), '', 'All categories')}</select><a class="btn btn-solid" href="#/edit/new">+ Add</a></div><p class="count" id="cnt"></p><div id="list"></div>`;
    const draw = () => {
      const q = $('#fq').value.toLowerCase(), s = $('#fs').value, c = $('#fc').value;
      const rows = DB.resources.filter(r => (!s || r.status === s) && (!c || r.category === c) && (!q || [r.title, r.author, r.keywords, r.topic, (r.tags || []).join(' ')].join(' ').toLowerCase().includes(q))).sort((a, b) => new Date(b.added) - new Date(a.added));
      $('#cnt').textContent = rows.length + ' resource' + (rows.length === 1 ? '' : 's');
      $('#list').innerHTML = rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>Title</th><th>Status</th><th>Subject</th><th>Views</th><th>Downloads</th><th>Added</th><th>Actions</th></tr></thead><tbody>${rows.map(r => `<tr><td><span class="t">${esc(r.title)}${r.featured ? ' ★' : ''}</span><small class="dim">${esc(r.type || '')} ${esc(r.author || '')}</small></td><td><span class="st ${r.status === 'published' ? 'pub' : 'dr'}">${r.status}</span></td><td>${esc(r.subject || '—')}</td><td>${(STATS[r.id] || {}).v || 0}</td><td>${(STATS[r.id] || {}).d || 0}</td><td>${esc(A.date(r.added))}</td>
        <td><div class="row-actions"><a class="btn btn-ghost btn-sm" href="#/edit/${r.id}">Edit</a><a class="btn btn-ghost btn-sm" href="${esc(r.driveUrl || ('../' + r.file))}" target="_blank" rel="noopener">Drive</a>${r.status === 'published' ? `<a class="btn btn-ghost btn-sm" href="../read.html?r=${encodeURIComponent(r.slug)}" target="_blank" rel="noopener">View</a>` : ''}<button class="btn ${r.status === 'published' ? 'btn-ghost' : 'btn-solid'} btn-sm" data-a="status" data-id="${r.id}">${r.status === 'published' ? 'Unpublish' : 'Publish'}</button><button class="btn btn-ghost btn-sm" data-a="featured" data-id="${r.id}">${r.featured ? 'Unfeature' : 'Feature'}</button><button class="btn btn-danger btn-sm" data-a="del" data-id="${r.id}">Delete</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="panel">${A.empty('No resources match', 'Add a PDF or adjust the filters.')}</div>`;
    };
    ['fq', 'fs', 'fc'].forEach(i => $('#' + i).addEventListener('input', draw)); draw();
    view.onclick = async e => {
      const b = e.target.closest('button[data-a]'); if (!b) return; const r = byId(b.dataset.id), a = b.dataset.a;
      try {
        if (a === 'del') { if (!await A.confirm('Delete “' + r.title + '” from the library? (The PDF stays in your Google Drive.)', 'Delete')) return; await api('delete', { json: { id: r.id } }); note('Deleted.', 'ok'); }
        else { await api('toggle', { json: { id: r.id, field: a } }); note('Updated — live on the site.', 'ok'); }
        route();
      } catch (er) { note(er.message, 'err'); }
    };
  }

  const driveId = v => { v = (v || '').trim(); if (/^[\w-]{20,}$/.test(v)) return v; if (!/^https?:\/\//i.test(v) || /\/folders\//.test(v)) return ''; let u; try { u = new URL(v); } catch (e) { return ''; } if (!/(^|\.)(google\.com|googleusercontent\.com|googleapis\.com)$/.test(u.hostname)) return ''; let m = u.pathname.match(/\/d\/([\w-]{10,})/); if (m) return m[1]; const q = u.searchParams.get('id'); return q && /^[\w-]{10,}$/.test(q) ? q : ''; };
  const thumb = (id, w) => 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + (w || 600);
  async function shrink(file, max) {
    const bmp = await createImageBitmap(file).catch(() => null); if (!bmp) return file;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/webp', .82)); return blob && blob.size < file.size ? blob : file;
  }

  function edit(id) {
    const ex = id && id !== 'new' ? byId(id) : null; if (id && id !== 'new' && !ex) { location.hash = '#/resources'; return; }
    const r = ex || { language: 'English', allowDownload: true, status: 'draft', tags: [] }, t = T(), cats = t.categories, subs = (cats.find(c => c.name === r.category) || { subs: [] }).subs;
    const f = (k, l, o = {}) => `<div class="field${o.full ? ' full' : ''}"><label${o.req ? ' class="req"' : ''} for="${k}">${l}</label>${o.area ? `<textarea id="${k}" name="${k}" rows="${o.rows || 4}">${esc(r[k])}</textarea>` : `<input id="${k}" name="${k}" ${o.type ? 'type="' + o.type + '"' : ''} value="${esc(r[k])}" ${o.ph ? 'placeholder="' + o.ph + '"' : ''} ${o.list ? 'list="' + o.list + '"' : ''}>`}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}${o.req ? '<div class="err">This field is required.</div>' : ''}</div>`;
    const s = (k, l, list) => `<div class="field"><label for="${k}">${l}</label><select class="sel" style="width:100%" id="${k}" name="${k}">${sel(list, r[k])}</select></div>`;
    view.innerHTML = `<form id="rf" novalidate><div class="alert err" id="ferr" role="alert" hidden></div>
    <div class="panel"><h2><span class="step">A</span> Document information</h2><div class="form-grid">${f('title', 'Resource title', { req: 1, full: 1 })}${f('short', 'Short description', { full: 1, hint: 'Shown on cards.' })}${f('desc', 'Full description', { area: 1, full: 1, rows: 5 })}${f('language', 'Document language', { list: 'langs' })}<datalist id="langs"><option>English</option><option>Bangla</option><option>Arabic</option><option>Hindi</option></datalist>${f('author', 'Author name')}${f('publisher', 'Publisher')}${f('pubDate', 'Publication date', { type: 'date' })}${f('isbn', 'ISBN (optional)')}${f('edition', 'Edition (optional)')}</div></div>
    <div class="panel"><h2><span class="step">B</span> Academic classification</h2><div class="form-grid">${s('level', 'Education level', t.levels)}${s('class', 'Class / grade', t.classes)}${s('subject', 'Subject', t.subjects)}${s('board', 'Education board', t.boards)}
      <div class="field"><label for="category">Main category</label><select class="sel" style="width:100%" id="category" name="category">${sel(cats.map(c => c.name), r.category)}</select></div><div class="field"><label for="subcategory">Subcategory</label><select class="sel" style="width:100%" id="subcategory" name="subcategory">${sel(subs, r.subcategory)}</select></div>
      ${f('year', 'Academic year', { ph: 'e.g. 2026' })}${f('term', 'Semester / term')}${f('chapter', 'Chapter number (optional)')}${f('topic', 'Topic / chapter name')}</div></div>
    <div class="panel"><h2><span class="step">C</span> Resource classification</h2><div class="form-grid">${s('type', 'Resource type', t.types)}<div class="field"><label for="difficulty">Difficulty level</label><select class="sel" style="width:100%" id="difficulty" name="difficulty">${sel(['Beginner', 'Intermediate', 'Advanced'], r.difficulty, '—')}</select></div>${f('audience', 'Target audience')}
      <div class="field"><label for="tags">Tags / keywords</label><input id="tags" name="tags" value="${esc((r.tags || []).join(', '))}"><div class="hint">Separate with commas.</div></div>
      <div class="switch"><input type="checkbox" id="featured" name="featured"${r.featured ? ' checked' : ''}><label for="featured">Featured resource</label></div><div class="switch"><input type="checkbox" id="allowDownload" name="allowDownload"${r.allowDownload !== false ? ' checked' : ''}><label for="allowDownload">Show Download button (reading is always available)</label></div></div></div>
    <div class="panel"><h2><span class="step">D</span> PDF on Google Drive</h2>
      <div class="field" id="drvField"><label class="req" for="driveUrl">Public Google Drive link</label><div class="link-row"><input id="driveUrl" name="driveUrl" inputmode="url" autocomplete="off" placeholder="https://drive.google.com/file/d/…/view?usp=sharing" value="${esc(r.driveUrl || '')}"><button type="button" class="btn btn-ghost" id="chk">Check link</button></div>
        <div class="hint">In Google Drive: open the PDF → <b>Share</b> → General access → <b>Anyone with the link</b> (Viewer) → <b>Copy link</b>. Readers will then open and download it straight from Google — fast, and no load on this server.</div><div class="err" id="drverr">Please paste a valid Google Drive file link.</div>
        <div class="drive-check" id="dchk" hidden></div>${ex && ex.file && !ex.driveId ? '<div class="hint">This resource still uses an old uploaded file. Paste a Drive link to move it to Google Drive.</div>' : ''}</div>
      <div class="form-grid"><div class="field"><label for="sizeMB">File size in MB (optional)</label><input id="sizeMB" type="number" min="0" step="0.1" value="${r.size ? (r.size / 1048576).toFixed(1) : ''}" placeholder="auto-filled by Check link"></div><div class="field"><label for="pages">Number of pages (optional)</label><input id="pages" type="number" min="0" step="1" value="${r.pages || ''}"></div></div></div>
    <div class="panel"><h2><span class="step">E</span> Thumbnail / album photo</h2><p class="muted small" style="margin-bottom:1rem">Shown on the library card and as the preview when the link is shared on WhatsApp or Facebook.</p>
      <div class="modes" id="cmodes" role="radiogroup" aria-label="Thumbnail source">${[['auto', 'Auto', 'First page of the PDF'], ['drive', 'Drive image', 'Public image link'], ['url', 'Image URL', 'Any https image'], ['upload', 'Upload photo', 'From this device'], ['none', 'None', 'Generated cover']].map(m => `<label class="mode"><input type="radio" name="coverMode" value="${m[0]}"${(r.coverMode || 'auto') === m[0] ? ' checked' : ''}><span><b>${m[1]}</b><small>${m[2]}</small></span></label>`).join('')}</div>
      <div class="field" id="cvDrive" hidden><label for="cvDriveIn">Google Drive image link</label><input id="cvDriveIn" inputmode="url" placeholder="https://drive.google.com/file/d/…/view" value="${r.coverMode === 'drive' ? esc(r.coverInput) : ''}"><div class="hint">Upload the image to Drive, set sharing to “Anyone with the link”, paste the link here.</div></div>
      <div class="field" id="cvUrl" hidden><label for="cvUrlIn">Image URL</label><input id="cvUrlIn" inputmode="url" placeholder="https://example.com/cover.jpg" value="${r.coverMode === 'url' ? esc(r.coverInput) : ''}"></div>
      <div class="field" id="cvUp" hidden><label for="cvFile">Choose a photo</label><input id="cvFile" type="file" accept="image/jpeg,image/png,image/webp"><div class="hint">JPG, PNG or WebP. It is resized in your browser to a small WebP before saving.</div></div>
      <div class="cv-stage"><img id="cprev" class="cover-prev" alt="Thumbnail preview" hidden><span class="dim small" id="cnote"></span></div></div>
    <div class="panel"><h2><span class="step">F</span> SEO &amp; sharing</h2><div class="form-grid">${f('seoTitle', 'SEO title')}${f('slug', 'Custom URL slug', { hint: 'Share link: ' + location.origin + '/r/<span id="sp">' + esc(r.slug || '') + '</span>.html' })}${f('seoDesc', 'SEO description', { area: 1, full: 1, rows: 2 })}${f('keywords', 'Search keywords', { full: 1 })}</div></div>
    <div class="prog-wrap" id="prog" hidden><div class="bar-prog"><i></i></div><small id="progTxt"></small></div>
    <div class="sticky-actions"><a class="btn btn-ghost" href="#/resources">Cancel</a><button class="btn btn-ghost" type="submit" data-s="draft">Save as draft</button><button class="btn btn-solid" type="submit" data-s="published">${ex && ex.status === 'published' ? 'Save changes' : 'Publish now'}</button></div></form>`;

    let coverFile = null, status = r.status, slugTouched = !!r.slug, meta = { size: r.size || 0, name: '' };
    const mode = () => (fm0().elements.coverMode.value || 'auto'), fm0 = () => $('#rf');
    const setNote = (t, cls) => { const d = $('#dchk'); d.hidden = !t; d.className = 'drive-check ' + (cls || ''); d.innerHTML = t || ''; };
    const preview = () => {
      const m = mode(), img = $('#cprev'), note = $('#cnote'); $('#cvDrive').hidden = m !== 'drive'; $('#cvUrl').hidden = m !== 'url'; $('#cvUp').hidden = m !== 'upload'; let src = '', t = '';
      if (m === 'auto') { const id = driveId($('#driveUrl').value); src = id ? thumb(id) : ''; t = id ? 'Using the first page of your PDF.' : 'Paste the PDF link above to preview the first page.'; }
      else if (m === 'drive') { const id = driveId($('#cvDriveIn').value); src = id ? thumb(id) : ''; t = id ? '' : 'Paste a public Drive image link.'; }
      else if (m === 'url') { const u = $('#cvUrlIn').value.trim(); src = /^https:\/\//i.test(u) ? u : ''; t = src ? '' : 'Paste an https:// image address.'; }
      else if (m === 'upload') { src = coverFile ? URL.createObjectURL(coverFile) : (r.coverMode === 'upload' && r.cover ? '../' + r.cover : ''); t = src ? '' : 'Choose a photo from your device.'; }
      else t = 'A coloured cover with the title will be generated.';
      note.textContent = t; img.hidden = !src; if (src) { img.onerror = () => { img.hidden = true; note.textContent = 'Could not load this image. If it is on Drive, check it is shared with “Anyone with the link”.'; }; img.referrerPolicy = 'no-referrer'; img.src = src; }
    };
    $('#cmodes').addEventListener('change', preview); ['driveUrl', 'cvDriveIn', 'cvUrlIn'].forEach(i => $('#' + i).addEventListener('input', () => { if (i === 'driveUrl') { $('#drvField').classList.remove('invalid'); setNote(''); } preview(); }));
    $('#cvFile').onchange = async () => { const f = $('#cvFile').files[0]; if (!f) { coverFile = null; return preview(); } if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { note('Please choose a JPG, PNG or WebP image.', 'err'); $('#cvFile').value = ''; coverFile = null; return preview(); } coverFile = await shrink(f, 900); preview(); };
    $('#chk').onclick = async () => {
      const v = $('#driveUrl').value.trim(), id = driveId(v); if (!id) { $('#drvField').classList.add('invalid'); setNote(''); return; }
      const b = $('#chk'); b.disabled = true; b.textContent = 'Checking…'; setNote('Contacting Google Drive…');
      try { const d = await api('inspect', { json: { url: v } }); let c = 'warn', t = esc(d.note || '');
        if (d.public === true && d.isPdf) { c = 'ok'; t = '✔ ' + t + (d.name ? ' <b>' + esc(d.name) + '</b>' : '') + (d.size ? ' · ' + A.size(d.size) : ''); }
        else if (d.public === false || d.isPdf === false) c = 'err';
        if (d.size) { meta.size = d.size; $('#sizeMB').value = (d.size / 1048576).toFixed(1); }
        if (d.name) { meta.name = d.name; if (!$('#title').value.trim()) { $('#title').value = d.name.replace(/\.pdf$/i, '').replace(/[_]+/g, ' '); $('#title').dispatchEvent(new Event('input')); } }
        setNote(t, c); preview();
      } catch (e) { setNote(esc(e.message), 'err'); } b.disabled = false; b.textContent = 'Check link';
    };
    preview();
    $('#title').oninput = () => { $('#title').closest('.field').classList.toggle('invalid', !$('#title').value.trim()); if (!slugTouched) { $('#slug').value = A.slugify($('#title').value); $('#sp').textContent = $('#slug').value; } };
    $('#slug').oninput = () => { slugTouched = true; $('#sp').textContent = A.slugify($('#slug').value); };
    $('#category').onchange = () => { $('#subcategory').innerHTML = sel((cats.find(c => c.name === $('#category').value) || { subs: [] }).subs, '', '— None —'); };
    $('#rf').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (b) status = b.dataset.s; });
    $('#rf').addEventListener('submit', async e => {
      e.preventDefault(); const fm = e.target, v = k => fm.elements[k].value.trim(), errs = [];
      if (!v('title')) { $('#title').closest('.field').classList.add('invalid'); errs.push('Resource title is required.'); }
      const did = driveId(v('driveUrl')); if ((!ex || v('driveUrl')) && !did) { $('#drvField').classList.add('invalid'); errs.push('A valid public Google Drive link is required.'); }
      if (!ex && !did && !errs.length) errs.push('A Google Drive link is required.');
      if (errs.length) { const b = $('#ferr'); b.hidden = false; b.textContent = errs.join(' '); b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      $('#ferr').hidden = true; const btns = fm.querySelectorAll('button[type=submit]'); btns.forEach(b => b.disabled = true);
      const P = $('#prog'); P.hidden = false; $('#prog i').style.width = '30%'; $('#progTxt').textContent = 'Saving…';
      try {
        const body = { resource: { id: ex ? ex.id : '', title: v('title'), slug: v('slug'), driveUrl: v('driveUrl'), size: Math.round((parseFloat(v('sizeMB')) || 0) * 1048576), pages: parseInt(v('pages'), 10) || 0, coverMode: fm.elements.coverMode.value, coverInput: fm.elements.coverMode.value === 'drive' ? v('cvDriveIn') : fm.elements.coverMode.value === 'url' ? v('cvUrlIn') : '', short: v('short'), desc: fm.elements.desc.value.trim(), language: v('language'), author: v('author'), publisher: v('publisher'), pubDate: v('pubDate'), isbn: v('isbn'), edition: v('edition'), level: v('level'), class: v('class'), subject: v('subject'), board: v('board'), category: v('category'), subcategory: v('subcategory'), year: v('year'), term: v('term'), chapter: v('chapter'), topic: v('topic'), type: v('type'), difficulty: v('difficulty'), audience: v('audience'), tags: v('tags').split(/[,،\n]+/).map(x => x.trim()).filter(Boolean), featured: fm.elements.featured.checked, allowDownload: fm.elements.allowDownload.checked, status, seoTitle: v('seoTitle'), seoDesc: v('seoDesc'), keywords: v('keywords') } };
        if (body.resource.coverMode === 'upload' && coverFile) { const fd = new FormData(); fd.append('file', coverFile, 'cover.' + (coverFile.type === 'image/webp' ? 'webp' : coverFile.type === 'image/png' ? 'png' : 'jpg')); $('#progTxt').textContent = 'Uploading thumbnail…'; body.resource.coverUpload = (await api('cover', { form: fd })).path; $('#prog i').style.width = '65%'; }
        $('#progTxt').textContent = 'Saving…'; await api('save', { json: body });
        $('#prog i').style.width = '100%'; note(status === 'published' ? 'Published — it is live on the site now.' : 'Saved as draft.', 'ok'); location.hash = '#/resources';
      } catch (er) { console.error(er); const b = $('#ferr'); b.hidden = false; b.textContent = er.message; b.scrollIntoView({ behavior: 'smooth', block: 'center' }); P.hidden = true; btns.forEach(b => b.disabled = false); }
    });
  }

  const lists = { subjects: ['Subjects', 'subject'], levels: ['Education levels', 'level'], classes: ['Classes', 'class'], boards: ['Boards', 'board'], types: ['Resource types', 'type'] };
  const used = (f, n) => DB.resources.filter(r => r[f] === n).length;
  function taxonomy() {
    const t = T(), s = DB.site, saveTx = async (renames, msg) => { try { await api('taxonomy', { json: { taxonomy: t, renames: renames || [] } }); note(msg || 'Saved.', 'ok'); route(); } catch (e) { note(e.message, 'err'); } };
    view.innerHTML = `<div class="panel"><h2>Site settings</h2><form id="sf" class="form-grid"><div class="field"><label for="sn">Site name</label><input id="sn" value="${esc(s.name)}"></div><div class="field"><label for="se">Contact email</label><input id="se" type="email" value="${esc(s.contactEmail)}"></div><div class="field full"><label for="st">Tagline</label><input id="st" value="${esc(s.tagline)}"></div><div class="field full"><label for="sk">Google Drive API key (optional — turns on the Smart reader)</label><input id="sk" value="${esc(s.driveApiKey || '')}" autocomplete="off" spellcheck="false" placeholder="AIza…"><div class="hint">Free from Google Cloud Console → enable “Google Drive API” → Credentials → API key. Restrict it to the Drive API and to your website address. Leave empty to use the Google viewer only.</div></div><div class="full"><button class="btn btn-solid" type="submit">Save settings</button></div></form></div>
    <div class="panel"><h2>Categories &amp; subcategories</h2><form class="inline-form" id="addcat"><input id="newcat" placeholder="New category" required><button class="btn btn-solid" type="submit">Add category</button></form>
    ${t.categories.map((c, i) => `<div class="panel" style="margin:1rem 0 0;background:var(--bg2)"><h2>${esc(c.name)} <small class="dim">· ${used('category', c.name)} resources</small></h2><div class="row-actions"><button class="btn btn-ghost btn-sm" data-a="rencat" data-i="${i}">Rename</button><button class="btn btn-danger btn-sm" data-a="delcat" data-i="${i}">Delete</button></div>
      <div class="pills" style="margin:.9rem 0">${c.subs.map((x, j) => `<span class="pill">${esc(x)}<button class="x" data-a="delsub" data-i="${i}" data-j="${j}" aria-label="Remove ${esc(x)}">✕</button></span>`).join('') || '<span class="dim small">No subcategories</span>'}</div>
      <form class="inline-form" data-a="addsub" data-i="${i}"><input placeholder="New subcategory" required><button class="btn btn-ghost btn-sm">Add</button></form></div>`).join('')}</div>
    ${Object.entries(lists).map(([k, [l, field]]) => `<div class="panel"><h2>${l}</h2><div class="pills" style="margin-bottom:1rem">${t[k].map((x, j) => `<span class="pill">${esc(x)}<small>${used(field, x)}</small><button class="x" style="color:var(--accent)" data-a="ren" data-k="${k}" data-j="${j}" aria-label="Rename">✎</button><button class="x" data-a="del" data-k="${k}" data-j="${j}" aria-label="Delete ${esc(x)}">✕</button></span>`).join('') || '<span class="dim small">Empty</span>'}</div><form class="inline-form" data-a="add" data-k="${k}"><input placeholder="Add to ${l.toLowerCase()}" required><button class="btn btn-ghost btn-sm">Add</button></form></div>`).join('')}`;
    $('#sf').onsubmit = async e => { e.preventDefault(); try { await api('taxonomy', { json: { site: { name: $('#sn').value, tagline: $('#st').value, contactEmail: $('#se').value, driveApiKey: $('#sk').value } } }); note('Settings saved.', 'ok'); } catch (er) { note(er.message, 'err'); } };
    $('#addcat').onsubmit = e => { e.preventDefault(); const n = $('#newcat').value.trim(); if (!n || t.categories.some(c => c.name === n)) return note('That category already exists.', 'err'); t.categories.push({ name: n, subs: [] }); saveTx(); };
    view.onsubmit = e => { const f = e.target; if (!f.dataset.a) return; e.preventDefault(); const n = f.querySelector('input').value.trim(); if (!n) return; if (f.dataset.a === 'addsub') { const c = t.categories[f.dataset.i]; if (!c.subs.includes(n)) c.subs.push(n); } else { const l = t[f.dataset.k]; if (l.includes(n)) return note('Already exists.', 'err'); l.push(n); } saveTx(); };
    view.onclick = async e => {
      const b = e.target.closest('button[data-a]'); if (!b) return; const a = b.dataset.a, i = +b.dataset.i, j = +b.dataset.j;
      if (a === 'delcat') { const c = t.categories[i]; if (used('category', c.name)) return note('Used by ' + used('category', c.name) + ' resource(s). Change their category first.', 'err'); if (!await A.confirm('Delete category “' + c.name + '”?', 'Delete')) return; t.categories.splice(i, 1); saveTx(); }
      else if (a === 'rencat') { const c = t.categories[i], n = (prompt('Rename category', c.name) || '').trim(); if (!n || n === c.name) return; const old = c.name; c.name = n; saveTx([{ field: 'category', from: old, to: n }]); }
      else if (a === 'delsub') { const c = t.categories[i], x = c.subs[j]; if (DB.resources.some(r => r.category === c.name && r.subcategory === x)) return note('Subcategory is in use.', 'err'); c.subs.splice(j, 1); saveTx(); }
      else if (a === 'del') { const k = b.dataset.k, x = t[k][j]; if (used(lists[k][1], x)) return note('In use by ' + used(lists[k][1], x) + ' resource(s). Change them first.', 'err'); if (!await A.confirm('Delete “' + x + '”?', 'Delete')) return; t[k].splice(j, 1); saveTx(); }
      else if (a === 'ren') { const k = b.dataset.k, x = t[k][j], n = (prompt('Rename', x) || '').trim(); if (!n || n === x) return; t[k][j] = n; saveTx([{ field: lists[k][1], from: x, to: n }]); }
    };
  }

  function messages() {
    const ms = DB.messages;
    view.innerHTML = ms.length ? ms.map(m => `<div class="panel"><h2>${esc(m.name)} <small class="dim">&lt;${esc(m.email)}&gt; · ${esc(A.date(m.at))}</small>${m.read ? '' : ' <span class="st dr">new</span>'}</h2><p class="msg">${esc(m.message)}</p><div class="row-actions" style="margin-top:1rem"><a class="btn btn-ghost btn-sm" href="mailto:${esc(m.email)}">Reply</a>${m.read ? '' : `<button class="btn btn-ghost btn-sm" data-a="read" data-id="${m.id}">Mark read</button>`}<button class="btn btn-danger btn-sm" data-a="del" data-id="${m.id}">Delete</button></div></div>`).join('') : '<div class="panel"><p class="muted">No messages yet.</p></div>';
    view.onclick = async e => { const b = e.target.closest('button[data-a]'); if (!b) return; if (b.dataset.a === 'del' && !await A.confirm('Delete this message?', 'Delete')) return; try { await api('message', { json: { id: b.dataset.id, op: b.dataset.a } }); route(); } catch (er) { note(er.message, 'err'); } };
  }
  route();
})();
