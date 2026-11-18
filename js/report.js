/* PalmSpeak report generator — builds a standalone, offline, bilingual single-file HTML report.
   Layout and styling are original to this project; judgment content comes from the Apache-2.0 library. */
(function (root) {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const EL_COLOR = { '金': '#a1a1a6', '木': '#30d158', '水': '#2997ff', '火': '#ff453a', '土': '#e3b341' };
  const TIER_COLOR = { '吉': '#30d158', '平': '#ffd60a', '慎': '#ff453a' };
  const IDX_COLOR = { '事业': '#2997ff', '财运': '#e3b341', '感情': '#ff375f', '桃花': '#ff453a', '健康': '#30d158', '综合': '#bf5af2' };

  const LABELS = {
    zh: {
      title: '掌中有话 · 个人手相指南', subtitle: '娱乐向手相报告 · 图一乐',
      generated: '生成于', question: '问事', hand: '手别', leftHand: '左手', rightHand: '右手', inferred: '推断', confirmed: '确认',
      quick: '快速总结', oneLine: '一句话', wealth: '财运', body: '身体', love: '感情',
      indices: '六项指数', reasons: '主要加减', wx: '五行手型', main: '主', second: '副', basedOn: '依据特征',
      seasonNote: '掌色应时', inSeason: '应时', offSeason: '逆时',
      years: '流年', months: '流月 · 未来六个月', yi: '宜', ji: '忌', extra: '补充', sha: '神煞',
      nextTurn: '下一个转运点', focus: '关键关注', focusMonths: '相关月份',
      stages: '人生阶段', ageRuler: '掌上年龄尺', youAreHere: '你在这里', yearsOld: '岁', start: '起势约', end: '线淡约',
      fallbackStage: '事业线、智慧线、感情线、腕纹未能全部辨清，人生阶段退回〈相三主〉三段。',
      features: '逐条掌纹与解读', seen: '所见', verdicts: '断语', sources: '出处', noVerdict: '暂不下断',
      strengths: '你的本钱', potential: '潜力方向', advice: '建议提醒', when: '时', what: '事', why: '因',
      summary: '总结', basis: '依据与方法', hits: '命中规则', misses: '未命中', ruleId: '编号', feature: '特征', cond: '条件', weight: '权',
      methods: '推算方法', conflicts: '判读冲突', sourceRegistry: '出处登记', level: '层级', link: '链接',
      disclaimer: '图一乐，身体不适请就医。本报告不构成医学诊断或投资建议。',
      privacy: '照片与报告只在你本机生成，未上传任何服务器。',
      credit: '断语库与算法框架：掌中有话 · blcaptain-shouxiang（Apache-2.0，爆裂队长NEXT）',
      stateNames: { '清楚': '清楚', '部分': '部分', '不清': '不清', '未见': '未见' },
      tierNames: { '吉': '吉', '平': '平', '慎': '慎' },
      idxNames: { '事业': '事业', '财运': '财运', '感情': '感情', '桃花': '桃花', '健康': '健康', '综合': '综合' },
      elNames: { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' },
      godNames: { '财': '财', '印': '印', '官杀': '官杀', '比劫': '比劫', '食伤': '食伤' },
      rankNames: { '头号': '头号', '第二': '第二', '第三': '第三', '次要': '次要' },
      kindNames: { '打底': '打底', '起势': '起势', '换道': '换道', '自补': '自补', '贯通': '贯通', '收成': '收成', '初主': '初主', '中主': '中主' },
      themeNames: { '健康': '健康', '财运': '财运', '感情': '感情', '事业': '事业', '综合': '综合' },
      topicNames: { '财运': '财运', '感情': '感情', '事业': '事业', '健康': '健康', '全览': '全览' },
      legibility: '照片可辨度', clearRate: '看清', retake: '建议补拍', partialRead: '部分解读', normal: '正常',
      monthSuffix: '月', anchorWrist: '腕纹 1 岁', anchorHead: '交智慧线 35 岁', anchorHeart: '交感情线 50 岁',
      photoAlt: '手掌原照（已内嵌）', cropAlt: '局部', print: '打印 / 存 PDF', toggle: 'English',
      notSeen: '未见', coverNote: ''
    },
    en: {
      title: 'PalmSpeak · Personal Palm Guide', subtitle: 'An entertainment palm reading · for fun',
      generated: 'Generated', question: 'Question', hand: 'Hand', leftHand: 'Left hand', rightHand: 'Right hand', inferred: 'inferred', confirmed: 'confirmed',
      quick: 'Quick summary', oneLine: 'In one line', wealth: 'Wealth', body: 'Body', love: 'Love',
      indices: 'Six indexes', reasons: 'Main adjustments', wx: 'Five-element hand', main: 'Primary', second: 'Supporting', basedOn: 'Based on',
      seasonNote: 'Palm color & season', inSeason: 'In season', offSeason: 'Off season',
      years: 'Annual flow', months: 'Monthly flow · next six months', yi: 'Good for', ji: 'Avoid', extra: 'Notes', sha: 'Star',
      nextTurn: 'Next turning point', focus: 'Key concerns', focusMonths: 'Related months',
      stages: 'Life stages', ageRuler: 'Age ruler on the palm', youAreHere: 'You are here', yearsOld: 'y/o', start: 'begins ~', end: 'fades ~',
      fallbackStage: 'Fate, head, heart or wrist lines were not all legible, so life stages fall back to the Three Lords segments.',
      features: 'Line-by-line reading', seen: 'Observed', verdicts: 'Verdicts', sources: 'Sources', noVerdict: 'No verdict yet',
      strengths: 'Your capital', potential: 'Potential directions', advice: 'Advice & reminders', when: 'When', what: 'What', why: 'Why',
      summary: 'Summary', basis: 'Basis & method', hits: 'Matched rules', misses: 'Not matched', ruleId: 'ID', feature: 'Feature', cond: 'Conditions', weight: 'Weight',
      methods: 'Methods', conflicts: 'Reading conflicts', sourceRegistry: 'Source registry', level: 'Level', link: 'Link',
      disclaimer: 'For fun only; see a doctor for any persistent discomfort. This report is not medical diagnosis or investment advice.',
      privacy: 'Your photo and report were generated on your device only; nothing was uploaded.',
      credit: 'Judgment library & framework: PalmSpeak / blcaptain-shouxiang (Apache-2.0, BLCaptain)',
      stateNames: { '清楚': 'Clear', '部分': 'Partial', '不清': 'Faint', '未见': 'Not seen' },
      tierNames: { '吉': 'Blessed', '平': 'Steady', '慎': 'Caution' },
      idxNames: { '事业': 'Career', '财运': 'Wealth', '感情': 'Love', '桃花': 'Romance', '健康': 'Health', '综合': 'Overall' },
      elNames: { '金': 'Metal', '木': 'Wood', '水': 'Water', '火': 'Fire', '土': 'Earth' },
      godNames: { '财': 'Wealth', '印': 'Patron', '官杀': 'Pressure', '比劫': 'Leak', '食伤': 'Expression' },
      rankNames: { '头号': 'Top', '第二': '2nd', '第三': '3rd', '次要': 'Minor' },
      kindNames: { '打底': 'Foundation', '起势': 'Rising', '换道': 'Switching', '自补': 'Self-built', '贯通': 'Unbroken', '收成': 'Harvest', '初主': 'First Lord', '中主': 'Middle Lord' },
      themeNames: { '健康': 'Health', '财运': 'Wealth', '感情': 'Love', '事业': 'Career', '综合': 'Overall' },
      topicNames: { '财运': 'Wealth', '感情': 'Love', '事业': 'Career', '健康': 'Health', '全览': 'Full reading' },
      legibility: 'Photo legibility', clearRate: 'legible', retake: 'Retake advised', partialRead: 'Partial reading', normal: 'Normal',
      monthSuffix: '', anchorWrist: 'Wrist = 1', anchorHead: 'Head crossing = 35', anchorHeart: 'Heart crossing = 50',
      photoAlt: 'Original palm photo (embedded)', cropAlt: 'Detail', print: 'Print / Save PDF', toggle: '中文',
      notSeen: 'Not seen', coverNote: ''
    }
  };

  function featureName(id, lang) {
    return lang === 'en' ? (root.PALM_LIB_EN.features[id] || id) : id;
  }
  function sourceName(key, lang) {
    if (lang === 'en') return root.PALM_LIB_EN.sources[key] || key;
    const s = root.PALM_LIB['来源'][key];
    return s ? s['出处'] : key;
  }
  function levelOf(key) {
    const s = root.PALM_LIB['来源'][key];
    return s ? s['层级'] : '民间';
  }
  function levelName(lv, lang) {
    return lang === 'en' ? { '古籍': 'Classics', '近代': 'Modern', '民间': 'Folk', '合参': 'Combined' }[lv] || lv : lv;
  }
  function termName(raw, lang) {
    if (lang !== 'en') return raw;
    const [t, md] = raw.split(' ');
    return (root.PALM_LIB_EN.terms[t] || t) + ' ' + md;
  }
  function monthName(ym, lang) {
    const [y, m] = ym.split('-');
    if (lang === 'en') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1] + ' ' + y;
    return y + '年' + (+m) + '月';
  }
  function ganzhi(gz, lang) {
    if (lang !== 'en') return gz;
    const en = root.PALM_LIB_EN;
    return (en.stems[gz[0]] || gz[0]) + '-' + (en.branches[gz[1]] || gz[1]).split(' ')[0] + ' (' + (en.elements[root.PALM_LIB['流年'] && gzEl(gz)] || '') + ' ' + (en.animals[gz[1]] || '') + ')';
  }
  function gzEl(gz) {
    const map = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
    return map[gz[0]] || '土';
  }
  function attrText(cond, lang) {
    const parts = [];
    for (const k of Object.keys(cond)) {
      if (k === '状态') continue;
      const vals = cond[k].map(v => lang === 'en' ? ((root.PALM_LIB_EN.attrs[k] || {}).values || {})[v] || v : v).join(' / ');
      const key = lang === 'en' ? ((root.PALM_LIB_EN.attrs[k] || {}).label || k) : k;
      parts.push(key + ': ' + vals);
    }
    return parts.join(' · ');
  }

  function radarSVG(wx, lang, size) {
    size = size || 190;
    const els = ['金', '木', '水', '火', '土'];
    const L = LABELS[lang];
    const cx = size / 2, cy = size / 2, R = size * 0.36;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    let grid = '';
    for (const f of [0.33, 0.66, 1]) {
      grid += '<polygon points="' + els.map((_, i) => pt(i, R * f).map(v => v.toFixed(1)).join(',')).join(' ') + '" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
    }
    let axes = '', labels = '';
    els.forEach((e, i) => {
      const [x, y] = pt(i, R);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
      const [lx, ly] = pt(i, R + 16);
      const pct = wx['占比'][e] || 0;
      labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="middle" font-size="12" fill="' + EL_COLOR[e] + '" font-weight="700">' + esc(L.elNames[e]) + ' ' + pct + '%</text>';
    });
    const poly = els.map((e, i) => pt(i, R * Math.max(0.06, (wx['占比'][e] || 0) / 100)).map(v => v.toFixed(1)).join(',')).join(' ');
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="five elements">' + grid + axes +
      '<polygon points="' + poly + '" fill="rgba(41,151,255,.2)" stroke="#2997ff" stroke-width="2"/>' + labels + '</svg>';
  }

  function renderLang(c, lang, assets) {
    const L = LABELS[lang];
    const en = root.PALM_LIB_EN;
    const q = c['快速总结'];
    const wx = c['基本']['五行'];
    const hand = c['基本']['手别'] || {};
    const handText = hand['值'] ? (hand['值'] === '左手' ? L.leftHand : L.rightHand) + (hand['状态'] === '推断' ? ' (' + L.inferred + ')' : '') : '';
    const leg = q['可辨'];
    const legTier = leg['档'] === '补拍为先' ? L.retake : leg['档'] === '部分解读' ? L.partialRead : L.normal;

    let h = '';
    /* header */
    const overallTier = ((c['指数'].find(i => i['项'] === '综合') || {})['档']) || '平';
    h += '<header class="rp-head"><div class="seal" aria-hidden="true"><span>' + (lang === 'en' ? 'PALM' : overallTier) + '</span></div><div class="rp-head-main">' +
      '<p class="rp-kicker">' + esc(L.subtitle) + '</p>' +
      '<h1>' + esc(q['签']) + '</h1>' +
      '<p class="rp-meta">' + esc(L.generated) + ' ' + esc(c['生成日期']) +
      (handText ? ' · ' + esc(L.hand) + ': ' + esc(handText) : '') +
      (c['问事'] ? ' · ' + esc(L.question) + ': ' + esc(c['问事']) : '') +
      ' · ' + esc(L.topicNames[c['主题']] || c['主题']) + '</p>' +
      '<p class="rp-anchor">' + esc(q['锚点']) + '</p>' +
      '<p class="rp-leg">' + esc(L.legibility) + ': ' + leg['看清'] + '/' + leg['总'] + ' ' + esc(L.clearRate) + ' (' + Math.round(leg['率'] * 100) + '%) · ' + esc(legTier) + '</p>' +
      '</div></header>';

    /* quick summary */
    h += '<section class="rp-sec"><h2>' + esc(L.quick) + '</h2><p class="rp-one">' + esc(q['一句话']) + '</p><div class="rp-quick">';
    const qicons = { '财运': '◈', '身体': '✚', '感情': '❥' };
    for (const p of q['要点']) {
      const title = lang === 'en' ? en.quickTitles[p['题']] : p['题'];
      h += '<div class="rp-qcard t-' + p['题'] + '"><span class="rp-qicon">' + qicons[p['题']] + '</span><h3>' + esc(title) + '</h3><p>' + esc(p['断']) + '</p></div>';
    }
    h += '</div></section>';

    /* indexes */
    h += '<section class="rp-sec"><h2>' + esc(L.indices) + '</h2><div class="rp-idx">';
    for (const ix of c['指数']) {
      const col = IDX_COLOR[ix['项']];
      const tier = L.tierNames[ix['档']];
      h += '<div class="rp-icard"><div class="rp-icard-top"><span class="rp-iname" style="color:' + col + '">' + esc(L.idxNames[ix['项']]) + '</span>' +
        '<span class="rp-tier" style="background:' + TIER_COLOR[ix['档']] + '">' + esc(tier) + '</span></div>' +
        '<div class="rp-score" style="color:' + col + '">' + ix['分'] + '</div>' +
        '<div class="rp-ibar"><i style="width:' + ix['分'] + '%;background:' + col + '"></i></div>' +
        '<ul class="rp-reasons">' + ix['理由'].map(r => '<li><b>' + (r['加减'] > 0 ? '+' : '') + r['加减'] + '</b> ' + esc(r['因']) + '</li>').join('') + '</ul></div>';
    }
    h += '</div></section>';

    /* five elements + season */
    h += '<section class="rp-sec rp-wx"><div class="rp-wx-radar">' + radarSVG(wx, lang) + '</div><div class="rp-wx-text">' +
      '<h2>' + esc(L.wx) + '</h2>' +
      '<p><b style="color:' + EL_COLOR[wx['主']] + '">' + esc(L.elNames[wx['主']]) + '</b> ' + esc(L.main) + ' · <b style="color:' + EL_COLOR[wx['副']] + '">' + esc(L.elNames[wx['副']]) + '</b> ' + esc(L.second) + '</p>' +
      '<p class="rp-nature">' + esc(wx['性情']) + '</p>' +
      (wx['依据特征'].length ? '<p class="rp-small">' + esc(L.basedOn) + ': ' + esc(wx['依据特征'].map(f => {
        const [fid, val] = f.split('·');
        if (lang !== 'en') return f;
        const attrs = en.attrs;
        let vEn = val;
        for (const k of Object.keys(attrs)) if (attrs[k].values[val]) { vEn = attrs[k].values[val]; break; }
        return featureName(fid, 'en') + ' · ' + vEn;
      }).join('; ')) + '</p>' : '');
    const cn = c['基本']['掌色应时'];
    if (cn) {
      h += '<div class="rp-season ' + (cn['判'] === '应时' ? 'good' : 'warn') + '"><b>' + esc(L.seasonNote) + ' · ' + esc(cn['判'] === '应时' ? L.inSeason : L.offSeason) + '</b><p>' + esc(cn['断']) + '</p><p class="rp-small rp-quote">〈' + (lang === 'en' ? 'Four-Season Lines' : '四季纹') + '〉 ' + esc(lang === 'en' ? en.season.quote[cn['判'] === '应时' ? 0 : 1] : cn['原句']) + '</p></div>';
    }
    h += '</div></section>';

    /* years */
    h += '<section class="rp-sec"><h2>' + esc(L.years) + '</h2><div class="rp-years">';
    for (const y of c['流年']) {
      h += '<div class="rp-ycard"><div class="rp-ynum">' + esc(y['年']) + '</div><div class="rp-ygz">' + esc(ganzhi(y['干支'], lang)) + '</div>' +
        '<div class="rp-ytag">' + esc(y['标签']) + '</div><p>' + esc(y['断']) + '</p></div>';
    }
    h += '</div>';
    if (c['下一个转运点']) {
      const nt = c['下一个转运点'];
      h += '<p class="rp-next">↗ ' + esc(L.nextTurn) + ': <b>' + esc(monthName(nt['月'], lang)) + '</b> · ' + esc(nt['标签']) + '</p>';
    }
    h += '</section>';

    /* months */
    h += '<section class="rp-sec"><h2>' + esc(L.months) + '</h2><div class="rp-months">';
    for (const m of c['流月']) {
      const col = EL_COLOR[m['五行']];
      const tierCol = TIER_COLOR[m['级']];
      h += '<div class="rp-mrow" style="--el:' + col + '">' +
        '<div class="rp-mhead"><span class="rp-mname">' + esc(monthName(m['月'], lang)) + '</span>' +
        '<span class="rp-mterm">' + esc(termName(m['节气'], lang)) + '</span>' +
        '<span class="rp-mel" style="background:' + col + '">' + esc(L.elNames[m['五行']]) + '</span>' +
        '<span class="rp-mgod" style="color:' + tierCol + ';border-color:' + tierCol + '">' + esc(m['标签']) + '</span>' +
        (m['神煞'] ? '<span class="rp-msha">' + esc(lang === 'en' ? en.shaNames[m['神煞']] : m['神煞']) + '</span>' : '') +
        '</div><p class="rp-mtext">' + esc(m['断']) + '</p>' +
        (m['补'].length ? '<ul class="rp-mextra">' + m['补'].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') +
        '<p class="rp-yiji"><span class="yi">' + esc(L.yi) + ': ' + esc(m['宜']) + '</span><span class="ji">' + esc(L.ji) + ': ' + esc(m['忌']) + '</span></p>' +
        '</div>';
    }
    h += '</div></section>';

    /* focus */
    if (c['关键关注'].length) {
      h += '<section class="rp-sec"><h2>' + esc(L.focus) + '</h2><div class="rp-focus">';
      for (const a of c['关键关注']) {
        h += '<div class="rp-fcard rank-' + esc(a['级']) + '"><div class="rp-fhead"><span class="rp-frank">' + esc(L.rankNames[a['级']]) + '</span>' +
          '<b>' + esc(a['标签']) + '</b><span class="rp-ftheme">' + esc(L.themeNames[a['主题']]) + '</span></div>' +
          a['说'].map(t => '<p>' + esc(t) + '</p>').join('') +
          (a['月'].length ? '<p class="rp-small">' + esc(L.focusMonths) + ': ' + esc(a['月'].map(m => monthName(m, lang)).join(', ')) + '</p>' : '') +
          '</div>';
      }
      h += '</div></section>';
    }

    /* stages */
    const st = c['人生阶段'];
    h += '<section class="rp-sec"><h2>' + esc(L.stages) + '</h2>';
    if (assets.ageOverlay) {
      h += '<figure class="rp-agefig"><img src="' + assets.ageOverlay + '" alt="' + esc(L.ageRuler) + '"/><figcaption>' + esc(L.ageRuler) + ' · ' + esc(L.start) + st['年龄尺']['起'] + ' ' + esc(L.yearsOld) + ' · ' + esc(L.end) + st['年龄尺']['止'] + ' ' + esc(L.yearsOld) + '</figcaption></figure>';
    } else {
      h += '<p class="rp-small rp-fallback">' + esc(L.fallbackStage) + '</p>';
    }
    h += '<div class="rp-stages">';
    for (const s of st['段']) {
      h += '<div class="rp-scard' + (s['当前'] ? ' current' : '') + '"><div class="rp-sage">' + esc(s['段']) + '<span class="rp-skind">' + esc(L.kindNames[s['类']] || s['类']) + '</span>' +
        (s['当前'] ? '<span class="rp-here">' + esc(L.youAreHere) + '</span>' : '') + '</div>' +
        '<h3>' + esc(s['题']) + '</h3>' +
        s['断'].map(t => '<p>' + esc(t) + '</p>').join('') +
        (s['宜'] ? '<p class="rp-sadvice">' + esc(s['宜']) + '</p>' : '') +
        '<p class="rp-small">' + esc(s['来源'].map(k => sourceName(k, lang)).join(' · ')) + '</p></div>';
    }
    h += '</div><p class="rp-small rp-quote">' + esc(lang === 'en' ? en.sanZhu.quote : st['三主原句']) + '</p></section>';

    /* features */
    h += '<section class="rp-sec"><h2>' + esc(L.features) + '</h2><div class="rp-feats">';
    for (const f of c['特征解读']) {
      const crop = assets.crops && assets.crops[f.id];
      const stateCol = f['状态'] === '清楚' ? '#30d158' : f['状态'] === '部分' ? '#ffd60a' : f['状态'] === '不清' ? '#ff9f0a' : '#86868b';
      h += '<div class="rp-frow">' +
        (crop ? '<img class="rp-crop" src="' + crop + '" alt="' + esc(L.cropAlt) + '"/>' : '<div class="rp-crop rp-crop-none">' + esc(L.notSeen) + '</div>') +
        '<div class="rp-fbody"><div class="rp-fhead2"><b>' + esc(featureName(f.id, lang)) + '</b>' +
        '<span class="rp-state" style="color:' + stateCol + ';border-color:' + stateCol + '">' + esc(L.stateNames[f['状态']]) + '</span>' +
        (f['规则'].length ? '<span class="rp-rids">' + f['规则'].map(esc).join(' ') + '</span>' : '') + '</div>' +
        '<p class="rp-seen">' + esc(L.seen) + ': ' + esc(f['所见']) + '</p>' +
        f['特征'].map((t, i) => '<p class="rp-fline"><b>' + esc(f['短断'][i]) + '</b> — ' + esc(t) + '</p>').join('') +
        f['解读'].map(t => '<p>' + esc(t) + '</p>').join('') +
        (f['来源'].length ? '<p class="rp-small">' + esc(L.sources) + ': ' + esc(f['来源'].map(k => sourceName(k, lang)).join(' · ')) + '</p>' : '') +
        '</div></div>';
    }
    h += '</div></section>';

    /* strengths & potential */
    if (c['优势'].length || c['潜力'].length) {
      h += '<section class="rp-sec rp-two"><div><h2>' + esc(L.strengths) + '</h2><ul class="rp-list good">' + c['优势'].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
        '<div><h2>' + esc(L.potential) + '</h2><ul class="rp-list pot">' + c['潜力'].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div></section>';
    }

    /* advice */
    if (c['建议提醒'].length) {
      h += '<section class="rp-sec"><h2>' + esc(L.advice) + '</h2><table class="rp-table"><thead><tr><th>' + esc(L.when) + '</th><th>' + esc(L.what) + '</th><th>' + esc(L.why) + '</th></tr></thead><tbody>' +
        c['建议提醒'].map(a => '<tr><td>' + esc(a['时']) + '</td><td>' + esc(a['事']) + '</td><td>' + esc(a['因']) + '</td></tr>').join('') +
        '</tbody></table></section>';
    }

    /* summary */
    h += '<section class="rp-sec rp-summary"><h2>' + esc(L.summary) + '</h2><blockquote>' + esc(c['总结']) + '</blockquote></section>';

    /* basis */
    const b = c['依据'];
    h += '<details class="rp-basis"><summary>' + esc(L.basis) + '</summary><div class="rp-basis-body">';
    h += '<h3>' + esc(L.hits) + ' (' + b['命中'].length + ')</h3><table class="rp-table small"><thead><tr><th>' + esc(L.ruleId) + '</th><th>' + esc(L.feature) + '</th><th>' + esc(L.cond) + '</th><th>' + esc(L.weight) + '</th><th>' + esc(L.sources) + '</th></tr></thead><tbody>' +
      b['命中'].map(r => '<tr><td>' + esc(r['编号']) + '</td><td>' + esc(featureName(r['特征'], lang)) + '</td><td>' + esc(attrText(r['条件'], lang)) + '</td><td>' + r['权'] + '</td><td>' + esc(r['来源'].map(k => sourceName(k, lang)).join('; ')) + '</td></tr>').join('') +
      '</tbody></table>';
    h += '<h3>' + esc(L.misses) + ' (' + b['未命中'].length + ')</h3><ul class="rp-misses">' +
      b['未命中'].map(m => '<li><b>' + esc(m['编号']) + '</b> ' + esc(m['原因']) + '</li>').join('') + '</ul>';
    h += '<h3>' + esc(L.methods) + '</h3>' + Object.keys(b['方法']).map(k => {
      const kn = lang === 'en' ? { '指数': 'Indexes', '五行手型': 'Five-element hand', '流月': 'Monthly flow', '人生阶段': 'Life stages' }[k] || k : k;
      return '<p><b>' + esc(kn) + '</b>: ' + esc(b['方法'][k]) + '</p>';
    }).join('');
    if (b['冲突'].length) {
      h += '<h3>' + esc(L.conflicts) + '</h3><ul>' + b['冲突'].map(x => '<li>' + esc(JSON.stringify(x)) + '</li>').join('') + '</ul>';
    }
    h += '<h3>' + esc(L.sourceRegistry) + '</h3><ul class="rp-sources">' + Object.keys(b['来源']).map(k => {
      const s = b['来源'][k];
      const lv = levelName(s['层级'], lang);
      const url = s['链接'];
      return '<li><span class="rp-lv lv-' + esc(s['层级']) + '">' + esc(lv) + '</span> <b>' + esc(sourceName(k, lang)) + '</b>' +
        (url ? ' <a href="' + esc(url) + '" rel="noopener" target="_blank">' + esc(L.link) + '</a>' : '') +
        (lang === 'zh' && s['核验'] ? '<span class="rp-small"> — ' + esc(s['核验']) + '</span>' : '') + '</li>';
    }).join('') + '</ul>';
    h += '<p class="rp-small">' + esc(lang === 'en' ? 'Levels: ' + Object.keys(b['层级']).map(k => levelName(k, 'en') + ' — ' + en.levels[k]).join(' ') : Object.keys(b['层级']).map(k => k + '：' + b['层级'][k]).join(' ')) + '</p>';
    h += '</div></details>';

    return h;
  }

  function buildReport(payload) {
    const { zh, en, photo, ageOverlay, crops, defaultLang } = payload;
    const L = LABELS[defaultLang === 'en' ? 'en' : 'zh'];
    const bodyZh = renderLang(zh, 'zh', { ageOverlay, crops });
    const bodyEn = renderLang(en, 'en', { ageOverlay, crops });
    const css = REPORT_CSS;
    return '<!DOCTYPE html>\n<html lang="' + (defaultLang === 'en' ? 'en' : 'zh-CN') + '">\n<head>\n<meta charset="utf-8"/>\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"/>\n' +
      '<meta name="robots" content="noindex"/>\n' +
      '<title>' + esc(LABELS.zh.title) + ' · ' + esc(zh['生成日期']) + '</title>\n' +
      '<style>' + css + '</style>\n</head>\n<body>\n' +
      '<div class="rp-bar"><div class="rp-bar-in">' +
      '<span class="rp-brand">' + (defaultLang === 'en' ? 'PalmSpeak' : '掌中有话') + '</span>' +
      '<span class="rp-bar-actions"><button id="rpLang" type="button">' + (defaultLang === 'en' ? '中文' : 'English') + '</button>' +
      '<button id="rpPrint" type="button" onclick="window.print()">' + esc(L.print) + '</button></span>' +
      '</div></div>\n' +
      '<main class="rp-page">\n' +
      '<figure class="rp-photo"><img src="' + photo + '" alt="' + esc(L.photoAlt) + '"/></figure>\n' +
      '<div id="rp-zh"' + (defaultLang === 'en' ? ' hidden' : '') + '>\n' + bodyZh + '\n</div>\n' +
      '<div id="rp-en"' + (defaultLang === 'en' ? '' : ' hidden') + '>\n' + bodyEn + '\n</div>\n' +
      '<footer class="rp-foot"><p>' + esc(LABELS.zh.disclaimer) + '</p><p lang="en">' + esc(LABELS.en.disclaimer) + '</p>' +
      '<p class="rp-small">' + esc(LABELS.zh.privacy) + ' ' + esc(LABELS.en.privacy) + '</p>' +
      '<p class="rp-small">' + esc(LABELS.zh.credit) + '</p></footer>\n' +
      '</main>\n' +
      '<script>(function(){var zh=document.getElementById("rp-zh"),en=document.getElementById("rp-en"),btn=document.getElementById("rpLang");' +
      'btn.addEventListener("click",function(){var showEn=zh.hidden===false;zh.hidden=showEn;en.hidden=!showEn;' +
      'document.documentElement.lang=showEn?"en":"zh-CN";btn.textContent=showEn?"中文":"English";' +
      'document.querySelector(".rp-brand").textContent=showEn?"PalmSpeak":"掌中有话";});})();<\/script>\n' +
      '</body>\n</html>';
  }

  const REPORT_CSS = `
:root{--paper:#000;--paper2:#1d1d1f;--ink:#f5f5f7;--ink2:#86868b;--line:rgba(255,255,255,.12);--cin:#2997ff;--gold:#e3b341;--jade:#30d158;--blue:#2997ff;--font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;color-scheme:dark}
body{background:var(--paper);color:var(--ink);font:16px/1.7 var(--font);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:10px}::-webkit-scrollbar-track{background:var(--paper2)}
::-webkit-scrollbar-thumb{background:#48484a;border-radius:5px;border:2px solid var(--paper2)}
::-webkit-scrollbar-thumb:hover{background:#636366}
.rp-bar{position:sticky;top:0;z-index:20;background:rgba(0,0,0,.72);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--line)}
.rp-bar-in{max-width:880px;margin:0 auto;padding:10px 20px;display:flex;justify-content:space-between;align-items:center}
.rp-brand{font-weight:600;letter-spacing:.01em;color:var(--ink)}
.rp-bar-actions button{font:inherit;font-size:13px;padding:6px 16px;margin-left:8px;border:1px solid rgba(255,255,255,.25);background:transparent;color:var(--ink);border-radius:999px;cursor:pointer;transition:.2s}
.rp-bar-actions button:hover{background:rgba(255,255,255,.1)}
.rp-page{max-width:880px;margin:0 auto;padding:28px 22px 60px}
.rp-photo{margin:6px auto 26px;max-width:420px;border:1px solid var(--line);background:var(--paper2);padding:10px;border-radius:16px}
.rp-photo img{display:block;width:100%;height:auto;border-radius:8px}
.rp-head{display:flex;gap:20px;align-items:flex-start;padding:8px 0 20px;border-bottom:1px solid var(--line)}
.seal{flex:0 0 auto;width:74px;height:74px;background:var(--paper2);border:1px solid var(--line);color:var(--ink);display:flex;align-items:center;justify-content:center;border-radius:18px}
.seal span{font-size:30px;font-weight:700;letter-spacing:.02em}
.rp-kicker{font-size:12px;letter-spacing:.18em;color:var(--ink2);text-transform:uppercase}
.rp-head h1{font-size:clamp(24px,4.6vw,38px);line-height:1.25;margin:4px 0 8px;font-weight:700;letter-spacing:-.01em}
.rp-meta,.rp-anchor,.rp-leg{font-size:13px;color:var(--ink2)}
.rp-leg{color:var(--gold)}
.rp-sec{margin:34px 0}
.rp-sec>h2,.rp-two h2{font-size:20px;font-weight:700;margin-bottom:14px;padding-left:12px;border-left:3px solid var(--cin)}
.rp-one{font-size:17px;background:var(--paper2);border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:14px}
.rp-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.rp-qcard{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--paper2);position:relative}
.rp-qcard h3{font-size:15px;margin:6px 0 6px;color:var(--ink);font-weight:600}
.rp-qcard p{font-size:13.5px;color:var(--ink2)}
.rp-qicon{font-size:18px;color:var(--gold)}
.rp-idx{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.rp-icard{border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--paper2)}
.rp-icard-top{display:flex;justify-content:space-between;align-items:center}
.rp-iname{font-weight:600;font-size:15px}
.rp-tier{color:#000;font-weight:700;font-size:11px;padding:2px 9px;border-radius:999px}
.rp-score{font-size:34px;font-weight:700;line-height:1.2}
.rp-ibar{height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;margin:6px 0 8px}
.rp-ibar i{display:block;height:100%;border-radius:3px}
.rp-reasons{list-style:none;font-size:12px;color:var(--ink2)}
.rp-reasons b{color:var(--ink)}
.rp-wx{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
.rp-wx-radar{flex:0 0 auto}
.rp-wx-text{flex:1 1 300px}
.rp-nature{font-size:15px;margin:6px 0}
.rp-small{font-size:12px;color:var(--ink2)}
.rp-quote{font-style:italic;margin-top:8px}
.rp-season{margin-top:12px;border-radius:14px;padding:12px 14px;font-size:14px;border:1px solid}
.rp-season.good{background:rgba(48,209,88,.08);border-color:rgba(48,209,88,.5)}
.rp-season.warn{background:rgba(255,69,58,.08);border-color:rgba(255,69,58,.5)}
.rp-years{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rp-ycard{border:1px solid var(--line);border-radius:14px;padding:16px;background:var(--paper2)}
.rp-ynum{font-size:26px;font-weight:700;color:var(--ink)}
.rp-ygz{font-size:13px;color:var(--gold);margin-bottom:6px}
.rp-ytag{display:inline-block;font-size:12px;border:1px solid var(--gold);color:var(--gold);border-radius:999px;padding:2px 10px;margin-bottom:8px}
.rp-ycard p{font-size:13.5px;color:var(--ink2)}
.rp-next{margin-top:12px;font-size:14px;color:var(--jade)}
.rp-months{display:flex;flex-direction:column;gap:12px}
.rp-mrow{border:1px solid var(--line);border-left:5px solid var(--el);border-radius:14px;padding:14px 16px;background:var(--paper2)}
.rp-mhead{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:6px}
.rp-mname{font-weight:700;font-size:16px}
.rp-mterm{font-size:12px;color:var(--ink2)}
.rp-mel{color:#000;font-weight:700;font-size:11px;border-radius:999px;padding:2px 9px}
.rp-mgod{font-size:12px;border:1px solid;border-radius:999px;padding:1px 10px;font-weight:700}
.rp-msha{font-size:12px;color:var(--gold)}
.rp-mtext{font-size:14px}
.rp-mextra{margin:6px 0 0 18px;font-size:13px;color:var(--ink2)}
.rp-yiji{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;margin-top:8px}
.rp-yiji .yi{color:var(--jade)}.rp-yiji .ji{color:#ff453a}
.rp-focus{display:flex;flex-direction:column;gap:12px}
.rp-fcard{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--paper2)}
.rp-fcard.rank-头号{border-color:var(--cin);box-shadow:0 4px 14px rgba(41,151,255,.12)}
.rp-fhead{display:flex;gap:10px;align-items:center;margin-bottom:6px}
.rp-frank{font-size:11px;background:var(--cin);color:#000;font-weight:700;border-radius:999px;padding:2px 10px}
.rp-fcard.rank-第二 .rp-frank,.rp-fcard.rank-第三 .rp-frank,.rp-fcard.rank-次要 .rp-frank{background:var(--gold)}
.rp-ftheme{font-size:12px;color:var(--ink2);margin-left:auto}
.rp-fcard p{font-size:13.5px;color:var(--ink2)}
.rp-agefig{margin:0 0 16px;border:1px solid var(--line);background:var(--paper2);padding:10px;max-width:440px;border-radius:14px}
.rp-agefig img{width:100%;display:block;border-radius:8px}
.rp-agefig figcaption{font-size:12px;color:var(--ink2);padding-top:8px;text-align:center}
.rp-fallback{margin-bottom:12px}
.rp-stages{display:flex;flex-direction:column;gap:12px}
.rp-scard{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--paper2);position:relative}
.rp-scard.current{border-color:var(--jade);box-shadow:0 4px 14px rgba(48,209,88,.12)}
.rp-sage{font-weight:700;color:var(--ink);font-size:15px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.rp-skind{font-size:11px;color:var(--gold);border:1px solid var(--gold);border-radius:999px;padding:1px 9px;font-weight:400}
.rp-here{font-size:11px;background:var(--jade);color:#000;font-weight:700;border-radius:999px;padding:2px 10px}
.rp-scard h3{font-size:16px;margin:6px 0;font-weight:600}
.rp-scard p{font-size:13.5px;color:var(--ink2)}
.rp-sadvice{color:var(--jade)!important;margin-top:6px}
.rp-feats{display:flex;flex-direction:column;gap:12px}
.rp-frow{display:flex;gap:14px;border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--paper2)}
.rp-crop{flex:0 0 96px;width:96px;height:96px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.rp-crop-none{display:flex;align-items:center;justify-content:center;font-size:12px;color:#86868b;background:rgba(255,255,255,.06)}
.rp-fbody{flex:1;min-width:0}
.rp-fhead2{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:4px}
.rp-fhead2 b{font-size:15px}
.rp-state{font-size:11px;border:1px solid;border-radius:999px;padding:1px 9px}
.rp-rids{font-size:11px;color:#6e6e73;margin-left:auto}
.rp-seen{font-size:12.5px;color:var(--ink2);margin-bottom:6px}
.rp-fline{font-size:13.5px;margin:4px 0}
.rp-fline b{color:var(--ink)}
.rp-fbody>p{font-size:13.5px;color:var(--ink2)}
.rp-two{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.rp-list{list-style:none}
.rp-list li{font-size:13.5px;padding:8px 12px;border-radius:10px;margin-bottom:8px;border:1px solid var(--line)}
.rp-list.good li{background:rgba(48,209,88,.08);border-color:rgba(48,209,88,.35)}
.rp-list.pot li{background:rgba(227,179,65,.08);border-color:rgba(227,179,65,.35)}
.rp-table{width:100%;border-collapse:collapse;font-size:13.5px;background:var(--paper2);border:1px solid var(--line)}
.rp-table th{background:rgba(255,255,255,.06);text-align:left;padding:8px 10px;font-size:12.5px}
.rp-table td{padding:8px 10px;border-top:1px solid var(--line);vertical-align:top}
.rp-table.small{font-size:12px}
.rp-summary blockquote{font-size:17px;line-height:1.9;border-left:3px solid var(--gold);padding:10px 18px;background:var(--paper2);border-radius:0 14px 14px 0}
.rp-basis{margin:36px 0;border:1px solid var(--line);border-radius:14px;background:var(--paper2)}
.rp-basis summary{cursor:pointer;padding:14px 18px;font-weight:600;color:var(--ink2)}
.rp-basis summary:hover{color:var(--cin)}
.rp-basis-body{padding:0 18px 18px}
.rp-basis-body h3{font-size:15px;margin:16px 0 8px;color:var(--ink)}
.rp-basis-body p{font-size:13px;color:var(--ink2);margin-bottom:8px}
.rp-misses{list-style:none;font-size:12px;color:var(--ink2);columns:2;column-gap:24px}
.rp-misses li{margin-bottom:4px;break-inside:avoid}
.rp-sources{list-style:none;font-size:12.5px;color:var(--ink2)}
.rp-sources li{margin-bottom:6px}
.rp-sources a{color:var(--blue)}
.rp-lv{font-size:10.5px;border-radius:4px;padding:1px 6px;color:#000;font-weight:700;margin-right:4px}
.lv-古籍{background:#2997ff}.lv-近代{background:#64d2ff}.lv-民间{background:#e3b341}.lv-合参{background:#30d158}
.rp-foot{margin-top:44px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--ink2)}
.rp-foot p{margin-bottom:6px}
@media (max-width:680px){
.rp-quick,.rp-idx{grid-template-columns:1fr 1fr}
.rp-years,.rp-two{grid-template-columns:1fr}
.rp-misses{columns:1}
.rp-head{flex-direction:column}
.rp-frow{flex-direction:column}
.rp-crop{width:100%;height:140px;flex:none}
}
@media (max-width:460px){.rp-quick,.rp-idx{grid-template-columns:1fr}}
@media print{
:root{--paper:#fff;--paper2:#f5f5f7;--ink:#1d1d1f;--ink2:#6e6e73;--line:#d2d2d7;--cin:#0066cc;--gold:#9a6700;--jade:#1e7d43;--blue:#0066cc}
.rp-bar{display:none}
body{background:#fff;color:#1d1d1f}
.rp-photo{background:#fff}
.rp-ibar{background:#e8e8ed}
.rp-crop-none{background:#f5f5f7}
.rp-table th{background:#f5f5f7}
.rp-sec{break-inside:avoid-page}
.rp-basis{break-inside:auto}
}
`;

  root.PalmReport = { buildReport, renderLang, LABELS };
})(typeof window !== 'undefined' ? window : globalThis);