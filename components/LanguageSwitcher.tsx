'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/routing';
import { ChangeEvent, useTransition } from 'react';
import { useParams } from 'next/navigation';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // next-intl usePathname() gives path without the locale prefix
            // To ensure 100% robust navigation, we manually redirect and refresh
            let newPath = pathname;
            if (nextLocale !== 'tr') { // 'tr' is default layout without prefix
                newPath = `/${nextLocale}${pathname === '/' ? '' : pathname}`;
            }

            // Keep params by restoring them to the URL
            const searchParams = new URLSearchParams(window.location.search);
            const query = searchParams.toString();
            const fullUrl = query ? `${newPath}?${query}` : newPath;

            window.location.href = fullUrl;
        });
    };

    return (
        <select
            value={locale}
            onChange={handleChange}
            disabled={isPending}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block py-1.5 px-2"
        >
            <option value="tr">TR</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="fr">FR</option>
            <option value="it">IT</option>
            <option value="sk">SK</option>
        </select>
    );
}
