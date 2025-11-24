'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Order, MenuItem } from '@/types';
import { CheckCircle, DollarSign, ChefHat, RefreshCw, Trash2, Utensils, Edit, Plus, X, Save, QrCode } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import styles from './admin.module.css';

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'kitchen' | 'menu' | 'history'>('orders');
    const previousOrderCountRef = useRef(0);
    const isFirstLoad = useRef(true);
    const router = useRouter();

    // Menu Editing State
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const playNotificationSound = () => {
        console.log('🔔 嘗試播放通知音效...');
        const audio = new Audio('/alert.mp3');
        audio.play()
            .then(() => {
                console.log('✅ 音效播放成功');
            })
            .catch((error) => {
                console.warn('⚠️ 音效播放失敗，使用語音替代:', error);
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance('有新訂單，請注意');
                    utterance.lang = 'zh-TW';
                    window.speechSynthesis.speak(utterance);
                }
            });
    };

    // No longer needed - using real-time subscriptions

    useEffect(() => {
        console.log('🔥 設定 Firestore 即時監聽...');

        // Subscribe to real-time orders updates
        const unsubscribeOrders = StorageService.subscribeToOrders((newOrders) => {
            console.log(`📦 收到訂單更新，共 ${newOrders.length} 筆訂單`);

            setOrders(newOrders);

            // Play notification sound for new orders
            if (!isFirstLoad.current && newOrders.length > previousOrderCountRef.current) {
                console.log('🆕 偵測到新訂單！');
                playNotificationSound();
            }

            previousOrderCountRef.current = newOrders.length;
            isFirstLoad.current = false;
        });

        // Subscribe to real-time menu updates
        const unsubscribeMenu = StorageService.subscribeToMenu((newMenu) => {
            console.log(`📋 收到菜單更新，共 ${newMenu.length} 項`);
            setMenuItems(newMenu);
        });

        return () => {
            console.log('🔌 取消 Firestore 監聽');
            unsubscribeOrders();
            unsubscribeMenu();
        };
    }, []);

    const updateStatus = async (orderId: string, status: Order['status']) => {
        await StorageService.updateOrderStatus(orderId, status);
    };

    const handleClearOrders = () => {
        if (confirm('確定要清除所有訂單嗎？此操作無法復原。')) {
            StorageService.clearOrders();
            previousOrderCountRef.current = 0;
            isFirstLoad.current = true;
        }
    };

    // Menu Management Functions
    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const updatedMenu = menuItems.map(m => m.id === editingItem.id ? editingItem : m);
        if (isAddingNew && !menuItems.find(m => m.id === editingItem.id)) {
            updatedMenu.push(editingItem);
        }
        setMenuItems(updatedMenu);
        await StorageService.saveMenu(updatedMenu);
        setEditingItem(null);
        setIsAddingNew(false);
    };

    const handleDeleteItem = async (id: string) => {
        if (confirm('確定要刪除此餐點嗎？')) {
            const updatedMenu = menuItems.filter(item => item.id !== id);
            setMenuItems(updatedMenu);
            await StorageService.saveMenu(updatedMenu);
        }
    };

    const startEdit = (item: MenuItem) => {
        setEditingItem({ ...item });
        setIsAddingNew(false);
    };

    const startAdd = () => {
        setEditingItem({
            id: Date.now().toString(),
            name: '',
            price: 0,
            category: 'stir-fry',
            imageUrl: '/placeholder.jpg',
            description: '',
            available: true
        });
        setIsAddingNew(true);
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return '#9E9E9E'; // Grey
            case 'cooking': return '#FF5722'; // Orange
            case 'served': return '#4CAF50'; // Green
            default: return '#333';
        }
    };

    const getStatusLabel = (status: Order['status']) => {
        switch (status) {
            case 'pending': return '等待中';
            case 'cooking': return '製作中';
            case 'served': return '已完成';
            default: return status;
        }
    };

    const handleDeleteItemFromOrder = async (order: Order, itemIndex: number) => {
        if (!confirm(`確定要刪除 ${order.items[itemIndex].name} 嗎？`)) return;

        const newItems = [...order.items];
        newItems.splice(itemIndex, 1);

        if (newItems.length === 0) {
            // If no items left, ask to delete the order
            if (confirm('此訂單已無品項，是否刪除整筆訂單？')) {
                await StorageService.deleteOrder(order.id);
            }
            return;
        }

        // Recalculate total
        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const updatedOrder: Order = {
            ...order,
            items: newItems,
            totalAmount: newTotal,
        };

        await StorageService.saveOrder(updatedOrder);
    };

    const handleDeleteHistoryOrder = async (orderId: string) => {
        if (!confirm('確定要刪除此筆歷史訂單紀錄嗎？')) return;
        await StorageService.deleteOrder(orderId);
    };

    // Filter orders for active view (exclude served/history)
    const activeOrders = orders.filter(o => o.status !== 'served');

    // Filter orders for history view
    const historyOrders = orders.filter(o => o.status === 'served');

    // Calculate total revenue from history orders
    const totalRevenue = historyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayRevenue = historyOrders
        .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <ChefHat size={32} color="#2d3436" />
                    新易現炒管理系統
                </h1>
                <div className={styles.headerActions}>
                    <button
                        className={styles.qrBtn}
                        onClick={() => router.push('/admin/qr')}
                        title="QR Code 產生器"
                    >
                        <QrCode size={20} />
                        <span>QR Code</span>
                    </button>
                </div>
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        訂單管理
                    </button>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'kitchen' ? styles.active : ''}`}
                        onClick={() => setActiveTab('kitchen')}
                    >
                        廚房看板
                    </button>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'menu' ? styles.active : ''}`}
                        onClick={() => setActiveTab('menu')}
                    >
                        菜單管理
                    </button>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        歷史帳務
                    </button>
                    <button
                        className={styles.navBtn}
                        onClick={handleClearOrders}
                        style={{ marginLeft: 'auto', color: '#ff7675', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Trash2 size={18} /> 清除訂單
                    </button>
                </nav>
            </header>

            <main className={styles.main}>
                {activeTab === 'orders' && (
                    <div className={styles.ordersGrid}>
                        {activeOrders.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '2rem' }}>目前沒有進行中的訂單</p>}
                        {activeOrders.map((order, index) => (
                            <div
                                key={order.id}
                                className={styles.orderCard}
                                style={{
                                    borderLeftColor: getStatusColor(order.status),
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.tableId}>桌號 {order.tableId}</span>
                                    <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(order.status) }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className={styles.itemsList}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className={styles.orderItem}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className={styles.itemQty}>{item.quantity}x</span>
                                                {item.name}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>${item.price * item.quantity}</span>
                                                <button
                                                    onClick={() => handleDeleteItemFromOrder(order, idx)}
                                                    style={{ border: 'none', background: 'none', color: '#ff7675', cursor: 'pointer', padding: '4px' }}
                                                    title="刪除此項"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.total}>總計: ${order.totalAmount}</div>
                                    <div className={styles.actions}>
                                        {order.status === 'pending' && (
                                            <button className={styles.actionBtn} onClick={() => updateStatus(order.id, 'cooking')}>
                                                <DollarSign size={18} /> 結帳
                                            </button>
                                        )}
                                        {order.status === 'cooking' && (
                                            <button className={styles.actionBtn} onClick={() => updateStatus(order.id, 'served')}>
                                                <CheckCircle size={18} /> 上菜
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'kitchen' && (
                    <div className={styles.kitchenView}>
                        {activeOrders.filter(o => o.status === 'cooking').length === 0 && (
                            <p style={{ width: '100%', textAlign: 'center', color: '#999', padding: '2rem' }}>廚房目前空閒中</p>
                        )}
                        {activeOrders.filter(o => o.status === 'cooking').map(order => (
                            <div key={order.id} className={styles.kitchenTicket}>
                                <div className={styles.ticketHeader}>
                                    <span>桌號 {order.tableId}</span>
                                    <span className={styles.time}>
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <ul className={styles.ticketItems}>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            <span className={styles.qty}>{item.quantity}</span>
                                            <span className={styles.name}>{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={styles.cookBtn} onClick={() => updateStatus(order.id, 'served')}>
                                    <CheckCircle size={20} /> 完成上菜
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className={styles.menuManagement}>
                        <div className={styles.menuHeader}>
                            <h2>菜單管理</h2>
                            <button className={styles.addBtn} onClick={startAdd}>
                                <Plus size={18} /> 新增餐點
                            </button>
                        </div>

                        {editingItem && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modal}>
                                    <h3>{isAddingNew ? '新增餐點' : '編輯餐點'}</h3>
                                    <form onSubmit={handleSaveItem} className={styles.editForm}>
                                        <label>
                                            名稱:
                                            <input
                                                type="text"
                                                value={editingItem.name}
                                                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                                required
                                            />
                                        </label>
                                        <label>
                                            價格:
                                            <input
                                                type="number"
                                                value={editingItem.price}
                                                onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                                required
                                            />
                                        </label>
                                        <label>
                                            分類:
                                            <select
                                                value={editingItem.category}
                                                onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                                            >
                                                <option value="stir-fry">熱炒類</option>
                                                <option value="vegetable">青菜類</option>
                                                <option value="soup">湯類</option>
                                                <option value="rice">飯麵類</option>
                                                <option value="beverage">飲料</option>
                                            </select>
                                        </label>
                                        <label>
                                            圖片連結:
                                            <input
                                                type="text"
                                                value={editingItem.imageUrl}
                                                onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                            />
                                        </label>
                                        <div className={styles.formActions}>
                                            <button type="button" onClick={() => setEditingItem(null)} className={styles.cancelBtn}>取消</button>
                                            <button type="submit" className={styles.saveBtn}>儲存</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className={styles.menuList}>
                            {menuItems.map(item => (
                                <div key={item.id} className={styles.menuItemCard}>
                                    <img src={item.imageUrl} alt={item.name} className={styles.itemThumb} onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.jpg'} />
                                    <div className={styles.itemInfo}>
                                        <h4>{item.name}</h4>
                                        <p>${item.price}</p>
                                        <span className={styles.categoryTag}>{item.category}</span>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button onClick={() => startEdit(item)} className={styles.iconBtn} title="編輯">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id)} className={styles.iconBtn} style={{ color: '#ff7675' }} title="刪除">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className={styles.historyView}>
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <h3>今日營業額</h3>
                                <p className={styles.statValue}>${todayRevenue}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>總營業額</h3>
                                <p className={styles.statValue}>${totalRevenue}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>歷史訂單數</h3>
                                <p className={styles.statValue}>{historyOrders.length}</p>
                            </div>
                        </div>

                        <div className={styles.historyList}>
                            <h2>歷史訂單記錄</h2>
                            {historyOrders.length === 0 ? (
                                <p className={styles.emptyHistory}>暫無歷史訂單</p>
                            ) : (
                                <table className={styles.historyTable}>
                                    <thead>
                                        <tr>
                                            <th>時間</th>
                                            <th>桌號</th>
                                            <th>內容</th>
                                            <th>金額</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                                <td>{order.tableId}</td>
                                                <td>
                                                    {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                                                </td>
                                                <td>${order.totalAmount}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteHistoryOrder(order.id)}
                                                        style={{ border: 'none', background: 'none', color: '#ff7675', cursor: 'pointer' }}
                                                        title="刪除紀錄"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
