'use client'

import { useState } from "react";

// Basit Dil Sözlüğü
const TRANSLATIONS = {
    tr: { menu: "Menü", order: "Sipariş", waiter: "Garson", rateUs: "Bizi Google'da Değerlendirin", empty: "Bu menü hazırlanıyor.", add: "Ekle" },
    en: { menu: "Menu", order: "Cart", waiter: "Waiter", rateUs: "Rate us on Google", empty: "Menu is getting ready.", add: "Add" },
    de: { menu: "Speisekarte", order: "Warenkorb", waiter: "Kellner", rateUs: "Bewerten Sie uns auf Google", empty: "Menü wird vorbereitet.", add: "Hinzufügen" },
    it: { menu: "Menù", order: "Carrello", waiter: "Cameriere", rateUs: "Valutaci su Google", empty: "Il menu è in preparazione.", add: "Aggiungi" },
};

type LangCode = 'tr' | 'en' | 'de' | 'it';

export default function ClientMenuPage({ restaurant, categories }: { restaurant: any, categories: any }) {
    const [lang, setLang] = useState<LangCode>('tr');
    const t = TRANSLATIONS[lang];

    // Google Rate Link
    // Eğer Link girilmişse direkt onu kullan, yoksa Place ID ile search linki oluştur.
    let googleUrl = "#";
    if (restaurant.google_place_id) {
        if (restaurant.google_place_id.startsWith('http')) {
            googleUrl = restaurant.google_place_id;
        } else {
            googleUrl = `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id}`;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans antialiased text-gray-900">

            {/* LANGUAGE SELECTOR (Floating Top Right) */}
            <div className="fixed top-4 right-4 z-50">
                <div className="bg-black/80 backdrop-blur-md rounded-full p-1 pl-3 shadow-lg flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{lang}</span>
                    <div className="flex bg-white/10 rounded-full p-0.5">
                        {(['tr', 'en', 'de', 'it'] as LangCode[]).map((code) => (
                            <button
                                key={code}
                                onClick={() => setLang(code)}
                                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${lang === code ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white'}`}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="relative h-56 bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

                {/* Background Image - Dinamik veya Statik */}
                <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
                    className="w-full h-full object-cover opacity-70"
                    alt="Cover"
                />

                <div className="absolute bottom-6 left-6 z-20 text-white w-full pr-6">
                    <h1 className="text-3xl font-extrabold tracking-tight shadow-sm mb-1">{restaurant.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 opacity-90">
                        {restaurant.category && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm">{restaurant.category}</span>
                        )}
                        <span className="flex items-center gap-1">📍 {restaurant.address || '...'}</span>
                    </div>

                    {/* Google Rate Button (Hero içinde) */}
                    {restaurant.google_place_id && (
                        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {t.rateUs}
                        </a>
                    )}
                </div>
            </div>

            {/* STORIES (KATEGORİLER) */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-4 overflow-x-auto no-scrollbar">
                <div className="flex px-4 gap-5">
                    {categories?.map((cat: any) => (
                        <a
                            key={cat.id}
                            href={`#cat-${cat.id}`}
                            className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 group-hover:border-black transition-all overflow-hidden relative shadow-sm">
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

            {/* MENÜ İÇERİK */}
            <div className="px-4 py-6 space-y-12">
                {categories?.filter((c: any) => c.products?.length > 0).map((category: any) => (
                    <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-40">
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                            <div className="h-0.5 bg-gray-100 flex-1"></div>
                        </div>

                        <div className="space-y-4">
                            {category.products?.map((product: any) => (
                                <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 min-h-[110px] active:scale-[99%] transition-transform">
                                    {/* Sol: Bilgi */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">{product.price} ₺</span>
                                            { /* Sepet butonu vs buraya gelebilir */}
                                            <button className="bg-gray-100 hover:bg-black hover:text-white px-3 py-1 rounded-full text-[10px] font-bold transition-colors">
                                                {t.add} +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sağ: Resim */}
                                    <div className="w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative shadow-inner">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {(!categories || categories.length === 0) && (
                    <div className="text-center py-20">
                        <p className="text-gray-400">{t.empty}</p>
                    </div>
                )}
            </div>

            {/* BOTTOM NAVIGATION (Multilanguage) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-2 pb-6 z-40 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                    <button className="flex flex-col items-center gap-1 text-black p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <span className="text-[10px] font-bold">{t.menu}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                        <span className="text-[10px] font-medium">{t.order}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                        <span className="text-[10px] font-medium">{t.waiter}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
