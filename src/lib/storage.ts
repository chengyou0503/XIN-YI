import { MenuItem, Order, CartItem, CategoryItem } from '../types';
import { MOCK_MENU } from './mockData';
import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

const COLLECTIONS = {
    MENU: 'menu',
    ORDERS: 'orders',
    CATEGORIES: 'categories',
};

type OrdersCallback = (orders: Order[]) => void;
type MenuCallback = (menu: MenuItem[]) => void;
type CategoriesCallback = (categories: CategoryItem[]) => void;

export class StorageService {
    private static ordersUnsubscribe: (() => void) | null = null;
    private static menuUnsubscribe: (() => void) | null = null;
    private static categoriesUnsubscribe: (() => void) | null = null;

    // Menu Methods
    static async getMenu(): Promise<MenuItem[]> {
        try {
            const menuCol = collection(db, COLLECTIONS.MENU);
            const menuSnapshot = await getDocs(menuCol);

            if (menuSnapshot.empty) {
                console.log('📋 菜單為空，自動載入預設菜單...');
                // Initialize with mock data if empty
                await this.initializeMenu();
                // 再次查詢以獲取剛初始化的資料
                const newSnapshot = await getDocs(menuCol);
                return newSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as MenuItem[];
            }

            return menuSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as MenuItem[];
        } catch (error) {
            console.error('Error getting menu:', error);
            // 發生錯誤時返回空陣列，避免顯示 MOCK_MENU 造成混淆
            return [];
        }
    }

    static async initializeMenu(): Promise<void> {
        try {
            // 動態導入以避免循環依賴
            const { MENU_DATA } = await import('./menuData');
            console.log('📝 開始自動初始化菜單，共', MENU_DATA.length, '項...');
            await this.saveMenu(MENU_DATA);
            console.log('✅ 菜單初始化完成！');
        } catch (error) {
            console.error('❌ 菜單初始化失敗:', error);
            throw error;
        }
    }

    static async saveMenu(menu: MenuItem[]) {
        try {
            console.log('\n========== 🔥 Firestore 儲存菜單 ==========');
            console.log('📊 總共要儲存的餐點數:', menu.length);

            // 記錄每個要儲存的餐點（只記錄前 5 個避免過多輸出）
            menu.slice(0, 5).forEach((item, index) => {
                console.log(`📝 餐點 ${index + 1}:`, {
                    id: item.id,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    price: item.price,
                    category: item.category
                });
            });
            if (menu.length > 5) {
                console.log(`... 還有 ${menu.length - 5} 個餐點`);
            }

            const batch = menu.map(item => {
                console.log(`💾 儲存餐點 ID: ${item.id}, 圖片: ${item.imageUrl}`);
                return setDoc(doc(db, COLLECTIONS.MENU, item.id), item);
            });

            await Promise.all(batch);
            console.log('✅ 所有餐點已成功寫入 Firestore');
            console.log('========== ✅ Firestore 儲存完成 ==========\n');
        } catch (error) {
            console.error('❌ Firestore 儲存菜單失敗:', error);
            throw error;
        }
    }

    static subscribeToMenu(callback: MenuCallback) {
        const q = query(collection(db, COLLECTIONS.MENU));
        this.menuUnsubscribe = onSnapshot(q, (snapshot) => {
            console.log('\n========== 🔔 Firestore 菜單即時更新 ==========');
            console.log('📊 從 Firestore 收到的餐點數:', snapshot.docs.length);

            const menu = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id
                } as MenuItem;
            });

            // 記錄前 5 個餐點的圖片 URL（用於驗證）
            menu.slice(0, 5).forEach((item, index) => {
                console.log(`📝 餐點 ${index + 1}: ${item.name}, 圖片: ${item.imageUrl}`);
            });
            if (menu.length > 5) {
                console.log(`... 還有 ${menu.length - 5} 個餐點`);
            }

            console.log('✅ 菜單資料已傳遞給回調函數');
            console.log('========== ✅ 即時更新完成 ==========\n');

            callback(menu);
        });
        return this.menuUnsubscribe;
    }

    static unsubscribeFromMenu() {
        if (this.menuUnsubscribe) {
            this.menuUnsubscribe();
            this.menuUnsubscribe = null;
        }
    }

    // Order Methods
    static async getOrders(): Promise<Order[]> {
        try {
            const ordersCol = collection(db, COLLECTIONS.ORDERS);
            const q = query(ordersCol, orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(q);

            return ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate()
                        : new Date(data.createdAt)
                } as Order;
            });
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }

    static async saveOrder(order: Order) {
        try {
            const orderDoc = doc(db, COLLECTIONS.ORDERS, order.id);
            await setDoc(orderDoc, {
                ...order,
                createdAt: order.createdAt instanceof Date
                    ? Timestamp.fromDate(order.createdAt)
                    : order.createdAt
            });
        } catch (error) {
            console.error('Error saving order:', error);
        }
    }

    static async createOrder(tableId: string, items: CartItem[]): Promise<Order> {
        const newOrder: Order = {
            id: Date.now().toString(),
            tableId,
            items,
            status: 'pending',
            totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            createdAt: new Date(),
        };

        await this.saveOrder(newOrder);
        return newOrder;
    }

    static async updateOrderStatus(orderId: string, status: Order['status']) {
        try {
            const orderDoc = doc(db, COLLECTIONS.ORDERS, orderId);
            await updateDoc(orderDoc, { status });
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    static async deleteOrder(orderId: string) {
        try {
            await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    }

    static async clearOrders() {
        try {
            const ordersSnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
            const deletePromises = ordersSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error clearing orders:', error);
        }
    }

    // Real-time subscription for orders
    static subscribeToOrders(callback: OrdersCallback) {
        const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));

        this.ordersUnsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate()
                        : new Date(data.createdAt)
                } as Order;
            });
            callback(orders);
        });

        return this.ordersUnsubscribe;
    }

    static unsubscribeFromOrders() {
        if (this.ordersUnsubscribe) {
            this.ordersUnsubscribe();
            this.ordersUnsubscribe = null;
        }
    }

    // Category Methods
    static async getCategories(): Promise<CategoryItem[]> {
        try {
            const categoriesCol = collection(db, COLLECTIONS.CATEGORIES);
            const q = query(categoriesCol, orderBy('displayOrder', 'asc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('📂 分類為空，自動初始化預設分類...');
                await this.initializeCategories();
                const newSnapshot = await getDocs(q);
                return newSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    createdAt: doc.data().createdAt instanceof Timestamp
                        ? doc.data().createdAt.toDate()
                        : new Date(doc.data().createdAt)
                })) as CategoryItem[];
            }

            return snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt instanceof Timestamp
                    ? doc.data().createdAt.toDate()
                    : new Date(doc.data().createdAt)
            })) as CategoryItem[];
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    static async initializeCategories(): Promise<void> {
        try {
            const { CATEGORIES } = await import('./mockData');
            console.log('📝 開始初始化分類，共', CATEGORIES.length, '個...');

            const batch = CATEGORIES.map((name, index) => {
                const category: CategoryItem = {
                    id: `cat-${Date.now()}-${index}`,
                    name,
                    displayOrder: index,
                    createdAt: new Date(),
                };
                return setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), {
                    ...category,
                    createdAt: Timestamp.fromDate(category.createdAt)
                });
            });

            await Promise.all(batch);
            console.log('✅ 分類初始化完成！');
        } catch (error) {
            console.error('❌ 分類初始化失敗:', error);
            throw error;
        }
    }

    static async saveCategory(category: CategoryItem): Promise<void> {
        try {
            await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), {
                ...category,
                createdAt: category.createdAt instanceof Date
                    ? Timestamp.fromDate(category.createdAt)
                    : category.createdAt
            });
        } catch (error) {
            console.error('Error saving category:', error);
            throw error;
        }
    }

    static async deleteCategory(categoryId: string): Promise<void> {
        try {
            // Check if any menu items use this category
            const menuItems = await this.getMenu();
            const category = (await getDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId))).data() as CategoryItem;
            const usageCount = menuItems.filter(item => item.category === category?.name).length;

            if (usageCount > 0) {
                throw new Error(`此分類正被 ${usageCount} 個菜單項目使用，無法刪除`);
            }

            await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    static subscribeToCategories(callback: CategoriesCallback) {
        const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('displayOrder', 'asc'));

        this.categoriesUnsubscribe = onSnapshot(q, (snapshot) => {
            const categories = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt instanceof Timestamp
                    ? doc.data().createdAt.toDate()
                    : new Date(doc.data().createdAt)
            })) as CategoryItem[];
            callback(categories);
        });

        return this.categoriesUnsubscribe;
    }

    static unsubscribeFromCategories() {
        if (this.categoriesUnsubscribe) {
            this.categoriesUnsubscribe();
            this.categoriesUnsubscribe = null;
        }
    }
}
