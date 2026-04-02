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
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin_locale', nextLocale);
            // Also set a cookie for next-intl if possible
            document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
        }
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
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
