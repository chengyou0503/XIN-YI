const admin = require('firebase-admin');
const serviceAccount = require('./xiyi-c4266-firebase-adminsdk-fbsvc-55e043ff1b.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkOrderItems() {
    console.log('\n🔍 檢查訂單中的菜單項目資料（包含客製化選項）...\n');

    try {
        const ordersSnapshot = await db.collection('orders').get();

        const allItems = [];
        ordersSnapshot.forEach(order => {
            const data = order.data();
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    allItems.push({
                        orderId: order.id,
                        ...item
                    });
                });
            }
        });

        // 找出鐵板羊肉的資料
        const yangrou = allItems.filter(item => item.name && item.name.includes('羊肉'));

        console.log('📋 找到的羊肉相關品項：\n');
        yangrou.forEach((item, index) => {
            console.log(`${index + 1}. 訂單 ${item.orderId}`);
            console.log(`   品項 ID: ${item.id}`);
            console.log(`   名稱: ${item.name}`);
            console.log(`   價格: ${item.price}`);
            if (item.optionGroups) {
                console.log(`   客製化選項群組:`);
                console.log(JSON.stringify(item.optionGroups, null, 2));
            }
            if (item.options) {
                console.log(`   舊格式選項:`);
                console.log(JSON.stringify(item.options, null, 2));
            }
            console.log('');
        });

        // 顯示所有不同的品項和其客製化選項
        const uniqueItems = {};
        allItems.forEach(item => {
            if (!uniqueItems[item.id]) {
                uniqueItems[item.id] = item;
            }
        });

        console.log('\n📊 所有品項的客製化選項概覽：\n');
        Object.values(uniqueItems).forEach(item => {
            if (item.optionGroups || item.options) {
                console.log(`🍽️  ${item.name} (${item.id})`);
                if (item.optionGroups) {
                    console.log('   optionGroups:', JSON.stringify(item.optionGroups, null, 2));
                }
                if (item.options) {
                    console.log('   options:', JSON.stringify(item.options, null, 2));
                }
                console.log('');
            }
        });

    } catch (error) {
        console.error('❌ 錯誤:', error);
    }

    process.exit(0);
}

checkOrderItems();
