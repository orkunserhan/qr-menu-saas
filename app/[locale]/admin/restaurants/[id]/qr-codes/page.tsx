'use client';

import React, { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface Table {
    id: string;
    name: string;
}

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
}

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function QRCodesPage(props: PageProps) {
    const params = use(props.params);
    const { id: restaurantId } = params;
    const t = useTranslations('restAdmin.qr');
    const supabase = createClient();
    
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
        
        async function fetchData() {
            setLoading(true);
            
            // Fetch restaurant details
            const { data: restData } = await supabase
                .from('restaurants')
                .select('id, name, slug, logo_url')
                .eq('id', restaurantId)
                .single();
            
            if (restData) setRestaurant(restData);

            // Fetch tables
            const { data: tablesData } = await supabase
                .from('tables')
                .select('id, name')
                .eq('restaurant_id', restaurantId)
                .order('name');
            
            if (tablesData) setTables(tablesData);
            
            setLoading(false);
        }

        fetchData();
    }, [restaurantId, supabase]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!restaurant) return null;

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen transition-colors">
            {/* Header - Hidden on Print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">
                        {restaurant.name}
                    </p>
                </div>
                
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 gap-2"
                >
                    {t('printButton')}
                </button>
            </div>

            {/* Empty State */}
            {tables.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl print:hidden transition-colors">
                    <p className="text-gray-400 dark:text-gray-500 italic">
                        {t('noTables')}
                    </p>
                </div>
            )}

            {/* QR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4 print:p-0">
                {tables.map((table) => (
                    <div 
                        key={table.id}
                        className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border-2 border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center justify-center text-center transition-all print:shadow-none print:border-gray-300 print:rounded-2xl print:break-inside-avoid print:p-6"
                    >
                        {/* Brand Logo/Title in QR Card */}
                        <div className="mb-6 flex flex-col items-center">
                            {restaurant.logo_url ? (
                                <div className="relative w-16 h-16 mb-2">
                                    <Image 
                                        src={restaurant.logo_url} 
                                        alt={restaurant.name}
                                        fill
                                        className="object-contain rounded-xl"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl mb-2 transition-colors">
                                    {restaurant.name.charAt(0)}
                                </div>
                            )}
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
                                {restaurant.name}
                            </h2>
                        </div>

                        {/* QR Code */}
                        <div className="p-4 bg-white rounded-2xl border-4 border-emerald-50 dark:border-emerald-900/10 shadow-inner">
                            <QRCodeSVG
                                value={`${origin}/${restaurant.slug}?table=${table.id}`}
                                size={200}
                                level="H"
                                includeMargin={true}
                                className="print:w-[160px] print:h-[160px]"
                            />
                        </div>

                        {/* Table Name Badge */}
                        <div className="mt-8">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-sm transition-colors print:bg-gray-200 print:text-black">
                                {t('tablePrefix')}{table.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Print Styles (Injection) */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Hide sidebar/navbar if they are not caught by print:hidden */
                    [role="complementary"], 
                    nav, 
                    header, 
                    aside,
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
