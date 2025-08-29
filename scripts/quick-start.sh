#!/bin/bash

# Hızlı başlatma scripti - CSS sorununu test etmek için

echo "🚀 Hızlı Docker başlatma..."

# Mevcut container'ları durdur
docker-compose down

# Sadece gerekli build (cache kullan)
docker-compose build

# Başlat
docker-compose up -d

echo "✅ Uygulama başlatıldı: http://localhost:3000"
echo "📋 Log'ları görmek için: docker-compose logs -f"