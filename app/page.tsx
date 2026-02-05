import Link from "next/link";

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
          Admin Panel
        </Link>
        {/* Placeholder for demo restaurant */}
        <Link
          href="/demo-restaurant"
          className="rounded-full border border-black px-6 py-2 hover:bg-gray-50 transition-colors"
        >
          View Demo Menu
        </Link>
      </div>
    </div>
  );
}
