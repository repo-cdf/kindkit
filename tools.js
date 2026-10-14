/* =====================================================================
   Kindkit — tools. Everything runs locally in the browser.
   ===================================================================== */

const TOOLS = [
  { id: 'merge-pdf', cat: 'pdf', icon: 'merge', name: 'Merge PDF', render: mergePdf,
    short: 'Combine several PDFs into one file, in the order you want.',
    keywords: 'combine join pdfs together append' },
  { id: 'split-pdf', cat: 'pdf', icon: 'split', name: 'Split PDF', render: splitPdf,
    short: 'Pull out certain pages, or split a PDF into separate files.',
    keywords: 'extract pages separate cut' },
  { id: 'organize-pdf', cat: 'pdf', icon: 'grid', name: 'Rotate & Organize PDF', render: organizePdf,
    short: 'Rotate, reorder or delete pages, with a visual preview.',
    keywords: 'rotate reorder delete remove pages sort arrange' },
  { id: 'compress-pdf', cat: 'pdf', icon: 'shrink', name: 'Compress PDF', render: compressPdf,
    short: 'Shrink big scanned PDFs so they fit in emails and upload forms.',
    long: 'Shrink big scanned or image-heavy PDFs so they fit in emails and upload forms.',
    keywords: 'reduce size smaller optimize email' },
  { id: 'pdf-to-jpg', cat: 'pdf', icon: 'image', name: 'PDF to JPG', render: pdfToImg,
    short: 'Turn every page of a PDF into a sharp JPG or PNG image.',
    keywords: 'convert pdf to image png picture' },
  { id: 'images-to-pdf', cat: 'pdf', icon: 'filetext', name: 'Images to PDF', render: imgToPdf,
    short: 'Turn photos and scans (JPG, PNG, HEIC) into one tidy PDF.',
    keywords: 'jpg to pdf png to pdf photo scan convert heic' },
  { id: 'compress-image', cat: 'image', icon: 'imgminus', name: 'Compress Image', render: compressImage,
    short: 'Make photos much smaller with no visible quality loss.',
    keywords: 'reduce size optimize jpg png webp shrink photo' },
  { id: 'resize-image', cat: 'image', icon: 'scale', name: 'Resize Image', render: resizeImage,
    short: 'Change image dimensions by pixels or percentage, in bulk.',
    keywords: 'scale dimensions width height pixels bulk' },
  { id: 'convert-image', cat: 'image', icon: 'swap', name: 'Convert Image', render: convertImage,
    short: 'HEIC to JPG, PNG to JPG, WebP to PNG and more.',
    keywords: 'heic to jpg png webp format iphone photo' },
  { id: 'qr-code', cat: 'util', icon: 'qr', name: 'QR Code Generator', render: qrTool,
    short: 'QR codes for links, Wi-Fi or WhatsApp. They never expire.',
    keywords: 'qr code link url wifi whatsapp generator' },
  { id: 'password-generator', cat: 'util', icon: 'key', name: 'Password Generator', render: passwordTool,
    short: 'Strong random passwords, generated privately on your device.',
    keywords: 'secure random strong password' },
  { id: 'word-counter', cat: 'util', icon: 'type', name: 'Word Counter', render: wordCounter,
    short: 'Count words, characters, sentences and reading time.',
    keywords: 'character count text essay letters' },
];

/* ---------------- Shared helpers ---------------- */
async function usePdfLib() {
  await loadScript(LIBS.pdflib);
  return window.PDFLib;
}
async function usePdfJs() {
  await loadScript(LIBS.pdfjs);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfjsWorker;
  return window.pdfjsLib;
}
async function loadPdfLibDoc(PDFDocument, bytes) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  if (doc.isEncrypted) throw new Error('encrypted');
  return doc;
}
async function loadPdfJsDoc(bytes) {
  const pdfjs = await usePdfJs();
  try {
    return await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false }).promise;
  } catch (e) {
    if (e && e.name === 'PasswordException') throw new Error('encrypted');
    throw e;
  }
}
const pdfBlob = bytes => new Blob([bytes], { type: 'application/pdf' });

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.9) {
  return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Your browser could not create the image. It may be too large.')), type, quality));
}
const extFor = type => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type] || 'img');

// Decode any image file (incl. HEIC) into an upright canvas.
async function imageToCanvas(file) {
  let blob = file;
  if (isHeic(file)) {
    await loadScript(LIBS.heic);
    const out = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });
    blob = Array.isArray(out) ? out[0] : out;
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || 1;
    c.height = img.naturalHeight || 1;
    c.getContext('2d').drawImage(img, 0, 0);
    return c;
  } catch {
    throw new Error(`Couldn't open "${file.name}". Is it an image your browser supports?`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// High quality downscale (halving steps), optional background fill.
function resizeCanvas(src, w, h, bg) {
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  let cur = src;
  while (cur.width / 2 >= w && cur.height / 2 >= h) {
    const half = document.createElement('canvas');
    half.width = Math.round(cur.width / 2);
    half.height = Math.round(cur.height / 2);
    const hx = half.getContext('2d');
    hx.imageSmoothingQuality = 'high';
    hx.drawImage(cur, 0, 0, half.width, half.height);
    cur = half;
  }
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cur, 0, 0, w, h);
  return out;
}

function withBackground(src, bg = '#ffffff') {
  return resizeCanvas(src, src.width, src.height, bg);
}

function jpegOrientation(buf) {
  try {
    const v = new DataView(buf);
    if (v.getUint16(0) !== 0xFFD8) return 1;
    let off = 2;
    while (off < v.byteLength - 4) {
      const marker = v.getUint16(off);
      off += 2;
      if (marker === 0xFFE1) {
        if (v.getUint32(off + 2) !== 0x45786966) return 1;
        const tiff = off + 8;
        const little = v.getUint16(tiff) === 0x4949;
        const ifd = tiff + v.getUint32(tiff + 4, little);
        const n = v.getUint16(ifd, little);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (v.getUint16(e, little) === 0x0112) return v.getUint16(e + 8, little);
        }
        return 1;
      }
      if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA) break;
      off += v.getUint16(off);
    }
  } catch { /* ignore */ }
  return 1;
}

function parseRanges(str, max) {
  const groups = [];
  for (const part of str.split(/[,;]+/).map(s => s.trim()).filter(Boolean)) {
    let a, b;
    const m = part.match(/^(\d*)\s*(?:-|–|to)\s*(\d*)$/i);
    if (/^\d+$/.test(part)) a = b = +part;
    else if (m && (m[1] || m[2])) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : max; }
    else throw new Error(`I couldn't read "${part}". Use page numbers like 1-3, 5, 8-10.`);
    if (a < 1 || b < 1 || a > max || b > max) throw new Error(`Page numbers must be between 1 and ${max} (this PDF has ${max} page${max > 1 ? 's' : ''}).`);
    const pages = [];
    if (a <= b) for (let i = a; i <= b; i++) pages.push(i - 1);
    else for (let i = a; i >= b; i--) pages.push(i - 1);
    groups.push({ label: a === b ? `${a}` : `${a}-${b}`, pages });
  }
  if (!groups.length) throw new Error('Type the pages you want, for example: 1-3, 5');
  return groups;
}

function seg(name, options, checked) {
  return `<div class="seg" role="radiogroup">${options.map(([v, l]) =>
    `<label><input type="radio" name="${name}" value="${v}" ${v === checked ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}
const segVal = (root, name) => $(`input[name="${name}"]:checked`, root).value;

function savingNote(before, after) {
  const pct = Math.round((1 - after / before) * 100);
  return { note: `${fmtBytes(before)} → ${fmtBytes(after)}${pct > 0 ? ` (−${pct}%)` : ''}`, good: pct > 0 };
}

// Shared single-PDF picker: shows file info with a "change" button.
function singlePdfPicker(body, onPick) {
  const zone = dropzone({ accept: '.pdf,application/pdf', multiple: false, label: 'Choose a PDF file', onFiles: fs => pick(fs) });
  const info = el(`<div class="info-line" hidden>${icon('file')}<span class="qname"></span><span class="muted meta"></span><button type="button" class="btn small">Change</button></div>`);
  body.append(zone, info);
  const input = $('input', zone);
  $('button', info).onclick = () => input.click();
  async function pick(fs) {
    const f = onlyKind(fs, isPdf, 'PDFs')[0];
    if (!f) return;
    $('.qname', info).textContent = f.name;
    $('.meta', info).textContent = fmtBytes(f.size);
    zone.hidden = true;
    info.hidden = false;
    try {
      const bytes = await f.arrayBuffer();
      await onPick(f, bytes, n => { $('.meta', info).textContent = `${n} page${n > 1 ? 's' : ''} · ${fmtBytes(f.size)}`; });
    } catch (e) {
      console.error(e);
      toast(friendlyError(e));
    }
  }
}

/* =====================================================================
   PDF tools
   ===================================================================== */

function mergePdf(body) {
  const q = makeQueue({ reorder: true });
  const go = button('Merge PDFs', 'primary big', 'merge');
  const out = el('<div></div>');
  const actions = el('<div class="actions"><span class="hint">Tip: drag files or use the arrows to change the order.</span></div>');
  actions.appendChild(go);
  body.append(
    dropzone({ accept: '.pdf,application/pdf', label: 'Choose PDF files', hint: 'or drag & drop them here — add as many as you like', onFiles: fs => q.add(onlyKind(fs, isPdf, 'PDFs')) }),
    q.el, actions, out);
  const sync = () => { go.disabled = q.files.length < 2; };
  q.onChange = sync;
  go.addEventListener('kk-done', sync);
  sync();

  go.onclick = () => run(go, out, async progress => {
    const { PDFDocument } = await usePdfLib();
    const merged = await PDFDocument.create();
    for (let i = 0; i < q.files.length; i++) {
      const f = q.files[i];
      progress(`Adding ${f.name}…`, i / q.files.length);
      let src;
      try { src = await loadPdfLibDoc(PDFDocument, await f.arrayBuffer()); }
      catch (e) { throw new Error(`"${f.name}": ${friendlyError(e)}`); }
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
      await tick();
    }
    progress('Saving…', 0.95);
    return [{ blob: pdfBlob(await merged.save()), name: 'merged.pdf' }];
  });
}

function splitPdf(body) {
  let file = null, bytes = null, count = 0;
  const opts = el(`<div hidden>
    <div class="field"><span>What would you like to do?</span>
      ${seg('mode', [['extract', 'Extract pages into one PDF'], ['ranges', 'Split by ranges'], ['each', 'Every page as its own PDF']], 'extract')}
    </div>
    <div class="field pages-field" style="margin-top:16px"><span>Pages</span>
      <input class="input" type="text" placeholder="e.g. 1-3, 5, 8-10" inputmode="numeric" autocomplete="off">
      <small class="pages-hint">Separate pages or ranges with commas. “8-” means page 8 to the end.</small>
    </div>
  </div>`);
  const go = button('Split PDF', 'primary big', 'split');
  go.disabled = true;
  const actions = el('<div class="actions" hidden><span></span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');

  singlePdfPicker(body, async (f, b, setCount) => {
    file = f; bytes = b;
    const { PDFDocument } = await usePdfLib();
    const doc = await loadPdfLibDoc(PDFDocument, bytes);
    count = doc.getPageCount();
    setCount(count);
    opts.hidden = false; actions.hidden = false; go.disabled = false;
    out.innerHTML = '';
  });
  body.append(opts, actions, out);

  const pagesField = $('.pages-field', opts);
  const hintEl = $('.pages-hint', opts);
  opts.addEventListener('change', () => {
    const m = segVal(opts, 'mode');
    pagesField.hidden = m === 'each';
    hintEl.textContent = m === 'ranges'
      ? 'Each range becomes its own PDF. Example: 1-3, 4-6, 7-'
      : 'Separate pages or ranges with commas. “8-” means page 8 to the end.';
  });

  go.onclick = () => run(go, out, async progress => {
    const { PDFDocument } = await usePdfLib();
    const mode = segVal(opts, 'mode');
    let groups;
    if (mode === 'each') groups = Array.from({ length: count }, (_, i) => ({ label: String(i + 1), pages: [i] }));
    else groups = parseRanges($('input[type=text]', opts).value, count);
    if (mode === 'extract') groups = [{ label: 'selected', pages: groups.flatMap(g => g.pages) }];
    const src = await loadPdfLibDoc(PDFDocument, bytes);
    const base = stripExt(file.name);
    const results = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      progress(`Creating file ${i + 1} of ${groups.length}…`, i / groups.length);
      const doc = await PDFDocument.create();
      (await doc.copyPages(src, g.pages)).forEach(p => doc.addPage(p));
      const name = mode === 'extract' ? `${base}_extracted.pdf` : `${base}_page${g.pages.length > 1 ? 's' : ''}_${g.label}.pdf`;
      results.push({ blob: pdfBlob(await doc.save()), name, note: `${g.pages.length} page${g.pages.length > 1 ? 's' : ''}` });
      if (i % 5 === 4) await tick();
    }
    return results;
  });
}

function organizePdf(body) {
  let file = null, bytes = null;
  const toolbar = el(`<div class="actions" hidden>
    <div class="row">
      <button type="button" class="btn small" data-a="rotl">${icon('rotl')}<span>Rotate all left</span></button>
      <button type="button" class="btn small" data-a="rotr">${icon('rotr')}<span>Rotate all right</span></button>
      <button type="button" class="btn small" data-a="reset">${icon('refresh')}<span>Reset</span></button>
    </div>
    <span class="hint">Drag pages to reorder them.</span>
  </div>`);
  const grid = el('<div class="pages"></div>');
  const go = button('Save PDF', 'primary big', 'download');
  const actions = el('<div class="actions" hidden><span class="hint count"></span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');
  const state = new Map(); // card -> {index, rot}
  let dragCard = null;

  singlePdfPicker(body, async (f, b, setCount) => {
    file = f; bytes = b;
    out.innerHTML = '';
    grid.innerHTML = '<p class="hint">Loading pages…</p>';
    const pdf = await loadPdfJsDoc(bytes);
    setCount(pdf.numPages);
    buildCards(pdf.numPages);
    toolbar.hidden = false; actions.hidden = false;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = 160 / Math.max(vp1.width, vp1.height);
      const vp = page.getViewport({ scale: scale * Math.min(2, window.devicePixelRatio || 1) });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      const card = grid.children[i - 1];
      if (!card) break;
      const holder = $('.pv', card);
      holder.innerHTML = '';
      holder.appendChild(c);
      applyRot(card);
      page.cleanup();
    }
  });
  body.append(toolbar, grid, actions, out);

  function buildCards(n) {
    grid.innerHTML = '';
    state.clear();
    for (let i = 0; i < n; i++) {
      const card = el(`<div class="page-card" draggable="true">
        <div class="pv"><span class="hint">${i + 1}</span></div>
        <div class="pc-foot"><span class="pc-num">${i + 1}</span><span class="pc-btns">
          <button type="button" class="icon-btn" data-a="l" title="Rotate left" aria-label="Rotate page ${i + 1} left">${icon('rotl')}</button>
          <button type="button" class="icon-btn" data-a="r" title="Rotate right" aria-label="Rotate page ${i + 1} right">${icon('rotr')}</button>
          <button type="button" class="icon-btn" data-a="d" title="Delete page" aria-label="Delete page ${i + 1}">${icon('trash')}</button>
        </span></div>
      </div>`);
      state.set(card, { index: i, rot: 0 });
      grid.appendChild(card);
    }
    updateCount();
  }
  function applyRot(card) {
    const c = $('canvas', card);
    if (c) c.style.transform = `rotate(${state.get(card).rot}deg)`;
  }
  function updateCount() {
    const n = grid.children.length;
    $('.count', actions).textContent = `${n} page${n === 1 ? '' : 's'} in your new PDF`;
    go.disabled = n === 0;
  }

  grid.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const card = b.closest('.page-card');
    const s = state.get(card);
    if (b.dataset.a === 'l') s.rot -= 90;
    if (b.dataset.a === 'r') s.rot += 90;
    if (b.dataset.a === 'd') { state.delete(card); card.remove(); updateCount(); return; }
    applyRot(card);
  });
  toolbar.addEventListener('click', async e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.a === 'reset') {
      // Re-render from scratch
      const fakeInput = file;
      if (!fakeInput) return;
      const pdf = await loadPdfJsDoc(bytes);
      const old = new Map([...state.entries()].map(([c, s]) => [s.index, c]));
      buildCards(pdf.numPages);
      // reuse rendered canvases when available
      [...grid.children].forEach((card, i) => {
        const prev = old.get(i);
        const c = prev && $('canvas', prev);
        if (c) { const holder = $('.pv', card); holder.innerHTML = ''; holder.appendChild(c); applyRot(card); }
      });
      if (old.size < pdf.numPages) {
        for (let i = 0; i < pdf.numPages; i++) {
          const card = grid.children[i];
          if ($('canvas', card)) continue;
          const page = await pdf.getPage(i + 1);
          const vp1 = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (160 / Math.max(vp1.width, vp1.height)) * Math.min(2, window.devicePixelRatio || 1) });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          const holder = $('.pv', card); holder.innerHTML = ''; holder.appendChild(c); applyRot(card);
        }
      }
      return;
    }
    const d = b.dataset.a === 'rotl' ? -90 : 90;
    state.forEach((s, card) => { s.rot += d; applyRot(card); });
  });

  grid.addEventListener('dragstart', e => {
    dragCard = e.target.closest('.page-card');
    if (!dragCard) return;
    dragCard.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });
  grid.addEventListener('dragend', () => { if (dragCard) dragCard.classList.remove('dragging'); dragCard = null; });
  grid.addEventListener('dragover', e => {
    if (!dragCard) return;
    e.preventDefault();
    const over = e.target.closest('.page-card');
    if (!over || over === dragCard) return;
    const r = over.getBoundingClientRect();
    const after = e.clientX > r.left + r.width / 2;
    grid.insertBefore(dragCard, after ? over.nextSibling : over);
  });

  go.onclick = () => run(go, out, async progress => {
    const { PDFDocument, degrees } = await usePdfLib();
    progress('Building your PDF…', 0.2);
    const src = await loadPdfLibDoc(PDFDocument, bytes);
    const order = [...grid.children].map(c => state.get(c));
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, order.map(s => s.index));
    pages.forEach((p, i) => {
      const r = order[i].rot;
      if (r % 360) p.setRotation(degrees((((p.getRotation().angle + r) % 360) + 360) % 360));
      doc.addPage(p);
    });
    progress('Saving…', 0.9);
    return [{ blob: pdfBlob(await doc.save()), name: stripExt(file.name) + '_organized.pdf' }];
  });
}

function compressPdf(body) {
  let file = null, bytes = null;
  const LEVELS = {
    strong: { scale: 1.0, q: 0.5 },
    balanced: { scale: 1.5, q: 0.62 },
    light: { scale: 2.0, q: 0.78 },
  };
  const opts = el(`<div hidden>
    <div class="field"><span>Compression level</span>
      ${seg('level', [['strong', 'Smallest file'], ['balanced', 'Balanced (recommended)'], ['light', 'Best quality']], 'balanced')}
    </div>
    <p class="notice" style="margin-top:16px">Best for scanned documents and photo-heavy PDFs. Pages are rebuilt as images, so text in the new file can't be selected or searched.</p>
  </div>`);
  const go = button('Compress PDF', 'primary big', 'shrink');
  const actions = el('<div class="actions" hidden><span></span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');
  singlePdfPicker(body, async (f, b, setCount) => {
    file = f; bytes = b;
    const pdf = await loadPdfJsDoc(bytes);
    setCount(pdf.numPages);
    pdf.destroy();
    opts.hidden = false; actions.hidden = false;
    out.innerHTML = '';
  });
  body.append(opts, actions, out);

  go.onclick = () => run(go, out, async progress => {
    const L = LEVELS[segVal(opts, 'level')];
    const { PDFDocument } = await usePdfLib();
    const pdf = await loadPdfJsDoc(bytes);
    const doc = await PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      progress(`Compressing page ${i} of ${pdf.numPages}…`, (i - 1) / pdf.numPages);
      const page = await pdf.getPage(i);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = Math.min(L.scale, 6000 / Math.max(vp1.width, vp1.height));
      const vp = page.getViewport({ scale });
      const c = document.createElement('canvas');
      c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const jpg = await canvasToBlob(c, 'image/jpeg', L.q);
      const img = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
      const p = doc.addPage([vp1.width, vp1.height]);
      p.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });
      page.cleanup();
      c.width = c.height = 0;
    }
    pdf.destroy();
    progress('Saving…', 0.97);
    const blob = pdfBlob(await doc.save());
    if (blob.size >= file.size) {
      return [{ blob: file, name: file.name, note: 'Already well optimized — your original is the smallest version', good: false }];
    }
    return [{ blob, name: stripExt(file.name) + '_compressed.pdf', ...savingNote(file.size, blob.size) }];
  });
}

function pdfToImg(body) {
  let file = null, bytes = null, count = 0;
  const opts = el(`<div class="opts" hidden>
    <div class="field"><span>Format</span>${seg('fmt', [['image/jpeg', 'JPG'], ['image/png', 'PNG']], 'image/jpeg')}</div>
    <div class="field"><span>Quality</span>${seg('dpi', [['1', 'Normal (72 dpi)'], ['2.0833', 'High (150 dpi)'], ['4.1667', 'Print (300 dpi)']], '2.0833')}</div>
    <div class="field"><span>Pages</span><input class="input" type="text" placeholder="All pages" autocomplete="off"><small>Leave empty for all pages, or type e.g. 1-3, 5</small></div>
  </div>`);
  const go = button('Convert to images', 'primary big', 'image');
  const actions = el('<div class="actions" hidden><span></span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');
  singlePdfPicker(body, async (f, b, setCount) => {
    file = f; bytes = b;
    const pdf = await loadPdfJsDoc(bytes);
    count = pdf.numPages;
    setCount(count);
    pdf.destroy();
    opts.hidden = false; actions.hidden = false;
    out.innerHTML = '';
  });
  body.append(opts, actions, out);

  go.onclick = () => run(go, out, async progress => {
    const type = segVal(opts, 'fmt');
    const scale = parseFloat(segVal(opts, 'dpi'));
    const rangeText = $('input[type=text]', opts).value.trim();
    const pages = rangeText ? parseRanges(rangeText, count).flatMap(g => g.pages) : Array.from({ length: count }, (_, i) => i);
    const pdf = await loadPdfJsDoc(bytes);
    const base = stripExt(file.name);
    const results = [];
    for (let k = 0; k < pages.length; k++) {
      const i = pages[k] + 1;
      progress(`Rendering page ${i}…`, k / pages.length);
      const page = await pdf.getPage(i);
      const vp1 = page.getViewport({ scale: 1 });
      const s = Math.min(scale, 8000 / Math.max(vp1.width, vp1.height));
      const vp = page.getViewport({ scale: s });
      const c = document.createElement('canvas');
      c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const blob = await canvasToBlob(c, type, 0.92);
      results.push({ blob, name: `${base}_page-${i}.${extFor(blob.type)}`, note: `${c.width}×${c.height}` });
      page.cleanup();
      c.width = c.height = 0;
    }
    pdf.destroy();
    return results;
  });
  // zip name per file
}

function imgToPdf(body) {
  const q = makeQueue({ reorder: true, thumbs: true });
  const opts = el(`<div class="opts">
    <div class="field"><span>Page size</span>${seg('size', [['fit', 'Same as image'], ['a4', 'A4'], ['letter', 'US Letter']], 'a4')}</div>
    <div class="field"><span>Orientation</span>${seg('orient', [['auto', 'Auto'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto')}</div>
    <div class="field"><span>Margin</span>${seg('margin', [['0', 'None'], ['18', 'Small'], ['40', 'Large']], '0')}</div>
  </div>`);
  const go = button('Create PDF', 'primary big', 'filetext');
  const actions = el('<div class="actions"><span class="hint">Tip: drag photos or use the arrows to set the page order.</span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');
  body.append(
    dropzone({ accept: 'image/*,.heic,.heif', label: 'Choose images', hint: 'JPG, PNG, WebP, HEIC… or drag & drop them here', onFiles: fs => q.add(onlyKind(fs, isImage, 'images')) }),
    q.el, opts, actions, out);
  const sync = () => { go.disabled = q.files.length < 1; };
  q.onChange = sync;
  go.addEventListener('kk-done', sync);
  sync();

  go.onclick = () => run(go, out, async progress => {
    const { PDFDocument } = await usePdfLib();
    const doc = await PDFDocument.create();
    const size = segVal(opts, 'size'), orient = segVal(opts, 'orient'), margin = +segVal(opts, 'margin');
    for (let i = 0; i < q.files.length; i++) {
      const f = q.files[i];
      progress(`Adding ${f.name}…`, i / q.files.length);
      const buf = await f.arrayBuffer();
      let img = null;
      const isJpg = /jpe?g/i.test(f.type) || /\.jpe?g$/i.test(f.name);
      const isPng = /png/i.test(f.type) || /\.png$/i.test(f.name);
      try {
        if (isJpg && jpegOrientation(buf) === 1) img = await doc.embedJpg(buf);
        else if (isPng) img = await doc.embedPng(buf);
      } catch { img = null; }
      if (!img) {
        const c = withBackground(await imageToCanvas(f));
        const jpg = await canvasToBlob(c, 'image/jpeg', 0.92);
        img = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
        c.width = c.height = 0;
      }
      const iw = img.width, ih = img.height;
      let pw, ph;
      if (size === 'fit') {
        const k = Math.min(0.75, 1190 / Math.max(iw, ih));
        pw = iw * k + margin * 2; ph = ih * k + margin * 2;
      } else {
        [pw, ph] = size === 'a4' ? [595.28, 841.89] : [612, 792];
        const land = orient === 'landscape' || (orient === 'auto' && iw > ih);
        if (land) [pw, ph] = [ph, pw];
      }
      const aw = pw - margin * 2, ah = ph - margin * 2;
      const k = Math.min(aw / iw, ah / ih);
      const w = iw * k, h = ih * k;
      const page = doc.addPage([pw, ph]);
      page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      await tick();
    }
    progress('Saving…', 0.96);
    const name = q.files.length === 1 ? stripExt(q.files[0].name) + '.pdf' : 'images.pdf';
    return [{ blob: pdfBlob(await doc.save()), name, note: `${q.files.length} page${q.files.length > 1 ? 's' : ''}` }];
  });
}

/* =====================================================================
   Image tools
   ===================================================================== */

function imageQueueTool(body, { optsHtml, goLabel, goIcon, process }) {
  const q = makeQueue({ thumbs: true });
  const opts = el(`<div>${optsHtml}</div>`);
  const go = button(goLabel, 'primary big', goIcon);
  const actions = el('<div class="actions"><span class="hint">Add as many images as you like.</span></div>');
  actions.appendChild(go);
  const out = el('<div></div>');
  body.append(
    dropzone({ accept: 'image/*,.heic,.heif', label: 'Choose images', hint: 'JPG, PNG, WebP, HEIC… or drag & drop them here', onFiles: fs => q.add(onlyKind(fs, isImage, 'images')) }),
    q.el, opts, actions, out);
  const sync = () => { go.disabled = q.files.length < 1; };
  q.onChange = sync;
  go.addEventListener('kk-done', sync);
  sync();
  go.onclick = () => run(go, out, async progress => {
    const results = [];
    for (let i = 0; i < q.files.length; i++) {
      const f = q.files[i];
      progress(`Processing ${f.name}…`, i / q.files.length);
      try {
        results.push(await process(f, opts));
      } catch (e) {
        throw new Error(`"${f.name}": ${friendlyError(e)}`);
      }
      await tick();
    }
    return results;
  });
  return opts;
}

function compressImage(body) {
  const opts = imageQueueTool(body, {
    goLabel: 'Compress images', goIcon: 'imgminus',
    optsHtml: `<div class="opts">
      <div class="field"><span>Quality: <b class="qv">75%</b></span><input type="range" name="q" min="30" max="95" value="75"><small>75% looks the same to most eyes and is much smaller.</small></div>
      <div class="field"><span>Max size (longest side)</span>
        <select class="input" name="max"><option value="0">Keep original size</option><option value="3840">3840 px (4K)</option><option value="2560">2560 px</option><option value="1920" selected>1920 px (Full HD)</option><option value="1280">1280 px</option><option value="800">800 px</option></select></div>
      <div class="field"><span>Output format</span>
        <select class="input" name="fmt"><option value="auto">Auto (recommended)</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP (smallest)</option><option value="image/png">PNG</option></select>
        <small>Auto keeps JPG as JPG and turns PNG into WebP (keeps transparency).</small></div>
    </div>`,
    process: async (f, o) => {
      const quality = +$('[name=q]', o).value / 100;
      const max = +$('[name=max]', o).value;
      let type = $('[name=fmt]', o).value;
      if (type === 'auto') type = /png|gif|webp|avif|svg/i.test(f.type) ? 'image/webp' : 'image/jpeg';
      let c = await imageToCanvas(f);
      const k = max ? Math.min(1, max / Math.max(c.width, c.height)) : 1;
      c = resizeCanvas(c, c.width * k, c.height * k, type === 'image/jpeg' ? '#fff' : null);
      const blob = await canvasToBlob(c, type, quality);
      c.width = c.height = 0;
      const name = `${stripExt(f.name)}-min.${extFor(blob.type)}`;
      if (blob.size >= f.size && !isHeic(f)) return { blob: f, name: f.name, note: 'Already optimized — kept original' };
      return { blob, name, ...savingNote(f.size, blob.size) };
    },
  });
  const qv = $('.qv', opts);
  $('[name=q]', opts).addEventListener('input', e => { qv.textContent = e.target.value + '%'; });
}

function resizeImage(body) {
  const opts = imageQueueTool(body, {
    goLabel: 'Resize images', goIcon: 'scale',
    optsHtml: `<div class="field" style="margin-bottom:16px"><span>Resize by</span>${seg('mode', [['px', 'Pixels'], ['pct', 'Percentage']], 'px')}</div>
      <div class="opts px-opts">
        <div class="field"><span>Width (px)</span><input class="input" type="number" name="w" min="1" max="20000" placeholder="e.g. 1080"></div>
        <div class="field"><span>Height (px)</span><input class="input" type="number" name="h" min="1" max="20000" placeholder="auto"></div>
        <div class="field"><span>&nbsp;</span><label class="check"><input type="checkbox" name="lock" checked> Keep proportions</label><small>Fill in just one side and the other follows.</small></div>
      </div>
      <div class="field pct-opts" hidden><span>Scale: <b class="pv">50%</b></span><input type="range" name="pct" min="5" max="200" value="50"></div>`,
    process: async (f, o) => {
      const src = await imageToCanvas(f);
      let w, h;
      if (segVal(o, 'mode') === 'pct') {
        const k = +$('[name=pct]', o).value / 100;
        w = src.width * k; h = src.height * k;
      } else {
        const W = +$('[name=w]', o).value || 0, H = +$('[name=h]', o).value || 0;
        const lock = $('[name=lock]', o).checked;
        if (!W && !H) throw new Error('Enter a width or a height first.');
        if (lock) {
          const k = W && H ? Math.min(W / src.width, H / src.height) : W ? W / src.width : H / src.height;
          w = src.width * k; h = src.height * k;
        } else {
          w = W || src.width; h = H || src.height;
        }
      }
      if (w * h > 268e6) throw new Error('That size is too large for a browser to create.');
      let type = /png|gif|svg/i.test(f.type) ? 'image/png' : /webp/i.test(f.type) ? 'image/webp' : 'image/jpeg';
      const c = resizeCanvas(src, w, h, type === 'image/jpeg' ? '#fff' : null);
      const blob = await canvasToBlob(c, type, 0.92);
      const note = `${src.width}×${src.height} → ${c.width}×${c.height}`;
      c.width = c.height = 0;
      return { blob, name: `${stripExt(f.name)}-${Math.round(w)}x${Math.round(h)}.${extFor(blob.type)}`, note };
    },
  });
  const pv = $('.pv', opts);
  $('[name=pct]', opts).addEventListener('input', e => { pv.textContent = e.target.value + '%'; });
  opts.addEventListener('change', () => {
    const pct = segVal(opts, 'mode') === 'pct';
    $('.px-opts', opts).hidden = pct;
    $('.pct-opts', opts).hidden = !pct;
  });
}

function convertImage(body) {
  const opts = imageQueueTool(body, {
    goLabel: 'Convert images', goIcon: 'swap',
    optsHtml: `<div class="opts">
      <div class="field"><span>Convert to</span>${seg('to', [['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], 'image/jpeg')}</div>
      <div class="field q-field"><span>Quality: <b class="qv">90%</b></span><input type="range" name="q" min="40" max="100" value="90"></div>
    </div>`,
    process: async (f, o) => {
      const type = segVal(o, 'to');
      let c = await imageToCanvas(f);
      if (type === 'image/jpeg') c = withBackground(c);
      const blob = await canvasToBlob(c, type, +$('[name=q]', o).value / 100);
      c.width = c.height = 0;
      if (blob.type !== type) throw new Error(`Your browser can't create ${extFor(type).toUpperCase()} files. Try another format.`);
      return { blob, name: `${stripExt(f.name)}.${extFor(blob.type)}`, note: fmtBytes(blob.size) };
    },
  });
  const qv = $('.qv', opts);
  $('[name=q]', opts).addEventListener('input', e => { qv.textContent = e.target.value + '%'; });
  opts.addEventListener('change', () => { $('.q-field', opts).hidden = segVal(opts, 'to') === 'image/png'; });
}

/* =====================================================================
   Utilities
   ===================================================================== */

function qrTool(body) {
  const ui = el(`<div class="qr-layout">
    <div style="display:grid;gap:18px">
      <div class="field"><span>QR code for</span>${seg('kind', [['text', 'Link or text'], ['wifi', 'Wi-Fi'], ['wa', 'WhatsApp']], 'text')}</div>
      <div class="k-text field"><span>Link or text</span><textarea class="input" name="text" rows="3" placeholder="https://your-website.com"></textarea></div>
      <div class="k-wifi opts" hidden>
        <div class="field"><span>Network name (SSID)</span><input class="input" name="ssid" autocomplete="off"></div>
        <div class="field"><span>Password</span><input class="input" name="wpass" autocomplete="off"></div>
        <div class="field"><span>Security</span><select class="input" name="enc"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">None (open)</option></select></div>
        <div class="field"><span>&nbsp;</span><label class="check"><input type="checkbox" name="hidden"> Hidden network</label></div>
      </div>
      <div class="k-wa opts" hidden>
        <div class="field"><span>Phone number with country code</span><input class="input" name="phone" inputmode="tel" placeholder="e.g. 966 5X XXX XXXX"></div>
        <div class="field"><span>Ready-made message (optional)</span><input class="input" name="wamsg" placeholder="Hi! I'd like to order…"></div>
      </div>
      <div class="opts">
        <div class="field"><span>Color</span><input type="color" name="fg" value="#1e1b18"></div>
        <div class="field"><span>Background</span><input type="color" name="bg" value="#ffffff"></div>
        <div class="field"><span>Download size</span><select class="input" name="size"><option value="512">512 px</option><option value="1024" selected>1024 px</option><option value="2048">2048 px (print)</option></select></div>
        <div class="field"><span>Error correction</span><select class="input" name="ec"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">High</option><option value="H">Highest</option></select></div>
      </div>
    </div>
    <div class="qr-preview">
      <canvas width="260" height="260" aria-label="QR code preview"></canvas>
      <p class="hint qr-msg">Type something to create your QR code.</p>
      <div class="row">
        <button type="button" class="btn primary" data-dl="png" disabled>${icon('download')}<span>PNG</span></button>
        <button type="button" class="btn" data-dl="svg" disabled>${icon('download')}<span>SVG</span></button>
      </div>
      <p class="hint" style="text-align:center">Static code — it works forever and doesn't track anyone.</p>
    </div>
  </div>`);
  body.appendChild(ui);
  const canvas = $('canvas', ui), msg = $('.qr-msg', ui);
  const val = n => $(`[name=${n}]`, ui);
  let current = null;

  const wifiEsc = s => s.replace(/([\\;,:"])/g, '\\$1');
  function payload() {
    const kind = segVal(ui, 'kind');
    if (kind === 'wifi') {
      const ssid = val('ssid').value;
      if (!ssid) return '';
      const enc = val('enc').value;
      return `WIFI:T:${enc};S:${wifiEsc(ssid)};${enc === 'nopass' ? '' : `P:${wifiEsc(val('wpass').value)};`}${val('hidden').checked ? 'H:true;' : ''};`;
    }
    if (kind === 'wa') {
      const digits = val('phone').value.replace(/\D/g, '').replace(/^00/, '');
      if (!digits) return '';
      const m = val('wamsg').value.trim();
      return `https://wa.me/${digits}${m ? '?text=' + encodeURIComponent(m) : ''}`;
    }
    return val('text').value.trim();
  }

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  }

  function draw(cv, qr, px, fg, bg) {
    const n = qr.getModuleCount(), m = 4;
    const cell = Math.max(1, Math.floor(px / (n + m * 2)));
    const size = cell * (n + m * 2);
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fg;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + m) * cell, (r + m) * cell, cell, cell);
  }

  async function update() {
    const kind = segVal(ui, 'kind');
    $('.k-text', ui).hidden = kind !== 'text';
    $('.k-wifi', ui).hidden = kind !== 'wifi';
    $('.k-wa', ui).hidden = kind !== 'wa';
    const data = payload();
    const btns = $$('[data-dl]', ui);
    current = null;
    btns.forEach(b => { b.disabled = true; });
    const ctx = canvas.getContext('2d');
    if (!data) {
      canvas.width = canvas.height = 260;
      ctx.clearRect(0, 0, 260, 260);
      msg.textContent = 'Type something to create your QR code.';
      return;
    }
    try {
      await loadScript(LIBS.qrcode);
      window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8'];
      const qr = window.qrcode(0, val('ec').value);
      qr.addData(data);
      qr.make();
      current = qr;
      draw(canvas, qr, 520, val('fg').value, val('bg').value);
      btns.forEach(b => { b.disabled = false; });
      const lf = luminance(val('fg').value), lb = luminance(val('bg').value);
      if (lf > lb) msg.textContent = 'Heads up: light codes on dark backgrounds don’t scan in some apps.';
      else if ((lb + 0.05) / (lf + 0.05) < 3) msg.textContent = 'Heads up: low contrast — some phones may struggle to scan this.';
      else msg.textContent = 'Point your phone camera here to test it.';
    } catch (e) {
      console.error(e);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      msg.textContent = /overflow/i.test(String(e)) ? 'That’s too much text for one QR code. Try something shorter.' : friendlyError(e);
    }
  }

  ui.addEventListener('input', update);
  ui.addEventListener('change', update);
  ui.addEventListener('click', async e => {
    const b = e.target.closest('[data-dl]');
    if (!b || !current) return;
    const fg = val('fg').value, bg = val('bg').value;
    if (b.dataset.dl === 'png') {
      const c = document.createElement('canvas');
      draw(c, current, +val('size').value, fg, bg);
      download(await canvasToBlob(c, 'image/png'), 'qr-code.png');
    } else {
      const n = current.getModuleCount(), m = 4, s = n + m * 2;
      let d = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (current.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
      download(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg');
    }
    const n = $('.qr-nudge', body);
    if (!n) body.appendChild(el(`<div class="qr-nudge">${nudgeHtml()}</div>`));
  });
  update();
}

function passwordTool(body) {
  const SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
  };
  const ui = el(`<div style="display:grid;gap:18px">
    <div class="pw-out"><output aria-live="polite"></output>
      <button type="button" class="btn primary" data-a="copy">${icon('copy')}<span>Copy</span></button>
      <button type="button" class="icon-btn" style="width:48px;height:auto" data-a="new" title="New password" aria-label="New password">${icon('refresh')}</button>
    </div>
    <div><div class="meter"><i></i></div><p class="hint strength" style="margin-top:6px"></p></div>
    <div class="field"><span>Length: <b class="lv">16</b></span><input type="range" name="len" min="6" max="64" value="16"></div>
    <div class="opts">
      <label class="check"><input type="checkbox" name="upper" checked> Uppercase (A-Z)</label>
      <label class="check"><input type="checkbox" name="lower" checked> Lowercase (a-z)</label>
      <label class="check"><input type="checkbox" name="digits" checked> Numbers (0-9)</label>
      <label class="check"><input type="checkbox" name="symbols" checked> Symbols (!@#$…)</label>
      <label class="check"><input type="checkbox" name="similar"> Avoid look-alikes (l, 1, O, 0)</label>
    </div>
    <div><p class="field-label" style="margin-bottom:8px">More options to pick from</p><ul class="pw-more"></ul></div>
  </div>`);
  body.appendChild(ui);
  const out = $('output', ui);

  function randInt(n) {
    const lim = Math.floor(0x100000000 / n) * n;
    const a = new Uint32Array(1);
    do { crypto.getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }
  function gen() {
    const len = +$('[name=len]', ui).value;
    const similar = $('[name=similar]', ui).checked;
    const sets = Object.keys(SETS).filter(k => $(`[name=${k}]`, ui).checked)
      .map(k => similar ? SETS[k].replace(/[Il1O0o]/g, '') : SETS[k]);
    if (!sets.length) return '';
    const all = sets.join('');
    const chars = sets.map(s => s[randInt(s.length)]);
    while (chars.length < len) chars.push(all[randInt(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) { const j = randInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
    return chars.slice(0, len).join('');
  }
  function update() {
    $('.lv', ui).textContent = $('[name=len]', ui).value;
    const pw = gen();
    out.textContent = pw || 'Pick at least one character type';
    const pool = new Set(pw).size ? Object.keys(SETS).filter(k => $(`[name=${k}]`, ui).checked).reduce((s, k) => s + SETS[k].length, 0) : 0;
    const bits = pw ? Math.round(pw.length * Math.log2(pool)) : 0;
    const [label, color, w] = bits < 40 ? ['Weak', 'var(--err)', 25] : bits < 64 ? ['Okay', 'var(--util)', 50] : bits < 90 ? ['Strong', 'var(--ok)', 78] : ['Very strong', 'var(--ok)', 100];
    const bar = $('.meter i', ui);
    bar.style.width = (pw ? w : 0) + '%';
    bar.style.background = color;
    $('.strength', ui).textContent = pw ? `${label} · about ${bits} bits of randomness` : '';
    $('.pw-more', ui).innerHTML = '';
    if (pw) for (let i = 0; i < 4; i++) {
      const p = gen();
      const li = el(`<li><code></code><button type="button" class="icon-btn" title="Copy" aria-label="Copy password">${icon('copy')}</button></li>`);
      $('code', li).textContent = p;
      $('button', li).onclick = () => copyText(p, 'Password copied');
      $('.pw-more', ui).appendChild(li);
    }
  }
  ui.addEventListener('input', update);
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    if (b.dataset.a === 'new') update();
    if (b.dataset.a === 'copy' && out.textContent && !/^Pick/.test(out.textContent)) copyText(out.textContent, 'Password copied');
  });
  update();
}

function wordCounter(body) {
  const STOP = new Set('the a an and or but if then of to in on at by for with from as is are was were be been being it its this that these those i you he she we they me my your our their his her them us not no so do does did have has had will would can could should just than too very also into about over out up down more most some any all each other such what which who whom how when where why there here only own same both few again further once'.split(' '));
  const ui = el(`<div style="display:grid;gap:18px">
    <textarea class="input" rows="10" placeholder="Start typing or paste your text here…" aria-label="Your text" style="min-height:240px"></textarea>
    <div class="wc-stats">
      <div class="wc-stat"><b data-s="words">0</b><span>Words</span></div>
      <div class="wc-stat"><b data-s="chars">0</b><span>Characters</span></div>
      <div class="wc-stat"><b data-s="nospace">0</b><span>Without spaces</span></div>
      <div class="wc-stat"><b data-s="sentences">0</b><span>Sentences</span></div>
      <div class="wc-stat"><b data-s="paras">0</b><span>Paragraphs</span></div>
      <div class="wc-stat"><b data-s="read">0s</b><span>Reading time</span></div>
      <div class="wc-stat"><b data-s="speak">0s</b><span>Speaking time</span></div>
    </div>
    <div><p class="field-label" style="margin-bottom:8px">Most used words</p><div class="kw"><span class="muted">—</span></div></div>
    <div class="row"><button type="button" class="btn small" data-a="copy">${icon('copy')}<span>Copy text</span></button><button type="button" class="btn small" data-a="clear">${icon('trash')}<span>Clear</span></button></div>
  </div>`);
  body.appendChild(ui);
  const ta = $('textarea', ui);
  const KEY = 'kindkit-wc-draft';
  try { ta.value = localStorage.getItem(KEY) || ''; } catch { /* storage unavailable */ }

  const dur = s => s < 60 ? `${Math.round(s)}s` : s < 3600 ? `${Math.floor(s / 60)}m ${Math.round(s % 60)}s` : `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
  function update() {
    const t = ta.value;
    const words = t.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’_-]*/gu) || [];
    const set = (k, v) => { $(`[data-s=${k}]`, ui).textContent = typeof v === 'number' ? v.toLocaleString() : v; };
    set('words', words.length);
    set('chars', [...t].length);
    set('nospace', [...t.replace(/\s/g, '')].length);
    set('sentences', t.trim() ? (t.match(/[^.!?؟。]+([.!?؟。]+|$)/g) || []).filter(s => /[\p{L}\p{N}]/u.test(s)).length : 0);
    set('paras', t.split(/\n+/).filter(p => p.trim()).length);
    set('read', dur(words.length / 238 * 60));
    set('speak', dur(words.length / 150 * 60));
    const freq = {};
    words.forEach(w => { w = w.toLowerCase(); if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) freq[w] = (freq[w] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    $('.kw', ui).innerHTML = top.length ? top.map(([w, n]) => `<span>${esc(w)}<b>${n}</b></span>`).join('') : '<span class="muted">—</span>';
    try { localStorage.setItem(KEY, t); } catch { /* storage unavailable */ }
  }
  ta.addEventListener('input', update);
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    if (b.dataset.a === 'copy') copyText(ta.value, 'Text copied');
    if (b.dataset.a === 'clear') { ta.value = ''; update(); ta.focus(); }
  });
  update();
}
