# शोक संदेश – स्व. श्री पूर्णानंद जी दुबे

Digital condolence card (शोक संदेश) with a tappable Google Maps location, a scannable QR code and one-tap call buttons.

## Files

- `index.html` – the web page
- `assets/card-background.jpg` – card background with photo
- `assets/location-qr.png` – QR code for the Google Maps location
- `assets/preview.jpg` – preview image shown when the link is shared on WhatsApp

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub, for example `shok-sandesh`.
2. Push this folder:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/shok-sandesh.git
   git push -u origin main
   ```
   (Or upload the files with **Add file → Upload files** on GitHub.)
3. In the repo, open **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, and click **Save**.
4. After 1–2 minutes the page is live at:
   `https://YOUR-USERNAME.github.io/shok-sandesh/`

## WhatsApp preview image

WhatsApp needs a full address for the preview image. After publishing, edit `index.html` and change

```html
<meta property="og:image" content="assets/preview.jpg">
```

to

```html
<meta property="og:image" content="https://YOUR-USERNAME.github.io/shok-sandesh/assets/preview.jpg">
```
