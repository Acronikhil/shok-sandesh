import { LOCALE, pick, announcement, bodyName, dateAndDay, isIsoDate, clean, prettyPhone } from './shared.js';

// Draws a printed-style शोक संदेश card: 1280 design units wide, height follows the content,
// rendered at 2× for sharpness.
const { d } = JSON.parse(document.getElementById('data').textContent);
const loc = LOCALE[d.lang]; // wording on the card
const L = pick(document.documentElement.lang); // site language, for messages
const W = 1280, SCALE = 2, X0 = 82, R = 1198;
const canvas = document.getElementById('card');
const ctx = canvas.getContext('2d');
const nameEl = document.getElementById('name');
const form = document.getElementById('form');
const INK = '#111';
const font = (weight, size) => `${weight} ${size}px Hind, "Noto Sans Devanagari", Mangal, sans-serif`;

// Announcement as [text, bold] runs: the person's name and the date in bold.
function paraRuns() {
  let runs = [[announcement(d).replace(/\s*\n\s*/g, ' '), false]];
  const bold = [bodyName(d)];
  if (isIsoDate(d.died_on)) bold.push(dateAndDay(d.died_on, d.lang));
  for (const b of bold.filter(Boolean)) {
    runs = runs.flatMap(([t, isBold]) => {
      if (isBold || !t.includes(b)) return [[t, isBold]];
      const i = t.indexOf(b);
      return [[t.slice(0, i), false], [b, true], [t.slice(i + b.length), false]];
    });
  }
  if (d.intro && d.events.length) runs.push([' ' + d.intro, false]);
  return runs.filter(([t]) => t.length);
}

function rows() {
  const out = d.events.map(e => {
    const v = [isIsoDate(e.date) && loc.datePrefix + dateAndDay(e.date, d.lang), e.tithi, e.time].filter(Boolean).join(', ');
    const parts = [[v, false]];
    if (e.note) parts.push([(v ? ' ' : '') + `(${e.note})`, true]);
    return [e.name + ' :', parts];
  });
  const venue = [d.venue.name, d.venue.address].map(s => clean(s)).filter(Boolean).join(', ');
  if (venue) out.push([loc.venue + ' :', [[venue, false]]]);
  return out;
}

// Split runs into words, then into lines no wider than `width` (first line `first` wide).
// A word can mix bold and regular pieces ("Dubey" + ","): pieces only get a space between them
// where the text has one, so punctuation after a bold name stays attached.
function wrap(runs, width, size, first = width) {
  const words = [];
  let open = false; // last word may still grow (no space after it yet)
  for (const [t, bold] of runs) {
    t.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { open = false; return; }
      if (open) words[words.length - 1].pieces.push({ w: part, bold });
      else words.push({ pieces: [{ w: part, bold }] });
      open = true;
    });
  }
  for (const word of words) {
    word.width = 0;
    for (const p of word.pieces) { ctx.font = font(p.bold ? 700 : 400, size); p.width = ctx.measureText(p.w).width; word.width += p.width; }
  }
  ctx.font = font(400, size);
  const space = ctx.measureText(' ').width;
  const lines = [[]];
  let used = 0;
  for (const t of words) {
    const line = lines[lines.length - 1];
    const avail = lines.length === 1 ? first : width;
    const add = (line.length ? space : 0) + t.width;
    if (line.length && used + add > avail) { lines.push([t]); used = t.width; }
    else { line.push(t); used += add; }
  }
  return { lines, space };
}

function drawLines({ lines, space }, x, y, width, lineH, size, { indent = 0, justify = false } = {}) {
  lines.forEach((line, i) => {
    const start = x + (i === 0 ? indent : 0);
    const avail = width - (i === 0 ? indent : 0);
    const total = line.reduce((s, t) => s + t.width, 0);
    const gap = justify && i < lines.length - 1 && line.length > 1 ? (avail - total) / (line.length - 1) : space;
    let cx = start;
    for (const word of line) {
      let px = cx;
      for (const p of word.pieces) {
        ctx.font = font(p.bold ? 700 : 400, size);
        ctx.fillText(p.w, px, y + i * lineH);
        px += p.width;
      }
      cx += word.width + gap;
    }
  });
  return y + (lines.length - 1) * lineH;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rightRuns(parts, right, y, size) {
  let w = 0;
  for (const [t, bold] of parts) { ctx.font = font(bold ? 700 : 400, size); w += ctx.measureText(t).width; }
  let x = right - w;
  for (const [t, bold] of parts) { ctx.font = font(bold ? 700 : 400, size); ctx.fillText(t, x, y); x += ctx.measureText(t).width; }
}

// Lays out and draws the card at height H; returns the height the content actually needs.
function paint(H) {
  const prefix = form.querySelector('input[name=p]:checked').value;
  const name = clean(nameEl.value);
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK; ctx.strokeStyle = INK;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  ctx.lineWidth = 3.5; ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 1.8; ctx.strokeRect(45, 45, W - 90, H - 90);

  ctx.font = font(600, 27);
  ctx.fillText(loc.om, X0, 108);
  ctx.textAlign = 'right'; ctx.fillText(loc.om, R, 108);
  ctx.textAlign = 'center'; ctx.font = font(700, 68);
  ctx.fillText(loc.heading, W / 2, d.lang === 'en' ? 112 : 116);
  ctx.textAlign = 'left';

  // salutation + name on the underline
  let lineStart = X0;
  if (prefix) {
    ctx.font = font(600, 26);
    ctx.fillText(prefix, X0, 183);
    lineStart = X0 + ctx.measureText(prefix).width + 14;
  }
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(lineStart, 193); ctx.lineTo(R, 193); ctx.stroke();
  if (name) {
    const nx = lineStart + 42, maxW = R - nx - 8;
    let size = 42;
    do { ctx.font = font(400, size); } while (ctx.measureText(name).width > maxW && --size > 20);
    ctx.fillText(name, nx, 177);
  }

  let y = drawLines(wrap(paraRuns(), R - X0, 26.5, R - X0 - 63), X0, 239, R - X0, 44, 26.5, { indent: 63, justify: true });

  // programme box with its tab
  const list = rows();
  if (list.length) {
    const top = y + 44;
    let ry = top + 57;
    const ends = [];
    for (const [label, parts] of list) {
      const wrapped = wrap(parts, R - 1 - 388, 26.5);
      ends.push([label, wrapped, ry]);
      ry += wrapped.lines.length * 40 + 4;
    }
    const bottom = ry - 44 + 27;
    ctx.lineWidth = 3;
    roundRect(X0 + 1, top, R - X0 - 2, bottom - top, 24); ctx.stroke();
    ctx.font = font(700, 25);
    const tab = d.events.length ? loc.programme : loc.venue;
    const tabW = ctx.measureText(tab).width + 48;
    roundRect(W / 2 - tabW / 2, top - 21, tabW, 42, 13);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText(tab, W / 2, top + 9);
    for (const [label, wrapped, ly] of ends) {
      ctx.textAlign = 'right'; ctx.font = font(700, 26.5); ctx.fillText(label, 374, ly);
      ctx.textAlign = 'left'; drawLines(wrapped, 388, ly, R - 388, 40, 26.5);
    }
    y = bottom;
  }

  // family and contacts
  const fy = y + 57;
  let last = y;
  if (d.family || d.contacts.length) {
    ctx.textAlign = 'left';
    ctx.font = font(700, 26); ctx.fillText(loc.bereaved + ' :', X0, fy);
    if (d.family) { ctx.font = font(400, 26); ctx.fillText(d.family, X0, fy + 40); }
    last = fy + 40;
    d.contacts.forEach((c, i) => {
      rightRuns([[`${c.name}  ${loc.mobile} : `, false], [prettyPhone(c.phone).replace(' ', ''), true]], R, fy - 5 + i * 44, 26);
      last = Math.max(last, fy - 5 + i * 44);
    });
  }
  return Math.max(Math.ceil(last + 110), 640);
}

let H = 900;
function draw() {
  const need = paint(H);
  if (need !== H) { H = need; canvas.width = W * SCALE; canvas.height = H * SCALE; paint(H); }
}
canvas.width = W * SCALE;
canvas.height = H * SCALE;

let queued = false;
function redraw() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; draw(); });
}
form.addEventListener('input', redraw);
form.addEventListener('submit', e => { e.preventDefault(); nameEl.blur(); });

// ─── save / share ───
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.add('hidden'), 3000);
}
function fileName() {
  const n = clean(nameEl.value).replace(/[\\/:*?"<>|.]/g, '').replace(/\s+/g, '-');
  return `${d.lang === 'en' ? 'condolence-message' : 'शोक-संदेश'}${n ? '-' + n : ''}.png`;
}
const toBlob = () => new Promise(r => canvas.toBlob(r, 'image/png'));

async function download() {
  const blob = await toBlob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(L('कार्ड सेव हो गया ✓', 'Card saved ✓'));
}

document.getElementById('save').onclick = () => {
  if (!clean(nameEl.value) && !confirm(L('नाम खाली है। बिना नाम का कार्ड सेव करें?', 'No name typed. Save the card without a name?'))) return nameEl.focus();
  download();
};

document.getElementById('share').onclick = async () => {
  if (!clean(nameEl.value) && !confirm(L('नाम खाली है। बिना नाम का कार्ड भेजें?', 'No name typed. Send the card without a name?'))) return nameEl.focus();
  const file = new File([await toBlob()], fileName(), { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); } catch (e) {}
  } else {
    await download();
    toast(L('इस ब्राउज़र में सीधे शेयर नहीं होता — कार्ड सेव कर दिया है, अब WhatsApp से भेजें', 'This browser cannot share directly — the card was saved, send it from WhatsApp'));
  }
};

nameEl.value = new URLSearchParams(location.search).get('name') || '';

// Draw immediately, then again once the Hind font has arrived.
draw();
Promise.all([400, 600, 700].map(w => document.fonts.load(font(w, 26), loc.heading))).then(draw, draw);
document.fonts.ready.then(draw);
