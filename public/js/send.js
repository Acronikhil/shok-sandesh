import { LOCALE, pick, clean, b64url, waNumber, whatsappMessage } from './shared.js';

const { d, url: SITE } = JSON.parse(document.getElementById('data').textContent);
const PREFIXES = LOCALE[d.lang].prefixes; // the greeting is part of the card's message
const L = pick(document.documentElement.lang); // site language, for the page's own messages
const $ = id => document.getElementById(id);
const form = $('form'), nameEl = $('name'), phoneEl = $('phone');
const prefixIndex = () => Number(form.querySelector('input[name=p]:checked').value);

const linkFor = (name, p) => SITE + '?n=' + b64url(name) + (p ? '&p=' + p : '');
const messageFor = (name, p) =>
  whatsappMessage(d, { greet: clean(`${PREFIXES[p]} ${name}`).replace(/,$/, '') + ',', link: linkFor(name, p) });

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.add('hidden'), 2500);
}

function refreshPreview() {
  const name = clean(nameEl.value), p = prefixIndex();
  $('pv-prefix').textContent = PREFIXES[p];
  $('pv-prefix').hidden = !PREFIXES[p];
  $('pv-name').textContent = name || $('pv-name').dataset.empty;
  $('pv-name').classList.toggle('text-maroon-800/40', !name);
  $('open').href = name ? linkFor(name, p) : SITE;
}
form.addEventListener('input', refreshPreview);

// ─── "Sent" history, kept only in this browser, one list per page ───
const KEY = 'shok-sent-v1:' + new URL(SITE).pathname;
function loadSent() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function saveSent(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
function remember(name, p, phone) {
  const list = loadSent().filter(x => !(x.name === name && x.p === p));
  list.unshift({ name, p, phone, at: Date.now() });
  saveSent(list.slice(0, 300));
  renderSent();
}
function renderSent() {
  const list = loadSent(), ul = $('sent');
  $('sent-box').hidden = !list.length;
  $('sent-count').textContent = `(${list.length})`;
  ul.replaceChildren(...list.map(x => {
    const li = document.createElement('li');
    li.className = 'panel flex items-center gap-3 px-3 py-2';
    const txt = document.createElement('div');
    txt.className = 'min-w-0 flex-1';
    const n = document.createElement('p');
    n.className = 'truncate font-semibold text-maroon-800';
    n.textContent = clean(`${PREFIXES[x.p]} ${x.name}`);
    const meta = document.createElement('p');
    meta.className = 'text-xs text-maroon-900/60';
    meta.textContent = new Date(x.at).toLocaleString(L('hi-IN', 'en-IN'), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) + (x.phone ? ' • ' + x.phone : '');
    txt.append(n, meta);
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'shrink-0 rounded-lg border border-gold-500/70 px-3 py-1.5 text-sm font-bold text-maroon-800 hover:bg-gold-100';
    again.textContent = L('फिर भेजें', 'Send again');
    again.onclick = () => {
      nameEl.value = x.name; phoneEl.value = x.phone || '';
      form.querySelector(`input[name=p][value="${x.p}"]`).checked = true;
      refreshPreview(); window.scrollTo({ top: 0, behavior: 'smooth' }); nameEl.focus();
    };
    li.append(txt, again);
    return li;
  }));
}
$('clear').onclick = () => { if (confirm(L('भेजे गए नामों की सूची हटाएँ?', 'Clear the list of sent names?'))) { saveSent([]); renderSent(); } };

// ─── actions ───
function current() {
  const name = clean(nameEl.value);
  if (!name) { nameEl.focus(); toast(L('कृपया पहले नाम लिखें', 'Please type a name first')); return null; }
  return { name, p: prefixIndex(), phone: clean(phoneEl.value) };
}
function resetForNext() { nameEl.value = ''; phoneEl.value = ''; refreshPreview(); }

form.addEventListener('submit', e => {
  e.preventDefault();
  const c = current(); if (!c) return;
  const num = waNumber(c.phone);
  const url = 'https://api.whatsapp.com/send?' + (num ? 'phone=' + num + '&' : '') + 'text=' + encodeURIComponent(messageFor(c.name, c.p));
  window.open(url, '_blank', 'noopener');
  remember(c.name, c.p, c.phone);
  resetForNext();
});

$('copy').onclick = async () => {
  const c = current(); if (!c) return;
  try {
    await navigator.clipboard.writeText(messageFor(c.name, c.p));
    remember(c.name, c.p, c.phone);
    toast(L('संदेश कॉपी हो गया — अब कहीं भी पेस्ट करें', 'Message copied — paste it anywhere'));
  } catch (e) {
    prompt(L('इस संदेश को कॉपी करें:', 'Copy this message:'), messageFor(c.name, c.p));
  }
};

$('other').onclick = async () => {
  const c = current(); if (!c) return;
  if (!navigator.share) { $('copy').click(); return; }
  try {
    await navigator.share({ text: messageFor(c.name, c.p) });
    remember(c.name, c.p, c.phone);
    resetForNext();
  } catch (e) {}
};

refreshPreview();
renderSent();
