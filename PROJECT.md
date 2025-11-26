# Stir-Fry POS 系統 - 專案文件

## 專案概述
**新易現炒 POS 系統** 是一套完整的餐廳點餐與管理系統，整合 LINE LIFF 登入、Firebase 後端、即時訂單通知等功能。

## 技術架構
- **前端框架**: Next.js 14.2.3 (App Router)
- **樣式**: CSS Modules
- **後端服務**: Firebase (Firestore, Storage, Hosting, Cloud Functions)
- **身份驗證**: LINE LIFF
- **部署**: Firebase Hosting + GitHub Actions
- **通知系統**: LINE Messaging API

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

#### 方式一：自動部署（推薦）
推送程式碼到 GitHub `main` 分支會自動觸發部署：
```bash
git add .
git commit -m "feat: 新功能說明"
git push origin main
```

GitHub Actions 會自動：
1. 執行 `npm ci` 安裝依賴
2. 部署到 Firebase Hosting (`https://xiyi.web.app`)

#### 方式二：手動部署
```bash
# 本地建置
npm run build

# 部署到 Firebase
firebase deploy --only hosting
```

### 4. LINE LIFF 設定
1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇 Provider > Channel
3. 進入「LIFF」頁籤
4. 更新 Endpoint URL 為：`https://xiyi.web.app`
5. LIFF ID: `2007818450-kYXd68rR`

## 近期完成的關鍵功能

### 🎉 2025-11-26 最新完成
- ✅ **公告系統**：
  - 後台可新增、編輯、刪除公告，並切換啟用狀態
  - 前台（首頁與點餐頁）顯示啟用的公告橫幅
  - 支援用戶手動關閉公告
- ✅ **客製化選項群組系統**：
  - 後台支援為每個餐點建立多個選項群組（單選/多選）
  - 可設定群組為必選或選填
  - 前台點餐時根據群組類型顯示 Radio 或 Checkbox
  - 自動驗證必選項目並計算總價
- ✅ **部署架構遷移**：
  - 從 Vercel 遷移至 Firebase Hosting
  - 使用 GitHub Actions 自動部署
  - 已設定 Service Account 與 GitHub Secrets

### 🔧 先前完成
- ✅ **QR Code 掃描**：已修正 LIFF 重新導向問題
- ✅ **訂單送出前確認對話框**：防止誤點
- ✅ **成功畫面「知道了」按鈕**：避免重複送單
- ✅ **LINE 推播日誌加強**：詳細 console 日誌
- ✅ **後台新訂單音效**：Web Audio API 簡短嗶聲
- ✅ **動態分類管理系統**：可在後台新增/刪除分類

## 仍在追蹤的問題
- 📢 **LINE 訊息未送達**：需確認好友狀態、Bot 啟用、Flex Message 格式
- 🔔 **後台音效**：目前使用嗶聲，可調整

## 待開發功能 (優先順序)
1. ✅ ~~公告系統~~ (已完成)
2. ✅ ~~客製化選項系統~~ (已完成)
3. **後台訂單編輯** – 允許員工在結帳前修改訂單內容
4. **報表系統** – 營收統計、熱銷商品分析
5. **多語言支援** – 繁中、英文切換

## 部署資訊

### Firebase Hosting（目前使用）
- **專案 ID**: `xiyi-c4266`
- **網址**: `https://xiyi.web.app`
- **Firebase 方案**: Blaze (Pay as you go)
- **部署方式**: GitHub Actions (推送至 `main` 分支自動部署)
- **GitHub Repository**: `chengyou0503/XIN-YI`
- **區域**: asia-east1

### 環境變數

#### Local Development (`.env.local`)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xiyi-c4266.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xiyi-c4266
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xiyi-c4266.firebasestorage.app

# LINE Configuration
CHANNEL_ACCESS_TOKEN=5UZ8jthUVAdQpxaczdPx5z6T5TYOfdxrFnPCi3JBaeFDFRsXHEIb2hU6QGfyVHTE0xRvWFEXdmLq+K/ZEIcehNEVU1SSekZCfwJE+BHlGb4K9qYLHys3Dpc43rJQhmkBqpUHoApexgnxSdSGz5jiMQdB04t89/1O/w1cDnyilFU=
CHANNEL_SECRET=06c9612939f7987d1c9e9c42f285a5ab
NEXT_PUBLIC_LINE_LIFF_ID=2007818450-kYXd68rR
```

#### GitHub Secrets（已設定）
- `FIREBASE_SERVICE_ACCOUNT_XIYI_C4266`: Firebase Service Account JSON

## 資料結構

### MenuItem
```typescript
{
  id: string;
  name: string;
  price: number;
  category: string;
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
  status: 'pending' | 'cooking' | 'served';
  createdAt: Date;
  lineUserId?: string;
}
```

## 專案結構
```
stir-fry-pos/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自動部署
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首頁（顯示公告）
│   │   ├── menu/              # 點餐頁面
│   │   ├── admin/             # 後台管理
│   │   │   ├── page.tsx       # 訂單管理、菜單管理
│   │   │   ├── announcements/ # 公告管理
│   │   │   ├── login/         # 後台登入
│   │   │   └── qr/            # QR Code 產生器
│   │   └── api/
│   │       └── line/
│   │           └── push/      # LINE 推播 API
│   ├── lib/
│   │   ├── firebaseConfig.ts  # Firebase 初始化
│   │   ├── storage.ts         # Firestore 操作
│   │   ├── imageUpload.ts     # Firebase Storage 上傳
│   │   └── adminAuth.ts       # 後台認證
│   └── types.ts               # TypeScript 類型定義
├── firebase.json              # Firebase Hosting 設定
├── package.json
└── PROJECT.md                 # 本文件
```

## 開發指南

### 初始化菜單資料
1. 進入後台 `/admin`
2. 點擊「菜單管理」
3. 點擊「快速載入預設菜單」按鈕（載入 104 個預設菜單項目）

### 新增公告
1. 進入後台 `/admin`
2. 點擊「公告管理」
3. 點擊「新增公告」，輸入標題與內容
4. 勾選「立即啟用」
5. 儲存

### 設定選項群組
1. 進入後台 `/admin` > 菜單管理
2. 點擊要編輯的餐點
3. 滾動至「客製化選項群組」區塊
4. 點擊「新增選項群組」
5. 設定群組名稱（如：辣度）、類型（單選/多選）、是否必選
6. 在群組內新增選項（如：小辣 $0、中辣 $0、大辣 $0）
7. 儲存

### 測試部署
```bash
# 查看部署狀態
gh run list

# 查看最新一次部署的日誌
gh run view --log

# 查看 Firebase Hosting 網站列表
firebase hosting:sites:list
```

## 疑難排解 (Troubleshooting)

### 部署失敗：webframeworks not enabled
```bash
firebase experiments:enable webframeworks
```

### Node 版本警告
確保 `package.json` 包含：
```json
"engines": {
  "node": ">=20"
}
```

### LINE 訊息未送達
1. 確認用戶已加入 LINE 官方帳號好友
2. 檢查 `CHANNEL_ACCESS_TOKEN` 是否正確
3. 確認 Bot 已啟用
4. 檢查 Flex Message 格式是否符合規範

### 圖片上傳失敗
檢查 Firebase Storage Rules：
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-items/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 重要修正紀錄
- ✅ 圖片上傳 CORS 錯誤已解決
- ✅ 編輯菜單後 Modal 正確關閉
- ✅ QR Code 重新導向問題已修正
- ✅ 動態分類管理系統完成
- ✅ 菜單資料從簡單選項升級為選項群組架構
- ✅ 部署平台從 Vercel 遷移至 Firebase Hosting
- ✅ 網址簡化為 `https://xiyi.web.app`

## 聯絡資訊
- **LINE 官方帳號**: @080pkuoh
- **Firebase 專案管理員**: lin1023.ai@gmail.com, workistired@gmail.com
- **GitHub Repository**: https://github.com/chengyou0503/XIN-YI

---

*此文件由 Antigravity AI 於 2025-11-26 13:44 更新*
*包含完整的專案流程、部署步驟與疑難排解指南*
