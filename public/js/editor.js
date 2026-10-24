import { makeAnnouncement, defaultExpiry, problems, normalize, templateData, translateWord, TEMPLATES, LIMITS, pick } from './shared.js';

const $ = id => document.getElementById(id);
const L = pick(document.documentElement.lang); // site language, for messages
const form = $('editor');
const { d: initial } = JSON.parse($('initial').textContent);
let slug = form.dataset.slug; // set after the first save, so a retry updates instead of duplicating
const field = name => form.elements.namedItem(name);
const checked = name => form.querySelector(`input[name=${name}]:checked`)?.value;
let cardLang = initial.lang;
let template = initial.template;

// ─── repeatable rows (relations, events, contacts) ───
const lists = {
  relations: { ul: $('relations'), tpl: $('t-relation'), max: LIMITS.relations, add: $('add-relation') },
  events: { ul: $('events'), tpl: $('t-event'), max: LIMITS.events, add: $('add-event') },
  contacts: { ul: $('contacts'), tpl: $('t-contact'), max: LIMITS.contacts, add: $('add-contact') },
};

function addRow(kind, values = {}) {
  const li = lists[kind].tpl.content.firstElementChild.cloneNode(true);
  for (const input of li.querySelectorAll('[data-k]')) input.value = values[input.dataset.k] || '';
  lists[kind].ul.append(li);
  applyLang(li);
  refreshRows();
  return li;
}
const rows = kind => [...lists[kind].ul.children].map(li =>
  Object.fromEntries([...li.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value])));

function refreshRows() {
  for (const l of Object.values(lists)) l.add.hidden = l.ul.children.length >= l.max;
  const conn = cardLang === 'en' ? 'of' : checked('gender') === 'f' ? 'की' : 'के';
  for (const s of form.querySelectorAll('[data-conn]')) s.textContent = conn;
}

// Placeholders and suggestion lists follow the card language.
function applyLang(root = document) {
  for (const el of root.querySelectorAll('[data-ph-hi]')) el.placeholder = el.dataset['ph' + (cardLang === 'en' ? 'En' : 'Hi')];
  for (const el of root.querySelectorAll('input[list]')) el.setAttribute('list', el.getAttribute('list').replace(/-(hi|en)$/, '-' + cardLang));
  lists.relations.ul.dataset.lang = cardLang;
}

for (const [kind, l] of Object.entries(lists)) {
  l.add.addEventListener('click', () => addRow(kind).querySelector('input')?.focus());
  l.ul.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (e.target.closest('[data-remove]')) li.remove();
    else if (e.target.closest('[data-up]') && li.previousElementSibling) li.previousElementSibling.before(li);
    else return;
    refreshRows();
    update();
  });
}

// ─── reading the whole form ───
function collect() {
  const v = n => field(n)?.value ?? '';
  return {
    lang: cardLang, template,
    gender: checked('gender'),
    title: v('title'), name: v('name'), died_on: v('died_on'),
    relations: rows('relations'),
    custom_text: field('custom_text').checked,
    announcement: v('announcement'),
    intro: v('intro'), events_title: v('events_title'),
    events: rows('events'),
    venue: { name: v('venue_name'), address: v('venue_address'), map: v('venue_map') },
    family: v('family'),
    contacts: rows('contacts'),
    shloka: v('shloka'), closing: v('closing'),
  };
}

// ─── live bits: generated announcement, automatic expiry date ───
const text = field('announcement');
const expiry = field('expires_on');
function update() {
  const d = collect();
  if (!d.custom_text) text.value = makeAnnouncement(d);
  if (expiry.dataset.auto === '1') {
    const v = defaultExpiry(d);
    expiry.value = v > expiry.max ? expiry.max : v;
  }
}
field('custom_text').addEventListener('change', e => {
  text.readOnly = !e.target.checked;
  if (e.target.checked) text.focus();
  update();
});
expiry.addEventListener('input', () => { expiry.dataset.auto = '0'; });

let dirty = false;
form.addEventListener('input', e => {
  dirty = true;
  if (e.target.name === 'gender') refreshRows();
  if (e.target !== text && e.target !== expiry) update();
});
addEventListener('beforeunload', e => { if (dirty) e.preventDefault(); });

// A field still holding a template's default wording can be replaced; anything the family typed stays.
const isDefault = (name, value) => Object.keys(TEMPLATES).some(t => ['hi', 'en'].some(l => templateData(t, l)[name] === value));

// ─── switching template ───
function applyTemplate(key) {
  const t = templateData(key, cardLang);
  field('title').value = t.title;
  form.querySelector(`input[name=gender][value="${t.gender}"]`).checked = true;
  field('intro').value = t.intro;
  field('events_title').value = t.events_title;
  field('shloka').value = t.shloka;
  lists.events.ul.replaceChildren();
  t.events.forEach(ev => addRow('events', ev));
}

// ─── switching card language: translate known words, keep dates and everything typed ───
function applyCardLang(to) {
  const from = cardLang;
  cardLang = to;
  const t = templateData(template, to);
  field('title').value = translateWord('titles', field('title').value, from, to);
  for (const name of ['intro', 'events_title', 'closing']) if (!field(name).value || isDefault(name, field(name).value)) field(name).value = t[name];
  for (const li of lists.events.ul.children) {
    const n = li.querySelector('[data-k=name]');
    n.value = translateWord('events', n.value, from, to);
  }
  for (const li of lists.relations.ul.children) {
    const r = li.querySelector('[data-k=rel]');
    r.value = translateWord('relations', r.value, from, to);
  }
  if (field('custom_text').checked) {
    field('custom_text').checked = false;
    text.readOnly = true;
  }
  applyLang();
  refreshRows();
  update();
  field('name').focus();
}

form.addEventListener('change', e => {
  if (e.target.name === 'lang') {
    applyCardLang(e.target.value);
    dirty = true;
  }
  if (e.target.name === 'template') {
    const filled = rows('events').some(r => r.date || r.time || r.tithi || r.note);
    if (filled && !confirm(L('नमूना बदलने पर कार्यक्रमों की सूची नए नमूने की हो जाएगी। आगे बढ़ें?', 'Switching template replaces the programme list. Continue?'))) {
      form.querySelector(`input[name=template][value="${template}"]`).checked = true;
      return;
    }
    template = e.target.value;
    applyTemplate(template);
    refreshRows();
    update();
  }
});

// ─── photo: square-crop and shrink in the browser, upload after saving ───
let photoBlob = null, removePhoto = false;
const img = $('photo-img'), empty = $('photo-empty'), removeBtn = $('photo-remove'), photoLabel = $('photo-label');

async function squareJpeg(file, size = 800) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const side = Math.min(bmp.width, bmp.height);
  const out = Math.min(size, side);
  const c = document.createElement('canvas');
  c.width = c.height = out;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
  for (const q of [0.85, 0.75, 0.6]) {
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size < 550 * 1024) return blob;
  }
  throw new Error('too big');
}

$('photo').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    photoBlob = await squareJpeg(file);
    removePhoto = false;
    img.src = URL.createObjectURL(photoBlob);
    img.classList.remove('hidden'); empty.classList.add('hidden'); removeBtn.classList.remove('hidden');
    photoLabel.textContent = photoLabel.dataset.change;
    dirty = true;
  } catch (err) {
    showError(L('यह फ़ोटो नहीं खुल सकी। कोई दूसरी JPG/PNG फ़ोटो चुनें।', 'This photo could not be opened. Please choose another JPG/PNG photo.'));
  }
  e.target.value = '';
});
removeBtn.addEventListener('click', () => {
  photoBlob = null; removePhoto = true; dirty = true;
  img.classList.add('hidden'); empty.classList.remove('hidden'); removeBtn.classList.add('hidden');
  photoLabel.textContent = photoLabel.dataset.choose;
});

// ─── save ───
const errEl = $('error');
function showError(msg) {
  errEl.textContent = msg;
  errEl.classList.toggle('hidden', !msg);
  if (msg) errEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
async function call(url, method, body, type = 'application/json') {
  const res = await fetch(url, { method, headers: body ? { 'Content-Type': type } : {}, body: type === 'application/json' && body ? JSON.stringify(body) : body });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || L('कुछ गड़बड़ हुई, फिर से कोशिश करें।', 'Something went wrong, please try again.'));
  return out;
}

const saveLabel = () => (slug ? L('बदलाव सेव करें', 'Save changes') : L('सेव करें और पेज देखें', 'Save and view the page'));
form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = collect();
  const err = problems(normalize(data), expiry.value, undefined, document.documentElement.lang);
  if (err) {
    showError(err);
    (data.name.trim() ? expiry : field('name')).focus();
    return;
  }
  showError('');
  const btn = $('save');
  btn.disabled = true;
  btn.textContent = L('सेव हो रहा है…', 'Saving…');
  try {
    const body = { data, expires_on: expiry.value };
    const { slug: s } = slug ? await call('/api/posts/' + slug, 'PUT', body) : await call('/api/posts', 'POST', body);
    const created = !slug;
    slug = s;
    if (photoBlob) await call(`/api/posts/${s}/photo`, 'PUT', photoBlob, 'image/jpeg');
    else if (removePhoto && !created) await call(`/api/posts/${s}/photo`, 'DELETE');
    dirty = false;
    location.href = '/s/' + s;
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = saveLabel();
  }
});

// ─── initial state ───
(initial.relations.length ? initial.relations : [{}, {}]).forEach(r => addRow('relations', r));
initial.events.forEach(ev => addRow('events', ev));
(initial.contacts.length ? initial.contacts : [{}]).forEach(c => addRow('contacts', c));
text.readOnly = !initial.custom_text;
if (initial.custom_text) text.value = initial.announcement;
applyLang();
refreshRows();
update();
