'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthService } from '@/lib/adminAuth';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = AdminAuthService.onAuthStateChanged((user) => {
            const isLoginPage = pathname === '/admin/login';

            if (user) {
                // 已登入，如果在登入頁則導向後台首頁
                if (isLoginPage) {
                    router.push('/admin');
                }
            } else {
                // 未登入，如果不在登入頁則導向登入頁
                if (!isLoginPage) {
                    router.push('/admin/login');
                }
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    if (isLoading) {
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
                <style jsx>{`
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #2d3436;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
}
