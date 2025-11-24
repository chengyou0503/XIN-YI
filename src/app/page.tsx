'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <Suspense fallback={<div className={styles.loading}>載入中...</div>}>
      <HomeContent />
    </Suspense>
  );
}
