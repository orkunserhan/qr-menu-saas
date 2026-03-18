'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function ThemeSwitcher() {
    const t = useTranslations('components');
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[100px] h-[32px] bg-gray-100 animate-pulse rounded-lg"></div>;
    }

    return (
        <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block py-1.5 px-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
            <option value="light">{t('whiteMode')}</option>
            <option value="dark">{t('darkMode')}</option>
            <option value="eye-comfort">{t('eyeComfort')}</option>
        </select>
    );
}
