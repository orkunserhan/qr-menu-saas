'use client'

import { useState } from 'react'
import { createProduct, deleteProduct, toggleProductAvailability, updateProduct } from '@/app/[locale]/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUploader } from './ImageUploader'
import { useTranslations } from 'next-intl'

export function ProductList({ categoryId, restaurantId, products }: { categoryId: string, restaurantId: string, products: any[] }) {
    const t = useTranslations('components');
    const [isAdding, setIsAdding] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'en' | 'de' | 'sk' | 'it' | 'fr' | 'tr'>('en')

    const langs = [
        { code: 'en', name: 'English (Default)', mandatory: true },
        { code: 'de', name: 'German', mandatory: false },
        { code: 'sk', name: 'Slovak', mandatory: false },
        { code: 'it', name: 'Italian', mandatory: false },
        { code: 'fr', name: 'French', mandatory: false },
        { code: 'tr', name: 'Turkish', mandatory: false }
    ] as const;

    async function handleAdd(formData: FormData) {
        setLoading(true)
        setErrorMessage(null)
        const res = await createProduct(restaurantId, categoryId, formData)
        setLoading(false)
        if (res?.error) {
            setErrorMessage(res.error)
        } else {
            setIsAdding(false)
        }
    }

    async function handleUpdate(formData: FormData) {
        if (!editingProduct) return;
        setLoading(true)
        setErrorMessage(null)
        const res = await updateProduct(editingProduct.id, restaurantId, formData)
        setLoading(false)
        if (res?.error) {
            setErrorMessage(res.error)
        } else {
            setEditingProduct(null)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('deleteConfirm'))) return;
        try {
            await deleteProduct(id, restaurantId);
        } catch (err: any) {
            alert('Could not delete: ' + err.message);
        }
    }

    async function handleToggleStock(id: string, currentStatus: boolean) {
        try {
            await toggleProductAvailability(id, restaurantId, !currentStatus);
        } catch (err: any) {
            alert('Could not update stock: ' + err.message);
        }
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
                                    <span className="bg-red-500 text-white text-[10px] px-1 rounded font-bold">{t('outOfStock').replace('⛔ ', '')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                                        {product.name}
                                        {!product.is_available && <span className="text-xs text-red-500 font-bold">({t('outOfStock')})</span>}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">{product.price} €</div>

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
                                        {product.is_available ? t('available') : t('outOfStock')}
                                    </button>

                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="text-xs text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                    >
                                        ✏️
                                    </button>

                                    <button onClick={() => handleDelete(product.id)} className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t('delete')}
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
                    <div className="text-sm text-gray-400 italic py-2 text-center">{t('productEmpty')}</div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <form action={handleAdd} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 animate-in fade-in slide-in-from-top-1">
                    <h4 className="text-sm font-semibold mb-3">{t('productAdd')}</h4>
                    <div className="space-y-3">
                        <Input name="name" placeholder={t('productNamePlaceholder')} required autoFocus className="bg-white" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="price" type="number" step="0.01" placeholder={t('price')} required className="bg-white" />
                            <Input name="calories" type="number" placeholder={t('calories')} className="bg-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="preparation_time" type="number" placeholder={t('preparationTime')} className="bg-white" />
                            <Input name="video_url" type="url" placeholder={t('videoLink')} className="bg-white" />
                        </div>

                        {/* YENİ GÖRSEL YÜKLEYİCİ */}
                        <ImageUploader name="image" label={t('productImage')} />

                        {/* MULTI-LANGUAGE DESCRIPTIONS */}
                        <div className="space-y-2 mt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('descriptions')}</label>
                            <div className="flex flex-wrap gap-1 border-b pb-2">
                                {langs.map(l => (
                                    <button
                                        key={l.code}
                                        type="button"
                                        onClick={() => setActiveTab(l.code)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-t-md transition-colors ${activeTab === l.code ? 'bg-black text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                {langs.map(l => (
                                    <div key={l.code} className={activeTab === l.code ? 'block' : 'hidden'}>
                                        <Textarea
                                            name={`description_${l.code}`}
                                            placeholder={`Write ${l.name} description...`}
                                            required={l.mandatory}
                                            rows={2}
                                            className="bg-white text-sm"
                                        />
                                        {l.mandatory && <span className="text-[10px] text-red-500 mt-1 block">* Required field (used as system fallback for all languages).</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm mt-2 font-medium">{errorMessage}</div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
                        <Button type="submit" size="sm" disabled={loading}>
                            {loading ? "..." : t('add')}
                        </Button>
                    </div>
                </form>
            )}

            {/* Edit Form */}
            {editingProduct && (
                <form action={handleUpdate} className="bg-blue-50/30 p-4 rounded-lg border border-blue-200 mt-2 animate-in fade-in zoom-in-95">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="text-blue-500">✏️</span> {t('editProduct')}: {editingProduct.name}
                    </h4>
                    <div className="space-y-3">
                        <Input name="name" defaultValue={editingProduct.name} placeholder={t('productNamePlaceholder')} required className="bg-white" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="price" type="number" step="0.01" defaultValue={editingProduct.price} placeholder={t('price')} required className="bg-white" />
                            <Input name="calories" type="number" defaultValue={editingProduct.calories} placeholder={t('calories')} className="bg-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input name="preparation_time" type="number" defaultValue={editingProduct.preparation_time} placeholder={t('preparationTime')} className="bg-white" />
                            <Input name="video_url" type="url" defaultValue={editingProduct.video_url} placeholder={t('videoLink')} className="bg-white" />
                        </div>

                        <ImageUploader name="image" label={t('changeImage')} />

                        {/* MULTI-LANGUAGE DESCRIPTIONS */}
                        <div className="space-y-2 mt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('descriptions')}</label>
                            <div className="flex flex-wrap gap-1 border-b pb-2">
                                {langs.map(l => (
                                    <button
                                        key={l.code}
                                        type="button"
                                        onClick={() => setActiveTab(l.code)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-t-md transition-colors ${activeTab === l.code ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                {langs.map(l => (
                                    <div key={l.code} className={activeTab === l.code ? 'block' : 'hidden'}>
                                        <Textarea
                                            name={`description_${l.code}`}
                                            defaultValue={editingProduct.description_translations?.[l.code] || (l.code === 'en' ? editingProduct.description : '')}
                                            placeholder={`Write ${l.name} description...`}
                                            required={l.mandatory}
                                            rows={2}
                                            className="bg-white text-sm"
                                        />
                                        {l.mandatory && <span className="text-[10px] text-red-500 mt-1 block">* Required field.</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm mt-2 font-medium">{errorMessage}</div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>{t('cancel')}</Button>
                        <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "..." : t('update')}
                        </Button>
                    </div>
                </form>
            )}

            {!isAdding && !editingProduct && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-colors"
                >
                    {t('productAdd')}
                </button>
            )}
        </div>
    )
}
