import { pick } from './shared.js';

const L = pick(document.documentElement.lang);

document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  if (!confirm(L('यह शोक संदेश हमेशा के लिए हटाएँ? भेजे गए लिंक भी काम करना बंद कर देंगे।', 'Delete this message permanently? Links you have sent will stop working.'))) return;
  btn.disabled = true;
  const res = await fetch('/api/posts/' + btn.dataset.delete, { method: 'DELETE' });
  if (res.ok) {
    btn.closest('li').remove();
    if (!document.querySelector('[data-slug]')) location.reload();
  } else {
    btn.disabled = false;
    const t = document.getElementById('toast');
    t.textContent = (await res.json().catch(() => ({}))).error || L('हटाया नहीं जा सका।', 'Could not delete.');
    t.classList.remove('hidden');
  }
});
