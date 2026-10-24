import { html } from '../html.js';
import { appPage, icon } from './layout.js';
import { TEMPLATES, templateHint, pick, dmy, todayIST, fullName } from '../../../public/js/shared.js';

const step = (n, title, text) => html`
  <li class="panel flex gap-3 p-4">
    <span class="date-tile !w-11 shrink-0 !py-1 text-xl font-extrabold">${n}</span>
    <span>
      <span class="block font-bold text-maroon-800">${title}</span>
      <span class="block text-[0.95rem] leading-snug text-maroon-900/75">${text}</span>
    </span>
  </li>`;

const templateCards = (lang, href, plus = '') => html`
  <ul class="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
    ${Object.entries(TEMPLATES).map(([key, t]) => html`
    <li><a href="${href(key)}" class="panel tool-link h-full !flex-col !items-start !gap-1">
      <span class="font-bold text-maroon-800">${plus}${t.label[lang]}</span>
      <span class="text-sm leading-snug text-maroon-900/70">${templateHint(key, lang)}</span>
    </a></li>`)}
  </ul>`;

const PORTFOLIO = 'https://www.dubeynikhil.in/';

// Questions people actually search for; shown on the page and sent to Google as FAQ data.
const FAQ = {
  hi: [
    ['शोक संदेश क्या होता है?', 'शोक संदेश वह सूचना है जिससे परिवार किसी परिजन के स्वर्गवास की ख़बर और उठावना, दशाकर्म, तेरहवीं, पगड़ी रस्म या श्रद्धांजलि सभा जैसे उत्तरकार्य कार्यक्रमों की तारीख़ और स्थान रिश्तेदारों व परिचितों तक पहुँचाता है।'],
    ['ऑनलाइन शोक संदेश कैसे बनाएँ?', 'मोबाइल नंबर से खाता बनाएँ, पिताजी, माताजी या श्रद्धांजलि सभा का नमूना चुनें, नाम, रिश्ते, फ़ोटो, कार्यक्रम की तारीख़ें और स्थान भरें — शोक संदेश का पेज तुरंत तैयार हो जाता है।'],
    ['क्या शोक संदेश WhatsApp पर नाम के साथ भेज सकते हैं?', 'हाँ। हर रिश्तेदार के लिए “श्रीमान / आदरणीय + नाम” वाला अलग लिंक या छपे हुए कार्ड जैसी फ़ोटो बनाकर सीधे WhatsApp पर भेज सकते हैं।'],
    ['क्या यह सेवा निःशुल्क है?', 'हाँ, पूरी तरह निःशुल्क है। कोई विज्ञापन या शुल्क नहीं है।'],
    ['शोक संदेश का पेज कब तक रहता है?', 'आख़िरी कार्यक्रम की तारीख़ (या आपकी चुनी तारीख़, अधिकतम 60 दिन) तक। उसके बाद पेज, फ़ोटो और फ़ोन नंबर अपने-आप हमेशा के लिए मिट जाते हैं।'],
    ['क्या शोक संदेश अंग्रेज़ी में भी बन सकता है?', 'हाँ। हर शोक संदेश हिन्दी या अंग्रेज़ी में बनाया जा सकता है — शब्द, कार्यक्रम के नाम और तारीख़ें उसी भाषा में आती हैं।'],
  ],
  en: [
    ['What is a shok sandesh?', 'A shok sandesh is a condolence message a family sends to relatives and friends to announce the passing of a loved one, along with the dates and venue of rituals such as Uthamna, Dashakarma, Tehravi, Pagdi Rasm or a prayer meeting.'],
    ['How do I create a condolence message online?', 'Sign up with your mobile number, pick a template (father, mother or prayer meeting), fill in the name, relations, photo, ritual dates and venue — your condolence page is ready instantly.'],
    ['Can I send it on WhatsApp with each person’s name?', 'Yes. Make a separate link with “Dear / Respected + name”, or a printed-style card image, for every relative and send it straight to WhatsApp.'],
    ['Is it free?', 'Yes, completely free, with no ads.'],
    ['How long does the page stay online?', 'Until the last ritual date (or a date you choose, at most 60 days). After that the page, photo and phone numbers are permanently deleted automatically.'],
    ['Can I make it in Hindi or English?', 'Yes. Each message can be in Hindi or English — the wording, ritual names and dates all follow that language.'],
  ],
};

function landingSeo(lang, origin) {
  const L = pick(lang);
  const url = origin + (lang === 'en' ? '/en' : '/');
  const title = L('शोक संदेश ऑनलाइन बनाएँ – निःशुल्क उठावना, तेरहवीं व श्रद्धांजलि कार्ड',
    'Create a Shok Sandesh Online – Free Condolence Message & Uthamna Card');
  const description = L('अपने परिजन का सुंदर डिजिटल शोक संदेश मिनटों में बनाएँ — फ़ोटो, उत्तरकार्य कार्यक्रम (उठावना, दशाकर्म, तेरहवीं, पगड़ी रस्म), स्थान का नक्शा और परिवार के नंबर। हर रिश्तेदार को नाम के साथ WhatsApp पर भेजें। निःशुल्क।',
    'Make a dignified digital condolence message (shok sandesh) in minutes — photo, rituals (Uthamna, Tehravi, Pagdi Rasm, prayer meeting), venue map and family contacts. Send it on WhatsApp with each relative’s name. Free, in Hindi or English.');
  const image = origin + '/img/og-image.jpg';
  return {
    title, description, noindex: false, canonical: url,
    alternates: { hi: origin + '/', en: origin + '/en', 'x-default': origin + '/' },
    og: { title, description, url, image, imageAlt: L('शोक संदेश – ऑनलाइन शोक संदेश बनाएँ', 'Shok Sandesh – create a condolence message online'), imageSize: [1200, 630] },
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'WebSite',
        name: 'शोक संदेश', alternateName: ['Shok Sandesh', 'Condolence Message'], url: origin + '/', inLanguage: ['hi', 'en'],
      },
      {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: L('शोक संदेश', 'Shok Sandesh'), url, description, inLanguage: lang,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', image,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        author: { '@type': 'Person', name: 'Nikhil Dubey', url: PORTFOLIO },
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
        mainEntity: FAQ[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}

export function landingPage({ user, lang, origin }) {
  const L = pick(lang);
  return appPage({
    lang,
    title: L('ऑनलाइन शोक संदेश बनाएँ', 'Create a condolence message online'),
    seo: landingSeo(lang, origin),
    user,
    width: 'max-w-2xl',
    body: html`
      <header class="text-center">
        <p class="font-display text-lg text-gold-800">॥ ॐ शांति ॥</p>
        <h1 class="mt-1 font-display text-[2rem] leading-tight text-maroon-800 sm:text-4xl">${L(html`अपने परिजन का शोक संदेश<br>ऑनलाइन बनाएँ`, html`Create a condolence message<br>for your loved one`)}</h1>
        <p class="mx-auto mt-3 max-w-md text-pretty text-[1.05rem] text-maroon-900/80">
          ${L('फ़ोटो, उत्तरकार्य कार्यक्रम, स्थान का नक्शा और परिवार के फ़ोन नंबर — एक सुंदर पेज पर। हर रिश्तेदार को उनके नाम के साथ WhatsApp पर भेजें। पूरी तरह निःशुल्क।',
            'Photo, rituals and prayer meeting details, a map to the venue and family phone numbers — on one dignified page. Send it to every relative on WhatsApp with their name on it. Completely free.')}
        </p>
        <div class="mt-5 flex flex-col justify-center gap-2.5 min-[420px]:flex-row">
          <a href="${user ? '/my' : '/signup'}" class="btn-maroon inline-flex min-h-13 items-center justify-center rounded-xl px-6 text-lg font-bold">
            ${user ? L('मेरे शोक संदेश', 'My messages') : L('शोक संदेश बनाएँ', 'Create a message')}
          </a>
          <a href="/demo" class="btn-ghost px-6">${icon.eye} ${L('नमूना देखें', 'See a sample')}</a>
        </div>
      </header>

      <section aria-labelledby="how">
        <h2 id="how" class="section-title !text-xl"><span aria-hidden="true" class="rule"></span><span>${L('कैसे बनाएँ', 'How it works')}</span><span aria-hidden="true" class="rule rule-r"></span></h2>
        <ol class="flex flex-col gap-3">
          ${step(1, L('मोबाइल नंबर से खाता बनाएँ', 'Sign up with your mobile number'), L('सिर्फ़ नाम, मोबाइल नंबर और पासवर्ड — कोई OTP नहीं।', 'Just your name, mobile number and a password — no OTP.'))}
          ${step(2, L('तैयार नमूना चुनें', 'Pick a ready-made template'), L('हिन्दी या अंग्रेज़ी में। शब्द, कार्यक्रम और श्लोक पहले से भरे मिलेंगे। बस नाम, रिश्ते और तारीख़ें लिखें।', 'In Hindi or English. The wording, rituals and a shloka are already filled in — just add names, relations and dates.'))}
          ${step(3, L('नाम के साथ भेजें', 'Send it by name'), L('हर व्यक्ति के लिए उनके नाम वाला लिंक या कार्ड की फ़ोटो बनाकर WhatsApp पर भेजें।', 'Make a link or a card image with each person\'s name and send it on WhatsApp.'))}
        </ol>
      </section>

      <section aria-labelledby="templates">
        <h2 id="templates" class="section-title !text-xl"><span aria-hidden="true" class="rule"></span><span>${L('नमूने', 'Templates')}</span><span aria-hidden="true" class="rule rule-r"></span></h2>
        ${templateCards(lang, key => (user ? `/new?t=${key}` : '/signup'))}
      </section>

      <section class="panel p-5 text-[0.95rem] leading-relaxed">
        <h2 class="mb-2 font-bold text-maroon-800">${L('आपकी जानकारी सुरक्षित', 'Your information stays private')}</h2>
        <ul class="flex list-disc flex-col gap-1 pl-5 text-maroon-900/80">
          <li>${L(html`आख़िरी कार्यक्रम की तारीख़ (या आपकी चुनी तारीख़) निकलते ही पेज, फ़ोटो और फ़ोन नंबर अपने-आप <strong>हमेशा के लिए मिटा</strong> दिए जाते हैं।`,
            html`After the last ritual (or the date you choose), the page, photo and phone numbers are <strong>permanently deleted</strong> automatically.`)}</li>
          <li>${L('पेज गूगल पर नहीं दिखता — सिर्फ़ जिन्हें आप लिंक भेजें, वही देख सकते हैं।', 'Pages are hidden from Google — only people you send the link to can see them.')}</li>
          <li>${L('कोई विज्ञापन नहीं, कोई शुल्क नहीं।', 'No ads, no charges.')}</li>
        </ul>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq" class="section-title !text-xl"><span aria-hidden="true" class="rule"></span><span>${L('अक्सर पूछे जाने वाले प्रश्न', 'Frequently asked questions')}</span><span aria-hidden="true" class="rule rule-r"></span></h2>
        <div class="flex flex-col gap-2">
          ${FAQ[lang].map(([q, a]) => html`
          <details class="panel group px-4 py-3">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-maroon-800 [&::-webkit-details-marker]:hidden">
              <h3 class="text-[1rem]">${q}</h3>
              <span aria-hidden="true" class="shrink-0 text-gold-700 transition group-open:rotate-45">+</span>
            </summary>
            <p class="mt-2 text-[0.95rem] leading-relaxed text-maroon-900/80">${a}</p>
          </details>`)}
        </div>
      </section>`,
  });
}

const errorBox = html`<p id="error" role="alert" class="hidden rounded-lg bg-maroon-800/8 px-3 py-2 text-sm font-semibold text-maroon-800 ring-1 ring-maroon-800/25"></p>`;
const label = (text, hint = '') => html`<span class="mb-1.5 block text-sm font-bold text-gold-800">${text}${hint ? html` <span class="font-medium text-maroon-900/60">${hint}</span>` : ''}</span>`;

export function authPage({ mode, lang }) {
  const L = pick(lang);
  const signup = mode === 'signup';
  const link = 'font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4';
  return appPage({
    lang,
    title: signup ? L('खाता बनाएँ', 'Sign up') : L('लॉग इन', 'Log in'),
    scripts: ['/js/auth.js'],
    body: html`
      <header class="text-center">
        <h1 class="font-display text-[1.75rem] text-maroon-800">${signup ? L('नया खाता बनाएँ', 'Create an account') : L('लॉग इन करें', 'Log in')}</h1>
        <p class="text-[0.95rem] text-maroon-900/75">${L('अपने शोक संदेश देखने और बदलने के लिए।', 'To see and edit your condolence messages.')}</p>
      </header>
      <form id="auth" data-mode="${mode}" class="panel flex flex-col gap-4 p-5" novalidate>
        ${signup ? html`
        <label class="block">${label(L('आपका नाम', 'Your name'))}
          <input name="name" required maxlength="60" autocomplete="name" placeholder="${L('जैसे: निखिल दुबे', 'e.g. Nikhil Dubey')}" class="field text-lg">
        </label>` : ''}
        <label class="block">${label(L('मोबाइल नंबर', 'Mobile number'))}
          <input name="mobile" type="tel" inputmode="numeric" required maxlength="14" autocomplete="tel-national" placeholder="98xxxxxxxx" class="field text-lg tracking-wide tabular-nums">
        </label>
        <label class="block">${label(L('पासवर्ड', 'Password'), signup ? L('(कम से कम 6 अक्षर)', '(at least 6 characters)') : '')}
          <input name="password" type="password" required minlength="6" maxlength="100" autocomplete="${signup ? 'new-password' : 'current-password'}" class="field text-lg">
        </label>
        ${signup ? html`
        <label class="block">${label(L('पासवर्ड दोबारा', 'Confirm password'))}
          <input name="password2" type="password" required minlength="6" maxlength="100" autocomplete="new-password" class="field text-lg">
        </label>
        <p class="text-xs leading-snug text-maroon-900/60">${L('पासवर्ड याद रखें — अभी भूले हुए पासवर्ड को बदलने की सुविधा नहीं है।', 'Please remember your password — there is no "forgot password" option yet.')}</p>` : ''}
        ${errorBox}
        <button class="btn-maroon flex min-h-13 items-center justify-center rounded-xl px-4 text-lg font-bold disabled:opacity-60">
          ${signup ? L('खाता बनाएँ', 'Create account') : L('लॉग इन', 'Log in')}
        </button>
        <noscript><p class="text-sm font-semibold text-maroon-800">${L('इस पेज के लिए ब्राउज़र में JavaScript चालू होनी चाहिए।', 'This page needs JavaScript turned on in your browser.')}</p></noscript>
      </form>
      <p class="text-center text-[0.95rem]">
        ${signup
          ? html`${L('पहले से खाता है?', 'Already have an account?')} <a href="/login" class="${link}">${L('लॉग इन करें', 'Log in')}</a>`
          : html`${L('नया खाता?', 'New here?')} <a href="/signup" class="${link}">${L('यहाँ बनाएँ', 'Create an account')}</a>`}
      </p>`,
  });
}

function daysLeft(expires, today, L) {
  const n = Math.round((Date.parse(expires) - Date.parse(today)) / 864e5);
  if (n <= 0) return L('आज रात हट जाएगा', 'deleted tonight');
  if (n === 1) return L('कल रात हट जाएगा', 'deleted tomorrow night');
  return L(`${n} दिन बाद हट जाएगा`, `deleted in ${n} days`);
}

const action = (href, label, svg, extra = '') => html`
  <a href="${href}" ${extra} class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gold-500/70 bg-cream-50 px-3 text-sm font-bold text-maroon-800 hover:bg-gold-100">${svg}${label}</a>`;

export function dashboardPage({ user, posts, lang }) {
  const L = pick(lang);
  const today = todayIST();
  return appPage({
    lang,
    title: L('मेरे शोक संदेश', 'My messages'),
    user,
    scripts: ['/js/dashboard.js'],
    body: html`
      <header>
        <h1 class="font-display text-[1.75rem] leading-tight text-maroon-800">${L('मेरे शोक संदेश', 'My condolence messages')}</h1>
        <p class="text-[0.95rem] text-maroon-900/75">${L('हर संदेश अपनी तारीख़ के बाद अपने-आप हट जाता है।', 'Each message is deleted automatically after its last day.')}</p>
      </header>

      ${posts.length ? html`
      <ul class="flex flex-col gap-3">
        ${posts.map(p => html`
        <li class="panel flex flex-col gap-3 p-4" data-slug="${p.slug}">
          <div class="flex items-start gap-3">
            ${p.photo_version
              ? html`<img src="/s/${p.slug}/photo?v=${p.photo_version}" alt="" width="56" height="56" class="size-14 shrink-0 rounded-full object-cover shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">`
              : html`<span aria-hidden="true" class="grid size-14 shrink-0 place-items-center rounded-full bg-maroon-800 text-2xl shadow-[0_0_0_2px_#fffdf6,0_0_0_4px_#c9974a]">🪔</span>`}
            <div class="min-w-0 flex-1">
              <p lang="${p.d.lang}" class="font-display text-xl leading-tight break-words text-maroon-800">${fullName(p.d)}</p>
              <p class="mt-0.5 text-sm text-maroon-900/70">${L(`${dmy(p.expires_on)} तक`, `until ${dmy(p.expires_on)}`)} • ${daysLeft(p.expires_on, today, L)} • ${p.d.lang === 'en' ? 'English' : 'हिन्दी'}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            ${action(`/s/${p.slug}`, L('देखें', 'View'), icon.eye, 'target="_blank" rel="noopener"')}
            ${action(`/s/${p.slug}/send`, L('नाम से भेजें', 'Send by name'), icon.link)}
            ${action(`/s/${p.slug}/image`, L('कार्ड फ़ोटो', 'Card image'), icon.card)}
            ${action(`/edit/${p.slug}`, L('बदलें', 'Edit'), icon.edit)}
            <button type="button" data-delete="${p.slug}" class="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-maroon-800/70 underline underline-offset-4 hover:text-maroon-800">${L('हटाएँ', 'Delete')}</button>
          </div>
        </li>`)}
      </ul>` : html`
      <p class="panel p-5 text-center text-maroon-900/75">${L('अभी आपने कोई शोक संदेश नहीं बनाया है। नीचे से एक नमूना चुनकर शुरू करें।', 'You have not made any messages yet. Pick a template below to start.')}</p>`}

      <section aria-labelledby="new-title">
        <h2 id="new-title" class="section-title !mb-3 !text-xl"><span aria-hidden="true" class="rule"></span><span>${L('नया शोक संदेश', 'New message')}</span><span aria-hidden="true" class="rule rule-r"></span></h2>
        ${templateCards(lang, key => `/new?t=${key}`, '+ ')}
        <p class="mt-2 text-center text-xs text-maroon-900/60">${L('कार्ड की भाषा (हिन्दी / English) अगले पेज पर चुन सकते हैं।', 'You can choose the card language (हिन्दी / English) on the next page.')}</p>
      </section>

      <p class="text-center text-sm text-maroon-900/60">
        ${L('मोबाइल', 'Mobile')}: ${user.mobile} • <a href="/account" class="font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('पासवर्ड बदलें', 'Change password')}</a>
      </p>
      <p id="toast" role="status" class="hidden rounded-lg bg-maroon-800 px-3 py-2 text-center text-sm font-semibold text-cream-50"></p>`,
  });
}

export function accountPage({ user, lang }) {
  const L = pick(lang);
  return appPage({
    lang,
    title: L('पासवर्ड बदलें', 'Change password'),
    user,
    back: { href: '/my', label: L('मेरे संदेश', 'My messages') },
    scripts: ['/js/auth.js'],
    body: html`
      <h1 class="font-display text-[1.75rem] text-maroon-800">${L('पासवर्ड बदलें', 'Change password')}</h1>
      <form id="auth" data-mode="password" data-mobile="${user.mobile}" class="panel flex flex-col gap-4 p-5" novalidate>
        <label class="block">${label(L('पुराना पासवर्ड', 'Current password'))}
          <input name="old" type="password" required autocomplete="current-password" class="field text-lg">
        </label>
        <label class="block">${label(L('नया पासवर्ड', 'New password'), L('(कम से कम 6 अक्षर)', '(at least 6 characters)'))}
          <input name="password" type="password" required minlength="6" maxlength="100" autocomplete="new-password" class="field text-lg">
        </label>
        <label class="block">${label(L('नया पासवर्ड दोबारा', 'Confirm new password'))}
          <input name="password2" type="password" required minlength="6" maxlength="100" autocomplete="new-password" class="field text-lg">
        </label>
        ${errorBox}
        <button class="btn-maroon flex min-h-13 items-center justify-center rounded-xl px-4 text-lg font-bold disabled:opacity-60">${L('पासवर्ड बदलें', 'Change password')}</button>
      </form>`,
  });
}
