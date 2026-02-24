export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { ProductList } from '@/components/admin/ProductList';

export default async function ProductsPageWrapper({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Kategorileri ve Ürünleri Çek
    const { data: categories } = await supabase
        .from('categories')
        .select('*, products(*)')
        .eq('restaurant_id', id)
        .order('order_index');

    // Eğer kategori yoksa, ProductList hata vermesin diye boş dizi gönder
    // Ancak ProductListClient içinde kategori oluşturma mantığı da olabilir.

    return <ProductList restaurantId={id} categoryId="" products={[]} />; // Wait, ProductList logic is different?
}
