'use client';

import { Product } from '@/types';
import { useTranslations } from 'next-intl';
import { useTranslateContent } from '@/utils/translate';
import { PRODUCT_TAGS } from '@/constants/tags';

export function ProductDetailModal({
    product,
    onClose,
    onAddToCart,
    currencySymbol,
    isLiteMode = false
}: {
    product: Product,
    onClose: () => void,
    onAddToCart: (p: Product) => void,
    currencySymbol: string,
    isLiteMode?: boolean
}) {
    const t = useTranslations('client');
    const { tt, td } = useTranslateContent();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in backdrop-blur-md">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border dark:border-gray-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                >
                    ✕
                </button>

                <div className="h-64 sm:h-80 bg-gray-100 dark:bg-gray-800 relative text-gray-900 dark:text-white">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg font-bold">
                            {t('noImage')}
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
                        <span className="text-xl font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                            {product.price} {currencySymbol}
                        </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                        {td(product) || t('noDescription')}
                    </p>

                    {/* TAGS & INFO */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        {product.calories > 0 && (
                            <span className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold">
                                🔥 {product.calories} {t('kcal')}
                            </span>
                        )}
                        {product.preparation_time > 0 && (
                            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold">
                                ⏱️ {product.preparation_time} {t('min')}
                            </span>
                        )}
                        
                        {/* Custom Product Tags */}
                        {product.tags?.map((tagKey) => {
                            const config = PRODUCT_TAGS[tagKey];
                            if (!config) return null;
                            return (
                                <span key={tagKey} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-transform hover:scale-105 ${config.colorClass}`}>
                                    <span>{config.icon}</span>
                                    <span>{tt(config.translationKey)}</span>
                                </span>
                            );
                        })}
                    </div>


                    {!isLiteMode && (
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
                                    t('soldOut')
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
