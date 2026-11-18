/* Sample observation for the AI-generated demo hand (assets/demo-palm.jpg).
   Authored by reading the sample photo (host-vision role, as in blcaptain-shouxiang),
   NOT produced by the heuristic. Paths are normalized 0-1 against the 768x1024 sample.
   The demo flow loads this so the sample showcases the full report incl. the age ruler;
   real uploads always go through PalmVision and user confirmation. */
window.PALM_DEMO_OBS = {
  手别: '左手',
  拍摄: '示例手照（AI 生成），白底、光线均匀，五指张开、腕纹入镜；观察为示例预读，可在本页修改。',
  特征: [
    { id: '感情线', 类别: '线', 状态: '清楚', 属性: { 长度: '长', 终点: '食中指缝', 走向: '掌缘低、向食中指间上扬', 交会: '中段有细纹交会' },
      描述: '感情线自掌缘低处起，一路向食中指缝上扬，中段有细纹交会。', 描述en: 'The heart line starts low at the ulnar edge and rises into the index–middle gap, with fine lines crossing mid-section.',
      路径: [[0.156, 0.596], [0.26, 0.571], [0.365, 0.552], [0.456, 0.537], [0.547, 0.525]] },
    { id: '智慧线', 类别: '线', 状态: '清楚', 属性: { 起点: '与生命线同源', 长度: '中', 走向: '平缓下斜' },
      描述: '智慧线与生命线同源起步，平缓下斜横过掌中部。', 描述en: 'The head line shares its origin with the life line and slopes gently across the mid palm.',
      路径: [[0.612, 0.547], [0.521, 0.586], [0.43, 0.625], [0.339, 0.669]] },
    { id: '生命线', 类别: '线', 状态: '清楚', 属性: { 弧度: '宽', 末端: '掌根中部' },
      描述: '生命线环拇指根弧度宽，末端收向掌根中部。', 描述en: 'The life line arcs wide around the thumb base and ends toward the center of the palm root.',
      路径: [[0.618, 0.542], [0.651, 0.625], [0.625, 0.713], [0.573, 0.791], [0.521, 0.854]] },
    { id: '事业线', 类别: '线', 状态: '部分', 属性: { 上段: '未贯指' },
      描述: '事业线沿掌心中线自腕侧上行，上段未贯指，中段略变浅。', 描述en: 'The fate line runs up the palm midline from the wrist side; it stops below the finger and fades slightly mid-way.',
      路径: [[0.495, 0.508], [0.488, 0.586], [0.482, 0.664], [0.475, 0.742], [0.469, 0.84]] },
    { id: '健康线', 类别: '线', 状态: '未见', 属性: {}, 描述: '掌根到小指方向未见明确斜纹。', 描述en: 'No clear diagonal from palm root toward the little finger.', 路径: null },
    { id: '太阳线', 类别: '线', 状态: '未见', 属性: {}, 描述: '无名指下方细纹未辨。', 描述en: 'Fine lines below the ring finger not resolved.', 路径: null },
    { id: '婚姻线', 类别: '线', 状态: '未见', 属性: {}, 描述: '小指根侧缘短横纹需侧拍特写，未入辨。', 描述en: 'Short edge lines below the little finger need a side close-up; not resolved.', 路径: null },
    { id: '掌形', 类别: '形', 状态: '清楚', 属性: { 长宽: '长方', 厚薄: '厚', 纹理: '细纹密' },
      描述: '掌面长方、肉厚，下部细纹密。', 描述en: 'Rectangular, fleshy palm with dense fine lines on the lower palm.', 区域: [0.45, 0.66, 0.3] },
    { id: '掌心', 类别: '形', 状态: '部分', 属性: { 形态: '四周丰中间浅' },
      描述: '掌心四周丰、中间略浅。', 描述en: 'Palm center slightly hollow with fuller surroundings.', 点: [0.45, 0.66] },
    { id: '掌色', 类别: '色', 状态: '清楚', 属性: { 整体: '红润偏赤', 分布: '边缘红掌心浅' },
      描述: '掌色红润偏赤，边缘红、掌心浅。', 描述en: 'Ruddy, reddish palm tone; redder at the edges, paler at the center.', 区域: [0.45, 0.66, 0.26] },
    { id: '金星丘', 类别: '丘', 状态: '部分', 属性: { 饱满: '饱满' }, 描述: '拇指根肉垫饱满。', 描述en: 'Thumb-root mound is full.', 区域: [0.62, 0.7, 0.1] },
    { id: '月丘', 类别: '丘', 状态: '部分', 属性: { 饱满: '饱满' }, 描述: '小指侧掌缘下段饱满。', 描述en: 'Lower ulnar edge is full.', 区域: [0.24, 0.78, 0.1] },
    { id: '坎宫', 类别: '宫', 状态: '部分', 属性: { 色: '泛红' }, 描述: '掌根正中泛红。', 描述en: 'Center of the palm root shows redness.', 区域: [0.45, 0.88, 0.08] },
    { id: '巽宫', 类别: '宫', 状态: '部分', 属性: { 饱满: '较满' }, 描述: '食指根下较满。', 描述en: 'Below the index finger is fairly full.', 区域: [0.55, 0.47, 0.07] },
    { id: '离宫', 类别: '宫', 状态: '部分', 属性: { 饱满: '平满' }, 描述: '中指根下平满。', 描述en: 'Below the middle finger is evenly full.', 区域: [0.45, 0.45, 0.07] },
    { id: '坤宫', 类别: '宫', 状态: '部分', 属性: { 饱满: '平' }, 描述: '小指根下平。', 描述en: 'Below the little finger is flat.', 区域: [0.3, 0.47, 0.07] },
    { id: '拇指', 类别: '指', 状态: '部分', 属性: { 粗细: '粗长', 外张: '大' }, 描述: '拇指粗长、外张大。', 描述en: 'Thumb is thick and long, spread wide.', 点: [0.8, 0.55] },
    { id: '小指', 类别: '指', 状态: '部分', 属性: { 外张: '明显' }, 描述: '小指外张明显。', 描述en: 'Little finger spreads noticeably.', 点: [0.14, 0.35] },
    { id: '四指', 类别: '指', 状态: '部分', 属性: { 指节: '平顺' }, 描述: '四指指节平顺。', 描述en: 'The four fingers have smooth joints.', 区域: [0.4, 0.25, 0.25] },
    { id: '中指指腹', 类别: '指', 状态: '未见', 属性: {}, 描述: '斗/箕/弓需指腹特写，不提取细节。', 描述en: 'Whorl/loop/arch needs a fingertip close-up; no detail extraction.', 路径: null },
    { id: '腕纹', 类别: '纹', 状态: '清楚', 属性: { 道数: '两道清楚' },
      描述: '腕前两道横纹清楚。', 描述en: 'Two clear wrist creases.',
      路径: [[0.299, 0.913], [0.391, 0.908], [0.495, 0.908], [0.599, 0.913]] }
  ]
};