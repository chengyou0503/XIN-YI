'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from './context/AuthContext';
import Image from 'next/image';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');

  const { user, isLoading, liffError } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to menu immediately
    if (user && !isLoading) {
      const targetUrl = table ? `/menu?table=${table}` : '/menu';
      console.log('👤 User logged in, redirecting to:', targetUrl);
      router.push(targetUrl);
      return;
    }

    // Redirect with table parameter - reduced delay for faster loading
    if (table) {
      const timer = setTimeout(() => {
        router.push(`/menu?table=${table}`);
      }, 100); // Reduced from 500ms to 100ms
      return () => clearTimeout(timer);
    }

    // Fallback: Check for liff.state
    const liffState = searchParams.get('liff.state');
    if (liffState) {
      console.log('🔍 Detected liff.state, waiting for LIFF redirect...');
      try {
        const decodedPath = decodeURIComponent(liffState);
        if (decodedPath.startsWith('/')) {
          console.log('🔄 Manually redirecting to:', decodedPath);
          router.push(decodedPath);
        }
      } catch (e) {
        console.error('Failed to parse liff.state', e);
      }
    }
  }, [router, table, searchParams, user, isLoading]);

  if (liffError) {
    return (
      <div className={styles.main} style={{ justifyContent: 'center' }}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <h3>啟動失敗</h3>
          <p>{liffError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#2d3436',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.logoContainer + ' animate-scale-in'}>
        <div className={styles.logoCircle}>
          <Image
            src="/logo.jpg"
            alt="新易現炒"
            width={120}
            height={120}
            priority
            style={{ borderRadius: '12px' }}
          />
        </div>
        <h1 className={styles.title}>新易現炒</h1>
        <p className={styles.subtitle}>鑊氣十足 • 美味即享</p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className={styles.loading}>載入中...</div>}>
      <HomePage />
    </Suspense>
  );
}
