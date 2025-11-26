'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '@/types';
import { StorageService } from '@/lib/storage';
import { Plus, Edit, Trash2, ArrowLeft, Megaphone, CheckCircle, XCircle } from 'lucide-react';
import styles from '../admin.module.css';

export default function AnnouncementPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<Announcement | null>(null);

    useEffect(() => {
        const unsubscribe = StorageService.subscribeToAnnouncements((data) => {
            setAnnouncements(data);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            await StorageService.saveAnnouncement({
                ...editingItem,
                updatedAt: new Date()
            });
            setIsEditing(false);
            setEditingItem(null);
        } catch (error) {
            console.error('儲存公告失敗:', error);
            alert('儲存失敗');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此公告嗎？')) return;
        try {
            await StorageService.deleteAnnouncement(id);
        } catch (error) {
            console.error('刪除公告失敗:', error);
            alert('刪除失敗');
        }
    };

    const startAdd = () => {
        setEditingItem({
            id: Date.now().toString(),
            title: '',
            content: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        setIsEditing(true);
    };

    const startEdit = (item: Announcement) => {
        setEditingItem({ ...item });
        setIsEditing(true);
    };

    const toggleStatus = async (item: Announcement) => {
        try {
            await StorageService.saveAnnouncement({
                ...item,
                isActive: !item.isActive,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('切換狀態失敗:', error);
            alert('切換狀態失敗');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/admin')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d3436' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={styles.title}>
                        <Megaphone size={32} color="#2d3436" />
                        公告管理系統
                    </h1>
                </div>
                <button className={styles.addBtn} onClick={startAdd}>
                    <Plus size={18} /> 新增公告
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.ordersGrid} style={{ gridTemplateColumns: '1fr' }}>
                    {announcements.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>目前沒有公告</p>
                    )}

                    {announcements.map((item) => (
                        <div key={item.id} className={styles.orderCard} style={{ borderLeftColor: item.isActive ? '#4CAF50' : '#9E9E9E' }}>
                            <div className={styles.cardHeader}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.title}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => toggleStatus(item)}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: item.isActive ? '#4CAF50' : '#9E9E9E',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {item.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        {item.isActive ? '啟用中' : '已停用'}
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', color: '#666' }}>
                                {item.content}
                            </div>
                            <div className={styles.cardFooter}>
                                <small style={{ color: '#999' }}>
                                    更新於: {item.updatedAt.toLocaleString()}
                                </small>
                                <div className={styles.actions}>
                                    <button className={styles.actionBtn} onClick={() => startEdit(item)} style={{ backgroundColor: '#3498db' }}>
                                        <Edit size={18} /> 編輯
                                    </button>
                                    <button className={styles.actionBtn} onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#e74c3c' }}>
                                        <Trash2 size={18} /> 刪除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isEditing && editingItem && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>{announcements.find(a => a.id === editingItem.id) ? '編輯公告' : '新增公告'}</h3>
                            <form onSubmit={handleSave} className={styles.editForm}>
                                <label>
                                    標題:
                                    <input
                                        type="text"
                                        value={editingItem.title}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                        required
                                        placeholder="例如：本週公休通知"
                                    />
                                </label>
                                <label>
                                    內容:
                                    <textarea
                                        value={editingItem.content}
                                        onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                                        required
                                        rows={5}
                                        placeholder="請輸入公告內容..."
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            resize: 'vertical'
                                        }}
                                    />
                                </label>
                                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={editingItem.isActive}
                                        onChange={e => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                                    />
                                    立即啟用
                                </label>

                                <div className={styles.formActions} style={{ justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingItem(null);
                                        }}
                                        className={styles.cancelBtn}
                                    >
                                        取消
                                    </button>
                                    <button type="submit" className={styles.saveBtn}>
                                        <CheckCircle size={18} /> 儲存
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
