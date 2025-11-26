'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, Megaphone, X } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { Announcement } from '@/types';
import styles from './page.module.css';
import { useAuth } from './context/AuthContext';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const { user, isLoading, liffError } = useAuth();

  useEffect(() => {
    const unsubscribe = StorageService.subscribeToAnnouncements((data) => {
      const active = data.find(a => a.isActive);
      setAnnouncement(active || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to menu
    // This handles the case where user returns from LINE Login to the landing page
    if (user && !isLoading) {
      const targetUrl = table ? `/menu?table=${table}` : '/menu';
      console.log('👤 User logged in, redirecting to:', targetUrl);
      router.push(targetUrl);
      return;
    }

    // Only redirect if there's a table parameter (and not yet logged in)
    if (table) {
      const timer = setTimeout(() => {
        router.push(`/menu?table=${table}`);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Fallback: Check for liff.state if it exists but LIFF hasn't redirected yet
    const liffState = searchParams.get('liff.state');
    if (liffState) {
      console.log('🔍 Detected liff.state, waiting for LIFF redirect...');
      // You could try to manually decode it here if LIFF fails, 
      // but usually we just wait. 
      // If it's stuck here, it means LIFF init failed or didn't redirect.
      // Let's try to decode it manually as a failsafe.
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
      {showAnnouncement && announcement && (
        <div className={styles.announcementBanner}>
          <Megaphone size={20} style={{ marginRight: '8px' }} />
          <div className={styles.announcementContent}>
            {announcement.content}
          </div>
          <button
            className={styles.closeAnnouncement}
            onClick={() => setShowAnnouncement(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}
      <div></div>
      <div className={styles.logoContainer + ' animate-scale-in'}>
        <div className={styles.logoCircle}>
          <UtensilsCrossed size={64} strokeWidth={2} color="white" />
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
