'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed } from 'lucide-react';
import styles from './page.module.css';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table');

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
