import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 清理函數：移除所有可能的空白字符和換行符號
const cleanEnvValue = (value: string | undefined): string => {
    if (!value) return '';
    return value
        .trim()                    // 移除前後空白
        .replace(/[\r\n]/g, '')    // 移除所有換行符號
        .replace(/\s+/g, '');      // 移除所有空白字符
};

// 硬編碼 bucket 名稱作為備用，但優先使用環境變數（清理後）
const storageBucket = cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    || 'xiyi-c4266.firebasestorage.app';

const firebaseConfig = {
    apiKey: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: storageBucket,
    messagingSenderId: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    measurementId: cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Fix: Use the bucket from config directly to avoid encoding issues
const storage = getStorage(app);

console.log('🔥 Firebase Initialized');
console.log('📦 Storage Bucket:', storageBucket);

export { db, storage };
