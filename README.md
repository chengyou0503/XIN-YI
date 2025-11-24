# 現炒店點餐系統 (Stir-Fry POS)

這是一個專為現炒店設計的線上點餐系統，包含客戶端手機點餐、管理端訂單看板以及 QR Code 產生器。

## 功能特色

-   **客戶端**：
    -   掃描 QR Code 自動帶入桌號
    -   LINE 登入整合（目前為模擬模式）
    -   分類菜單瀏覽與圖片展示
    -   購物車與訂單送出
-   **管理端**：
    -   即時訂單列表與狀態管理（等待中、製作中、已上菜、已結帳）
    -   廚房專用看板（只顯示待製作餐點）
    -   QR Code 自動產生與列印功能

## 快速開始

1.  **安裝依賴套件**：
    ```bash
    npm install
    ```

2.  **啟動開發伺服器**：
    ```bash
    npm run dev
    ```

3.  **開啟瀏覽器**：
    -   **客戶端首頁**：[http://localhost:3000](http://localhost:3000) (可點擊模擬按鈕測試)
    -   **管理端儀表板**：[http://localhost:3000/admin](http://localhost:3000/admin)
    -   **QR Code 產生器**：[http://localhost:3000/admin/qr](http://localhost:3000/admin/qr)

## 技術堆疊

-   **框架**：Next.js (App Router)
-   **語言**：TypeScript
-   **樣式**：Vanilla CSS (CSS Modules)
-   **後端/資料庫**：Firebase (目前使用模擬資料與 Local State)

## 注意事項

-   目前系統使用模擬資料 (Mock Data)，重新整理頁面後訂單會重置。
-   LINE 登入功能為模擬實作，無需真實帳號即可測試。
