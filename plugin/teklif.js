/*******************************************************
 ***   teklif.js (Content Script)                     ***
 ***   İhale sayfasının DOM'una erişir ve popup.js'den  ***
 ***   gelen mesajlarla başlat/durdur yapılır.         ***
 *******************************************************/

 let auctionIntervalId = null;  // monitorBidTiming() setInterval’ını burada saklayacağız
 let auctionRunning = false;    // Eklenti başlatıldığında true, durdurulduğunda false
 
 let increaseAmount = 100000; // Örneğin 100 birim artırılacak
 
 // Sabit maksimum teklif tutarı
 let fixedMaxBid = 50000000; // Kullanıcının belirlediği maksimum teklif (örnek)
 let lastMs
 // Sabit saat formatı HH:mm
 let targetHour = 17;  // Örnek
 let targetMinute = 34; // Örnek

 // Popup.js' den gelen mesajları dinle
 chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.type === "START_AUCTION") {
     console.log("Content script: START_AUCTION mesajı alındı.");

     

     // Değerleri al, fonksiyonu başlat
     startAuctionProcess(
       message.maxBid,
       message.bidIncrement,
       message.endTime,
       message.lastMs
     );
   } else if (message.type === "STOP_AUCTION") {
     console.log("Content script: STOP_AUCTION mesajı alındı.");
     stopAuctionProcess();
     clickInitialButton();
   }
 });
 
 /**
  * Eklentinin "başlat" mantığı
  */
 function startAuctionProcess(maxBid, bidIncrement, endTime, lastMs) {
   if (auctionRunning) {
     console.log("Auction zaten çalışıyor!");
     return;
   }
   auctionRunning = true;
   fixedMaxBid = maxBid;
   increaseAmount = bidIncrement;
 
   console.log("Auction process is now running...");
   console.log(`Settings: Max Bid = ${maxBid}, Increment = ${bidIncrement}, End Time = ${endTime}, Last MS = ${lastMs}`);
   console.log("Auction başlatıldı:", {
    maxBid: fixedMaxBid,
    bidIncrement: increaseAmount,
    endTime,
    lastMs,
    });
   // İsterseniz popup'tan gelen değerleri global bir değişkende saklayabilirsiniz
   // ama burada da parametre olarak kullanabiliriz.
 
   // Sayfa yüklendiğinde ilk butona tıklama
   clickInitialButton();
 
   // Teklif izleme (döngü başlat)
   // Daha önce en sonda "monitorBidTiming()" çağırıyordunuz.
   // Onu burada devreye sokuyoruz:
   monitorBidTiming(lastMs, endTime);
 }
 
 /**
  * Eklentinin "durdur" mantığı
  */
 function stopAuctionProcess() {
   if (!auctionRunning) {
     console.log("Auction zaten durdurulmuş!");
     return;
   }
   auctionRunning = false;
 
   // Interval varsa temizle
   if (auctionIntervalId) {
     clearInterval(auctionIntervalId);
     auctionIntervalId = null;
   }
   console.log("Auction process is now stopped.");
 }
 
 /****************************************************
  ***  Aşağıdaki tüm fonksiyonlar sizin konsoldaki  ***
  ***  kodlarınızın birebir uyarlanmış halidir.     ***
  ****************************************************/
 
 // İlk açılışta belirli bir butona tıklama işlevi
 function clickInitialButton() {
   try {
     const initialButtonElement = document.evaluate(
       '//*[@id="muhammenBedelUstuTeklif"]',
       document,
       null,
       XPathResult.FIRST_ORDERED_NODE_TYPE,
       null
     ).singleNodeValue;
     if (initialButtonElement) {
       initialButtonElement.click();
       console.log("İlk tıklama butonuna başarıyla tıklandı.");
     } else {
       console.log("İlk tıklama butonu bulunamadı.");
     }
   } catch (error) {
     console.error("İlk tıklama sırasında bir hata oluştu:", error);
   }
 }
 
 // Sabit artırma miktarı
 
 
 // Xpath'ler
 const lastBidXpath = '//*[@id="ihaleSonTeklif"]';
 const bidInputXpath = '//*[@id="teklifMiktari"]';
 const bidButtonXpath = '//*[@id="manuel_teklif_div"]/div/div[1]/div/span[2]/a';
 const confirmButtonXpath = "/html/body/div[18]/div/div/div[2]/button[2]"; // Onay butonunun XPath'i
 const userMaxBidXpath = '//*[@id="kullaniciMaxTeklifDiv"]'; // Kullanıcı maksimum teklif XPath'i
 
 // Geri sayım öğe ID'leri
 const minuteId = "minute";
 const secondId = "second";
 
 let isProcessingBid = false;    // Teklif işlemi devam ediyor mu?
 let lastProcessedBid = null;    // En son işlenen teklif
 let isCooldown = false;         // Bekleme süresi aktif mi?
 
 // Kullanıcının verdiği son teklifi alma işlevi
 function getUserLastBid() {
   try {
     const userMaxBidElement = document.evaluate(
       userMaxBidXpath,
       document,
       null,
       XPathResult.FIRST_ORDERED_NODE_TYPE,
       null
     ).singleNodeValue;
     if (userMaxBidElement) {
       let userLastBid = userMaxBidElement.textContent.trim();
       if (userLastBid.includes(",")) {
         // Virgülden sonrasını sil
         userLastBid = userLastBid.split(",")[0];
       }
       return parseFloat(userLastBid.replace(/[^\d]/g, ""));
     }
     return null;
   } catch (error) {
     console.error("Kullanıcının son teklifi alınırken hata oluştu:", error);
     return null;
   }
 }
 
 // Onay butonunu arayıp hemen tıklama işlevi
 function clickConfirmButtonImmediately() {
   isProcessingBid = true; // Teklif süreci başladı
 
   let isButtonFound = false; // Butonun bulunup bulunmadığını takip etmek için
   const timeoutDuration = 2000; // 2 saniyelik bekleme süresi
 
   // Arama döngüsü
   const confirmInterval = setInterval(() => {
     try {
       const confirmButtonElement = document.evaluate(
         confirmButtonXpath,
         document,
         null,
         XPathResult.FIRST_ORDERED_NODE_TYPE,
         null
       ).singleNodeValue;
 
       if (confirmButtonElement) {
         console.log("Onay butonu bulundu ve tıklanıyor...");
         isButtonFound = true;
         confirmButtonElement.click(); // Butona tıkla
         clearInterval(confirmInterval); // Arama döngüsünü durdur
         isProcessingBid = false; // Teklif süreci tamamlandı
       }
     } catch (error) {
       console.error("Onay butonunu arama sırasında bir hata oluştu:", error);
       clearInterval(confirmInterval); // Hata durumunda aramayı durdur
       isProcessingBid = false; // Süreci serbest bırak
     }
   }, 100);
 
   // 2 saniyelik zaman aşımı
   setTimeout(() => {
     if (!isButtonFound) {
       clearInterval(confirmInterval);
       isProcessingBid = false;
       console.log("2 saniye içinde onay butonu bulunamadı, işlem sonlandırılıyor...");
     }
   }, timeoutDuration);
 }
 
 // Teklif verme işlevi
 function submitBid(lastBid) {
   try {
     const userLastBid = getUserLastBid();
     if (userLastBid === null) {
       console.log("Kullanıcının maksimum teklifi alınamadı, teklif durduruldu.");
       return;
     }
 
     // Rakamların kesin eşitliğini sağlamak için temizleme
     const cleanedLastBid = parseFloat(lastBid.toString().replace(/[^\d]/g, ""));
     const cleanedUserLastBid = parseFloat(
       userLastBid.toString().replace(/[^\d]/g, "") + "00"
     );
 
     console.log("Temizlenmiş lastBid:", cleanedLastBid);
     console.log("Temizlenmiş userLastBid (00 eklendi):", cleanedUserLastBid);
 
     // Eğer son teklif kullanıcının maksimum teklifiyle aynıysa teklif verme
     if (cleanedLastBid === cleanedUserLastBid) {
       console.log(`Son teklif (${cleanedLastBid}) kullanıcının maksimum teklifiyle (${cleanedUserLastBid}) aynı. Durdur.`);
       lastProcessedBid = lastBid; 
       return;
     }
 
     if (cleanedLastBid > fixedMaxBid) {
       console.log(`Son teklif (${cleanedLastBid}) sabit maksimum teklif (${fixedMaxBid}) değerinden büyük durdur.`);
       return;
     }
 
     if (isCooldown) {
       console.log("Bekleme süresi aktif. Teklif gönderilmeyecek.");
       return;
     }
 
     if (lastBid === lastProcessedBid) {
       console.log("Bu teklif zaten işlendi, yeni teklif yapılmayacak.");
       return;
     }
 
     // Yeni teklif minimum artırımı
     const minimumNewBid = cleanedLastBid + 1000;
     let newBid = Math.max(minimumNewBid, cleanedLastBid + increaseAmount).toString();
     // Kuruşu atmak (son 2 haneyi silmek) için:
     newBid = newBid.slice(0, -2);
 
     // Yeni teklif, kullanıcı maksimum teklifi geçiyorsa durdur
     if (parseFloat(newBid) > fixedMaxBid) {
       console.log(`Yeni teklif (${newBid}) sabit maksimum teklifi (${fixedMaxBid}) aşıyor. Durdur.`);
       return;
     }
 
     console.log(`Yeni Teklif (kuruş silindi): ${newBid}`);
     console.log(`Son teklif: ${cleanedLastBid}, Verilecek yeni teklif: ${newBid}`);
 
     const bidInputElement = document.evaluate(
       bidInputXpath,
       document,
       null,
       XPathResult.FIRST_ORDERED_NODE_TYPE,
       null
     ).singleNodeValue;
     if (!bidInputElement) throw new Error("Teklif miktarı alanı bulunamadı.");
     bidInputElement.value = newBid;
 
     const bidButtonElement = document.evaluate(
       bidButtonXpath,
       document,
       null,
       XPathResult.FIRST_ORDERED_NODE_TYPE,
       null
     ).singleNodeValue;
     if (!bidButtonElement) throw new Error("Teklif butonu bulunamadı.");
 
     // Teklif ver
     bidButtonElement.click();
     console.log(`Teklif verildiği an: ${new Date().toLocaleTimeString()}`);
     lastProcessedBid = lastBid; 
 
     // Onay butonuna bak
     clickConfirmButtonImmediately();
 
     // Bekleme süresi
     isCooldown = true;
     setTimeout(() => {
       isCooldown = false;
       console.log("Bekleme süresi sona erdi, yeni tekliflere hazır.");
     }, 2000);
 
   } catch (error) {
     console.error("Teklif gönderme sırasında bir hata oluştu:", error);
   }
 }
 
 /**
  * Asıl döngü: Geri sayım ve teklif kontrolü
  * Bunu setInterval ile çalıştırıyoruz.
  */
 function monitorBidTiming(lastMs, endTime) {
   // Zaten durdurulmuşsa tekrar başlatma
   if (auctionIntervalId) {
     clearInterval(auctionIntervalId);
     auctionIntervalId = null;
   }
 
   auctionIntervalId = setInterval(() => {
     try {
       // Eğer auctionRunning false ise hiçbir şey yapma
       if (!auctionRunning) {
         console.log("Auction pasif, interval döngüsü çalışıyor ama teklif yapmıyor...");
         return;
       }
 
       const now = new Date();
       console.log(`Sistem çalışıyor. Şu anki saat: ${now.toLocaleTimeString()}`);
 
       // Hedef zaman
       

       const timestamp = endTime; 

      // 2) Bir Date nesnesi oluşturalım
      const dateObj = new Date(timestamp);

      // 3) Buradan saat ve dakikayı çekelim
      const targetHour = dateObj.getHours();
      const targetMinute = dateObj.getMinutes();

      const targetTime = new Date();
      targetTime.setHours(targetHour, targetMinute, 0, 0);
       
       const threeMinutesBefore = new Date(targetTime);
       threeMinutesBefore.setMinutes(targetTime.getMinutes() - 3);
 
       const minuteElement = document.getElementById(minuteId);
       const secondElement = document.getElementById(secondId);
       const millisecondsLeft = parseInt(new Date().getMilliseconds() / 10); // 0-99
 
       if (!minuteElement || !secondElement) {
         console.warn("Geri sayım öğeleri (minute, second) bulunamadı.");
         return;
       }
 
       const minutesLeft = parseInt(minuteElement.textContent);
       const secondsLeft = parseInt(secondElement.textContent);
       
 
       const lastBidElement = document.evaluate(
         lastBidXpath,
         document,
         null,
         XPathResult.FIRST_ORDERED_NODE_TYPE,
         null
       ).singleNodeValue;
       
 
        if (lastBidElement) {
         const lastBid = parseFloat(lastBidElement.textContent.replace(/[^\d]/g, ""));
         console.log(`Son teklif: ${lastBid}, Kullanıcının maksimum teklifi: ${fixedMaxBid}`);
         // Yeni teklif hesaplama
         const userLastBid = getUserLastBid(); // Tanım burada yapılmalı
         const minimumNewBid = lastBid + 1000;
         let newBid = Math.max(
             minimumNewBid,
             lastBid + increaseAmount
         ).toString();
         newBid = newBid.slice(0, -2); // En sağdaki iki rakamı kaldır

         console.log(
             `Son teklif: ${lastBid}, Potansiyel verilecek teklif: ${newBid}`
         );
        // Teklifin verilmesi gerekip gerekmediğini belirle
         const shouldSubmitBid =
         lastBid !== null &&
         userLastBid !== null &&
         lastBid / 100 !== userLastBid && // Son Teklif ile Kullanıcının Maksimum Teklifini aynı birime getirerek karşılaştır
         lastBid < fixedMaxBid &&
         newBid !== null &&
         parseFloat(newBid) <= fixedMaxBid;



     // Tüm değişkenlerin loglanması
     // Tüm değişkenlerin loglanması
console.log(`Sistem Durumu:
  Şu Anki Saat: ${now.toLocaleTimeString()}
  Son Teklif: ${lastBid || "Belirlenemedi"}
  Kullanıcının Maksimum Teklifi: ${userLastBid || "Belirlenemedi"}
  Yeni Teklif: ${newBid || "Belirlenemedi"}
  Ana Maksimum Teklif: ${fixedMaxBid || "Belirlenemedi"}
  Teklif Artırma Fiyatı: ${increaseAmount || "Belirlenemedi"}
  Kalan Dakika: ${minutesLeft !== null ? minutesLeft : "Belirlenemedi"}
  Kalan Saniye: ${secondsLeft !== null ? secondsLeft : "Belirlenemedi"}
  Ayarlanan Ms: ${lastMs !== null ? lastMs : "Belirlenemedi"}
  Bekleme Durumu (Cooldown): ${isCooldown}
  Teklif İşlem Durumu: ${isProcessingBid}
  Son İşlenen Teklif: ${lastProcessedBid || "Yok"}
  Teklif Verilecek mi?: ${shouldSubmitBid ? "Evet" : "Hayır"}
  `);
  
        

 
         const randomSecond = Math.floor(Math.random() * 9) + 1;
        console.log(randomSecond);
         if (now >= threeMinutesBefore && now < targetTime) {
           console.log("Son 3 dakikadayız, milisaniye hassasiyetiyle teklif verilecek.");
           if (
             minutesLeft === 0 &&
             secondsLeft === 1 &&
             millisecondsLeft <= lastMs &&
             !isProcessingBid
           ) {
             submitBid(lastBid);
           }
         } else if (
           minutesLeft === 0 &&
           secondsLeft < randomSecond &&
           lastBid < fixedMaxBid
         ) {
           console.log("Son 10 saniyenin altına düştü. Teklif veriliyor.");
           submitBid(lastBid);
 
           const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
           (async () => {
             // 30 saniye bekleyelim örnek
             await wait(30000);
             console.log("Bekleme süresi tamamlandı. Sistem devam ediyor.");
           })();
         }
        }
     } catch (error) {
       console.error("Teklif zamanlaması kontrolü sırasında bir hata oluştu:", error);
     }
   }, 250);
 }