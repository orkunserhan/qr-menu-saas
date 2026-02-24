
import { Link } from '@/src/i18n/routing';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-4xl font-bold tracking-tight">QR Menu SaaS</h1>
      <p className="text-gray-600">Minimalist Digital Menu Platform</p>

      <div className="flex gap-4">
        <Link
          href="/admin"
          className="rounded-full bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
        >
          Yönetim Paneli (Admin)
        </Link>
        {/* Placeholder for demo restaurant */}
        <Link
          href="/demo-restaurant"
          className="rounded-full border border-black px-6 py-2 hover:bg-gray-50 transition-colors"
        >
          Demo Menü
        </Link>
      </div>

      <div className="mt-8 flex gap-2">
        <Link href="/" locale="tr" className="px-2 py-1 text-xs border rounded">TR</Link>
        <Link href="/" locale="en" className="px-2 py-1 text-xs border rounded">EN</Link>
        <Link href="/" locale="de" className="px-2 py-1 text-xs border rounded">DE</Link>
        <Link href="/" locale="fr" className="px-2 py-1 text-xs border rounded">FR</Link>
        <Link href="/" locale="it" className="px-2 py-1 text-xs border rounded">IT</Link>
        <Link href="/" locale="sk" className="px-2 py-1 text-xs border rounded">SK</Link>
      </div>
    </div>
  );
}
