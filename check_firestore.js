const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

// 使用專案的 Firebase Config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: "xiyi-c4266",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 模擬環境變數 (從 .env.local 读取)
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

// 更新 config
firebaseConfig.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
firebaseConfig.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
firebaseConfig.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
firebaseConfig.messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
firebaseConfig.appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMenu() {
    console.log('Listing all menu items...');
    try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        console.log(`Found ${querySnapshot.size} documents.`);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`ID: ${doc.id}, Name: ${data.name}, ImageUrl: ${data.imageUrl}`);
        });

        // Check specifically for tb1 in the list
        const tb1 = querySnapshot.docs.find(d => d.id === 'tb1');
        if (tb1) {
            console.log('\n[tb1] FOUND in list:', JSON.stringify(tb1.data(), null, 2));
        } else {
            console.log('\n[tb1] NOT FOUND in list!');
        }

    } catch (error) {
        console.error('Error listing documents:', error);
    }
}

checkMenu();
