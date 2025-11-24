# GitHub 推送指南

## 問題
推送到 GitHub 時需要身份驗證。HTTPS 方式已不支援密碼驗證。

## 解決方案：使用 GitHub CLI（最簡單）

### 步驟 1：安裝 GitHub CLI（如果尚未安裝）

在終端機執行：
```bash
brew install gh
```

### 步驟 2：登入 GitHub

```bash
gh auth login
```

選擇：
1. GitHub.com
2. HTTPS
3. Yes (authenticate Git with your GitHub credentials)
4. Login with a web browser
5. 複製顯示的 code
6. 在瀏覽器中貼上並授權

### 步驟 3：推送程式碼

登入完成後，在專案目錄執行：
```bash
cd "/Users/chengyou/Desktop/L系統Demo/stir-fry-pos"
t
```

## 完成後的下一步

推送成功後：
1. 前往 https://vercel.com
2. 使用 GitHub 帳號登入
3. Import 您的 `XIN-YI` repository
4. 設定環境變數：`NEXT_PUBLIC_LINE_LIFF_ID`
5. 點擊 Deploy

---

## 需要協助？

如果在執行過程中遇到任何問題，請告訴我！
