import { createClient } from '@/utils/supabase/server';
import TablesPageClient from './TablesPageClient';

export const dynamic = 'force-dynamic';

export default async function TablesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Server-side data fetching
    const { data: tables } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', id)
        .order('created_at');

    return <TablesPageClient params={{ id }} initialTables={tables || []} />;
}
