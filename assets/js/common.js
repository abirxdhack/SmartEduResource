//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  'use strict';
  const A = window.A360 = {};
  A.root = document.body.dataset.root || '';
  A.name = 'Smart Educational Resource';
  A.$ = (s, r = document) => r.querySelector(s); A.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  A.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.size = b => !b ? '' : b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : b < 1073741824 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1073741824).toFixed(2) + ' GB';
  A.date = d => { const x = new Date(d); return !d || isNaN(x) ? '' : x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
  A.slugify = s => (s || '').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'resource';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; A.reduced = reduced;

  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    doc: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', up: '<path d="m5 12 7-7 7 7M12 19V5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    full: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    arrow: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>', arrowr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>', bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    call: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L8 14.2 3 9.3l6.9-1z"/>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    tg: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    wa: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    li: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    ig: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    tw: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
    yt: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    gh: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>', plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>', mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>', menu: '<path d="M4 8h16M4 16h16"/>'
  };
  A.i = (n, c) => `<svg class="i${c ? ' ' + c : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  A.hydrate = (root = document) => { A.$$('[data-ico]', root).forEach(e => { e.innerHTML = A.i(e.dataset.ico); e.removeAttribute('data-ico'); }); A.$$('[data-theme-menu]:empty', root).forEach(setupTheme); };
  A.ico = new Proxy({}, { get: (_, k) => A.i(k) });
  A.toast = (m, t) => { let b = A.$('#toasts'); if (!b) { b = document.createElement('div'); b.id = 'toasts'; b.className = 'toasts'; b.setAttribute('role', 'status'); document.body.appendChild(b); } const e = document.createElement('div'); e.className = 'toast ' + (t || ''); e.innerHTML = A.i(t === 'err' ? 'info' : 'check') + '<span></span>'; e.lastChild.textContent = m; b.appendChild(e); setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 350); }, 4200); };

  const mode = () => { try { return localStorage.getItem('a360-theme') || 'system'; } catch (e) { return 'system'; } };
  const resolve = m => m === 'light' || (m === 'system' && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  A.theme = () => document.documentElement.dataset.theme;
  A.setMode = m => {
    try { localStorage.setItem('a360-theme', m); } catch (e) {}
    const n = resolve(m), root = document.documentElement; if (n === A.theme()) return;
    const apply = () => { root.dataset.theme = n; const t = A.$('meta[name=theme-color]'); if (t) t.content = n === 'light' ? '#faf8f5' : '#06141a'; };
    root.classList.add('theme-swap'); const done = () => setTimeout(() => root.classList.remove('theme-swap'), 80);
    if (document.startViewTransition && !reduced) { try { document.startViewTransition(apply).finished.then(done, done); return; } catch (e) {} }
    apply(); done();
  };
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (mode() === 'system') A.setMode('system'); });
  const OPT = [['light', 'Light', 'sun'], ['dark', 'Dark', 'moon'], ['system', 'System', 'monitor']];
  function setupTheme(w) {
    const icon = () => (OPT.find(o => o[0] === mode()) || OPT[2])[2]; let menu = null;
    w.className = 'theme-wrap'; w.innerHTML = `<button class="ibtn" type="button" aria-label="Theme" aria-haspopup="true" aria-expanded="false">${A.i(icon())}</button>`;
    const b = w.firstChild, close = () => { if (menu) menu.remove(); menu = null; b.setAttribute('aria-expanded', 'false'); };
    b.onclick = e => { e.stopPropagation(); if (menu) return close(); w.insertAdjacentHTML('beforeend', `<div class="theme-menu" role="menu">${OPT.map(o => `<button type="button" role="menuitem" data-m="${o[0]}" class="${mode() === o[0] ? 'on' : ''}">${A.i(o[2])} ${o[1]}</button>`).join('')}</div>`); menu = w.lastChild; b.setAttribute('aria-expanded', 'true');
      menu.onclick = ev => { const o = ev.target.closest('[data-m]'); if (!o) return; A.setMode(o.dataset.m); b.innerHTML = A.i(icon()); close(); }; };
    document.addEventListener('click', ev => { if (!w.contains(ev.target)) close(); }); document.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
  }

  A.driveView = r => r.driveId ? `https://drive.google.com/file/d/${r.driveId}/preview` : '';
  A.driveOpen = r => r.driveId ? `https://drive.google.com/file/d/${r.driveId}/view` : '';
  A.driveDl = r => r.driveId ? `https://drive.usercontent.google.com/download?id=${r.driveId}&export=download&confirm=t` : (r.file ? A.root + r.file : '');
  A.coverSrc = r => !r.cover ? '' : /^https?:/.test(r.cover) ? r.cover : A.root + r.cover;

  A.data = async function () {
    if (A._d) return A._d;
    const [r, s] = await Promise.all([fetch(A.root + 'data/resources.json', { cache: 'no-cache' }), fetch(A.root + 'data/stats.json', { cache: 'no-cache' }).catch(() => null)]);
    if (!r.ok) throw new Error('data');
    const d = await r.json(); let st = {}; try { if (s && s.ok) st = await s.json(); } catch (e) {}
    d.resources.forEach(x => { const t = st[x.id] || {}; x.views = t.v || 0; x.downloads = t.d || 0; });
    return (A._d = d);
  };
  A.hit = (id, type) => { try { const u = A.root + 'api.php?action=hit&type=' + type + '&id=' + id; navigator.sendBeacon ? navigator.sendBeacon(u) : fetch(u, { method: 'POST', keepalive: true }); } catch (e) {} };
  A.resUrl = r => A.root + 'read.html?r=' + encodeURIComponent(r.slug);
  A.shareUrl = r => new URL(A.root + 'r/' + encodeURIComponent(r.slug) + '.html', location.href).href;
  A.hue = r => { let h = 0; const s = (r.subject || r.category || r.title || '') + ''; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return [18, 28, 190, 205, 265, 330, 150, 45][h % 8]; };
  A.art = r => `<div class="art"><small>${A.esc(r.type || 'PDF Document')}</small><b>${A.esc(r.title || r.subject || 'PDF')}</b></div>`;
  A.img = r => { const s = A.coverSrc(r); return s ? `<img data-cv src="${A.esc(s)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''; };
  A.dlLink = (r, cls, inner) => { const u = r.allowDownload !== false ? A.driveDl(r) : ''; return u ? `<a class="${cls}" href="${A.esc(u)}" data-dl="${A.esc(r.id)}" target="_blank" rel="noopener" aria-label="Download ${A.esc(r.title)}" title="Download">${inner}</a>` : ''; };
  A.card = function (r) {
    const u = A.esc(A.resUrl(r)), tags = [r.subject, r.class, r.board, r.year].filter(Boolean).slice(0, 3).map(x => `<span>${A.esc(x)}</span>`).join('');
    return `<article class="card rv"><a class="cover" href="${u}" style="--h:${A.hue(r)}" tabindex="-1" aria-hidden="true">${A.img(r)}${A.art(r)}${r.type ? `<span class="tag">${A.esc(r.type)}</span>` : ''}${r.featured ? `<span class="tag star">${A.i('star')}</span>` : ''}<span class="peek">${A.i('book')} Read now</span></a>
      <div class="cbody"><h3 class="ctitle"><a href="${u}">${A.esc(r.title)}</a></h3><p class="cdesc">${A.esc(r.short || (r.desc || '').slice(0, 130) || r.category || '')}</p><div class="cmeta">${tags}</div></div>
      <div class="cfoot"><span title="Downloads">${A.i('download')}${r.downloads || 0}</span>${r.size ? `<span>${A.esc(A.size(r.size))}</span>` : ''}<span class="sp"></span>${A.dlLink(r, 'ibtn sm', A.i('download'))}<button class="ibtn sm" type="button" data-share data-url="${A.esc(A.shareUrl(r))}" data-title="${A.esc(r.title)}" aria-label="Share ${A.esc(r.title)}">${A.i('share')}</button><a class="btn btn-solid btn-sm" href="${u}">Read</a></div></article>`;
  };

  document.addEventListener('error', e => { const t = e.target; if (t && t.matches && t.matches('img[data-cv]')) t.remove(); }, true);
  document.addEventListener('load', e => { const t = e.target; if (t && t.matches && t.matches('img[data-cv]')) t.classList.add('ok'); }, true);
  A.empty = (t, m) => `<div class="empty">${A.i('doc')}<h3>${A.esc(t || 'Nothing found')}</h3><p>${A.esc(m || 'Try another keyword or clear the filters.')}</p></div>`;

  const R = A.root, here = location.pathname.split('/').pop() || 'index.html', onHome = here === 'index.html';
  const links = [['Home', R + 'index.html#home', 'home'], ['Library', R + 'index.html#library', 'library'], ['Categories', R + 'index.html#categories', 'categories'], ['About', R + 'about.html', 'about.html'], ['Dev Info', '#developer', 'developer'], ['Contact', R + 'contact.html', 'contact.html']];
  A.logo = (cls = '') => `<a class="logo ${cls}" href="${R}index.html" aria-label="${A.name} — home"><span class="nm">${A.name}</span><span class="dot">.</span></a>`;
  const hd = document.getElementById('site-header');
  if (hd) {
    const nav = (c) => links.map(l => `<a href="${l[1]}" data-id="${l[2]}" class="${l[2] === here ? 'on' : ''}">${l[0]}</a>`).join('');
    hd.outerHTML = `<div class="progress" id="progress"></div><header class="hdr" id="hdr"><div class="page-x">${A.logo()}<nav class="nav" aria-label="Main">${nav()}</nav>
      <div class="hdr-act"><a class="btn btn-line cta" href="${R}index.html#library">Browse Library ${A.i('arrow')}</a><div data-theme-menu></div>
      <button class="ibtn burger" id="burger" type="button" aria-label="Menu" aria-expanded="false"><span class="bars"><i></i><i></i><i></i></span></button></div></div><nav class="mnav" id="mnav" aria-label="Mobile">${nav()}</nav></header>`;
    const h = A.$('#hdr'), p = A.$('#progress'), mn = A.$('#mnav'), bg = A.$('#burger'); let lastY = 0, hidden = false, active = '';
    const setMenu = o => { mn.classList.toggle('open', o); bg.setAttribute('aria-expanded', o); if (o) { h.classList.add('scrolled'); h.classList.remove('hide'); } };
    bg.onclick = () => setMenu(!mn.classList.contains('open')); mn.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    const secs = ['home', 'library', 'categories', 'developer'];
    const onS = () => {
      const y = scrollY, open = mn.classList.contains('open'); h.classList.toggle('scrolled', y > 24 || open); const d = y - lastY;
      let nh = hidden; if (!open) { if (y > 120 && d > 6) nh = true; else if (d < -4) nh = false; } else nh = false; if (nh !== hidden) { hidden = nh; h.classList.toggle('hide', hidden); } lastY = y;
      const m = document.documentElement.scrollHeight - innerHeight; p.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, y / m) : 0) + ')';
      if (onHome) { let cur = 'home'; secs.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top + y <= y + 160) cur = id; }); if (cur !== active) { active = cur; A.$$('.nav a,.mnav a', h).forEach(a => a.classList.toggle('on', a.dataset.id === cur)); } }
    };
    addEventListener('scroll', onS, { passive: true }); onS(); addEventListener('resize', () => { if (innerWidth >= 1024) setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const q = A.$('#q'); if (q) { e.preventDefault(); q.scrollIntoView({ block: 'center' }); q.focus({ preventScroll: true }); } } });
  }

  const SOC = [['li', 'LinkedIn', 'https://linkedin.com/in/abirxdhack'], ['ig', 'Instagram', 'https://instagram.com/abirxdhackz'], ['fb', 'Facebook', 'https://facebook.com/abirxdhackz'], ['tw', 'X (Twitter)', 'https://x.com/abirxdhackz'], ['yt', 'YouTube', 'https://youtube.com/@abirxdhackz'], ['gh', 'GitHub', 'https://github.com/abirxdhack'], ['tg', 'Telegram', 'https://t.me/abirxdhackz'], ['wa', 'WhatsApp', 'https://wa.me/8801963818285'], ['mail', 'Email', 'mailto:abirxdhackz.info.me@gmail.com']];
  const socialsFor = L => L.map(s => `<a class="ring" href="${s[2]}" target="_blank" rel="noopener noreferrer" aria-label="${s[1]}" title="${s[1]}">${A.i(s[0])}</a>`).join('');
  const socials = socialsFor(SOC), socialsFoot = socialsFor(SOC.slice(0, 8));
  const TECH = [['html5', 'HTML5'], ['css', 'CSS3'], ['javascript', 'JavaScript'], ['php', 'PHP'], ['python', 'Python'], ['git', 'Git'], ['github', 'GitHub'], ['linux', 'Linux']];
  const dev = () => `<section class="dev" id="developer" aria-labelledby="devTtl"><div class="wrap"><div class="dev-grid">
    <figure class="dev-photo rv"><div class="frame"><img src="${R}assets/images/developer.webp" srcset="${R}assets/images/developer-sm.webp 520w, ${R}assets/images/developer.webp 900w" sizes="(max-width:900px) 21rem, 26rem" width="900" height="1200" alt="Abir Arafat Chawdhury speaking at a podium" loading="lazy" decoding="async"><figcaption class="cap"><b>Abir</b><span>Student Developer · Speaker</span></figcaption></div><span class="dev-badge">${A.i('mic')} Public Speaker</span></figure>
    <div class="dev-body"><p class="kicker rv">${A.i('code')} Dev Info</p><h2 class="h2 rv" id="devTtl">Meet the <em>developer</em></h2><p class="dev-name rv">Abir Arafat Chawdhury</p><p class="dev-role rv">Student Developer · Self-Taught Programmer · Aspiring Full Stack Engineer</p>
      <p class="bio rv">I built ${A.name} so that students can find, read and share study material without friction — one organised library, instant reading and one-click downloads. I'm a self-taught programmer from Faridpur, Bangladesh.</p><p class="quote rv">“Turning ideas into reality through code.”</p>
      <div class="stackrow rv" aria-label="Tech stack">${TECH.map(t => `<span><img src="${R}assets/icons/tech/${t[0]}.svg" alt="" width="24" height="24" loading="lazy">${t[1]}</span>`).join('')}</div>
      <div class="facts rv"><div><small>Based in</small><b>Faridpur, Bangladesh</b></div><div><small>Focus</small><b>Full-stack web development</b></div><div><small>Built with</small><b>HTML · CSS · JavaScript · PHP</b></div><div><small>Status</small><b>Open to internships &amp; freelance</b></div></div>
      <div class="dev-cta rv"><a class="btn btn-solid" href="https://abirxdhack.github.io/autobiography-/" target="_blank" rel="noopener">View my portfolio ${A.i('arrow')}</a><a class="btn btn-ghost" href="https://wa.me/8801963818285" target="_blank" rel="noopener">${A.i('wa')} Hire me</a></div><div class="socials rv">${socials}</div></div></div></div></section>`;
  const QL = [['Home', 'index.html#home'], ['Library', 'index.html#library'], ['Categories', 'index.html#categories'], ['Subjects', 'index.html#subjects'], ['About', 'about.html'], ['Contact', 'contact.html'], ['Privacy', 'privacy.html'], ['Terms', 'terms.html']];
  const ft = document.getElementById('site-footer');
  if (ft) {
    const noDev = document.body.dataset.dev === 'off';
    ft.outerHTML = (noDev ? '' : dev()) + `<footer class="foot" id="contactFoot"><div class="page-x" style="max-width:1400px;margin-inline:auto">
      <div class="foot-top"><div class="plane" aria-hidden="true"><svg width="74" height="46" viewBox="0 0 74 46" fill="none"><path d="M5 31L62 4L45 40L34 25L5 31Z" stroke="currentColor" stroke-width="2"/><path d="M34 25L62 4" stroke="currentColor" stroke-width="2"/><path d="M4 4C10 5 15 8 19 13" stroke="currentColor" stroke-width="2"/></svg></div>
        <div style="min-width:0"><p class="ttl">Learn anything. Share everything.</p><p class="sub">Free study material for every learner — search the whole library in a second.</p></div>
        <form class="foot-form" action="${R}index.html" method="get" role="search"><input type="search" name="q" required placeholder="Search books, notes, model tests…" aria-label="Search the library"><button type="submit">Search</button></form></div>
      <div class="foot-grid"><div><h3>Let's Connect</h3><p class="blurb">Questions, requests or feedback — always happy to hear from you.</p><div class="socials">${socialsFoot}</div></div>
        <div><h3>Quick Links</h3><ul class="qlinks">${QL.map(l => `<li><a href="${R}${l[1]}">${l[0]}</a></li>`).join('')}</ul></div>
        <div><h3>Get In Touch</h3><ul class="contact-list"><li>${A.i('mail')}<a href="mailto:abirxdhackz.info.me@gmail.com">abirxdhackz.info.me@gmail.com</a></li><li>${A.i('call')}<a href="tel:+8801963818285">+880 1963 818285</a></li><li>${A.i('pin')}<span>Faridpur, Bangladesh</span></li></ul></div>
        <div class="sign" aria-label="Abir signature"><div class="nm">Abir</div><div class="sl"></div></div></div>
      <p class="copy">© ${new Date().getFullYear()} ${A.name}. All Rights Reserved. · Built by <a href="https://abirxdhack.github.io/autobiography-/" target="_blank" rel="noopener">Abir Arafat Chawdhury</a></p></div></footer>
      <button class="totop" id="toTop" type="button" aria-label="Back to top">${A.i('up')}</button>`;
    const tt = A.$('#toTop'); tt.onclick = () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    const f = () => tt.classList.toggle('on', scrollY > 520); addEventListener('scroll', f, { passive: true }); f();
  }

  document.body.insertAdjacentHTML('beforeend', `<dialog id="shareDlg" class="dlg"><div class="dlg-head"><h3>Share this resource</h3><button class="ibtn sm" type="button" data-close aria-label="Close">${A.i('x')}</button></div><p class="muted small clamp1" id="shName"></p>
    <div class="copy-row"><input id="shUrl" readonly aria-label="Link"><button type="button" class="btn btn-solid btn-sm" id="shCopy">${A.i('copy')} Copy</button></div>
    <div class="share-grid"><a class="btn btn-ghost" id="shWa" target="_blank" rel="noopener">${A.i('wa')} WhatsApp</a><a class="btn btn-ghost" id="shFb" target="_blank" rel="noopener">${A.i('fb')} Facebook</a><a class="btn btn-ghost" id="shTg" target="_blank" rel="noopener">${A.i('tg')} Telegram</a><button type="button" class="btn btn-ghost" id="shNat" hidden>${A.i('share')} More…</button></div></dialog>
    <dialog id="cfmDlg" class="dlg"><h3>Please confirm</h3><p id="cfmMsg" class="muted"></p><div class="dlg-actions"><button type="button" class="btn btn-ghost" id="cfmNo">Cancel</button><button type="button" class="btn btn-danger" id="cfmYes">Confirm</button></div></dialog>`);
  A.confirm = (m, y) => new Promise(res => { const d = A.$('#cfmDlg'); A.$('#cfmMsg').textContent = m; A.$('#cfmYes').textContent = y || 'Confirm'; const f = v => { d.close(); res(v); }; A.$('#cfmYes').onclick = () => f(true); A.$('#cfmNo').onclick = () => f(false); d.showModal(); });
  A.share = (url, title) => {
    if (navigator.share && matchMedia('(pointer:coarse)').matches) { navigator.share({ title, url }).catch(() => {}); return; }
    A.$('#shName').textContent = title; A.$('#shUrl').value = url; const u = encodeURIComponent(url), t = encodeURIComponent(title);
    A.$('#shWa').href = 'https://wa.me/?text=' + t + '%20' + u; A.$('#shFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + u; A.$('#shTg').href = 'https://t.me/share/url?url=' + u + '&text=' + t;
    const n = A.$('#shNat'); n.hidden = !navigator.share; n.onclick = () => navigator.share({ title, url }).catch(() => {}); A.$('#shareDlg').showModal();
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-share]'); if (b) { e.preventDefault(); A.share(b.dataset.url || location.href, b.dataset.title || document.title); }
    const c = e.target.closest('[data-close]'); if (c) c.closest('dialog').close();
    const d = e.target.closest('[data-dl]'); if (d) { A.hit(d.dataset.dl, 'd'); A.toast('Download started — straight from Google Drive.', 'ok'); }
    const a = e.target.closest('a[href*="#"]'); if (a && A.$('#home') && a.pathname === location.pathname && a.hash && A.$(a.hash)) { e.preventDefault(); A.$(a.hash).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', a.hash); }
  });
  A.$('#shCopy').onclick = async () => { const i = A.$('#shUrl'); try { await navigator.clipboard.writeText(i.value); } catch (e) { i.select(); document.execCommand('copy'); } A.toast('Link copied', 'ok'); };
  A.$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -40px 0px' }) : null;
  A.reveal = (root = document) => A.$$('.rv:not(.in)', root).forEach((e, i) => { e.style.setProperty('--d', Math.min(i % 4, 3) * .07 + 's'); io ? io.observe(e) : e.classList.add('in'); });
  A.hydrate(); A.reveal();
  A.count = el => { const to = +el.dataset.to || 0, t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
})();
