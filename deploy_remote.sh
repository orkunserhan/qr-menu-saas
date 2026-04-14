#!/bin/bash
set -e
cd ~/qr-menu-saas

# 1. Ortam degiskenlerini guvenle aliyoruz (Sadece dockerin ihtiyaci olanlari)
URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d '=' -f2-)
KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d '=' -f2-)

# 2. Docker build
echo ">> Building Docker Image..."
sudo docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$KEY" \
  -t qr-menu-saas:latest .

# 3. Eski uygulamayi durdurma ve silme
echo ">> Stopping and removing old container..."
sudo docker stop qr-menu-app || true
sudo docker rm -f qr-menu-app || true

# 4. Yeni uygulamayi baslatma (.env.local icindeki tum AWS sifreleriniz de burada iceri aktariliyor)
echo ">> Starting new container..."
sudo docker run -d \
  --name qr-menu-app \
  --restart always \
  -p 3000:3000 \
  --env-file .env.local \
  -e NODE_ENV=production \
  qr-menu-saas:latest

echo ">> Deployment completed successfully!"
