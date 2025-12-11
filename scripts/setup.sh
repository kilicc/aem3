#!/bin/bash

# AEM3 Proje Kurulum Script'i (macOS/Linux)
# Bu script projeyi otomatik olarak kurar

set -e  # Hata durumunda dur

echo "🚀 AEM3 Proje Kurulumu Başlatılıyor..."
echo ""

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Node.js kontrolü
echo "📦 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı!${NC}"
    echo "Lütfen Node.js'i kurun: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js v18 veya üzeri gereklidir!${NC}"
    echo "Mevcut sürüm: $(node --version)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) bulundu${NC}"

# npm kontrolü
echo "📦 npm kontrol ediliyor..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) bulundu${NC}"

# Bağımlılıkları yükle
echo ""
echo "📥 Bağımlılıklar yükleniyor..."
npm install

# .env.local kontrolü
echo ""
echo "🔐 Environment variables kontrol ediliyor..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local dosyası bulunamadı, oluşturuluyor...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ .env.local dosyası .env.example'dan oluşturuldu${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example bulunamadı, manuel olarak oluşturmanız gerekecek${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local dosyası mevcut${NC}"
fi

# Prisma tiplerini oluştur
echo ""
echo "🔧 Prisma tipleri oluşturuluyor..."
if [ -f "prisma/schema.prisma" ]; then
    npm run db:generate || echo -e "${YELLOW}⚠️  Prisma generate atlandı (schema yok)${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma schema bulunamadı, atlanıyor${NC}"
fi

echo ""
echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo "🚀 Development server'ı başlatmak için:"
echo "   npm run dev"
echo ""
echo "📖 Daha fazla bilgi için SETUP.md dosyasına bakın"

