# AWS (veya herhangi bir VPS) Üzerine Kurulum Rehberi

Bu rehber, projenin bir Ubuntu sunucusuna (AWS EC2, DigitalOcean vb.) nasıl kurulacağını anlatır.

## Ön Koşullar

1.  **Bir Sunucu (VPS)**: Ubuntu 20.04 veya 22.04 LTS (AWS EC2 t2.small veya t3.small önerilir).
2.  **SSH Erişimi**: Sunucuya bağlanabilmeniz gerekir.
3.  **Domain (Opsiyonel)**: `menunuz.com` gibi bir alan adı (henüz yoksa IP adresi ile de çalışır).

## Adım 1: Sunucuya Bağlanın ve Güncelleyin

Terminal veya Putty ile sunucunuza bağlanın:
```bash
ssh -i "key.pem" ubuntu@sunucu-ip-adresi
```

Sunucuyu güncelleyin:
```bash
sudo apt update && sudo apt upgrade -y
```

## Adım 2: Docker Kurulumu

Projenin çalışması için Docker gereklidir. Aşağıdaki komutla kolayca kurabilirsiniz:

```bash
# Docker kurulum scripti
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker'ı kullanıcı yetkisine ekle (böylece her komutta sudo yazmazsınız)
sudo usermod -aG docker $USER
newgrp docker
```

## Adım 3: Projeyi Sunucuya Kopyalayın

Bilgisayarınızdaki proje dosyalarını sunucuya atmanız gerekiyor.

**Yöntem A: Git Kullanarak (Önerilen)**
Projenizi GitHub/GitLab'a yüklediyseniz:
```bash
git clone https://github.com/kullaniciadi/proje-adi.git qr-menu
cd qr-menu
```

**Yöntem B: SCP ile Dosya Göndererek**
Bilgisayarınızdan (Local):
```bash
# Sadece gerekli dosyaları ziple
tar -czvf app.tar.gz app components public styles utils supabase .env.local next.config.ts package.json package-lock.json Dockerfile docker-compose.yml tsconfig.json postcss.config.mjs tailwind.config.ts
# Sunucuya gönder
scp -i "key.pem" app.tar.gz ubuntu@sunucu-ip-adresi:~/
```
Sunucuda (Remote):
```bash
mkdir qr-menu
mv app.tar.gz qr-menu/
cd qr-menu
tar -xzvf app.tar.gz
```

## Adım 4: Ortam Değişkenlerini (Environment Variables) Ayarlayın

Sunucuda `.env.local` dosyasının dolu olduğundan emin olun. Eğer yoksa oluşturun:

```bash
nano .env.local
```
İçine Supabase bilgilerinizi yapıştırın:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://sizin-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sizin-anon-key
```
(Kaydetmek için `CTRL+O`, Çıkmak için `CTRL+X`)

## Adım 5: Uygulamayı Başlatın

Artık her şey hazır. Tek komutla uygulamayı ayağa kaldırın:

```bash
docker compose up -d --build
```

Bu işlem birkaç dakika sürebilir (imaj oluşturulurken).
Bittiğinde projeniz `http://sunucu-ip-adresi:3000` adresinde yayında olacaktır!

## Adım 6: Nginx ve SSL (HTTPS) Kurulumu (Opsiyonel ama Önerilir)

Uygulamanın `http://ip:3000` yerine `https://sizin-domaininiz.com` adresinde çalışması için Nginx reverse proxy kurmalısınız.

1. Nginx kurun:
```bash
sudo apt install nginx -y
```

2. Konfigürasyon oluşturun:
```bash
sudo nano /etc/nginx/sites-available/qr-menu
```

3. Şu içeriği yapıştırın (domain kısmını değiştirin):
```nginx
server {
    listen 80;
    server_name m.sizin-restoraniniz.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Aktifleştirin ve Nginx'i yeniden başlatın:
```bash
sudo ln -s /etc/nginx/sites-available/qr-menu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Ücretsiz SSL (Certbot) kurun:
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d m.sizin-restoraniniz.com
```

Tebrikler! Uygulamanız AWS üzerinde, SSL korumalı olarak çalışıyor.
