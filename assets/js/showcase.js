//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  'use strict';
  const A = window.A360; if (!A) return;
  const $ = A.$, MS = 5500, SPEED = 38;
  A.showcase = function (all) {
    const sec = $('#showcase'); if (!sec) return;
    const byNew = (a, b) => new Date(b.added) - new Date(a.added);
    const src = all.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || byNew(a, b));
    if (!src.length) { sec.hidden = true; return; } sec.hidden = false;
    $('#sqi').innerHTML = A.i('search'); $('#spotPrev').innerHTML = $('#railPrev').innerHTML = A.i('left'); $('#spotNext').innerHTML = $('#railNext').innerHTML = A.i('right');
    const spot = $('#spot'), track = $('#spotTrack'), dots = $('#spotDots'), rail = $('#rail');
    let list = src, idx = 0, timer = 0, paused = false, vis = true, hold = false, holdT = 0, raf = 0, pos = 0, loop = 0, last = 0, slideN = 0;

    const cover = r => `<div class="bk" style="--h:${A.hue(r)}"><a class="cv" href="${A.esc(A.resUrl(r))}" tabindex="-1" aria-hidden="true">${A.img(r)}${A.art(r)}</a></div>`;
    function buildSpot() {
      const s = list.slice(0, 12); slideN = s.length; idx = 0;
      track.innerHTML = s.map((r, k) => { const u = A.esc(A.resUrl(r)), meta = [r.subject, r.class, r.board, r.year].filter(Boolean).slice(0, 4).map(x => `<span>${A.esc(x)}</span>`).join('');
        return `<article class="slide" style="--h:${A.hue(r)}" data-k="${k}" aria-roledescription="slide" aria-label="${k + 1} of ${s.length}">${cover(r)}<div class="info"><span class="pilltag">${A.esc(r.type || 'PDF Document')}</span><h3><a href="${u}">${A.esc(r.title)}</a></h3><p>${A.esc(r.short || (r.desc || '').slice(0, 220) || 'Read it instantly in your browser — free.')}</p><div class="cmeta">${meta}</div>
        <div class="acts"><a class="btn btn-solid" href="${u}">${A.i('book')} Read now</a>${A.dlLink(r, 'btn btn-ghost', A.i('download') + ' Download')}<button class="ring" type="button" data-share data-url="${A.esc(A.shareUrl(r))}" data-title="${A.esc(r.title)}" aria-label="Share ${A.esc(r.title)}">${A.i('share')}</button></div></div></article>`; }).join('');
      dots.innerHTML = slideN > 9 ? `<span class="cnt" id="cnt"></span>` : Array.from({ length: slideN }, (_, k) => `<button type="button" data-k="${k}" aria-label="Show book ${k + 1}"></button>`).join('');
      $('#spotCtl').hidden = slideN < 2; go(0);
    }
    function go(i) {
      idx = (i + slideN) % slideN;
      A.$$('.slide', track).forEach((el, k) => { const on = k === idx; el.classList.toggle('on', on); el.inert = !on; el.setAttribute('aria-hidden', on ? 'false' : 'true'); });
      A.$$('button', dots).forEach((b, k) => b.classList.toggle('on', k === idx)); const c = $('#cnt'); if (c) c.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slideN).padStart(2, '0');
      restart();
    }
    function restart() {
      clearTimeout(timer); spot.classList.remove('run'); if (slideN < 2 || paused || !vis || A.reduced || document.hidden) return;
      void spot.offsetWidth; spot.style.setProperty('--ms', MS + 'ms'); spot.classList.add('run'); timer = setTimeout(() => go(idx + 1), MS);
    }
    $('#spotPrev').onclick = () => go(idx - 1); $('#spotNext').onclick = () => go(idx + 1); dots.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) go(+b.dataset.k); });
    spot.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { paused = true; restart(); } }); spot.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { paused = false; restart(); } });
    spot.addEventListener('focusin', () => { paused = true; restart(); }); spot.addEventListener('focusout', () => { paused = false; restart(); });
    let sx = 0, sy = 0; spot.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; paused = true; restart(); }, { passive: true });
    spot.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(idx + (dx < 0 ? 1 : -1)); setTimeout(() => { paused = false; restart(); }, 4000); }, { passive: true });
    document.addEventListener('visibilitychange', () => { restart(); }); if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; restart(); }, { threshold: .25 }).observe(spot);

    const card = r => { const u = A.esc(A.resUrl(r)); return `<div class="rcard"><div class="bk" style="--h:${A.hue(r)}"><a class="cv" href="${u}" tabindex="-1" aria-hidden="true">${A.img(r)}${A.art(r)}</a><div class="ract"><a href="${u}" title="Read" aria-label="Read ${A.esc(r.title)}">${A.i('book')}Read</a>${A.dlLink(r, '', A.i('download'))}<button type="button" data-share data-url="${A.esc(A.shareUrl(r))}" data-title="${A.esc(r.title)}" aria-label="Share ${A.esc(r.title)}" title="Share">${A.i('share')}</button></div></div><h4><a href="${u}">${A.esc(r.title)}</a></h4><small>${A.esc([r.subject, r.type].filter(Boolean).join(' · ') || 'PDF')}</small></div>`; };
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function buildRail() {
      stop(); rail.classList.remove('still'); rail.scrollLeft = 0; pos = 0;
      if (!list.length) { rail.innerHTML = ''; return; }
      rail.innerHTML = list.map(card).join(''); const first = rail.firstElementChild; const over = rail.scrollWidth > rail.clientWidth + 12;
      $('#railArrows').hidden = !over; if (!over) { rail.classList.add('still'); return; }
      if (A.reduced) return;
      list.forEach(r => { const d = document.createElement('div'); d.innerHTML = card(r); const n = d.firstChild; n.setAttribute('aria-hidden', 'true'); n.inert = true; rail.appendChild(n); });
      loop = rail.children[list.length].offsetLeft - first.offsetLeft; last = 0; raf = requestAnimationFrame(tick);
    }
    function tick(t) {
      if (!last) last = t; const dt = Math.min(64, t - last); last = t;
      if (!hold && vis && !document.hidden && loop > 0) { pos += SPEED * dt / 1000; if (pos >= loop) pos -= loop; rail.scrollLeft = pos; }
      raf = requestAnimationFrame(tick);
    }
    const holdFor = ms => { hold = true; clearTimeout(holdT); holdT = setTimeout(() => { hold = false; pos = rail.scrollLeft; }, ms); };
    ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(ev => rail.addEventListener(ev, () => holdFor(2600), { passive: true }));
    rail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hold = true; clearTimeout(holdT); } }); rail.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') holdFor(500); });
    rail.addEventListener('scroll', () => { if (!hold || !loop) return; if (rail.scrollLeft >= loop) rail.scrollLeft -= loop; else if (rail.scrollLeft < 1) rail.scrollLeft += loop; pos = rail.scrollLeft; }, { passive: true });
    const by = d => { holdFor(2600); rail.scrollBy({ left: d * Math.max(200, rail.clientWidth * .8), behavior: A.reduced ? 'auto' : 'smooth' }); };
    $('#railPrev').onclick = () => by(-1); $('#railNext').onclick = () => by(1);

    const q = $('#sq'), note = $('#scNote');
    function apply() {
      const t = q.value.trim().toLowerCase(); list = !t ? src : src.filter(r => [r.title, r.short, r.author, r.topic, r.keywords, r.subject, r.type, r.class, r.board, r.year, (r.tags || []).join(' ')].join(' ').toLowerCase().includes(t));
      $('#railTitle').textContent = t ? list.length + (list.length === 1 ? ' book matches' : ' books match') : 'Now running · ' + src.length + (src.length === 1 ? ' book' : ' books');
      note.hidden = !!list.length; spot.hidden = !list.length; $('#railWrap').hidden = !list.length; note.querySelector('b').textContent = '“' + q.value.trim() + '”';
      if (list.length) { buildSpot(); buildRail(); } else { stop(); clearTimeout(timer); }
    }
    let tm; q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(apply, 180); });
    $('#scAll').onclick = () => { document.dispatchEvent(new CustomEvent('a360:search', { detail: q.value.trim() })); };
    let rt, w = innerWidth; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth !== w) { w = innerWidth; if (list.length) buildRail(); } }, 250); });
    apply(); A.reveal(sec);
  };
})();
