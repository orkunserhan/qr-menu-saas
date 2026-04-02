
'use client'

import { useState } from 'react';
import { ProductList } from './ProductList';
import { AddCategoryForm } from './AddCategoryForm';

export function ProductListClient({ restaurantId, initialCategories }: { restaurantId: string, initialCategories: any[] }) {
    const [categories, setCategories] = useState(initialCategories);

    return (
        <div className="space-y-12">
            <AddCategoryForm restaurantId={restaurantId} />

            {initialCategories.map((category) => (
                <div key={category.id} className="relative">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {category.name}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {category.products?.length || 0} Products
                            </span>
                        </h2>
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
                    <h3 className="font-bold text-gray-900">No Categories Yet</h3>
                    <p className="text-gray-500 text-sm mb-4">You need to create a category first before adding products.</p>
                </div>
            )}
        </div>
    );
}
