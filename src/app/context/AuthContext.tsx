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
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [liffError, setLiffError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize LIFF
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
                if (!liffId) {
                    console.warn('LIFF ID is missing in .env.local');
                    setIsLoading(false);
                    return;
                }

                await liff.init({ liffId });

                if (!liff.isLoggedIn()) {
                    // 修正：強制登入，並指定 redirectUri 為當前頁面 (避免 index.html 問題)
                    // 使用 window.location.href 確保導回當前頁面
                    liff.login({ redirectUri: window.location.href });
                    return;
                }

                const profile = await liff.getProfile();
                setUser({
                    id: profile.userId,
                    name: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                });
            } catch (error) {
                console.error('LIFF Initialization failed', error);
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
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
