# 🎬 視頻流媒體播放系統 (Video Streaming Web)

基於現代化純前端 + Python 本地管理服務的影視點播網站。界面深度還原愛看機器人（iKanbot）視覺風格，支持多線路切換、全部分集播放、歷史記錄斷點續播，並提供強大的管理後臺，可從 iKanbot 一鍵抓取影片全部線路及分集連結，自由勾選並構建播放頁面。

**本項目原生支持靜態託管（GitHub Pages）**，上傳到 GitHub 後無需任何服務器即可全球隨時隨地在線免服務器播放！

---

## ✨ 核心特性

1. **首頁風格還原（參考圖1）**
   - 頂部搜索欄：支持按影片名、演員、別名實時搜索檢索。
   - 分類與熱門標籤過濾：電影、劇集、榜單，以及熱門、國產劇、美劇、英劇、韓劇、日劇、動漫、綜藝等標籤一鍵切換。
   - 響應式海報瀑布流：鼠標懸浮微交互，海報與分集狀態徽標。
   - **Day 1 初始無影片狀態**：初始影片庫爲空（`data/videos.json` 爲 `[]`），提供優雅的空狀態提示與一鍵進入管理後臺引導。

2. **播放頁體驗（參考圖2）**
   - 頂部提示警示條（與原版一致）。
   - 16:9 自適應高清播放器：內置 HLS 引擎（Hls.js），全平臺兼容 `.m3u8` 播放。
   - **多線路與多源支持**：支持同一影片多條線路（線路1、線路2...），並在下方完整展示各線路的全部集數（[第1集] [第2集]...）。
   - **實時高亮與切集**：點擊任意集數秒切播放，高亮選中狀態。
   - **線路異常自動切換與重試**：如某條線路網路失效，支持一鍵切換下一條線路。
   - **右側影片詳情卡片**：展示海報、別名、年代、國家地區、演職員表。
   - **智能播放歷史記錄**：自動記住每部影片上次播放的線路、集數與具體秒數，支持斷點續播。

3. **管理後臺（Admin 頁面）**
   - **一鍵解析 iKanbot 連結**：只需輸入 iKanbot 播放頁網址（如 `https://www1.ikanbot.com/play/898899`），自動解析出片名、海報、年代地區、演職員以及全部線路（40+條）與所有分集 m3u8 連結！
   - **多線路多源自由勾選**：支持勾選 1 條或同時保留多條線路。
   - **一鍵連通性測速**：提供【一鍵測速/測試連通性】功能，自動檢測每條線路的 HTTP 狀態與延遲，並支持【僅勾選測速正常線路】。
   - **分集連結複製導出**：支持一鍵複製單條線路或全部勾選線路的所有分集連結。
   - **一鍵保存併發布**：自動更新寫入 `data/videos.json`，無需手動敲代碼。
   - **影片庫管理**：支持瀏覽、播放預覽、修改與刪除已有影片。

---

## 🚀 本地運行與添加影片

### 方法一：雙擊啓動（Windows 推薦）
直接雙擊運行項目根目錄下的 **`start_server.bat`**，它會自動啓動服務並在瀏覽器中打開管理後臺：
- 首頁網址：`http://localhost:8080/index.html`
- 管理後臺：`http://localhost:8080/admin.html`

### 方法二：命令行啓動
在項目目錄打開 PowerShell 或終端，運行：
```bash
python server.py
```
然後訪問 `http://localhost:8080/admin.html` 即可。

### 方法三：命令行快速添加影片
您也可以直接使用內置的 CLI 工具快速導入影片：
```bash
python add_video.py https://www1.ikanbot.com/play/898899
```
根據終端提示選擇保留的線路（默認前 3 條或輸入指定編號），即可自動寫入影片庫！

---

## 🌐 使用 GitHub Desktop (Win11) 同步上線指南

系統已內置 `.gitignore`，已自動幫您隱藏本地管理腳本（`admin.html`、`server.py`、`start_server.bat` 等），**只同步純前臺觀影文件**，訪客絕不可能看到或進入您的後臺！

### 初次同步（使用 GitHub Desktop）：

1. 打開 **GitHub Desktop**，點擊頂部菜單 **File** ➔ **Add Local Repository...**。
2. 點擊 **Choose...**，選擇當前文件夾：`C:\Users\murphychan\Documents\Video Streaming`，點擊 **Add Repository**（如果提示不是 Git 倉庫，點擊 **create a repository** 創建即可）。
3. 點擊頂部 **Publish repository**，輸入倉庫名（如 `my-video`），取消勾選 `Keep this code private`（保持公開倉庫以使用免費 GitHub Pages），點擊 **Publish repository** 推送到 GitHub。
4. 在瀏覽器中打開您的 GitHub 倉庫頁面，點擊 **Settings (設置)** ➔ **Pages**。
5. 在 **Build and deployment** 下：
   - Source 選擇：`Deploy from a branch`
   - Branch 選擇：`main`，路徑選擇 `/(root)`
   - 點擊 **Save**。
6. 等待 1~2 分鐘，GitHub 會分配一個專屬網站地址（例如 `https://username.github.io/my-video/`），用任何手機、電腦瀏覽器打開即可隨時隨地暢快觀影！

### 後續添加新影片同步：
1. 本地雙擊 `start_server.bat`，在管理後臺輸入 iKanbot 連結並點擊【保存並構建到網站】。
2. 打開 **GitHub Desktop**，它會自動檢測到 `data/videos.json` 與 `data/posters/` 的更新。
3. 左下角輸入 Summary（例如 `add new movie`），點擊 **Commit to main**，然後點擊頂部的 **Push origin**。
4. 線上網站數十秒內自動同步，全球任何設備立即可看新片！

---

## 📁 項目目錄結構

```
Video Streaming/
├── index.html           # 首頁（搜索、分類、海報網格、Day 1 空狀態引導）
├── play.html            # 播放頁（Hls.js播放器、多線路選擇、分集列表、影片詳情）
├── history.html         # 播放歷史記錄頁面（支持繼續播放、刪除、清空）
├── admin.html           # 管理後臺（iKanbot一鍵抓取、線路連通性測試、勾選與保存）
├── server.py            # 本地輕量級 HTTP 服務與 iKanbot 解析 API（純 Python 標準庫，零第三方包依賴）
├── add_video.py         # 命令行一鍵添加影片腳本
├── start_server.bat     # Windows 一鍵啓動腳本
├── css/
│   └── style.css        # 完整頁面樣式表（還原 iKanbot 界面質感）
├── js/
│   └── app.js           # 公共邏輯、觀看歷史、檢索與工具函數
├── data/
│   └── videos.json      # 影片數據文件（Day 1 初始爲空 []）
└── README.md            # 項目說明與使用部署文檔
```

---

## 💡 常見問題解答

1. **爲什麼在 Day 1 首頁是空的？**
   - 按照您的要求，Day 1 默認爲空（`data/videos.json` 爲 `[]`）。
   - 首次使用時，您可以直接進入【管理後臺】輸入任意 iKanbot 連結進行添加，或者在首頁點擊【⚡ 加載演示影片體驗】即可立即生成演示影片進行體驗。

2. **視頻海報無法顯示？**
   - 豆瓣等圖片源有防盜鏈限制，本系統已全局內置 `<meta name="referrer" content="no-referrer">`，並在海報加載異常時自動回退到優雅的 SVG 佔位圖。

3. **某些線路播放卡頓或失效？**
   - 影視爬蟲源有生命週期，因此在管理後臺添加時，特別提供了【🔍 一鍵測速/測試連通性】功能，您可以一鍵測試所有線路，並自動勾選穩定暢通的線路保存即可。播放頁中若某線路異常，也會提醒用戶或一鍵切換下一條備用線路。
