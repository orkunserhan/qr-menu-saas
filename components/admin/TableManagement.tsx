'use client'

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { createTable, deleteTable, assignStaffToTable } from '@/app/[locale]/admin/table-actions';
import { QRCodeModal } from './QRCodeModal';
import toast from 'react-hot-toast';

interface Table {
    id: string;
    name: string;
    color: string;
    restaurant_id: string;
    assigned_staff_id?: string | null;
}

export function TableManagement({ 
    restaurantId, 
    restaurantName, 
    restaurantSlug, 
    initialTables,
    staffList = []
}: { 
    restaurantId: string, 
    restaurantName: string, 
    restaurantSlug: string, 
    initialTables: Table[],
    staffList?: any[]
}) {
    const t = useTranslations('admin.tables');
    const tc = useTranslations('components');
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [newTableName, setNewTableName] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPrinting, setIsPrinting] = useState(false);

    const handleAdd = async () => {
        if (!newTableName) return;
        const res = await createTable(restaurantId, newTableName, 'gray');
        if (res?.success && res.table) {
            setTables(prev => [...prev, res.table]);
            setNewTableName('');
            toast.success(t('addSuccess'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        const res = await deleteTable(id, restaurantId);
        if (res?.success) {
            setTables(prev => prev.filter(t => t.id !== id));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.success(t('deleteSuccess'));
        }
    };

    const handleAssignStaff = async (tableId: string, staffId: string | null) => {
        const res = await assignStaffToTable(tableId, staffId, restaurantId);
        if (res?.success) {
            setTables(prev => prev.map(tab => tab.id === tableId ? { ...tab, assigned_staff_id: staffId } : tab));
            toast.success(tc('save'));
        } else {
            toast.error(res?.error || 'Error');
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === tables.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(tables.map(t => t.id)));
        }
    };

    const handleBulkPrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Add Table UI */}
            <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tableName')}</label>
                    <input
                        type="text"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        placeholder="e.g. Terrace-5"
                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium"
                    />
                </div>
                <Button onClick={handleAdd} disabled={!newTableName} className="bg-black hover:bg-zinc-800 text-white font-bold h-[46px] px-8 rounded-xl active:scale-95 transition-all">
                   + {t('addTable')}
                </Button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleSelectAll} 
                        className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {selectedIds.size === tables.length ? t('deselectAll') : t('selectAll')}
                    </button>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs font-medium text-gray-400">
                        {selectedIds.size} {t('select')}
                    </span>
                </div>
                
                {selectedIds.size > 0 && (
                    <Button 
                        size="sm" 
                        onClick={handleBulkPrint} 
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20"
                    >
                        🖨️ {t('printSelected')} ({selectedIds.size})
                    </Button>
                )}
            </div>

            {/* Table List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                    const isSelected = selectedIds.has(table.id);
                    return (
                        <div 
                            key={table.id} 
                            className={`group bg-white dark:bg-zinc-900 border-2 rounded-2xl p-5 flex flex-col transition-all hover:shadow-md ${isSelected ? 'border-orange-500' : 'border-gray-100 dark:border-zinc-800'}`}
                        >
                            <div className="flex items-start justify-between w-full mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={() => toggleSelect(table.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{table.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t('ready')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <QRCodeModal slug={restaurantSlug} name={restaurantName} table={table.name} />
                                    <button 
                                        onClick={() => handleDelete(table.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        title={t('delete')}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Staff Assignment */}
                            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-zinc-800/50">
                                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest px-1">
                                    👤 {tc('authPerson')} / Staff
                                </label>
                                <select
                                    value={table.assigned_staff_id || ''}
                                    onChange={(e) => handleAssignStaff(table.id, e.target.value || null)}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">— Unassigned —</option>
                                    {staffList.map(staff => {
                                        const roleLabel = tc(`staffRoles.${staff.role}`);
                                        return (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name} ({roleLabel})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    );
                })}

                {tables.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-[2.5rem]">
                        <div className="text-4xl mb-4">🪑</div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t('noTables')}</h3>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-section, .print-section * {
                        visibility: visible;
                    }
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
