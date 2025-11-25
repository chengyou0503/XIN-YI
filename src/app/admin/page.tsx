'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Order, MenuItem } from '@/types';
import { Plus, Edit, Trash2, Upload, Save, X, Utensils, LogOut, QrCode, CheckCircle, DollarSign, ChefHat } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { ImageUploadService } from '@/lib/imageUpload';
import { MENU_DATA } from '@/lib/menuData'; // Import local data for instant load
import { AdminAuthService } from '@/lib/adminAuth';
import { CATEGORIES } from '@/lib/mockData';
import styles from './admin.module.css';

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    // Use local MENU_DATA as initial state for instant load
    const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_DATA);
    const [activeTab, setActiveTab] = useState<'orders' | 'kitchen' | 'menu' | 'history'>('orders');
    const previousOrderCountRef = useRef(0);
    const isFirstLoad = useRef(true);
    const router = useRouter();

    // Menu Editing State
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Menu Management State
    // Start with false because we have local data
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('全部');

    const playNotificationSound = () => {
        console.log('🔔 嘗試播放通知音效...');

        // Try to play audio file
        const audio = new Audio('/alert.mp3');
        audio.volume = 0.7; // Set volume to 70%

        audio.play()
            .then(() => {
                console.log('✅ 音效播放成功');
            })
            .catch((error) => {
                console.warn('⚠️ 音效播放失敗:', error);
                // Fallback to system beep or speech
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance('有新訂單，請注意');
                    utterance.lang = 'zh-TW';
                    utterance.rate = 1.2;
                    window.speechSynthesis.speak(utterance);
                    console.log('🔊 使用語音替代通知');
                }
            });
    };

    const testNotificationSound = () => {
        console.log('🧪 測試音效播放');
        playNotificationSound();
    };

    // No longer needed - using real-time subscriptions

    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        // Check authentication first (must be client-side)
        if (typeof window !== 'undefined') {
            if (!AdminAuthService.isAuthenticated()) {
                router.push('/admin/login');
                return;
            }
            setIsAuthLoading(false);
        }

        console.log('🔥 設定 Firestore 即時監聽...');

        // Ensure menu is initialized if empty
        StorageService.getMenu().then((items) => {
            if (items.length === 0) {
                console.log('⚠️ Menu is empty, attempting to initialize...');
                StorageService.initializeMenu();
            }
        });

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
            // Only update if we actually got data from Firebase
            if (newMenu && newMenu.length > 0) {
                console.log(`📋 Firebase 菜單同步完成，更新 ${newMenu.length} 項`);
                setMenuItems(newMenu);
            }
            setIsLoadingMenu(false);
        });

        return () => {
            console.log('🔌 取消 Firestore 監聽');
            unsubscribeOrders();
            unsubscribeMenu();
        };
    }, [router]);

    if (isAuthLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8f9fa',
                color: '#666',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className={styles.spinner}></div>
                <p>正在驗證權限...</p>
            </div>
        );
    }

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
            category: '熱炒類',
            imageUrl: '/placeholder.jpg',
            description: '',
            available: true
        });
        setIsAddingNew(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingItem) return;

        try {
            // Validate image
            ImageUploadService.validateImage(file);

            setIsUploading(true);

            // Upload to Firebase Storage
            const imagePath = `menu-items/${editingItem.id}-${Date.now()}`;
            const imageUrl = await ImageUploadService.uploadImage(file, imagePath);

            // Update editing item with new image URL
            setEditingItem({
                ...editingItem,
                imageUrl,
            });

            console.log('✅ 圖片上傳成功:', imageUrl);
        } catch (error) {
            console.error('圖片上傳失敗:', error);
            alert(error instanceof Error ? error.message : '圖片上傳失敗');
        } finally {
            setIsUploading(false);
        }
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

    const handleLogout = () => {
        if (confirm('確定要登出嗎？')) {
            AdminAuthService.logout();
            router.push('/admin/login');
        }
    };

    const handleBatchImport = async () => {
        if (!confirm('確定要匯入完整菜單嗎？\n\n這將會：\n1. 導入 104 個菜單項目\n2. 使用新易現炒店的完整菜單\n3. 可能覆蓋現有同名品項\n\n建議先備份現有菜單！')) {
            return;
        }

        try {
            setIsLoadingMenu(true);
            // 動態導入菜單資料
            const { MENU_DATA } = await import('@/lib/menuData');

            // 批量保存所有菜單
            await StorageService.saveMenu(MENU_DATA);

            alert(`✅ 成功匯入 ${MENU_DATA.length} 個菜單項目！\n\n包含：\n- 鐵板類\n- 燴飯類\n- 現炒類\n- 三杯類\n- 炒飯類\n- 湯麵類\n- 湯類\n- 蔬菜類\n- 飲料類`);

            // 刷新菜單列表（Firestore 即時監聽會自動更新）
        } catch (error) {
            console.error('批量匯入失敗:', error);
            alert('❌ 批量匯入失敗，請查看 Console');
        } finally {
            setIsLoadingMenu(false);
        }
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
                    <button
                        className={styles.qrBtn}
                        onClick={handleLogout}
                        title="登出"
                        style={{ backgroundColor: '#e74c3c' }}
                    >
                        <LogOut size={20} />
                        <span>登出</span>
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
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className={styles.name}>{item.name}</span>
                                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                    <small style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
                                                        {item.selectedOptions.map(o => o.name).join(', ')}
                                                    </small>
                                                )}
                                            </div>
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

                        {/* Category Filter */}
                        <div className={styles.categoryFilter}>
                            <button
                                className={`${styles.filterBtn} ${selectedCategory === '全部' ? styles.active : ''}`}
                                onClick={() => setSelectedCategory('全部')}
                            >
                                全部 ({menuItems.length})
                            </button>
                            {CATEGORIES.map(cat => {
                                const count = menuItems.filter(item => item.category === cat).length;
                                return (
                                    <button
                                        key={cat}
                                        className={`${styles.filterBtn} ${selectedCategory === cat ? styles.active : ''}`}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            const element = document.getElementById(`category-${cat}`);
                                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                    >
                                        {cat} ({count})
                                    </button>
                                );
                            })}
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
                                            類別
                                            <select
                                                value={editingItem.category}
                                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                                                required
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label>
                                            圖片
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {editingItem.imageUrl && editingItem.imageUrl !== '/placeholder.jpg' && (
                                                    <img
                                                        src={editingItem.imageUrl}
                                                        alt="預覽"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                                        onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.jpg'}
                                                    />
                                                )}
                                                <label htmlFor="image-upload" style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: isUploading ? '#bdc3c7' : '#3498db',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <Upload size={16} />
                                                    {isUploading ? '上傳中...' : '上傳圖片'}
                                                </label>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                                                支援 JPG, PNG, WebP, GIF。檔案大小不超過 5MB
                                            </small>
                                        </label>

                                        <div className={styles.optionsSection}>
                                            <h4>客製化選項</h4>
                                            <div className={styles.optionsList}>
                                                {editingItem.options?.map((option, idx) => (
                                                    <div key={idx} className={styles.optionItem}>
                                                        <input
                                                            type="text"
                                                            placeholder="選項名稱 (如: 加飯)"
                                                            value={option.name}
                                                            onChange={(e) => {
                                                                const newOptions = [...(editingItem.options || [])];
                                                                newOptions[idx].name = e.target.value;
                                                                setEditingItem({ ...editingItem, options: newOptions });
                                                            }}
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="價格"
                                                            value={option.price}
                                                            onChange={(e) => {
                                                                const newOptions = [...(editingItem.options || [])];
                                                                newOptions[idx].price = Number(e.target.value);
                                                                setEditingItem({ ...editingItem, options: newOptions });
                                                            }}
                                                            style={{ width: '80px' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = editingItem.options?.filter((_, i) => i !== idx);
                                                                setEditingItem({ ...editingItem, options: newOptions });
                                                            }}
                                                            className={styles.removeOptionBtn}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.addOptionBtn}
                                                onClick={() => {
                                                    const newOptions = [...(editingItem.options || []), { name: '', price: 0 }];
                                                    setEditingItem({ ...editingItem, options: newOptions });
                                                }}
                                            >
                                                <Plus size={16} /> 新增選項
                                            </button>
                                        </div>

                                        <div className={styles.modalActions}>
                                            <button type="button" onClick={() => { setEditingItem(null); setIsAddingNew(false); }} className={styles.cancelBtn}>
                                                取消
                                            </button>
                                            <button type="submit" className={styles.saveBtn} disabled={isUploading}>
                                                <Save size={18} /> 儲存
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {isLoadingMenu ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>載入菜單中...</p>
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className={styles.emptyMenu}>
                                <Utensils size={48} color="#bdc3c7" />
                                <p>目前沒有菜單項目</p>
                                <button className={styles.addBtn} onClick={startAdd}>
                                    <Plus size={18} /> 新增餐點
                                </button>
                            </div>
                        ) : (
                            <div className={styles.menuList}>
                                {CATEGORIES.map(category => {
                                    const itemsInCategory = menuItems.filter(item => item.category === category);
                                    if (itemsInCategory.length === 0) return null;
                                    if (selectedCategory !== '全部' && selectedCategory !== category) return null;

                                    return (
                                        <div key={category} id={`category-${category}`} style={{ gridColumn: '1 / -1', scrollMarginTop: '100px' }}>
                                            <h3 style={{
                                                fontSize: '1.3rem',
                                                color: '#2d3436',
                                                marginBottom: '1rem',
                                                marginTop: '2rem',
                                                paddingBottom: '0.5rem',
                                                borderBottom: '3px solid #ff7675',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Utensils size={20} />
                                                {category} ({itemsInCategory.length} 項)
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                                gap: '1.5rem',
                                                marginTop: '1rem'
                                            }}>
                                                {itemsInCategory.map(item => (
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
                                    );
                                })}
                            </div>
                        )}
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
