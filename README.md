# शोक संदेश – ऑनलाइन शोक संदेश बनाएँ

A free website where any family can make a digital condolence card (शोक संदेश) for a relative and
send it to everyone on WhatsApp with each person's name on it.

- **Account**: mobile number + password (no OTP).
- **Templates**: पिताजी/दादाजी, माताजी/दादीजी, श्रद्धांजलि सभा. The customary wording, programme
  names (उठावना, दशाकर्म, तेरहवीं, पगड़ी रस्म, ब्रह्मभोज…) and a श्लोक come pre-filled. The
  announcement sentence is built from the name, relations and date (के/की chosen automatically).
- **Card page** `/s/<slug>`: photo, programmes, venue with QR + map button, tap-to-call contacts.
  Personalised with `?n=<base64url name>&p=<salutation 0-4>`.
- **Owner tools**: personalised WhatsApp link sender (`/s/<slug>/send`) and printed-style card
  image (`/s/<slug>/image`), only for the person who made the page.
- **Auto-delete**: every page has a last day (defaults to the last programme date, at most 60 days
  ahead). After that day (IST) the page returns 410, and a nightly cron deletes the post and its photo.
- `/demo` shows a sample card with a fictional family (`/demo?card=en` for the English one).

## Languages (हिन्दी / English)

Two separate settings:

- **Site language**: buttons, help text and errors. Switched with the हिन्दी/English link in the
  top bar (`/lang?l=en`), remembered in a `lang` cookie. Default is Hindi.
- **Card language** (`d.lang`, chosen per card in the editor): all wording on the card, the WhatsApp
  text and the card image. Everyone sees a card in its own language; cards saved before English
  existed are Hindi.

Card wording lives in `LOCALE` in `public/js/shared.js`. Its word lists (titles, relations,
programme names) are index-aligned, so switching a card's language in the editor translates them
and keeps dates; typed names stay as typed. Site text is inline: `const L = pick(lang); L('हिन्दी', 'English')`.
To add a language: add a `LOCALE` entry, the template texts in `TEMPLATES`, shloka labels/sources,
`makeAnnouncement` grammar, and the second string in each `L(...)` call (or extend `pick`).

## SEO

Only the home page is meant for Google: `/` (Hindi) and `/en` (English). Each has its own title,
description, canonical URL, `hreflang` links to the other, Open Graph/Twitter tags with
`public/img/og-image.jpg` (1200×630, <300 KB for WhatsApp), JSON-LD (`WebSite`, `WebApplication`,
`FAQPage`) and a visible FAQ. `public/robots.txt` and `public/sitemap.xml` list them.

**Everything else is `noindex`**: meta tag plus an `X-Robots-Tag` header set in `worker.js`
(`INDEXABLE`). Family cards hold names and phone numbers and must never be searchable. `robots.txt`
deliberately does not block `/s/`, so crawlers can see that noindex.

Search tags always use `https://shoksandesh.dubeynikhil.in` (`SITE` in `worker.js`). If the domain
changes, update it there, in `robots.txt` and in `sitemap.xml`.

## Stack

Cloudflare Workers (free plan) + **D1** (Cloudflare's hosted SQLite). No server to look after.

| Path | What |
|---|---|
| `src/server/worker.js` | routes, JSON API, nightly cleanup (`scheduled`) |
| `src/server/auth.js` | accounts, sessions, login lock-out |
| `src/server/views/` | server-rendered HTML (card, editor, dashboard, sender, image) |
| `public/js/shared.js` | Hindi dates, templates, announcement text, validation, used by **both** server and browser |
| `public/js/*.js` | browser scripts per page |
| `migrations/` | D1 schema |
| `src/styles.css` | Tailwind source → `public/styles.css` (built, not committed) |

Passwords: the browser derives a PBKDF2-SHA256 key (150k iterations, salted with the mobile number)
and sends only that. The server stores `SHA-256(random salt ‖ key)`. The slow hashing runs on the
phone because the Workers free plan allows only ~10 ms of CPU per request. 8 wrong passwords lock
the account for 15 minutes. There is no "forgot password" yet (that would need SMS OTP).

Limits: 10 pages per account; photo is cropped to a square ≤800 px JPEG in the browser (≤600 KB).

## Run locally

```bash
npm install
npm run dev        # builds CSS, creates the local SQLite DB, serves http://localhost:8787
npm run dev:css    # (second terminal) rebuild CSS on every change
```

Trigger the nightly cleanup locally: `npx wrangler dev --test-scheduled`, then open
`http://localhost:8787/__scheduled?cron=35+18+*+*+*`.

## Deploy (free)

1. Create a free Cloudflare account, then `npx wrangler login`.
2. `npx wrangler d1 create shok-sandesh` and paste the printed `database_id` into `wrangler.jsonc`.
3. `npm run deploy`. This builds the CSS, applies migrations to the remote DB and deploys.

**Live at https://shoksandesh.dubeynikhil.in/** (custom domain set in `wrangler.jsonc` → `routes`;
Cloudflare manages its DNS record and certificate). DNS for `dubeynikhil.in` is on Cloudflare (free
plan); the domain is still registered at Hostinger. Keep the `shok.message` CNAME → `acronikhil.github.io`
set to **DNS only** (grey cloud), or GitHub Pages' HTTPS breaks.

## The original page

`index.html`, `send.html`, `generator.html` and `assets/` are the original hand-made card for
स्व. श्री पूर्णानंद जी दुबे, still served by GitHub Pages at https://shok.message.dubeynikhil.in/.
They are untouched; `npm run build:legacy` rebuilds their `assets/styles.css`.
