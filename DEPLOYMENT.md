# 部署指南 - 新易現炒 POS 系統

## 目前狀態
✅ Git repository 已初始化  
✅ 所有程式碼已準備完成

## 部署步驟

### 步驟 1：推送到 GitHub

1. **在 GitHub 上創建新的 repository**：
   - 前往 https://github.com/new
   - Repository 名稱：`stir-fry-pos`（或您喜歡的名稱）
   - 選擇 **Private**（私有）或 Public（公開）
   - **不要**勾選 "Add a README file"
   - 點擊 "Create repository"

2. **在終端機執行以下指令**：
   
   ```bash
   cd "/Users/chengyou/Desktop/L系統Demo/stir-fry-pos"
   
   # 設定 GitHub remote（請替換成您的 GitHub 帳號和 repo 名稱）
   git remote add origin https://github.com/您的GitHub帳號/stir-fry-pos.git
   
   # 推送到 GitHub
   git push -u origin main
   ```

### 步驟 2：部署到 Vercel

1. **前往 Vercel**：
   - 訪問 https://vercel.com
   - 點擊 "Sign Up" 或 "Log In"
   - **使用 GitHub 帳號登入**

2. **導入專案**：
   - 登入後，點擊 "Add New..." → "Project"
   - 選擇您剛剛創建的 `stir-fry-pos` repository
   - 點擊 "Import"

3. **設定環境變數（重要！）**：
   - 在 "Environment Variables" 區域
   - 新增以下變數：
     - Name: `NEXT_PUBLIC_LINE_LIFF_ID`
     - Value: `您的 LINE LIFF ID`（從 LINE Developers Console 取得）
   - 點擊 "Add"

4. **部署**：
   - 點擊 "Deploy"
   - 等待 1-2 分鐘
   - 部署完成後會顯示網址（例如：`https://stir-fry-pos-xxx.vercel.app`）

### 步驟 3：更新 LINE LIFF 設定

⚠️ **關鍵步驟**：必須回到 LINE Developers Console 更新設定

1. 前往 LINE Developers Console
2. 選擇您的 LIFF App
3. 更新以下設定：
   - **Endpoint URL**: `https://您的vercel網址.vercel.app`
   - 在 **LINE Login** 分頁：
     - **Callback URL**: 新增 `https://您的vercel網址.vercel.app`
   - 儲存變更

### 步驟 4：測試

1. 使用新的 LIFF URL 測試（或直接訪問 Vercel 網址）
2. 確認能正常登入
3. 測試點餐流程
4. 測試後台功能

## 環境變數說明

您需要在 Vercel 設定的環境變數：
- `NEXT_PUBLIC_LINE_LIFF_ID`: 您的 LINE LIFF ID

## 常見問題

**Q: 如何查看部署狀態？**  
A: 在 Vercel dashboard 可以看到所有部署記錄

**Q: 如何更新網站？**  
A: 只需將程式碼推送到 GitHub：
```bash
git add .
git commit -m "更新描述"
git push
```
Vercel 會自動重新部署（約 1-2 分鐘）

**Q: 網站網址太長怎麼辦？**  
A: 在 Vercel 專案設定中可以：
- 設定自訂網域
- 或修改 Vercel 提供的子網域名稱

## 需要協助？

如果在部署過程中遇到任何問題，請隨時詢問！
