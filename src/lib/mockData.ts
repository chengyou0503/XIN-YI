import { MenuItem } from '../types';

export const MOCK_MENU: MenuItem[] = [
    {
        id: '1',
        name: '宮保雞丁',
        description: '香辣過癮，雞肉鮮嫩',
        price: 180,
        category: '熱炒類',
        imageUrl: 'https://placehold.co/400x300?text=Kung+Pao+Chicken',
        available: true,
    },
    {
        id: '2',
        name: '蔥爆牛肉',
        description: '蔥香濃郁，牛肉滑嫩',
        price: 200,
        category: '熱炒類',
        imageUrl: 'https://placehold.co/400x300?text=Green+Onion+Beef',
        available: true,
    },
    {
        id: '3',
        name: '鳳梨蝦球',
        description: '酸甜酥脆，大人小孩都愛',
        price: 250,
        category: '酥炸類',
        imageUrl: 'https://placehold.co/400x300?text=Pineapple+Shrimp',
        available: true,
    },
    {
        id: '4',
        name: '炒高麗菜',
        description: '清脆爽口，大火快炒',
        price: 100,
        category: '青菜類',
        imageUrl: 'https://placehold.co/400x300?text=Cabbage',
        available: true,
    },
    {
        id: '5',
        name: '蛤蜊湯',
        description: '鮮甜好喝，蛤蜊飽滿',
        price: 150,
        category: '湯類',
        imageUrl: 'https://placehold.co/400x300?text=Clam+Soup',
        available: true,
    },
    {
        id: '6',
        name: '肉絲炒飯',
        description: '粒粒分明，鑊氣十足',
        price: 80,
        category: '飯麵類',
        imageUrl: 'https://placehold.co/400x300?text=Fried+Rice',
        available: true,
    },
];

export const CATEGORIES = ['熱炒類', '酥炸類', '青菜類', '湯類', '飯麵類'];
