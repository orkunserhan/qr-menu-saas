'use client'

import { useState } from 'react'
import { createProduct, deleteProduct, toggleProductAvailability } from '@/app/[locale]/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from './ImageUploader'

export function ProductList({ categoryId, restaurantId, products }: { categoryId: string, restaurantId: string, products: any[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleAdd(formData: FormData) {
        setLoading(true)
        await createProduct(restaurantId, categoryId, formData)
        setLoading(false)
        setIsAdding(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        await deleteProduct(id, restaurantId);
    }

    async function handleToggleStock(id: string, currentStatus: boolean) {
        await toggleProductAvailability(id, restaurantId, !currentStatus);
    }

    return (
        <div className="space-y-4">
            {/* Existing Products */}
            <div className="space-y-3">
                {products.map(product => (
                    <div key={product.id} className={`flex items-start gap-4 bg-white p-3 rounded-lg border shadow-sm relative group overflow-hidden transition-opacity ${!product.is_available ? 'opacity-70 bg-gray-50' : 'border-gray-100'}`}>
                        {/* Soldaki Küçük Resim */}
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden relative">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover ${!product.is_available ? 'grayscale' : ''}`} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1">No Img</div>
                            )}
                            {!product.is_available && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="bg-red-500 text-white text-[10px] px-1 rounded font-bold">TÜKENDİ</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                                        {product.name}
                                        {!product.is_available && <span className="text-xs text-red-500 font-bold">(Stok Yok)</span>}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">{product.price} ₺</div>

                                    {/* STOK BİLGİSİ KALDIRILDI: SADECE MEVCUT/MEVCUT DEĞİL */}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Stok Butonu */}
                                    <button
                                        onClick={() => handleToggleStock(product.id, product.is_available)}
                                        className={`text-xs px-2 py-1 rounded border transition-colors ${product.is_available
                                            ? 'border-green-200 text-green-700 hover:bg-green-50'
                                            : 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                                            }`}
                                    >
                                        {product.is_available ? '✅ Mevcut' : '⛔ Tükendi'}
                                    </button>

                                    <button onClick={() => handleDelete(product.id)} className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Sil
                                    </button>
                                </div>
                            </div>
                            {product.description && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                            )}
                        </div>
                    </div>
                ))}
                {products.length === 0 && !isAdding && (
                    <div className="text-sm text-gray-400 italic py-2 text-center">Bu kategoride ürün yok.</div>
                )}
            </div>

            {/* Add Form */}
            {isAdding ? (
                <form action={handleAdd} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 animate-in fade-in slide-in-from-top-1">
                    <h4 className="text-sm font-semibold mb-3">Yeni Ürün Ekle</h4>
                    <div className="space-y-3">
                        <Input name="name" placeholder="Ürün Adı (Örn: Adana Kebap)" required autoFocus className="bg-white" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="price" type="number" step="0.01" placeholder="Fiyat (TL)" required className="bg-white" />
                            <Input name="calories" type="number" placeholder="Kalori (kcal)" className="bg-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="preparation_time" type="number" placeholder="Hazırlama (Dk)" className="bg-white" />
                            <Input name="video_url" type="url" placeholder="Video Link (Youtube/Mp4)" className="bg-white" />
                        </div>

                        {/* YENİ GÖRSEL YÜKLEYİCİ */}
                        <ImageUploader
                            name="image"
                            label="Ürün Görseli"
                        />

                    </div>

                    <Input name="description" placeholder="Açıklama (İsteğe bağlı)" className="bg-white" />

                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>İptal</Button>
                        <Button type="submit" size="sm" disabled={loading}>
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-colors"
                >
                    + Ürün Ekle
                </button>
            )}
        </div>
    )
}
