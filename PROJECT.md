# Stir-Fry POS 系統 - 專案文件

## 專案概述
**新易現炒 POS 系統** 是一套完整的餐廳點餐與管理系統，整合 LINE LIFF 登入、Firebase 後端、即時訂單通知等功能。

## 技術架構
- **前端框架**: Next.js 14.2.3 (App Router)
- **樣式**: CSS Modules
- **後端服務**: Firebase (Firestore, Storage, Hosting, Cloud Functions)
- **身份驗證**: LINE LIFF
- **部署**: Firebase Hosting + GitHub
- **通知系統**: LINE Messaging API
- **Node 版本**: 20

## 完整專案流程

### 1. 開發環境設定
```bash
# 克隆專案
git clone https://github.com/chengyou0503/XIN-YI.git
cd XIN-YI

# 安裝依賴
npm install

# 設定環境變數（複製 .env.local.example 到 .env.local）
cp .env.local.example .env.local

# 啟動開發伺服器
npm run dev
```

### 2. Firebase 設定
```bash
# 登入 Firebase
firebase login

# 選擇專案
firebase use xiyi-c4266

# 啟用 Web Frameworks（Next.js 支援）
firebase experiments:enable webframeworks
```

### 3. 部署流程

#### 方式一：手動部署到 Firebase（推薦）

```bash
# 1. 確保所有變更都已提交到 Git
git status
git add .
git commit -m "提交訊息"

# 2. 推送到 GitHub
git push origin main

# 3. 建置專案
npm run build

# 4. 部署到 Firebase Hosting
firebase deploy --only hosting

# 部署完成後會顯示：
# ✔  Deploy complete!
# Hosting URL: https://xiyi.web.app
```

#### 部署檢查清單
- [ ] 確認 `.env.local` 有所有必要的環境變數
- [ ] 本地測試 `npm run dev` 無錯誤
- [ ] 執行 `npm run build` 確認建置成功
- [ ] Firebase CLI 已登入正確帳號
- [ ] 部署後檢查 https://xiyi.web.app 是否正常運作

### 4. LINE LIFF 設定
1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇 Provider > Channel
3. 進入「LIFF」頁籤
4. 更新 Endpoint URL 為：`https://xiyi.web.app`
5. LIFF ID: `2007818450-kYXd68rR`

## 最新完成功能

### 🎉 2025-11-30 最新更新

#### QR Code 頁面重新設計
- ✅ **全新卡片式設計**：
  - 仿照實體立牌樣式，採用綠色標題與白色內容區
  - 加入「掃碼五秒鐘 省你五分鐘」標語與「新易現炒」店名
  - 底部新增「掃碼 ➜ 點餐 ➜ 結帳 ➜ 等待」流程圖
  - 優化列印樣式，支援 A4 紙張自動排版與背景色保留
  - **品牌化 QR Code**：將 QR Code 顏色調整為品牌深綠色 (#2d7d46)，提升視覺一致性

#### 前台菜單體驗優化
- ✅ **長滾動瀏覽模式 (Scroll Spy)**：
  - 移除舊版篩選切換，改為垂直長滾動瀏覽
  - 實作置頂分類導航列 (Sticky Nav)
  - **自動偵測**：滾動時導航列自動切換至當前分類
  - **平滑滾動**：點擊分類按鈕自動滑動至對應區塊
- ✅ **Logo 顯示修復**：
  - 為首頁 Logo 添加 `unoptimized` 屬性，解決 Serverless 環境下大圖載入不穩定的問題

#### 後台管理功能增強
- ✅ **手動建立訂單**：
  - 新增「建立新訂單」按鈕，允許店員手動輸入桌號並點餐
  - 解決長者或無手機顧客無法自行點餐的問題
- ✅ **編輯訂單分類篩選**：
  - 在編輯/新增訂單的餐點列表中加入分類按鈕
  - 支援快速切換分類，提升店員找餐效率

### 🎉 2025-11-27 最新更新

#### 菜單圖片顯示修復（晚間）
- ✅ **修復菜單圖片顯示問題**：
  - 實作 `handleImageUpload` 自動儲存功能（圖片上傳後自動寫入 Firestore）
  - 修復 Firestore 客戶端快取導致的資料不一致
  - 實作 `getDocsFromServer()` 強制從伺服器同步最新資料
  - 移除破壞 CSS `position: absolute` 佈局的多餘 wrapper div
  - 清理所有除錯日誌與視覺邊框，優化前台效能
  - 客戶前台現可正常顯示菜單項目圖片（使用 Firebase Storage URL）

#### 系統安全性與效能優化（下午）
- ✅ **系統安全性提升**：
  - 移除 Firestore 全域讀寫權限 (`allow read, write: if true`)
  - 實施嚴格的資料庫存取規則
  
- ✅ **效能與體驗優化**：
  - 啟用 Next.js `<Image>` 組件優化圖片載入
  - 配置 `next.config.mjs` 支援 Firebase Storage 圖片來源
  - 修復後台菜單同步邏輯（移除數量限制 Bug）
  
- ✅ **LIFF 整合優化**：
  - 修復購物車送出按鈕的登入狀態判斷
  - 添加 LIFF 初始化自動重試機制（解決偶發性啟動失敗）
  - 優化載入中狀態顯示


### 🎉 2025-11-26 最新更新（下午）
- ✅ **修復佔位圖片顯示問題**:
  - 移除所有預設佔位圖片 (placeholder.jpg)
  - 未上傳圖片的品項顯示空白背景（客戶端）
  - 未上傳圖片的品項顯示餐具圖示（後台）
  - 更新 menuData.ts 和 mockData.ts
  
- ✅ **修復客製化選項計算與顯示**:
  - 訂單建立時正確計算客製化選項價格
  - 後台訂單卡片顯示客製化選項明細（格式：• 選項名稱 (+$價格)）
  - LINE 通知訊息包含客製化選項資訊
  - 修復所有訂單總額計算邏輯
  
- ✅ **修復 LINE API 403 錯誤**:
  - 設定 Cloud Run 服務允許未經身份驗證的調用
  - 執行 `gcloud run services add-iam-policy-binding` 修復權限問題
  - LINE 推播通知現在可正常運作
  
- ✅ **更新後台音效**:
  - 將新訂單通知音效從 Web Audio API 嗶聲改為 `alert_new.mp3`
  - 更豐富、更專業的提示音效
  - 音量設定為 50%
  
- ✅ **添加訂單送出載入狀態**:
  - 按下「確定送出」後立即顯示「送出中⏳」
  - 禁用按鈕防止重複點擊

### 🎉 2025-11-26 最新更新（上午）
- ✅ **後台訂單編輯系統**:
  - 可編輯現有訂單,調整品項數量
  - 新增/移除訂單品項
  - 整合 OptionsModal 支援客製化選項
  - 自動重新計算訂單總額
  - 即時更新 Firestore
  
- ✅ **公告彈窗系統**:
  - 前台點餐頁面以彈窗形式顯示公告
  - 用戶必須點擊「確定」才能開始點餐
  - 提升公告的閱讀率與重要性
  
- ✅ **UI/UX 優化**:
  - 修正後台訂單卡片按鈕排版（「編輯訂單」「結帳」按鈕現在顯示在同一行）
  - 優化按鈕大小與間距
  - 改善首頁登入後的自動跳轉邏輯

### 🔧 先前完成
- ✅ **公告系統**:後台可新增、編輯、刪除公告,並切換啟用狀態
- ✅ **客製化選項群組系統**:支援單選/多選,必選/選填設定
- ✅ **QR Code 掃描**:已修正 LIFF 重新導向問題
- ✅ **訂單送出前確認對話框**:防止誤點
- ✅ **LINE 推播日誌加強**:詳細 console 日誌
- ✅ **動態分類管理系統**:可在後台新增/刪除分類

## 核心功能說明

### 前台（顧客端）
1. **LINE 登入**：掃描 QR Code 自動登入 LINE LIFF
2. **瀏覽菜單**：按分類瀏覽，支援圖片預覽
3. **客製化選項**：選擇辣度、加料等客製化選項
4. **購物車**：即時顯示品項與總價
5. **送出訂單**：確認後送出，接收 LINE 通知
6. **公告查看**：進入點餐頁面時顯示重要公告

### 後台（管理端）
1. **訂單管理**：
   - 查看即時訂單（等待中、製作中）
   - 編輯訂單內容（新增/移除品項、調整數量）
   - 結帳功能
   - 歷史訂單查詢
   
2. **菜單管理**：
   - 新增/編輯/刪除菜單項目
   - 上傳菜單圖片
   - 設定客製化選項群組
   - 商品上/下架
   
3. **分類管理**：
   - 動態新增/刪除分類
   - 查看分類使用狀況
   
4. **公告管理**：
   - 新增/編輯公告
   - 啟用/停用公告
   
5. **QR Code 產生器**：
   - 快速產生各桌號的 QR Code
   - 支援列印

## 部署資訊

### Firebase Hosting（目前使用）
- **專案 ID**: `xiyi-c4266`
- **網址**: `https://xiyi.web.app`
- **Firebase 方案**: Blaze (Pay as you go)
- **部署方式**: 手動部署（`firebase deploy --only hosting`）
- **GitHub Repository**: `chengyou0503/XIN-YI`
- **區域**: asia-east1 (台灣)

### 環境變數

#### Local Development (`.env.local`)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xiyi-c4266.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xiyi-c4266
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xiyi-c4266.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# LINE Configuration
CHANNEL_ACCESS_TOKEN=5UZ8jthUVAdQpxaczdPx5z6T5TYOfdxrFnPCi3JBaeFDFRsXHEIb2hU6QGfyVHTE0xRvWFEXdmLq+K/ZEIcehNEVU1SSekZCfwJE+BHlGb4K9qYLHys3Dpc43rJQhmkBqpUHoApexgnxSdSGz5jiMQdB04t89/1O/w1cDnyilFU=
CHANNEL_SECRET=06c9612939f7987d1c9e9c42f285a5ab
NEXT_PUBLIC_LINE_LIFF_ID=2007818450-kYXd68rR
NEXT_PUBLIC_BASE_URL=https://xiyi.web.app
```

## 資料結構

### MenuItem
```typescript
{
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  available: boolean;
  options?: MenuOption[]; // Deprecated
  optionGroups?: OptionGroup[]; // 新格式（支援單選/多選）
}
```

### OptionGroup
```typescript
{
  id: string;
  name: string; // 例如：辣度、加料
  type: 'radio' | 'checkbox'; // 單選或多選
  required: boolean;
  options: MenuOption[];
}
```

### MenuOption
```typescript
{
  name: string;
  price: number; // 加價金額
}
```

### Announcement
```typescript
{
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
{
  id: string;
  tableId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'cooking' | 'completed';
  createdAt: Date;
  lineUserId?: string;
}
```

### CartItem
```typescript
{
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  selectedOptions?: MenuOption[]; // 已選擇的客製化選項
}
```

## 專案結構
```
stir-fry-pos/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions (未使用)
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首頁（顯示公告）
│   │   ├── page.module.css
│   │   ├── context/
│   │   │   └── AuthContext.tsx # LINE LIFF 認證
│   │   ├── menu/              # 點餐頁面
│   │   │   ├── page.tsx
│   │   │   └── menu.module.css
│   │   ├── admin/             # 後台管理
│   │   │   ├── page.tsx       # 訂單管理、菜單管理
│   │   │   ├── admin.module.css
│   │   │   ├── announcements/ # 公告管理
│   │   │   ├── login/         # 後台登入
│   │   │   └── qr/            # QR Code 產生器
│   │   └── api/
│   │       └── line/
│   │           └── push/      # LINE 推播 API
│   ├── components/
│   │   ├── OptionsModal.tsx    # 客製化選項彈窗
│   │   └── OptionsModal.module.css
│   ├── lib/
│   │   ├── firebaseConfig.ts   # Firebase 初始化
│   │   ├── storage.ts          # Firestore 操作
│   │   ├── imageUpload.ts      # Firebase Storage 上傳
│   │   ├── adminAuth.ts        # 後台認證
│   │   ├── menuData.ts         # 預設菜單資料
│   │   └── mockData.ts         # Mock 資料
│   └── types.ts                # TypeScript 類型定義
├── public/                     # 靜態資源
├── firebase.json               # Firebase Hosting 設定
├── .firebaserc                 # Firebase 專案設定
├── package.json
├── tsconfig.json
├── next.config.js
└── PROJECT.md                  # 本文件
```

## 開發指南

### 初始化菜單資料
1. 進入後台 `/admin`
2. 使用帳號/密碼登入（預設：admin / admin123）
3. 點擊「菜單管理」
4. 點擊「快速載入預設菜單」按鈕（載入預設菜單項目）

### 新增公告
1. 進入後台 `/admin`
2. 點擊「公告管理」標籤
3. 點擊「新增公告」，輸入標題與內容
4. 勾選「立即啟用」
5. 儲存後，前台會自動顯示彈窗

### 設定客製化選項群組
1. 進入後台 `/admin` > 菜單管理
2. 點擊要編輯的餐點
3. 滾動至「客製化選項群組」區塊
4. 點擊「新增選項群組」
5. 設定：
   - 群組名稱（如：辣度）
   - 類型（單選 radio / 多選 checkbox）
   - 是否必選
6. 在群組內新增選項（如：小辣 $0、中辣 $0、大辣 $5）
7. 儲存

### 編輯訂單
1. 進入後台 `/admin`
2. 在訂單卡片上點擊「編輯訂單」
3. 左側顯示當前品項，可調整數量或移除
4. 右側顯示可新增的菜單，點擊即可加入
5. 如果品項有客製化選項，會彈出 OptionsModal 選擇
6. 點擊「儲存變更」即可更新訂單

### 產生 QR Code
1. 進入後台 `/admin`
2. 點擊上方「QR Code」按鈕
3. 輸入桌號，點擊「產生 QR Code」
4. 可下載或列印

## 常見指令

### 開發
```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器（本地測試）
npm start

# 執行 Lint 檢查
npm run lint
```

### 部署
```bash
# 部署到 Firebase Hosting
firebase deploy --only hosting

# 僅部署 Firestore Rules
firebase deploy --only firestore:rules

# 僅部署 Storage Rules
firebase deploy --only storage

# 查看 Firebase 專案狀態
firebase projects:list

# 查看 Hosting 部署歷史
firebase hosting:sites:list
```

### Git
```bash
# 查看狀態
git status

# 提交變更
git add .
git commit -m "描述訊息"
git push origin main

# 查看提交歷史
git log --oneline -10
```

## 疑難排解 (Troubleshooting)

### 部署失敗：webframeworks not enabled
```bash
firebase experiments:enable webframeworks
```

### Node 版本警告
確保使用 Node 20：
```bash
node -v  # 應顯示 v20.x.x

# 使用 nvm 切換版本
nvm use 20
```

### 建置失敗：環境變數缺失
確保 `.env.local` 包含所有必要變數，可參考上方「環境變數」章節。

### LINE 訊息未送達
1. **確認用戶已加入 LINE 官方帳號好友**
2. 檢查 `CHANNEL_ACCESS_TOKEN` 是否正確
3. 確認 Bot 已啟用（LINE Developers Console > Messaging API > Use webhooks）
4. 檢查 Flex Message 格式是否符合規範
5. 查看 Console 日誌是否有錯誤

### 圖片上傳失敗
檢查 Firebase Storage Rules：
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-items/{allPaths=**} {
      allow read: if true;
      allow write: if true; // 生產環境應該限制寫入權限
    }
  }
}
```

### 公告彈窗不顯示
1. 確認後台「公告管理」有建立公告
2. 確認公告的「啟用」開關是開啟的
3. 清除瀏覽器快取後重新整理
4. 開啟 Console 查看是否有錯誤

### 後台訂單編輯後未更新
1. 確認 Firestore Rules 允許寫入
2. 檢查 Console 是否有錯誤訊息
3. 確認網路連線正常

### 菜單圖片不顯示或顯示舊圖片
1. **清除瀏覽器快取**：
   - Chrome：設定 → 隱私權和安全性 → 清除瀏覽資料
   - 選擇「快取圖片和檔案」
   
2. **檢查 Firebase Storage 規則**：
   - 確認 `menu-items` 資料夾允許讀取
   - 檢查圖片 URL 是否包含正確的 token
   
3. **確認圖片已正確儲存**：
   - 進入後台上傳圖片
   - 圖片會自動儲存到 Firestore（無需手動點擊「儲存」）
   - 重新整理前台頁面
   
4. **開發者工具診斷**：
   - 開啟 Console 檢查是否有錯誤
   - Network 標籤查看圖片請求狀態（應為 200）
   - 檢查 `imageUrl` 欄位是否為有效的 Firebase Storage URL


## Firebase 設定

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許所有讀取（生產環境應該限制）
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-items/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## 效能優化建議

1. **圖片優化**：使用 WebP 格式，壓縮至適當大小
2. **快取策略**：利用 Firebase Hosting 的 CDN 快取
3. **程式碼分割**：Next.js 自動進行程式碼分割
4. **懶加載**：大型圖片使用懶加載
5. **Firestore 索引**：為常用查詢建立索引

## 安全性建議

1. **Firestore Rules**：生產環境應限制寫入權限
2. **Storage Rules**：限制上傳檔案大小與類型
3. **環境變數**：敏感資訊不要提交到 Git
4. **HTTPS**：Firebase Hosting 預設使用 HTTPS
5. **後台密碼**：使用強密碼，定期更換

## 重要修正紀錄
- ✅ 2025-11-30: 後台新增手動建立訂單功能與餐點分類篩選
- ✅ 2025-11-30: QR Code 頁面重新設計（紅色主題、流程圖、列印優化）
- ✅ 2025-11-30: 前台菜單升級為長滾動瀏覽 (Scroll Spy) 與置頂導航
- ✅ 2025-11-30: 修復前台 Logo 顯示問題 (unoptimized)
- ✅ 2025-11-27 (晚間): 修復菜單圖片顯示問題，實作自動儲存與強制伺服器同步
- ✅ 2025-11-27 (下午): 提升 Firestore 安全性，移除全域讀寫權限
- ✅ 2025-11-27 (下午): 全面導入 Next.js Image 優化圖片載入
- ✅ 2025-11-27 (下午): 修復 LIFF 初始化與登入狀態判斷問題
- ✅ 2025-11-27 (下午): 修復後台菜單同步限制 Bug
- ✅ 2025-11-26 (下午): 修復佔位圖片顯示問題
- ✅ 2025-11-26 (下午): 修復客製化選項計算與顯示
- ✅ 2025-11-26 (下午): 修復 LINE API 403 權限錯誤
- ✅ 2025-11-26 (下午): 更新後台音效為 alert_new.mp3
- ✅ 2025-11-26 (下午): 添加訂單送出載入狀態
- ✅ 2025-11-26 (上午): 後台訂單編輯系統完成，支援客製化選項
- ✅ 2025-11-26 (上午): 公告系統改為彈窗顯示
- ✅ 2025-11-26 (上午): 修正後台訂單按鈕排版問題
- ✅ 2025-11-26 (上午): 優化首頁登入後跳轉邏輯
- ✅ 圖片上傳 CORS 錯誤已解決
- ✅ 編輯菜單後 Modal 正確關閉
- ✅ QR Code 重新導向問題已修正
- ✅ 動態分類管理系統完成
- ✅ 菜單資料從簡單選項升級為選項群組架構

## 清理與優化建議

### 🗑️ 可安全刪除的檔案/資料夾

1. **`.vercel/` 資料夾** (約2KB)
   - 我們不使用 Vercel,可安全刪除
   ```bash
   rm -rf .vercel
   rm vercel.json  # 也可刪除
   ```

2. **`.DS_Store` 檔案**
   - macOS 系統檔案,不影響專案
   ```bash
   find . -name .DS_Store -delete
   ```

3. **`.firebase/` 資料夾** (806MB)
   - 包含建置快取,可安全刪除,下次部署會自動重新建立
   - **建議**:保留,但可以在 .gitignore 中排除

4. **`.next/` 資料夾** (321MB)
   - Next.js 建置輸出,可安全刪除,`npm run build` 會重新生成
   - **建議**:保留,但可以在 .gitignore 中排除

5. **`node_modules/` 資料夾** (520MB)
   - 不應提交到 Git,確認已在 .gitignore 中
   - 如需清理:刪除後執行 `npm install` 重新安裝

### 📊 Firebase 優化

```bash
# 查看 Firebase 部署歷史 (只保留最近10個版本)
firebase hosting:clone xiyi:PREVIOUS_VERSION xiyi:active

# 清理 Functions 舊版本 (自動保留最新5個版本)
gcloud functions list --project=xiyi-c4266
```

### 💾 GitHub 優化

確認 .gitignore 已包含：
```gitignore
node_modules/
.next/
.firebase/
.vercel/
.DS_Store
.env.local
```

### ✅ 推薦清理步驟

```bash
# 1. 刪除不需要的 Vercel 相關檔案
rm -rf .vercel vercel.json

# 2. 清理 macOS 系統檔案
find . -name .DS_Store -delete

# 3. 確認 .gitignore 正確
cat .gitignore

# 4. 檢查 Git 儲存庫大小
du -sh .git

# 5. (選用) 如果需要,清理 Git 歷史
git gc --aggressive --prune=now
```

---

## 待開發功能
1. **報表系統**：營收統計、熱銷商品分析、時段分析
2. **多語言支援**：繁中、英文切換
3. **庫存管理**：追蹤商品庫存，自動標記售完
4. **會員系統**：累計消費、優惠券
5. **外帶功能**：支援外帶訂單

## 聯絡資訊
- **LINE 官方帳號**: @080pkuoh
- **Firebase 專案管理員**: lin1023.ai@gmail.com, workistired@gmail.com
- **GitHub Repository**: https://github.com/chengyou0503/XIN-YI
- **線上網址**: https://xiyi.web.app

---

*此文件由 Antigravity AI 於 2025-11-30 更新*
*包含完整的專案流程、部署步驟、功能說明與疑難排解指南*
*最新更新：後台手動點餐功能、QR Code 紅色主題設計、前台菜單長滾動瀏覽*
