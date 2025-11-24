'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MenuItem, Order, CartItem } from '@/types';
import { MOCK_MENU } from '@/lib/mockData';

interface SystemSettings {
    announcement: string;
    isAnnouncementActive: boolean;
}

interface StoreContextType {
    menu: MenuItem[];
    orders: Order[];
    settings: SystemSettings;
    // Actions
    addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
    updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
    deleteMenuItem: (id: string) => void;
    placeOrder: (tableId: string, items: CartItem[], totalAmount: number) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    updateSettings: (settings: Partial<SystemSettings>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    // Initialize with Mock Data
    const [menu, setMenu] = useState<MenuItem[]>(MOCK_MENU);
    const [orders, setOrders] = useState<Order[]>([]);
    const [settings, setSettings] = useState<SystemSettings>({
        announcement: '歡迎光臨！今日特餐：宮保雞丁',
        isAnnouncementActive: true,
    });

    // Load initial orders (Mock)
    useEffect(() => {
        setOrders([
            {
                id: 'ord_1',
                tableId: '1',
                items: [
                    { id: '1', name: '宮保雞丁', price: 180, quantity: 1, category: '熱炒類', imageUrl: '', available: true },
                ],
                status: 'cooking',
                totalAmount: 180,
                createdAt: new Date(),
            }
        ]);
    }, []);

    const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
        const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
        setMenu(prev => [...prev, newItem]);
    };

    const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
        setMenu(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteMenuItem = (id: string) => {
        setMenu(prev => prev.filter(item => item.id !== id));
    };

    const placeOrder = (tableId: string, items: CartItem[], totalAmount: number) => {
        const newOrder: Order = {
            id: `ord_${Math.random().toString(36).substr(2, 9)}`,
            tableId,
            items,
            status: 'pending',
            totalAmount,
            createdAt: new Date(),
        };
        setOrders(prev => [...prev, newOrder]);

        // Play sound effect (Simple beep or alert logic can be handled here or in UI)
        // For now, we just update state. The Admin UI will listen to changes.
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const updateSettings = (newSettings: Partial<SystemSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <StoreContext.Provider value={{
            menu,
            orders,
            settings,
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
            placeOrder,
            updateOrderStatus,
            updateSettings,
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
