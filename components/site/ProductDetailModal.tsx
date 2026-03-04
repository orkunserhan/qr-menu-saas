'use client';

import { Product } from '@/types';
import { useTranslations } from 'next-intl';

export function ProductDetailModal({
    product,
    onClose,
    onAddToCart,
    currencySymbol
}: {
    product: Product,
    onClose: () => void,
    onAddToCart: (p: Product) => void,
    currencySymbol: string
}) {
    const t = useTranslations('client');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                >
                    ✕
                </button>

                <div className="h-64 sm:h-80 bg-gray-100 relative">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">Resim Yok</div>
                    )}
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                        <span className="text-xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                            {product.price} {currencySymbol}
                        </span>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {product.description || 'Detay açıklaması bulunmuyor.'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-2">
                        {product.calories > 0 && (
                            <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                🔥 {product.calories} {t('kcal')}
                            </span>
                        )}
                        {product.preparation_time > 0 && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                ⏱️ {product.preparation_time} {t('min')}
                            </span>
                        )}
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={() => {
                                onAddToCart(product);
                                onClose();
                            }}
                            disabled={!product.is_available}
                            className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg
                                ${product.is_available ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            {product.is_available ? (
                                <span className="flex items-center justify-center gap-2">
                                    🛒 {t('add')}
                                </span>
                            ) : (
                                "Tükendi"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
