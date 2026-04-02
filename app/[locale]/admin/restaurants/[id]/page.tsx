import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/routing";
import { Button } from "@/components/ui/Button";
import { AddCategoryForm } from "@/components/admin/AddCategoryForm";
import { ProductList } from "@/components/admin/ProductList";
import { deleteCategory } from "@/app/[locale]/admin/actions";
import { QRCodeModal } from "@/components/admin/QRCodeModal";
import { getTranslations } from "next-intl/server";
import HelpWidget from "@/components/admin/HelpWidget";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RestaurantDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const t = await getTranslations('restAdmin');

    // Fetch Restaurant
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (!restaurant) return <div>{t('not_found')}</div>

    // Fetch Categories with Products
    const { data: categories } = await supabase
        .from("categories")
        .select("*, products(*)")
        .eq("restaurant_id", id)
        .order("order_index");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#09090b] pb-20 transition-colors duration-500">
            {/* Header */}
            <div className="bg-white dark:bg-[#0c0c0e] border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href="/admin" className="text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-all rounded-full p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-gray-900 dark:text-zinc-50 tracking-tight leading-none mb-1.5">{restaurant.name}</h1>
                            <div className="flex items-center gap-3">
                                <a href={`/${restaurant.slug}`} target="_blank" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                                    qr.com/{restaurant.slug} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                                <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800"></div>
                                <div className="flex items-center gap-1.5">
                                    <ThemeSwitcher />
                                    <LanguageSwitcher />
                                    <HelpWidget />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <QRCodeModal slug={restaurant.slug} name={restaurant.name} />

                        <Link href={`/admin/restaurants/${id}/tables`}>
                            <Button variant="outline" className="shadow-sm font-bold border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">{t('tableLayout')}</Button>
                        </Link>

                        <Link href={`/admin/restaurants/${id}/orders`}>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg font-black text-base px-6 shadow-orange-500/10 active:scale-95 transition-all">{t('orders.title')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/waiter-calls`}>
                            <Button className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-xl font-black text-base px-6 shadow-red-500/10 active:scale-95 transition-all">{t('waiter.title')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/analytics`}>
                            <Button variant="outline" className="shadow-sm font-bold border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">{t('analytics')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/feedback`}>
                            <Button variant="outline" className="bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-900/20 shadow-sm font-bold">{t('comments')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/settings`}>
                            <Button variant="outline" className="shadow-sm font-bold border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">{t('settings')}</Button>
                        </Link>
                        <a href={`/${restaurant.slug}`} target="_blank" className="ml-1">
                            <Button className="shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black tracking-wider border-0 px-8 ring-2 ring-emerald-500/20 active:scale-95 transition-all">
                                ✨ {t('viewMenu')}
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Categories Section */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('menuAndCategories')}</h2>
                    </div>

                    <AddCategoryForm restaurantId={id} />

                    <div className="grid grid-cols-1 gap-6">
                        {categories?.map((category) => (
                            <div key={category.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{category.name}</h3>
                                    <form action={async () => {
                                        'use server'
                                        await deleteCategory(category.id, id)
                                    }}>
                                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">{t('deleteCategory')}</button>
                                    </form>
                                </div>
                                <div className="p-4">
                                    <ProductList
                                        categoryId={category.id}
                                        restaurantId={id}
                                        products={category.products || []}
                                    />
                                </div>
                            </div>
                        ))}

                        {(!categories || categories.length === 0) && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('menuEmpty')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{t('addCategoryPrompt')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
