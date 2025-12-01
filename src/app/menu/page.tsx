'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockData';
import { MenuItem, CartItem, Category, MenuOption, CategoryItem, Order, Announcement } from '@/types';
import { ShoppingCart, Plus, Minus, X, Utensils, Check, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '@/lib/storage';
import { MENU_DATA } from '@/lib/menuData';
import styles from './menu.module.css';
import OptionsModal from '@/components/OptionsModal';



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

    const [isSuccess, setIsSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [showFriendInvite, setShowFriendInvite] = useState(false);
    const [showOrderConfirm, setShowOrderConfirm] = useState(false);

    // ... (keep existing code)
    // ... (keep existing code)


    const [isLoading, setIsLoading] = useState(false); // 改為 false，因為已有預設資料

    // 動態分類狀態
    const [categories, setCategories] = useState<string[]>(['鐵板類', '燴飯類', '現炒類', '三杯類', '炒飯類', '湯麵類', '湯類', '蔬菜類', '飲料類']);

    // 公告狀態
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // 訂單送出中狀態

    // 輔助函數：計算購物車中該商品的數量
    const getItemQuantityInCart = (itemId: string): number => {
        return cart
            .filter(cartItem => cartItem.id === itemId)
            .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    };

    useEffect(() => {
        // 訂閱菜單即時更新
        console.log('📋 訂閱 Firestore 菜單即時更新...');
        const unsubscribeMenu = StorageService.subscribeToMenu((items) => {
            console.log('📋 收到菜單更新，項目數量:', items.length);

            if (items && items.length > 0) {
                setMenuItems(items);
                console.log('✅ 已更新為 Firestore 菜單（即時訂閱）');
            } else {
                console.log('⚠️ Firestore 菜單為空，保留本地預設資料');
            }
        });

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
            unsubscribeMenu();
            unsubscribeCategories();
        };
    }, [activeCategory]);

    // 訂閱公告
    useEffect(() => {
        const unsubscribe = StorageService.subscribeToAnnouncements((data) => {
            const active = data.find(a => a.isActive);
            setAnnouncement(active || null);
        });
        return () => unsubscribe();
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

    // Group items by category
    const itemsByCategory = categories.reduce((acc, category) => {
        acc[category] = menuItems.filter(item => item.category === category);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const sections = categories.map(cat => document.getElementById(`category-${cat}`));
            const scrollPosition = window.scrollY + 100; // Offset for header

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveCategory(categories[i]);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        const element = document.getElementById(`category-${category}`);
        if (element) {
            // Smooth scroll with offset adjustment
            const headerOffset = 80; // Adjust based on header + nav height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const handleOpenOfficialAccount = () => {
        // 使用 LIFF 原生 API 開啟 LINE 加好友頁面
        if (typeof window !== 'undefined' && (window as any).liff) {
            const liff = (window as any).liff;
            const lineOfficialAccountId = '@080pkuoh'; // 新易現炒 LINE 官方帳號
            const addFriendUrl = `https://line.me/R/ti/p/${lineOfficialAccountId}`;

            console.log('📱 引導用戶加入 LINE 好友:', addFriendUrl);

            // 在外部瀏覽器開啟加好友頁面
            // 用戶加完好友後會留在 LINE 中，可以重新掃描 QR Code
            liff.openWindow({
                url: addFriendUrl,
                external: true  // 在外部瀏覽器開啟
            });

            // 關閉彈窗，讓用戶可以繼續瀏覽菜單
            setShowFriendInvite(false);
        } else {
            // 如果不在 LIFF 環境（例如在瀏覽器中測試）
            alert('請在 LINE 應用程式中開啟此頁面');
        }
    };

    const addToCart = (item: MenuItem) => {
        // Check for options
        if ((item.optionGroups && item.optionGroups.length > 0) || (item.options && item.options.length > 0)) {
            setSelectedItem(item);
            return;
        }

        addItemToCart(item, []);
    };

    const handleConfirmAddWithOptions = (item: MenuItem, options: MenuOption[]) => {
        addItemToCart(item, options);
        setSelectedItem(null);
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

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    // 顯示確認對話框
    const requestCheckout = () => {
        if (!tableId) {
            alert('錯誤：找不到桌號');
            return;
        }
        setShowOrderConfirm(true);
    };

    // 確認送出訂單
    const confirmCheckout = async () => {
        if (!tableId) {
            alert('錯誤：找不到桌號');
            return;
        }

        // Check if already submitting
        if (isSubmitting) {
            return; // 防止重複點擊
        }

        // Check if user is friend
        if (!isFriend) {
            // Allow submission but show warning (or just log it for now to unblock user)
            // In production, we might want to be stricter, but for now let's allow it with a confirm
            if (!confirm('⚠️ 您尚未加入 LINE 官方帳號好友，這樣無法收到訂單通知喔！\n\n確定要繼續送出訂單嗎？')) {
                return;
            }
        }

        setIsSubmitting(true); // 開始送出

        console.log('\n========== 📝 開始送出訂單 ==========');
        console.log('🔢 桌號:', tableId);
        console.log('🛒 購物車品項:', cart.length);
        console.log('💰 訂單總金額:', cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
        console.log('👤 用戶登入狀態:', user ? '已登入' : '未登入');
        console.log('👤 User 物件:', user);
        console.log('🆔 User ID:', user?.id);
        console.log('👥 好友狀態:', isFriend ? '已加好友' : '未加好友');

        try {
            // Save order (使用 await 確保儲存完成)
            const newOrder = await StorageService.createOrder(tableId, cart);
            console.log('✅ 訂單已成功儲存至 Firestore');
            console.log('📦 訂單 ID:', newOrder.id);
            console.log('📋 訂單內容:', newOrder);

            // Send LINE Notification if user is logged in
            if (user && user.id) {
                try {
                    console.log('========== 📤 準備發送 LINE 通知 ==========');
                    console.log('👤 User ID:', user.id);
                    console.log('📦 Order ID:', newOrder.id);
                    console.log('💰 Total Amount:', newOrder.totalAmount);

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
                        console.error('❌ LINE 通知發送失敗:');
                        console.error('- HTTP Status:', response.status);
                        console.error('- 錯誤詳情:', result);
                    }
                } catch (error) {
                    console.error('❌ LINE 通知發送發生錯誤:');
                    console.error('- Error:', error);
                    console.error('- User ID 問題？請確認 LIFF 有正確回傳 userId');
                }
            } else {
                console.warn('========== ⚠️ 跳過 LINE 通知 ==========');
                console.warn('原因: 使用者未登入或無 userId');
                console.warn('User:', user);
                console.warn('User ID:', user?.id);
            }

            setCart([]);
            setIsCartOpen(false);
            setCompletedOrder(newOrder);
            setIsSuccess(true);
            console.log('========== ✅ 訂單流程完成 ==========\n');

            // 不自動關閉，讓客戶手動關閉確認畫面
            setShowOrderConfirm(false); // 關閉確認對話框
        } catch (error) {
            console.error('❌ 訂單送出失敗:', error);
            alert('訂單送出失敗，請重試或聯絡服務人員');
            setShowOrderConfirm(false);
        } finally {
            setIsSubmitting(false); // 結束送出狀態
        }
    };

    const totalAmount = cart.reduce((sum, item) => {
        const optionsPrice = item.selectedOptions?.reduce((optSum, opt) => optSum + opt.price, 0) || 0;
        return sum + (item.price + optionsPrice) * item.quantity;
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Remove toggleOption, toggleGroupOption, handleConfirmOptions

    // Sticky Nav Logic
    const [isNavFixed, setIsNavFixed] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const [navHeight, setNavHeight] = useState(0);

    useEffect(() => {
        if (navRef.current) {
            setNavHeight(navRef.current.offsetHeight);
        }

        const handleScroll = () => {
            const headerHeight = 80; // Approximate header height
            if (window.scrollY > headerHeight) {
                setIsNavFixed(true);
            } else {
                setIsNavFixed(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={styles.container}>
            {/* Announcement Modal */}
            {showAnnouncement && announcement && (
                <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
                    <div className={styles.announcementModal}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#2d3436' }}>公告</h2>
                        <div className={styles.announcementContent}>
                            {announcement.content}
                        </div>
                        <button
                            className={styles.confirmBtn}
                            onClick={() => setShowAnnouncement(false)}
                            style={{ marginTop: '1.5rem', width: '100%', background: '#f39c12' }}
                        >
                            確定
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <h1 className={styles.title}>新易現炒</h1>
                    {tableId && <span className={styles.tableBadge}>桌號 {tableId}</span>}
                </div>
                <button
                    className={styles.cartButton}
                    onClick={() => setIsCartOpen(true)}
                >
                    <ShoppingCart size={24} />
                    {cart.length > 0 && (
                        <span className={styles.badge}>
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    )}
                </button>
            </header>

            {/* Category Navigation */}
            {isNavFixed && <div style={{ height: navHeight }} />} {/* Placeholder to prevent layout shift */}
            <nav
                ref={navRef}
                className={`${styles.categoryNav} ${isNavFixed ? styles.fixedNav : ''}`}
            >
                {categories.map(category => (
                    <button
                        key={category}
                        className={`${styles.categoryBtn} ${activeCategory === category ? styles.active : ''}`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </nav>

            {/* Menu Grid - Grouped by Category */}
            <div className={styles.menuContainer}>
                {categories.map(category => {
                    const items = itemsByCategory[category] || [];
                    if (items.length === 0) return null;

                    return (
                        <section
                            key={category}
                            id={`category-${category}`}
                            className={styles.categorySection}
                        >
                            <h2 className={styles.categoryTitle}>{category}</h2>
                            <div className={styles.menuGrid}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.menuItem}>
                                        <div className={styles.imageWrapper} onClick={() => setSelectedItem(item)}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {item.imageUrl && item.imageUrl !== '/placeholder.jpg' ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className={styles.itemImage}
                                                />
                                            ) : (
                                                <div className={styles.itemImage} style={{ backgroundColor: '#f8f9fa' }} />
                                            )}
                                            {!item.available && <div className={styles.soldOutOverlay}>已售完</div>}
                                        </div>

                                        <div className={styles.itemContent}>
                                            <div className={styles.itemHeader}>
                                                <h3 className={styles.itemName}>{item.name}</h3>
                                                <span className={styles.itemPrice}>${item.price}</span>
                                            </div>

                                            {item.description && (
                                                <p className={styles.itemDesc}>{item.description}</p>
                                            )}

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
                                                    disabled={!item.available}
                                                    onClick={() => addToCart(item)}
                                                >
                                                    <Plus size={20} />
                                                    加入
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Options Modal */}
            {
                selectedItem && (
                    <OptionsModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onConfirm={handleConfirmAddWithOptions}
                    />
                )
            }

            {/* ... (keep rest of UI) */}
            {/* Floating Action Button for Cart (Mobile Friendly) */}
            {
                totalItems > 0 && !isCartOpen && (
                    <div className={styles.fabContainer}>
                        <button className={styles.fabButton} onClick={() => setIsCartOpen(true)}>
                            <span>購物車 ({totalItems})</span>
                            <span>${totalAmount}</span>
                        </button>
                    </div>
                )
            }

            {
                isCartOpen && (
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
                                {isLoading ? (
                                    <button className={styles.checkoutBtn} disabled>
                                        載入中...
                                    </button>
                                ) : !user ? (
                                    <button className={styles.checkoutBtn} onClick={login}>
                                        請先登入 LINE 以點餐
                                    </button>
                                ) : (
                                    <button
                                        className={styles.checkoutBtn}
                                        disabled={cart.length === 0}
                                        onClick={requestCheckout}
                                    >
                                        送出訂單
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isSuccess && completedOrder && (
                    <div className={styles.successOverlay}>
                        <div className={styles.successCard}>
                            <div className={styles.successIcon}>
                                <Utensils size={48} />
                            </div>
                            <h2 style={{ color: '#2d3436', marginBottom: '0.5rem' }}>訂單已送出！</h2>

                            <div style={{
                                background: '#f8f9fa',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                margin: '1.5rem 0',
                                textAlign: 'left'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ color: '#636e72', fontSize: '0.9rem' }}>桌號</span>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff7675', margin: '0.25rem 0' }}>
                                        {completedOrder.tableId}
                                    </p>
                                </div>

                                <div style={{ borderTop: '1px solid #dfe6e9', paddingTop: '1rem', marginTop: '1rem' }}>
                                    <span style={{ color: '#636e72', fontSize: '0.9rem', fontWeight: '600' }}>訂單內容</span>
                                    {completedOrder.items.map((item, idx) => {
                                        const optionsPrice = item.selectedOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                                        const itemTotal = (item.price + optionsPrice) * item.quantity;
                                        return (
                                            <div key={idx} style={{ marginTop: '0.75rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0',
                                                    color: '#2d3436'
                                                }}>
                                                    <span>
                                                        <strong style={{ color: '#ff7675' }}>{item.quantity}x</strong> {item.name}
                                                    </span>
                                                    <span style={{ fontWeight: '600' }}>${itemTotal}</span>
                                                </div>
                                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                    <div style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#636e72' }}>
                                                        {item.selectedOptions.map((opt, optIdx) => (
                                                            <div key={optIdx} style={{ marginTop: '0.25rem' }}>
                                                                • {opt.name} (+${opt.price})
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div style={{
                                        borderTop: '2px solid #2d3436',
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: '#2d3436'
                                    }}>
                                        <span>總計</span>
                                        <span>${completedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: '#fff3cd',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                border: '1px solid #ffc107'
                            }}>
                                <p style={{ color: '#856404', fontWeight: '600', margin: 0, fontSize: '1.05rem' }}>
                                    💰 請至櫃檯結帳後開始製作
                                </p>
                            </div>

                            <button
                                className={styles.successBtn}
                                onClick={() => {
                                    setIsSuccess(false);
                                    setCompletedOrder(null);
                                }}
                            >
                                知道了
                            </button>
                        </div>
                    </div>
                )
            }

            {
                showOrderConfirm && (
                    <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
                        <div className={styles.modal} style={{ maxWidth: '500px' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#2d3436', marginBottom: '1.5rem', textAlign: 'center' }}>
                                確認送出訂單？
                            </h2>

                            <div style={{
                                background: '#f8f9fa',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid #dfe6e9' }}>
                                    <span style={{ color: '#636e72', fontSize: '0.9rem' }}>桌號</span>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff7675', margin: '0.25rem 0' }}>
                                        {tableId}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#636e72', fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>訂單內容</span>
                                    {cart.map((item, idx) => {
                                        const optionsPrice = item.selectedOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                                        const itemTotal = (item.price + optionsPrice) * item.quantity;

                                        return (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem 0',
                                                color: '#2d3436'
                                            }}>
                                                <span>
                                                    <strong style={{ color: '#ff7675' }}>{item.quantity}x</strong> {item.name}
                                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                        <span style={{ color: '#636e72', fontSize: '0.85rem', display: 'block', marginLeft: '2rem' }}>
                                                            {item.selectedOptions.map(opt => opt.name).join(', ')}
                                                        </span>
                                                    )}
                                                </span>
                                                <span style={{ fontWeight: '600' }}>${itemTotal}</span>
                                            </div>
                                        );
                                    })}

                                    <div style={{
                                        borderTop: '2px solid #2d3436',
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        color: '#2d3436'
                                    }}>
                                        <span>總計</span>
                                        <span style={{ color: '#ff7675' }}>${totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: '#fff3cd',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                border: '1px solid #ffc107'
                            }}>
                                <p style={{ color: '#856404', fontWeight: '600', margin: 0, fontSize: '0.95rem', textAlign: 'center' }}>
                                    ⚠️ 請確認訂單內容無誤後送出
                                </p>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setShowOrderConfirm(false)}
                                    disabled={isSubmitting}
                                    style={{ opacity: isSubmitting ? 0.5 : 1 }}
                                >
                                    取消
                                </button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={confirmCheckout}
                                    disabled={isSubmitting}
                                    style={{
                                        background: isSubmitting ? '#95e1d3' : '#00b894',
                                        color: 'white',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span style={{ opacity: 0.7 }}>送出中</span>
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                animation: 'spin 1s linear infinite',
                                                display: 'inline-block'
                                            }}>⏳</span>
                                        </>
                                    ) : (
                                        '確定送出'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showFriendInvite && (
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
                )
            }
        </div >
    );
}

export default function MenuPageWrapper() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>載入中...</div>}>
            <MenuPage />
        </Suspense>
    );
}
