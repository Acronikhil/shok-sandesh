import { html, jsonScript } from '../html.js';
import { appPage } from './layout.js';
import { TEMPLATES, LOCALE, LANGS, SHLOKAS, LIMITS, pick, todayIST, maxExpiry } from '../../../public/js/shared.js';

const label = (text, hint = '') => html`<span class="mb-1.5 block text-sm font-bold text-gold-800">${text}${hint ? html` <span class="font-medium text-maroon-900/60">${hint}</span>` : ''}</span>`;

const block = (title, sub, content) => html`
  <section class="panel flex flex-col gap-4 p-5">
    <div>
      <h2 class="font-display text-xl leading-tight text-maroon-800">${title}</h2>
      ${sub ? html`<p class="text-sm leading-snug text-maroon-900/65">${sub}</p>` : ''}
    </div>
    ${content}
  </section>`;

const addBtn = (id, text) => html`<button type="button" id="${id}" class="w-fit rounded-lg border border-dashed border-gold-700 px-3 py-2 text-sm font-bold text-maroon-800 hover:bg-gold-100">+ ${text}</button>`;

// Suggestion lists for both card languages; the editor script points inputs at the right one.
const datalists = kind => Object.keys(LANGS).map(l => html`<datalist id="${kind}-${l}">${[...new Set(LOCALE[l][kind])].map(v => html`<option value="${v}">`)}</datalist>`);

/**
 * @param {object} o
 * @param {string} o.lang       site language (labels, help text)
 * @param {object} o.user
 * @param {object} o.d          initial content; d.lang is the card language
 * @param {string} o.expires    initial expiry (YYYY-MM-DD) or '' for a new page
 * @param {string} [o.slug]     editing an existing page
 * @param {string} [o.photo]    current photo URL
 */
export function editorPage({ lang, user, d, expires = '', slug = '', photo = '' }) {
  const L = pick(lang);
  const today = todayIST();
  // Placeholders are examples of what to type, so they follow the card language.
  const ph = (hi, en) => html`placeholder="${d.lang === 'en' ? en : hi}" data-ph-hi="${hi}" data-ph-en="${en}"`;
  const rowTools = html`
    <div class="order-4 flex shrink-0 gap-1">
      <button type="button" data-up title="${L('ऊपर करें', 'Move up')}" aria-label="${L('ऊपर करें', 'Move up')}" class="grid size-9 place-items-center rounded-lg border border-gold-500/60 text-maroon-800 hover:bg-gold-100">↑</button>
      <button type="button" data-remove title="${L('हटाएँ', 'Remove')}" aria-label="${L('हटाएँ', 'Remove')}" class="grid size-9 place-items-center rounded-lg border border-gold-500/60 text-maroon-800 hover:bg-gold-100">✕</button>
    </div>`;

  return appPage({
    lang,
    title: slug ? L('शोक संदेश बदलें', 'Edit message') : L('नया शोक संदेश', 'New message'),
    user,
    width: 'max-w-2xl',
    back: { href: '/my', label: L('मेरे संदेश', 'My messages') },
    scripts: ['/js/editor.js'],
    body: html`
<header>
  <h1 class="font-display text-[1.75rem] leading-tight text-maroon-800">${slug ? L('शोक संदेश बदलें', 'Edit message') : L('नया शोक संदेश', 'New condolence message')}</h1>
  <p class="text-[0.95rem] text-maroon-900/75">${L('नमूने के शब्द पहले से भरे हैं — सिर्फ़ नाम, रिश्ते, तारीख़ें और स्थान बदलें।', 'The template wording is already filled in — just change names, relations, dates and venue.')} <span class="text-maroon-900/55">* ${L('ज़रूरी', 'required')}</span></p>
</header>

<form id="editor" class="flex flex-col gap-5" autocomplete="off" novalidate data-slug="${slug}">

${block(L('कार्ड की भाषा और नमूना', 'Card language and template'), L('कार्ड, WhatsApp संदेश और कार्ड फ़ोटो इसी भाषा में बनेंगे। भाषा बदलने पर कार्यक्रम, रिश्ते और नमूने के शब्द अपने-आप बदल जाएँगे — नाम दोबारा लिखने होंगे।', 'The card, WhatsApp message and card image use this language. Switching translates programmes, relations and template wording — names need to be retyped.'), html`
  <fieldset>
    <legend class="mb-1.5 text-sm font-bold text-gold-800">${L('भाषा', 'Language')}</legend>
    <div class="flex flex-wrap gap-2">
      ${Object.entries(LANGS).map(([k, v]) => html`<label class="chip" lang="${k}"><input type="radio" name="lang" value="${k}" class="sr-only" ${d.lang === k ? 'checked' : ''}>${v}</label>`)}
    </div>
  </fieldset>
  <fieldset>
    <legend class="mb-1.5 text-sm font-bold text-gold-800">${L('नमूना', 'Template')}</legend>
    <div class="flex flex-wrap gap-2">
      ${Object.entries(TEMPLATES).map(([key, t]) => html`<label class="chip"><input type="radio" name="template" value="${key}" class="sr-only" ${d.template === key ? 'checked' : ''}>${t.label[lang]}</label>`)}
    </div>
  </fieldset>`)}

${block(L('दिवंगत', 'The departed'), '', html`
  <div class="flex items-center gap-4">
    <div class="relative shrink-0">
      <img id="photo-img" src="${photo}" alt="" width="96" height="96" class="${photo ? '' : 'hidden'} size-24 rounded-full object-cover shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">
      <span id="photo-empty" aria-hidden="true" class="${photo ? 'hidden' : ''} grid size-24 place-items-center rounded-full bg-maroon-800 text-4xl shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">🪔</span>
    </div>
    <div class="flex flex-col gap-2">
      <label class="btn-ghost cursor-pointer px-4">
        <input id="photo" type="file" accept="image/*" class="sr-only">
        <span id="photo-label" data-change="${L('फ़ोटो बदलें', 'Change photo')}" data-choose="${L('फ़ोटो चुनें', 'Choose photo')}">${photo ? L('फ़ोटो बदलें', 'Change photo') : L('फ़ोटो चुनें', 'Choose photo')}</span>
      </label>
      <button type="button" id="photo-remove" class="${photo ? '' : 'hidden'} w-fit text-sm font-semibold text-maroon-800/70 underline underline-offset-4">${L('फ़ोटो हटाएँ', 'Remove photo')}</button>
      <p class="text-xs text-maroon-900/60">${L('फ़ोटो वैकल्पिक है। बीच का चौकोर हिस्सा गोल फ़्रेम में दिखेगा।', 'Photo is optional. The centre square is shown in the round frame.')}</p>
    </div>
  </div>

  <div class="grid grid-cols-[minmax(0,8.5rem)_1fr] gap-3">
    <label class="block">${label(L('संबोधन', 'Title'))}
      <input name="title" list="titles-${d.lang}" value="${d.title}" maxlength="30" class="field font-display text-lg">
    </label>
    <label class="block">${label(L('नाम *', 'Name *'))}
      <input name="name" required value="${d.name}" maxlength="80" ${ph('जैसे: पूर्णानंद जी दुबे', 'e.g. Purnanand Dubey')} class="field font-display text-lg">
    </label>
  </div>
  ${datalists('titles')}

  <div class="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
    <fieldset>
      <legend class="mb-1.5 text-sm font-bold text-gold-800">${L('पुरुष / महिला', 'Male / Female')} <span class="font-medium text-maroon-900/60">${L('(के / की के लिए)', '(for Hindi wording)')}</span></legend>
      <div class="flex gap-2">
        <label class="chip"><input type="radio" name="gender" value="m" class="sr-only" ${d.gender !== 'f' ? 'checked' : ''}>${L('पुरुष', 'Male')}</label>
        <label class="chip"><input type="radio" name="gender" value="f" class="sr-only" ${d.gender === 'f' ? 'checked' : ''}>${L('महिला', 'Female')}</label>
      </div>
    </fieldset>
    <label class="block">${label(L('स्वर्गवास की तारीख़', 'Date of passing'))}
      <input name="died_on" type="date" value="${d.died_on}" max="${today}" class="field">
    </label>
  </div>`)}

${block(L('रिश्ते', 'Relations'), L('जैसे: “निखिल दुबे” + “पूज्य पिताजी” → “निखिल दुबे के पूज्य पिताजी”। सबसे बड़े से शुरू करें।', 'e.g. “beloved father” + “Nikhil Dubey” → “beloved father of Nikhil Dubey”. Start with the eldest.'), html`
  <ul id="relations" data-lang="${d.lang}" class="group/rel flex flex-col gap-2"></ul>
  ${addBtn('add-relation', L('रिश्ता जोड़ें', 'Add relation'))}
  ${datalists('relations')}`)}

${block(L('सूचना के शब्द', 'Announcement'), L('ऊपर के नाम, रिश्ते और तारीख़ से अपने-आप बनते हैं।', 'Written automatically from the name, relations and date above.'), html`
  <textarea name="announcement" rows="5" maxlength="1500" readonly class="field text-[1.02rem] leading-relaxed read-only:bg-cream-100 read-only:text-maroon-900/85"></textarea>
  <label class="flex items-center gap-2 text-[0.95rem] font-semibold text-maroon-800">
    <input type="checkbox" name="custom_text" ${d.custom_text ? 'checked' : ''} class="size-5 accent-maroon-800"> ${L('शब्द स्वयं लिखें / बदलें', 'Write / edit the wording myself')}
  </label>
  <label class="block">${label(L('कार्यक्रम से पहले की पंक्ति', 'Line before the programme'))}
    <input name="intro" value="${d.intro}" maxlength="200" class="field">
  </label>`)}

${block(L('कार्यक्रम', 'Programme'), L('जो कार्यक्रम आपके यहाँ नहीं हैं, उन्हें ✕ से हटा दें। सूची से चुनें या अपना नाम लिखें।', 'Remove the ones you are not holding with ✕. Pick from the list or type your own.'), html`
  <label class="block">${label(L('शीर्षक', 'Heading'))}
    <input name="events_title" value="${d.events_title}" maxlength="60" class="field">
  </label>
  <ul id="events" class="flex flex-col gap-3"></ul>
  ${addBtn('add-event', L('कार्यक्रम जोड़ें', 'Add programme'))}
  ${datalists('events')}`)}

${block(L('स्थान', 'Venue'), '', html`
  <label class="block">${label(L('स्थान का नाम', 'Venue name'))}
    <input name="venue_name" value="${d.venue.name}" maxlength="100" ${ph('जैसे: श्री गौड़ परिसर', 'e.g. Shri Gaur Parisar')} class="field">
  </label>
  <label class="block">${label(L('पता', 'Address'))}
    <textarea name="venue_address" rows="2" maxlength="300" ${ph('जैसे: उपाध्याय नगर, ब्रिज के पास, देवास', 'e.g. Upadhyay Nagar, near the bridge, Dewas')} class="field">${d.venue.address}</textarea>
  </label>
  <label class="block">${label(L('गूगल मैप लिंक', 'Google Maps link'), L('(वैकल्पिक)', '(optional)'))}
    <input name="venue_map" type="url" inputmode="url" value="${d.venue.map}" maxlength="500" placeholder="https://maps.app.goo.gl/…" class="field">
    <span class="mt-1 block text-xs text-maroon-900/60">${L('Google Maps में जगह खोलें → “Share / शेयर” → “Copy link”, फिर यहाँ पेस्ट करें। इससे QR कोड और रास्ता बटन बनेगा।', 'Open the place in Google Maps → “Share” → “Copy link”, then paste it here. This adds a QR code and a directions button.')}</span>
  </label>`)}

${block(L('शोकाकुल', 'Bereaved family'), L('कार्ड पर फ़ोन नंबर दबाकर सीधे कॉल हो सकेगा।', 'Tapping a number on the card calls it directly.'), html`
  <label class="block">${label(L('परिवार', 'Family'))}
    <input name="family" value="${d.family}" maxlength="100" ${ph('जैसे: समस्त दुबे परिवार', 'e.g. The Dubey Family')} class="field font-display text-lg">
  </label>
  <ul id="contacts" class="flex flex-col gap-2"></ul>
  ${addBtn('add-contact', L('संपर्क जोड़ें', 'Add contact'))}`)}

${block(L('श्लोक और अंतिम पंक्ति', 'Shloka and closing line'), '', html`
  <label class="block">${label(L('श्लोक', 'Shloka'))}
    <select name="shloka" class="field">
      ${Object.entries(SHLOKAS).map(([k, s]) => html`<option value="${k}" ${d.shloka === k ? 'selected' : ''}>${s.label[lang]}</option>`)}
    </select>
  </label>
  <label class="block">${label(L('अंतिम पंक्ति', 'Closing line'))}
    <input name="closing" value="${d.closing}" maxlength="200" class="field">
  </label>`)}

${block(L('पेज कब तक रहे', 'Keep the page until'), L(`इस तारीख़ के बाद पेज, फ़ोटो और नंबर अपने-आप हमेशा के लिए मिट जाएँगे। अपने-आप आख़िरी कार्यक्रम की तारीख़ भरती है (अधिकतम ${LIMITS.expiryDays} दिन)।`, `After this day the page, photo and numbers are permanently deleted. It is set to the last programme date automatically (at most ${LIMITS.expiryDays} days).`), html`
  <label class="block">${label(L('आख़िरी दिन *', 'Last day *'))}
    <input name="expires_on" type="date" required value="${expires}" min="${today}" max="${maxExpiry(today)}" data-auto="${expires ? '0' : '1'}" class="field">
  </label>`)}

<div class="sticky bottom-[max(.5rem,env(safe-area-inset-bottom))] z-20 flex flex-col gap-2 rounded-2xl bg-cream-50/90 p-2 shadow-[0_10px_30px_-10px_rgb(61_18_6/0.5)] backdrop-blur">
  <p id="error" role="alert" class="hidden rounded-lg bg-maroon-800/8 px-3 py-2 text-sm font-semibold text-maroon-800 ring-1 ring-maroon-800/25"></p>
  <button id="save" class="btn-maroon flex min-h-13 items-center justify-center rounded-xl px-4 text-lg font-bold disabled:opacity-60">${slug ? L('बदलाव सेव करें', 'Save changes') : L('सेव करें और पेज देखें', 'Save and view the page')}</button>
</div>
</form>

<template id="t-relation">
  <li class="flex items-end gap-2">
    <label class="order-1 block min-w-0 flex-[3] group-data-[lang=en]/rel:order-3"><span class="sr-only">${L('व्यक्ति का नाम', 'Person')}</span>
      <input data-k="person" maxlength="80" ${ph('जैसे: निखिल दुबे', 'e.g. Nikhil Dubey')} class="field !px-3">
    </label>
    <span class="order-2 pb-3 text-maroon-900/60" data-conn></span>
    <label class="order-3 block min-w-0 flex-[2] group-data-[lang=en]/rel:order-1"><span class="sr-only">${L('रिश्ता', 'Relation')}</span>
      <input data-k="rel" list="relations-${d.lang}" maxlength="40" ${ph('पूज्य पिताजी', 'beloved father')} class="field !px-3">
    </label>
    ${rowTools}
  </li>
</template>

<template id="t-event">
  <li class="rounded-xl border border-gold-300 bg-cream-100/60 p-3">
    <div class="flex items-end gap-2">
      <label class="block min-w-0 flex-1">${label(L('कार्यक्रम', 'Programme'))}
        <input data-k="name" list="events-${d.lang}" maxlength="60" class="field font-bold">
      </label>
      ${rowTools}
    </div>
    <div class="mt-2 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
      <label class="block">${label(L('तारीख़', 'Date'))}<input data-k="date" type="date" class="field"></label>
      <label class="block">${label(L('समय', 'Time'), L('(वैकल्पिक)', '(optional)'))}<input data-k="time" maxlength="60" ${ph('जैसे: दोपहर 1 बजे से', 'e.g. from 1 pm')} class="field"></label>
      <label class="block">${label(L('तिथि', 'Tithi'), L('(वैकल्पिक)', '(optional)'))}<input data-k="tithi" maxlength="60" ${ph('जैसे: आश्विन बदी दशमी', 'e.g. Ashwin Krishna Dashami')} class="field"></label>
      <label class="block">${label(L('सूचना', 'Note'), L('(वैकल्पिक)', '(optional)'))}<input data-k="note" maxlength="80" ${ph('जैसे: कपड़ा प्रथा बंद है', 'e.g. No clothes custom')} class="field"></label>
    </div>
  </li>
</template>

<template id="t-contact">
  <li class="flex items-end gap-2">
    <label class="block min-w-0 flex-[3]"><span class="sr-only">${L('नाम', 'Name')}</span>
      <input data-k="name" maxlength="60" ${ph('नाम', 'Name')} class="field !px-3">
    </label>
    <label class="block min-w-0 flex-[2]"><span class="sr-only">${L('मोबाइल', 'Mobile')}</span>
      <input data-k="phone" type="tel" inputmode="tel" maxlength="16" placeholder="${L('मोबाइल', 'Mobile')}" class="field !px-3 tabular-nums">
    </label>
    ${rowTools}
  </li>
</template>

<script type="application/json" id="initial">${jsonScript({ d })}</script>`,
  });
}
