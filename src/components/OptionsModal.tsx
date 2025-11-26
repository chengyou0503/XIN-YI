'use client';

import { useState, useEffect } from 'react';
import { MenuItem, MenuOption } from '@/types';
import { Check } from 'lucide-react';
import styles from './OptionsModal.module.css';

interface OptionsModalProps {
    item: MenuItem;
    onClose: () => void;
    onConfirm: (item: MenuItem, options: MenuOption[]) => void;
}

export default function OptionsModal({ item, onClose, onConfirm }: OptionsModalProps) {
    const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
    const [selectedGroupOptions, setSelectedGroupOptions] = useState<Record<string, MenuOption[]>>({});

    const handleConfirm = () => {
        // Handle option groups
        if (item.optionGroups && item.optionGroups.length > 0) {
            // Validate required groups
            for (const group of item.optionGroups) {
                if (group.required && (!selectedGroupOptions[group.id] || selectedGroupOptions[group.id].length === 0)) {
                    alert(`請選擇 ${group.name}`);
                    return;
                }
            }

            // Flatten all selected options from all groups
            const allOptions = Object.values(selectedGroupOptions).flat();
            onConfirm(item, allOptions);
            return;
        }

        // Fallback to old options
        onConfirm(item, selectedOptions);
    };

    const toggleOption = (option: MenuOption) => {
        setSelectedOptions(prev => {
            const exists = prev.find(o => o.name === option.name);
            if (exists) {
                return prev.filter(o => o.name !== option.name);
            }
            return [...prev, option];
        });
    };

    const toggleGroupOption = (groupId: string, option: MenuOption, groupType: 'radio' | 'checkbox') => {
        setSelectedGroupOptions(prev => {
            const currentSelections = prev[groupId] || [];

            if (groupType === 'radio') {
                // Replace with new selection
                return { ...prev, [groupId]: [option] };
            } else {
                // Toggle for checkbox
                const exists = currentSelections.find(o => o.name === option.name);
                if (exists) {
                    return { ...prev, [groupId]: currentSelections.filter(o => o.name !== option.name) };
                }
                return { ...prev, [groupId]: [...currentSelections, option] };
            }
        });
    };

    const calculateTotal = () => {
        const basePrice = item.price;
        const optionsPrice = item.optionGroups
            ? Object.values(selectedGroupOptions).flat().reduce((sum, opt) => sum + opt.price, 0)
            : selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
        return basePrice + optionsPrice;
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className={styles.modal}>
                <h3>{item.name} - 客製化選項</h3>

                {/* New Option Groups UI */}
                {item.optionGroups && item.optionGroups.length > 0 ? (
                    <div className={styles.optionsList}>
                        {item.optionGroups.map((group) => (
                            <div key={group.id} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{
                                    fontSize: '1rem',
                                    color: '#2d3436',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {group.name}
                                    {group.required && <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>(必選)</span>}
                                    <span style={{ color: '#95a5a6', fontSize: '0.85rem' }}>({group.type === 'radio' ? '單選' : '多選'})</span>
                                </h4>
                                {group.options.map((option, optIdx) => {
                                    const isSelected = (selectedGroupOptions[group.id] || []).some(o => o.name === option.name);
                                    return (
                                        <div
                                            key={optIdx}
                                            className={`${styles.optionItem} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleGroupOption(group.id, option, group.type)}
                                        >
                                            <div className={styles.checkbox}>
                                                {isSelected && <Check size={16} color="white" />}
                                            </div>
                                            <span className={styles.optionName}>{option.name}</span>
                                            <span className={styles.optionPrice}>
                                                {option.price > 0 ? `+$${option.price}` : '免費'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Fallback to old options UI */
                    <div className={styles.optionsList}>
                        {item.options?.map((option, idx) => {
                            const isSelected = selectedOptions.some(o => o.name === option.name);
                            return (
                                <div
                                    key={idx}
                                    className={`${styles.optionItem} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className={styles.checkbox}>
                                        {isSelected && <Check size={16} color="white" />}
                                    </div>
                                    <span className={styles.optionName}>{option.name}</span>
                                    <span className={styles.optionPrice}>
                                        {option.price > 0 ? `+$${option.price}` : '免費'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                    >
                        取消
                    </button>
                    <button
                        className={styles.confirmBtn}
                        onClick={handleConfirm}
                    >
                        確認加入 (${calculateTotal()})
                    </button>
                </div>
            </div>
        </div>
    );
}
