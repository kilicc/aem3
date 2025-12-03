bu program bir saha iş takip ve depo/envarter - malzeme takip programı olacak. programda şu özellikler olacak. 2 tip kullanıcı olacak. 1. Tip: Admin Admin Kullanıcısı * Depo takip modülünde; - birden fazla depo oluşturabilecek, - bu depolara Ürün/Malzeme girişi yapabilecek bu ürün/malzemelerin birimleri adet, metre, kilogram vs seçilebilecek, birim fiyat girilebilecek. - ayrıca deponun içinde ürün/malzeme nin dışında birde işlerde kullanılan araç/gereç eklenebilecek. Hatta bu araç gereçler iş emri oluşturulan çalışan kullanıcıları tarafından depodan alındığında hem admin tarafından hemde kullanıcı tarafından kullanıcının zimmetine işlenebilecek. ve geri teslim alanından teslim edildiği işaretlenene kadar o kullanıcının üstünde zimmetli kalacak. - admin kullanıcısı iş emri oluşturabilecek. Bu iş emri formunda müşteri modülünden müşteri seçilecek hizmet alanından hangi hizmetin verileceği seçilecek. Hangi hizmet seçildiyse o hizmetle alakalı aslında fiziki haldede bulunan teknik servis formu otomatik taslak olarak gelecek(bunları örnek olarak otomatik cursor webten bulup koysun). Müşteri bilgileri otomatik bu dijitalleştirdiğimiz teknik servis formu üzerine dolacak. örnek olarak bir trafo veya pano bakım formu olduğu düşün bu formun üzerindeki müşteri bilgileri otomatik dolacak, geri kalan tüm standart servis formundaki olan klasik şeyler olacak, kullanılan ürünler olarak depodan ürün/malzeme seçilebilecek (kaç adet gibi). yapılan işlemler gibi bir açıklama alanı olacak. o an öncesi veya sonrası fotoğraflarını çekip koyabileceği bir alan daha olacak. hatta birdaha gidilirse diye o müşterideki cihaz bilgileri müşterinin cihazları alanına kaydedilebilecek yada müşteriyle birlikte iş emri açarken seçilebilecek. formun en altında firmanın kaşesi otomatik olarak gelecek firma kullanıcısını yani çalışanı ve karşı taraf müşteri dijital olarak tablet/telefon ekranından imzalanabilecek. Çalışanlar(kullanıcılar) ana sayfadaki takvimden veya iş emirlerim menüsünden üzerlerine açılan iş emirlerini görebilecek. gidilen ve tamamlanan işler kaydet ve bitir/kapat gibi bir butona bastığında o iş emri tamamlanmış gözükecek. diğerleri beklemede gözükecek. Admin de bunları detaylı bir şekilde takip edebilecek. Fatura Modülüde olacak bu modülde; tamamlanan iş emirlerinde kullanılan malzeme/ürün bilgileriyle ve müşteri bilgileriyle otomatik bir fatura taslağı üzerinden müşteriye proforma fatura oluşturabilecek. fatura listesinden kesildi/kesilmedi durumlarını görebilecek bu servis ilerde bir e imza servisine bağlanacak. Ayrıca gidilecek iş emirlerinin konumları müşteri adresinden otomatik belirlenecek. Çalışanlar (kullanıcılar) o iş emrine gittiğinde beklemede durumundaki iş emrini işlemde olarak değiştirebilecek. işlemde olarak değiştirdiği an kullandığı cihazın o anki konumu alınacak (web projesi olacağı için tarayıcı izni olarak cihazın o anki tam konum izni alınacak) ve bu admine bir bildirim olarak gidecek. Tüm açılan iş emirleri çalışanlar(kullanıcılar) modülünde kayıt altına alınan cep telefonlarına belirlediğimiz sabit bir telefondan whatsapptan mesaj olarak ve çalışanlara mail olarak gidecek. durumu değişen her durum için aynı şekilde adminede mesaj gidecek. şimdilik bu kadar. iş emri oluştururken admin, birden fazla çalışan(kullanıcı) seçebilecek. 


Özellikler Listesi

### 1. Kimlik Doğrulama ve Yetkilendirme
- ✅ Email/Password ile giriş
- ✅ Rol bazlı yetkilendirme (Admin/User)
- ✅ Session yönetimi
- ✅ 2FA desteği 
- ✅ IP kısıtlamaları 
- ✅ Aktivite logları

### 2. Depo/Envanter Yönetimi
- ✅ Çoklu depo oluşturma
- ✅ Ürün/Malzeme ekleme
- ✅ Birim seçenekleri (adet, metre, kilogram, litre, metrekare, metrekup)
- ✅ Birim fiyat yönetimi
- ✅ Araç/Gereç yönetimi
- ✅ Zimmet sistemi (araç/gereç atama)
- ✅ Zimmet geri alma
- ✅ Stok uyarıları
- ✅ Depo transferi
- ✅ Excel import/export
- ✅ Barkod/QR kod 
- ✅ Ürün kategorileri 

### 3. Müşteri Yönetimi
- ✅ Müşteri kayıt ve yönetimi
- ✅ Müşteri cihaz(Trafo, ups, pano gibi) bilgileri
- ✅ Müşteri detay sayfası
- ✅ Müşteri iş emri geçmişi
- ✅ Müşteri cihaz geçmişi
- ✅ Müşteri grupları 
- ✅ Müşteri değerlendirmeleri 

### 4. İş Emri Yönetimi
- ✅ İş emri oluşturma
- ✅ Müşteri seçimi
- ✅ Hizmet seçimi
- ✅ Çoklu çalışan atama
- ✅ Öncelik seviyeleri (Düşük, Normal, Yüksek, Acil)
- ✅ Durum takibi (Beklemede, İşlemde, Tamamlandı, İptal)
- ✅ Teknik servis formu (JSONB template)
- ✅ Kullanılan malzeme seçimi
- ✅ Öncesi/sonrası fotoğraf yükleme
- ✅ Dijital imza (çalışan ve müşteri)
- ✅ Konum takibi (işlemde durumuna geçildiğinde)
- ✅ İş emri şablonları
- ✅ İş emri yorumları 
- ✅ İş emri ekleri
- ✅ İş emri geçmişi 
- ✅ Gelişmiş filtreleme 
- ✅ Takvim görünümü 

### 5. Fatura Yönetimi
- ✅ Otomatik fatura taslağı oluşturma
- ✅ Proforma fatura
- ✅ Fatura durumu takibi (Taslak, Gönderildi, Ödendi, İptal)
- ✅ KDV hesaplama (%20)
- ✅ Fatura PDF oluşturma
- ✅ Fatura önizleme
- ✅ Fatura yazdırma
- ✅ Fatura email gönderme 
- ✅ Ödeme takibi 
- ✅ Fatura şablonları 
- ✅ Toplu fatura oluşturma 
- ✅ Fatura geçmişi/arşiv 

### 6. Bildirim Sistemi
- ✅ WhatsApp bildirimleri
- ✅ Email bildirimleri
- ✅ Bildirim şablonları
- ✅ Bildirim logları
- ✅ Kullanıcı bildirim tercihleri
- ✅ Toplu bildirimler 
- ✅ Zamanlanmış bildirimler 

### 7. Raporlama ve Analitik
- ✅ Dashboard istatistikleri
- ✅ Grafikler (Recharts)
  - İş emri trendi (Line Chart)
  - İş emri durumları (Pie Chart)
  - Fatura durumları (Bar Chart)
  - Öncelik dağılımı (Bar Chart)
- ✅ Çalışan performans takibi
- ✅ Müşteri istatistikleri
- ✅ Gelir raporları
- ✅ Depo raporları 

### 8. Kullanıcı Deneyimi
- ✅ Dark mode (Açık/Koyu/Sistem)
- ✅ Çoklu dil desteği (Türkçe/İngilizce)
- ✅ Global arama
- ✅ Responsive tasarım
- ✅ Modern UI
- ✅ Animasyonlar
- ✅ Keyboard shortcuts 
- ✅ PWA desteği 

### 9. Admin Paneli
- ✅ Kullanıcı yönetimi
- ✅ Hizmet yönetimi
- ✅ Bildirim yönetimi
- ✅ Aktivite logları
- ✅ Güvenlik ayarları 
- ✅ Raporlar
- ✅ Excel import/export
- ✅ Depo transferi
- ✅ Barkod/QR kod yönetimi 
- ✅ Müşteri grupları 
- ✅ Fatura şablonları 

---