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
  }, [router, table]);

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
