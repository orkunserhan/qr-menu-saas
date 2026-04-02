'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/routing'
import { useTransition } from 'react'

const LOCALES = [
    { code: 'de', flag: '🇩🇪', label: 'DE' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'it', flag: '🇮🇹', label: 'IT' },
    { code: 'sk', flag: '🇸🇰', label: 'SK' },
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    function handleChange(newLocale: string) {
        startTransition(() => {
            router.replace(pathname, { locale: newLocale })
        })
    }

    return (
        <div className="flex items-center justify-center gap-1 flex-wrap">
            {LOCALES.map(({ code, flag, label }) => {
                const isActive = locale === code
                return (
                    <button
                        key={code}
                        onClick={() => handleChange(code)}
                        disabled={isPending || isActive}
                        title={label}
                        className={`
                            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                            transition-all duration-200 border
                            ${isActive
                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm cursor-default'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800 hover:shadow-sm cursor-pointer'
                            }
                            ${isPending ? 'opacity-50' : ''}
                        `}
                    >
                        <span className="text-sm leading-none">{flag}</span>
                        <span>{label}</span>
                    </button>
                )
            })}
        </div>
    )
}
