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

export type Category = '熱炒類' | '酥炸類' | '湯類' | '飯麵類' | '青菜類';
