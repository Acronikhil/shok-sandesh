# शोक संदेश – स्व. श्री पूर्णानंद जी दुबे

Digital condolence card (शोक संदेश) with a tappable Google Maps location, a scannable QR code and one-tap call buttons.

## Files

- `index.html` – the page (styled with Tailwind CSS utility classes)
- `send.html` – sender page: type a name, get a personalised link and send it on WhatsApp
- `generator.html` – makes the printed-style card as a PNG with the recipient's name (save to gallery / share)
- `src/styles.css` – Tailwind source: theme colours, fonts, shared styles
- `assets/styles.css` – compiled CSS served by GitHub Pages (generated, but committed)
- `assets/papa.webp` – photograph (800×800, optimised from `Papa.png`)
- `assets/lamps.webp` – hanging brass lamps cut out of the original card
- `assets/location-qr.png` – QR code for the Google Maps location
- `assets/preview.jpg` – 1200×630 preview image shown when the link is shared on WhatsApp
- `assets/card-background.jpg` – original card artwork (kept for reference)

## Personalised links

Open **https://shok.message.dubeynikhil.in/send.html**, choose the salutation, type the name
(and optionally the mobile number) and tap *WhatsApp पर भेजें*.

The link carries the name as `?n=<base64url of the UTF-8 name>` plus `&p=<n>` for the salutation
(0 श्रीमान, 1 श्रीमती, 2 आदरणीय, 3 प्रिय, 4 none). A plain `?to=Name` also works.
The page shows it at the top of the announcement, like the name line on a printed card.

## Card image generator

Open **https://shok.message.dubeynikhil.in/generator.html**, pick the salutation, type the name and tap
*गैलरी में सेव करें* or *WhatsApp / शेयर करें*. The card is drawn in the browser (canvas, Hind font)
at 2560×1800, so nothing is uploaded anywhere. `?name=…` pre-fills the name.

## Editing

```bash
npm install
npm run dev     # rebuilds assets/styles.css on every save
npm run build   # one-off minified build — run before committing
```

Always commit `assets/styles.css` after changing classes in `index.html`; GitHub Pages serves it as-is.

## Hosting

Served by GitHub Pages (branch `main`, folder `/`) at **https://shok.message.dubeynikhil.in/**.

- `CNAME` holds the custom domain.
- DNS (Hostinger, `dubeynikhil.in`): `CNAME` record `shok.message` → `acronikhil.github.io`.
- The WhatsApp preview (`og:image`) uses the full custom-domain URL.
