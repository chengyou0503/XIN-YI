export interface MenuOption {
    name: string;
    price: number;
}

export interface OptionGroup {
    id: string;
    name: string;
    type: 'radio' | 'checkbox';
    required: boolean;
    options: MenuOption[];
}

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl: string;
    available: boolean;
    options?: MenuOption[]; // Deprecated, keeping for backward compatibility
    optionGroups?: OptionGroup[];
}

export interface CartItem extends MenuItem {
    quantity: number;
    selectedOptions?: MenuOption[];
}

export interface Order {
    id: string;
    tableId: string;
    items: CartItem[];
    status: 'pending' | 'cooking' | 'served' | 'paid';
    totalAmount: number;
    createdAt: Date;
}

// 分類項目介面（用於 Firestore）
export interface CategoryItem {
    id: string;           // 分類唯一識別碼
    name: string;         // 分類名稱（如：鐵板類）
    displayOrder: number; // 顯示順序
    createdAt: Date;      // 建立時間
}

// 分類型別（動態字串，支援任意分類名稱）
export type Category = string;

// 公告介面
export interface Announcement {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
