'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockData';
import { MenuItem, CartItem, Category, MenuOption, CategoryItem } from '@/types';
import { ShoppingCart, Plus, Minus, X, Utensils, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '@/lib/storage';
import { MENU_DATA } from '@/lib/menuData';
import styles from './menu.module.css';



function MenuPage() {
    const { user, login, isFriend } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    // Default category must be one of the defined Category types
    const [activeCategory, setActiveCategory] = useState<Category>('鐵板類');
    // 使用本地資料作為初始狀態，確保快速載入
    const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_DATA);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Options Modal State
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

    const [isSuccess, setIsSuccess] = useState(false);
    const [showFriendInvite, setShowFriendInvite] = useState(false);

    const [isLoading, setIsLoading] = useState(false); // 改為 false，因為已有預設資料

    // 動態分類狀態
    const [categories, setCategories] = useState<string[]>(['鐵板類', '燴飯類', '現炒類', '三杯類', '炒飯類', '湯麵類', '湯類', '蔬菜類', '飲料類']);

    // 輔助函數：計算購物車中該商品的數量
    const getItemQuantityInCart = (itemId: string): number => {
        return cart
            .filter(cartItem => cartItem.id === itemId)
            .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    };

    useEffect(() => {
        // 在背景載入 Firestore 菜單資料
        const loadMenu = async () => {
            try {
                console.log('📋 開始從 Firestore 載入菜單...');
                const items = await StorageService.getMenu();
                console.log('📋 Firestore 菜單載入完成，項目數量:', items.length);

                if (items && items.length > 0) {
                    setMenuItems(items);
                    console.log('✅ 已更新為 Firestore 菜單');
                } else {
                    console.log('ℹ️ Firestore 菜單為空，繼續使用預設資料');
                }
            } catch (err) {
                console.error('❌ 載入 Firestore 菜單失敗，使用預設資料:', err);
            }
        };

        // 延遲載入，避免阻塞 UI
        setTimeout(loadMenu, 100);

        // 訂閱分類更新
        const unsubscribeCategories = StorageService.subscribeToCategories((categoryItems) => {
            console.log('📂 分類更新，共', categoryItems.length, '個');
            const categoryNames = categoryItems.map(cat => cat.name);
            setCategories(categoryNames);

            // 如果當前分類不在新分類列表中，切換到第一個分類
            if (categoryNames.length > 0 && !categoryNames.includes(activeCategory)) {
                setActiveCategory(categoryNames[0]);
            }
        });

        return () => {
            unsubscribeCategories();
        };
    }, [activeCategory]);

    if (isLoading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #2d3436',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666' }}>載入中...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Check friend status and redirect to add friend page if needed
    useEffect(() => {
        const hasShownAddFriend = sessionStorage.getItem('hasShownAddFriend');

        if (user && !isFriend && !hasShownAddFriend) {
            // 標記已經顯示過，避免無限循環
            sessionStorage.setItem('hasShownAddFriend', 'true');

            // 直接重定向到 LINE 加好友頁面 (原生體驗)
            // TODO: 請將下方的 @YOUR_LINE_ID 替換成您的 LINE Official Account Basic ID
            // 格式範例: @123abcde
            // 可在 LINE Official Account Manager > 設定 > 帳號設定 中找到
            const lineOfficialAccountId = '@080pkuoh'; // 新易現炒 LINE 官方帳號
            const addFriendUrl = `https://line.me/R/ti/p/${lineOfficialAccountId}`;

            console.log('🔗 用戶尚未加好友，重定向至 LINE 加好友頁面:', addFriendUrl);

            // 直接重定向到 LINE 加好友頁面
            window.location.href = addFriendUrl;
        }
    }, [user, isFriend]);

    const filteredItems = menuItems.filter(item => item.category === activeCategory);

    const handleOpenOfficialAccount = () => {
        // 直接使用 LIFF 原生 API 開啟 LINE 加好友頁面
        if (typeof window !== 'undefined' && (window as any).liff) {
            const liff = (window as any).liff;

            // 方法 1: 使用 LIFF 的 openWindow 打開加好友頁面
            // 需要您的 LINE Official Account URL，格式: https://line.me/R/ti/p/@your_bot_id
            // 這個 ID 可以在 LINE Official Account Manager 找到

            // 取得當前 LIFF 的 Context 來獲取 LINE Official Account
            liff.getContext().then((context: any) => {
                console.log('LIFF Context:', context);
            });

            // 方法 2: 直接關閉 LIFF 視窗並提示用戶加好友（推薦）
            // 這會讓用戶回到 LINE 聊天畫面，然後可以手動加好友
            alert('請在 LINE 中搜尋「新易現炒」並加為好友，即可享受訂單通知服務！');

            // 關閉 LIFF 視窗
            liff.closeWindow();
        } else {
            // 如果不在 LIFF 環境（例如在瀏覽器中測試）
            alert('請在 LINE 應用程式中開啟此頁面');
        }
    };

    const addToCart = (item: MenuItem) => {
        if (item.options && item.options.length > 0) {
            setSelectedItem(item);
            setSelectedOptions([]);
            return;
        }

        addItemToCart(item, []);
    };

    const addItemToCart = (item: MenuItem, options: MenuOption[]) => {
        setCart(prev => {
            // Find existing item with exact same options
            const existing = prev.find(i =>
                i.id === item.id &&
                JSON.stringify(i.selectedOptions?.sort((a, b) => a.name.localeCompare(b.name))) ===
                JSON.stringify(options.sort((a, b) => a.name.localeCompare(b.name)))
            );

            if (existing) {
                return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, selectedOptions: options }];
        });
    };

    const handleConfirmOptions = () => {
        if (selectedItem) {
            addItemToCart(selectedItem, selectedOptions);
            setSelectedItem(null);
            setSelectedOptions([]);
        }
    };

    const toggleOption = (option: MenuOption) => {
        setSelectedOptions(prev => {
            const exists = prev.find(o => o.name === option.name);
            if (exists) {
                return prev.filter(o => o.name !== option.name);
            }
            return [...prev, option];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    const handleCheckout = async () => {
        if (!tableId) {
            alert('錯誤：找不到桌號');
            return;
        }

        // Check if user is friend
        if (!isFriend) {
            alert('⚠️ 請先加入 LINE 官方帳號好友才能點餐！\n\n這樣我們才能即時為您更新訂單狀態。');
            return;
        }

        // Save order
        const newOrder = StorageService.createOrder(tableId, cart);
        console.log('📦 訂單已建立:', newOrder);

        // Send LINE Notification if user is logged in
        if (user && user.id) {
            try {
                console.log('📤 正在發送 LINE 通知給使用者:', user.id);
                const response = await fetch('/api/line/push', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        order: newOrder,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('✅ LINE 通知發送成功:', result);
                } else {
                    console.error('❌ LINE 通知發送失敗:', result);
                }
            } catch (error) {
                console.error('❌ LINE 通知發送發生錯誤:', error);
            }
        } else {
            console.warn('⚠️ 使用者未登入或無 userId，跳過 LINE 通知');
        }

        setCart([]);
        setIsCartOpen(false);
        setIsSuccess(true);

        // Auto hide success message after 3 seconds
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    const totalAmount = cart.reduce((sum, item) => {
        const optionsPrice = item.selectedOptions?.reduce((optSum, opt) => optSum + opt.price, 0) || 0;
        return sum + (item.price + optionsPrice) * item.quantity;
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <h1 className={styles.title}>新易現炒</h1>
                    {tableId && (
                        <span className={styles.tableBadge}>
                            桌號 {tableId}
                        </span>
                    )}
                </div>
                <button className={styles.cartButton} onClick={() => setIsCartOpen(!isCartOpen)}>
                    <ShoppingCart size={20} />
                    {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                </button>
            </header>

            <nav className={styles.categoryNav}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                        onClick={() => setActiveCategory(cat as Category)}
                    >
                        {cat}
                    </button>
                ))}
            </nav>

            {/* 已移除 LINE 推廣橫幅，因為用戶在進入時就會被要求加入好友 */}

            <div className={`${styles.menuGrid} animate-fade-in`}>
                {filteredItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={styles.menuItem}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className={styles.imageWrapper}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                            {!item.available && <div className={styles.soldOutOverlay}>已售完</div>}
                        </div>
                        <div className={styles.itemContent}>
                            <div className={styles.itemHeader}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <span className={styles.itemPrice}>${item.price}</span>
                            </div>
                            <p className={styles.itemDesc}>{item.description}</p>

                            {/* 數量調整按鈕 */}
                            {getItemQuantityInCart(item.id) > 0 ? (
                                <div className={styles.quantityControl}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className={styles.quantityDisplay}>
                                        {getItemQuantityInCart(item.id)}
                                    </span>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => addToCart(item)}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className={styles.addBtn}
                                    onClick={() => addToCart(item)}
                                    disabled={!item.available}
                                >
                                    <Plus size={20} />
                                    加入
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Options Modal */}
            {selectedItem && (
                <div className={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setSelectedItem(null);
                        setSelectedOptions([]);
                    }
                }}>
                    <div className={styles.modal}>
                        <h3>{selectedItem.name} - 客製化選項</h3>
                        <div className={styles.optionsList}>
                            {selectedItem.options?.map((option, idx) => {
                                const isSelected = selectedOptions.some(o => o.name === option.name);
                                return (
                                    <div
                                        key={idx}
                                        className={`${styles.optionItem} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => toggleOption(option)}
                                    >
                                        <div className={styles.checkbox}>
                                            {isSelected && <Check size={16} color="white" />}
                                        </div>
                                        <span className={styles.optionName}>{option.name}</span>
                                        <span className={styles.optionPrice}>
                                            {option.price > 0 ? `+$${option.price}` : '免費'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setSelectedItem(null);
                                    setSelectedOptions([]);
                                }}
                            >
                                取消
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleConfirmOptions}
                            >
                                確認加入 (${selectedItem.price + selectedOptions.reduce((sum, opt) => sum + opt.price, 0)})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for Cart (Mobile Friendly) */}
            {totalItems > 0 && !isCartOpen && (
                <div className={styles.fabContainer}>
                    <button className={styles.fabButton} onClick={() => setIsCartOpen(true)}>
                        <span>購物車 ({totalItems})</span>
                        <span>${totalAmount}</span>
                    </button>
                </div>
            )}

            {isCartOpen && (
                <div className={styles.cartOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) setIsCartOpen(false);
                }}>
                    <div className={styles.cartContent}>
                        <div className={styles.cartHeader}>
                            <h2>購物車</h2>
                            <button onClick={() => setIsCartOpen(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>
                        {cart.length === 0 ? (
                            <p className={styles.emptyCart}>購物車是空的</p>
                        ) : (
                            <div className={styles.cartList}>
                                {cart.map(item => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.cartItemInfo}>
                                            <h4>{item.name}</h4>
                                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                <small className={styles.cartItemOptions}>
                                                    {item.selectedOptions.map(o => o.name).join(', ')}
                                                </small>
                                            )}
                                            <span>${item.price + (item.selectedOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0)}</span>
                                        </div>
                                        <div className={styles.quantityControls}>
                                            <button onClick={() => removeFromCart(item.id)}><Minus size={16} /></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => addToCart(item)}><Plus size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={styles.cartFooter}>
                            <div className={styles.total}>
                                <span>總計</span>
                                <span>${totalAmount}</span>
                            </div>
                            {!user ? (
                                <button className={styles.checkoutBtn} onClick={login}>
                                    請先登入 LINE 以點餐
                                </button>
                            ) : (
                                <button
                                    className={styles.checkoutBtn}
                                    disabled={cart.length === 0}
                                    onClick={handleCheckout}
                                >
                                    送出訂單
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isSuccess && (
                <div className={styles.successOverlay}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <Utensils size={40} />
                        </div>
                        <h3>訂單已送出！</h3>
                        <p>廚房正在為您準備餐點</p>
                        <button className={styles.successBtn} onClick={() => setIsSuccess(false)}>
                            好的
                        </button>
                    </div>
                </div>
            )}

            {/* Friend Invite Modal */}
            {showFriendInvite && (
                <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
                    <div className={styles.friendInviteCard}>
                        <div className={styles.friendInviteIcon}>
                            <div style={{ fontSize: '4rem' }}>🎁</div>
                        </div>
                        <h2 style={{ color: '#2d3436', marginBottom: '1rem' }}>歡迎光臨新易現炒！</h2>
                        <p style={{ color: '#636e72', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            請先<strong style={{ color: '#00b894' }}>加入我們的 LINE 官方帳號</strong>，<br />
                            即可享受即時訂單通知與會員優惠！
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                            <button
                                className={styles.secondaryBtn}
                                onClick={() => setShowFriendInvite(false)}
                                style={{ flex: 1, padding: '0.875rem', fontSize: '1rem' }}
                            >
                                稍後再說
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleOpenOfficialAccount}
                                style={{ flex: 2, padding: '0.875rem', fontSize: '1rem', fontWeight: 'bold' }}
                            >
                                立即加入好友 🎉
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MenuPageWrapper() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>載入中...</div>}>
            <MenuPage />
        </Suspense>
    );
}
