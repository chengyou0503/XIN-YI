'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import liff from '@line/liff';

interface User {
    id: string;
    name: string;
    pictureUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    liffError: string | null;
    isFriend: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [liffError, setLiffError] = useState<string | null>(null);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        // Initialize LIFF
        const initLiff = async () => {
            try {
                const liffId = (process.env.NEXT_PUBLIC_LINE_LIFF_ID || '').trim();
                if (!liffId) {
                    console.warn('⚠️ LIFF ID 未設定，跳過 LINE 登入功能');
                    setIsLoading(false);
                    setLiffError('LIFF ID 未設定');
                    return;
                }

                await liff.init({ liffId });

                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setUser({
                        id: profile.userId,
                        name: profile.displayName,
                        pictureUrl: profile.pictureUrl,
                    });

                    // Check if user is friend
                    try {
                        const friendship = await liff.getFriendship();
                        setIsFriend(friendship.friendFlag);
                        console.log('好友狀態:', friendship.friendFlag ? '已加好友' : '未加好友');
                    } catch (error) {
                        console.warn('無法檢查好友狀態:', error);
                        setIsFriend(false);
                    }
                } else {
                    // Only auto-login if NOT on admin page
                    const isAdminPage = window.location.pathname.startsWith('/admin');

                    console.log('👤 未登入 LINE');
                    console.log('📍 當前路徑:', window.location.pathname);
                    console.log('🔐 是否為後台頁面:', isAdminPage);

                    if (!isAdminPage) {
                        console.log('🔄 自動觸發 LINE 登入...');
                        // Automatically trigger login if not logged in on customer pages
                        // Use window.location.href to preserve query parameters (like table ID)
                        // But we should strip any existing liff.state or code/state params from OAuth to avoid pollution if needed
                        // For now, using href is safer than stripping everything
                        liff.login({
                            redirectUri: window.location.href,
                        });
                        // liff.login will redirect, so no further code in this block will execute
                        // and setIsLoading(false) will be handled after redirection/re-initialization
                        return;
                    } else {
                        console.log('⏭️  後台頁面，跳過自動登入');
                    }
                }
            } catch (error) {
                console.error('LIFF initialization failed', error);
                setLiffError(error instanceof Error ? error.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        initLiff();
    }, []);

    const login = () => {
        if (!liff.id) {
            alert('LIFF 初始化尚未完成或失敗，請檢查設定。');
            return;
        }
        if (!liff.isLoggedIn()) {
            // 修正：手動登入也指定 redirectUri
            liff.login({ redirectUri: window.location.href });
        }
    };

    const logout = () => {
        if (liff.isLoggedIn()) {
            liff.logout();
            setUser(null);
            window.location.reload(); // Reload to clear state
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isLoading,
            liffError,
            isFriend,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
