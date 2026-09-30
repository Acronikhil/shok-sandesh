# शोक संदेश – स्व. श्री पूर्णानंद जी दुबे

Digital condolence card (शोक संदेश) with a tappable Google Maps location, a scannable QR code and one-tap call buttons.

## Files

- `index.html` – the page (styled with Tailwind CSS utility classes)
- `src/styles.css` – Tailwind source: theme colours, fonts, shared styles
- `assets/styles.css` – compiled CSS served by GitHub Pages (generated, but committed)
- `assets/portrait.jpg` – portrait with lamps and garland shown at the top
- `assets/location-qr.png` – QR code for the Google Maps location
- `assets/preview.jpg` – preview image shown when the link is shared on WhatsApp
- `assets/card-background.jpg` – original card artwork (kept for reference)

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
