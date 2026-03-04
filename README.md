# QR Menu SaaS

Modern, minimalist ve çok kiracılı (multi-tenant) bir QR Menü platformu.

## Teknoloji Yığını
- **Frontend Framework:** Next.js 15+ (App Router)
- **Stil:** Tailwind CSS (Minimalist, NordQR tarzı)
- **Dil:** TypeScript
- **Veritabanı & Auth:** Supabase

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env.local` dosyasını oluşturun:
`.env.local.example` dosyasının adını `.env.local` yapın ve Supabase bilgilerinizi girin.

3. Veritabanını Kurun:
`supabase/schema.sql` dosyasındaki SQL kodlarını Supabase SQL Editöründe çalıştırarak tabloları oluşturun.

4. Projeyi Başlatın:
```bash
npm run dev
```

## Sayfalar
- `/` : Landing page
- `/admin` : Restoran yönetim paneli (Giriş)
- `/[slug]` : Dinamik restoran menüsü (Örn: `/kofteci-yusuf`)
