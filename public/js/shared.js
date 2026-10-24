// Shared by the Worker (server rendering, validation) and the browser (editor, sender, card image).
// Keep it dependency-free and side-effect-free.
//
// Two separate languages are in play:
//  • the site language (buttons, help text, errors) — chosen by the visitor, see pick();
//  • the card language (d.lang) — chosen by the family per card; decides all wording on the card,
//    the WhatsApp text and the card image, whoever is viewing it.

export const LANGS = { hi: 'हिन्दी', en: 'English' };
export const langOf = v => (v === 'en' ? 'en' : 'hi');

// Inline translations: const L = pick(lang); L('हिन्दी', 'English')
export const pick = lang => (hi, en) => (lang === 'en' ? en : hi);

// Word lists are index-aligned across languages so a card can be switched from one to the other.
export const LOCALE = {
  hi: {
    months: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    weekdays: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    // Salutations for personalised links (?p=<index>) and their chip labels
    prefixes: ['श्रीमान,', 'श्रीमती,', 'आदरणीय', 'प्रिय', ''],
    salutations: ['श्रीमान', 'श्रीमती', 'आदरणीय', 'प्रिय', 'कोई नहीं'],
    titles: ['स्व. श्री', 'स्व. श्रीमती', 'स्व. सुश्री', 'स्व. डॉ.', 'स्व. पं.', 'स्व.'],
    relations: [
      'पुत्र', 'सुपुत्र', 'पौत्र', 'प्रपौत्र', 'पुत्री', 'पौत्री', 'पुत्रवधू', 'भ्राता', 'बड़े भाई', 'छोटे भाई', 'बहन',
      'धर्मपत्नी', 'पति', 'पूज्य पिताजी', 'पूज्य माताजी', 'दादाजी', 'दादीजी', 'नानाजी', 'नानीजी',
      'ताऊजी', 'ताईजी', 'चाचाजी', 'चाचीजी', 'मामाजी', 'मामीजी', 'ससुरजी', 'सासुजी', 'जीजाजी', 'मौसाजी', 'मौसीजी', 'बुआजी',
    ],
    events: [
      'उठावना', 'तीसरा', 'बैठक', 'अस्थि विसर्जन', 'दशाकर्म', 'द्वादशा', 'तेरहवीं', 'गंगा पूजन', 'पगड़ी रस्म',
      'ब्रह्मभोज', 'श्रद्धांजलि सभा', 'शोक सभा', 'शांति पाठ', 'गरुड़ पुराण पाठ', 'रसम पगड़ी', 'चौथा',
    ],
    closing: 'ईश्वर दिवंगत आत्मा को अपने श्रीचरणों में स्थान दें।',
    // fixed wording on the card, the WhatsApp text and the card image
    om: 'ॐ शांति',
    heading: 'शोक संदेश',
    passed: 'स्वर्गवास',
    venue: 'स्थान',
    scanQr: 'QR स्कैन करें',
    qrAlt: 'गूगल मैप लोकेशन का QR कोड',
    directions: 'गूगल मैप पर रास्ता देखें',
    bereaved: 'शोकाकुल',
    share: 'यह संदेश साझा करें',
    datePrefix: 'दि. ',
    programme: 'कार्यक्रम',
    mobile: 'मो.',
    viewLink: 'शोक संदेश देखें :',
    makeOwn: 'अपने परिजन के लिए ऐसा शोक संदेश निःशुल्क बनाएँ →',
    noticeLabel: 'सूचना',
  },
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    prefixes: ['Mr.', 'Mrs.', 'Respected', 'Dear', ''],
    salutations: ['Mr.', 'Mrs.', 'Respected', 'Dear', 'None'],
    titles: ['Late Shri', 'Late Smt.', 'Late Ms.', 'Late Dr.', 'Late Pt.', 'Late'],
    relations: [
      'son', 'beloved son', 'grandson', 'great-grandson', 'daughter', 'granddaughter', 'daughter-in-law', 'brother', 'elder brother', 'younger brother', 'sister',
      'wife', 'husband', 'beloved father', 'beloved mother', 'grandfather', 'grandmother', 'maternal grandfather', 'maternal grandmother',
      'uncle', 'aunt', 'uncle', 'aunt', 'maternal uncle', 'maternal aunt', 'father-in-law', 'mother-in-law', 'brother-in-law', 'uncle', 'aunt', 'aunt',
    ],
    events: [
      'Uthamna', 'Teesra', 'Baithak', 'Asthi Visarjan', 'Dashakarma', 'Dwadasha', 'Tehravi', 'Ganga Poojan', 'Pagdi Rasm',
      'Brahmbhoj', 'Prayer Meeting', 'Condolence Meeting', 'Shanti Path', 'Garud Puran Path', 'Rasam Pagdi', 'Chautha',
    ],
    closing: 'May God grant eternal peace to the departed soul.',
    om: 'Om Shanti',
    heading: 'Condolence Message',
    passed: 'Passed away',
    venue: 'Venue',
    scanQr: 'Scan QR',
    qrAlt: 'QR code for the Google Maps location',
    directions: 'Get directions on Google Maps',
    bereaved: 'Bereaved Family',
    share: 'Share this message',
    datePrefix: '',
    programme: 'Programme',
    mobile: 'Mob.',
    viewLink: 'View the condolence message:',
    makeOwn: 'Create a condolence message like this for your family, free →',
    noticeLabel: 'Announcement',
  },
};

// Same word in the other language (index-aligned lists); unknown words are kept as typed.
export function translateWord(list, word, from, to) {
  const i = LOCALE[from][list].indexOf(word);
  return i >= 0 ? LOCALE[to][list][i] : word;
}

export const SHLOKAS = {
  gita222: {
    label: { hi: 'वासांसि जीर्णानि… (गीता 2.22)', en: 'Vasamsi jirnani… (Gita 2.22)' },
    lang: 'sa',
    lines: ['वासांसि जीर्णानि यथा विहाय', 'नवानि गृह्णाति नरोऽपराणि ।', 'तथा शरीराणि विहाय जीर्णा-', 'न्यन्यानि संयाति नवानि देही ॥'],
    source: { hi: 'श्रीमद्भगवद्गीता 2.22', en: 'Shrimad Bhagavad Gita 2.22' },
  },
  gita220: {
    label: { hi: 'न जायते म्रियते वा… (गीता 2.20)', en: 'Na jayate mriyate va… (Gita 2.20)' },
    lang: 'sa',
    lines: ['न जायते म्रियते वा कदाचि-', 'न्नायं भूत्वा भविता वा न भूयः ।', 'अजो नित्यः शाश्वतोऽयं पुराणो', 'न हन्यते हन्यमाने शरीरे ॥'],
    source: { hi: 'श्रीमद्भगवद्गीता 2.20', en: 'Shrimad Bhagavad Gita 2.20' },
  },
  gita227: {
    label: { hi: 'जातस्य हि ध्रुवो मृत्युः… (गीता 2.27)', en: 'Jatasya hi dhruvo mrityuh… (Gita 2.27)' },
    lang: 'sa',
    lines: ['जातस्य हि ध्रुवो मृत्यु-', 'र्ध्रुवं जन्म मृतस्य च ।', 'तस्मादपरिहार्येऽर्थे', 'न त्वं शोचितुमर्हसि ॥'],
    source: { hi: 'श्रीमद्भगवद्गीता 2.27', en: 'Shrimad Bhagavad Gita 2.27' },
  },
  mrityunjay: {
    label: { hi: 'महामृत्युंजय मंत्र', en: 'Mahamrityunjaya Mantra' },
    lang: 'sa',
    lines: ['ॐ त्र्यम्बकं यजामहे', 'सुगन्धिं पुष्टिवर्धनम् ।', 'उर्वारुकमिव बन्धनान्', 'मृत्योर्मुक्षीय माऽमृतात् ॥'],
    source: { hi: 'ऋग्वेद 7.59.12', en: 'Rigveda 7.59.12' },
  },
  ramcharit: {
    label: { hi: 'हानि लाभु जीवनु मरनु… (रामचरितमानस)', en: 'Hani labhu jivanu maranu… (Ramcharitmanas)' },
    lang: 'hi',
    lines: ['सुनहु भरत भावी प्रबल', 'बिलखि कहेउ मुनिनाथ ।', 'हानि लाभु जीवनु मरनु', 'जसु अपजसु बिधि हाथ ॥'],
    source: { hi: 'श्रीरामचरितमानस, अयोध्याकाण्ड', en: 'Shri Ramcharitmanas, Ayodhya Kand' },
  },
  none: { label: { hi: 'कोई श्लोक नहीं', en: 'No shloka' }, lines: [] },
};

// Ready-made starting points so families don't have to look up the customary wording.
// `events` are indexes into LOCALE[lang].events.
export const TEMPLATES = {
  male: {
    label: { hi: 'पिताजी / दादाजी / भाई', en: 'Father / Grandfather / Brother' },
    gender: 'm', title: 0, events: [0, 4, 8, 9], shloka: 'gita222',
    text: {
      hi: { intro: 'उनकी आत्मशांति हेतु उत्तरकार्य निम्नानुसार रखा गया है।', events_title: 'उत्तरकार्य कार्यक्रम' },
      en: { intro: 'The following rituals will be held for the peace of the departed soul.', events_title: 'Uttarkarya Programme' },
    },
  },
  female: {
    label: { hi: 'माताजी / दादीजी / बहन', en: 'Mother / Grandmother / Sister' },
    gender: 'f', title: 1, events: [0, 4, 6, 9], shloka: 'gita220',
    text: {
      hi: { intro: 'उनकी आत्मशांति हेतु उत्तरकार्य निम्नानुसार रखा गया है।', events_title: 'उत्तरकार्य कार्यक्रम' },
      en: { intro: 'The following rituals will be held for the peace of the departed soul.', events_title: 'Uttarkarya Programme' },
    },
  },
  sabha: {
    label: { hi: 'श्रद्धांजलि सभा', en: 'Prayer meeting' },
    gender: 'm', title: 0, events: [10], shloka: 'gita227',
    text: {
      hi: { intro: 'उनकी आत्मशांति हेतु श्रद्धांजलि सभा निम्नानुसार रखी गई है।', events_title: 'श्रद्धांजलि सभा' },
      en: { intro: 'A prayer meeting will be held for the peace of the departed soul.', events_title: 'Prayer Meeting' },
    },
  },
};
export const templateHint = (key, lang) => TEMPLATES[key].events.map(i => LOCALE[lang].events[i]).join(', ');

// The editable fields a template fills in, in one language.
export function templateData(key, lang) {
  const t = TEMPLATES[key] || TEMPLATES.male;
  const loc = LOCALE[lang];
  return {
    template: TEMPLATES[key] ? key : 'male', lang,
    gender: t.gender, title: loc.titles[t.title], shloka: t.shloka,
    events: t.events.map(i => ({ name: loc.events[i] })),
    intro: t.text[lang].intro, events_title: t.text[lang].events_title,
    closing: loc.closing,
  };
}

export const blank = (key = 'male', lang = 'hi') => ({
  name: '', died_on: '', relations: [], announcement: '', custom_text: false,
  venue: { name: '', address: '', map: '' }, family: '', contacts: [],
  ...templateData(key, lang),
});

export const LIMITS = { relations: 8, events: 8, contacts: 6, expiryDays: 60 };

// ─── dates (all YYYY-MM-DD strings, read as calendar days) ───
const ISO = /^\d{4}-\d{2}-\d{2}$/;
export const isIsoDate = s => typeof s === 'string' && ISO.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const utc = iso => new Date(iso + 'T00:00:00Z');
export const dmy = iso => (isIsoDate(iso) ? iso.split('-').reverse().join('/') : '');
export const weekday = (iso, lang = 'hi') => (isIsoDate(iso) ? LOCALE[lang].weekdays[utc(iso).getUTCDay()] : '');
export const monthName = (iso, lang = 'hi') => (isIsoDate(iso) ? LOCALE[lang].months[utc(iso).getUTCMonth()] : '');
export const longDate = (iso, lang = 'hi') => (isIsoDate(iso) ? `${Number(iso.slice(8))} ${monthName(iso, lang)} ${iso.slice(0, 4)}, ${weekday(iso, lang)}` : '');
export const dateAndDay = (iso, lang = 'hi') => (isIsoDate(iso) ? `${dmy(iso)}, ${weekday(iso, lang)}` : '');
export const addDays = (iso, n) => new Date(utc(iso).getTime() + n * 864e5).toISOString().slice(0, 10);
export const todayIST = (now = Date.now()) => new Date(now + 5.5 * 36e5).toISOString().slice(0, 10);

export const datedEvents = d => (d.events || []).filter(e => isIsoDate(e.date));
export const lastEventDate = d => datedEvents(d).map(e => e.date).sort().pop() || '';

// The page stays up until the end of this day; default is the day of the last programme.
export function defaultExpiry(d, today = todayIST()) {
  const last = lastEventDate(d);
  if (last && last >= today) return last;
  return addDays(today, 15);
}
export const maxExpiry = (today = todayIST()) => addDays(today, LIMITS.expiryDays);

// ─── text ───
export const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();
// Name as used inside a sentence: "श्री पूर्णानंद जी दुबे" / "Shri Purnanand Dubey" (without स्व. / Late)
export const bodyName = d => clean(`${clean(d.title).replace(/^(स्व\.|late)\s*/i, '')} ${clean(d.name)}`);
export const fullName = d => clean(`${d.title} ${d.name}`);

function join(parts, and) {
  if (parts.length < 2) return parts.join('');
  return parts.slice(0, -1).join(', ') + ` ${and} ` + parts[parts.length - 1];
}

// hi: "अत्यंत दुःख के साथ सूचित करना पड़ रहा है कि … का स्वर्गवास दिनांक 26/09/2026, शनिवार को हो गया है।"
// en: "With deep sorrow, we inform you that Shri …, beloved father of …, passed away on 26/09/2026, Saturday."
export function makeAnnouncement(d, { relations = true } = {}) {
  const who = bodyName(d) || '…';
  const rs = relations ? (d.relations || []).filter(r => clean(r.person) && clean(r.rel)) : [];
  if (d.lang === 'en') {
    const rels = rs.map(r => `${clean(r.rel)} of ${clean(r.person)}`);
    const when = isIsoDate(d.died_on) ? ` on ${dateAndDay(d.died_on, 'en')}` : '';
    return `With deep sorrow, we inform you that ${who}${rels.length ? ', ' + join(rels, 'and') + ',' : ''} passed away${when}.`;
  }
  const conn = d.gender === 'f' ? 'की' : 'के';
  const rels = rs.map(r => `${clean(r.person)} ${conn} ${clean(r.rel)}`);
  const when = isIsoDate(d.died_on) ? ` दिनांक ${dateAndDay(d.died_on)} को` : '';
  return `अत्यंत दुःख के साथ सूचित करना पड़ रहा है कि ${rels.length ? join(rels, 'एवं') + ' ' : ''}${who} का स्वर्गवास${when} हो गया है।`;
}
export const announcement = d => (d.custom_text && clean(d.announcement) ? d.announcement.trim() : makeAnnouncement(d));

// Phone helpers: store 10 digits for Indian numbers, otherwise digits as typed.
export const digits = s => String(s ?? '').replace(/\D/g, '');
export function normPhone(s) {
  const d = digits(s).replace(/^0+/, '');
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  return d;
}
export const telHref = p => 'tel:+' + (p.length === 10 ? '91' + p : p);
export const prettyPhone = p => (p.length === 10 ? p.slice(0, 5) + ' ' + p.slice(5) : p);
export function waNumber(raw) {
  const d = normPhone(raw);
  if (d.length === 10) return '91' + d;
  return d.length >= 8 ? d : '';
}

// Base64url of UTF-8 text, used for ?n=<name> in personalised links.
export const b64url = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export function fromB64url(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

export function eventLine(e, lang = 'hi') {
  const when = [dateAndDay(e.date, lang), e.time].filter(Boolean).join(' – ');
  return `${e.name}${when ? ' : ' + when : ''}`;
}

// The WhatsApp text for a personalised link. Plain "•" bullets: wa.me turns newer emoji into "?".
export function whatsappMessage(d, { greet = '', link = '' } = {}) {
  const loc = LOCALE[d.lang];
  const lines = [];
  if (greet) lines.push(greet, '');
  lines.push(makeAnnouncement(d, { relations: false }));
  const ev = (d.events || []).filter(e => clean(e.name));
  const venue = [d.venue?.name, d.venue?.address].map(clean).filter(Boolean).join(', ');
  if (ev.length || venue) lines.push('');
  for (const e of ev) lines.push('• ' + eventLine(e, d.lang));
  if (venue) lines.push(`• ${loc.venue} : ${venue}`);
  if (link) lines.push('', loc.viewLink, link);
  if (clean(d.family)) lines.push('', `${loc.bereaved} : ${clean(d.family)}`);
  return lines.join('\n');
}

// ─── validation: turn whatever the form posted into a clean, bounded record ───
const str = (v, max) => clean(v).slice(0, max);
const text = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const date = v => (isIsoDate(v) ? v : '');
function url(v) {
  const s = clean(v);
  if (!s) return '';
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href.slice(0, 500) : '';
  } catch (e) { return ''; }
}

export function normalize(input = {}) {
  const lang = langOf(input.lang); // cards saved before English existed are Hindi
  const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
  const d = {
    lang,
    template: TEMPLATES[input.template] ? input.template : 'male',
    gender: input.gender === 'f' ? 'f' : 'm',
    title: str(input.title, 30),
    name: str(input.name, 80),
    died_on: date(input.died_on),
    relations: arr(input.relations, LIMITS.relations)
      .map(r => ({ person: str(r?.person, 80), rel: str(r?.rel, 40) }))
      .filter(r => r.person || r.rel),
    custom_text: !!input.custom_text,
    announcement: text(input.announcement, 1500),
    intro: str(input.intro, 200),
    events_title: str(input.events_title, 60) || TEMPLATES.male.text[lang].events_title,
    events: arr(input.events, LIMITS.events)
      .map(e => ({ name: str(e?.name, 60), date: date(e?.date), time: str(e?.time, 60), tithi: str(e?.tithi, 60), note: str(e?.note, 80) }))
      .filter(e => e.name),
    venue: { name: str(input.venue?.name, 100), address: text(input.venue?.address, 300), map: url(input.venue?.map) },
    family: str(input.family, 100),
    contacts: arr(input.contacts, LIMITS.contacts)
      .map(c => ({ name: str(c?.name, 60), phone: normPhone(c?.phone).slice(0, 15) }))
      .filter(c => c.name && c.phone.length >= 6),
    shloka: SHLOKAS[input.shloka] ? input.shloka : 'none',
    closing: str(input.closing, 200),
  };
  if (!d.custom_text) d.announcement = '';
  return d;
}

// Returns an error message in the site language, or '' when the record can be saved.
export function problems(d, expiresOn, today = todayIST(), lang = 'hi') {
  const L = pick(lang);
  if (!d.name) return L('दिवंगत का नाम लिखें।', 'Please enter the name of the departed.');
  if (!isIsoDate(expiresOn)) return L('पेज हटने की तारीख़ चुनें।', 'Please choose the date until which the page stays.');
  if (expiresOn < today) return L('पेज हटने की तारीख़ आज या आगे की होनी चाहिए।', 'The last day must be today or later.');
  if (expiresOn > maxExpiry(today)) return L(`पेज अधिकतम ${LIMITS.expiryDays} दिन तक रखा जा सकता है।`, `A page can be kept for at most ${LIMITS.expiryDays} days.`);
  return '';
}
