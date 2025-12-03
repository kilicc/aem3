const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Ortam değişkenleri bulunamadı. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDemoData() {
  console.log("\n🔧 Demo veriler oluşturuluyor...\n");

  try {
    // 1. Birimler
    console.log("1. Birimler kontrol ediliyor...");
    const { data: existingUnits } = await adminClient
      .from("units")
      .select("id, name");

    let units = {};
    if (!existingUnits || existingUnits.length === 0) {
      const unitsData = [
        { name: "Adet", symbol: "adet" },
        { name: "Kilogram", symbol: "kg" },
        { name: "Metre", symbol: "m" },
        { name: "Litre", symbol: "L" },
        { name: "Metrekare", symbol: "m²" },
      ];

      const { data: newUnits, error: unitsError } = await adminClient
        .from("units")
        .insert(unitsData)
        .select();

      if (unitsError) {
        console.error("❌ Birimler oluşturulurken hata:", unitsError.message);
        return;
      }

      newUnits.forEach((u) => {
        units[u.symbol] = u.id;
      });
      console.log("✅ Birimler oluşturuldu");
    } else {
      existingUnits.forEach((u) => {
        units[u.name.toLowerCase()] = u.id;
      });
      console.log("✅ Birimler zaten mevcut");
    }

    // 2. Kategoriler
    console.log("\n2. Kategoriler kontrol ediliyor...");
    const { data: existingCategories } = await adminClient
      .from("product_categories")
      .select("id, name");

    let categories = {};
    if (!existingCategories || existingCategories.length === 0) {
      const categoriesData = [
        { name: "Elektrik Malzemeleri", description: "Elektrik işleri için gerekli malzemeler" },
        { name: "Yapı Malzemeleri", description: "İnşaat ve yapı işleri malzemeleri" },
        { name: "Boyama Malzemeleri", description: "Boyama işleri için malzemeler" },
        { name: "Diğer", description: "Diğer kategoriler" },
      ];

      const { data: newCategories, error: categoriesError } = await adminClient
        .from("product_categories")
        .insert(categoriesData)
        .select();

      if (categoriesError) {
        console.error("❌ Kategoriler oluşturulurken hata:", categoriesError.message);
        return;
      }

      newCategories.forEach((c) => {
        categories[c.name] = c.id;
      });
      console.log("✅ Kategoriler oluşturuldu");
    } else {
      existingCategories.forEach((c) => {
        categories[c.name] = c.id;
      });
      console.log("✅ Kategoriler zaten mevcut");
    }

    // 3. Depolar
    console.log("\n3. Depolar kontrol ediliyor...");
    const { data: existingWarehouses } = await adminClient
      .from("warehouses")
      .select("id, name");

    let warehouses = {};
    if (!existingWarehouses || existingWarehouses.length === 0) {
      const warehousesData = [
        { name: "Ana Depo", address: "İstanbul, Merkez", phone: "0212 123 45 67", is_active: true },
        { name: "Yedek Depo", address: "Ankara, Merkez", phone: "0312 234 56 78", is_active: true },
        { name: "Şube Deposu", address: "İzmir, Merkez", phone: "0232 345 67 89", is_active: true },
      ];

      const { data: newWarehouses, error: warehousesError } = await adminClient
        .from("warehouses")
        .insert(warehousesData)
        .select();

      if (warehousesError) {
        console.error("❌ Depolar oluşturulurken hata:", warehousesError.message);
        return;
      }

      newWarehouses.forEach((w) => {
        warehouses[w.name] = w.id;
      });
      console.log("✅ Depolar oluşturuldu");
    } else {
      existingWarehouses.forEach((w) => {
        warehouses[w.name] = w.id;
      });
      console.log("✅ Depolar zaten mevcut");
    }

    // 4. Ürünler
    console.log("\n4. Ürünler kontrol ediliyor...");
    const { data: existingProducts } = await adminClient
      .from("products")
      .select("id, name");

    let products = {};
    if (!existingProducts || existingProducts.length === 0) {
      const unitId = Object.values(units)[0]; // İlk birimi kullan
      const categoryId = Object.values(categories)[0]; // İlk kategoriyi kullan

      const productsData = [
        { name: "Elektrik Kablosu", category_id: categoryId, unit_id: unitId, unit_price: 25.50, barcode: "1234567890" },
        { name: "Ampul", category_id: categoryId, unit_id: unitId, unit_price: 15.00, barcode: "1234567891" },
        { name: "Anahtar", category_id: categoryId, unit_id: unitId, unit_price: 8.75, barcode: "1234567892" },
        { name: "Priz", category_id: categoryId, unit_id: unitId, unit_price: 12.00, barcode: "1234567893" },
        { name: "Sigorta", category_id: categoryId, unit_id: unitId, unit_price: 5.50, barcode: "1234567894" },
      ];

      const { data: newProducts, error: productsError } = await adminClient
        .from("products")
        .insert(productsData)
        .select();

      if (productsError) {
        console.error("❌ Ürünler oluşturulurken hata:", productsError.message);
        return;
      }

      newProducts.forEach((p) => {
        products[p.name] = p.id;
      });
      console.log("✅ Ürünler oluşturuldu");
    } else {
      existingProducts.forEach((p) => {
        products[p.name] = p.id;
      });
      console.log("✅ Ürünler zaten mevcut");
    }

    // 5. Araç-Gereçler
    console.log("\n5. Araç-Gereçler kontrol ediliyor...");
    const { data: existingTools } = await adminClient
      .from("tools")
      .select("id, name");

    let tools = {};
    if (!existingTools || existingTools.length === 0) {
      const toolsData = [
        { name: "Yıldız Tornavida", description: "Çeşitli boyutlarda yıldız tornavida seti", serial_number: "TOOL-001" },
        { name: "Düz Tornavida", description: "Çeşitli boyutlarda düz tornavida seti", serial_number: "TOOL-002" },
        { name: "Pense", description: "Çeşitli boyutlarda pense seti", serial_number: "TOOL-003" },
        { name: "Ampermetre", description: "Dijital ampermetre", serial_number: "TOOL-004" },
        { name: "Voltmetre", description: "Dijital voltmetre", serial_number: "TOOL-005" },
      ];

      const { data: newTools, error: toolsError } = await adminClient
        .from("tools")
        .insert(toolsData)
        .select();

      if (toolsError) {
        console.error("❌ Araç-Gereçler oluşturulurken hata:", toolsError.message);
        return;
      }

      newTools.forEach((t) => {
        tools[t.name] = t.id;
      });
      console.log("✅ Araç-Gereçler oluşturuldu");
    } else {
      existingTools.forEach((t) => {
        tools[t.name] = t.id;
      });
      console.log("✅ Araç-Gereçler zaten mevcut");
    }

    // 6. Müşteriler
    console.log("\n6. Müşteriler kontrol ediliyor...");
    
    // Mevcut müşterileri kontrol et, yoksa ekle
    let customers = {};
    
    // Detaylı adres bilgileri ile demo müşteriler
    const customersData = [
      { 
        name: "Ahmet Yılmaz", 
        email: "ahmet@example.com", 
        phone: "0532 111 22 33", 
        address: "Bağdat Caddesi No:123 Daire:5",
        city: "İstanbul",
        district: "Kadıköy",
        postal_code: "34710"
      },
      { 
        name: "Ayşe Demir", 
        email: "ayse@example.com", 
        phone: "0532 222 33 44", 
        address: "Kızılay Mahallesi Atatürk Bulvarı No:456",
        city: "Ankara",
        district: "Çankaya",
        postal_code: "06100"
      },
      { 
        name: "Mehmet Kaya", 
        email: "mehmet@example.com", 
        phone: "0532 333 44 55", 
        address: "Konak Meydanı Alsancak Caddesi No:789",
        city: "İzmir",
        district: "Konak",
        postal_code: "35250"
      },
      { 
        name: "Fatma Şahin", 
        email: "fatma@example.com", 
        phone: "0532 444 55 66", 
        address: "Fomara Bulvarı No:321 Nilüfer",
        city: "Bursa",
        district: "Nilüfer",
        postal_code: "16110"
      },
      { 
        name: "Ali Öztürk", 
        email: "ali@example.com", 
        phone: "0532 555 66 77", 
        address: "Atatürk Caddesi No:654 Konyaaltı",
        city: "Antalya",
        district: "Muratpaşa",
        postal_code: "07050"
      },
      { 
        name: "Zeynep Çelik", 
        email: "zeynep@example.com", 
        phone: "0532 666 77 88", 
        address: "Göztepe Mahallesi Eski Topağacı Yolu No:12",
        city: "İstanbul",
        district: "Beşiktaş",
        postal_code: "34394"
      },
      { 
        name: "Mustafa Arslan", 
        email: "mustafa@example.com", 
        phone: "0532 777 88 99", 
        address: "Kızılay Sokak No:45 Eryaman",
        city: "Ankara",
        district: "Etimesgut",
        postal_code: "06796"
      },
      { 
        name: "Elif Yıldız", 
        email: "elif@example.com", 
        phone: "0532 888 99 00", 
        address: "Alsancak Mahallesi Şehit Fethi Bey Caddesi No:78",
        city: "İzmir",
        district: "Alsancak",
        postal_code: "35220"
      },
    ];
    
    // Mevcut müşterileri kontrol et
    const { data: existingCustomers } = await adminClient
      .from("customers")
      .select("id, name, email");
    
    if (!existingCustomers || existingCustomers.length === 0) {

      const { data: newCustomers, error: customersError } = await adminClient
        .from("customers")
        .insert(customersData)
        .select();

      if (customersError) {
        console.error("❌ Müşteriler oluşturulurken hata:", customersError.message);
        return;
      }

      newCustomers.forEach((c) => {
        customers[c.name] = c.id;
      });
      console.log(`✅ ${newCustomers.length} müşteri oluşturuldu`);
    } else {
      // Mevcut müşterileri kaydet
      existingCustomers.forEach((c) => {
        customers[c.name] = c.id;
      });
      
      // Yeni müşterileri ekle (email'e göre kontrol et)
      const existingEmails = existingCustomers.map(c => c.email).filter(Boolean);
      const newCustomersToAdd = customersData.filter(c => !existingEmails.includes(c.email));
      
      if (newCustomersToAdd.length > 0) {
        const { data: addedCustomers, error: addError } = await adminClient
          .from("customers")
          .insert(newCustomersToAdd)
          .select();
        
        if (addError) {
          console.error("❌ Yeni müşteriler eklenirken hata:", addError.message);
        } else if (addedCustomers) {
          addedCustomers.forEach((c) => {
            customers[c.name] = c.id;
          });
          console.log(`✅ ${addedCustomers.length} yeni müşteri eklendi`);
        }
      }
      
      console.log(`✅ Toplam ${Object.keys(customers).length} müşteri mevcut`);
    }

    // 7. Hizmetler
    console.log("\n7. Hizmetler kontrol ediliyor...");
    const { data: existingServices } = await adminClient
      .from("services")
      .select("id, name");

    let services = {};
    
    // Teknik servis form şablonları
    const servicesData = [
      {
        name: "Elektrik Tamiri",
        price: 150.00,
        description: "Genel elektrik arıza tamiri",
        service_form_template: {
          fields: [
            { type: "text", label: "Cihaz Tipi", name: "device_type", required: true, placeholder: "Örn: Trafo, Pano, UPS" },
            { type: "text", label: "Cihaz Markası", name: "device_brand", required: false },
            { type: "text", label: "Cihaz Modeli", name: "device_model", required: false },
            { type: "text", label: "Seri No", name: "serial_number", required: false },
            { type: "textarea", label: "Arıza Tanımı", name: "fault_description", required: true, placeholder: "Müşteri tarafından bildirilen arıza açıklaması" },
            { type: "textarea", label: "Yapılan İşlemler", name: "work_done", required: true, placeholder: "Teknisyen tarafından yapılan işlemler" },
            { type: "text", label: "Kullanılan Malzemeler", name: "materials_used", required: false, placeholder: "Kullanılan parça ve malzemeler" },
            { type: "text", label: "Ölçülen Voltaj (V)", name: "voltage", required: false, placeholder: "230V" },
            { type: "text", label: "Ölçülen Akım (A)", name: "current", required: false, placeholder: "16A" },
            { type: "date", label: "Servis Tarihi", name: "service_date", required: true },
            { type: "text", label: "Servis Süresi (Saat)", name: "service_duration", required: false },
            { type: "textarea", label: "Teknisyen Notları", name: "technician_notes", required: false },
          ],
        },
      },
      {
        name: "Priz Montajı",
        price: 75.00,
        description: "Yeni priz montajı ve bağlantısı",
        service_form_template: {
          fields: [
            { type: "text", label: "Priz Tipi", name: "outlet_type", required: true, placeholder: "Schuko, Topraklı, USB'li" },
            { type: "text", label: "Priz Markası", name: "outlet_brand", required: false },
            { type: "text", label: "Kurulum Yeri", name: "installation_location", required: true, placeholder: "Örn: Mutfak, Salon, Yatak Odası" },
            { type: "text", label: "Güç Çıkışı (W)", name: "power_output", required: false, placeholder: "2500W" },
            { type: "text", label: "Kablo Kesiti (mm²)", name: "cable_cross_section", required: false, placeholder: "2.5mm²" },
            { type: "textarea", label: "Kurulum Detayları", name: "installation_details", required: true, placeholder: "Yapılan kurulum işlemleri" },
            { type: "text", label: "Kullanılan Malzemeler", name: "materials_used", required: false },
            { type: "text", label: "Topraklama Durumu", name: "grounding_status", required: true, placeholder: "Yapıldı/Yapılmadı" },
            { type: "date", label: "Kurulum Tarihi", name: "installation_date", required: true },
            { type: "textarea", label: "Teknisyen Notları", name: "technician_notes", required: false },
          ],
        },
      },
      {
        name: "Aydınlatma Kurulumu",
        price: 200.00,
        description: "Yeni aydınlatma sistemi kurulumu",
        service_form_template: {
          fields: [
            { type: "text", label: "Aydınlatma Tipi", name: "lighting_type", required: true, placeholder: "LED, Floresan, Spot" },
            { type: "text", label: "Marka", name: "brand", required: false },
            { type: "text", label: "Model", name: "model", required: false },
            { type: "text", label: "Güç (W)", name: "power_wattage", required: true, placeholder: "50W" },
            { type: "text", label: "Kurulum Yeri", name: "installation_location", required: true },
            { type: "text", label: "Adet", name: "quantity", required: true, placeholder: "1" },
            { type: "text", label: "Anahtar Tipi", name: "switch_type", required: false, placeholder: "Normal, Dimmer, Sensörlü" },
            { type: "textarea", label: "Kurulum Detayları", name: "installation_details", required: true },
            { type: "text", label: "Kullanılan Malzemeler", name: "materials_used", required: false },
            { type: "text", label: "Kablo Tipi", name: "cable_type", required: false, placeholder: "NYA, NYAF" },
            { type: "date", label: "Kurulum Tarihi", name: "installation_date", required: true },
            { type: "textarea", label: "Test Sonuçları", name: "test_results", required: false, placeholder: "Aydınlatma testi sonuçları" },
          ],
        },
      },
      {
        name: "Elektrik Panosu Bakımı",
        price: 300.00,
        description: "Elektrik panosu bakım ve kontrolü",
        service_form_template: {
          fields: [
            { type: "text", label: "Pano Tipi", name: "panel_type", required: true, placeholder: "Ana Pano, Dağıtım Panosu" },
            { type: "text", label: "Marka", name: "brand", required: false },
            { type: "text", label: "Kapasite (A)", name: "capacity", required: true, placeholder: "63A, 100A" },
            { type: "text", label: "Sigorta Sayısı", name: "fuse_count", required: false },
            { type: "textarea", label: "Görsel Kontrol", name: "visual_inspection", required: true, placeholder: "Pano içi görsel durum kontrolü" },
            { type: "text", label: "Ölçülen Faz Voltajları", name: "phase_voltages", required: false, placeholder: "L1: 230V, L2: 230V, L3: 230V" },
            { type: "text", label: "Topraklama Ölçümü (Ω)", name: "grounding_measurement", required: false },
            { type: "textarea", label: "Yapılan Bakım İşlemleri", name: "maintenance_work", required: true, placeholder: "Temizlik, sıkma, değişim vb." },
            { type: "text", label: "Değiştirilen Parçalar", name: "replaced_parts", required: false },
            { type: "date", label: "Bakım Tarihi", name: "maintenance_date", required: true },
            { type: "date", label: "Sonraki Bakım Tarihi", name: "next_maintenance_date", required: false },
            { type: "textarea", label: "Teknisyen Raporu", name: "technician_report", required: true },
          ],
        },
      },
      {
        name: "Kablo Değişimi",
        price: 120.00,
        description: "Eski kablo değişimi",
        service_form_template: {
          fields: [
            { type: "text", label: "Eski Kablo Tipi", name: "old_cable_type", required: true, placeholder: "NYA, NYAF, N2XH" },
            { type: "text", label: "Yeni Kablo Tipi", name: "new_cable_type", required: true },
            { type: "text", label: "Kablo Kesiti (mm²)", name: "cable_cross_section", required: true, placeholder: "1.5mm², 2.5mm², 4mm²" },
            { type: "text", label: "Kablo Uzunluğu (m)", name: "cable_length", required: true },
            { type: "text", label: "Değişim Yeri", name: "replacement_location", required: true, placeholder: "Mutfak, Salon, Yatak Odası" },
            { type: "textarea", label: "Değişim Nedenı", name: "replacement_reason", required: true, placeholder: "Eski kablo arızası, güçlendirme, yenileme" },
            { type: "textarea", label: "Yapılan İşlemler", name: "work_done", required: true },
            { type: "text", label: "Kullanılan Malzemeler", name: "materials_used", required: false },
            { type: "text", label: "Kanal Tipi", name: "conduit_type", required: false, placeholder: "Açık, Gizli, Kanal İçi" },
            { type: "date", label: "Değişim Tarihi", name: "replacement_date", required: true },
            { type: "textarea", label: "Test Sonuçları", name: "test_results", required: false, placeholder: "İzolasyon testi, süreklilik testi" },
            { type: "textarea", label: "Teknisyen Notları", name: "technician_notes", required: false },
          ],
        },
      },
    ];
    
    if (!existingServices || existingServices.length === 0) {

      const { data: newServices, error: servicesError } = await adminClient
        .from("services")
        .insert(servicesData)
        .select();

      if (servicesError) {
        console.error("❌ Hizmetler oluşturulurken hata:", servicesError.message);
        return;
      }

      newServices.forEach((s) => {
        services[s.name] = s.id;
      });
      console.log(`✅ ${newServices.length} hizmet oluşturuldu (teknik servis formlarıyla birlikte)`);
    } else {
      existingServices.forEach((s) => {
        services[s.name] = s.id;
      });
      
      // Mevcut hizmetleri güncelle veya yeni hizmetler ekle
      const existingServiceNames = existingServices.map(s => s.name);
      const newServicesToAdd = servicesData.filter(s => !existingServiceNames.includes(s.name));
      const servicesToUpdate = servicesData.filter(s => existingServiceNames.includes(s.name));
      
      // Yeni hizmetler ekle
      if (newServicesToAdd.length > 0) {
        const { data: addedServices, error: addError } = await adminClient
          .from("services")
          .insert(newServicesToAdd)
          .select();
        
        if (addError) {
          console.error("❌ Yeni hizmetler eklenirken hata:", addError.message);
        } else if (addedServices) {
          addedServices.forEach((s) => {
            services[s.name] = s.id;
          });
          console.log(`✅ ${addedServices.length} yeni hizmet eklendi`);
        }
      }
      
      // Mevcut hizmetleri form şablonlarıyla güncelle
      if (servicesToUpdate.length > 0) {
        for (const serviceData of servicesToUpdate) {
          const existingService = existingServices.find(s => s.name === serviceData.name);
          if (existingService) {
            const { error: updateError } = await adminClient
              .from("services")
              .update({
                service_form_template: serviceData.service_form_template,
                price: serviceData.price,
                description: serviceData.description,
              })
              .eq("id", existingService.id);
            
            if (updateError) {
              console.error(`❌ ${serviceData.name} güncellenirken hata:`, updateError.message);
            }
          }
        }
        console.log(`✅ ${servicesToUpdate.length} mevcut hizmet form şablonlarıyla güncellendi`);
      }
      
      console.log(`✅ Toplam ${Object.keys(services).length} hizmet mevcut`);
    }

    // 8. Stoklar
    console.log("\n8. Stoklar kontrol ediliyor...");
    const { data: existingStock } = await adminClient
      .from("warehouse_stock")
      .select("id");

    if (!existingStock || existingStock.length === 0) {
      const warehouseId = Object.values(warehouses)[0]; // İlk depoyu kullan
      const productId = Object.values(products)[0]; // İlk ürünü kullan
      const toolId = Object.values(tools)[0]; // İlk aracı kullan

      const stockData = [
        { warehouse_id: warehouseId, product_id: productId, tool_id: null, quantity: 100, min_stock_level: 20 },
        { warehouse_id: warehouseId, product_id: null, tool_id: toolId, quantity: 5, min_stock_level: 2 },
      ];

      const { error: stockError } = await adminClient
        .from("warehouse_stock")
        .insert(stockData);

      if (stockError) {
        console.error("❌ Stoklar oluşturulurken hata:", stockError.message);
        return;
      }

      console.log("✅ Stoklar oluşturuldu");
    } else {
      console.log("✅ Stoklar zaten mevcut");
    }

    // 9. Kullanıcılar (admin hariç)
    console.log("\n9. Kullanıcılar kontrol ediliyor...");
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const userEmails = existingUsers.users.map((u) => u.email);

    const demoUsers = [
      { email: "user1@aem3.com", password: "123456", full_name: "Kullanıcı 1", role: "user" },
      { email: "user2@aem3.com", password: "123456", full_name: "Kullanıcı 2", role: "user" },
    ];

    for (const userData of demoUsers) {
      if (!userEmails.includes(userData.email)) {
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`❌ Kullanıcı ${userData.email} oluşturulurken hata:`, authError.message);
          continue;
        }

        const { error: profileError } = await adminClient
          .from("profiles")
          .insert({
            id: authUser.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
          });

        if (profileError) {
          console.error(`❌ Profile ${userData.email} oluşturulurken hata:`, profileError.message);
          await adminClient.auth.admin.deleteUser(authUser.user.id);
          continue;
        }

        console.log(`✅ Kullanıcı oluşturuldu: ${userData.email}`);
      } else {
        console.log(`✅ Kullanıcı zaten mevcut: ${userData.email}`);
      }
    }

    console.log("\n✅ Demo veriler başarıyla oluşturuldu!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Oluşturulan Veriler:");
    console.log(`  - Birimler: ${Object.keys(units).length}`);
    console.log(`  - Kategoriler: ${Object.keys(categories).length}`);
    console.log(`  - Depolar: ${Object.keys(warehouses).length}`);
    console.log(`  - Ürünler: ${Object.keys(products).length}`);
    console.log(`  - Araç-Gereçler: ${Object.keys(tools).length}`);
    console.log(`  - Müşteriler: ${Object.keys(customers).length}`);
    console.log(`  - Hizmetler: ${Object.keys(services).length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Hata:", error.message);
  }
}

createDemoData();

