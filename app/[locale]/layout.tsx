
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import ToasterProvider from '@/components/ToasterProvider';
import "../globals.css";

export const metadata = {
    title: 'QR Menu System',
    description: 'Digital Menu Platform'
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased">
                <NextIntlClientProvider messages={messages}>
                    <ToasterProvider />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
