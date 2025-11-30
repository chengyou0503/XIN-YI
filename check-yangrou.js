const admin = require('firebase-admin');
const serviceAccount = require('./xiyi-c4266-firebase-adminsdk-fbsvc-55e043ff1b.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkYangrou() {
    console.log('\n🔍 檢查資料庫中的鐵板羊肉資料...\n');

    try {
        const doc = await db.collection('menuItems').doc('tb1').get();

        if (!doc.exists) {
            console.log('❌ 找不到鐵板羊肉 (tb1)');
        } else {
            const data = doc.data();
            console.log('📄 鐵板羊肉資料：');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ 錯誤:', error);
    }

    process.exit(0);
}

checkYangrou();
