# LINE LIFF 設定檢查清單

## 需要確認的設定

### 1. LINE Developers Console 設定

請前往 [LINE Developers Console](https://developers.line.biz/console/)：

1. **LIFF 應用程式 Endpoint URL**
   - 務必設定為: `https://xin-yi-pos.vercel.app`
   - ⚠️ **不要** 包含 `/menu` 路徑

2. **Scope (權限)**
   - ✅ `profile` - 必須啟用
   - ✅ `openid` - 必須啟用
   - ✅ `chat_message.write` - 若要發送訊息需啟用

3. **白名單域名**
   - 確認 `xin-yi-pos.vercel.app` 在白名單中

### 2. 測試步驟

1. **掃描 QR Code**
   - 使用真實的 LINE App 掃描 QR code
   - 應該會在 LINE 內建瀏覽器中開啟

2. **LINE 登入**
   - 如果已在 LINE App 中掃描，應該會自動登入
   - 如果在一般瀏覽器中，需要輸入 LINE 帳號密碼

3. **檢查重導向**
   - 登入後應該會回到 `/menu?table=X` 頁面
   - 如果卡在登入頁面，檢查 Endpoint URL 設定

### 3. 當前狀態

✅ LIFF ID: `2007818450-kYXd68rR`  
✅ 應用程式 URL: `https://xin-yi-pos.vercel.app`  
✅ CORS 錯誤已修正  
✅ LIFF ID 換行符已修正  

### 4. 常見問題

**Q: 掃描 QR code 後顯示「LIFF app was not found」**  
A: LIFF ID 錯誤或包含換行符 → 已修正

**Q: 掃描後一直停在 LINE 登入頁面**  
A: 檢查 LIFF Endpoint URL 是否設定為應用程式根 URL

**Q: 登入後無法回到點餐頁面**  
A: 檢查 redirectUri 設定是否正確

### 5. 偵錯方式

打開瀏覽器 Console (F12)，查看是否有以下訊息：
- `LIFF initialization failed` - LIFF 初始化失敗
- `⚠️ LIFF ID 未設定` - 環境變數未設定

---

## 下一步

請問您具體遇到以下哪種情況？

1. ❓ 掃描 QR code 後顯示錯誤訊息？（請提供錯誤訊息）
2. ❓ 卡在 LINE 登入頁面無法繼續？
3. ❓ 登入後沒有跳回點餐頁面？
4. ❓ 其他問題？

請告知具體狀況，我會協助解決！
