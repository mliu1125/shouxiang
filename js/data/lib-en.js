/* English display layer for the PalmSpeak judgment library.
   Rule conditions, weights and calendars are shared from lib.js (Apache-2.0, BLCaptain).
   English wording is an adaptation for entertainment use, not a scholarly translation. */
window.PALM_LIB_EN = {
  features: {
    '感情线': 'Heart Line', '智慧线': 'Head Line', '生命线': 'Life Line', '事业线': 'Fate Line',
    '健康线': 'Health Line', '太阳线': 'Sun Line', '婚姻线': 'Marriage Lines',
    '掌形': 'Palm Shape', '掌心': 'Palm Center', '掌色': 'Palm Color',
    '金星丘': 'Mount of Venus', '月丘': 'Mount of Moon', '坎宫': 'Kan Palace (root)',
    '巽宫': 'Xun Palace (index base)', '离宫': 'Li Palace (middle base)', '坤宫': 'Kun Palace (pinky base)',
    '拇指': 'Thumb', '小指': 'Little Finger', '四指': 'Four Fingers', '中指指腹': 'Middle Fingertip', '腕纹': 'Wrist Lines'
  },
  featureGroups: {
    lines: 'Major lines', form: 'Shape & color', mounts: 'Mounts & palaces', fingers: 'Fingers & wrist'
  },
  states: { '清楚': 'Clear', '部分': 'Partial', '不清': 'Faint', '未见': 'Not seen' },
  stateHint: {
    '清楚': 'Fully visible', '部分': 'Mostly visible', '不清': 'Only a shadow — no verdict', '未见': 'Absent or out of frame'
  },
  attrs: {
    '长度': { label: 'Length', values: { '长': 'Long', '中': 'Medium' } },
    '终点': { label: 'Ends at', values: { '食中指缝': 'Index–middle gap' } },
    '走向': { label: 'Course', values: { '掌缘低、向食中指间上扬': 'Low at edge, rising to finger gap', '平缓下斜': 'Gentle downward slope' } },
    '交会': { label: 'Crossings', values: { '中段有细纹交会': 'Fine lines cross mid-section', '分支多': 'Many branches', '与感情线相接': 'Meets the heart line' } },
    '起点': { label: 'Origin', values: { '与生命线同源': 'Shared origin with life line', '掌心': 'Palm center' } },
    '末段': { label: 'Tail', values: { '交会变浅': 'Fades at crossings' } },
    '弧度': { label: 'Arc', values: { '宽': 'Wide' } },
    '中段': { label: 'Mid-section', values: { '杂纹交叉': 'Cross-hatched' } },
    '末端': { label: 'Ends at', values: { '掌根中部': 'Center of palm root' } },
    '连续': { label: 'Continuity', values: { '断续': 'Segmented' } },
    '上段': { label: 'Upper part', values: { '未贯指': 'Stops below finger', '贯指': 'Pierces to finger root' } },
    '长宽': { label: 'Outline', values: { '长方': 'Rectangular', '方': 'Square' } },
    '厚薄': { label: 'Thickness', values: { '厚': 'Thick', '薄': 'Thin' } },
    '纹理': { label: 'Texture', values: { '细纹密': 'Dense fine lines' } },
    '指掌比': { label: 'Finger–palm ratio', values: { '指短于掌': 'Fingers shorter than palm', '指长于掌': 'Fingers longer than palm' } },
    '形态': { label: 'Form', values: { '四周丰中间浅': 'Full edges, shallow center' } },
    '整体': { label: 'Overall tone', values: { '红润偏赤': 'Ruddy, leaning red', '偏白': 'Pale', '偏黄': 'Yellowish' } },
    '分布': { label: 'Distribution', values: { '边缘红掌心浅': 'Red edges, pale center' } },
    '饱满': { label: 'Fullness', values: { '饱满': 'Full', '较满': 'Quite full', '平满': 'Evenly full', '平': 'Flat', '缺': 'Deficient' } },
    '色': { label: 'Color', values: { '泛红': 'Flushed red' } },
    '粗细': { label: 'Build', values: { '粗长': 'Thick and long' } },
    '外张': { label: 'Spread', values: { '大': 'Wide', '明显': 'Pronounced' } },
    '指节': { label: 'Joints', values: { '平顺': 'Smooth', '凸起': 'Knotted' } },
    '指端': { label: 'Tips', values: { '圆钝': 'Rounded', '尖': 'Pointed' } },
    '纹样': { label: 'Pattern', values: { '斗形候选': 'Whorl candidate' } },
    '道数': { label: 'Count', values: { '两道清楚': 'Two clear creases' } }
  },
  indexes: { '事业': 'Career', '财运': 'Wealth', '感情': 'Love', '桃花': 'Romance', '健康': 'Health', '综合': 'Overall' },
  tiers: { '吉': 'Blessed', '平': 'Steady', '慎': 'Caution' },
  elements: { '金': 'Metal', '木': 'Wood', '水': 'Water', '火': 'Fire', '土': 'Earth' },
  nature: {
    '金': 'principled and square-dealing — a word is a bond',
    '木': 'resilient and ever-learning, growing taller with time',
    '水': 'flexible and fine-grained, adapting on the fly',
    '火': 'hot, quick, fast to act, full of drive',
    '土': 'steady, thick-skinned, load-bearing, dependable'
  },
  organs: { '木': 'liver & gallbladder', '火': 'heart, blood pressure & sleep', '土': 'spleen & stomach', '金': 'lungs, throat & skin', '水': 'kidneys, lower back & legs' },
  signs: {
    '土火': 'Fire feeds Earth · a thick palm pools wealth',
    '火土': 'Blazing fire, deep earth · the busier, the brighter',
    '土水': 'Earth hides water · steady with a live current',
    '土金': 'Deep earth births metal · the slow-rich pattern',
    '土木': 'Wood loosens deep earth · roots grow into a forest',
    '火木': 'Wood-fire brilliance · talent shows itself',
    '火金': 'Fire refines true metal · trials forge the vessel',
    '火水': 'Water and fire in balance · steel with silk',
    '金土': 'Metal fed by earth · success built steadily',
    '金水': 'White metal, clear water · clever and careful',
    '金木': 'Metal and wood shape each other · edged and defined',
    '金火': 'True metal meets fire · the more it is ground, the brighter',
    '木水': 'Water feeds fine wood · learning bears fruit',
    '木火': 'Wood-fire brilliance · talent shows itself',
    '木土': 'Wood planted in deep earth · deep roots, full leaves',
    '木金': 'Good wood meets the axe · pruning makes timber',
    '水金': 'Metal births bright water · nimble at gathering wealth',
    '水木': 'Water rises, wood thrives · a strong second wind',
    '水土': 'Water settles into earth · a long, fine stream',
    '水火': 'Water and fire in balance · steel with silk'
  },
  signFallback: (a, b) => a + ' and ' + b + ' in consultation',
  unseen: {
    '未见': 'Not visible in this photo, so no verdict yet; to read this part, frame it clearly in a retake.',
    '不清': 'Too faint to read here — only a weak note; a clearer retake would sharpen it.',
    '无断': 'Clearly visible, but this form is not in the library\u2019s rulebook — no forced verdict.'
  },
  rules: {
    '感01': { feat: 'The heart line is long, running all the way into the gap between index and middle fingers.', short: 'Loyal once committed', read: 'You are the \u201ccommit once, love long\u201d type. You don\u2019t fall easily, but once a relationship is set you put the person into your long-term plans \u2014 building a life together matters more than sweet talk. You pick partners by character and reliability; flattery does nothing on you.', strengths: ['Dependable loyalty: you keep your promises, and partners and friends trust you'] },
    '感02': { feat: 'A few fine lines cross the middle section.', short: 'Cares deeply, says little', read: 'You say little but weigh every reaction from your partner \u2014 one sentence can keep you thinking for half a day. Most knots in your love life come from what was never said out loud.', tips: ['If something feels off, talk it through the same day; don\u2019t let it pile into a cold war'], focusLabel: 'Emotional drain' },
    '感03': { feat: 'Low at the palm edge, rising toward the index\u2013middle gap.', short: 'Cool first, warmer later', read: 'Your affection runs \u201ccool first, warm later\u201d: reserved with new people, open once familiar, and the warmth keeps building \u2014 a strong late game.' },
    '感04': { feat: 'Several small branches fork off the heart line.', short: 'Fine feelings, many branches', read: 'You are sensitive and easily moved, with plenty of people coming and going. The upside: no shortage of connections. The downside: spoiled for choice and slow to settle.', tips: ['When attention comes from many sides, check character first; don\u2019t ride the first wave of warmth'], focusLabel: 'Emotional drain' },
    '智01': { feat: 'Head line and life line start from the same point at the thumb web.', short: 'Plan first, never follow the crowd', read: 'You look before you leap and never fight unprepared. In your younger years steadiness beats impulse; you are hard to fool and rarely jump on bandwagons.', strengths: ['Steady: no herd-chasing, no hot-headed moves, clear on the big calls'] },
    '智02': { feat: 'Medium length, sloping gently toward the palm center.', short: 'Practical with imagination, built to go deep', read: 'Your mind balances practicality with imagination \u2014 ideas that can actually land. You do best going deep into one craft or field; it compounds in value with age.', strengths: ['Specialist: the deeper you go in one field, the more sought-after you become'], potential: ['Turn one expertise into your signature; after forty, reputation does the selling'] },
    '智03': { feat: 'The tail fades where it meets crossing lines.', short: 'Overthinks, sleeps poorly', read: 'When things pile up you burn energy inward; at night the mind won\u2019t switch off. Sleep is your soft spot.', tips: ['Put the phone down an hour before bed; if the mind won\u2019t stop, write the worries on paper first'], focusLabel: 'Sleep' },
    '智04': { feat: 'A long head line reaching close to the palm edge.', short: 'Thinks far, dares big', read: 'You think long-range, dare to lay multi-year plans, and have the nerve to lead a team.', strengths: ['Vision: sees far and commits to the long game'] },
    '命01': { feat: 'A wide life-line arc wrapping generously around the thumb mound.', short: 'Strong reserves, carries weight', read: 'Deep energy reserves and fast recovery \u2014 a constitution that carries weight; one good sleep restores you. You love company, good food and home, and people gather around you.', strengths: ['Load-bearer: holds up under pressure and recovers fast'] },
    '命02': { feat: 'Several fine cross-lines through the mid-lower section.', short: 'Midlife worries, carrying for others', read: 'The middle years bring many worries, often carried for other people; the body gets overdrawn and you push through on grit.', focusLabel: 'Overdraft', stages: [{ seg: '36\u201445', text: 'Carrying both family and work \u2014 maintain your body proactively, don\u2019t wait for alarms' }] },
    '命03': { feat: 'The tail lands at the center of the palm root.', short: 'Returns to roots in later life', read: 'The second half centers on home and roots; later years are steady and well kept.', stages: [{ seg: '56\u2014', text: 'You keep both money and people close; a settled later life' }] },
    '业01': { feat: 'The fate line starts from the palm center, not the wrist.', short: 'A self-made rise mid-way', read: 'Your career rises mid-way: directions changed and many things were tried early on; it truly settles around thirty. You found the path yourself \u2014 no family pavement.' },
    '业02': { feat: 'The vertical line runs in segments, fading at crossings.', short: 'One lane change mid-way', read: 'You will change lane or platform once mid-way. It feels shaky during the switch and smoother after; this step can\u2019t be skipped and needn\u2019t be.', focusLabel: 'Lane change' },
    '业03': { feat: 'It does not run all the way to the middle-finger root.', short: 'The last stretch is yours to build', read: 'The Ren Xiang Bian says only a vertical line piercing the finger means \u201cplans proceed smoothly\u201d. Yours stops short: not a life of effortless pushes \u2014 the last stretch is yours to build, and results come from sustained input, not one lucky break.' },
    '业04': { feat: 'The vertical line runs through to the middle-finger root.', short: 'Plans proceed smoothly', read: 'The Ren Xiang Bian: a vertical line piercing the finger means plans proceed smoothly \u2014 what you set out to do moves, with fewer detours.', strengths: ['Finisher: what you commit to gets done end to end'] },
    '健01': { feat: 'A diagonal line rises from the palm root toward the little finger.', short: 'Stomach and routine sound the first alarm', read: 'Your body signals first through digestion and routine: skip meals or stay up late and the stomach and nerves complain at once. Modern books read this line as \u201cbetter absent than present\u201d.', tips: ['Fix meal times; keep dinner early and light; don\u2019t tough out bloating or reflux'], focusLabel: 'Digestion' },
    '健02': { feat: 'The diagonal rises to meet the area below the little finger.', short: 'Money follows people', read: 'Some schools call this reach a \u201cwealth line\u201d: money follows your network and speech \u2014 introductions, referrals and side projects bring income.', potential: ['Network into income: matchmaking, referrals and side work are your second paycheck'] },
    '形01': { feat: 'A rectangular, fleshy palm.', short: 'A thick chassis, growing big slowly', read: 'Shen Xiang Quan Bian, On Hands: \u201cA long and thick palm is noble.\u201d A thick chassis: solid work that withstands grinding \u2014 a build-big-slowly pattern, not a flash in the pan.', strengths: ['Solid chassis: withstands the grind and appreciates with time'] },
    '形02': { feat: 'Dense fine lines at the thumb root and lower palm.', short: 'Money gathers and stays', read: 'Shen Xiang Quan Bian, Three Lords: \u201cDense lines gather wealth.\u201d Your money accumulates bit by bit, not overnight; keeping it is your wealth luck. Folk lore adds: many fine lines mean a fine-grained, worry-prone mind.', focusLabel: 'Worrying', strengths: ['Keeper: saves well, spends with sense'] },
    '形03': { feat: 'The palm is longer than the fingers.', short: 'Acts on thought', read: 'A doer: thought turns straight into action, execution outrunning daydreams. The flaw is haste \u2014 others feel slow to you.', tips: ['Slow urgent calls by half a beat: sleep one night before deciding'] },
    '心01': { feat: 'Full, flushed edges with a paler hollow in the center.', short: 'A palm that pools wealth', read: 'On Hands: \u201cFull around with a sunken center means riches.\u201d The center sits like a small basin \u2014 folk call it a wealth-pooling palm: money stays, inflow beats outflow.' },
    '色01': { feat: 'The whole palm is ruddy, leaning red.', short: 'Vigorous blood, the color of honor', read: 'On Hands: \u201cA palm red as sprayed blood is honored; a moist, lustrous palm is wealthy.\u201d Vigorous circulation and strong reserves \u2014 the busier, the more alive. Old books count this ruddiness as a fine color.' },
    '色02': { feat: 'Thumb root, palm edges, root and fingertips are redder; the center is paler.', short: 'Fire runs high', read: 'The common palm-color reading: redness at the thumb root, little-finger side and palm root means \u201chigh fire, inner heat\u201d. This half-year, guard against flare-ups \u2014 mouth ulcers, sore throat, light sleep, higher blood pressure, alcohol taxing the liver.', tips: ['Less alcohol, less spice, fewer late nights; if the redness never fades, get liver function and blood pressure checked'], focusLabel: 'Inner heat' },
    '金01': { feat: 'The thumb-root mound is broad, thick and full.', short: 'Warm appeal, no shortage of admirers', read: 'A full Mount of Venus: warm, earthy, appealing \u2014 decent luck with admirers, easily seen as \u201cthe dependable one\u201d.', strengths: ['People luck: warm and grounded, help finds you everywhere'] },
    '月01': { feat: 'The lower ulnar edge bulges gently.', short: 'True intuition, luck in travel', read: 'A full Mount of Moon: sharp intuition and many ideas, suited to work that needs imagination; also luck in long trips and moving cities.', potential: ['Opportunity away from home: a new city or travel opens the game'] },
    '坎01': { feat: 'A flush of red at the center of the palm root.', short: 'Strong roots, tired lower back', read: 'The palm root is the Kan palace, seat of foundations, linked to the lower back and legs. Redness means strong roots, but long sitting brings a sore waist and heavy legs.', tips: ['Stand and walk five minutes for every hour seated'], focusLabel: 'Sitting strain' },
    '拇01': { feat: 'A thick, long thumb set at a wide angle.', short: 'Strong opinions, an open hand', read: 'Strong-willed and generous \u2014 first to pay when a friend is in need. This is your good reputation and your biggest money leak.', strengths: ['Loyal: first to step up for friends'], leak: 'Loyalty \u2014 covering others\u2019 bills', focusLabel: 'Money leaks', tips: ['Lend only what you can write off as a gift; never sign as guarantor'] },
    '小01': { feat: 'The little finger stands well apart from the ring finger.', short: 'Blunt speech, hates being managed', read: 'Straight talk and a dislike of being managed; you deliver best when autonomous and worse when watched.', tips: ['Bluntness is a virtue \u2014 soften the first sentence with your partner before the business'] },
    '指01': { feat: 'Four straight fingers with smooth joints.', short: 'Quick reactions, trusts instinct', read: 'Fast reactions, instinctive calls, quick to pick up new things; On Hands also warns against bamboo-knuckle joints \u2014 yours are not those.' },
    '斗01': { feat: 'The middle fingertip shows a whorl pattern.', short: 'One whorl on the middle finger: it holds', read: 'Chinese physiognomy books read fingertip whorls as signs of honor; folk say a whorl \u201cholds things in\u201d \u2014 steadiness and keeping. Only this one finger is clear, so the full counting rhyme is not applied.' },
    '腕01': { feat: 'Two clear, continuous wrist creases.', short: 'Good foundations', read: 'Two clear, unbroken wrist lines read in modern books as decent foundations. The old \u201cjade bracelet\u201d needs an unbroken ring around the wrist \u2014 the back side wasn\u2019t photographed here.' }
  },
  sanZhu: {
    quote: 'In the palm, Xun is the first lord, governing twenty-five years; Li is the middle lord, governing twenty-five; Kun is the last lord, governing twenty-five. Whichever palace is full, wealth and fortune rise there; where it is deficient, success and failure alternate.',
    palaces: {
      '巽宫': { name: 'First Lord', verdict: { '较满': 'A backed youth: family or elders hold you up; schooling lays a smooth base.', '平满': 'A steady youth: family gives neither much nor little; you build your base mostly yourself.', '平': 'A plain youth: self-reliant from the start, grown-up early.', '缺': 'A bumpy youth: early hardship; things land a step later than for peers.' }, tone: { '较满': 'family or elders hold you up; schooling lays a smooth base', '平满': 'family gives neither much nor little; you build your base mostly yourself', '平': 'self-reliant from the start, grown-up early', '缺': 'early hardship; things land a step later than for peers' } },
      '离宫': { name: 'Middle Lord', verdict: { '较满': 'A rising midlife: an upward run from your late twenties on.', '平满': 'A steady climb: one step, one stair.', '平': 'Midlife is in your own hands: building from flat ground on pure skill.', '缺': 'Midlife has wins and losses: one or two big swings; endure them and it settles.' }, tone: { '较满': 'an upward run from your late twenties on', '平满': 'one step, one stair', '平': 'building from flat ground on pure skill', '缺': 'one or two big swings; endure them and it settles' } },
      '坤宫': { name: 'Last Lord', verdict: { '较满': 'A flourishing late run: better with age, blessed later years.', '平满': 'Smooth later years: what you have stays; little to worry about.', '平': 'Quiet later years: living on the base you built earlier.', '缺': 'Keep a reserve for later life: start the nest egg early.' }, tone: { '较满': 'better with age, blessed later years', '平满': 'what you have stays; little to worry about', '平': 'living on the base you built earlier', '缺': 'start the nest egg early' } }
    }
  },
  stageDefaults: {
    '0\u201425': 'The foundation years: study, learn a craft; the road is walked out step by step.',
    '26\u201435': 'The direction-testing years: try a few roads, find the one worth a long run.',
    '36\u201445': 'The heaviest and most decisive decade: much carried, much earned.',
    '46\u201455': 'The harvest: contacts and skills start cashing in; money comes easier than before.',
    '56\u2014': 'The keeping years: the center returns home; guard health and savings.'
  },
  stageDefaultsKeys: { '0\u201425': '0—25', '26\u201435': '26—35', '36\u201445': '36—45', '46\u201455': '46—55', '56\u2014': '56—' },
  tenGods: {
    '财': { label: 'Wealth month', text: 'Wealth month: money can come in \u2014 good for collecting payments, negotiating prices, asking for a raise.', yi: 'collecting, negotiating, closing deals', ji: 'turning down small money' },
    '印': { label: 'Patron month', text: 'Patron month: someone lends a hand \u2014 elders, bosses or old friends may bring an opening.', yi: 'asking favors, studying, certifications, visiting elders', ji: 'staying too proud to ask' },
    '官杀': { label: 'Pressure month', text: 'Pressure month: heavier loads, reviews and assessments; the body tightens along.', yi: 'steady routine, early sleep, check-ups', ji: 'butting heads with bosses, all-nighters' },
    '比劫': { label: 'Leak month', text: 'Leak month: favors, loans and split accounts leak money fastest; peer competition rises.', yi: 'bookkeeping, written splits', ji: 'guaranteeing others, lending big' },
    '食伤': { label: 'Expression month', text: 'Expression month: ideas flow, spending on pleasure tempts, and words come out sharp.', yi: 'creating, pitching, going out', ji: 'impulse orders, public clapbacks' }
  },
  shaNames: { '桃花': 'Peach Blossom', '驿马': 'Traveling Horse', '库': 'Storage' },
  shaText: {
    '桃花': 'A Peach-Blossom branch: popularity rises, someone shows interest; if partnered, prevent misunderstandings.',
    '驿马': 'A Traveling-Horse branch: money in motion \u2014 trips, other cities, earnings on the road.',
    '库': 'A Storage branch: good for saving and locking assets; what enters the vault should be locked.'
  },
  peachAdvice: (loveShort) => 'You are the \u201c' + loveShort + '\u201d type \u2014 don\u2019t mistake courtesy for flirtation. ',
  horseAdvice: 'When the chance comes, take it first. ',
  season: {
    names: { '春': 'spring', '夏': 'summer', '秋': 'autumn', '冬': 'winter' },
    hues: { '青': 'green-blue', '赤': 'red', '白': 'pale', '黑': 'dark', '黄': 'yellow' },
    nextTerm: { '春': 'Start of Summer', '夏': 'Start of Autumn', '秋': 'Start of Winter', '冬': 'Start of Spring' },
    quote: ['Spring green, summer red, autumn favors white; among the four seasons, black is welcome in winter.', 'Autumn red, winter yellow, white seen in spring, black met in summer \u2014 all read as adverse.'],
    inSeason: (s, h) => 'It is ' + s + ' and the palm leans ' + h + ', matching the season: ride the current \u2014 this season your work has momentum.',
    offSeason: (s, h, nxt) => 'A ' + h + ' palm in ' + s + ' is an off-season color by the Four-Season Lines: before ' + nxt + ', temper runs short and words run hot \u2014 let big decisions wait a beat.'
  },
  stageTemplates: {
    '打底': {
      title: { '较满': 'A youth with backing', '平满': 'A steady youth, self-built base', '平': 'Running the household early', '缺': 'A bumpy youth, landing a step later', '': 'The foundation years' },
      text: 'Your fate line only begins at the palm center \u2014 before {S} the line has not surfaced. These years are not for results but for gathering skill and knowing people.',
      advice: 'Study, learn a craft, stay near people better than you; everything banked before {S} gets used later.'
    },
    '起势': {
      title: { '掌心': 'Rising at {S}, all on your own', '': 'Rising at {S}' },
      text: { '掌心': 'Around {S}, the fate line emerges from the very center of the palm: this road was not paved by family \u2014 you cut it yourself, step by step.', '': 'Around {S} the fate line begins: the real work for yourself starts here.' },
      advice: 'From {S} to 34, don\u2019t fear switching \u2014 trial costs are lowest; but by 34, fix your main line of work.'
    },
    '换道': {
      title: { '断续': 'One lane change at 35', '': 'Setting the compass at 35' },
      text: { '断续': 'At the 35 mark the fate line meets the head line, and past the crossing it runs in segments: these years may bring a new platform, city or trade \u2014 your luck moves when you move.', '': 'At the 35 mark the fate line meets the head line and stays continuous past it: steady steps \u2014 the road you chose was right.' },
      advice: 'Around 35, if someone poaches you or a new chance appears, price out the income and network three years ahead before moving; never switch on a flare of pride.'
    },
    '自补': {
      title: 'The line fades after {E}; the last stretch is self-built',
      text: 'The fate line fades at the {E} mark, never reaching the heart line: from {E} to 50 the push from employers and platforms shrinks \u2014 rising further rides on your own name and network.',
      advice: 'Before {E}, turn one expertise into a signature \u2014 so that later, people ask for you by name, platform or not.'
    },
    '贯通': {
      title: 'One unbroken run, 35\u201350',
      text: 'Past 35 the fate line keeps climbing straight to the heart line: these fifteen years are your smoothest \u2014 whatever you do, someone lends a hand.',
      advice: 'In smooth times, bring a few of your own people along; after fifty they are your foundation.'
    },
    '收成': {
      title: { '升': 'The turn after fifty \u2014 brighter with age', '平': 'A steady harvest after fifty', '降': 'After fifty, walk it in gently' },
      text: { '升': 'Past fifty the midlife grind winds down and the late run takes over: the second half is smoother than the first, and the network and skill you banked cash in one by one.', '平': 'Past fifty the gear change is smooth: the road continues as it began \u2014 no great spikes, no great dips.', '降': 'Past fifty the early momentum eases; set aside reserves for later life ahead of time.' },
      advice: { '较满': 'After fifty, feel free to do what you love \u2014 money and people both stay; just never sign as guarantor again.', '平满': 'After fifty, guard savings and health and the days are easy.', '平': 'Before fifty, settle housing and retirement money so later years are light.', '缺': 'Build the nest egg early; after fifty avoid high-risk bets and never guarantee others.', '': 'After fifty, guard savings and health.' }
    }
  },
  stageKinds: { '打底': 'Foundation', '起势': 'Rising', '换道': 'Switching', '自补': 'Self-built', '贯通': 'Unbroken', '收成': 'Harvest', '初主': 'First Lord', '中主': 'Middle Lord' },
  ageScaleNote: 'A modern annual-luck school: the fate line counts age 1 at the wrist, 35 where it crosses the head line, 50 where it crosses the heart line, interpolated by distance in between. This project takes the three crossings along the fate line\u2019s vertical and converts photo coordinates linearly into ages. It is a modern web-era school, not a classic; the other school measures along the life line and is not used here.',
  stageMethodTail: 'After fifty, the direction of the turn follows the fullness of the Li and Kun palaces (deficient < flat < evenly full < quite full) per the Three Lords. If any of fate line, head line, heart line or wrist lines is missing or unclear, the reading falls back to the three-lord segments.',
  indexMethod: 'Each index starts at 60; matched rules add or subtract, scaled by observation weight (clear 1.0, partial 0.7); the annual ten-god correction is added; results are clamped to 45\u201395. 80+ is Blessed, 60\u201379 Steady, below 60 Caution.',
  wxMethod: 'Score the five elements from visible features in this photo; the highest is the primary element, the second the supporting one. Weights are this project\u2019s working compilation of common lore.',
  monthMethod: 'Take the hand\u2019s primary element as \u201cself\u201d; each solar-term month\u2019s branch element sets the generating/controlling relation and ten-god image (feeds me = Patron, I control = Wealth, controls me = Pressure, same as me = Leak, I feed = Expression), overlaid with Peach Blossom, Traveling Horse and Storage branches. This is the project\u2019s combined method.',
  levels: {
    '古籍': 'Verbatim lines from Chinese classics read in digital editions; original blocks uncollated.',
    '近代': 'Naming and verdicts from modern mainstream palmistry books; unverified pages marked as common lore.',
    '民间': 'Contemporary platform and folk lore (public samples); authors\u2019 claims, not independently verified.',
    '合参': 'This project\u2019s combined method (e.g. hand-element against monthly branches); explicitly a project method, not any book\u2019s original.'
  },
  sources: {
    '论手': 'Shen Xiang Quan Bian \u2014 \u201cOn Hands\u201d',
    '相三主': 'Shen Xiang Quan Bian \u2014 \u201cThe Three Lords\u201d',
    '四季纹': 'Shen Xiang Quan Bian \u2014 \u201cFour-Season Lines\u201d',
    '人相编贯指': 'Xinkan Tuxiang Renxiang Bian, vol. 4 \u2014 the finger-piercing vertical line',
    '手相学': 'Modern palmistry manuals \u2014 chapters on life, head, heart, fate, sun and marriage lines',
    '平台通行': 'Common platform lore (heart line, fate line, wealth marks, thumb and little-finger spread)',
    '中医掌诊通行': 'Popular TCM palm-color lore (red thenar/hypothenar as inner heat) \u2014 lifestyle notes only, never diagnosis',
    '五行手形': 'Five-element hand shapes from modern popular manuals (metal square, wood long, water round, fire pointed-red, earth thick)',
    '月令生克': 'Ziping five-element relations and ten-god images + solar-term months; the hand\u2019s element replaces the day master',
    '地支神煞': 'Common folk astrology: Zi-Wu-Mao-You as Peach Blossom, Yin-Shen-Si-Hai as Traveling Horse, Chen-Xu-Chou-Wei as Storage',
    '近代流年': 'Modern palm annual-luck method: fate \u00d7 head crossing \u2248 35, fate \u00d7 heart crossing \u2248 50',
    '斗箕': 'Direct whorl/loop reading; the old \u201cwhorls bring honor\u201d saying from Chinese physiognomy'
  },
  terms: {
    '小寒': 'Minor Cold', '大寒': 'Major Cold', '立春': 'Start of Spring', '雨水': 'Rain Water', '惊蛰': 'Awakening of Insects', '春分': 'Spring Equinox',
    '清明': 'Pure Brightness', '谷雨': 'Grain Rain', '立夏': 'Start of Summer', '小满': 'Grain Full', '芒种': 'Grain in Ear', '夏至': 'Summer Solstice',
    '小暑': 'Minor Heat', '大暑': 'Major Heat', '立秋': 'Start of Autumn', '处暑': 'End of Heat', '白露': 'White Dew', '秋分': 'Autumn Equinox',
    '寒露': 'Cold Dew', '霜降': 'Frost Descent', '立冬': 'Start of Winter', '小雪': 'Minor Snow', '大雪': 'Major Snow', '冬至': 'Winter Solstice'
  },
  branches: { '子': 'Zi (Rat)', '丑': 'Chou (Ox)', '寅': 'Yin (Tiger)', '卯': 'Mao (Rabbit)', '辰': 'Chen (Dragon)', '巳': 'Si (Snake)', '午': 'Wu (Horse)', '未': 'Wei (Goat)', '申': 'Shen (Monkey)', '酉': 'You (Rooster)', '戌': 'Xu (Dog)', '亥': 'Hai (Pig)' },
  stems: { '甲': 'Jia', '乙': 'Yi', '丙': 'Bing', '丁': 'Ding', '戊': 'Wu', '己': 'Ji', '庚': 'Geng', '辛': 'Xin', '壬': 'Ren', '癸': 'Gui' },
  animals: { '子': 'Rat', '丑': 'Ox', '寅': 'Tiger', '卯': 'Rabbit', '辰': 'Dragon', '巳': 'Snake', '午': 'Horse', '未': 'Goat', '申': 'Monkey', '酉': 'Rooster', '戌': 'Dog', '亥': 'Pig' },
  topicNames: { '财运': 'Wealth', '感情': 'Love', '事业': 'Career', '健康': 'Health', '全览': 'Full reading' },
  quickTitles: { '财运': 'Wealth', '身体': 'Body', '感情': 'Love' },
  focusTheme: { '健康': 'Health', '财运': 'Wealth', '感情': 'Love', '事业': 'Career', '综合': 'Overall' },
  focusRanks: ['Top concern', 'Second', 'Third', 'Minor'],
  yearLabelSuffix: ' year',
  coverNote: 'Reading dates must fall between 2025-01-01 and 2035-12-31 (solar-term table coverage).'
};