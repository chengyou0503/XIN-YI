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
    // 1. Check for liff.state (Highest Priority - from QR Code)
    const liffState = searchParams.get('liff.state');
    if (liffState) {
      console.log('🔍 Detected liff.state, processing redirect...');
      try {
        const decodedPath = decodeURIComponent(liffState);
        if (decodedPath.startsWith('/')) {
          console.log('🔄 Manually redirecting to:', decodedPath);
          router.replace(decodedPath); // Use replace to avoid history stack buildup
          return;
        }
      } catch (e) {
        console.error('Failed to parse liff.state', e);
      }
    }

    // 2. Check table param (High Priority - Direct Access)
    if (table) {
      // Immediate redirect, no delay
      console.log('📍 Table detected, redirecting immediately...');
      router.replace(`/menu?table=${table}`);
      return;
    }

    // 3. If user is already logged in, redirect to menu
    if (user && !isLoading) {
      const targetUrl = '/menu';
      console.log('👤 User logged in, redirecting to:', targetUrl);
      router.replace(targetUrl);
      return;
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
            unoptimized // Bypass optimization for reliability
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
