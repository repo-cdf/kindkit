/* =====================================================================
   Kindkit — core (router, UI helpers, ads, donations)
   ===================================================================== */

/* ---------------- SETTINGS — edit these ---------------- */
const CONFIG = {
  siteName: 'Kindkit',
  siteUrl: 'https://repo-cdf.github.io/kindkit/',
  repoUrl: 'https://github.com/repo-cdf/kindkit',

  // PayPal donations
  paypalEmail: 'rayan6razan@gmail.com',
  currency: 'USD',
  donateAmounts: [3, 5, 10, 25],

  // Google AdSense — paste your publisher ID, e.g. 'ca-pub-1234567890123456'.
  // With only the ID filled in, Google "Auto ads" places ads by itself.
  // Optionally create ad units in AdSense and paste their slot IDs below
  // to also fill Kindkit's own ad spaces.
  adsenseClient: '',
  adsenseSlots: { home: '', toolTop: '', toolBottom: '' },
};
/* ------------------------------------------------------- */

const LIBS = {
  pdflib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  qrcode: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  heic: 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
};

/* ---------------- Icons ---------------- */
const ICONS = {
  merge: '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/>',
  split: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  shrink: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  filetext: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  imgminus: '<path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  scale: '<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/>',
  swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  rotl: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  rotr: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
  userx: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
};
function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------------- Small helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tick = () => new Promise(r => setTimeout(r, 0));
const stripExt = n => n.replace(/\.[^.]+$/, '');

function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return n.toFixed(n < 10 ? 1 : 0) + ' ' + u[i];
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const scriptCache = {};
function loadScript(src) {
  if (!scriptCache[src]) {
    scriptCache[src] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = res;
      s.onerror = () => { delete scriptCache[src]; s.remove(); rej(new Error('A part of this tool could not load. Please check your internet connection and try again.')); };
      document.head.appendChild(s);
    });
  }
  return scriptCache[src];
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

async function copyText(text, msg = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast(msg);
}

async function shareSite() {
  const data = { title: 'Kindkit — free file tools', text: 'Free PDF & image tools. No sign-up, no watermarks, files never leave your device.', url: CONFIG.siteUrl };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  copyText(CONFIG.siteUrl, 'Link copied — thank you for sharing!');
}

/* ---------------- Donations ---------------- */
function paypalUrl(amount) {
  const p = new URLSearchParams({
    cmd: '_donations',
    business: CONFIG.paypalEmail,
    item_name: `Support ${CONFIG.siteName} - keep it free for everyone`,
    currency_code: CONFIG.currency,
    return: CONFIG.siteUrl + '#thanks',
    cancel_return: CONFIG.siteUrl,
  });
  if (amount) p.set('amount', amount);
  return 'https://www.paypal.com/cgi-bin/webscr?' + p.toString();
}

function nudgeHtml() {
  return `<p class="nudge">${icon('heart')}<span>Glad that worked! Kindkit stays free because kind people chip in. If it saved you time today, you could <a href="${esc(paypalUrl(3))}" target="_blank" rel="noopener">buy me a coffee</a> or <a href="#" data-share>share it with a friend</a>. No pressure, ever.</span></p>`;
}

/* ---------------- Ads ---------------- */
let adsLoaded = false;
function initAds() {
  const client = CONFIG.adsenseClient.trim();
  if (!client) return;
  const meta = document.createElement('meta');
  meta.name = 'google-adsense-account';
  meta.content = client;
  document.head.appendChild(meta);
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
  document.head.appendChild(s);
  adsLoaded = true;
}

// Fill visible ad spaces inside a view. Slots with hand-pasted ad code
// (from any ad network) are shown as-is.
function fillAds(root) {
  $$('.ad-slot', root).forEach(slot => {
    if (slot.dataset.filled) return;
    const custom = slot.querySelector('.ad-custom');
    if (custom && custom.children.length) {
      slot.hidden = false;
      slot.dataset.filled = '1';
      return;
    }
    const id = CONFIG.adsenseSlots[slot.dataset.slot];
    if (!adsLoaded || !id) return;
    slot.hidden = false;
    slot.insertAdjacentHTML('beforeend', `<span class="ad-label">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(CONFIG.adsenseClient)}" data-ad-slot="${esc(id)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`);
    slot.dataset.filled = '1';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.warn(e); }
  });
}

/* ---------------- File UI building blocks ---------------- */
const isPdf = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
const isHeic = f => /image\/hei[cf]/.test(f.type) || /\.hei[cf]$/i.test(f.name);
const isImage = f => f.type.startsWith('image/') || isHeic(f) || /\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i.test(f.name);

function onlyKind(files, test, label) {
  const ok = files.filter(test);
  if (ok.length < files.length) toast(`Skipped ${files.length - ok.length} file(s) that aren't ${label}.`);
  return ok;
}

function dropzone({ accept, multiple = true, label, hint = 'or drag & drop here', onFiles, compact = false }) {
  const z = el(`<label class="drop${compact ? ' compact' : ''}">
    <input type="file" ${multiple ? 'multiple' : ''} accept="${accept}" hidden>
    <span class="drop-icon">${icon('upload')}</span>
    <span><strong>${esc(label)}</strong><br><span class="muted">${esc(hint)}</span></span>
  </label>`);
  const input = $('input', z);
  input.addEventListener('change', () => {
    if (input.files.length) onFiles([...input.files]);
    input.value = '';
  });
  ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('over'); }));
  z.addEventListener('drop', e => {
    const fs = [...(e.dataTransfer?.files || [])];
    if (fs.length) onFiles(multiple ? fs : fs.slice(0, 1));
  });
  return z;
}

// A reorderable list of chosen files.
function makeQueue({ reorder = false, thumbs = false } = {}) {
  const list = document.createElement('ul');
  list.className = 'queue';
  const q = { files: [], el: list, onChange: null };
  let dragFrom = null;

  q.add = fs => { q.files.push(...fs); render(); };
  q.clear = () => { q.files = []; render(); };

  function move(from, to) {
    const [f] = q.files.splice(from, 1);
    q.files.splice(to, 0, f);
    render();
  }

  function render() {
    list.innerHTML = '';
    q.files.forEach((f, i) => {
      const canThumb = thumbs && /^image\/(png|jpe?g|webp|gif|bmp|avif|svg)/.test(f.type);
      const li = el(`<li ${reorder ? 'draggable="true"' : ''}>
        ${canThumb ? '<img class="thumb" alt="">' : `<span class="thumb">${icon(isPdf(f) ? 'file' : 'image')}</span>`}
        <span class="qname"></span>
        <span class="qsize muted">${fmtBytes(f.size)}</span>
        <span class="qactions">
          ${reorder ? `<button type="button" class="icon-btn" data-a="up" title="Move up" aria-label="Move up" ${i ? '' : 'disabled'}>${icon('up')}</button>
          <button type="button" class="icon-btn" data-a="down" title="Move down" aria-label="Move down" ${i < q.files.length - 1 ? '' : 'disabled'}>${icon('down')}</button>` : ''}
          <button type="button" class="icon-btn" data-a="rm" title="Remove" aria-label="Remove">${icon('x')}</button>
        </span>
      </li>`);
      $('.qname', li).textContent = f.name;
      if (canThumb) {
        const img = $('img', li);
        img.src = URL.createObjectURL(f);
        img.onload = img.onerror = () => URL.revokeObjectURL(img.src);
      }
      li.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.a === 'rm') { q.files.splice(i, 1); render(); }
        if (b.dataset.a === 'up') move(i, i - 1);
        if (b.dataset.a === 'down') move(i, i + 1);
      });
      if (reorder) {
        li.addEventListener('dragstart', e => { dragFrom = i; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); });
        li.addEventListener('dragend', () => li.classList.remove('dragging'));
        li.addEventListener('dragover', e => { if (dragFrom !== null) e.preventDefault(); });
        li.addEventListener('drop', e => {
          if (dragFrom === null) return;
          e.preventDefault();
          e.stopPropagation();
          const from = dragFrom;
          dragFrom = null;
          if (from !== i) move(from, i);
        });
      }
      list.appendChild(li);
    });
    if (q.onChange) q.onChange(q.files);
  }
  return q;
}

function button(label, cls = 'primary big', ic = '') {
  return el(`<button type="button" class="btn ${cls}">${ic ? icon(ic) : ''}<span>${esc(label)}</span></button>`);
}

// Run a task with progress UI; fn(progress) returns [{blob, name, note?, good?}]
async function run(btn, out, fn) {
  btn.disabled = true;
  out.innerHTML = '<div class="progress"><div class="bar"><i></i></div><span>Getting started…</span></div>';
  const bar = $('i', out), txt = $('span', out);
  const progress = (t, f) => {
    if (t) txt.textContent = t;
    if (f != null) bar.style.width = Math.max(4, Math.round(f * 100)) + '%';
  };
  try {
    await tick();
    const results = await fn(progress);
    if (results && results.length) showResults(out, results);
    else if (!results) out.innerHTML = '';
  } catch (err) {
    console.error(err);
    out.innerHTML = `<div class="error">${icon('alert')}<div><strong>That didn't work.</strong><p></p></div></div>`;
    $('p', out).textContent = friendlyError(err);
  } finally {
    btn.disabled = false;
    btn.dispatchEvent(new Event('kk-done'));
  }
}

function friendlyError(err) {
  const m = (err && err.message) || String(err);
  if (/encrypt|password/i.test(m)) return 'This PDF is password-protected. Please remove the password first, then try again.';
  if (/Invalid PDF|No PDF header|Failed to parse/i.test(m)) return "This file doesn't look like a valid PDF. It may be damaged.";
  if (/memory|allocation|Array buffer/i.test(m)) return 'Your device ran out of memory on this file. Try fewer or smaller files at a time.';
  return m;
}

function uniqueName(name, used) {
  let n = name, i = 2;
  while (used.has(n)) n = name.replace(/(\.[^.]+)?$/, ` (${i++})$1`);
  used.add(n);
  return n;
}

async function zipAndDownload(results, zipName, btn) {
  if (btn) btn.disabled = true;
  try {
    await loadScript(LIBS.jszip);
    const zip = new JSZip();
    const used = new Set();
    results.forEach(r => zip.file(uniqueName(r.name, used), r.blob));
    download(await zip.generateAsync({ type: 'blob' }), zipName);
  } catch (e) {
    toast(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function showResults(out, results, zipName = 'kindkit-files.zip') {
  const many = results.length > 1;
  out.innerHTML = `<div class="done">
    <div class="done-head">${icon('check')}<div><strong>${many ? results.length + ' files are ready' : 'Your file is ready'}</strong><span class="muted">Processed on your device · nothing was uploaded</span></div></div>
    <ul class="dl-list"></ul>
    <div class="row"></div>
    ${nudgeHtml()}
  </div>`;
  const list = $('.dl-list', out), row = $('.row', out);
  results.forEach(r => {
    const li = el(`<li>${icon(/\.pdf$/i.test(r.name) ? 'file' : 'image')}<span class="qname"></span>${r.note ? `<span class="note ${r.good ? 'good' : ''}"></span>` : ''}</li>`);
    $('.qname', li).textContent = r.name;
    if (r.note) $('.note', li).textContent = r.note;
    const b = button(many ? 'Download' : 'Download ' + fmtBytes(r.blob.size), many ? 'small' : 'primary', 'download');
    b.onclick = () => download(r.blob, r.name);
    li.appendChild(b);
    list.appendChild(li);
  });
  if (many) {
    const all = button('Download all (.zip)', 'primary', 'download');
    all.onclick = () => zipAndDownload(results, zipName, all);
    row.appendChild(all);
  } else {
    row.remove();
  }
}

/* ---------------- Router & views ---------------- */
const SECTIONS = ['tools', 'why', 'support', 'faq'];
let activeFilter = 'all';

function showView(id) {
  $$('.view').forEach(v => { v.hidden = v.id !== id; });
  fillAds($('#' + id));
}

function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  const tool = TOOLS.find(t => t.id === h);
  if (tool) return openTool(tool);
  document.title = 'Kindkit — Free PDF & Image Tools. No Sign-up, No Uploads';
  if (h === 'thanks') {
    showView('view-thanks');
    window.scrollTo(0, 0);
    return;
  }
  showView('view-home');
  if (SECTIONS.includes(h)) {
    requestAnimationFrame(() => document.getElementById(h).scrollIntoView());
  } else {
    window.scrollTo(0, 0);
  }
}

function openTool(t) {
  document.title = `${t.name} — Free, No Upload, No Sign-up | Kindkit`;
  $('#tool-icon').className = 'tool-ic big cat-' + t.cat;
  $('#tool-icon').innerHTML = icon(t.icon);
  $('#tool-title').textContent = t.name;
  $('#tool-desc').textContent = t.long || t.short;
  const body = $('#tool-body');
  body.innerHTML = '';
  t.render(body);
  const related = TOOLS.filter(x => x.id !== t.id && x.cat === t.cat).concat(TOOLS.filter(x => x.cat !== t.cat)).slice(0, 6);
  $('#related').innerHTML = related.map(cardHtml).join('');
  showView('view-tool');
  window.scrollTo(0, 0);
}

function cardHtml(t) {
  return `<a class="tool-card" href="#${t.id}" data-cat="${t.cat}">
    <span class="tool-ic cat-${t.cat}">${icon(t.icon)}</span>
    <span><strong>${esc(t.name)}</strong><span class="desc">${esc(t.short)}</span></span>
  </a>`;
}

function renderGrid() {
  const q = $('#search').value.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const list = TOOLS.filter(t => {
    if (activeFilter !== 'all' && t.cat !== activeFilter) return false;
    const hay = (t.name + ' ' + t.short + ' ' + (t.keywords || '')).toLowerCase();
    return words.every(w => hay.includes(w));
  });
  $('#tool-grid').innerHTML = list.map(cardHtml).join('');
  $('#no-results').hidden = list.length > 0;
}

function initHome() {
  $('#tool-count').textContent = TOOLS.length;
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    activeFilter = c.dataset.filter;
    $$('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    renderGrid();
  }));
  $('#search').addEventListener('input', renderGrid);
  $('#search').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = $('#tool-grid .tool-card');
      if (first) location.hash = first.getAttribute('href');
    }
  });
  renderGrid();

  // Donation amounts
  const amounts = $('#amounts');
  if (amounts) {
    const labels = { 3: 'a coffee', 5: 'a snack', 10: 'a lunch', 25: 'a hero' };
    amounts.innerHTML = CONFIG.donateAmounts.map(a =>
      `<a class="amount" href="${esc(paypalUrl(a))}" target="_blank" rel="noopener">$${a}<small>${labels[a] || ''}</small></a>`).join('');
  }
  $$('[data-donate]').forEach(a => { a.href = paypalUrl(); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-repo]').forEach(a => { a.href = CONFIG.repoUrl; });
}

document.addEventListener('click', e => {
  const s = e.target.closest('[data-share]');
  if (s) { e.preventDefault(); shareSite(); }
});

// Stop the browser from opening files dropped outside a drop zone.
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

window.addEventListener('scroll', () => {
  $('.topbar').classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  initAds();
  initHome();
  route();
  window.addEventListener('hashchange', route);
});
