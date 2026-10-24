import { normPhone, clean, pick } from './shared.js';

const L = pick(document.documentElement.lang);

// The password never leaves the phone: we send a PBKDF2 key derived from it (see src/server/auth.js).
const ITERATIONS = 150000;
async function deriveKey(mobile, password) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('shok-sandesh:v1:' + mobile), iterations: ITERATIONS },
    base, 256,
  );
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const form = document.getElementById('auth');
const errEl = document.getElementById('error');
const mode = form.dataset.mode;
const showError = msg => { errEl.textContent = msg; errEl.classList.toggle('hidden', !msg); };

form.addEventListener('submit', async e => {
  e.preventDefault();
  showError('');
  const f = Object.fromEntries(new FormData(form));
  const mobile = mode === 'password' ? form.dataset.mobile : normPhone(f.mobile);
  if (mode === 'signup' && !clean(f.name)) return showError(L('अपना नाम लिखें।', 'Please enter your name.'));
  if (!/^[6-9]\d{9}$/.test(mobile)) return showError(L('सही 10 अंकों का मोबाइल नंबर लिखें।', 'Please enter a valid 10-digit mobile number.'));
  if (!f.password || (mode !== 'login' && f.password.length < 6)) return showError(L('पासवर्ड कम से कम 6 अक्षर का रखें।', 'The password must be at least 6 characters.'));
  if (mode !== 'login' && f.password !== f.password2) return showError(L('दोनों पासवर्ड एक जैसे नहीं हैं।', 'The two passwords do not match.'));

  const btn = form.querySelector('button');
  btn.disabled = true;
  try {
    const key = await deriveKey(mobile, f.password);
    const body = mode === 'signup' ? { name: clean(f.name), mobile, key }
      : mode === 'login' ? { mobile, key }
      : { old: await deriveKey(mobile, f.old || ''), key };
    const res = await fetch(mode === 'password' ? '/api/password' : '/api/' + mode, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || L('कुछ गड़बड़ हुई, फिर से कोशिश करें।', 'Something went wrong, please try again.'));
    location.href = out.next || '/my';
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
  }
});
