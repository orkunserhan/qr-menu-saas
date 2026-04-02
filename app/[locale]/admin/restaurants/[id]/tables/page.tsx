import { createClient } from '@/utils/supabase/server';
import TablesPageClient from './TablesPageClient';

export const dynamic = 'force-dynamic';

export default async function TablesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Server-side data fetching
    const [tablesRes, restaurantRes, staffRes] = await Promise.all([
        supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', id)
            .order('created_at'),
        supabase
            .from('restaurants')
            .select('name, slug')
            .eq('id', id)
            .single(),
        supabase
            .from('restaurant_staff')
            .select('*')
            .eq('restaurant_id', id)
            .order('name')
    ]);

    const tables = tablesRes.data || [];
    const restaurant = restaurantRes.data;
    const staff = staffRes.data || [];

    return <TablesPageClient 
        params={{ id }} 
        initialTables={tables} 
        staffList={staff}
        restaurantName={restaurant?.name || ''} 
        restaurantSlug={restaurant?.slug || ''} 
    />;
}
