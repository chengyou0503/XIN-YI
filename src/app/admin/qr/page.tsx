'use client';

import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './qr.module.css';

export default function QrPage() {
    // 固定桌號：1, 2, 3, 5, 6, 7, 8, 10, 12
    const tables = [1, 2, 3, 5, 6, 7, 8, 10, 12];
    const router = useRouter();
    // 使用生產環境 URL，避免生成 localhost QR code
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_BASE_URL || 'https://xin-yi-pos.vercel.app');

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
                    <div className={styles.controlLabel} style={{ marginRight: '1rem', fontWeight: 'bold', color: '#2d3436' }}>
                        固定桌號: 1, 2, 3, 5, 6, 7, 8, 10, 12
                    </div>
                    <button onClick={handlePrint} className={styles.printBtn}>
                        <Printer size={20} />
                        列印 QR Codes
                    </button>
                </div>
            </header>

            <div className={styles.grid}>
                {tables.map(tableId => {
                    // 使用 LIFF URL 格式，讓 LINE App 能自動授權
                    // 格式: https://liff.line.me/{liffId}?liff.state=/menu?table={tableId}
                    const liffIdTrimmed = (liffId || '').trim();
                    const qrData = liffIdTrimmed
                        ? `https://liff.line.me/${liffIdTrimmed}?liff.state=${encodeURIComponent(`/menu?table=${tableId}`)}`
                        : `${baseUrl}/menu?table=${tableId}`; // 備用方案

                    return (
                        <div key={tableId} className={styles.qrCard}>
                            {/* Header */}
                            <div className={styles.cardHeader}>
                                <h2 className={styles.scanTitle}>掃描點餐</h2>
                                <div className={styles.slogan}>掃碼五秒鐘 省你五分鐘</div>
                                <h3 className={styles.storeName}>新易現炒</h3>
                            </div>

                            {/* Body */}
                            <div className={styles.cardBody}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&size=300&dark=c0392b&ecLevel=H&margin=1`}
                                    alt={`桌號 ${tableId} QR Code`}
                                    className={styles.qrImage}
                                />
                                <div className={styles.tableInfo}>
                                    <span>桌號:</span>
                                    <span className={styles.tableNumber}>{tableId}</span>
                                </div>
                            </div>

                            {/* Footer - Steps */}
                            <div className={styles.cardFooter}>
                                <div className={styles.steps}>
                                    <div className={styles.stepItem}>
                                        <span className={styles.stepLabel}>掃碼</span>
                                    </div>
                                    <span className={styles.stepArrow}>➜</span>
                                    <div className={styles.stepItem}>
                                        <span className={styles.stepLabel}>選擇餐點</span>
                                    </div>
                                    <span className={styles.stepArrow}>➜</span>
                                    <div className={styles.stepItem}>
                                        <span className={styles.stepLabel}>櫃檯結帳</span>
                                    </div>
                                    <span className={styles.stepArrow}>➜</span>
                                    <div className={styles.stepItem}>
                                        <span className={styles.stepLabel}>等待餐點</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
