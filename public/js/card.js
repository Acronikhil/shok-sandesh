import { LOCALE, fromB64url } from './shared.js';

const share = JSON.parse(document.getElementById('share-data').textContent);
const PREFIXES = LOCALE[share.lang].prefixes;

// Personalised greeting: ?n=<base64url name>&p=<salutation index>, or plain ?to=<name>
(() => {
  const q = new URLSearchParams(location.search);
  let name = '';
  try { if (q.get('n')) name = fromB64url(q.get('n')); } catch (e) {}
  if (!name) name = q.get('to') || '';
  name = name.replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!name) return;
  const prefix = PREFIXES[Number(q.get('p'))] ?? PREFIXES[0];
  const pre = document.getElementById('r-prefix');
  pre.textContent = prefix;
  pre.hidden = !prefix;
  document.getElementById('r-name').textContent = name;
  document.getElementById('recipient').hidden = false;
})();

document.getElementById('share').addEventListener('click', async () => {
  if (navigator.share) {
    try { await navigator.share(share); } catch (e) {}
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(share.text + '\n' + share.url), '_blank', 'noopener');
  }
});

// A few marigold petals drifting down, skipped for people who prefer reduced motion
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const box = document.getElementById('petals');
  const colors = ['#f28a1c', '#fbb917', '#e8730c', '#ffc93c', '#c4193a'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    const s = 8 + Math.random() * 7;
    p.className = 'petal';
    p.style.cssText =
      `left:${Math.random() * 100}%;width:${s}px;height:${s * 0.7}px;background:${colors[i % colors.length]};` +
      `--dx:${(Math.random() * 30 - 15).toFixed(1)}vw;--rot:${Math.round(Math.random() * 720 - 360)}deg;` +
      `animation-duration:${(14 + Math.random() * 12).toFixed(1)}s;animation-delay:-${(Math.random() * 26).toFixed(1)}s`;
    box.appendChild(p);
  }
}
