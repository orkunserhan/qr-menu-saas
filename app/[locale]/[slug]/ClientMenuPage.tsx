'use client';

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FeedbackModal } from "@/components/site/FeedbackModal";
import { createOrder } from "@/app/actions/order-actions";
import { createCheckoutSession } from "@/app/actions/payment-actions"; // Imported
import { logAnalyticsEvent } from "@/app/actions";
import { ProductDetailModal } from "@/components/site/ProductDetailModal";
import { WaiterCallModal } from "@/components/site/WaiterCallModal";
import { Product, Category, Restaurant, CartItem, LangCode } from "@/types";
import { CURRENCY_SYMBOLS } from "@/src/constants/client-translations";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/routing";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientMenuPage({
    restaurant,
    categories,
    initialLocale
}: {
    restaurant: Restaurant,
    categories: Category[],
    initialLocale?: string
}) {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('tableId');
    const paymentSuccess = searchParams.get('payment_success'); // Check for payment success
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('client');

    // --- STATES ---

    // Modal & UI States
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showWaiterModal, setShowWaiterModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [isPaying, setIsPaying] = useState(false); // New state for payment loading
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Initial Campaign State
    const [showCampaign, setShowCampaign] = useState(
        !!(restaurant.is_campaign_active && (restaurant.campaign_title || restaurant.campaign_text))
    );

    // Table State
    const [currentTable, setCurrentTable] = useState<string | null>(tableId);

    // Cart State & Persistence
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Currency
    const currency = restaurant.currency || 'TRY';
    const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

    // --- EFFECTS ---

    // 1. Hydration Fix & LocalStorage Load
    useEffect(() => {
        setIsClient(true);
        const savedCart = localStorage.getItem(`cart_${restaurant.id}`);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, [restaurant.id]);

    // 2. LocalStorage Save
    useEffect(() => {
        if (isClient) {
            localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(cart));
        }
    }, [cart, isClient, restaurant.id]);

    // 3. Payment Success Toast
    useEffect(() => {
        if (paymentSuccess === 'true') {
            toast.success("Ödeme Başarılı! Siparişiniz alındı.", { duration: 5000, icon: '🎉' });
            // Clear URL param
            router.replace(pathname);
            // Optionally open feedback
            // setShowFeedback(true);
        }
    }, [paymentSuccess, pathname, router]);


    // --- HANDLERS ---

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        if (restaurant?.id) {
            logAnalyticsEvent(restaurant.id, product.id, 'view_product').catch(err => console.error("Analytics Error", err));
        }
    };

    // Standard Order (Pay at Cashier / Waiter)
    const handleCompleteOrder = async () => {
        if (cart.length === 0) return;
        setIsOrdering(true);

        const items = cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
        }));

        const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        try {
            const result = await createOrder(restaurant.id, currentTable, items, total);

            if (result.success) {
                setOrderSuccess(true);
                setCart([]); // Clear cart
                setShowCartModal(false);
                if (isClient) localStorage.removeItem(`cart_${restaurant.id}`);
                toast.success(t('orderSuccess'));
                setTimeout(() => setOrderSuccess(false), 5000);
            } else {
                toast.error(result.error || "Sipariş oluşturulurken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Bir bağlantı hatası oluştu.");
        } finally {
            setIsOrdering(false);
        }
    };

    // Online Payment (Stripe)
    const handleOnlinePayment = async () => {
        if (cart.length === 0) return;
        setIsPaying(true);

        const items = cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            image_url: item.product.image_url
        }));

        try {
            const result = await createCheckoutSession(restaurant.id, currentTable, items, restaurant.currency);

            if (result.error) {
                toast.error(result.error);
                setIsPaying(false);
            } else if (result.url) {
                // Redirect to Stripe
                window.location.href = result.url;
            }
        } catch (error) {
            console.error("Payment Error", error);
            toast.error("Ödeme başlatılamadı.");
            setIsPaying(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            toast.success(`${product.name} ${t('added')}`, { icon: '🛒' });
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleLanguageChange = (code: string) => {
        router.push(pathname, { locale: code });
    };

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <div className="min-h-screen bg-gray-50 pb-28 font-sans antialiased text-gray-900">

            {/* CAMPAIGN POP-UP MODAL */}
            <AnimatePresence>
                {showCampaign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>

                            <button
                                onClick={() => setShowCampaign(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full p-1 z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="text-center pt-2 relative z-0">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4 text-3xl shadow-sm animate-bounce">
                                    🎉
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {restaurant.campaign_title || 'Özel Fırsat!'}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {restaurant.campaign_text}
                                </p>
                                <button
                                    onClick={() => setShowCampaign(false)}
                                    className="w-full py-3 bg-black text-white font-medium rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                                >
                                    Harika!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WAITER CALL MODAL */}
            {showWaiterModal && (
                <WaiterCallModal
                    restaurantId={restaurant.id}
                    tableId={currentTable}
                    onClose={() => setShowWaiterModal(false)}
                />
            )}

            {/* PRODUCT DETAIL MODAL */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(p: any) => addToCart(p as Product)}
                    currencySymbol={currencySymbol}
                />
            )}

            {showFeedback && (
                <FeedbackModal
                    restaurantId={restaurant.id}
                    onClose={() => setShowFeedback(false)}
                    googleUrl={restaurant.google_review_url}
                />
            )}

            {/* CART MODAL */}
            <AnimatePresence>
                {showCartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 500 }}
                            className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-lg">{t('order')} ({cartCount})</h3>
                                <button onClick={() => setShowCartModal(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <div className="text-4xl mb-3">🛒</div>
                                        <p>{t('emptyCart')}</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                {item.product.image_url ? (
                                                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">IMG</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                                                <div className="text-sm font-semibold text-gray-600">{item.product.price * item.quantity} {currencySymbol}</div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black font-bold">-</button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black font-bold">+</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t bg-gray-50 space-y-3">
                                <div className="flex justify-between items-center mb-2 text-lg font-bold">
                                    <span>{t('total')}</span>
                                    <span>{cartTotal} {currencySymbol}</span>
                                </div>

                                {restaurant.is_payment_enabled && (
                                    <button
                                        onClick={handleOnlinePayment}
                                        disabled={cart.length === 0 || isOrdering || isPaying}
                                        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                                    >
                                        {isPaying ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>💳</span> Online Öde
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleCompleteOrder}
                                    disabled={cart.length === 0 || isOrdering || isPaying}
                                    className={`w-full py-4 font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${restaurant.is_payment_enabled ? 'bg-white border-2 border-black text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                    {isOrdering ? (
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {t('complete')} {currentTable ? `(${currentTable})` : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LANGUAGE SELECTOR */}
            <div className="fixed top-4 right-4 z-40">
                <div className="bg-black/80 backdrop-blur-md rounded-full p-1 pl-3 shadow-lg flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{initialLocale}</span>
                    <div className="flex bg-white/10 rounded-full p-0.5">
                        {(['tr', 'en', 'de', 'it', 'sk'] as LangCode[]).map((code) => (
                            <button
                                key={code}
                                onClick={() => handleLanguageChange(code)}
                                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${initialLocale === code ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white'}`}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="relative h-64 md:h-80 lg:h-96 bg-gray-900 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                <img
                    src={restaurant.cover_image_url || "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80"}
                    className="w-full h-full object-cover opacity-70"
                    alt="Cover"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20 text-white md:bottom-10 md:left-10">
                    {/* Table Info */}
                    {currentTable && (
                        <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-lg animate-pulse">
                            <span>🪑 Masa Seçili ({currentTable})</span>
                        </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight shadow-sm mb-2">{restaurant.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm md:text-lg text-gray-200 opacity-90 mb-3">
                        {restaurant.category && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs md:text-sm backdrop-blur-sm">{restaurant.category}</span>
                        )}
                        <span className="flex items-center gap-1 line-clamp-1">📍 {restaurant.address || '...'}</span>
                    </div>

                    {/* Social Media & Rate Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        {restaurant.social_instagram && (
                            <a href={restaurant.social_instagram} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-purple-600 to-orange-500 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
                            </a>
                        )}
                        {restaurant.social_facebook && (
                            <a href={restaurant.social_facebook} target="_blank" rel="noopener noreferrer" className="bg-[#1877F2] p-2 rounded-full shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971 1.066-2.971 2.92v1.051h4.153l-.546 3.667h-3.607v7.98H9.101Z" /></svg>
                            </a>
                        )}
                        {restaurant.social_twitter && (
                            <a href={restaurant.social_twitter} target="_blank" rel="noopener noreferrer" className="bg-black p-2 rounded-full shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                        )}

                        <button
                            onClick={() => setShowFeedback(true)}
                            className="ml-auto bg-white text-black px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2 hover:bg-gray-100"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {t('rateUs')}
                        </button>
                    </div>
                </div>
            </div>

            {/* CATEGORIES / LIST (Existing code) */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-4 overflow-x-auto no-scrollbar">
                <div className="flex px-4 gap-5 md:justify-center">
                    {categories?.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#cat-${cat.id}`}
                            className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 group-hover:border-black transition-all overflow-hidden relative shadow-sm group-hover:scale-105">
                                {cat.products?.[0]?.image_url ? (
                                    <img src={cat.products[0].image_url} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-bold bg-gray-100">
                                        {cat.name.substring(0, 1)}
                                    </div>
                                )}
                            </div>
                            <span className="text-[11px] font-semibold text-gray-500 group-hover:text-black line-clamp-1 text-center">
                                {cat.name}
                            </span>
                        </a>
                    ))}
                </div>
            </div>

            {/* MENU CONTENT (Repetition with slight mods for optimization if necessary, but full content write) */}
            <div className="px-4 py-6 space-y-12 max-w-7xl mx-auto">
                {categories?.filter((c) => c.products?.length > 0).map((category) => (
                    <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-40">
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{category.name}</h2>
                            <div className="h-0.5 bg-gray-100 flex-1"></div>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6"
                        >
                            {category.products?.map((product) => {
                                const inCart = cart.find(item => item.product.id === product.id);
                                return (
                                    <motion.div
                                        variants={itemVariants}
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className={`bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 min-h-[120px] transition-all hover:shadow-md cursor-pointer ${!product.is_available ? 'opacity-60 grayscale' : ''}`}
                                    >
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-tight mb-1 text-base">{product.name}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>

                                                {!product.is_available ? (
                                                    <span className="inline-block mt-2 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">TÜKENDİ</span>
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {restaurant.show_calories !== false && product.calories > 0 && (
                                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                                                🔥 {product.calories} {t('kcal')}
                                                            </span>
                                                        )}
                                                        {restaurant.show_preparation_time !== false && product.preparation_time > 0 && (
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                                                ⏱️ {product.preparation_time} {t('min')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-lg font-bold text-gray-900">{product.price} {currencySymbol}</span>
                                                {product.is_available && (
                                                    <div className="flex items-center gap-2">
                                                        {product.video_url && (
                                                            <a
                                                                href={product.video_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 animate-pulse hover:bg-red-200"
                                                            >
                                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(product);
                                                            }}
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm active:scale-95 ${inCart ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                                                        >
                                                            {inCart ? `${t('added')} (${inCart.quantity})` : `${t('add')} +`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative shadow-inner self-center group-hover:scale-105 transition-transform">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </section>
                ))}
            </div>

            {/* SEPET BAR (STICKY BOTTOM) */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent pb-6">
                        <motion.button
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={() => setShowCartModal(true)}
                            className="w-full max-w-sm mx-auto bg-black text-white rounded-2xl p-4 shadow-xl flex items-center justify-between hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">{cartCount}</div>
                                <span className="font-medium text-sm">{t('order')}</span>
                            </div>
                            <span className="font-bold text-lg">{cartTotal} {currencySymbol}</span>
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>

            {/* BOTTOM NAV BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-2 pb-6 z-30 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                    <button onClick={() => window.scrollTo(0, 0)} className="flex flex-col items-center gap-1 text-black p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <span className="text-[10px] font-bold">{t('menu')}</span>
                    </button>

                    <button
                        onClick={() => setShowWaiterModal(true)}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                        <span className="text-[10px] font-medium">{t('waiter')}</span>
                    </button>
                </div>
            </div>

            {/* SİPARİŞ BAŞARILI MODALI */}
            <AnimatePresence>
                {orderSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
                                🚀
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('orderSuccess')}</h3>
                            <p className="text-gray-500 mb-8">{t('orderSuccessMsg')}</p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <p className="font-medium text-sm text-gray-800">Sipariş Takibi</p>
                                <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-green-500 h-full w-1/3 animate-pulse rounded-full"></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-left">Hazırlanıyor...</p>
                            </div>

                            <button
                                onClick={() => setOrderSuccess(false)}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                            >
                                Tamam
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
