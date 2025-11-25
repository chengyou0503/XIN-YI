'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockData';
import { MenuItem, CartItem, Category, MenuOption } from '@/types';
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
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Options Modal State
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

    const [isSuccess, setIsSuccess] = useState(false);
    const [showFriendInvite, setShowFriendInvite] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load menu from Firestore
        const loadMenu = async () => {
            try {
                console.log('📋 開始載入菜單...');
                const items = await StorageService.getMenu();
                console.log('📋 菜單載入完成，項目數量:', items.length);

                if (items && items.length > 0) {
                    setMenuItems(items);
                } else {
                    console.warn('⚠️ 菜單資料為空，使用預設資料');
                    // 如果 Firestore 沒有資料，使用本地預設資料
                    setMenuItems(MENU_DATA);
                }
            } catch (err) {
                console.error('❌ 載入菜單失敗:', err);
                // 載入失敗時使用預設資料
                setMenuItems(MENU_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        loadMenu();
    }, []);

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

    // Check friend status and show invite modal
    useEffect(() => {
        if (user && !isFriend) {
            // Show friend invite modal after a short delay
            const timer = setTimeout(() => {
                setShowFriendInvite(true);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setShowFriendInvite(false);
        }
    }, [user, isFriend]);

    const filteredItems = menuItems.filter(item => item.category === activeCategory);

    const handleOpenOfficialAccount = () => {
        // Open LINE Official Account to add friend
        if (typeof window !== 'undefined' && (window as any).liff) {
            // You need to replace this with your actual LINE Official Account URL
            // Format: https://line.me/R/ti/p/@your_line_id
            const officialAccountUrl = 'https://line.me/R/ti/p/@your_line_id';
            (window as any).liff.openWindow({
                url: officialAccountUrl,
                external: true
            });
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
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                        onClick={() => setActiveCategory(cat as Category)}
                    >
                        {cat}
                    </button>
                ))}
            </nav>

            {!user && (
                <div className={styles.linePromo}>
                    <div className={styles.lineIcon}>LINE</div>
                    <div className={styles.lineText}>
                        <strong>加入會員享優惠</strong>
                        <span>累積點數換好禮</span>
                    </div>
                    <button className={styles.lineBtn} onClick={login}>
                        立即登入
                    </button>
                </div>
            )}

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
                            <button
                                className={styles.addBtn}
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
                            >
                                <Plus size={20} />
                                加入
                            </button>
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
