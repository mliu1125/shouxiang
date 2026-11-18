# 掌中有话 · PalmSpeak

**中文** · [English](#english)

上传一张手掌照片，浏览器**本地**生成一份中英双语手相指南：签、六项指数、流年流月、掌上年龄尺与人生阶段。单文件 HTML 报告，原照内嵌、离线可开。**照片不上传。**

> 娱乐向。不构成医学诊断或投资建议。

## 功能

- **一步直达**：上传手照（或拖拽 / 拍照）→ 自动本地分析 → 直接生成报告；「先看示例报告」一键体验。
- **苹果式极简黑色主题**：纯黑底、系统字体、单一苹果蓝点缀，站点与报告同一设计语言。
- **本地启发式视觉**（`js/vision.js`）：肤色分割、掌区定位、主线追踪、掌色统计。看不清判「不清」、没入镜判「未见」，不硬认纹。
- **可选「微调观察」折叠面板**：21 处特征的状态 / 属性可点选修正；描线工具可在原照上重描四大主线与腕纹（年龄尺按你描的线计算），改完一键重新生成。
- **断语引擎**（`js/engine.js`）：31 条规则、六项指数（45—95，吉/平/慎）、手型五行 × 节气月令排流年流月（2025-01-01 至 2035-12-31）、掌上年龄尺与人生阶段。与上游 Python 实现逐字节对照通过。
- **单文件双语报告**（`js/report.js`）：黑色极简排版，中文 / English 一键切换，可下载、可打印（打印自动切浅底）、离线可开。
- **示例手照**：AI 生成（已标注），预读观察记录，一键体验完整报告含年龄尺。
- 全站中英切换。

## 隐私

照片、观察记录与报告全部在浏览器本地生成，不经过任何服务器；不提取指纹细节、不做身份识别；指腹只记斗/箕/弓粗候选。下载的报告含原照，分享前请自行脱敏。

## 本地运行

纯静态、无构建步骤：

```bash
python -m http.server 8765
# 打开 http://127.0.0.1:8765
```

或任意静态服务器 / 直接双击 `index.html`（示例图需经 http 加载）。

## 部署到 Vercel（免费域名）

```bash
npm i -g vercel
vercel login          # 浏览器授权
vercel --prod         # 首次按提示链接/创建项目；完成后得到 https://<project>.vercel.app
```

仓库已含 `vercel.json`（纯静态、无构建）。也可在 Vercel 控制台 Import 本 GitHub 仓库，Framework 选 **Other**，Build Command 留空，Output Directory 留空（根目录）。

## 同步到 GitHub

```bash
git init && git add . && git commit -m "PalmSpeak bilingual palm-reading site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 许可与出处

- 代码与断语库：Apache-2.0（[LICENSE](LICENSE)、[NOTICE](NOTICE)）。
- 断语库与算法框架源自 [blcaptain-shouxiang](https://github.com/dososo/blcaptain-shouxiang)（爆裂队长NEXT，Apache-2.0）；本站为中英双语网页移植。
- 上游作者手照与示例媒体**未**被复用；示例手照为本项目 AI 生成资产。

---

<a id="english"></a>
## English

Upload a palm photo and get a bilingual (中文 / English) palm-reading guide generated **entirely in your browser**: the fortune sign, six life indexes, annual & monthly flow, an age ruler drawn on your palm, and life stages. The report is a single offline-readable HTML file with the photo embedded. **Nothing is uploaded.**

> For entertainment only. Not medical diagnosis or investment advice.

### Features

- One step: upload (drag / camera also works) → automatic local analysis → report. A sample report is one click away.
- Apple-style minimal dark theme: pure black, system fonts, a single Apple-blue accent; site and report share the same design language.
- Local heuristic vision (skin segmentation, palm locating, line tracing, color stats). Faint → "faint", out of frame → "not seen"; nothing is forced.
- Optional collapsed "Fine-tune observations" panel: edit state/attributes for 21 features; retrace the four major lines and wrist creases on the photo (the age ruler uses your traced paths), then regenerate.
- Reading engine: 31 rules, six indexes (45–95, Blessed/Steady/Caution), hand five-elements × solar-term months (2025-01-01…2035-12-31), age ruler and life stages. Byte-parity verified against the upstream Python implementation.
- Single-file bilingual report: minimal dark layout, 中文/English toggle, download, print (auto light theme for print), offline.
- AI-generated sample hand (labelled) with a pre-read observation so the sample showcases the full report incl. the age ruler.
- Site-wide zh/en toggle.

### Privacy

Photo, observations and report are generated locally in your browser; no server involved. No fingerprint minutiae, no identity matching; fingertips record only coarse whorl/loop/arch candidates. The downloaded report embeds your photo — sanitize before sharing.

### Run locally

Static, no build step: `python -m http.server 8765` then open `http://127.0.0.1:8765`.

### Deploy to Vercel (free domain)

`npm i -g vercel`, `vercel login`, `vercel --prod` → `https://<project>.vercel.app`. `vercel.json` is included (pure static, no build). Or import the GitHub repo in the Vercel dashboard with Framework **Other**, empty build command and output directory.

### License & credit

Apache-2.0 ([LICENSE](LICENSE), [NOTICE](NOTICE)). Judgment library & engine framework ported from [blcaptain-shouxiang](https://github.com/dososo/blcaptain-shouxiang) (BLCaptain, Apache-2.0). The upstream author's hand photos / example media are **not** reused; the sample hand is an AI-generated asset of this project.