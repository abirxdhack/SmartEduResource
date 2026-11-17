//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
(function () {
  var d = document.documentElement, m = 'system', light = false;
  try { m = localStorage.getItem('a360-theme') || 'system'; } catch (e) {}
  try { light = m === 'light' || (m === 'system' && matchMedia('(prefers-color-scheme: light)').matches); } catch (e) {}
  d.setAttribute('data-theme', light ? 'light' : 'dark');
  var t = document.querySelector('meta[name=theme-color]'); if (t) t.setAttribute('content', light ? '#faf8f5' : '#06141a');
})();
