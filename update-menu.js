const admin = require('firebase-admin');
const serviceAccount = require('./xiyi-c4266-firebase-adminsdk-fbsvc-55e043ff1b.json');

// 檢查是否已初始化
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 完整菜單資料 (包含客製化選項)
const menuItemsWithOptions = [
    // 鐵板類
    {
        id: 'tb1',
        name: '鐵板羊肉',
        category: '鐵板類',
        price: 150,
        available: true,
        description: '嚴選鮮嫩羊肉',
        imageUrl: '/placeholder.jpg',
        optionGroups: [
            {
                id: 'group-1764137758880',
                name: '主食',
                type: 'radio',
                required: false,
                options: [
                    { name: '飯', price: 0 },
                    { name: '麵', price: 0 }
                ]
            },
            {
                id: 'group-1764137785311',
                name: '額外',
                type: 'checkbox',
                required: false,
                options: [
                    { name: '口味清淡', price: 0 },
                    { name: '肉加量', price: 30 }
                ]
            }
        ]
    },
    {
        id: 'tb2',
        name: '鐵板牛肉',
        category: '鐵板類',
        price: 200,
        available: true,
        description: '嚴選牛肉，鮮嫩多汁',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'tb3',
        name: '鐵板豬肉',
        category: '鐵板類',
        price: 160,
        available: true,
        description: '特製醬汁，香氣四溢',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'tb10',
        name: '鐵板鮮蚵',
        category: '鐵板類',
        price: 230,
        available: true,
        description: '新鮮肥美的鮮蚵',
        imageUrl: '/placeholder.jpg'
    },
    // 燴飯類
    {
        id: 'hr1',
        name: '豬肉燴飯',
        category: '燴飯類',
        price: 120,
        available: true,
        description: '濃郁醬汁配白飯',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'hr2',
        name: '牛肉燴飯',
        category: '燴飯類',
        price: 140,
        available: true,
        description: '嫩牛肉燴飯',
        imageUrl: '/placeholder.jpg'
    },
    // 現炒類
    {
        id: 'xc1',
        name: '宮保雞丁',
        category: '現炒類',
        price: 180,
        available: true,
        description: '經典川菜',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'xc2',
        name: '魚香肉絲',
        category: '現炒類',
        price: 170,
        available: true,
        description: '香辣開胃',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'xc10',
        name: '五更腸旺',
        category: '現炒類',
        price: 200,
        available: true,
        description: '麻辣鮮香',
        imageUrl: '/placeholder.jpg'
    },
    // 三杯類
    {
        id: 'sb1',
        name: '三杯雞',
        category: '三杯類',
        price: 190,
        available: true,
        description: '台式經典',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'sb2',
        name: '三杯中卷',
        category: '三杯類',
        price: 220,
        available: true,
        description: '鮮甜Q彈',
        imageUrl: '/placeholder.jpg'
    },
    // 炒飯類
    {
        id: 'cf1',
        name: '揚州炒飯',
        category: '炒飯類',
        price: 100,
        available: true,
        description: '粒粒分明',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'cf2',
        name: '海鮮炒飯',
        category: '炒飯類',
        price: 130,
        available: true,
        description: '豐富海鮮',
        imageUrl: '/placeholder.jpg'
    },
    // 湯麵類
    {
        id: 'tm1',
        name: '牛肉麵',
        category: '湯麵類',
        price: 150,
        available: true,
        description: '濃郁湯頭',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'tm2',
        name: '陽春麵',
        category: '湯麵類',
        price: 60,
        available: true,
        description: '清爽簡單',
        imageUrl: '/placeholder.jpg'
    },
    // 湯類
    {
        id: 't1',
        name: '酸辣湯',
        category: '湯類',
        price: 80,
        available: true,
        description: '酸辣開胃',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 't2',
        name: '玉米濃湯',
        category: '湯類',
        price: 70,
        available: true,
        description: '香濃可口',
        imageUrl: '/placeholder.jpg'
    },
    // 蔬菜類
    {
        id: 'v1',
        name: '炒青菜',
        category: '蔬菜類',
        price: 80,
        available: true,
        description: '當季時蔬',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'v2',
        name: '燙青菜',
        category: '蔬菜類',
        price: 70,
        available: true,
        description: '清燙健康',
        imageUrl: '/placeholder.jpg'
    },
    // 飲料類
    {
        id: 'd1',
        name: '紅茶',
        category: '飲料類',
        price: 30,
        available: true,
        description: '冰涼解渴',
        imageUrl: '/placeholder.jpg'
    },
    {
        id: 'd2',
        name: '奶茶',
        category: '飲料類',
        price: 40,
        available: true,
        description: '香濃奶茶',
        imageUrl: '/placeholder.jpg'
    }
];

async function updateMenuWithOptions() {
    console.log('\n🔄 更新菜單資料（含客製化選項）...\n');

    try {
        // 先刪除現有資料
        const existingSnapshot = await db.collection('menuItems').get();
        const deleteBatch = db.batch();
        existingSnapshot.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log('🗑️  已清空現有菜單資料\n');

        // 批次寫入新資料
        const batch = db.batch();
        let count = 0;

        menuItemsWithOptions.forEach((item) => {
            const docRef = db.collection('menuItems').doc(item.id);
            batch.set(docRef, {
                ...item,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;

            if (item.optionGroups) {
                console.log(`✅ ${item.name} - 包含 ${item.optionGroups.length} 個客製化選項群組`);
            }
        });

        await batch.commit();

        console.log(`\n✅ 成功更新 ${count} 個菜單項目！\n`);
        console.log('📋 已更新的分類：');
        const categories = [...new Set(menuItemsWithOptions.map(item => item.category))];
        categories.forEach(cat => {
            const itemCount = menuItemsWithOptions.filter(item => item.category === cat).length;
            console.log(`   - ${cat}: ${itemCount} 項`);
        });

        console.log('\n🎉 菜單更新完成！\n');

    } catch (error) {
        console.error('❌ 更新失敗:', error);
        process.exit(1);
    }

    process.exit(0);
}

updateMenuWithOptions();
