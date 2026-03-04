
# 🍽️ Proje: QR Menü SaaS - Sistem Özeti

Müşterilerinizin restoranları için dijital menüler oluşturabildiği, sipariş alabildiği ve masalarını yönetebildiği kapsamlı bir SaaS platformu.

## 🚀 Mevcut Özellikler

### 1. 🏢 Restoran Yönetimi (SaaS Core)
*   **Restoran Oluşturma:** Kullanıcılar (Mekan Sahipleri) hesap açıp restoranlarını oluşturabilir.
*   **Abonelik (Lisans) Sistemi:** Her restoranın bir abonelik bitiş tarihi vardır (`subscription_end_date`).
*   **Marka Ayarları:** Logo, adres, iletişim ve sosyal medya linkleri eklenebilir.
*   **Para Birimi:** TL, Dolar, Euro, Sterlin desteği.

### 2. 📱 Dijital Menü (Müşteri Yüzü)
*   **Dinamik Menü:** Kategoriler ve ürünler anlık olarak yönetilebilir.
*   **Çoklu Dil Desteği:** TR, EN, DE, IT dilleri arasında geçiş.
*   **Görsel Odaklı:** Büyük ürün görselleri, videolar, kalori ve hazırlama süresi bilgileri.
*   **Kampanya Sistemi:** Girişte açılan Pop-up ile özel duyurular yapılabilir.
*   **Sepet ve Sipariş:** Müşteriler ürünleri sepete ekleyip sipariş verebilir.

### 3. 🪑 Masa ve Sipariş Yönetimi (Operasyon)
*   **Sürükle-Bırak Masa Editörü:** Restoran krokisini admin panelinden çizebilme.
*   **QR Kod Entegrasyonu:** Her masaya özel QR kod (`?tableId=xyz`).
*   **Canlı Garson Ekranı:** 
    *   Müşteri masadan sipariş verdiğinde garson ekranında o masa **Kırmızı** yanar.
    *   Sipariş detayı görülür, durumu değiştirilebilir (Hazırlanıyor, Servis Edildi, Ödendi).
*   **Masa Renklendirme:** Masalar bölgelere göre (Teras, VIP vb.) farklı renklerde kodlanabilir.

### 4. 🛠️ Teknik Altyapı
*   **Görsel Optimizasyonu (Yeni):** Yüklenen fotoğraf tarayıcıda WebP'ye çevrilip sıkıştırılır (Max 1000px).
*   **Veritabanı:** Supabase (PostgreSQL) + RLS (Row Level Security) ile tam güvenlik.
*   **Yetki Yönetimi:** Admin, Editör, Garson rolleri için altyapı hazır.

---

## ⚠️ Eksikler ve Geliştirme Önerileri (Audit)

Uzman gözüyle sistemdeki eksikler:

1.  **Stok Takibi:** Şu an stok "Var/Yok" şeklinde. Adet bazlı stok (örneğin "10 tane kaldı") yok.
2.  **Geçmiş Siparişler Raporu:** "Bugün ne kadar kazandım?", "Hangi ürün çok sattı?" rapor ekranı yok.
3.  **Garson Çağırma:** Menüde "Garson Çağır" butonu yok (Sadece sipariş var).
4.  **Kullanıcı Analitiği:** Menüye kaç kişi girdi, kaçı sipariş verdi gibi istatistikler yok.
5.  **Bildirimler:** Sipariş geldiğinde ses çalması veya bildirim göndermesi (Web Push) özelliği yok.
6.  **PWA Desteği:** Garsonlar için "Uygulamayı Yükle" özelliği eklenebilir.

**Genel Görüş:**
Şu anki haliyle **Satılabilir (MVP+)** seviyesindedir. Temel döngü (Menü -> Sipariş -> Yönetim) kusursuz çalışmaktadır.
