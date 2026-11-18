/* PalmSpeak app controller: upload → local vision → bilingual report, one step. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const LIB = window.PALM_LIB, EN = window.PALM_LIB_EN, T = window.I18N;

  const GROUPS = [
    { key: 'lines', ids: ['感情线', '智慧线', '生命线', '事业线', '健康线', '太阳线', '婚姻线'] },
    { key: 'form', ids: ['掌形', '掌心', '掌色'] },
    { key: 'mounts', ids: ['金星丘', '月丘', '坎宫', '巽宫', '离宫', '坤宫'] },
    { key: 'fingers', ids: ['拇指', '小指', '四指', '中指指腹', '腕纹'] }
  ];
  const LINE_COLORS = {
    '感情线': '#e0503a', '智慧线': '#5b8fe8', '生命线': '#46b08c', '事业线': '#e8b64c',
    '健康线': '#c65b8a', '太阳线': '#f0d27a', '婚姻线': '#e08ab0', '腕纹': '#cfc9dc'
  };
  const REDRAW_IDS = ['感情线', '智慧线', '生命线', '事业线', '腕纹'];
  const STATES = ['清楚', '部分', '不清', '未见'];
  const Q_EN = { '财运': 'wealth', '感情': 'love', '事业': 'career', '健康': 'health' };

  /* attribute options per feature, derived from rules + five-element weights + three lords */
  const ATTR_OPTS = {};
  function addOpt(f, k, v) { (ATTR_OPTS[f] = ATTR_OPTS[f] || {})[k] = (ATTR_OPTS[f][k] || []); if (!ATTR_OPTS[f][k].includes(v)) ATTR_OPTS[f][k].push(v); }
  for (const r of LIB['规则']) for (const [k, vs] of Object.entries(r['条件'])) { if (k === '状态') continue; for (const v of vs) addOpt(r['特征'], k, v); }
  for (const w of LIB['五行手型']['权重']) addOpt(w['特征'], w['属性'], w['值']);
  for (const g of LIB['三主']['宫']) for (const v of Object.keys(g['断'])) addOpt(g['宫'], '饱满', v);

  const S = {
    lang: 'zh', view: 'upload',
    photoCanvas: null, photoURL: null,
    vision: null, features: [], demo: false,
    redraw: null, closedGroups: new Set(),
    reportHTML: null, reportBlob: null
  };
  const t = k => (T[S.lang] && T[S.lang][k]) || T.zh[k] || k;
  const fname = id => S.lang === 'en' ? (EN.features[id] || id) : id;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- i18n ---------- */
  function applyI18n() {
    document.documentElement.lang = S.lang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = T[S.lang][el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });
    $('questionInput').placeholder = t('questionPh');
    $('ageInput').placeholder = t('agePh');
    if (S.vision) renderReview();
    if (S.redraw) updateRedrawBadge();
  }

  /* ---------- views ---------- */
  function showView(name, scroll) {
    S.view = name;
    $('viewUpload').hidden = name !== 'upload';
    $('viewAnalyzing').hidden = name !== 'analyzing';
    $('viewReport').hidden = name !== 'report';
    if (scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- upload ---------- */
  function showError(msg) { const e = $('uploadError'); e.textContent = msg; e.hidden = !msg; }
  function loadFile(file, demo) {
    if (!file || !/^image\//.test(file.type)) { showError(t('noHand')); showView('upload', false); return; }
    showError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const cap = 1024, sc = Math.min(1, cap / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      S.photoCanvas = c;
      S.photoURL = c.toDataURL('image/jpeg', 0.9);
      S.vision = null; S.features = []; S.redraw = null; S.demo = !!demo;
      if (demo) $('handSelect').value = '左手';
      const pc = $('previewCanvas'), pw = Math.min(520, c.width);
      pc.width = pw; pc.height = Math.round(c.height * pw / c.width);
      pc.getContext('2d').drawImage(c, 0, 0, pc.width, pc.height);
      $('analyzingText').textContent = t('analyzing');
      showView('analyzing');
      analyze();
    };
    img.onerror = () => { URL.revokeObjectURL(url); showError(t('noHand')); showView('upload', false); };
    img.src = url;
  }
  function resetUpload() {
    $('fileInput').value = ''; $('cameraInput').value = '';
    S.photoCanvas = null; S.photoURL = null; S.vision = null; S.features = []; S.redraw = null;
    showError('');
    showView('upload');
  }
  async function loadDemo() {
    try {
      const res = await fetch('assets/demo-palm.jpg');
      if (!res.ok) throw new Error('demo fetch ' + res.status);
      const blob = await res.blob();
      loadFile(new File([blob], 'demo-palm.jpg', { type: 'image/jpeg' }), true);
    } catch (e) { showError(t('noHand')); showView('upload', false); }
  }

  function analyze() {
    if (!S.photoCanvas) return;
    setTimeout(() => {
      let r;
      if (S.demo && window.PALM_DEMO_OBS) {
        r = { ok: true, features: window.PALM_DEMO_OBS['特征'], meta: { handGuess: '左手', lines: {} } };
      } else {
        try { r = window.PalmVision.analyze(S.photoCanvas); }
        catch (e) { console.error(e); r = { ok: false, reason: 'no-hand' }; }
      }
      if (!r.ok) { showError(t('noHand')); showView('upload', false); return; }
      S.vision = r;
      S.features = r.features.map(f => Object.assign({}, f, { 属性: Object.assign({}, f['属性']) }));
      $('handSelect').value = S.demo ? '左手' : r.meta.handGuess;
      S.redraw = null;
      renderReview();
      generate();
    }, 500);
  }

  /* ---------- review UI (optional tune panel) ---------- */
  function featureById(id) { return S.features.find(f => f.id === id); }
  function renderReview() {
    const host = $('featureGroups');
    host.innerHTML = '';
    for (const g of GROUPS) {
      const wrap = document.createElement('div');
      wrap.className = 'fgroup' + (S.closedGroups.has(g.key) ? ' closed' : '');
      const feats = g.ids.map(featureById).filter(Boolean);
      const seen = feats.filter(f => f['状态'] === '清楚' || f['状态'] === '部分').length;
      const head = document.createElement('button');
      head.type = 'button'; head.className = 'fgroup-head';
      head.innerHTML = '<span class="arr">▾</span><span>' + esc(t('group' + g.key[0].toUpperCase() + g.key.slice(1))) + '</span><span class="cnt">' + seen + '/' + feats.length + '</span>';
      head.addEventListener('click', () => {
        if (S.closedGroups.has(g.key)) S.closedGroups.delete(g.key); else S.closedGroups.add(g.key);
        wrap.classList.toggle('closed');
      });
      const body = document.createElement('div');
      body.className = 'fgroup-body';
      for (const f of feats) body.appendChild(featureRow(f));
      wrap.appendChild(head); wrap.appendChild(body);
      host.appendChild(wrap);
    }
    renderTools();
    renderLegend();
    updateRedrawBadge();
    drawOverlay();
  }
  function featureRow(f) {
    const row = document.createElement('div');
    row.className = 'feat' + ((f['状态'] === '未见' || f['状态'] === '不清') ? ' na' : '');
    const top = document.createElement('div');
    top.className = 'feat-top';
    let conf = '';
    const lc = S.vision && S.vision.meta.lines[f.id];
    if (lc) conf = '<span class="feat-conf">' + t('confLabel') + ' ' + Math.round(lc.conf * 100) + '%</span>';
    top.innerHTML = '<span class="feat-name">' + esc(fname(f.id)) + '</span>' + conf;
    const pills = document.createElement('div');
    pills.className = 'state-pills';
    for (const s of STATES) {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-s', s);
      b.textContent = S.lang === 'en' ? EN.states[s] : s;
      b.title = S.lang === 'en' ? EN.stateHint[s] : '';
      if (f['状态'] === s) b.classList.add('on');
      b.addEventListener('click', () => {
        f['状态'] = s;
        renderReview();
      });
      pills.appendChild(b);
    }
    top.appendChild(pills);
    row.appendChild(top);
    const opts = ATTR_OPTS[f.id] || {};
    const keys = Object.keys(opts);
    if (keys.length) {
      const chips = document.createElement('div');
      chips.className = 'attr-chips';
      for (const k of keys) {
        const lab = document.createElement('span');
        lab.className = 'akey';
        lab.textContent = (S.lang === 'en' && EN.attrs[k] ? EN.attrs[k].label : k) + ':';
        chips.appendChild(lab);
        for (const v of opts[k]) {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = S.lang === 'en' && EN.attrs[k] && EN.attrs[k].values[v] ? EN.attrs[k].values[v] : v;
          if ((f['属性'] || {})[k] === v) b.classList.add('on');
          b.addEventListener('click', () => {
            f['属性'] = f['属性'] || {};
            if (f['属性'][k] === v) delete f['属性'][k]; else f['属性'][k] = v;
            b.classList.toggle('on');
            chips.querySelectorAll('button').forEach(x => { if (x !== b && x.dataset.k === k && x.dataset.v !== v) x.classList.remove('on'); });
          });
          b.dataset.k = k; b.dataset.v = v;
          chips.appendChild(b);
        }
      }
      row.appendChild(chips);
    }
    const desc = document.createElement('p');
    desc.className = 'feat-desc';
    desc.textContent = t('featureDesc') + '：' + (S.lang === 'en' ? (f['描述en'] || f['描述']) : f['描述']);
    row.appendChild(desc);
    return row;
  }
  function renderTools() {
    const host = $('toolBtns');
    host.innerHTML = '';
    for (const id of REDRAW_IDS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = fname(id);
      b.style.borderColor = LINE_COLORS[id];
      if (S.redraw && S.redraw.id === id) { b.classList.add('on'); b.style.background = LINE_COLORS[id]; b.style.color = '#000'; }
      b.addEventListener('click', () => {
        if (S.redraw && S.redraw.id === id) { S.redraw = null; }
        else { S.redraw = { id, points: [] }; }
        renderTools(); updateRedrawBadge(); drawOverlay();
      });
      host.appendChild(b);
    }
    $('toolActions').hidden = !S.redraw;
  }
  function updateRedrawBadge() {
    const badge = $('redrawBadge');
    if (!S.redraw) { badge.hidden = true; return; }
    badge.hidden = false;
    badge.textContent = t('redrawActive') + fname(S.redraw.id) + ' · ' + S.redraw.points.length + ' ' + t('points');
    badge.style.borderColor = LINE_COLORS[S.redraw.id];
    badge.style.color = LINE_COLORS[S.redraw.id];
  }
  function renderLegend() {
    const ul = $('legend').querySelector('ul');
    ul.innerHTML = '';
    for (const id of Object.keys(LINE_COLORS)) {
      if (!featureById(id)) continue;
      const li = document.createElement('li');
      li.innerHTML = '<i style="background:' + LINE_COLORS[id] + '"></i>' + esc(fname(id));
      ul.appendChild(li);
    }
  }

  /* ---------- overlay canvas ---------- */
  function drawOverlay() {
    const cv = $('overlayCanvas');
    if (!S.photoCanvas) return;
    const w = Math.min(640, S.photoCanvas.width);
    cv.width = w; cv.height = Math.round(S.photoCanvas.height * w / S.photoCanvas.width);
    const ctx = cv.getContext('2d');
    ctx.drawImage(S.photoCanvas, 0, 0, cv.width, cv.height);
    const X = x => x * cv.width, Y = y => y * cv.height;
    for (const f of S.features) {
      const col = LINE_COLORS[f.id] || '#e8b64c';
      const dim = f['状态'] === '未见' || f['状态'] === '不清';
      ctx.globalAlpha = dim ? 0.35 : 0.95;
      if (f['路径'] && f['路径'].length > 1) {
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.shadowColor = col; ctx.shadowBlur = dim ? 0 : 8;
        ctx.beginPath();
        f['路径'].forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (f['区域']) {
        const [x, y, r] = f['区域'];
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(X(x), Y(y), r * cv.width, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      } else if (f['点']) {
        const [x, y] = f['点'];
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(X(x), Y(y), 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (S.redraw && S.redraw.points.length) {
      const col = LINE_COLORS[S.redraw.id];
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
      ctx.beginPath();
      S.redraw.points.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      for (const p of S.redraw.points) { ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.4, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  function overlayClick(ev) {
    if (!S.redraw) return;
    const cv = $('overlayCanvas'), r = cv.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    S.redraw.points.push([+x.toFixed(4), +y.toFixed(4)]);
    updateRedrawBadge(); drawOverlay();
  }
  function redrawDone() {
    if (!S.redraw) return;
    if (S.redraw.points.length < 3) { updateRedrawBadge(); return; }
    const f = featureById(S.redraw.id);
    if (f) {
      f['路径'] = S.redraw.points.slice();
      delete f['点']; delete f['区域'];
      if (f['状态'] === '未见' || f['状态'] === '不清') f['状态'] = '部分';
    }
    S.redraw = null;
    renderReview();
  }

  /* ---------- report generation ---------- */
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function buildObs() {
    const age = parseInt($('ageInput').value, 10);
    const obs = {
      schema_version: '指南观察/1.0',
      照片: { 文件: 'palm.jpg', 宽: S.photoCanvas.width, 高: S.photoCanvas.height },
      基本: {
        手别: { 值: $('handSelect').value, 状态: '确认', 依据: S.demo ? '示例手照（AI 生成）' : '用户选择' },
        拍摄: S.demo ? '示例手照，光线均匀，五指与腕纹入镜。' : '用户上传照片，浏览器本地启发式分析，观察经用户确认。'
      },
      特征: S.features.map(f => {
        const o = { id: f.id, 类别: f['类别'], 状态: f['状态'], 属性: f['属性'] || {}, 描述: f['描述'], 描述en: f['描述en'] || f['描述'] };
        if (f['路径']) o['路径'] = f['路径'];
        if (f['点']) o['点'] = f['点'];
        if (f['区域']) o['区域'] = f['区域'];
        return o;
      }),
      冲突: []
    };
    if (Number.isInteger(age) && age > 0 && age < 120) obs['用户自述'] = { 年龄: age };
    return obs;
  }
  function makeCrops() {
    const crops = {}, c = S.photoCanvas;
    for (const f of S.features) {
      let x0, y0, x1, y1;
      if (f['路径'] && f['路径'].length) {
        const xs = f['路径'].map(p => p[0] * c.width), ys = f['路径'].map(p => p[1] * c.height);
        x0 = Math.min.apply(null, xs); x1 = Math.max.apply(null, xs);
        y0 = Math.min.apply(null, ys); y1 = Math.max.apply(null, ys);
      } else if (f['区域']) {
        const [x, y, r] = f['区域'];
        x0 = (x - r) * c.width; x1 = (x + r) * c.width; y0 = (y - r) * c.height; y1 = (y + r) * c.height;
      } else if (f['点']) {
        const [x, y] = f['点'], r = c.width * 0.12;
        x0 = x * c.width - r; x1 = x * c.width + r; y0 = y * c.height - r; y1 = y * c.height + r;
      } else continue;
      const pad = Math.max(x1 - x0, y1 - y0) * 0.25 + 8;
      x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
      x1 = Math.min(c.width, x1 + pad); y1 = Math.min(c.height, y1 + pad);
      if (x1 - x0 < 4 || y1 - y0 < 4) continue;
      const side = Math.max(x1 - x0, y1 - y0);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const sx = Math.max(0, Math.min(c.width - side, cx - side / 2));
      const sy = Math.max(0, Math.min(c.height - side, cy - side / 2));
      const out = document.createElement('canvas');
      out.width = 160; out.height = 160;
      out.getContext('2d').drawImage(c, sx, sy, Math.min(side, c.width - sx), Math.min(side, c.height - sy), 0, 0, 160, 160);
      crops[f.id] = out.toDataURL('image/jpeg', 0.82);
    }
    return crops;
  }
  function makeAgeOverlay(scale, toldAge) {
    if (!scale) return null;
    const c = S.photoCanvas;
    const w = 640, h = Math.round(c.height * w / c.width);
    const out = document.createElement('canvas');
    out.width = w; out.height = h + 46;
    const ctx = out.getContext('2d');
    ctx.drawImage(c, 0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0, 0, w, h);
    const X = x => x * w, Y = y => y * h;
    const x = X(scale.x), y0 = Y(scale['起y']), y1 = Y(scale['止y']);
    ctx.strokeStyle = '#f5f5f7'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,255,255,.5)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.font = '600 15px "Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif';
    const anchors = [['腕纹', 1], ['智慧线', 35], ['感情线', 50]];
    for (const [k, age] of anchors) {
      const ay = Y(scale['锚点y'][k]);
      if (ay == null) continue;
      ctx.strokeStyle = '#86868b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 12, ay); ctx.lineTo(x + 12, ay); ctx.stroke();
      ctx.fillStyle = '#f5f5f7';
      ctx.textAlign = 'left';
      ctx.fillText(age + (S.lang === 'en' ? 'y' : '岁'), x + 18, ay + 5);
    }
    ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'center';
    ctx.fillText((S.lang === 'en' ? 'start ' : '起 ') + scale['起'], x, Math.min(h - 6, y0 + 20));
    ctx.fillText((S.lang === 'en' ? 'end ' : '止 ') + scale['止'], x, Math.max(16, y1 - 10));
    if (toldAge && toldAge >= scale['起'] && toldAge <= scale['止']) {
      const pts = anchors.map(([k, a]) => [scale['锚点y'][k], a]).filter(p => p[0] != null).sort((a, b) => b[0] - a[0]);
      let yy = null;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ya, aa] = pts[i], [yb, ab] = pts[i + 1];
        if (aa >= toldAge && toldAge >= ab) { yy = ya + (aa - toldAge) / (aa - ab) * (yb - ya); break; }
      }
      if (yy == null) yy = toldAge <= pts[pts.length - 1][1] ? pts[pts.length - 1][0] : pts[0][0];
      const hy = Y(yy);
      ctx.strokeStyle = '#2997ff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x - 26, hy); ctx.lineTo(x + 26, hy); ctx.stroke();
      ctx.fillStyle = '#2997ff';
      const label = S.lang === 'en' ? 'you are here · ' + toldAge : '你在这里 · ' + toldAge + '岁';
      const tw = ctx.measureText(label).width;
      const lx = x + 34 + tw > w ? x - 34 - tw : x + 34;
      ctx.textAlign = 'left';
      ctx.fillText(label, lx, hy + 5);
    }
    ctx.fillStyle = 'rgba(29,29,31,.94)'; ctx.fillRect(0, h, w, 46);
    ctx.fillStyle = '#86868b'; ctx.font = '12px "Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('腕纹1岁 · 交智慧线35岁 · 交感情线50岁 ｜ wrist 1 · head 35 · heart 50', w / 2, h + 28);
    return out.toDataURL('image/jpeg', 0.88);
  }
  function generate() {
    if (!S.vision) return;
    const btn = $('generateBtn');
    btn.disabled = true;
    btn.querySelector('span').textContent = t('generating');
    $('analyzingText').textContent = t('generating');
    setTimeout(() => {
      try {
        let date = $('dateInput').value || todayISO();
        if (date < '2025-01-01') date = '2025-01-01';
        if (date > '2035-12-31') date = '2035-12-31';
        $('dateInput').value = date;
        const question = $('questionInput').value.trim();
        const obs = buildObs();
        const zh = window.PalmEngine.build(obs, { question, date, lang: 'zh' });
        const en = window.PalmEngine.build(obs, { question, date, lang: 'en' });
        const crops = makeCrops();
        const st = zh['人生阶段'];
        const ageOverlay = makeAgeOverlay(st['年龄尺'], st['自述年龄']);
        S.reportHTML = window.PalmReport.buildReport({ zh, en, photo: S.photoURL, ageOverlay, crops, defaultLang: S.lang });
        if (S.reportBlob) URL.revokeObjectURL(S.reportBlob);
        S.reportBlob = URL.createObjectURL(new Blob([S.reportHTML], { type: 'text/html;charset=utf-8' }));
        $('reportFrame').srcdoc = S.reportHTML;
        showView('report');
      } catch (e) {
        console.error(e);
        showError(String(e.message || e));
        showView('upload', false);
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = t('generateBtn');
      }
    }, 400);
  }

  /* ---------- bindings ---------- */
  function bind() {
    $('langBtn').addEventListener('click', () => { S.lang = S.lang === 'zh' ? 'en' : 'zh'; applyI18n(); });
    $('heroUpload').addEventListener('click', () => $('fileInput').click());
    $('heroDemo').addEventListener('click', loadDemo);
    $('chooseBtn').addEventListener('click', e => { e.stopPropagation(); $('fileInput').click(); });
    $('cameraBtn').addEventListener('click', e => { e.stopPropagation(); $('cameraInput').click(); });
    $('fileInput').addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
    $('cameraInput').addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
    const dz = $('dropzone');
    dz.addEventListener('click', e => { if (!e.target.closest('button')) $('fileInput').click(); });
    dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fileInput').click(); } });
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); });
    $('overlayCanvas').addEventListener('click', overlayClick);
    $('redrawDone').addEventListener('click', redrawDone);
    $('redrawClear').addEventListener('click', () => { if (S.redraw) { S.redraw.points = []; updateRedrawBadge(); drawOverlay(); } });
    $('redrawCancel').addEventListener('click', () => { S.redraw = null; renderTools(); updateRedrawBadge(); drawOverlay(); });
    $('qChips').addEventListener('click', e => {
      const b = e.target.closest('button[data-q]');
      if (!b) return;
      const q = S.lang === 'en' ? Q_EN[b.dataset.q] : b.dataset.q;
      const inp = $('questionInput');
      if (inp.value === q) { inp.value = ''; b.classList.remove('on'); }
      else {
        inp.value = q;
        $('qChips').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      }
    });
    $('questionInput').addEventListener('input', () => {
      const v = $('questionInput').value;
      $('qChips').querySelectorAll('button').forEach(x => {
        const q = S.lang === 'en' ? Q_EN[x.dataset.q] : x.dataset.q;
        x.classList.toggle('on', v === q);
      });
    });
    $('generateBtn').addEventListener('click', generate);
    $('downloadBtn').addEventListener('click', () => {
      if (!S.reportHTML) return;
      const a = document.createElement('a');
      a.href = S.reportBlob;
      a.download = '掌中有话-PalmSpeak-' + ($('dateInput').value || todayISO()) + '.html';
      document.body.appendChild(a); a.click(); a.remove();
    });
    $('openBtn').addEventListener('click', () => { if (S.reportBlob) window.open(S.reportBlob, '_blank', 'noopener'); });
    $('newPhotoBtn').addEventListener('click', resetUpload);
  }

  function init() {
    $('dateInput').value = todayISO();
    bind();
    applyI18n();
    showView('upload', false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();