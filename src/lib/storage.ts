import { MenuItem, Order, CartItem } from '../types';
import { MOCK_MENU } from './mockData';

const STORAGE_KEYS = {
    MENU: 'stir_fry_menu',
    ORDERS: 'stir_fry_orders',
};

export class StorageService {
    // Menu Methods
    static getMenu(): MenuItem[] {
        if (typeof window === 'undefined') return MOCK_MENU;

        const stored = localStorage.getItem(STORAGE_KEYS.MENU);
        if (!stored) {
            // Initialize with mock data if empty
            this.saveMenu(MOCK_MENU);
            return MOCK_MENU;
        }
        return JSON.parse(stored);
    }

    static saveMenu(menu: MenuItem[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
        this.notifyChange();
    }

    // Order Methods
    static getOrders(): Order[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (!stored) return [];

        // Need to convert date strings back to Date objects
        const orders = JSON.parse(stored);
        return orders.map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt)
        }));
    }

    static saveOrder(order: Order) {
        if (typeof window === 'undefined') return;

        const orders = this.getOrders();
        const existingIndex = orders.findIndex(o => o.id === order.id);

        if (existingIndex >= 0) {
            orders[existingIndex] = order;
        } else {
            orders.push(order);
        }

        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.notifyChange();
    }

    static createOrder(tableId: string, items: CartItem[]): Order {
        const newOrder: Order = {
            id: Date.now().toString(),
            tableId,
            items,
            status: 'pending',
            totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            createdAt: new Date(),
        };

        this.saveOrder(newOrder);
        return newOrder;
    }

    static updateOrderStatus(orderId: string, status: Order['status']) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.saveOrder(order);
        }
    }

    static clearOrders() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        this.notifyChange();
    }

    static deleteOrder(orderId: string) {
        if (typeof window === 'undefined') return;
        const orders = this.getOrders();
        const newOrders = orders.filter(o => o.id !== orderId);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
        this.notifyChange();
    }

    // Event for cross-tab synchronization
    private static notifyChange() {
        // Dispatch a custom event for the current tab
        window.dispatchEvent(new Event('storage-update'));

        // localStorage setItem already triggers 'storage' event in OTHER tabs
    }
}
