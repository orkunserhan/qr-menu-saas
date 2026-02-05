import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AddCategoryForm } from "@/components/admin/AddCategoryForm";
import { ProductList } from "@/components/admin/ProductList";
import { deleteCategory } from "@/app/admin/actions";
import { QRCodeModal } from "@/components/admin/QRCodeModal";

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

    // Fetch Restaurant
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

    if (!restaurant) return <div>Restoran bulunamadı.</div>

    // Fetch Categories with Products
    const { data: categories } = await supabase
        .from("categories")
        .select("*, products(*)")
        .eq("restaurant_id", id)
        .order("order_index");

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-400 hover:text-black transition-colors">←</Link>
                        <div>
                            <h1 className="font-bold text-xl text-gray-900">{restaurant.name}</h1>
                            <a href={`/${restaurant.slug}`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                {restaurant.slug} ↗
                            </a>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <QRCodeModal slug={restaurant.slug} name={restaurant.name} />

                        <Link href={`/admin/restaurants/${id}/settings`}>
                            <Button variant="outline" size="sm">Ayarlar</Button>
                        </Link>
                        <a href={`/${restaurant.slug}`} target="_blank">
                            <Button size="sm">Menüyü Gör</Button>
                        </a>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Categories Section */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Menü & Kategoriler</h2>
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
                                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">Kategoriyi Sil</button>
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
                                <p className="text-lg font-medium text-gray-900">Menünüz Boş</p>
                                <p className="text-sm text-gray-500 mt-1 mb-4">Müşterilerinizin sipariş verebilmesi için önce kategori ekleyin.</p>
                                {/* Ok işareti veya yönlendirme eklenebilir ama AddCategoryForm hemen üstte zaten */}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
