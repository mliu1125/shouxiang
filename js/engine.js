/* PalmSpeak judgment engine — JavaScript port of guide_reading.py (Apache-2.0, BLCaptain).
   Same observation + same library + same date => identical content object.
   Observation records always use the Chinese contract keys/values; `lang` only localizes display strings. */
(function (root) {
  'use strict';
  const STATES = ['清楚', '部分', '不清', '未见'];
  const WEIGHT = { '清楚': 1.0, '部分': 0.7, '不清': 0.3, '未见': 0.0 };
  const INDEXES = ['事业', '财运', '感情', '桃花', '健康'];
  const INDEX_TIERS = [[80, '吉'], [60, '平'], [0, '慎']];
  const FOCUS = {
    '财运': ['财', '钱', '破财', '横财', '守财', '收入', 'wealth', 'money', 'income', 'salary'],
    '感情': ['感情', '桃花', '婚', '恋', '对象', '伴侣', 'love', 'romance', 'marriage', 'partner', 'relationship'],
    '事业': ['事业', '工作', '升职', '跳槽', '创业', 'career', 'job', 'promotion', 'work', 'business'],
    '健康': ['健康', '身体', '病', '睡眠', '体检', 'health', 'body', 'sleep', 'checkup']
  };
  const YEAR_MOD = { '财': { '财运': 4 }, '印': { '事业': 3, '健康': 2 }, '官杀': { '事业': 2, '健康': -3 }, '比劫': { '财运': -3 }, '食伤': { '桃花': 3, '财运': -1 } };
  const FOCUS_MONTH_ZH = { '上火': '官杀', '睡眠': '官杀', '肠胃': '官杀', '透支': '官杀', '漏财': '比劫', '感情内耗': '桃花' };
  const FOCUS_MONTH_EN = { 'Inner heat': '官杀', 'Sleep': '官杀', 'Digestion': '官杀', 'Overdraft': '官杀', 'Money leaks': '比劫', 'Emotional drain': '桃花' };
  const THEME_ZH = { '上火': '健康', '睡眠': '健康', '肠胃': '健康', '透支': '健康', '久坐腰腿': '健康', '操心': '健康', '漏财': '财运', '感情内耗': '感情', '换赛道': '事业' };
  const THEME_EN = { 'Inner heat': '健康', 'Sleep': '健康', 'Digestion': '健康', 'Overdraft': '健康', 'Sitting strain': '健康', 'Worrying': '健康', 'Money leaks': '财运', 'Emotional drain': '感情', 'Lane change': '事业' };
  const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ORDER = ['感情线', '智慧线', '生命线', '事业线', '健康线', '太阳线', '婚姻线', '掌形', '掌心', '掌色', '金星丘', '月丘', '坎宫', '拇指', '小指', '四指', '中指指腹', '腕纹'];

  /* Python-compatible rounding (half-to-even on the exact binary value). */
  function pyRound(x, n) {
    n = n || 0;
    if (!isFinite(x)) return x;
    const neg = x < 0; const ax = Math.abs(x);
    const s = ax.toFixed(Math.min(n + 17, 100));
    const dot = s.indexOf('.');
    const digits = (dot < 0 ? s : s.slice(0, dot) + s.slice(dot + 1)).split('').map(Number);
    const pointPos = dot < 0 ? s.length : dot;
    const cut = pointPos + n;
    let keep = digits.slice(0, Math.max(cut, 0));
    while (keep.length < Math.max(cut, 1)) keep.push(0);
    const rest = digits.slice(Math.max(cut, 0));
    let up = false;
    if (rest.length) {
      const first = rest[0];
      const tailNonZero = rest.slice(1).some(d => d !== 0);
      if (first > 5 || (first === 5 && tailNonZero)) up = true;
      else if (first === 5 && !tailNonZero) {
        const last = keep.length ? keep[keep.length - 1] : 0;
        up = (last % 2) === 1;
      }
    }
    let i = keep.length - 1;
    if (up) {
      while (i >= 0) { keep[i]++; if (keep[i] < 10) break; keep[i] = 0; i--; }
      if (i < 0) keep.unshift(1);
    }
    let str = keep.join('');
    let intPart, fracPart;
    if (n <= 0) { intPart = str; fracPart = ''; }
    else {
      const pp = str.length - n;
      intPart = str.slice(0, pp) || '0'; fracPart = str.slice(pp);
    }
    let val = parseFloat(intPart + (fracPart ? '.' + fracPart : ''));
    return neg ? -val : val;
  }

  function getLib() { return root.PALM_LIB; }
  function getEN() { return root.PALM_LIB_EN; }

  function validate(obs) {
    if (obs.schema_version !== '指南观察/1.0') throw new Error('观察记录 schema_version 应为 指南观察/1.0');
    const seen = new Set(); const feats = {};
    for (const f of obs['特征'] || []) {
      if (seen.has(f.id)) throw new Error('特征 id 重复：' + f.id);
      seen.add(f.id);
      if (!STATES.includes(f['状态'])) throw new Error(f.id + ' 状态须为 ' + STATES.join('/'));
      feats[f.id] = f;
    }
    return feats;
  }

  function route(question) {
    if (!question) return null;
    const q = String(question).toLowerCase();
    for (const topic of Object.keys(FOCUS)) {
      if (FOCUS[topic].some(w => q.includes(w.toLowerCase()))) return topic;
    }
    return null;
  }

  function relation(hand, month, lib) {
    const gen = lib['五行']['生'], ctl = lib['五行']['克'];
    if (month === hand) return '比劫';
    if (gen[month] === hand) return '印';
    if (gen[hand] === month) return '食伤';
    if (ctl[hand] === month) return '财';
    return '官杀';
  }

  function match(lib, feats) {
    const hits = [], misses = [];
    for (const rule of lib['规则']) {
      const f = feats[rule['特征']];
      const cond = rule['条件'];
      if (!f) { misses.push({ '编号': rule['编号'], '原因': '本图无此特征记录' }); continue; }
      if (!(cond['状态'] || STATES).includes(f['状态'])) { misses.push({ '编号': rule['编号'], '原因': '状态为' + f['状态'] }); continue; }
      const bad = Object.keys(cond).filter(k => k !== '状态' && !(cond[k] || []).includes((f['属性'] || {})[k]));
      if (bad.length) {
        misses.push({ '编号': rule['编号'], '原因': '条件不符：' + bad.map(k => k + '=' + ((f['属性'] || {})[k] !== undefined ? f['属性'][k] : '未记')).join('、') });
        continue;
      }
      hits.push(Object.assign({}, rule, { '权': WEIGHT[f['状态']] }));
    }
    return [hits, misses];
  }

  function fiveElements(lib, feats, lang) {
    const score = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    const used = [];
    for (const w of lib['五行手型']['权重']) {
      const f = feats[w['特征']];
      if (f && (f['状态'] === '清楚' || f['状态'] === '部分') && (f['属性'] || {})[w['属性']] === w['值']) {
        for (const k of Object.keys(w['五行'])) score[k] += w['五行'][k];
        used.push(w['特征'] + '·' + w['值']);
      }
    }
    const total = Object.values(score).reduce((a, b) => a + b, 0) || 1;
    const tie = '土火金水木';
    const order = Object.keys(score).sort((a, b) => (score[b] - score[a]) || (tie.indexOf(a) - tie.indexOf(b)));
    const pct = {};
    for (const k of order) pct[k] = pyRound(score[k] * 100 / total);
    const main = order[0], second = order[1];
    const en = getEN();
    const sign = lang === 'en'
      ? (en.signs[main + second] || en.signFallback(en.elements[main], en.elements[second]))
      : (lib['五行手型']['签'][main + second] || (main + second + '相参'));
    const nature = lang === 'en' ? en.nature[main] : lib['五行手型']['性情'][main];
    return { '主': main, '副': second, '占比': pct, '签': sign, '性情': nature, '依据特征': used };
  }

  function season(md, lib) {
    const bounds = lib['四季纹']['季界'];
    let cur = '冬';
    for (const name of ['春', '夏', '秋', '冬']) if (md >= bounds[name]) cur = name;
    return cur;
  }

  function colorNote(lib, feats, day, lang) {
    const f = feats['掌色'];
    if (!f || !(f['状态'] === '清楚' || f['状态'] === '部分')) return null;
    const tone = (f['属性'] || {})['整体'] || '';
    const hue = (tone.includes('赤') || tone.includes('红')) ? '赤' : tone.includes('黄') ? '黄' : tone.includes('白') ? '白' : tone.includes('黑') ? '黑' : tone.includes('青') ? '青' : null;
    const s = season(day.md, lib);
    const tab = lib['四季纹'];
    const en = getEN();
    if (hue && tab['应时'][s] === hue) {
      const text = lang === 'en' ? en.season.inSeason(en.season.names[s], en.season.hues[hue])
        : '现在是' + s + '季，掌色偏' + hue + '正合时令：顺势而为，这一季做事有劲。';
      return { '季': s, '色': hue, '判': '应时', '断': text, '原句': tab['原句'][0] };
    }
    if (hue && tab['逆时'][s] === hue) {
      const nxtZh = { '春': '立夏', '夏': '立秋', '秋': '立冬', '冬': '立春' }[s];
      const text = lang === 'en' ? en.season.offSeason(en.season.names[s], en.season.hues[hue], en.season.nextTerm[s])
        : s + '季掌色偏' + hue + '，按〈四季纹〉属逆时之色：' + nxtZh + '之前脾气急、易起口舌，大事缓一缓再拍板。';
      return { '季': s, '色': hue, '判': '逆时', '断': text, '原句': tab['原句'][1] };
    }
    return null;
  }

  function tier(score) { for (const [floor, name] of INDEX_TIERS) if (score >= floor) return name; }

  function indexes(hits, relYear, peachYear, lang) {
    const acc = {}; INDEXES.forEach(k => acc[k] = []);
    for (const r of hits) for (const k of Object.keys(r['指数'] || {})) acc[k].push([r['指数'][k] * r['权'], localized(r, 'short', lang), r['编号']]);
    for (const k of Object.keys(YEAR_MOD[relYear] || {})) acc[k].push([YEAR_MOD[relYear][k], lang === 'en' ? 'Year meets ' + godEN(relYear) : '流年逢' + relYear, '流年']);
    if (peachYear) acc['桃花'].push([3, lang === 'en' ? 'Year meets Peach Blossom' : '流年逢桃花', '流年']);
    const out = [];
    for (const k of INDEXES) {
      const raw = acc[k].reduce((a, x) => a + x[0], 0);
      let val = 60 + (raw >= 0 ? 35 * Math.tanh(raw / 30) : 15 * Math.tanh(raw / 12));
      val = Math.max(45, Math.min(95, pyRound(val)));
      const top = acc[k].slice().sort((a, b) => Math.abs(b[0]) - Math.abs(a[0])).slice(0, 3);
      out.push({ '项': k, '分': val, '理由': top.map(x => ({ '加减': pyRound(x[0], 1), '因': x[1], '规则': x[2] })) });
    }
    out.push({ '项': '综合', '分': pyRound(out.reduce((a, x) => a + x['分'], 0) / out.length), '理由': [{ '加减': 0, '因': lang === 'en' ? 'Mean of five' : '五项平均', '规则': '综合' }] });
    for (const x of out) x['档'] = tier(x['分']);
    return out;
  }

  function godEN(rel) { return getEN().tenGods[rel].label.replace(' month', ''); }

  /* Localized rule display fields. */
  function localized(r, field, lang) {
    if (lang !== 'en') {
      return { feat: r['特征句'], short: r['短断'], read: r['解读'] }[field];
    }
    const t = getEN().rules[r['编号']] || {};
    return { feat: t.feat || r['特征句'], short: t.short || r['短断'], read: t.read || r['解读'] }[field];
  }
  function localizedList(r, key, enKey, lang) {
    if (lang !== 'en') return r[key] || [];
    return (getEN().rules[r['编号']] || {})[enKey] || [];
  }

  function yearCard(lib, hand, name, year, lang) {
    const rels = [];
    for (const el of year['五行']) { const r = relation(hand, el, lib); if (!rels.includes(r)) rels.push(r); }
    const en = getEN();
    let text, labels;
    if (lang === 'en') {
      text = rels.map(r => {
        const t = en.tenGods[r].text;
        return t.slice(t.indexOf(': ') + 2).replace(/\.+$/, '');
      }).join('; ') + '.';
      labels = rels.map(r => en.tenGods[r].label.replace('month', 'year')).join(' + ');
    } else {
      text = rels.map(r => lib['十神'][r]['断'].split('：', 2)[1].replace(/。+$/, '')).join('；') + '。';
      labels = rels.map(r => lib['十神'][r]['标签'].replace('月', '年')).join('＋');
    }
    if (rels.length > 1) text = (lang === 'en' ? 'Two currents arrive together: ' : '两股气一起来：') + text;
    return { '年': name, '干支': year['干支'], '十神': rels.join(lang === 'en' ? ' + ' : '＋'), '标签': labels, '断': text };
  }

  function months(lib, hand, hits, start, lang, count) {
    count = count || 6;
    const tags = {};
    for (const s of Object.keys(lib['地支神煞'])) for (const t of lib['地支神煞'][s]) tags[t] = s;
    const leak = hits.filter(r => r['口子']).map(r => lang === 'en' ? ((getEN().rules[r['编号']] || {}).leak || r['口子']) : r['口子']);
    const money = hits.filter(r => r['主题'] === '财运' && Object.values(r['指数'] || {}).reduce((a, b) => a + b, 0) > 0).map(r => localized(r, 'short', lang));
    const fire = hits.some(r => (r['关注'] || {})['标签'] === '上火');
    const love = hits.filter(r => r['主题'] === '感情' || r['主题'] === '桃花').map(r => localized(r, 'short', lang));
    const organZh = lib['五行']['脏腑'], organEn = getEN().organs;
    const rows = lib['月令'].filter(m => m['月'] >= start);
    const out = [];
    for (const m of rows.slice(0, count)) {
      const rel = relation(hand, m['五行'], lib);
      const god = lib['十神'][rel];
      const godL = lang === 'en' ? getEN().tenGods[rel] : null;
      const extra = [];
      if (rel === '财' && money.length) {
        extra.push(lang === 'en' ? 'Your money route: ' + money[0] + ' \u2014 most effective this month.' : '你的财路：' + money[0] + '，这个月最见效。');
      }
      if (rel === '比劫') {
        const lk = leak.length ? leak[0] : (lang === 'en' ? 'social favors' : '人情往来');
        extra.push(lang === 'en'
          ? 'Your money leak: ' + lk + '. When a friend asks to borrow, first ask yourself: \u201ccan I write this off?\u201d'
          : '你的漏财口子：' + lk + '。朋友开口借钱，先问自己「收不回来行不行」。');
      }
      if (rel === '官杀') {
        const body = lang === 'en'
          ? 'Watch ' + organEn[hand] + ' and ' + organEn[m['五行']]
          : '身体看' + organZh[hand] + '和' + organZh[m['五行']];
        extra.push(body + (fire
          ? (lang === 'en' ? ' \u2014 with your strong fire on top, this is the half-year\u2019s most important month to sleep early.' : '，叠加你本来火气旺，是这半年最该早睡的月份。')
          : (lang === 'en' ? '; keep meals and sleep on time.' : '，按时吃饭睡觉。')));
      }
      const sha = tags[m['支']];
      if (sha) {
        let t = lang === 'en' ? getEN().shaText[sha] : lib['神煞断'][sha];
        if (sha === '桃花' && love.length) {
          t += lang === 'en' ? getEN().peachAdvice(love[0]) : '你是「' + love[0] + '」的人，别把客气当暧昧。';
        }
        extra.push(t);
      }
      out.push({
        '月': m['月'], '节气': m['节气'], '支': m['支'], '五行': m['五行'], '十神': rel,
        '标签': lang === 'en' ? godL.label : god['标签'], '级': god['级'],
        '断': lang === 'en' ? godL.text : god['断'], '补': extra,
        '宜': lang === 'en' ? godL.yi : god['宜'], '忌': lang === 'en' ? godL.ji : god['忌'], '神煞': sha || null
      });
    }
    return out;
  }

  function nextLucky(lib, hand, after, lang) {
    for (const m of lib['月令']) {
      if (m['月'] > after) {
        const rel = relation(hand, m['五行'], lib);
        if (rel === '印' || rel === '财') {
          return { '月': m['月'], '十神': rel, '标签': lang === 'en' ? getEN().tenGods[rel].label : lib['十神'][rel]['标签'] };
        }
      }
    }
    return null;
  }

  function crossY(path, x) {
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i], [x2, y2] = path[i + 1];
      if (Math.min(x1, x2) <= x && x <= Math.max(x1, x2) && x1 !== x2) return y1 + (x - x1) / (x2 - x1) * (y2 - y1);
    }
    let best = path[0];
    for (const p of path) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
    return best[1];
  }

  function ageScale(lib, feats) {
    const need = {};
    for (const k of ['事业线', '智慧线', '感情线', '腕纹']) need[k] = feats[k];
    for (const k of Object.keys(need)) {
      const f = need[k];
      if (!f || !(f['状态'] === '清楚' || f['状态'] === '部分') || !f['路径']) return null;
    }
    const career = need['事业线']['路径'];
    const x = career.reduce((a, p) => a + p[0], 0) / career.length;
    const anchor = lib['年龄尺']['锚点'];
    const ys = {};
    for (const k of Object.keys(anchor)) ys[k] = crossY(need[k]['路径'], x);
    const pts = Object.keys(anchor).map(k => [ys[k], anchor[k]]).sort((a, b) => b[0] - a[0]);
    if (!(pts[0][0] > pts[1][0] && pts[1][0] > pts[2][0])) return null;
    function age(y) {
      if (y >= pts[0][0]) return pts[0][1];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ya, aa] = pts[i], [yb, ab] = pts[i + 1];
        if (ya >= y && y >= yb) return aa + (ya - y) / (ya - yb) * (ab - aa);
      }
      const [ya, aa] = pts[pts.length - 2], [yb, ab] = pts[pts.length - 1];
      return ab + (yb - y) / (ya - yb) * (ab - aa);
    }
    const top = Math.min.apply(null, career.map(p => p[1]));
    const bottom = Math.max.apply(null, career.map(p => p[1]));
    const anchorY = {};
    for (const k of Object.keys(ys)) anchorY[k] = pyRound(ys[k], 4);
    return { 'x': pyRound(x, 4), '锚点y': anchorY, '起': Math.max(1, pyRound(age(bottom))), '止': pyRound(age(top)), '起y': bottom, '止y': top };
  }

  function stages(lib, feats, hits, toldAge, lang) {
    const en = getEN();
    const gong = {};
    for (const g of lib['三主']['宫']) gong[g['宫']] = g;
    const full = {};
    for (const name of ['巽宫', '离宫', '坤宫']) {
      const f = feats[name];
      if (f && (f['状态'] === '清楚' || f['状态'] === '部分')) full[name] = (f['属性'] || {})['饱满'] || '';
    }
    function palace(name) {
      const v = full[name] || '';
      return lang === 'en' ? (en.sanZhu.palaces[name].tone[v] || '') : (gong[name]['口吻'][v] || '');
    }
    const T = lang === 'en' ? en.stageTemplates : lib['阶段模板'];
    const scale = ageScale(lib, feats);
    const career = (feats['事业线'] || {})['属性'] || {};
    const hooks = [];
    for (const r of hits) for (const h of r['阶段'] || []) {
      const text = lang === 'en' ? (((en.rules[r['编号']] || {}).stages || []).find(s => s.seg === h['段']) || {}).text || h['断'] : h['断'];
      hooks.push([lib['年龄尺']['钩子岁'][h['段']], text, r['来源']]);
    }
    function seg(lo, hi, kind, title, lines, advice, src, basis) {
      return {
        '段': hi != null ? lo + '—' + hi : lo + '—', '起': lo, '止': hi != null ? hi : null, '类': kind, '题': title,
        '断': lines.filter(t => t), '宜': advice, '来源': Array.from(new Set(src)).sort(), '据': basis
      };
    }
    const out = [];
    if (scale) {
      const S = scale['起'], E = scale['止'];
      const fmt = s => String(s).replace(/\{S\}/g, String(S)).replace(/\{E\}/g, String(E));
      if (S > 1) {
        const title = lang === 'en' ? (T['打底'].title[full['巽宫'] || ''] || T['打底'].title['']) : (T['打底']['题'][full['巽宫'] || ''] || T['打底']['题']['']);
        const txt = lang === 'en' ? T['打底'].text : T['打底']['断'];
        const adv = lang === 'en' ? T['打底'].advice : T['打底']['宜'];
        out.push(seg(0, S - 1, '打底', title, [fmt(txt), palace('巽宫')], fmt(adv),
          full['巽宫'] !== undefined ? ['近代流年', '相三主'] : ['近代流年'],
          lang === 'en' ? 'The fate line\u2019s lower end sits in the palm center; by the age scale it begins around ' + S : '事业线最下端在掌心，按年龄尺约 ' + S + ' 岁才起头'));
      }
      const lo = Math.max(S, 1);
      if (lo < 35) {
        const key = career['起点'] === '掌心' ? '掌心' : '';
        const title = lang === 'en' ? T['起势'].title[key] : T['起势']['题'][key];
        const txt = lang === 'en' ? T['起势'].text[key] : T['起势']['断'][key];
        const adv = lang === 'en' ? T['起势'].advice : T['起势']['宜'];
        out.push(seg(lo, 34, '起势', fmt(title), [fmt(txt), palace('离宫')], fmt(adv),
          full['离宫'] !== undefined ? ['近代流年', '相三主'] : ['近代流年'],
          lang === 'en' ? 'The fate line begins around age ' + S : '事业线起点约 ' + S + ' 岁'));
      }
      if (E >= 50) {
        out.push(seg(35, 50, '贯通', lang === 'en' ? T['贯通'].title : T['贯通']['题'], [lang === 'en' ? T['贯通'].text : T['贯通']['断']],
          lang === 'en' ? T['贯通'].advice : T['贯通']['宜'], ['近代流年'], lang === 'en' ? 'The fate line crosses beyond the heart line' : '事业线越过感情线'));
      } else {
        const key = career['连续'] === '断续' ? '断续' : '';
        out.push(seg(35, Math.max(E, 35), '换道', lang === 'en' ? T['换道'].title[key] : T['换道']['题'][key],
          [lang === 'en' ? T['换道'].text[key] : T['换道']['断'][key]], lang === 'en' ? T['换道'].advice : T['换道']['宜'], ['近代流年'],
          lang === 'en' ? 'The fate \u00d7 head crossing is fixed at 35 by the age scale' : '事业线与智慧线交会处按年龄尺定为 35 岁'));
        out.push(seg(Math.max(E, 35) + 1, 50, '自补', fmt(lang === 'en' ? T['自补'].title : T['自补']['题']),
          [fmt(lang === 'en' ? T['自补'].text : T['自补']['断'])], fmt(lang === 'en' ? T['自补'].advice : T['自补']['宜']), ['近代流年'],
          lang === 'en' ? 'The fate line\u2019s top ends around age ' + E + ', short of the heart line (50)' : '事业线最上端约 ' + E + ' 岁，没到感情线（50 岁）'));
      }
    } else {
      out.push(seg(0, 25, '初主', tTitle(lib, '巽宫', full, lang), [palace('巽宫') || defaultStage(lib, '0—25', lang)], '',
        full['巽宫'] !== undefined ? ['相三主'] : ['阶段默认'], lang === 'en' ? 'Three Lords: Xun palace' : '〈相三主〉巽宫'));
      out.push(seg(26, 50, '中主', tTitle(lib, '离宫', full, lang), [palace('离宫') || defaultStage(lib, '36—45', lang)], '',
        full['离宫'] !== undefined ? ['相三主'] : ['阶段默认'], lang === 'en' ? 'Three Lords: Li palace' : '〈相三主〉离宫'));
    }
    const rank = ['缺', '平', '平满', '较满'];
    const li = full['离宫'], kun = full['坤宫'];
    let way = '平';
    if (li !== undefined && kun !== undefined && rank.includes(li) && rank.includes(kun)) {
      way = rank.indexOf(kun) > rank.indexOf(li) ? '升' : rank.indexOf(kun) < rank.indexOf(li) ? '降' : '平';
    }
    const TH = lang === 'en' ? en.stageTemplates['收成'] : lib['阶段模板']['收成'];
    const advice = lang === 'en' ? (TH.advice[kun || ''] || TH.advice['']) : (TH['宜'][kun || ''] || TH['宜']['']);
    out.push(seg(51, null, '收成', lang === 'en' ? TH.title[way] : TH['题'][way],
      [lang === 'en' ? TH.text[way] : TH['断'][way], palace('坤宫')], advice,
      kun ? ['相三主'] : ['阶段默认'],
      lang === 'en' ? 'Three Lords: Li ' + (li || 'unrecorded') + ' \u2192 Kun ' + (kun || 'unrecorded') : '〈相三主〉离宫' + (li || '未记') + '→坤宫' + (kun || '未记')));
    for (const [at, text, src] of hooks) {
      const s = out.find(x => x['起'] <= at && (x['止'] == null || at <= x['止']));
      if (!s) continue;
      let t = text;
      if (lang === 'en') { if (!/[.!?]$/.test(t)) t += '.'; }
      else if (!/[。！？]$/.test(t)) t += '。';
      s['断'].push(t);
      s['来源'] = Array.from(new Set(s['来源'].concat(src))).sort();
    }
    for (const s of out) s['当前'] = toldAge != null && s['起'] <= toldAge && (s['止'] == null || toldAge <= s['止']);
    return [out, scale];
  }

  function defaultStage(lib, key, lang) {
    return lang === 'en' ? getEN().stageDefaults[key] : lib['阶段默认'][key];
  }

  function tTitle(lib, name, full, lang) {
    const g = lib['三主']['宫'].find(x => x['宫'] === name);
    if (lang === 'en') {
      const v = full[name] || '';
      const text = getEN().sanZhu.palaces[name].verdict[v] || '';
      return text.includes(':') ? text.split(':')[0] : getEN().sanZhu.palaces[name].name;
    }
    const text = g['断'][full[name] || ''] || '';
    return text.includes('：') ? text.split('：')[0] : g['名'];
  }

  function focusPoints(hits, monthRows, topic, lang) {
    const agg = {};
    const fm = lang === 'en' ? FOCUS_MONTH_EN : FOCUS_MONTH_ZH;
    const theme = lang === 'en' ? THEME_EN : THEME_ZH;
    for (const r of hits) {
      const c = r['关注'];
      if (!c) continue;
      const label = lang === 'en' ? ((getEN().rules[r['编号']] || {}).focusLabel || c['标签']) : c['标签'];
      if (!agg[label]) agg[label] = { '标签': label, '分': 0, '规则': [], '说': [], '提醒': [] };
      const a = agg[label];
      a['分'] += c['权重'] * r['权'];
      a['规则'].push(r['编号']);
      a['说'].push(localized(r, 'read', lang));
      a['提醒'] = a['提醒'].concat(localizedList(r, '提醒', 'tips', lang));
    }
    for (const a of Object.values(agg)) {
      const key = fm[a['标签']];
      a['月'] = monthRows.filter(m => key && (m['十神'] === key || m['神煞'] === key)).map(m => m['月']);
      a['主题'] = theme[a['标签']] || '综合';
      a['分'] += 0.3 * monthRows.filter(m => a['月'].includes(m['月']) && m['级'] === '慎').length;
      if (topic && a['主题'] === topic) a['分'] += 10;
    }
    const ranked = Object.values(agg).sort((a, b) => (b['分'] - a['分']) || (a['标签'] < b['标签'] ? -1 : a['标签'] > b['标签'] ? 1 : 0));
    ranked.forEach((a, i) => { a['级'] = i < 3 ? ['头号', '第二', '第三'][i] : '次要'; a['分'] = pyRound(a['分'], 2); });
    return ranked;
  }

  function cnMonth(ym, baseYear, lang) {
    const [y, m] = ym.split('-');
    if (lang === 'en') return EN_MONTHS[parseInt(m, 10) - 1] + (y === baseYear ? '' : ' ' + y);
    return y === baseYear ? parseInt(m, 10) + '月' : y + '年' + parseInt(m, 10) + '月';
  }

  function advice(hits, focus, monthRows, baseYear, lang) {
    const items = [];
    const joiner = lang === 'en' ? ', ' : '、';
    for (const a of focus.slice(0, 3)) {
      const when = a['月'].slice(0, 2).map(m => cnMonth(m, baseYear, lang)).join(joiner);
      for (const t of a['提醒'].slice(0, 1)) items.push({ '时': when || (lang === 'en' ? 'this half-year' : '这半年'), '事': t, '因': a['标签'] });
    }
    const lucky = {};
    for (const m of monthRows) {
      if (m['级'] === '吉') {
        const key = lang === 'en' ? m['标签'] + ' \u2014 good for ' + m['宜'] : m['标签'] + '，宜' + m['宜'];
        (lucky[key] = lucky[key] || []).push(cnMonth(m['月'], baseYear, lang));
      }
    }
    for (const text of Object.keys(lucky)) items.push({ '时': lucky[text].join(joiner), '事': text, '因': lang === 'en' ? 'monthly flow' : '流月' });
    const seen = new Set(); const out = [];
    for (const r of hits) for (const t of localizedList(r, '提醒', 'tips', lang)) {
      if (!items.some(i => i['事'] === t)) items.push({ '时': lang === 'en' ? 'anytime' : '平时', '事': t, '因': r['编号'] });
    }
    for (const i of items) if (!seen.has(i['事'])) { seen.add(i['事']); out.push(i); }
    return out.slice(0, 7);
  }

  function sections(lib, feats, hits, lang) {
    const by = {};
    for (const r of hits) (by[r['特征']] = by[r['特征']] || []).push(r);
    const out = [];
    for (const fid of ORDER) {
      const f = feats[fid];
      if (!f) continue;
      const rs = by[fid] || [];
      const item = {
        'id': fid, '类别': f['类别'], '状态': f['状态'], '所见': lang === 'en' ? (f['描述en'] || f['描述']) : f['描述'],
        '特征': rs.map(r => localized(r, 'feat', lang)), '短断': rs.map(r => localized(r, 'short', lang)),
        '解读': rs.map(r => localized(r, 'read', lang)), '规则': rs.map(r => r['编号']),
        '来源': Array.from(new Set(rs.flatMap(r => r['来源']))).sort(),
        '路径': f['路径'] || null, '点': f['点'] || null, '区域': f['区域'] || null, '局部': f['局部'] || null
      };
      if (!rs.length) {
        const key = (f['状态'] === '未见' || f['状态'] === '不清') ? f['状态'] : '无断';
        const fallback = lang === 'en' ? getEN().unseen[key] : (lib['未见句'][key] || '这一处暂不下断。');
        item['解读'] = [fallback];
      }
      out.push(item);
    }
    return out;
  }

  function legibility(feats) {
    const n = {}; STATES.forEach(k => n[k] = 0);
    const vals = Object.values(feats);
    for (const f of vals) n[f['状态']]++;
    const total = vals.length || 1;
    const clear = n['清楚'] + n['部分'];
    return Object.assign({}, n, { '总': vals.length, '看清': clear, '率': pyRound(clear / total, 2), '档': clear / total < 0.3 ? '补拍为先' : clear / total < 0.7 ? '部分解读' : '正常' });
  }

  function anchor(day, monthRows, lang) {
    const en = getEN();
    let text = lang === 'en'
      ? 'As of ' + EN_MONTHS[day.m - 1] + ' ' + day.d + ', ' + day.y
      : '以' + day.y + '年' + day.m + '月' + day.d + '日为准';
    if (monthRows.length) {
      const first = monthRows[0];
      const [term, md] = first['节气'].split(' ');
      const [mm, dd] = md.split('/').map(Number);
      const before = first['月'] === day.ym && (day.m < mm || (day.m === mm && day.d < dd));
      if (lang === 'en') {
        const branch = en.branches[first['支']].split(' ')[0];
        text += before
          ? '; the ' + branch + ' month begins at ' + (en.terms[term] || term) + ' (' + mm + '/' + dd + ')'
          : '; currently in the ' + branch + ' month';
      } else {
        text += before ? '；' + term + '（' + mm + '月' + dd + '日）起入' + first['支'] + '月' : '；当前' + first['支'] + '月';
      }
    }
    return text;
  }

  function summary(wx, strengths, good, bad, tense, lucky, baseYear, lang) {
    const joiner = lang === 'en' ? ', ' : '、';
    const mn = m => cnMonth(m['月'], baseYear, lang);
    let first;
    if (lang === 'en') {
      first = wx['签'] + ': a base of ' + wx['性情'];
      if (strengths.length) first += ' \u2014 ' + strengths.slice(0, 3).map(s => s.split(':')[0]).join(', ') + ' are your capital';
    } else {
      first = wx['签'] + '：' + wx['性情'] + '的底子';
      if (strengths.length) first += '，' + strengths.slice(0, 3).map(s => s.split('：')[0]).join('、') + '是你的本钱';
    }
    const plan = [];
    if (good.length) plan.push(good.map(mn).join(joiner) + (lang === 'en' ? ' to bring money in' : '把钱收进来'));
    if (bad.length) plan.push(bad.map(mn).join(joiner) + (lang === 'en' ? ' to keep money safe' : '把钱守住'));
    if (tense.length) plan.push(tense.map(mn).join(joiner) + (lang === 'en' ? ' to look after the body' : '把身体顾好'));
    let text = first + (lang === 'en' ? '.' : '。');
    if (plan.length) text += (lang === 'en' ? ' The next half-year: ' : '接下来半年：') + plan.join(lang === 'en' ? '; ' : '，') + (lang === 'en' ? '.' : '。');
    if (lucky) {
      text += lang === 'en'
        ? ' Past this stretch, ' + cnMonth(lucky['月'], baseYear, 'en') + ' brings the ' + lucky['标签'].toLowerCase() + '.'
        : '熬过这一段，' + cnMonth(lucky['月'], baseYear, 'zh') + lucky['标签'] + '到。';
    }
    return text;
  }

  function parseDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { y, m, d, iso: dateStr, ym: dateStr.slice(0, 7), md: dateStr.slice(5) };
  }

  function build(obs, opts) {
    opts = opts || {};
    const lang = opts.lang === 'en' ? 'en' : 'zh';
    const lib = opts.lib || getLib();
    const en = getEN();
    const feats = validate(obs);
    const day = parseDate(opts.date || new Date().toISOString().slice(0, 10));
    const cover = lib['覆盖'];
    if (!(cover['起'] <= day.iso && day.iso <= cover['止'])) {
      throw new Error('日期 ' + day.iso + ' 超出断语库流年月令表的范围（' + cover['起'] + ' 至 ' + cover['止'] + '）');
    }
    const baseYear = String(day.y);
    const question = opts.question || '';
    const topic = route(question);
    const [hits, misses] = match(lib, feats);
    const wx = fiveElements(lib, feats, lang);
    const year = lib['流年'][baseYear];
    const relYear = relation(wx['主'], year['主五行'] || year['五行'], lib);
    const monthRows = months(lib, wx['主'], hits, day.ym, lang);
    const focus = focusPoints(hits, monthRows, topic, lang);
    const idx = indexes(hits, relYear, lib['地支神煞']['桃花'].includes(year['干支'][1]), lang);
    const nxtYear = lib['流年'][String(day.y + 1)];
    const years = [yearCard(lib, wx['主'], baseYear, year, lang)];
    if (nxtYear) years.push(yearCard(lib, wx['主'], String(day.y + 1), nxtYear, lang));
    const strengths = hits.slice()
      .sort((a, b) => Object.values(b['指数'] || {}).reduce((s, v) => s + Math.max(v, 0), 0) - Object.values(a['指数'] || {}).reduce((s, v) => s + Math.max(v, 0), 0))
      .flatMap(r => localizedList(r, '优势', 'strengths', lang));
    const potential = hits.flatMap(r => localizedList(r, '潜力', 'potential', lang));
    const good = monthRows.filter(m => m['级'] === '吉');
    const bad = monthRows.filter(m => m['标签'] === (lang === 'en' ? 'Leak month' : '破财月'));
    const tense = monthRows.filter(m => m['标签'] === (lang === 'en' ? 'Pressure month' : '压力月'));
    const peach = monthRows.filter(m => m['神煞'] === '桃花');
    const lead = hits.slice().sort((a, b) =>
      Math.abs(Object.values(b['指数'] || {}).reduce((s, v) => s + v, 0)) * b['权'] - Math.abs(Object.values(a['指数'] || {}).reduce((s, v) => s + v, 0)) * a['权']).slice(0, 3);
    const seen = legibility(feats);
    const joiner = lang === 'en' ? ', ' : '、';
    const mn = m => cnMonth(m['月'], baseYear, lang);
    let one;
    if (lang === 'en') {
      one = 'A hand led by ' + en.elements[wx['主']] + ' with ' + en.elements[wx['副']] + ' in support: ' + wx['性情'] + '. ' + lead.map(r => localized(r, 'short', lang)).join('; ') + '.';
      if (seen['率'] < 0.3) one = 'Less than a third of this photo is legible \u2014 a retake is best; what follows is a rough pass. ' + one;
    } else {
      one = wx['主'] + '为主、' + wx['副'] + '为辅的手：' + wx['性情'] + '。' + lead.map(r => r['短断']).join('；') + '。';
      if (seen['率'] < 0.3) one = '这张照片能看清的地方不到三成，最好按提示补拍一张；下面只是粗看。' + one;
    }
    /* quick points */
    const goodWealth = good.filter(m => m['十神'] === '财');
    let wealthText, bodyText, loveText;
    const healthFocus = focus.find(a => a['主题'] === '健康');
    const loveHit = hits.find(r => r['主题'] === '感情');
    if (lang === 'en') {
      wealthText = (goodWealth.length ? 'Income looks to ' + goodWealth.map(mn).join(joiner) : 'No pronounced income month this half-year \u2014 keep and guard')
        + (bad.length ? '; guard against leaks in ' + bad.map(mn).join(joiner) : '') + '.';
      bodyText = (focus.length && focus[0]['主题'] === '健康' ? focus[0]['标签'] : (healthFocus ? healthFocus['标签'] : 'Routine'))
        + ' is the first homework' + (tense.length ? ', most of all in ' + tense.map(mn).join(joiner) : '') + '.';
      loveText = (loveHit ? localized(loveHit, 'short', 'en') : 'Heart line not clearly seen')
        + (peach.length ? '; Peach Blossom falls in ' + peach.map(mn).join(joiner) : '') + '.';
    } else {
      wealthText = (goodWealth.length ? '进财看' + goodWealth.map(mn).join(joiner) : '这半年没有明显进财月，以守为主')
        + (bad.length ? '；破财防' + bad.map(mn).join(joiner) : '') + '。';
      bodyText = (focus.length && focus[0]['主题'] === '健康' ? focus[0]['标签'] : (healthFocus ? healthFocus['标签'] : '作息'))
        + '是头号功课' + (tense.length ? '，' + tense.map(mn).join(joiner) + '最要紧' : '') + '。';
      loveText = (loveHit ? loveHit['短断'] : '感情线未看清') + (peach.length ? '；桃花在' + peach.map(mn).join(joiner) : '') + '。';
    }
    const quick = {
      '签': wx['签'], '一句话': one, '可辨': seen, '锚点': anchor(day, monthRows, lang),
      '要点': [{ '题': '财运', '断': wealthText }, { '题': '身体', '断': bodyText }, { '题': '感情', '断': loveText }]
    };
    if (topic) {
      const map = { '财运': '财运', '健康': '身体', '感情': '感情' };
      quick['要点'].sort((a, b) => (a['题'] === map[topic] ? 0 : 1) - (b['题'] === map[topic] ? 0 : 1));
    }
    const lucky = monthRows.length ? nextLucky(lib, wx['主'], monthRows[monthRows.length - 1]['月'], lang) : null;
    const told = (obs['用户自述'] || {})['年龄'];
    const toldAge = (typeof told === 'number' && Number.isInteger(told) && told > 0 && told < 120) ? told : null;
    const [stageRows, scale] = stages(lib, feats, hits, toldAge, lang);
    const method = lang === 'en' ? {
      '指数': en.indexMethod, '五行手型': en.wxMethod, '流月': en.monthMethod, '人生阶段': en.ageScaleNote + ' ' + en.stageMethodTail
    } : {
      '指数': '每项从 60 起算；命中规则的加减 × 观察权重（清楚 1.0、部分 0.7）；再加流年十神修正；限定在 45—95。80 分及以上标「吉」，60—79 标「平」，60 以下标「慎」。',
      '五行手型': lib['五行手型']['说明'],
      '流月': '以手型主五行为「我」，按节气月令地支五行定生克十神（生我印、我克财、克我官杀、同我比劫、我生食伤），再叠加地支桃花、驿马、库；属本项目合参法。',
      '人生阶段': lib['年龄尺']['说明'] + '五十岁后按〈相三主〉离宫与坤宫饱满度高低定转运方向（缺＜平＜平满＜较满）。事业线、智慧线、感情线、腕纹任一缺失或看不清时，退回〈相三主〉巽、离、坤三段。'
    };
    return {
      'schema_version': '指南内容/1.0',
      '断语库版本': lib['版本'],
      '生成日期': day.iso,
      '问事': question,
      '主题': topic || '全览',
      '基本': {
        '手别': (obs['基本'] || {})['手别'] || {}, '拍摄': (obs['基本'] || {})['拍摄'] || '',
        '五行': wx, '掌色应时': colorNote(lib, feats, day, lang)
      },
      '快速总结': quick,
      '指数': idx,
      '特征解读': sections(lib, feats, hits, lang),
      '人生阶段': { '三主原句': lib['三主']['原句'], '段': stageRows, '年龄尺': scale, '自述年龄': toldAge },
      '流年': years,
      '流月': monthRows,
      '下一个转运点': lucky,
      '关键关注': focus,
      '建议提醒': advice(hits, focus, monthRows, baseYear, lang),
      '优势': strengths,
      '潜力': potential,
      '总结': summary(wx, strengths, good, bad, tense, lucky, baseYear, lang),
      '依据': {
        '命中': hits.map(r => ({ '编号': r['编号'], '特征': r['特征'], '条件': r['条件'], '权': r['权'], '来源': r['来源'] })),
        '未命中': misses,
        '来源': lib['来源'],
        '层级': lib['层级'],
        '冲突': obs['冲突'] || [],
        '方法': method
      }
    };
  }

  const api = { build, pyRound, relation, route, ageScale, validate, STATES, WEIGHT, INDEXES };
  root.PalmEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);