# 專案清理指南

## 📊 當前專案大小分析

```
專案總大小: ~1.6GB
├── .firebase/      806MB  (Firebase 建置快取)
├── node_modules/   520MB  (NPM 依賴套件)
├── .next/          321MB  (Next.js 建置輸出)
├── .git/           ~50MB  (Git 版本控制)
└── src/            ~15MB  (源代碼)
```

## ✅ 立即可執行的清理

### 1. 刪除不需要的 Vercel 檔案
```bash
cd /Users/chengyou/Desktop/L系統Demo/stir-fry-pos
rm -rf .vercel
rm vercel.json
```
**節省空間**: ~2KB
**影響**: 無（我們使用 Firebase Hosting，不使用 Vercel）

### 2. 清理 macOS 系統檔案
```bash
find . -name .DS_Store -delete
```
**節省空間**: ~10KB
**影響**: 無

### 3. 清理 Firebase 建置快取（選用）
```bash
rm -rf .firebase
```
**節省空間**: 806MB
**影響**: 下次部署時會重新建立，部署時間會稍微延長
**建議**: 如果不急著釋放空間，可以保留

### 4. 清理 Next.js 建置輸出（選用）
```bash
rm -rf .next
```
**節省空間**: 321MB
**影響**: 需要重新執行 `npm run build`
**建議**: 開發時保留，只在需要時清理

## 🔄 定期維護

### 更新 .gitignore
確保以下內容在 `.gitignore` 中：
```gitignore
# 依賴套件
node_modules/

# 建置輸出
.next/
out/
build/

# Firebase
.firebase/

# Vercel (不使用)
.vercel/

# 環境變數
.env.local
.env.*.local

# 系統檔案
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 日誌
*.log
npm-debug.log*
```

### Git 儲存庫優化
```bash
# 清理未追蹤的檔案
git clean -fd

# 壓縮 Git 儲存庫
git gc --aggressive --prune=now

# 檢查儲存庫大小
du -sh .git
```

## 📦 GitHub 儲存庫優化

### 檢查大檔案
```bash
# 找出 Git 歷史中的大檔案
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -n 10
```

### 如果發現不應該在 Git 中的大檔案
```bash
# 使用 git filter-branch 移除（謹慎使用！）
# git filter-branch --tree-filter 'rm -rf path/to/large/file' HEAD
```

## 🔥 Firebase 清理

### 清理舊的 Hosting 版本
```bash
# 查看部署歷史
firebase hosting:releases --site xiyi

# Firebase 自動保留最近 10 個版本
# 不需要手動清理
```

### 清理舊的 Functions 版本
```bash
# 列出所有 Functions
gcloud functions list --project=xiyi-c4266

# Cloud Functions 自動保留最近 5 個版本
# 可手動刪除舊版本（如需要）
```

### Firestore 清理
```bash
# 清理測試訂單（謹慎使用！）
# 建議在 Admin 後台透過 UI 刪除
```

## 💾 儲存空間建議

### 最小需求空間
- 開發環境: 2GB
- 建置環境: 3GB
- 生產環境: 100MB (只需源代碼)

### 推薦清理頻率
- **每週**: 清理 .DS_Store
- **每月**: 檢查並清理不需要的 node_modules
- **每季**: Git 儲存庫優化

## ⚡ 速度優化建議

### 1. 使用 .npmrc 加速安裝
```bash
echo "prefer-offline=true" >> .npmrc
echo "audit=false" >> .npmrc
```

### 2. 使用 pnpm 代替 npm（選用）
```bash
npm install -g pnpm
pnpm install  # 更快，佔用更少空間
```

### 3. 啟用 Next.js SWC
已在 `next.config.mjs` 中啟用（預設）

### 4. Firebase 快取優化
已在 `firebase.json` 中設定快取策略

## 🎯 一鍵清理腳本

創建 `cleanup.sh`:
```bash
#!/bin/bash
echo "🧹 開始清理專案..."

# 刪除不需要的檔案
rm -rf .vercel vercel.json
find . -name .DS_Store -delete

# 顯示結果
echo "✅ 清理完成！"
echo ""
echo "📊 目前專案大小:"
du -sh .
```

執行:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

## ⚠️ 注意事項

1. **不要刪除** `.env.local` - 包含重要的 API 金鑰
2. **不要刪除** `node_modules` 除非準備重新安裝
3. **不要刪除** `.git` - 版本控制歷史
4. **謹慎刪除** `.firebase` 和 `.next` - 會延長下次建置時間

## 📞 需要協助？

如果清理後遇到問題：
```bash
# 重新安裝依賴
npm install

# 重新建置
npm run build

# 重新部署
firebase deploy --only hosting
```
