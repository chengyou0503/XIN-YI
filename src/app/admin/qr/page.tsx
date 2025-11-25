'use client';

import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './qr.module.css';

export default function QrPage() {
    const [tableCount, setTableCount] = useState(12);
    const router = useRouter();
    // 使用生產環境 URL，避免生成 localhost QR code
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_BASE_URL || 'https://xin-yi-pos.vercel.app');

    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

    const handlePrint = () => {
        window.print();
    };

    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID || '';
    const liffUrl = `https://liff.line.me/${liffId}`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                    <span>返回儀表板</span>
                </button>
                <h1 className={styles.title}>桌號 QR Code 產生器</h1>
                <div className={styles.controls}>
                    <label className={styles.controlLabel}>
                        桌數設定:
                        <input
                            type="number"
                            value={tableCount}
                            onChange={(e) => setTableCount(Number(e.target.value))}
                            className={styles.input}
                            min="1"
                            max="50"
                        />
                    </label>
                    <button onClick={handlePrint} className={styles.printBtn}>
                        <Printer size={20} />
                        列印 QR Codes
                    </button>
                </div>
            </header>

            <div className={styles.grid}>
                {tables.map(tableId => {
                    // 直接使用應用程式 URL，不依賴 LIFF
                    // 格式: https://xin-yi-pos.vercel.app/menu?table={tableId}
                    const qrData = `${baseUrl}/menu?table=${tableId}`;

                    return (
                        <div key={tableId} className={styles.qrCard}>
                            <h2 className={styles.tableTitle}>桌號 {tableId}</h2>
                            <div className={styles.qrWrapper}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
                                    alt={`桌號 ${tableId} QR Code`}
                                    className={styles.qrImage}
                                />
                            </div>
                            <p className={styles.instruction}>請使用 LINE 掃描點餐</p>
                            <p className={styles.url}>桌號: {tableId}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
