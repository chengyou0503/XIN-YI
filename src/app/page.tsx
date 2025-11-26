'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, Megaphone, X } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { Announcement } from '@/types';
import styles from './page.module.css';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const unsubscribe = StorageService.subscribeToAnnouncements((data) => {
      const active = data.find(a => a.isActive);
      setAnnouncement(active || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only redirect if there's a table parameter
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
  }, [router, table, searchParams]);

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
