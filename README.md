# 🎬 视频流媒体播放系统 (Video Streaming Web)

基于现代化纯前端 + Python 本地管理服务的影视点播网站。界面深度还原爱看机器人（iKanbot）视觉风格，支持多线路切换、全部分集播放、历史记录断点续播，并提供强大的管理后台，可从 iKanbot 一键抓取影片全部线路及分集链接，自由勾选并构建播放页面。

**本项目原生支持静态托管（GitHub Pages）**，上传到 GitHub 后无需任何服务器即可全球随时随地在线免服务器播放！

---

## ✨ 核心特性

1. **首页风格还原（参考图1）**
   - 顶部搜索栏：支持按影片名、演员、别名实时搜索检索。
   - 分类与热门标签过滤：电影、剧集、榜单，以及热门、国产剧、美剧、英剧、韩剧、日剧、动漫、综艺等标签一键切换。
   - 响应式海报瀑布流：鼠标悬浮微交互，海报与分集状态徽标。
   - **Day 1 初始无影片状态**：初始影片库为空（`data/videos.json` 为 `[]`），提供优雅的空状态提示与一键进入管理后台引导。

2. **播放页体验（参考图2）**
   - 顶部提示警示条（与原版一致）。
   - 16:9 自适应高清播放器：内置 HLS 引擎（Hls.js），全平台兼容 `.m3u8` 播放。
   - **多线路与多源支持**：支持同一影片多条线路（线路1、线路2...），并在下方完整展示各线路的全部集数（[第1集] [第2集]...）。
   - **实时高亮与切集**：点击任意集数秒切播放，高亮选中状态。
   - **线路异常自动切换与重试**：如某条线路网络失效，支持一键切换下一条线路。
   - **右侧影片详情卡片**：展示海报、别名、年代、国家地区、演职员表。
   - **智能播放历史记录**：自动记住每部影片上次播放的线路、集数与具体秒数，支持断点续播。

3. **管理后台（Admin 页面）**
   - **一键解析 iKanbot 链接**：只需输入 iKanbot 播放页网址（如 `https://www1.ikanbot.com/play/898899`），自动解析出片名、海报、年代地区、演职员以及全部线路（40+条）与所有分集 m3u8 链接！
   - **多线路多源自由勾选**：支持勾选 1 条或同时保留多条线路。
   - **一键连通性测速**：提供【一键测速/测试连通性】功能，自动检测每条线路的 HTTP 状态与延迟，并支持【仅勾选测速正常线路】。
   - **分集链接复制导出**：支持一键复制单条线路或全部勾选线路的所有分集链接。
   - **一键保存并发布**：自动更新写入 `data/videos.json`，无需手动敲代码。
   - **影片库管理**：支持浏览、播放预览、修改与删除已有影片。

---

## 🚀 本地运行与添加影片

### 方法一：双击启动（Windows 推荐）
直接双击运行项目根目录下的 **`start_server.bat`**，它会自动启动服务并在浏览器中打开管理后台：
- 首页网址：`http://localhost:8080/index.html`
- 管理后台：`http://localhost:8080/admin.html`

### 方法二：命令行启动
在项目目录打开 PowerShell 或终端，运行：
```bash
python server.py
```
然后访问 `http://localhost:8080/admin.html` 即可。

### 方法三：命令行快速添加影片
您也可以直接使用内置的 CLI 工具快速导入影片：
```bash
python add_video.py https://www1.ikanbot.com/play/898899
```
根据终端提示选择保留的线路（默认前 3 条或输入指定编号），即可自动写入影片库！

---

## 🌐 使用 GitHub Desktop (Win11) 同步上线指南

系统已内置 `.gitignore`，已自动帮您隐藏本地管理脚本（`admin.html`、`server.py`、`start_server.bat` 等），**只同步纯前台观影文件**，访客绝不可能看到或进入您的后台！

### 初次同步（使用 GitHub Desktop）：

1. 打开 **GitHub Desktop**，点击顶部菜单 **File** ➔ **Add Local Repository...**。
2. 点击 **Choose...**，选择当前文件夹：`C:\Users\murphychan\Documents\Video Streaming`，点击 **Add Repository**（如果提示不是 Git 仓库，点击 **create a repository** 创建即可）。
3. 点击顶部 **Publish repository**，输入仓库名（如 `my-video`），取消勾选 `Keep this code private`（保持公开仓库以使用免费 GitHub Pages），点击 **Publish repository** 推送到 GitHub。
4. 在浏览器中打开您的 GitHub 仓库页面，点击 **Settings (设置)** ➔ **Pages**。
5. 在 **Build and deployment** 下：
   - Source 选择：`Deploy from a branch`
   - Branch 选择：`main`，路径选择 `/(root)`
   - 点击 **Save**。
6. 等待 1~2 分钟，GitHub 会分配一个专属网站地址（例如 `https://username.github.io/my-video/`），用任何手机、电脑浏览器打开即可随时随地畅快观影！

### 后续添加新影片同步：
1. 本地双击 `start_server.bat`，在管理后台输入 iKanbot 链接并点击【保存并构建到网站】。
2. 打开 **GitHub Desktop**，它会自动检测到 `data/videos.json` 与 `data/posters/` 的更新。
3. 左下角输入 Summary（例如 `add new movie`），点击 **Commit to main**，然后点击顶部的 **Push origin**。
4. 线上网站数十秒内自动同步，全球任何设备立即可看新片！

---

## 📁 项目目录结构

```
Video Streaming/
├── index.html           # 首页（搜索、分类、海报网格、Day 1 空状态引导）
├── play.html            # 播放页（Hls.js播放器、多线路选择、分集列表、影片详情）
├── history.html         # 播放历史记录页面（支持继续播放、删除、清空）
├── admin.html           # 管理后台（iKanbot一键抓取、线路连通性测试、勾选与保存）
├── server.py            # 本地轻量级 HTTP 服务与 iKanbot 解析 API（纯 Python 标准库，零第三方包依赖）
├── add_video.py         # 命令行一键添加影片脚本
├── start_server.bat     # Windows 一键启动脚本
├── css/
│   └── style.css        # 完整页面样式表（还原 iKanbot 界面质感）
├── js/
│   └── app.js           # 公共逻辑、观看历史、检索与工具函数
├── data/
│   └── videos.json      # 影片数据文件（Day 1 初始为空 []）
└── README.md            # 项目说明与使用部署文档
```

---

## 💡 常见问题解答

1. **为什么在 Day 1 首页是空的？**
   - 按照您的要求，Day 1 默认为空（`data/videos.json` 为 `[]`）。
   - 首次使用时，您可以直接进入【管理后台】输入任意 iKanbot 链接进行添加，或者在首页点击【⚡ 加载演示影片体验】即可立即生成演示影片进行体验。

2. **视频海报无法显示？**
   - 豆瓣等图片源有防盗链限制，本系统已全局内置 `<meta name="referrer" content="no-referrer">`，并在海报加载异常时自动回退到优雅的 SVG 占位图。

3. **某些线路播放卡顿或失效？**
   - 影视爬虫源有生命周期，因此在管理后台添加时，特别提供了【🔍 一键测速/测试连通性】功能，您可以一键测试所有线路，并自动勾选稳定畅通的线路保存即可。播放页中若某线路异常，也会提醒用户或一键切换下一条备用线路。
