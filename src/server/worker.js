import { createUser, checkLogin, setPassword, startSession, endSession, cookieToken, currentUser, validKey, randomSlug } from './auth.js';
import { messagePage } from './views/layout.js';
import { cardPage } from './views/card.js';
import { landingPage, authPage, dashboardPage, accountPage } from './views/home.js';
import { editorPage } from './views/editor.js';
import { sendPage, imagePage } from './views/tools.js';
import { demo } from './demo.js';
import { TEMPLATES, LANGS, blank, langOf, pick, normalize, problems, todayIST, normPhone, clean } from '../../public/js/shared.js';

const MAX_POSTS_PER_USER = 10;
const MAX_PHOTO_BYTES = 600 * 1024;

const htmlRes = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-cache', ...headers } });
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
const redirect = (to, headers = {}) => new Response(null, { status: 303, headers: { Location: to, ...headers } });
const fail = (error, status = 400) => json({ error }, status);

// Only accept state-changing requests that come from our own pages.
const sameOrigin = (req, url) => req.headers.get('Origin') === url.origin;

// Site language: a cookie set by /lang; Hindi until the visitor picks English.
const siteLang = req => langOf((req.headers.get('Cookie') || '').match(/(?:^|;\s*)lang=(\w+)/)?.[1]);
const langCookie = l => `lang=${l}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`;

// Only the two home pages may appear in search results. Everything else — above all the family
// cards and their photos, which hold names and phone numbers — is marked noindex.
const INDEXABLE = new Set(['/', '/en']);
// Canonical address used in search tags, whatever host or scheme a request came in on.
const SITE = 'https://shoksandesh.dubeynikhil.in';

async function readJson(req) {
  try { return await req.json(); } catch (e) { return null; }
}

async function getPost(db, slug) {
  const p = await db
    .prepare('SELECT p.id, p.slug, p.user_id, p.data, p.expires_on, ph.version AS photo_version FROM posts p LEFT JOIN photos ph ON ph.post_id = p.id WHERE p.slug = ?')
    .bind(slug)
    .first();
  if (!p) return null;
  // Past its last day but the nightly cleanup hasn't run yet: treat as gone.
  if (p.expires_on < todayIST()) return { expired: true };
  return { ...p, d: normalize(JSON.parse(p.data)) };
}

const photoUrl = p => (p.photo_version ? `/s/${p.slug}/photo?v=${p.photo_version}` : '');

// Delete everything whose last day is over (IST). Photos and sessions go with their rows.
export async function cleanup(db, now = Date.now()) {
  const today = todayIST(now);
  const res = await db.batch([
    db.prepare('DELETE FROM photos WHERE post_id IN (SELECT id FROM posts WHERE expires_on < ?)').bind(today),
    db.prepare('DELETE FROM posts WHERE expires_on < ?').bind(today),
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
  ]);
  return { posts: res[1].meta.changes, sessions: res[2].meta.changes };
}

// Mobile numbers: Indian 10-digit, starting 6-9.
const validMobile = m => /^[6-9]\d{9}$/.test(m);

async function api(req, env, url, user, lang) {
  const db = env.DB;
  const path = url.pathname;
  const L = pick(lang);
  const LOCKED = L('बहुत बार ग़लत पासवर्ड डाला गया। 15 मिनट बाद फिर कोशिश करें।', 'Too many wrong passwords. Please try again in 15 minutes.');
  if (!sameOrigin(req, url)) return fail(L('अमान्य अनुरोध।', 'Invalid request.'), 403);

  if (path === '/api/signup' && req.method === 'POST') {
    const b = await readJson(req);
    const mobile = normPhone(b?.mobile), name = clean(b?.name).slice(0, 60);
    if (!name) return fail(L('अपना नाम लिखें।', 'Please enter your name.'));
    if (!validMobile(mobile)) return fail(L('सही 10 अंकों का मोबाइल नंबर लिखें।', 'Please enter a valid 10-digit mobile number.'));
    if (!validKey(b?.key)) return fail(L('पासवर्ड सही नहीं है।', 'Invalid password.'));
    const id = await createUser(db, { mobile, name, key: b.key });
    if (!id) return fail(L('इस मोबाइल नंबर से खाता पहले से बना है। लॉग इन करें।', 'An account with this mobile number already exists. Please log in.'), 409);
    return json({ ok: true, next: '/my' }, 200, { 'Set-Cookie': await startSession(db, id) });
  }

  if (path === '/api/login' && req.method === 'POST') {
    const b = await readJson(req);
    const mobile = normPhone(b?.mobile);
    const WRONG = L('मोबाइल नंबर या पासवर्ड ग़लत है।', 'Wrong mobile number or password.');
    if (!validMobile(mobile) || !validKey(b?.key)) return fail(WRONG, 401);
    const r = await checkLogin(db, mobile, b.key);
    if (r?.locked) return fail(LOCKED, 429);
    if (!r) return fail(WRONG, 401);
    return json({ ok: true, next: '/my' }, 200, { 'Set-Cookie': await startSession(db, r.id) });
  }

  if (!user) return fail(L('कृपया फिर से लॉग इन करें।', 'Please log in again.'), 401);

  if (path === '/api/password' && req.method === 'POST') {
    const b = await readJson(req);
    if (!validKey(b?.old) || !validKey(b?.key)) return fail(L('पासवर्ड सही नहीं है।', 'Invalid password.'));
    const r = await checkLogin(db, user.mobile, b.old);
    if (r?.locked) return fail(LOCKED, 429);
    if (!r) return fail(L('पुराना पासवर्ड ग़लत है।', 'Current password is wrong.'), 401);
    await setPassword(db, user.id, b.key);
    return json({ ok: true, next: '/my' });
  }

  if (path === '/api/posts' && req.method === 'POST') {
    const b = await readJson(req);
    const d = normalize(b?.data);
    const err = problems(d, b?.expires_on, todayIST(), lang);
    if (err) return fail(err);
    const { n } = await db.prepare('SELECT COUNT(*) AS n FROM posts WHERE user_id = ?').bind(user.id).first();
    if (n >= MAX_POSTS_PER_USER) return fail(L(`एक खाते से अधिकतम ${MAX_POSTS_PER_USER} संदेश बन सकते हैं। पुराने संदेश हटाकर फिर कोशिश करें।`, `An account can have at most ${MAX_POSTS_PER_USER} messages. Delete an old one and try again.`));
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      const slug = randomSlug();
      const row = await db
        .prepare('INSERT INTO posts (slug, user_id, data, expires_on, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING RETURNING slug')
        .bind(slug, user.id, JSON.stringify(d), b.expires_on, now, now)
        .first();
      if (row) return json({ ok: true, slug });
    }
    return fail(L('कुछ गड़बड़ हुई, फिर से कोशिश करें।', 'Something went wrong, please try again.'), 500);
  }

  const m = path.match(/^\/api\/posts\/([a-z0-9]{6,16})(\/photo)?$/);
  if (m) {
    const post = await getPost(db, m[1]);
    if (!post || post.expired || post.user_id !== user.id) return fail(L('यह संदेश नहीं मिला।', 'Message not found.'), 404);

    if (!m[2] && req.method === 'PUT') {
      const b = await readJson(req);
      const d = normalize(b?.data);
      const err = problems(d, b?.expires_on, todayIST(), lang);
      if (err) return fail(err);
      await db.prepare('UPDATE posts SET data = ?, expires_on = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(d), b.expires_on, Date.now(), post.id).run();
      return json({ ok: true, slug: post.slug });
    }
    if (!m[2] && req.method === 'DELETE') {
      await db.batch([
        db.prepare('DELETE FROM photos WHERE post_id = ?').bind(post.id),
        db.prepare('DELETE FROM posts WHERE id = ?').bind(post.id),
      ]);
      return json({ ok: true });
    }
    if (m[2] && req.method === 'PUT') {
      const mime = (req.headers.get('Content-Type') || '').split(';')[0];
      if (!['image/jpeg', 'image/webp', 'image/png'].includes(mime)) return fail(L('फ़ोटो JPG/PNG होनी चाहिए।', 'The photo must be JPG/PNG.'));
      const bytes = new Uint8Array(await req.arrayBuffer());
      if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) return fail(L('फ़ोटो बहुत बड़ी है।', 'The photo is too large.'));
      const magic = { 'image/jpeg': [0xff, 0xd8], 'image/png': [0x89, 0x50], 'image/webp': [0x52, 0x49] }[mime];
      if (bytes[0] !== magic[0] || bytes[1] !== magic[1]) return fail(L('फ़ोटो सही नहीं है।', 'This is not a valid photo.'));
      const version = Date.now();
      await db
        .prepare('INSERT INTO photos (post_id, mime, bytes, version) VALUES (?, ?, ?, ?) ON CONFLICT(post_id) DO UPDATE SET mime = excluded.mime, bytes = excluded.bytes, version = excluded.version')
        .bind(post.id, mime, bytes, version)
        .run();
      return json({ ok: true, photo: `/s/${post.slug}/photo?v=${version}` });
    }
    if (m[2] && req.method === 'DELETE') {
      await db.prepare('DELETE FROM photos WHERE post_id = ?').bind(post.id).run();
      return json({ ok: true });
    }
  }
  return fail(L('नहीं मिला।', 'Not found.'), 404);
}

async function handle(req, env) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const db = env.DB;
  const lang = siteLang(req);
  const L = pick(lang);
  const user = await currentUser(db, req);
  const notFound = (title, text) => messagePage({ lang, title, text, user, status: 404 });

  if (path.startsWith('/api/')) return api(req, env, url, user, lang);

  if (path === '/logout' && req.method === 'POST') {
    if (!sameOrigin(req, url)) return fail(L('अमान्य अनुरोध।', 'Invalid request.'), 403);
    return redirect('/', { 'Set-Cookie': await endSession(db, cookieToken(req)) });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });

  // Language switch: remember the choice and go back to the page it was clicked on.
  if (path === '/lang') {
    const l = langOf(url.searchParams.get('l'));
    let back = '/';
    try {
      const ref = new URL(req.headers.get('Referer') || '');
      if (ref.origin === url.origin) back = ref.pathname + ref.search;
    } catch (e) {}
    // The home page has one address per language (for Google): / is Hindi, /en is English.
    if (back === '/' || back === '/en') back = l === 'en' ? '/en' : '/';
    return redirect(back, { 'Set-Cookie': langCookie(l) });
  }

  if (path === '/') return lang === 'en' ? redirect('/en') : htmlRes(landingPage({ user, lang, origin: SITE }));
  // Arriving on /en (e.g. from Google) also switches the rest of the site to English.
  if (path === '/en') return htmlRes(landingPage({ user, lang: 'en', origin: SITE }), 200, lang === 'en' ? {} : { 'Set-Cookie': langCookie('en') });
  if (path === '/demo') {
    // ?card=en shows the English sample regardless of the site language
    const cardLang = LANGS[url.searchParams.get('card')] ? url.searchParams.get('card') : lang;
    return htmlRes(cardPage({ d: normalize(demo(cardLang)), url: url.origin + '/demo', ui: lang, demo: true }));
  }
  if (path === '/login' || path === '/signup') return user ? redirect('/my') : htmlRes(authPage({ mode: path.slice(1), lang }));

  // Public card and its photo
  const s = path.match(/^\/s\/([a-z0-9]{6,16})(?:\/(photo|send|image))?$/);
  if (s) {
    const [, slug, sub] = s;
    if (sub === 'photo') {
      const ph = await db.prepare('SELECT ph.mime, ph.bytes FROM photos ph JOIN posts p ON p.id = ph.post_id WHERE p.slug = ? AND p.expires_on >= ?').bind(slug, todayIST()).first();
      if (!ph) return new Response('Not found', { status: 404 });
      return new Response(new Uint8Array(ph.bytes), {
        headers: { 'Content-Type': ph.mime, 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    const post = await getPost(db, slug);
    if (!post) return notFound(L('शोक संदेश नहीं मिला', 'Message not found'), L('लिंक जाँच लें। हो सकता है यह पेज हटा दिया गया हो।', 'Please check the link. This page may have been deleted.'));
    if (post.expired) {
      return messagePage({
        lang, user, status: 410,
        title: L('यह शोक संदेश अब उपलब्ध नहीं है', 'This message is no longer available'),
        text: L('कार्यक्रम की तारीख़ निकल जाने के बाद पेज और उसकी सारी जानकारी अपने-आप हटा दी जाती है।', 'Once the last programme date has passed, the page and all its details are deleted automatically.'),
      });
    }
    const owner = !!user && user.id === post.user_id;
    const base = `/s/${slug}`;
    const photo = photoUrl(post);
    if (!sub) {
      return htmlRes(cardPage({ d: post.d, url: url.origin + base, ui: lang, photo, base, owner, expires: owner ? post.expires_on : '', editHref: owner ? `/edit/${slug}` : '' }));
    }
    // The sending tools only make sense for the family member who made the page.
    if (!owner) return user ? redirect(base) : redirect('/login');
    if (sub === 'send') return htmlRes(sendPage({ lang, user, d: post.d, url: url.origin + base, base, photo }));
    return htmlRes(imagePage({ lang, user, d: post.d, base, photo }));
  }

  // Everything below needs an account
  if (!user) return redirect('/login');

  if (path === '/my') {
    const { results } = await db
      .prepare('SELECT p.slug, p.data, p.expires_on, ph.version AS photo_version FROM posts p LEFT JOIN photos ph ON ph.post_id = p.id WHERE p.user_id = ? AND p.expires_on >= ? ORDER BY p.created_at DESC')
      .bind(user.id, todayIST())
      .all();
    return htmlRes(dashboardPage({ lang, user, posts: results.map(p => ({ ...p, d: normalize(JSON.parse(p.data)) })) }));
  }
  if (path === '/account') return htmlRes(accountPage({ lang, user }));
  if (path === '/new') {
    const t = TEMPLATES[url.searchParams.get('t')] ? url.searchParams.get('t') : 'male';
    return htmlRes(editorPage({ lang, user, d: blank(t, lang) }));
  }
  const e = path.match(/^\/edit\/([a-z0-9]{6,16})$/);
  if (e) {
    const post = await getPost(db, e[1]);
    if (!post || post.expired || post.user_id !== user.id) return notFound(L('शोक संदेश नहीं मिला', 'Message not found'), L('यह संदेश आपके खाते में नहीं है या हटा दिया गया है।', 'This message is not in your account or has been deleted.'));
    return htmlRes(editorPage({ lang, user, d: post.d, expires: post.expires_on, slug: post.slug, photo: photoUrl(post) }));
  }

  return notFound(L('पेज नहीं मिला', 'Page not found'), L('यह पता सही नहीं है।', 'This address is not right.'));
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

export default {
  async fetch(req, env) {
    let res;
    try {
      res = await handle(req, env);
    } catch (err) {
      console.error(err);
      const L = pick(siteLang(req));
      res = messagePage({ lang: siteLang(req), title: L('कुछ गड़बड़ हुई', 'Something went wrong'), text: L('कृपया थोड़ी देर बाद फिर से कोशिश करें।', 'Please try again in a little while.'), status: 500 });
    }
    res = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
    if (!INDEXABLE.has(new URL(req.url).pathname) || res.status !== 200) res.headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex');
    return res;
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(cleanup(env.DB, event.scheduledTime).then(r => console.log('cleanup', r)));
  },
};
