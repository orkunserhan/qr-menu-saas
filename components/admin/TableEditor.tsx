'use client'

import { useState, useRef, useEffect } from 'react';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { createTable, updateTablePosition, deleteTable } from '@/app/[locale]/admin/table-actions';
import { restrictToParentElement } from '@dnd-kit/modifiers';

// Renk Haritası
const tableColors: any = {
    gray: 'bg-white border-gray-800', // Varsayılan
    red: 'bg-red-50 border-red-500',
    blue: 'bg-blue-50 border-blue-500',
    green: 'bg-green-50 border-green-500',
    yellow: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    purple: 'bg-purple-50 border-purple-500'
};

// Draggable Table Component
function DraggableTable({ table, onDelete, onShowQR }: { table: any, onDelete: (id: string) => void, onShowQR: (table: any) => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: table.id,
        data: { x: table.position_x, y: table.position_y }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        left: `${table.position_x}%`,
        top: `${table.position_y}%`,
        position: 'absolute' as 'absolute'
    } : {
        left: `${table.position_x}%`,
        top: `${table.position_y}%`,
        position: 'absolute' as 'absolute'
    };

    // Tablo Rengi
    const colorClasses = tableColors[table.color || 'gray'] || tableColors.gray;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="group flex flex-col items-center justify-center cursor-move touch-none"
        >
            <div className={`w-16 h-16 border-2 rounded-lg shadow-lg flex items-center justify-center relative hover:scale-105 transition-all ${colorClasses} ${table.is_occupied ? '!bg-red-100 !border-red-600' : ''}`}>
                <span className="font-bold text-xs text-center px-1 leading-tight text-gray-800">{table.name}</span>

                {/* QR Butonu (Sol Üst) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowQR(table);
                    }}
                    className="absolute -top-2 -left-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                    onPointerDown={(e) => e.stopPropagation()}
                    title="Masa QR Kodunu Gör"
                >
                    QR
                </button>

                {/* Silme Butonu (Sağ Üst) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Sürüklemeyi engelle
                        if (confirm('Masayı silmek istediğine emin misin?')) onDelete(table.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    ✕
                </button>
            </div>
            {/* Sandalyeler (Görsel) */}
            <div className="absolute -top-3 w-8 h-2 bg-gray-300 rounded-full"></div>
            <div className="absolute -bottom-3 w-8 h-2 bg-gray-300 rounded-full"></div>
            <div className="absolute -left-3 h-8 w-2 bg-gray-300 rounded-full"></div>
            <div className="absolute -right-3 h-8 w-2 bg-gray-300 rounded-full"></div>
        </div>
    );
}

export function TableEditor({ restaurantId, initialTables }: { restaurantId: string, initialTables: any[] }) {
    const [tables, setTables] = useState(initialTables);
    const [newTableName, setNewTableName] = useState('');
    const [newTableColor, setNewTableColor] = useState('gray'); // Default color
    const [qrModalTable, setQrModalTable] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sensör Ayarları (Mouse ve Dokunmatik için)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, delta } = event;
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const currentTable = tables.find(t => t.id === active.id);
        if (!currentTable) return;

        const currentPxX = (currentTable.position_x / 100) * containerRect.width;
        const currentPxY = (currentTable.position_y / 100) * containerRect.height;

        let newPxX = currentPxX + delta.x;
        let newPxY = currentPxY + delta.y;

        newPxX = Math.max(0, Math.min(newPxX, containerRect.width - 64));
        newPxY = Math.max(0, Math.min(newPxY, containerRect.height - 64));

        const newPercentX = (newPxX / containerRect.width) * 100;
        const newPercentY = (newPxY / containerRect.height) * 100;

        setTables(prev => prev.map(t =>
            t.id === active.id ? { ...t, position_x: newPercentX, position_y: newPercentY } : t
        ));

        await updateTablePosition(active.id as string, newPercentX, newPercentY, restaurantId);
    };

    const handleAddTable = async () => {
        if (!newTableName) return;
        const res = await createTable(restaurantId, newTableName, newTableColor);
        if (res?.success && res.table) {
            setTables(prev => [...prev, res.table]);
            setNewTableName('');
        }
    };

    const handleDeleteTable = async (id: string) => {
        const res = await deleteTable(id, restaurantId);
        if (res?.success) {
            setTables(prev => prev.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-4">
            {/* Kontrol Paneli */}
            <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl border shadow-sm items-center">
                <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Masa Adı (Örn: Cam 1)"
                    className="border px-3 py-2 rounded-lg text-sm flex-1 focus:ring-black focus:border-black min-w-[150px]"
                />

                {/* Renk Seçici */}
                <select
                    value={newTableColor}
                    onChange={(e) => setNewTableColor(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm focus:ring-black focus:border-black cursor-pointer"
                >
                    <option value="gray">Gri (Standart)</option>
                    <option value="red">Kırmızı</option>
                    <option value="blue">Mavi</option>
                    <option value="green">Yeşil</option>
                    <option value="yellow">Sarı</option>
                    <option value="purple">Mor</option>
                </select>

                <button
                    onClick={handleAddTable}
                    disabled={!newTableName}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                    + Masa Ekle
                </button>
            </div>

            {/* Simülasyon Alanı (Canvas) */}
            <div ref={containerRef} className="relative w-full h-[600px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shadow-inner bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-400 pointer-events-none z-0">
                    Restoran Alanı (Sürükle & Bırak) - Giriş Burası Varsayılır ↓
                </div>

                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToParentElement]}
                >
                    {tables.map(table => (
                        <DraggableTable
                            key={table.id}
                            table={table}
                            onDelete={handleDeleteTable}
                            onShowQR={setQrModalTable}
                        />
                    ))}
                </DndContext>
            </div>

            <div className="text-center text-xs text-gray-500">
                Masaları tutup sürükleyerek restoranınızın krokisine göre yerleştirebilirsiniz. Masanın üzerine gelince çıkan "QR" butonu ile masaya özel QR alabilirsiniz.
            </div>

            {/* QR Gösterim Modal */}
            {qrModalTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl">
                        <button
                            onClick={() => setQrModalTable(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>

                        <h3 className="font-bold text-lg mb-1">{qrModalTable.name}</h3>
                        <p className="text-xs text-gray-500 mb-6">Masa QR Kodu</p>

                        <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4 break-all text-xs text-gray-600 font-mono">
                            ?tableId={qrModalTable.id}
                        </div>

                        <a
                            href={`/demo-burger?tableId=${qrModalTable.id}`}
                            target="_blank"
                            className="block w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
                        >
                            Menüyü Aç & Test Et
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
