import { html, jsonScript } from '../html.js';
import { appPage, icon } from './layout.js';
import { fullName, LOCALE, pick } from '../../../public/js/shared.js';

// Salutation chips are in the card's language, because they end up on the card and in the message.
const salutations = (d, values, L) => html`
  <fieldset>
    <legend class="mb-2 text-sm font-bold text-gold-800">${L('संबोधन', 'Salutation')}</legend>
    <div class="flex flex-wrap gap-2" lang="${d.lang}">
      ${LOCALE[d.lang].salutations.map((t, i) => html`<label class="chip"><input type="radio" name="p" value="${values[i]}" class="sr-only" ${i === 0 ? 'checked' : ''}>${t}</label>`)}
    </div>
  </fieldset>`;

const header = (photo, title, sub) => html`
  <header class="flex items-center gap-4">
    ${photo
      ? html`<img src="${photo}" alt="" width="64" height="64" class="size-16 shrink-0 rounded-full object-cover shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">`
      : html`<span aria-hidden="true" class="grid size-16 shrink-0 place-items-center rounded-full bg-maroon-800 text-3xl shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">🪔</span>`}
    <div>
      <h1 class="font-display text-2xl leading-tight text-maroon-800">${title}</h1>
      <p class="text-[0.95rem] text-maroon-900/75">${sub}</p>
    </div>
  </header>`;

export function sendPage({ lang, user, d, url, base, photo }) {
  const L = pick(lang);
  return appPage({
    lang,
    title: L('नाम से भेजें', 'Send by name'),
    user,
    back: { href: base, label: fullName(d) },
    scripts: ['/js/send.js'],
    body: html`
  ${header(photo, L('व्यक्तिगत शोक संदेश भेजें', 'Send a personal message'), L('नाम लिखें — उनके नाम के साथ संदेश का लिंक बनेगा।', 'Type a name — you get a link to the message with their name on it.'))}

  <form id="form" class="panel flex flex-col gap-5 p-5" autocomplete="off">
    ${salutations(d, [0, 1, 2, 3, 4], L)}

    <label class="block">
      <span class="mb-1.5 block text-sm font-bold text-gold-800">${L('नाम', 'Name')}</span>
      <input id="name" name="name" required maxlength="80" enterkeyhint="send" placeholder="${d.lang === 'en' ? 'e.g. Manoj Tiwari ji' : 'जैसे: मनोज शास्त्री तिवारी जी'}" class="field font-display text-xl">
    </label>

    <label class="block">
      <span class="mb-1.5 block text-sm font-bold text-gold-800">${L('मोबाइल नंबर', 'Mobile number')} <span class="font-medium text-maroon-900/60">${L('(वैकल्पिक — सीधे उनकी WhatsApp चैट खुलेगी)', '(optional — opens their WhatsApp chat directly)')}</span></span>
      <input id="phone" name="phone" type="tel" inputmode="tel" maxlength="16" placeholder="98xxxxxxxx" class="field tracking-wide tabular-nums">
    </label>

    <div aria-live="polite" class="rounded-xl border border-dashed border-gold-500/70 bg-cream-100 px-4 py-4 text-center">
      <p class="text-xs font-semibold tracking-wide text-gold-800/80">${L('कार्ड पर ऐसा दिखेगा', 'How it appears on the card')}</p>
      <p id="pv-prefix" lang="${d.lang}" class="mt-2 text-[1.05rem] font-semibold text-gold-800"></p>
      <p id="pv-name" lang="${d.lang}" data-empty="${d.lang === 'en' ? 'Their name' : 'आपका नाम'}" class="font-display text-[1.6rem] leading-snug break-words text-maroon-800/40"></p>
    </div>

    <div class="flex flex-col gap-2.5">
      <button type="submit" class="btn-wa flex min-h-13 items-center justify-center gap-2.5 rounded-xl px-4 text-lg font-bold text-white">${icon.wa} ${L('WhatsApp पर भेजें', 'Send on WhatsApp')}</button>
      <div class="grid grid-cols-2 gap-2.5">
        <button type="button" id="copy" class="btn-ghost">${icon.copy}<span>${L('संदेश कॉपी करें', 'Copy message')}</span></button>
        <button type="button" id="other" class="btn-ghost">${icon.share} ${L('अन्य ऐप से भेजें', 'Other apps')}</button>
      </div>
      <a id="open" href="${url}" target="_blank" rel="noopener" class="mt-1 text-center text-[0.95rem] font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('पहले कार्ड खोलकर देखें ↗', 'Preview the card first ↗')}</a>
      <a href="${base}/image" class="text-center text-[0.95rem] font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('नाम वाला कार्ड फ़ोटो (इमेज) बनाएँ →', 'Make a card image with the name →')}</a>
    </div>
    <p id="toast" role="status" class="hidden rounded-lg bg-maroon-800 px-3 py-2 text-center text-sm font-semibold text-cream-50"></p>
  </form>

  <section id="sent-box" hidden aria-labelledby="sent-title">
    <div class="mb-2 flex items-baseline justify-between">
      <h2 id="sent-title" class="font-display text-xl text-maroon-800">${L('भेजे गए', 'Sent')} <span id="sent-count" class="font-sans text-base text-gold-800"></span></h2>
      <button type="button" id="clear" class="text-sm font-semibold text-maroon-800/70 underline underline-offset-4">${L('सूची हटाएँ', 'Clear list')}</button>
    </div>
    <p class="mb-3 text-xs text-maroon-900/60">${L('यह सूची सिर्फ़ इसी फ़ोन/ब्राउज़र में रहती है।', 'This list stays only on this phone/browser.')}</p>
    <ul id="sent" class="flex flex-col gap-2"></ul>
  </section>
  <script type="application/json" id="data">${jsonScript({ d, url })}</script>`,
  });
}

export function imagePage({ lang, user, d, base, photo }) {
  const L = pick(lang);
  return appPage({
    lang,
    title: L('कार्ड फ़ोटो बनाएँ', 'Make a card image'),
    user,
    width: 'max-w-3xl',
    back: { href: base, label: fullName(d) },
    scripts: ['/js/card-image.js'],
    body: html`
  ${header(photo, L('शोक संदेश कार्ड बनाएँ', 'Make a condolence card'), L('नाम लिखें, कार्ड की फ़ोटो गैलरी में सेव करें या सीधे भेजें।', 'Type a name, then save the card image to your gallery or send it directly.'))}

  <form id="form" class="panel flex flex-col gap-5 p-5" autocomplete="off">
    ${salutations(d, LOCALE[d.lang].prefixes, L)}
    <label class="block">
      <span class="mb-1.5 block text-sm font-bold text-gold-800">${L('नाम', 'Name')}</span>
      <input id="name" maxlength="60" enterkeyhint="done" placeholder="${d.lang === 'en' ? 'e.g. Manoj Tiwari ji' : 'जैसे: मनोज शास्त्री तिवारी जी'}" class="field font-display text-xl">
    </label>
  </form>

  <section aria-label="${L('कार्ड', 'Card')}" class="flex flex-col gap-4">
    <canvas id="card" class="block h-auto w-full rounded-md bg-white shadow-[0_0_0_1px_#e3c787,0_14px_34px_-14px_rgb(61_18_6/0.55)]" role="img" aria-label="${LOCALE[d.lang].heading}"></canvas>
    <div class="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
      <button type="button" id="save" class="btn-maroon flex min-h-13 items-center justify-center gap-2.5 rounded-xl px-4 text-lg font-bold">${icon.save} ${L('गैलरी में सेव करें', 'Save to gallery')}</button>
      <button type="button" id="share" class="btn-wa flex min-h-13 items-center justify-center gap-2.5 rounded-xl px-4 text-lg font-bold text-white">${icon.wa} ${L('WhatsApp / शेयर करें', 'WhatsApp / Share')}</button>
    </div>
    <p id="toast" role="status" class="hidden rounded-lg bg-maroon-800 px-3 py-2 text-center text-sm font-semibold text-cream-50"></p>
    <p class="text-center text-xs text-maroon-900/60">${L('iPhone पर: “शेयर करें” दबाकर “Save Image” चुनें — फ़ोटो सीधे गैलरी में चली जाएगी।', 'On iPhone: tap “Share” and choose “Save Image” to put it straight into Photos.')}</p>
    <p class="text-center text-[0.95rem]">
      <a href="${base}/send" class="font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('नाम वाला वेबसाइट लिंक भेजना है? यहाँ जाएँ →', 'Want to send a link with their name instead? →')}</a>
    </p>
  </section>
  <script type="application/json" id="data">${jsonScript({ d })}</script>`,
  });
}
