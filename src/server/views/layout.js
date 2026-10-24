import { html, raw } from '../html.js';
import { LANGS, pick } from '../../../public/js/shared.js';

const FONTS = 'https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Mukta:wght@400;500;600;700;800&family=Tiro+Devanagari+Hindi&family=Tiro+Devanagari+Sanskrit&display=swap';
const FAVICON = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪔</text></svg>';

export const CORNER_SYMBOL = raw(`<svg aria-hidden="true" class="hidden"><symbol id="corner" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M3 62V18A15 15 0 0 1 18 3h44" stroke-width="1.6"/><path d="M9 62V22A13 13 0 0 1 22 9h40" stroke-width=".9"/></g><g fill="currentColor"><path d="M17 10l7 7l-7 7l-7-7z"/><circle cx="32" cy="17" r="1.6"/><circle cx="17" cy="32" r="1.6"/><circle cx="40" cy="17" r="1"/><circle cx="17" cy="40" r="1"/></g></symbol></svg>`);

export const corners = (size = 'size-12 sm:size-16') => html`
  <svg aria-hidden="true" class="absolute top-0 left-0 ${size} text-gold-700"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute top-0 right-0 ${size} -scale-x-100 text-gold-700"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute bottom-0 left-0 ${size} -scale-y-100 text-gold-700"><use href="#corner"/></svg>
  <svg aria-hidden="true" class="absolute right-0 bottom-0 ${size} -scale-100 text-gold-700"><use href="#corner"/></svg>`;

// Full HTML document.
export function page({ lang = 'hi', title, description = '', body, head = '', scripts = [], noindex = true, og = null }) {
  return html`<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
${description ? html`<meta name="description" content="${description}">` : ''}
${noindex ? raw('<meta name="robots" content="noindex, nofollow">') : ''}
${og ? html`<meta property="og:type" content="website">
<meta property="og:title" content="${og.title}">
<meta property="og:description" content="${og.description}">
<meta property="og:url" content="${og.url}">
${og.image ? html`<meta property="og:image" content="${og.image}"><meta name="twitter:card" content="summary_large_image">` : ''}` : ''}
<meta name="theme-color" content="#5a1608">
<link rel="icon" href="${raw(FAVICON)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${head}
</head>
<body class="bg-page min-h-dvh font-sans text-maroon-900 antialiased">
${body}
${scripts.map(s => html`<script type="module" src="${s}"></script>`)}
</body>
</html>`.toString();
}

// Framed page used by every app screen (login, dashboard, editor…).
// Language switch: a plain link, the server sets a cookie and sends the visitor back.
export const langSwitch = lang => {
  const other = lang === 'en' ? 'hi' : 'en';
  return html`<a href="/lang?l=${other}" lang="${other}" class="rounded-full border border-gold-500/70 bg-cream-50 px-2.5 py-0.5 text-sm font-semibold text-maroon-800 hover:bg-gold-100">${LANGS[other]}</a>`;
};

export function appPage({ lang = 'hi', title, user = null, width = 'max-w-xl', body, scripts = [], back = null }) {
  const L = pick(lang);
  return page({
    lang,
    title: `${title} – ${L('शोक संदेश', 'Shok Sandesh')}`,
    scripts,
    body: html`
${CORNER_SYMBOL}
<div class="mx-auto ${width} p-2 pt-[max(.5rem,env(safe-area-inset-top))] pb-[max(.5rem,env(safe-area-inset-bottom))] sm:p-6">
  <nav class="mb-2 flex items-center justify-between gap-3 px-2 text-[0.95rem]">
    <a href="${user ? '/my' : '/'}" class="flex shrink-0 items-center gap-1.5 font-display text-lg text-maroon-800"><span aria-hidden="true">🪔</span> ${L('शोक संदेश', 'Shok Sandesh')}</a>
    <div class="flex min-w-0 items-center gap-3">
      ${langSwitch(lang)}
      ${user
        ? html`<form method="post" action="/logout" class="flex min-w-0 items-center gap-3">
            <span class="hidden max-w-[8rem] truncate text-maroon-900/70 min-[420px]:block">${user.name}</span>
            <button class="shrink-0 font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('लॉग आउट', 'Log out')}</button>
          </form>`
        : html`<a href="/login" class="shrink-0 font-semibold text-maroon-800 underline decoration-gold-500 underline-offset-4">${L('लॉग इन', 'Log in')}</a>`}
    </div>
  </nav>
  <div class="card-frame relative">
    ${corners('size-12')}
    <main class="relative flex flex-col gap-6 px-5 pt-8 pb-10 sm:px-8">
      ${back ? html`<a href="${back.href}" class="-mb-3 w-fit text-[0.95rem] font-semibold text-maroon-800/80 hover:text-maroon-800">← ${back.label}</a>` : ''}
      ${body}
    </main>
  </div>
</div>`,
  });
}

export function messagePage({ lang = 'hi', title, text, user = null, status = 200 }) {
  return new Response(
    appPage({
      lang,
      title,
      user,
      body: html`
        <div class="flex flex-col items-center gap-3 py-6 text-center">
          <p class="text-5xl" aria-hidden="true">🪔</p>
          <h1 class="font-display text-2xl text-maroon-800">${title}</h1>
          <p class="text-pretty text-maroon-900/80">${text}</p>
          <a href="/" class="btn-ghost mt-3 px-6">${pick(lang)('मुख्य पृष्ठ पर जाएँ', 'Go to the home page')}</a>
        </div>`,
    }),
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export const icon = {
  wa: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-6" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'),
  link: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>'),
  card: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/><path d="M15 17l2 2 3-3"/></svg>'),
  share: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>'),
  copy: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>'),
  edit: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'),
  eye: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'),
  save: raw('<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>'),
};
