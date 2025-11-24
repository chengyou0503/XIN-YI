export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl: string;
    available: boolean;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    id: string;
    tableId: string;
    items: CartItem[];
    status: 'pending' | 'cooking' | 'served' | 'paid';
    totalAmount: number;
    createdAt: Date;
}

export type Category = '鐵板類' | '燴飯類' | '現炒類' | '三杯類' | '炒飯類' | '湯麵類' | '湯類' | '蔬菜類' | '飲料類';
