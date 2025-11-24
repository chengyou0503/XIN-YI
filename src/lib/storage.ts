import { MenuItem, Order, CartItem } from '../types';
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
};

type OrdersCallback = (orders: Order[]) => void;
type MenuCallback = (menu: MenuItem[]) => void;

export class StorageService {
    private static ordersUnsubscribe: (() => void) | null = null;
    private static menuUnsubscribe: (() => void) | null = null;

    // Menu Methods
    static async getMenu(): Promise<MenuItem[]> {
        try {
            const menuCol = collection(db, COLLECTIONS.MENU);
            const menuSnapshot = await getDocs(menuCol);

            if (menuSnapshot.empty) {
                // Initialize with mock data if empty
                await this.initializeMenu();
                return MOCK_MENU;
            }

            return menuSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as MenuItem[];
        } catch (error) {
            console.error('Error getting menu:', error);
            return MOCK_MENU;
        }
    }

    static async initializeMenu(): Promise<void> {
        try {
            console.log('📝 Initializing menu with', MOCK_MENU.length, 'items...');
            await this.saveMenu(MOCK_MENU);
            console.log('✅ Menu initialized successfully');
        } catch (error) {
            console.error('Error initializing menu:', error);
        }
    }

    static async saveMenu(menu: MenuItem[]) {
        try {
            const batch = menu.map(item =>
                setDoc(doc(db, COLLECTIONS.MENU, item.id), item)
            );
            await Promise.all(batch);
        } catch (error) {
            console.error('Error saving menu:', error);
        }
    }

    static subscribeToMenu(callback: MenuCallback) {
        const q = query(collection(db, COLLECTIONS.MENU));
        this.menuUnsubscribe = onSnapshot(q, (snapshot) => {
            const menu = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as MenuItem[];
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
}
