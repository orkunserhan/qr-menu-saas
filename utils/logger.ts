'use server';

import { createClient } from '@/utils/supabase/server';

export type LogLevel = 'info' | 'warning' | 'error';

export async function logSystem(
    message: string,
    level: LogLevel = 'info',
    restaurantId?: string,
    metadata?: any
) {
    const supabase = await createClient();

    try {
        await supabase.from('system_logs').insert({
            message,
            level,
            restaurant_id: restaurantId,
            metadata,
            stack_trace: metadata?.error?.stack || null
        });
    } catch (e) {
        // Loglama hatası uygulamayı durdurmamalı
        console.error('Logger Failed:', e);
    }
}
