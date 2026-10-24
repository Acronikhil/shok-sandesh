import qrcode from 'qrcode-generator';
import { html, raw, esc, jsonScript } from '../html.js';
import { page, siteFooter } from './layout.js';
import { SYMBOLS, GARLAND, DIYA } from './ornaments.js';
import {
  SHLOKAS, LOCALE, pick, announcement, bodyName, fullName, dmy, dateAndDay, weekday, monthName, longDate, isIsoDate,
  telHref, prettyPhone, clean,
} from '../../../public/js/shared.js';

const lotus = cls => html`<svg aria-hidden="true" class="${cls} text-gold-700"><use href="#lotus"/></svg>`;

function sectionTitle(id, text) {
  return html`<h2 id="${id}" class="section-title">
      <span aria-hidden="true" class="rule"></span>
      ${lotus('h-3.5 w-6 shrink-0')}
      <span>${text}</span>
      ${lotus('h-3.5 w-6 shrink-0')}
      <span aria-hidden="true" class="rule rule-r"></span>
    </h2>`;
}

// QR code as a crisp inline SVG path (no client script, no image request).
function qrSvg(text, alt) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return raw(`<svg viewBox="-2 -2 ${n + 4} ${n + 4}" class="size-24" shape-rendering="crispEdges" role="img" aria-label="${alt}"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`);
}

// Announcement text with the person's name and the date in bold, line breaks kept.
function richAnnouncement(d) {
  let s = esc(announcement(d));
  const name = esc(bodyName(d));
  if (name) s = s.replace(name, `<strong class="font-display text-[1.2rem] font-normal whitespace-nowrap text-maroon-800">${name}</strong>`);
  if (isIsoDate(d.died_on)) {
    const when = esc(dateAndDay(d.died_on, d.lang));
    s = s.replace(when, `<strong class="font-bold whitespace-nowrap">${when}</strong>`);
  }
  return raw(s.replace(/\n/g, '<br>'));
}

function eventItem(e, lang) {
  const loc = LOCALE[lang];
  return html`<li class="panel event">
    ${isIsoDate(e.date)
      ? html`<time datetime="${e.date}" class="date-tile">
          <span class="text-3xl leading-none font-extrabold">${e.date.slice(8)}</span>
          <span class="mt-1 text-sm leading-none font-semibold text-gold-300">${monthName(e.date, lang)}</span>
          <span class="mt-1 text-xs leading-none opacity-85">${weekday(e.date, lang)}</span>
        </time>`
      : html`<span aria-hidden="true" class="date-tile text-3xl">🪔</span>`}
    <div class="flex min-w-0 flex-col justify-center py-1">
      <h3 class="text-xl font-extrabold text-maroon-800">${e.name}</h3>
      ${isIsoDate(e.date) ? html`<p class="text-[0.975rem] leading-snug">${loc.datePrefix}${dateAndDay(e.date, lang)}</p>` : ''}
      ${e.tithi ? html`<p class="text-[0.975rem] leading-snug text-gold-800">${e.tithi}</p>` : ''}
      ${e.time ? html`<p class="text-[0.975rem] leading-snug text-gold-800">${e.time}</p>` : ''}
      ${e.note ? html`<p class="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-maroon-800/8 px-2 py-0.5 text-sm font-bold text-maroon-800 ring-1 ring-maroon-800/20">
          <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>
          ${e.note}
        </p>` : ''}
    </div>
  </li>`;
}

const toolLink = (href, title, sub, svg) => html`
  <a href="${href}" class="group panel tool-link">
    <span class="call-dot">${svg}</span>
    <span class="min-w-0">
      <span class="block leading-tight font-bold text-maroon-800">${title}</span>
      <span class="block text-sm leading-snug text-maroon-900/70">${sub}</span>
    </span>
  </a>`;

const ICON_LINK = raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>');
const ICON_CARD = raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/><path d="M15 17l2 2 3-3"/></svg>');
const ICON_EDIT = raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>');

/**
 * @param {object} o
 * @param {object} o.d          normalised content (see shared.normalize)
 * @param {string} o.url        absolute public URL of this card
 * @param {string} [o.photo]    photo URL, if one was uploaded
 * @param {string} [o.base]     link prefix for owner tools, e.g. /s/abc123
 * @param {boolean} [o.owner]   show send / image / edit tools
 * @param {string} [o.expires]  YYYY-MM-DD, shown to the owner
 * @param {boolean} [o.demo]    sample page (no owner tools, "create your own" call to action)
 */
export function cardPage({ d, url, ui = 'hi', photo = '', base = '', owner = false, expires = '', demo = false, editHref = '' }) {
  const loc = LOCALE[d.lang];
  const L = pick(ui); // owner tools and the demo banner follow the visitor's site language
  const shloka = SHLOKAS[d.shloka] || SHLOKAS.none;
  const name = fullName(d);
  const venueText = [d.venue.name, d.venue.address].filter(Boolean).join(', ');
  const description = [d.events.slice(0, 3).map(e => clean(`${e.name} ${dmy(e.date)}`)).join(' • '), d.venue.name].filter(Boolean).join(' • ');
  const share = {
    lang: d.lang,
    title: `${loc.heading} – ${name}`,
    text: [`${loc.heading} – ${name}`, d.events.slice(0, 3).map(e => clean(`${e.name} : ${dmy(e.date)}`)).join(' • '), venueText].filter(Boolean).join('\n'),
    url,
  };

  const body = html`
<svg aria-hidden="true" class="hidden">${raw(SYMBOLS)}</svg>

<div class="mx-auto max-w-2xl p-2 pt-[max(.5rem,env(safe-area-inset-top))] pb-[max(.5rem,env(safe-area-inset-bottom))] sm:p-6">
${demo ? html`<p lang="${ui}" class="mb-2 rounded-xl bg-maroon-800 px-4 py-2 text-center text-sm font-semibold text-cream-50">${L('यह एक नमूना है', 'This is a sample')} — <a href="/signup" class="underline decoration-gold-300 underline-offset-4">${L('अपना शोक संदेश बनाएँ', 'Create your own')}</a></p>` : ''}
<div class="card-frame relative">
  <svg aria-hidden="true" class="absolute top-0 left-0 size-12 text-gold-700 sm:size-16"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute top-0 right-0 size-12 -scale-x-100 text-gold-700 sm:size-16"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute bottom-0 left-0 size-12 -scale-y-100 text-gold-700 sm:size-16"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute right-0 bottom-0 size-12 -scale-100 text-gold-700 sm:size-16"><use href="#corner"/></svg>

<main class="relative flex flex-col gap-7 px-4 pt-6 pb-10 sm:gap-9 sm:px-10 sm:pt-8">

  <header class="text-center">
    <p class="font-display text-lg text-gold-800">॥ ॐ शांति ॥</p>

    <div class="relative mx-auto -mt-1 aspect-square w-full max-w-[420px]">
      <svg aria-hidden="true" class="absolute top-[40%] left-1/2 aspect-square w-[98%] -translate-1/2 text-gold-500/40 motion-safe:animate-[spin_240s_linear_infinite]"><use href="#mandala"/></svg>
      <div aria-hidden="true" class="absolute top-[40%] left-1/2 size-[78%] -translate-1/2 rounded-full bg-[radial-gradient(circle,#fff8df_0%,#fff8df00_68%)]"></div>

      <img src="/img/lamps.webp" alt="" width="222" height="355" class="lamp absolute top-0 left-[1%] w-[22%]">
      <img src="/img/lamps.webp" alt="" width="222" height="355" class="lamp lamp-r absolute top-0 right-[1%] w-[22%]">

      <div class="photo-frame absolute top-[40%] left-1/2 aspect-square w-[62%] -translate-1/2 rounded-full p-[3%]">
        <div class="rounded-full bg-maroon-800 p-[2.2%] shadow-[inset_0_0_0_1px_#e9c46a]">
          ${photo
            ? html`<img src="${photo}" width="800" height="800" alt="${name}" class="block aspect-square w-full rounded-full object-cover">`
            : html`<div class="grid aspect-square w-full place-items-center rounded-full bg-[radial-gradient(circle,#7a2410,#3d1206)]">${raw(DIYA.replace('class="h-16 w-18"', 'class="w-1/2"'))}</div>`}
        </div>
      </div>

      ${raw(GARLAND)}
    </div>

    <p class="-mt-1 flex items-center justify-center gap-3 text-lg font-bold text-gold-800 sm:text-xl">
      ${lotus('h-3.5 w-6')} ${loc.heading} ${lotus('h-3.5 w-6')}
    </p>

    <h1 class="mt-2 font-display leading-tight">
      ${d.title ? html`<span class="block text-xl text-maroon-700 sm:text-2xl">${d.title}</span>` : ''}
      <span class="text-gilded block break-words ${d.lang === 'en' ? 'text-[2.2rem] sm:text-5xl' : 'text-[2.4rem] sm:text-6xl'}">${d.name}</span>
    </h1>

    ${isIsoDate(d.died_on) ? html`
    <p class="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-500/60 bg-cream-50 px-4 py-1.5 text-[0.95rem] text-maroon-900 shadow-[0_2px_8px_-2px_rgb(154_107_18/0.35)]">
      <span class="font-semibold text-gold-800">${loc.passed}</span>
      <span aria-hidden="true" class="size-1 rounded-full bg-gold-500"></span>
      <time datetime="${d.died_on}">${longDate(d.died_on, d.lang)}</time>
    </p>` : ''}
  </header>

  <section aria-label="${loc.noticeLabel}" class="panel px-5 py-6 text-center sm:px-8">
    <div id="recipient" hidden class="mb-5 border-b border-gold-300 pb-4">
      <p id="r-prefix" class="text-[1.05rem] font-semibold text-gold-800"></p>
      <p id="r-name" class="font-display text-[1.75rem] leading-snug break-words text-maroon-800 sm:text-3xl"></p>
    </div>
    <p class="text-[1.075rem] leading-[1.85] text-pretty">${richAnnouncement(d)}</p>
    ${d.intro && d.events.length ? html`<p class="mt-4 border-t border-gold-300 pt-4 text-[1.05rem] font-semibold text-maroon-800">${d.intro}</p>` : ''}
  </section>

  ${d.events.length ? html`
  <section aria-labelledby="karyakram">
    ${sectionTitle('karyakram', d.events_title)}
    <ol class="flex flex-col gap-3">${d.events.map(e => eventItem(e, d.lang))}</ol>
  </section>` : ''}

  ${d.venue.name || d.venue.address ? html`
  <section aria-labelledby="sthan" class="panel overflow-hidden">
    <div class="flex items-center gap-4 p-5">
      <div class="min-w-0 flex-1">
        <h2 id="sthan" class="flex items-center gap-2 text-lg font-extrabold text-maroon-800">
          <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5 text-gold-700" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
          ${loc.venue}
        </h2>
        <address class="mt-1 text-[1.05rem] leading-relaxed not-italic">
          ${d.venue.name ? html`<span class="font-bold">${d.venue.name}</span>${d.venue.address ? raw(',<br>') : ''}` : ''}
          ${raw(esc(d.venue.address).replace(/\n/g, '<br>'))}
        </address>
      </div>
      ${d.venue.map ? html`
      <a href="${d.venue.map}" target="_blank" rel="noopener" class="shrink-0 rounded-xl border border-gold-300 bg-white p-1.5 text-center shadow-sm transition hover:shadow-md">
        ${qrSvg(d.venue.map, loc.qrAlt)}
        <span class="mt-0.5 block text-xs font-semibold text-gold-800">${loc.scanQr}</span>
      </a>` : ''}
    </div>
    ${d.venue.map ? html`
    <a href="${d.venue.map}" target="_blank" rel="noopener" class="btn-maroon flex min-h-14 items-center justify-center gap-2.5 px-4 text-lg font-bold">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></svg>
      ${loc.directions}
    </a>` : ''}
  </section>` : ''}

  ${d.family || d.contacts.length ? html`
  <section aria-labelledby="shokakul" class="text-center">
    ${sectionTitle('shokakul', loc.bereaved)}
    ${d.family ? html`<p class="-mt-2 mb-4 font-display text-2xl text-maroon-800">${d.family}</p>` : ''}
    ${d.contacts.length ? html`
    <ul class="grid grid-cols-1 gap-3 ${d.contacts.length > 1 ? 'min-[400px]:grid-cols-2' : 'mx-auto max-w-xs'}">
      ${d.contacts.map(c => html`
      <li>
        <a href="${telHref(c.phone)}" class="group panel contact">
          <span class="call-dot"><svg aria-hidden="true" class="size-5"><use href="#phone"/></svg></span>
          <span class="min-w-0">
            <span class="block text-lg leading-tight font-bold break-words text-maroon-800">${c.name}</span>
            <span class="block tracking-wide tabular-nums text-maroon-900/80">${prettyPhone(c.phone)}</span>
          </span>
        </a>
      </li>`)}
    </ul>` : ''}
  </section>` : ''}

  ${shloka.lines.length ? html`
  <figure class="shloka relative overflow-hidden rounded-2xl px-6 py-8 text-center text-gold-100 sm:px-10">
    <svg aria-hidden="true" class="absolute -top-20 -right-20 size-56 text-gold-300/15"><use href="#mandala"/></svg>
    <svg aria-hidden="true" class="absolute -bottom-20 -left-20 size-56 text-gold-300/15"><use href="#mandala"/></svg>
    <svg aria-hidden="true" class="relative mx-auto mb-3 h-5 w-9 text-gold-300"><use href="#lotus"/></svg>
    <blockquote lang="${shloka.lang}" class="relative font-sanskrit text-[1.15rem] leading-[1.9] sm:text-[1.3rem]">
      ${raw(shloka.lines.map(esc).join('<br>'))}
    </blockquote>
    <figcaption class="relative mt-4 text-sm tracking-wide text-gold-300">— ${shloka.source[d.lang]}</figcaption>
  </figure>` : ''}

  <footer class="flex flex-col items-center text-center">
    ${raw(DIYA)}
    <p class="mt-2 font-display text-2xl text-maroon-800">ॐ शान्तिः शान्तिः शान्तिः</p>
    ${d.closing ? html`<p class="mt-1 text-[0.95rem] text-maroon-900/75">${d.closing}</p>` : ''}

    <button type="button" id="share"
            class="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-maroon-800 bg-cream-50/70 px-6 font-bold text-maroon-800 transition hover:bg-maroon-800 hover:text-cream-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
      ${loc.share}
    </button>

    ${owner ? html`
    <nav aria-labelledby="tools-title" lang="${ui}" class="mt-8 w-full">
      <h2 id="tools-title" class="section-title !mb-1 !text-lg">
        <span aria-hidden="true" class="rule"></span>
        <span>${L('संदेश भेजने के लिए', 'Send this message')}</span>
        <span aria-hidden="true" class="rule rule-r"></span>
      </h2>
      <p class="mb-3 text-xs text-maroon-900/60">${L('ये विकल्प सिर्फ़ आपको (पेज बनाने वाले को) दिखते हैं।', 'Only you (the creator of this page) can see these options.')}${expires ? L(` यह पेज ${dmy(expires)} के बाद अपने-आप हट जाएगा।`, ` This page will be deleted automatically after ${dmy(expires)}.`) : ''}</p>
      <div class="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        ${toolLink(`${base}/send`, L('डिजिटल कार्ड भेजें', 'Send the digital card'), L('नाम वाला वेबसाइट लिंक WhatsApp पर', 'A link with their name, on WhatsApp'), ICON_LINK)}
        ${toolLink(`${base}/image`, L('कार्ड फ़ोटो बनाएँ', 'Make a card image'), L('नाम सहित शोक पत्र, गैलरी में सेव करें', 'Printed-style card with their name'), ICON_CARD)}
        ${editHref ? toolLink(editHref, L('संदेश बदलें', 'Edit message'), L('तारीख़, स्थान, फ़ोटो या शब्द बदलें', 'Change dates, venue, photo or text'), ICON_EDIT) : ''}
        ${toolLink('/my', L('मेरे संदेश', 'My messages'), L('आपके बनाए सभी शोक संदेश', 'All messages you have made'), ICON_CARD)}
      </div>
    </nav>` : ''}

    <a href="${demo ? '/signup' : '/'}" class="mt-8 text-sm text-maroon-900/60 underline decoration-gold-500/60 underline-offset-4 hover:text-maroon-800">
      ${loc.makeOwn}
    </a>
  </footer>

</main>
</div>
</div>

${siteFooter(d.lang)}

<div id="petals" aria-hidden="true" class="pointer-events-none fixed inset-0 z-10 overflow-hidden"></div>
<script type="application/json" id="share-data">${jsonScript(share)}</script>`;

  return page({
    lang: d.lang,
    title: `${loc.heading} – ${name}`,
    description,
    og: { title: `${loc.heading} – ${name}`, description: description || `${name} – ${loc.heading}`, url, image: photo ? new URL(photo, url).href : '' },
    head: photo ? html`<link rel="preload" as="image" href="${photo}">` : '',
    body,
    scripts: ['/js/card.js'],
  });
}
