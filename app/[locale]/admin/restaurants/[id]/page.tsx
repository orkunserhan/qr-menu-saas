import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/src/i18n/routing";
import { Button } from "@/components/ui/Button";
import { AddCategoryForm } from "@/components/admin/AddCategoryForm";
import { ProductList } from "@/components/admin/ProductList";
import { deleteCategory } from "@/app/[locale]/admin/actions";
import { QRCodeModal } from "@/components/admin/QRCodeModal";
import { getTranslations } from "next-intl/server";

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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-400 hover:text-black transition-colors rounded-full p-2 hover:bg-gray-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">{restaurant.name}</h1>
                            <a href={`/${restaurant.slug}`} target="_blank" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 mt-0.5">
                                qr.com/{restaurant.slug} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <QRCodeModal slug={restaurant.slug} name={restaurant.name} />

                        <Link href={`/admin/restaurants/${id}/tables`}>
                            <Button variant="outline" className="shadow-sm font-semibold border-gray-300">{t('tableLayout')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/reports`}>
                            <Button variant="outline" className="shadow-sm font-semibold border-gray-300">{t('reports')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/orders`}>
                            <Button className="bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 hover:text-white shadow-lg font-extrabold text-lg px-6 py-6 animate-pulse">{t('orders')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/waiter-calls`}>
                            <Button className="bg-red-600 text-white border border-red-700 hover:bg-red-700 hover:text-white shadow-lg font-extrabold text-lg px-6 py-6 animate-bounce">{t('waiter')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/analytics`}>
                            <Button variant="outline" className="shadow-sm font-semibold border-gray-300">{t('analytics')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/feedback`}>
                            <Button variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100 shadow-sm font-bold">{t('comments')}</Button>
                        </Link>
                        <Link href={`/admin/restaurants/${id}/settings`}>
                            <Button variant="outline" className="shadow-sm font-semibold border-gray-300 hover:bg-gray-50 text-gray-800">{t('settings')}</Button>
                        </Link>
                        <a href={`/${restaurant.slug}`} target="_blank">
                            <Button className="shadow-md bg-gradient-to-r from-black to-gray-800 text-white font-bold tracking-wide">{t('viewMenu')}</Button>
                        </a>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Categories Section */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold text-gray-900">{t('menuAndCategories')}</h2>
                    </div>

                    <AddCategoryForm restaurantId={id} />

                    <div className="grid grid-cols-1 gap-6">
                        {categories?.map((category) => (
                            <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">{category.name}</h3>
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
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-lg font-medium text-gray-900">{t('menuEmpty')}</p>
                                <p className="text-sm text-gray-500 mt-1 mb-4">{t('addCategoryPrompt')}</p>
                                {/* Ok işareti veya yönlendirme eklenebilir ama AddCategoryForm hemen üstte zaten */}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
