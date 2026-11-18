/* PalmSpeak local vision — heuristic palm analysis in the browser. No upload, no model.
   Produces a draft observation record (指南观察/1.0) that the user confirms before reading.
   Honest by design: low confidence => 不清, out of frame => 未见, never invents lines. */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function analyze(srcCanvas) {
    const AW = 440;
    const scale = AW / srcCanvas.width;
    const W = AW, H = Math.max(1, Math.round(srcCanvas.height * scale));
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(srcCanvas, 0, 0, W, H);
    const img = cx.getImageData(0, 0, W, H);
    const d = img.data;
    const N = W * H;

    /* ---- skin mask ---- */
    let mask = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      const rgbRule = r > 60 && r > g && r > b && (r - g) > 8 && (r - b) > 12;
      const ycc = cr > 133 && cr < 180 && cb > 77 && cb < 128 && y > 50;
      mask[i] = (rgbRule && ycc) ? 1 : 0;
    }
    mask = majority(mask, W, H); mask = majority(mask, W, H);

    /* ---- largest component ---- */
    const comp = largestComponent(mask, W, H);
    if (!comp || comp.count < N * 0.04) {
      return { ok: false, reason: 'no-hand' };
    }
    mask = comp.mask;
    const box = comp.box;

    /* ---- row profile: fingers vs palm vs wrist ---- */
    const runsPerRow = [], widthPerRow = [];
    for (let y = 0; y < H; y++) {
      let runs = 0, inRun = false, w = 0;
      for (let x = 0; x < W; x++) {
        const m = mask[y * W + x];
        if (m) { w++; if (!inRun) { runs++; inRun = true; } } else inRun = false;
      }
      runsPerRow.push(runs); widthPerRow.push(w);
    }
    const maxW = Math.max.apply(null, widthPerRow);
    let palmTop = box.y0;
    for (let y = box.y0; y < box.y1 - 10; y++) {
      let solid = true;
      for (let k = 0; k < 10; k++) if (runsPerRow[y + k] !== 1 || widthPerRow[y + k] < maxW * 0.55) { solid = false; break; }
      if (solid) { palmTop = y; break; }
    }
    let palmW = 0, palmWRow = palmTop;
    for (let y = palmTop; y <= box.y1; y++) if (widthPerRow[y] > palmW) { palmW = widthPerRow[y]; palmWRow = y; }
    let palmBottom = box.y1;
    for (let y = palmWRow; y <= box.y1; y++) {
      if (widthPerRow[y] < palmW * 0.66) { palmBottom = y; break; }
    }
    const palmH = palmBottom - palmTop;
    if (palmH < H * 0.18 || palmW < W * 0.2) return { ok: false, reason: 'no-palm' };
    /* palm horizontal extent at its widest row */
    let px0 = W, px1 = 0;
    for (let y = palmTop; y <= palmBottom; y++) for (let x = 0; x < W; x++) if (mask[y * W + x]) { if (x < px0) px0 = x; if (x > px1) px1 = x; }
    const pW = px1 - px0;

    /* ---- thumb side ---- */
    const fingerSpan = { x0: W, x1: 0 };
    for (let y = Math.max(box.y0, palmTop - Math.round(palmH * 0.35)); y < palmTop - 4; y++) {
      for (let x = 0; x < W; x++) if (mask[y * W + x]) { if (x < fingerSpan.x0) fingerSpan.x0 = x; if (x > fingerSpan.x1) fingerSpan.x1 = x; }
    }
    let leftExt = 0, rightExt = 0;
    for (let y = palmTop; y < palmTop + palmH * 0.5; y++) {
      let lx = W, rx = 0;
      for (let x = 0; x < W; x++) if (mask[y * W + x]) { if (x < lx) lx = x; if (x > rx) rx = x; }
      leftExt = Math.max(leftExt, fingerSpan.x0 - lx);
      rightExt = Math.max(rightExt, rx - fingerSpan.x1);
    }
    const thumbRight = rightExt > leftExt;
    const handGuess = thumbRight ? '左手' : '右手';

    /* ---- grayscale + crease strength ---- */
    const gray = new Float32Array(N);
    for (let i = 0; i < N; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    const blur = boxBlur(gray, W, H, 8);
    const inner = erode(mask, W, H, 5);
    const strength = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!inner[i]) continue;
      const diff = blur[i] - gray[i];
      strength[i] = clamp((diff - 3.5) / 16, 0, 1);
    }

    /* ---- color ---- */
    let cr = 0, cg = 0, cb2 = 0, cn = 0;
    let er = 0, eg = 0, eb = 0, en = 0;
    const ccx = (px0 + px1) / 2, ccy = palmTop + palmH * 0.52;
    for (let y = palmTop; y <= palmBottom; y++) for (let x = px0; x <= px1; x++) {
      const i = y * W + x;
      if (!mask[i]) continue;
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      const dc = Math.hypot((x - ccx) / (pW * 0.5), (y - ccy) / (palmH * 0.5));
      if (dc < 0.5) { cr += r; cg += g; cb2 += b; cn++; }
      if (dc > 0.82) { er += r; eg += g; eb += b; en++; }
    }
    if (!cn) return { ok: false, reason: 'no-palm' };
    cr /= cn; cg /= cn; cb2 /= cn;
    const centerRed = cr - (cg + cb2) / 2;
    let edgeRed = 0;
    if (en) { er /= en; eg /= en; eb /= en; edgeRed = er - (eg + eb) / 2; }
    const colorAttrs = {};
    if (cr > 140 && (cr - cg) > 26 && (cr - cb2) > 38) colorAttrs['整体'] = '红润偏赤';
    else if (cr > 185 && (cr - cg) < 20 && (cr - cb2) < 30) colorAttrs['整体'] = '偏白';
    else if ((cr - cb2) > 48 && (cg - cb2) > 22 && (cr - cg) <= 26) colorAttrs['整体'] = '偏黄';
    if (en && edgeRed - centerRed > 9 && edgeRed > 24) colorAttrs['分布'] = '边缘红掌心浅';

    /* ---- line tracing helpers ---- */
    function traceBand(x0, x1, y0, y1, drift) {
      const cols = [];
      const step = 2;
      const ys = [];
      for (let y = Math.round(y0); y <= Math.round(y1); y += 1) ys.push(y);
      if (ys.length < 4) return null;
      const Nc = Math.floor((x1 - x0) / step);
      if (Nc < 8) return null;
      const M = ys.length;
      let prev = new Float32Array(M).fill(1e9);
      const back = [];
      for (let c = 0; c <= Nc; c++) {
        const x = Math.round(x0 + c * step);
        const cur = new Float32Array(M).fill(1e9);
        const bk = new Int16Array(M).fill(-1);
        const priorY = y0 + (y1 - y0) * 0.5 + (drift || 0) * (c / Nc - 0.5) * (y1 - y0);
        for (let j = 0; j < M; j++) {
          const y = ys[j];
          const s = strength[y * W + x] || 0;
          const emit = (1 - s) * 1.0 + Math.abs(y - priorY) / (y1 - y0) * 0.35;
          if (c === 0) { cur[j] = emit; continue; }
          let best = 1e9, bj = -1;
          for (let k = Math.max(0, j - 3); k <= Math.min(M - 1, j + 3); k++) {
            const v = prev[k] + Math.abs(ys[j] - ys[k]) * 0.22;
            if (v < best) { best = v; bj = k; }
          }
          cur[j] = best + emit; bk[j] = bj;
        }
        back.push(bk); prev = cur;
      }
      let bj = 0;
      for (let j = 1; j < M; j++) if (prev[j] < prev[bj]) bj = j;
      const path = [];
      let j = bj;
      for (let c = Nc; c >= 0; c--) {
        path.push([Math.round(x0 + c * step), ys[j]]);
        j = back[c][j]; if (j < 0) j = 0;
      }
      path.reverse();
      return pathStats(path);
    }
    function pathStats(path) {
      let sum = 0, covered = 0, gaps = 0, inGap = false;
      const ss = [];
      for (const [x, y] of path) {
        const s = strength[y * W + x] || 0;
        ss.push(s); sum += s;
        if (s > 0.22) { covered++; inGap = false; }
        else if (!inGap) { inGap = true; }
        if (inGap && s > 0.22) gaps++;
      }
      let gapCount = 0, run = 0;
      for (const s of ss) { if (s <= 0.18) run++; else { if (run >= 6) gapCount++; run = 0; } }
      if (run >= 6) gapCount++;
      return { path, conf: sum / path.length, coverage: covered / path.length, gaps: gapCount, ss };
    }
    function statusOf(st) {
      if (!st) return '未见';
      if (st.conf > 0.42 && st.coverage > 0.68) return '清楚';
      if (st.conf > 0.26 && st.coverage > 0.42) return '部分';
      if (st.conf > 0.13 && st.coverage > 0.2) return '不清';
      return '未见';
    }

    const radialX = thumbRight ? px1 : px0;
    const ulnarX = thumbRight ? px0 : px1;
    const dir = thumbRight ? -1 : 1;

    /* heart line: upper band, ulnar -> radial */
    const heart = traceBand(px0 + pW * 0.05, px1 - pW * 0.05, palmTop + palmH * 0.10, palmTop + palmH * 0.34, 0);
    /* head line: middle band with downward drift toward ulnar side */
    const head = traceBand(px0 + pW * 0.08, px1 - pW * 0.06, palmTop + palmH * 0.30, palmTop + palmH * 0.60, dir * 0.4);
    /* fate line: vertical band */
    let fate = null;
    {
      const cxm = (px0 + px1) / 2;
      const bx0 = cxm - pW * 0.13, bx1 = cxm + pW * 0.13;
      const by0 = palmTop + palmH * 0.12, by1 = palmBottom - palmH * 0.02;
      const xs = [];
      for (let x = Math.round(bx0); x <= Math.round(bx1); x++) xs.push(x);
      const rows = [];
      for (let y = Math.round(by0); y <= Math.round(by1); y += 2) rows.push(y);
      if (xs.length >= 4 && rows.length >= 8) {
        const M = xs.length;
        let prev = new Float32Array(M).fill(1e9);
        const back = [];
        for (let r = 0; r < rows.length; r++) {
          const y = rows[r];
          const cur = new Float32Array(M).fill(1e9);
          const bk = new Int16Array(M).fill(-1);
          for (let j = 0; j < M; j++) {
            const x = xs[j];
            const s = strength[y * W + x] || 0;
            const emit = (1 - s) + Math.abs(x - cxm) / (bx1 - bx0) * 0.5;
            if (r === 0) { cur[j] = emit; continue; }
            let best = 1e9, bj = -1;
            for (let k = Math.max(0, j - 2); k <= Math.min(M - 1, j + 2); k++) {
              const v = prev[k] + Math.abs(xs[j] - xs[k]) * 0.3;
              if (v < best) { best = v; bj = k; }
            }
            cur[j] = best + emit; bk[j] = bj;
          }
          back.push(bk); prev = cur;
        }
        let bj = 0;
        for (let j = 1; j < M; j++) if (prev[j] < prev[bj]) bj = j;
        const path = [];
        let j = bj;
        for (let r = rows.length - 1; r >= 0; r--) { path.push([xs[j], rows[r]]); j = back[r][j]; if (j < 0) j = 0; }
        path.reverse();
        fate = pathStats(path);
      }
    }
    /* life line: arc around thumb base, polar DP */
    let life = null;
    {
      const tcx = radialX + dir * -pW * 0.02;
      const tcy = palmTop + palmH * 0.16;
      const a0 = thumbRight ? Math.PI * 1.42 : Math.PI * -0.42;
      const a1 = thumbRight ? Math.PI * 0.62 : Math.PI * 0.38;
      const steps = 46;
      const radii = [];
      for (let r = pW * 0.2; r <= pW * 0.58; r += 1.5) radii.push(r);
      if (radii.length >= 5) {
        const M = radii.length;
        let prev = new Float32Array(M).fill(1e9);
        const back = [];
        const pts = [];
        for (let s = 0; s <= steps; s++) {
          const a = a0 + (a1 - a0) * s / steps;
          const cur = new Float32Array(M).fill(1e9);
          const bk = new Int16Array(M).fill(-1);
          const rowPts = [];
          for (let j = 0; j < M; j++) {
            const r = radii[j];
            const x = Math.round(tcx + Math.cos(a) * r);
            const y = Math.round(tcy + Math.sin(a) * r);
            rowPts.push([x, y]);
            const inside = x >= 0 && x < W && y >= 0 && y < H;
            const sv = inside ? (strength[y * W + x] || 0) : 0;
            const emit = (1 - sv) + (inside ? 0 : 2);
            if (s === 0) { cur[j] = emit; continue; }
            let best = 1e9, bj = -1;
            for (let k = Math.max(0, j - 2); k <= Math.min(M - 1, j + 2); k++) {
              const v = prev[k] + Math.abs(radii[j] - radii[k]) * 0.16;
              if (v < best) { best = v; bj = k; }
            }
            cur[j] = best + emit; bk[j] = bj;
          }
          pts.push(rowPts); back.push(bk); prev = cur;
        }
        let bj = 0;
        for (let j = 1; j < M; j++) if (prev[j] < prev[bj]) bj = j;
        const path = [];
        let j = bj;
        for (let s = steps; s >= 0; s--) { path.push(pts[s][j]); j = back[s][j]; if (j < 0) j = 0; }
        path.reverse();
        const filtered = path.filter(([x, y]) => x >= px0 - 4 && x <= px1 + 4 && y >= palmTop - 4 && y <= palmBottom + 6);
        if (filtered.length > 10) life = pathStats(filtered);
      }
    }

    /* wrist lines */
    let wrist = null;
    {
      const wy0 = palmBottom - Math.round(palmH * 0.03);
      const wy1 = Math.min(H - 2, palmBottom + Math.round(palmH * 0.16));
      const wx0 = Math.round(ccx - pW * 0.26), wx1 = Math.round(ccx + pW * 0.26);
      const peaks = [];
      for (let y = wy0; y <= wy1; y++) {
        let s = 0, n = 0;
        for (let x = wx0; x <= wx1; x += 2) {
          const i = y * W + x;
          if (mask[i]) { s += strength[i] || 0; n++; }
        }
        if (n > 4) peaks.push({ y, v: s / n });
      }
      peaks.sort((a, b) => b.v - a.v);
      const chosen = [];
      for (const p of peaks) {
        if (p.v < 0.24) break;
        if (chosen.every(c => Math.abs(c.y - p.y) > palmH * 0.035)) chosen.push(p);
        if (chosen.length >= 3) break;
      }
      chosen.sort((a, b) => a.y - b.y);
      if (chosen.length) {
        const best = chosen[0];
        const path = [];
        for (let x = wx0; x <= wx1; x += 4) path.push([x, best.y]);
        wrist = { path, count: chosen.length, conf: best.v };
      }
    }

    /* ---- texture & shape ---- */
    let creaseN = 0, palmN = 0;
    for (let y = palmTop + Math.round(palmH * 0.4); y <= palmBottom; y++) for (let x = px0; x <= px1; x++) {
      const i = y * W + x;
      if (inner[i]) { palmN++; if (strength[i] > 0.3) creaseN++; }
    }
    const density = palmN ? creaseN / palmN : 0;
    const aspect = palmH / pW;
    const fingerLen = palmTop - box.y0;
    const fingerRatio = fingerLen / palmH;

    /* ---- finger gaps (for heart-line endpoint) ---- */
    const gapXs = [];
    {
      const y = palmTop - Math.max(4, Math.round(palmH * 0.06));
      if (y > box.y0) {
        let inRun = false, start = 0;
        for (let x = 0; x < W; x++) {
          const m = mask[y * W + x];
          if (m && !inRun) { start = x; inRun = true; }
          if (!m && inRun) { gapXs.push((start + x) / 2); inRun = false; }
        }
        if (inRun) gapXs.push((start + W) / 2);
      }
    }

    /* ---- assemble features ---- */
    const F = [];
    const norm = p => [+(p[0] / W).toFixed(4), +(p[1] / H).toFixed(4)];
    const npath = st => st ? st.path.map(norm) : null;
    function push(id, cat, status, attrs, zh, en, loc) {
      const f = { id, '类别': cat, '状态': status, '属性': attrs || {}, '描述': zh, '描述en': en };
      if (loc) Object.assign(f, loc);
      F.push(f);
      return f;
    }
    const pct = v => Math.round(v * 100);

    /* heart line */
    {
      const st = heart, status = statusOf(st);
      const attrs = {};
      let zh = '算法沿掌上部横带追踪到感情线候选。', en = 'The algorithm traced a heart-line candidate across the upper palm band.';
      if (st && status !== '未见' && status !== '不清') {
        const span = Math.abs(st.path[st.path.length - 1][0] - st.path[0][0]) / pW;
        if (span > 0.72) attrs['长度'] = '长';
        const radialEnd = thumbRight ? st.path[st.path.length - 1] : st.path[0];
        const ulnarEnd = thumbRight ? st.path[0] : st.path[st.path.length - 1];
        if (gapXs.length >= 2) {
          const sorted = gapXs.slice().sort((a, b) => thumbRight ? b - a : a - b);
          const gapIdxMid = (sorted[0] + sorted[1]) / 2;
          if (Math.abs(radialEnd[0] - gapIdxMid) < pW * 0.1) attrs['终点'] = '食中指缝';
        }
        if (ulnarEnd[1] - radialEnd[1] > palmH * 0.07) attrs['走向'] = '掌缘低、向食中指间上扬';
        const mid = st.ss.slice(Math.floor(st.ss.length * 0.3), Math.floor(st.ss.length * 0.7));
        const dips = mid.filter(s => s < 0.15).length;
        if (dips > mid.length * 0.18) attrs['交会'] = '中段有细纹交会';
        zh = '追踪到感情线：覆盖 ' + pct(st.coverage) + '%，平均强度 ' + pct(st.conf) + '%。';
        en = 'Heart line traced: ' + pct(st.coverage) + '% coverage, ' + pct(st.conf) + '% mean strength.';
      } else if (status === '不清') { zh = '掌上部横带只看到浅影，感情线判为不清。'; en = 'Only a faint shadow in the upper band; heart line marked faint.'; }
      else { zh = '未能在这张照片里定位感情线。'; en = 'The heart line could not be located in this photo.'; }
      push('感情线', '线', status, attrs, zh, en, npath(st) ? { '路径': npath(st) } : null);
    }
    /* head line */
    {
      const st = head, status = statusOf(st);
      const attrs = {};
      let zh = '算法沿掌中部横带追踪智慧线候选。', en = 'The algorithm traced a head-line candidate across the mid palm.';
      if (st && (status === '清楚' || status === '部分')) {
        const span = Math.abs(st.path[st.path.length - 1][0] - st.path[0][0]) / pW;
        if (span > 0.62) attrs['长度'] = '长'; else if (span > 0.4) attrs['长度'] = '中';
        const radialEnd = thumbRight ? st.path[st.path.length - 1] : st.path[0];
        const ulnarEnd = thumbRight ? st.path[0] : st.path[st.path.length - 1];
        const slope = (ulnarEnd[1] - radialEnd[1]) / pW;
        if (slope > 0.08 && slope < 0.45) attrs['走向'] = '平缓下斜';
        if (life && life.path.length) {
          const lifeStart = life.path[0];
          if (Math.hypot(radialEnd[0] - lifeStart[0], radialEnd[1] - lifeStart[1]) < pW * 0.09) attrs['起点'] = '与生命线同源';
        }
        const tail = st.ss.slice(-Math.floor(st.ss.length * 0.2));
        const mid = st.ss.slice(Math.floor(st.ss.length * 0.3), Math.floor(st.ss.length * 0.6));
        const avg = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
        if (avg(tail) < avg(mid) * 0.55) attrs['末段'] = '交会变浅';
        zh = '追踪到智慧线：覆盖 ' + pct(st.coverage) + '%，平均强度 ' + pct(st.conf) + '%。';
        en = 'Head line traced: ' + pct(st.coverage) + '% coverage, ' + pct(st.conf) + '% mean strength.';
      } else if (status === '不清') { zh = '掌中部只看到浅影，智慧线判为不清。'; en = 'Only a faint shadow mid-palm; head line marked faint.'; }
      else { zh = '未能在这张照片里定位智慧线。'; en = 'The head line could not be located in this photo.'; }
      push('智慧线', '线', status, attrs, zh, en, npath(st) ? { '路径': npath(st) } : null);
    }
    /* life line */
    {
      const st = life, status = statusOf(st);
      const attrs = {};
      let zh = '算法沿拇指根弧线追踪生命线候选。', en = 'The algorithm traced a life-line candidate around the thumb base.';
      if (st && (status === '清楚' || status === '部分')) {
        const tcx = radialX, tcy = palmTop + palmH * 0.16;
        const rAvg = st.path.reduce((a, p) => a + Math.hypot(p[0] - tcx, p[1] - tcy), 0) / st.path.length;
        if (rAvg > pW * 0.34) attrs['弧度'] = '宽';
        const end = st.path[st.path.length - 1];
        if (Math.abs(end[0] - ccx) < pW * 0.14 && end[1] > palmBottom - palmH * 0.16) attrs['末端'] = '掌根中部';
        const dips = st.ss.filter(s => s < 0.15).length;
        if (dips > st.ss.length * 0.22) attrs['中段'] = '杂纹交叉';
        zh = '追踪到生命线：覆盖 ' + pct(st.coverage) + '%，平均强度 ' + pct(st.conf) + '%。';
        en = 'Life line traced: ' + pct(st.coverage) + '% coverage, ' + pct(st.conf) + '% mean strength.';
      } else if (status === '不清') { zh = '拇指根弧线只看到浅影，生命线判为不清。'; en = 'Only a faint arc at the thumb base; life line marked faint.'; }
      else { zh = '未能在这张照片里定位生命线。'; en = 'The life line could not be located in this photo.'; }
      push('生命线', '线', status, attrs, zh, en, npath(st) ? { '路径': npath(st) } : null);
    }
    /* fate line */
    {
      const st = fate, status = statusOf(st);
      const attrs = {};
      let zh = '算法沿掌心中线追踪事业线候选。', en = 'The algorithm traced a fate-line candidate along the palm midline.';
      if (st && (status === '清楚' || status === '部分')) {
        const bottom = st.path[st.path.length - 1], top = st.path[0];
        if (bottom[1] < palmBottom - palmH * 0.18) attrs['起点'] = '掌心';
        if (st.gaps >= 2) attrs['连续'] = '断续';
        attrs['上段'] = (top[1] < palmTop + palmH * 0.07 && status === '清楚') ? '贯指' : '未贯指';
        zh = '追踪到事业线：覆盖 ' + pct(st.coverage) + '%，平均强度 ' + pct(st.conf) + '%。';
        en = 'Fate line traced: ' + pct(st.coverage) + '% coverage, ' + pct(st.conf) + '% mean strength.';
      } else if (status === '不清') { zh = '掌心中线只看到浅影，事业线判为不清。'; en = 'Only a faint midline shadow; fate line marked faint.'; }
      else { zh = '未能在这张照片里定位事业线（没有事业线也很常见）。'; en = 'No fate line located (having none is also common).'; }
      push('事业线', '线', status, attrs, zh, en, npath(st) ? { '路径': npath(st) } : null);
    }
    /* health / sun / marriage: honest not-seen */
    push('健康线', '线', '未见', {}, '掌根到小指方向未见明确斜纹；算法不硬认。', 'No clear diagonal from palm root toward the little finger; not forced.', null);
    push('太阳线', '线', '未见', {}, '无名指下方细纹需要更高分辨率，本图未辨。', 'Fine lines below the ring finger need higher resolution; not resolved here.', null);
    push('婚姻线', '线', '未见', {}, '小指根侧缘短横纹需侧拍特写，本图未入辨。', 'Short edge lines below the little finger need a side close-up; not resolved here.', null);
    /* palm shape */
    {
      const attrs = {};
      if (aspect > 1.12) attrs['长宽'] = '长方'; else if (aspect > 0.86) attrs['长宽'] = '方';
      if (density > 0.15) attrs['纹理'] = '细纹密';
      if (fingerRatio < 0.72) attrs['指掌比'] = '指短于掌'; else if (fingerRatio > 0.95) attrs['指掌比'] = '指长于掌';
      push('掌形', '形', '清楚', attrs,
        '掌面宽高比 ' + aspect.toFixed(2) + '，下部细纹密度 ' + pct(density) + '%，指掌长比 ' + fingerRatio.toFixed(2) + '。厚薄需手感，照片不判。',
        'Palm aspect ' + aspect.toFixed(2) + ', lower-palm fine-line density ' + pct(density) + '%, finger/palm length ratio ' + fingerRatio.toFixed(2) + '. Thickness needs touch; not judged from a photo.',
        { '区域': [+(ccx / W).toFixed(4), +(ccy / H).toFixed(4), +(pW * 0.5 / W).toFixed(4)] });
    }
    /* palm center */
    {
      const attrs = {};
      if (en && edgeRed - centerRed > 7) attrs['形态'] = '四周丰中间浅';
      push('掌心', '形', Object.keys(attrs).length ? '部分' : '不清', attrs,
        '掌心与四周色差 ' + Math.round(edgeRed - centerRed) + '（红度差）。凹陷程度照片难判，请对照确认。',
        'Edge-to-center redness difference ' + Math.round(edgeRed - centerRed) + '. Hollow depth is hard to judge from a photo; please confirm.',
        { '点': [+(ccx / W).toFixed(4), +(ccy / H).toFixed(4)] });
    }
    /* palm color */
    push('掌色', '色', '清楚', colorAttrs,
      '掌心平均 RGB ' + Math.round(cr) + '/' + Math.round(cg) + '/' + Math.round(cb2) + '，边缘红度差 ' + Math.round(edgeRed - centerRed) + '。受光线影响大，请对照原照确认。',
      'Mean palm RGB ' + Math.round(cr) + '/' + Math.round(cg) + '/' + Math.round(cb2) + ', edge redness delta ' + Math.round(edgeRed - centerRed) + '. Lighting affects this strongly; confirm against the photo.',
      { '区域': [+(ccx / W).toFixed(4), +(ccy / H).toFixed(4), +(pW * 0.42 / W).toFixed(4)] });
    /* mounts & palaces: regions shown, fullness left to the user */
    const mountDefs = [
      ['金星丘', '丘', radialX - dir * pW * 0.16, palmTop + palmH * 0.42, '拇指根肉垫。饱满度请对照照片确认。', 'Thumb-root mound. Confirm fullness against the photo.'],
      ['月丘', '丘', ulnarX + dir * pW * 0.14, palmTop + palmH * 0.72, '小指侧掌缘下半段。饱满度请对照照片确认。', 'Lower ulnar edge. Confirm fullness against the photo.'],
      ['坎宫', '宫', ccx, palmBottom - palmH * 0.06, '掌根正中。是否泛红请对照确认。', 'Center of the palm root. Confirm any redness.'],
      ['巽宫', '宫', radialX - dir * pW * 0.2, palmTop + palmH * 0.1, '食指根下（初主）。饱满度请对照确认。', 'Below the index finger (First Lord). Confirm fullness.'],
      ['离宫', '宫', ccx, palmTop + palmH * 0.08, '中指根下（中主）。饱满度请对照确认。', 'Below the middle finger (Middle Lord). Confirm fullness.'],
      ['坤宫', '宫', ulnarX + dir * pW * 0.16, palmTop + palmH * 0.12, '小指根下（末主）。饱满度请对照确认。', 'Below the little finger (Last Lord). Confirm fullness.']
    ];
    for (const [id, cat, x, y, zh, en] of mountDefs) {
      push(id, cat, '部分', {}, zh, en, { '区域': [+(clamp(x, 0, W) / W).toFixed(4), +(clamp(y, 0, H) / H).toFixed(4), +(pW * 0.13 / W).toFixed(4)] });
    }
    /* fingers */
    {
      const thumbWide = Math.max(leftExt, rightExt) > pW * 0.2;
      const attrs = {};
      if (thumbWide) attrs['外张'] = '大';
      push('拇指', '指', '部分', attrs,
        '拇指外展量 ' + Math.round(Math.max(leftExt, rightExt)) + 'px（掌宽的 ' + pct(Math.max(leftExt, rightExt) / pW) + '%）。粗细请对照确认。',
        'Thumb extension ' + Math.round(Math.max(leftExt, rightExt)) + 'px (' + pct(Math.max(leftExt, rightExt) / pW) + '% of palm width). Confirm build against the photo.',
        { '点': [+(clamp(radialX + dir * pW * 0.12, 0, W) / W).toFixed(4), +((palmTop + palmH * 0.2) / H).toFixed(4)] });
    }
    push('小指', '指', '部分', {}, '小指与无名指间距请对照确认（算法对指缝角度不稳）。', 'Confirm the little-finger spread against the photo (gap angles are unstable for the algorithm).', { '点': [+(clamp(ulnarX + dir * pW * 0.06, 0, W) / W).toFixed(4), +((palmTop - palmH * 0.12) / H).toFixed(4)] });
    push('四指', '指', '部分', {}, '指节是否平顺、指端圆尖请对照确认。', 'Confirm smooth joints and tip shape against the photo.', { '区域': [+(((fingerSpan.x0 + fingerSpan.x1) / 2) / W).toFixed(4), +((box.y0 + fingerLen * 0.4) / H).toFixed(4), +(pW * 0.3 / W).toFixed(4)] });
    push('中指指腹', '指', '未见', {}, '斗/箕/弓需要指腹特写，本图分辨率不足，不提取细节。', 'Whorl/loop/arch needs a fingertip close-up; resolution insufficient, no detail extraction.', null);
    /* wrist */
    {
      const attrs = {};
      let status = '未见', zh = '腕纹未入镜或未辨清。', en = 'Wrist lines out of frame or unresolved.';
      if (wrist) {
        status = wrist.count >= 2 && wrist.conf > 0.3 ? '部分' : '不清';
        if (wrist.count >= 2) attrs['道数'] = '两道清楚';
        zh = '腕前检测到 ' + wrist.count + ' 道横纹候选（强度 ' + pct(wrist.conf) + '%）。';
        en = wrist.count + ' wrist-crease candidates detected (' + pct(wrist.conf) + '% strength).';
      }
      push('腕纹', '纹', status, attrs, zh, en, wrist ? { '路径': wrist.path.map(norm) } : null);
    }

    return {
      ok: true,
      features: F,
      meta: {
        w: srcCanvas.width, h: srcCanvas.height, aw: W, ah: H,
        handGuess, palmBox: [px0 / W, palmTop / H, pW / W, palmH / H],
        thumbRight, density, aspect, fingerRatio,
        color: { r: Math.round(cr), g: Math.round(cg), b: Math.round(cb2), edgeDelta: Math.round(edgeRed - centerRed) },
        lines: {
          '感情线': heart && { conf: heart.conf, coverage: heart.coverage },
          '智慧线': head && { conf: head.conf, coverage: head.coverage },
          '生命线': life && { conf: life.conf, coverage: life.coverage },
          '事业线': fate && { conf: fate.conf, coverage: fate.coverage }
        }
      }
    };
  }

  function majority(mask, W, H) {
    const out = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += mask[(y + dy) * W + x + dx];
      out[y * W + x] = n >= 5 ? 1 : 0;
    }
    return out;
  }
  function erode(mask, W, H, r) {
    const out = new Uint8Array(W * H);
    for (let y = r; y < H - r; y++) for (let x = r; x < W - r; x++) {
      let ok = 1;
      for (let dy = -r; dy <= r && ok; dy += r) for (let dx = -r; dx <= r && ok; dx += r) if (!mask[(y + dy) * W + x + dx]) ok = 0;
      out[y * W + x] = ok;
    }
    return out;
  }
  function largestComponent(mask, W, H) {
    const seen = new Uint8Array(W * H);
    let best = null;
    const stack = [];
    for (let i = 0; i < W * H; i++) {
      if (!mask[i] || seen[i]) continue;
      stack.length = 0; stack.push(i); seen[i] = 1;
      const cells = [];
      let x0 = W, x1 = 0, y0 = H, y1 = 0;
      while (stack.length) {
        const c = stack.pop();
        cells.push(c);
        const x = c % W, y = (c / W) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && mask[c - 1] && !seen[c - 1]) { seen[c - 1] = 1; stack.push(c - 1); }
        if (x < W - 1 && mask[c + 1] && !seen[c + 1]) { seen[c + 1] = 1; stack.push(c + 1); }
        if (y > 0 && mask[c - W] && !seen[c - W]) { seen[c - W] = 1; stack.push(c - W); }
        if (y < H - 1 && mask[c + W] && !seen[c + W]) { seen[c + W] = 1; stack.push(c + W); }
      }
      if (!best || cells.length > best.count) best = { count: cells.length, cells, box: { x0, x1, y0, y1 } };
    }
    if (!best) return null;
    const m = new Uint8Array(W * H);
    for (const c of best.cells) m[c] = 1;
    return { mask: m, count: best.count, box: best.box };
  }
  function boxBlur(src, W, H, r) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    const win = 2 * r + 1;
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[y * W + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = acc / win;
        acc += src[y * W + clamp(x + r + 1, 0, W - 1)] - src[y * W + clamp(x - r, 0, W - 1)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) {
        out[y * W + x] = acc / win;
        acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x];
      }
    }
    return out;
  }

  root.PalmVision = { analyze };
})(typeof window !== 'undefined' ? window : globalThis);