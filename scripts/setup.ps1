# AEM3 Proje Kurulum Script'i (Windows PowerShell)
# Bu script projeyi otomatik olarak kurar

Write-Host "🚀 AEM3 Proje Kurulumu Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# Node.js kontrolü
Write-Host "📦 Node.js kontrol ediliyor..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajor -lt 18) {
        Write-Host "❌ Node.js v18 veya üzeri gereklidir!" -ForegroundColor Red
        Write-Host "Mevcut sürüm: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion bulundu" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js bulunamadı!" -ForegroundColor Red
    Write-Host "Lütfen Node.js'i kurun: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# npm kontrolü
Write-Host "📦 npm kontrol ediliyor..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion bulundu" -ForegroundColor Green
} catch {
    Write-Host "❌ npm bulunamadı!" -ForegroundColor Red
    exit 1
}

# Bağımlılıkları yükle
Write-Host ""
Write-Host "📥 Bağımlılıklar yükleniyor..." -ForegroundColor Yellow
npm install

# .env.local kontrolü
Write-Host ""
Write-Host "🔐 Environment variables kontrol ediliyor..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local dosyası bulunamadı, oluşturuluyor..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env.local
        Write-Host "✅ .env.local dosyası .env.example'dan oluşturuldu" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example bulunamadı, manuel olarak oluşturmanız gerekecek" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env.local dosyası mevcut" -ForegroundColor Green
}

# Prisma tiplerini oluştur
Write-Host ""
Write-Host "🔧 Prisma tipleri oluşturuluyor..." -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    try {
        npm run db:generate
    } catch {
        Write-Host "⚠️  Prisma generate atlandı (schema yok)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Prisma schema bulunamadı, atlanıyor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Kurulum tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Development server'ı başlatmak için:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Daha fazla bilgi için SETUP.md dosyasına bakın" -ForegroundColor Cyan

