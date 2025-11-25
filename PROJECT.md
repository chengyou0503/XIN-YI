# Stir-Fry POS 系統 - 專案文件

## 專案概述

新易現炒店點餐系統 (Stir-Fry POS) 是一個基於 Next.js 開發的餐廳點餐管理系統，整合 Firebase 作為後端資料庫和 LINE LIFF 作為前端使用者介面。

## 技術架構

```
┌─────────────────────────────────────────────────────────┐
│                   Vercel (生產環境)                      │
│              https://xin-yi-pos.vercel.app              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js 14 (App Router)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  前台 (客戶)  │  │  後台 (管理)  │  │  QR Code     │  │
│  │  /menu       │  │  /admin      │  │  /admin/qr   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Firebase (xiyi-c4266)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Firestore  │  │  Storage   │  │    Auth    │        │
│  │  (資料庫)  │  │  (圖片)    │  │  (待整合)  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 前端技術棧
- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: CSS Modules
- **圖標**: lucide-react
- **狀態管理**: React Context + useState

### 後端服務
- **資料庫**: Firebase Firestore
- **檔案儲存**: Firebase Storage
- **身份驗證**: LINE LIFF (規劃中)

## 專案結構

```
stir-fry-pos/
├── src/
│   ├── app/                    # Next.js App Router 頁面
│   │   ├── page.tsx           # 首頁 (重導向至 /menu)
│   │   ├── menu/              # 前台點餐頁面
│   │   │   ├── page.tsx
│   │   │   └── menu.module.css
│   │   ├── admin/             # 後台管理
│   │   │   ├── page.tsx       # 訂單/菜單管理
│   │   │   ├── login/         # 管理員登入
│   │   │   ├── qr/            # QR Code 產生器
│   │   │   └── admin.module.css
│   │   └── context/           # React Context
│   │       └── AuthContext.tsx
│   ├── lib/                   # 核心函式庫
│   │   ├── firebase.ts        # Firebase 初始化
│   │   ├── firebaseConfig.ts  # Firebase 配置
│   │   ├── storage.ts         # Firestore 資料操作
│   │   ├── imageUpload.ts     # 圖片上傳/刪除
│   │   ├── adminAuth.ts       # 管理員驗證
│   │   ├── menuData.ts        # 預設菜單資料
│   │   └── mockData.ts        # Mock 資料
│   └── types/                 # TypeScript 型別定義
│       └── index.ts
├── public/                    # 靜態資源
│   ├── alert.mp3             # 訂單通知音效
│   └── placeholder.jpg       # 圖片佔位符
├── .env.local                # 環境變數 (本地)
├── firebase.json             # Firebase 配置
├── storage.rules             # Firebase Storage 規則
├── cors.json                 # CORS 設定
└── package.json

```

## 核心功能

### 前台 (客戶端) - `/menu`
- ✅ 掃描 QR Code 進入點餐頁面
- ✅ 瀏覽菜單（依類別篩選）
- ✅ 加入購物車（支援客製化選項）
- ✅ 送出訂單至 Firestore
- ✅ LINE 通知整合（待完善）

### 後台 (管理端) - `/admin`
- ✅ 訂單管理（等待中、製作中、已完成）
- ✅ 廚房看板（即時顯示製作中訂單）
- ✅ 菜單管理（新增、編輯、刪除、圖片上傳/刪除）
- ✅ 歷史帳務（營業額統計）
- ✅ QR Code 產生器
- ✅ 即時訂單通知音效

## 環境變數設定

### `.env.local` 必要變數

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xiyi-c4266.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xiyi-c4266
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xiyi-c4266.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# LINE Configuration
CHANNEL_ACCESS_TOKEN=your_channel_access_token
CHANNEL_SECRET=your_channel_secret
NEXT_PUBLIC_LINE_LIFF_ID=your_liff_id
```

### Vercel 環境變數
需要在 Vercel Dashboard → Settings → Environment Variables 設定上述所有變數。

## 部署流程

### 1. 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 在瀏覽器開啟 http://localhost:3000
```

### 2. Firebase 設定

```bash
# 部署 Storage 規則
firebase deploy --only storage

# 設定 CORS（若需要）
gsutil cors set cors.json gs://xiyi-c4266.firebasestorage.app
```

### 3. 部署至 Vercel

```bash
# 方法一：透過 Vercel CLI
npm install -g vercel
vercel login
vercel --prod

# 方法二：透過 GitHub 自動部署
# 1. 推送至 GitHub main 分支
git push origin main

# 2. Vercel 自動偵測並部署
```

### 4. 設定別名（若需要）

```bash
vercel alias set <deployment-url> xin-yi-pos.vercel.app
```

## 管理員帳號

預設管理員帳號密碼（寫死在程式碼中）：
- **帳號**: `admin`  
- **密碼**: `admin`

> ⚠️ **安全建議**: 正式環境應改用 Firebase Authentication

## 重要修正記錄

### 圖片上傳 CORS 錯誤
- **問題**: URL 中出現 `%0A`（換行符）
- **解決**: 在 `firebaseConfig.ts` 中硬編碼 `storageBucket` 名稱

### 編輯餐點儲存後 Modal 不關閉
- **問題**: 異步儲存阻塞 UI 更新
- **解決**: 使用 `setTimeout` 延遲狀態更新至下一個事件循環

### QR Code 掃描問題
- **問題**: LIFF URL 導向問題
- **解決**: 改用應用程式直接 URL (`/menu?table={tableId}`)

## 資料模型

### MenuItem (菜單項目)
```typescript
{
  id: string;           // 唯一識別碼
  name: string;         // 餐點名稱
  price: number;        // 價格
  category: Category;   // 類別
  imageUrl: string;     // 圖片 URL
  description?: string; // 描述
  available: boolean;   // 是否供應
  options?: MenuOption[]; // 客製化選項
}
```

### Order (訂單)
```typescript
{
  id: string;           // 訂單ID
  tableId: string;      // 桌號
  items: CartItem[];    // 品項清單
  totalAmount: number;  // 總金額
  status: 'pending' | 'cooking' | 'served'; // 狀態
  createdAt: string;    // 建立時間
  lineUserId?: string;  // LINE 用戶ID
}
```

## 待辦事項

- [ ] 整合 LINE LIFF 真實登入
- [ ] 實作 LINE 訂單通知
- [ ] 加強管理員身份驗證（Firebase Auth）
- [ ] 新增訂單修改功能
- [ ] 報表與數據分析
- [ ] 多語系支援

## 聯絡資訊

- **GitHub**: [chengyou0503/XIN-YI](https://github.com/chengyou0503/XIN-YI)
- **Vercel**: `https://xin-yi-pos.vercel.app`
- **Firebase Project**: `xiyi-c4266`
