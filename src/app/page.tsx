'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, ScanLine, ChefHat } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');
  const [tableNumber, setTableNumber] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If table param exists, use it. Otherwise, default to '1'.
    const targetTable = tableParam || '1';
    setTableNumber(targetTable);
    setIsRedirecting(true);

    // Add a slight delay to show the animation
    const timer = setTimeout(() => {
      router.push(`/menu?table=${targetTable}`);
    }, 1500);

    return () => clearTimeout(timer);
  }, [tableParam, router]);

  return (
    <main className={styles.main}>
      <div className={styles.backgroundOverlay}></div>
      <div className={`${styles.logoContainer} animate-scale-in`}>
        <div className={styles.logoCircle}>
          <UtensilsCrossed size={64} color="white" />
        </div>
        <h1 className={styles.title}>新易現炒</h1>
        <p className={styles.subtitle}>鑊氣十足 • 美味即享</p>

        {isRedirecting && (
          <div className={styles.redirectStatus}>
            <div className={styles.spinner}></div>
            <p>正在為您帶位至第 <span className={styles.highlightTable}>{tableNumber}</span> 桌...</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className={styles.loading}>載入中...</div>}>
      <HomeContent />
    </Suspense>
  );
}
