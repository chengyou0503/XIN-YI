# Stir-Fry POS 系統 - 專案文件

## 專案概述
**新易現炒 POS 系統** 是一套完整的餐廳點餐與管理系統，整合 LINE LIFF 登入、Firebase 後端、即時訂單通知等功能。

## 技術架構
- **前端框架**: Next.js 14 (App Router)
- **樣式**: CSS Modules
- **後端服務**: Firebase (Firestore, Storage, Hosting)
- **身份驗證**: LINE LIFF
- **部署**: Firebase Hosting + GitHub Actions
- **通知系統**: LINE Messaging API

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
- ✅ **QR Code 掃描**：已修正 LIFF 重新導向問題，掃描後可正常進入點餐頁面
- ✅ **訂單送出前確認對話框**：防止誤點，點擊「送出」會先顯示確認模態框
- ✅ **成功畫面「知道了」按鈕**：已改為僅關閉成功畫面，避免再次觸發送單流程
- ✅ **LINE 推播日誌加強**：在前端與 `/api/line/push` 後端加入詳細 console 日誌
- ✅ **後台新訂單音效**：改為使用 Web Audio API 產生簡短嗶聲
- ✅ **動態分類管理系統**：可在後台新增/刪除分類

## 仍在追蹤的問題
- 📢 **LINE 訊息未送達**：API 回傳成功，但客戶仍未收到訊息，需確認：
  - LINE 官方帳號已加為好友
  - Bot 已啟用
  - Flex Message 格式符合規範
- 🔔 **後台音效**：目前使用嗶聲，若需其他音效可再調整

## 待開發功能 (優先順序)
1. ✅ ~~公告系統~~ (已完成)
2. ✅ ~~客製化選項系統~~ (已完成)
3. **後台訂單編輯** – 允許員工在結帳前修改訂單內容（品項、數量、選項）
4. **報表系統** – 營收統計、熱銷商品分析

## 部署資訊

### Firebase Hosting (目前使用)
- **專案 ID**: `xiyi-c4266`
- **Firebase 方案**: Blaze (Pay as you go)
- **部署方式**: GitHub Actions (推送至 `main` 分支自動部署)
- **GitHub Repository**: `chengyou0503/XIN-YI`

### Vercel (已停用)
- ~~Vercel 生產網址: https://xin-yi-pos.vercel.app~~ (免費額度用完，已遷移)

## 環境變數

### Local Development (`.env.local`)
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

### GitHub Secrets (已設定)
- `FIREBASE_SERVICE_ACCOUNT_XIYI_C4266`: Firebase Service Account JSON (用於 CI/CD)

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
  optionGroups?: OptionGroup[]; // 新格式
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

## 重要修正紀錄
- 圖片上傳 CORS 錯誤已解決
- 編輯菜單後 Modal 正確關閉
- QR Code 重新導向問題已修正
- 動態分類管理系統完成並整合至菜單管理頁面
- 菜單資料從簡單選項升級為選項群組架構
- 部署平台從 Vercel 遷移至 Firebase Hosting

## 開發指南

### 本地開發
```bash
npm install
npm run dev
```

### 部署到 Firebase
```bash
# 推送至 GitHub main 分支會自動觸發部署
git push origin main

# 或手動部署
firebase deploy --only hosting
```

### 初始化菜單資料
1. 進入後台 `/admin`
2. 點擊「菜單管理」
3. 點擊「快速載入預設菜單」按鈕

## 聯絡資訊
- **LINE 官方帳號**: @080pkuoh
- **Firebase 專案管理員**: lin1023.ai@gmail.com, workistired@gmail.com

---

*此文件由 Antigravity AI 於 2025-11-26 12:47 更新*
