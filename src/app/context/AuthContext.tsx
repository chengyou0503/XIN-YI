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
                    console.error('LIFF ID is not set');
                    setIsLoading(false); // Keep this to ensure loading state is resolved
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
                } else {
                    // Automatically trigger login if not logged in
                    liff.login({
                        redirectUri: window.location.href,
                    });
                    // liff.login will redirect, so no further code in this block will execute
                    // and setIsLoading(false) will be handled after redirection/re-initialization
                    return;
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
