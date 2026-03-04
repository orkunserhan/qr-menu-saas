---
description: How to deploy the QR Menu SaaS application to the AWS production server
---
Bu workflow, projede yapılan değişiklikleri git'e gönderdikten sonra AWS sunucusundaki Docker konteynerini güncelleyerek yayına almayı sağlar.

1. Projedeki değişiklikleri git'e ekleyin ve commit yapın.
// turbo
2. Değişiklikleri GitHub'a (remote) gönderin (`git push`).
3. AWS sunucusuna bağlanarak en güncel kodları git'ten çekin:
```bash
ssh -o StrictHostKeyChecking=no -i ~/Documents/aws-orcuns/qr_server.pem ec2-user@ec2-63-180-181-116.eu-central-1.compute.amazonaws.com "cd qr-menu-saas && git pull origin main"
```
4. AWS sunucusundaki `qr-menu-app` isimli Docker uygulamasını yeniden derleyip başlatın:
```bash
ssh -o StrictHostKeyChecking=no -i ~/Documents/aws-orcuns/qr_server.pem ec2-user@ec2-63-180-181-116.eu-central-1.compute.amazonaws.com "cd qr-menu-saas && source .env.local && sudo docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=\$NEXT_PUBLIC_SUPABASE_URL --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=\$NEXT_PUBLIC_SUPABASE_ANON_KEY -t qr-menu-saas:latest . && sudo docker stop qr-menu-app || true && sudo docker rm qr-menu-app || true && sudo docker run -d --name qr-menu-app --restart always -p 3000:3000 --env-file .env.local -e NODE_ENV=production qr-menu-saas:latest"
```
