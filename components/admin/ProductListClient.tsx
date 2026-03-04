
'use client'

import { useState } from 'react';
import { ProductList } from './ProductList';
import { AddCategoryForm } from './AddCategoryForm';

export function ProductListClient({ restaurantId, initialCategories }: { restaurantId: string, initialCategories: any[] }) {
    // We can use state if we want optimistic updates, but server actions + revalidatePath usually handles it.
    // However, for immediate UI feedback, we might want state.
    // For now, let's rely on props which come from server component (wrapper).

    // If we want reordering, we need state.
    const [categories, setCategories] = useState(initialCategories);

    // Sync with props if they change (optional, but good if parent re-renders with new data)
    // useEffect(() => setCategories(initialCategories), [initialCategories]); 
    // Actually, distinct key will force re-mount if needed, or just let React handle it.

    return (
        <div className="space-y-12">
            <AddCategoryForm restaurantId={restaurantId} />

            {initialCategories.map((category) => (
                <div key={category.id} className="relative">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {category.name}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {category.products?.length || 0} Ürün
                            </span>
                        </h2>
                        {/* Kategori Düzenle/Sil butonları buraya gelebilir */}
                    </div>

                    <ProductList
                        categoryId={category.id}
                        restaurantId={restaurantId}
                        products={category.products || []}
                    />
                </div>
            ))}

            {initialCategories.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3">📂</div>
                    <h3 className="font-bold text-gray-900">Henüz Kategori Yok</h3>
                    <p className="text-gray-500 text-sm mb-4">Ürün eklemek için önce bir kategori oluşturmalısınız.</p>
                </div>
            )}
        </div>
    );
}
