//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  'use strict';
  const KEY = 'a360-token', base = () => document.body ? (document.body.dataset.root || '') : '../';
  const A = window.A360Auth = {
    token: () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } },
    isLoggedIn() { return !!this.token(); },
    logout() { try { localStorage.removeItem(KEY); } catch (e) {} },
    guard(url) { if (!this.isLoggedIn()) { location.replace(url); return false; } return true; },
    async call(action, opt) {
      opt = opt || {}; const h = { 'X-A360-Token': this.token() }; let body;
      if (opt.form) body = opt.form; else if (opt.json) { h['Content-Type'] = 'application/json'; body = JSON.stringify(opt.json); }
      let r, txt; try { r = await fetch('../api.php?action=' + action, { method: body ? 'POST' : 'GET', headers: h, body, cache: 'no-store' }); txt = await r.text(); } catch (e) { throw new Error('Cannot reach the server. Check your connection.'); }
      let d; try { d = JSON.parse(txt); } catch (e) { throw new Error('api.php did not return JSON (HTTP ' + r.status + '). Make sure api.php was uploaded and PHP is enabled for this domain.'); }
      if (r.status === 401 && action !== 'login') { this.logout(); location.replace('../login/'); throw new Error('Session expired'); }
      if (!d.ok) throw new Error(d.error || 'Request failed');
      return d;
    },
    async login(user, pass) { const d = await this.call('login', { json: { username: user, password: pass } }); localStorage.setItem(KEY, d.token); }
  };
})();
