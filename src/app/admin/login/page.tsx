'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthService } from '@/lib/adminAuth';
import styles from './login.module.css';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (AdminAuthService.login(username, password)) {
            router.push('/admin');
        } else {
            setError('帳號或密碼錯誤');
            setPassword('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>
                    <h1>🍜 新易現炒</h1>
                    <p>後台管理系統</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">帳號</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="請輸入帳號"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">密碼</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入密碼"
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className={styles.loginBtn}>
                        登入
                    </button>
                </form>

                <div className={styles.footer}>
                    <small>© 2024 新易現炒 POS 系統</small>
                </div>
            </div>
        </div>
    );
}
