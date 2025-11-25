// 菜單初始化腳本 - 用於將預設菜單資料上傳到 Firebase Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

// Firebase 配置（從 .env.local 讀取）
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 匯入菜單資料
const { MOCK_MENU } = require('./src/lib/mockData');

async function initializeMenu() {
    try {
        console.log('🚀 開始初始化菜單資料...');
        console.log(`📝 準備上傳 ${MOCK_MENU.length} 項餐點`);

        // 檢查是否已有資料
        const menuCol = collection(db, 'menu');
        const snapshot = await getDocs(menuCol);

        if (!snapshot.empty) {
            console.log('⚠️  菜單已存在，將覆蓋現有資料');
        }

        // 批量上傳菜單項目
        let successCount = 0;
        for (const item of MOCK_MENU) {
            try {
                await setDoc(doc(db, 'menu', item.id), item);
                successCount++;

                // 顯示進度
                if (successCount % 10 === 0) {
                    console.log(`✅ 已上傳 ${successCount}/${MOCK_MENU.length} 項`);
                }
            } catch (error) {
                console.error(`❌ 上傳失敗 (${item.id}):`, error.message);
            }
        }

        console.log('\n🎉 菜單初始化完成！');
        console.log(`✅ 成功上傳: ${successCount} 項`);
        console.log(`❌ 失敗: ${MOCK_MENU.length - successCount} 項`);

        // 統計各分類數量
        const categoryCounts = {};
        MOCK_MENU.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        console.log('\n📊 分類統計:');
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} 項`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ 初始化失敗:', error);
        process.exit(1);
    }
}

// 執行初始化
initializeMenu();
