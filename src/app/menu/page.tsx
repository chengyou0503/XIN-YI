'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockData';
import { MenuItem, CartItem, Category } from '@/types';
import { ShoppingCart, Plus, Minus, X, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '@/lib/storage';
import styles from './menu.module.css';



function MenuPage() {
    const { user, login, isFriend } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const [activeCategory, setActiveCategory] = useState<Category>('熱炒類');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Load menu from Firestore
        StorageService.getMenu().then(items => {
            setMenuItems(items);
        });
    }, []);

    const filteredItems = menuItems.filter(item => item.category === activeCategory);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
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

    const handleCheckout = () => {
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

        // Send LINE Notification if user is logged in
        if (user && user.id) {
            try {
                fetch('/api/line/push', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        order: newOrder,
                    }),
                });
            } catch (error) {
                console.error('Failed to send LINE notification:', error);
            }
        }

        setCart([]);
        setIsCartOpen(false);
        alert('點餐成功！請稍候餐點上桌。');

        // Auto hide success message after 3 seconds
        setTimeout(() => {
            setIsSuccess(false);
        }, 3000);
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
                                            <span>${item.price}</span>
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
